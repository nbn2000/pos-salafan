import { Injectable } from '@nestjs/common';
import { ProductBatch } from 'src/product/product-batch/entities/product-batch.entity';
import { Product } from 'src/product/product/entities/product.entity';
import { FindOptionsWhere } from 'typeorm';
import {
  dateOnlyBoundary,
  PagedResult,
  PaginationQuery,
  parseBool,
  SaleItem,
} from '../helper';
import { SaleBaseService } from './sale-base.service';

@Injectable()
export class SaleFindAllService extends SaleBaseService {
  async findAll(query: PaginationQuery): Promise<PagedResult<SaleItem>> {
    const page = Math.max(1, Number(query.page ?? 1));
    const take = Math.max(1, Math.min(100, Number(query.take ?? 6)));
    const search = (query.search ?? '').toString().trim();
    const searchField = (query.searchField ?? '').toString().trim();
    const sortField = (query.sortField ?? 'createdAt').toString().trim();
    const sortOrder =
      (query.sortOrder?.toString().toUpperCase() as 'ASC' | 'DESC') || 'DESC';

    let createdFrom = dateOnlyBoundary(query.createdFrom, 'start');
    let createdTo = dateOnlyBoundary(query.createdTo, 'end');
    if (createdFrom && createdTo && createdFrom > createdTo) {
      const tmp = createdFrom;
      createdFrom = createdTo;
      createdTo = tmp;
    }

    const includeBatches = parseBool(query.includeBatches, false);

    let items: SaleItem[] = [];

    // ---------- PRODUCTS ----------
    const pWhere: FindOptionsWhere<Product> = { isActive: true };
    const products = await this.productRepo.find({
      where: pWhere,
      order: { createdAt: 'DESC' },
    });

    const productIds = products.map((p) => p.id);
    const pBatches = await this.loadActiveProductBatches(productIds);

    const pBatchesByProduct = new Map<string, ProductBatch[]>();
    for (const b of pBatches) {
      if (Number(b.amount) <= 0) continue;
      const list = pBatchesByProduct.get(b.productId) ?? [];
      list.push(b);
      pBatchesByProduct.set(b.productId, list);
    }

    for (const p of products) {
      const batches = pBatchesByProduct.get(p.id) ?? [];
      if (!batches.length) continue;

      const totalAmount = batches.reduce((s, b) => s + Number(b.amount), 0);
      if (totalAmount <= 0) continue;

      const latest = batches[0]; // DESC
      const item: SaleItem = {
        kind: 'product',
        id: p.id,
        name: p.name,
        totalAmount,
        shouldSellPrice:
          latest.sellPrice == null ? null : Number(latest.sellPrice),
        createdAt: p.createdAt,
        ...(includeBatches
          ? {
              batches: batches.map((b) => ({
                id: b.id,
                amount: Number(b.amount),
                sellPrice: b.sellPrice == null ? null : Number(b.sellPrice),
                createdAt: b.createdAt,
              })),
            }
          : {}),
      };

      items.push(item);
    }

    // ----- filters -----
    if (search && searchField) {
      const field = searchField as keyof SaleItem;
      const needle = search.toLowerCase();
      items = items.filter((i) => {
        const val = i[field];
        if (typeof val === 'string') return val.toLowerCase().includes(needle);
        return false;
      });
    }

    if (createdFrom || createdTo) {
      items = items.filter((i) => {
        const ts = i.createdAt?.valueOf?.() ?? 0;
        const fromOk = createdFrom ? ts >= createdFrom.valueOf() : true;
        const toOk = createdTo ? ts <= createdTo.valueOf() : true;
        return fromOk && toOk;
      });
    }

    const sortKey = ['createdAt', 'name', 'totalAmount'].includes(sortField)
      ? (sortField as 'createdAt' | 'name' | 'totalAmount')
      : 'createdAt';

    items.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'createdAt')
        cmp = a.createdAt.getTime() - b.createdAt.getTime();
      else if (sortKey === 'totalAmount') cmp = a.totalAmount - b.totalAmount;
      return sortOrder === 'ASC' ? cmp : -cmp;
    });

    const count = items.length;
    const totalPages = Math.ceil(count / take) || 1;
    const start = (page - 1) * take;
    const results = items.slice(start, start + take);

    return { count, totalPages, page, take, results };
  }
}
