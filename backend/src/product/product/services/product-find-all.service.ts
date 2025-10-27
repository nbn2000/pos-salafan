import { Injectable } from '@nestjs/common';
import { paginateAndFilter } from 'src/common/utils/pagination.util';
import { In, FindOptionsWhere } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductBatch } from '../../product-batch/entities/product-batch.entity';
import { ProductBatchView, ProductPagedWithTotals } from '../helper';
import { ProductBaseService } from './product-base.service';
import { ProductQueryDto } from '../dto/product-query.dto';

@Injectable()
export class ProductFindAllService extends ProductBaseService {
  async findAll(query: ProductQueryDto): Promise<ProductPagedWithTotals> {
    const baseWhere: FindOptionsWhere<Product> = { isActive: true };
    if (query.priority) baseWhere.priority = query.priority;
    const page = await paginateAndFilter(this.productRepo, query, baseWhere);

    const productIds = page.results.map((p) => p.id);

    let batches: ProductBatch[] = [];

    if (productIds.length) {
      batches = await this.batchRepo.find({
        where: { productId: In(productIds), isActive: true },
        order: { createdAt: 'DESC' },
      });
    }

    const batchesByProduct = new Map<string, ProductBatchView[]>();
    for (const b of batches) {
      const list = batchesByProduct.get(b.productId) ?? [];
      list.push(this.toProductBatchView(b));
      batchesByProduct.set(b.productId, list);
    }

    const results = page.results.map((p) =>
      this.toProductView(p, batchesByProduct.get(p.id) ?? []),
    );

    const totals = await this.computeStoreTotals();
    return { ...page, ...totals, results };
  }
}

