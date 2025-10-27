// src/transaction/services/transaction-find-all.service.ts
import { Injectable } from '@nestjs/common';
import { Debt } from 'src/financial/debt/entities/debt.entity';
import { Client } from 'src/party/client/entities/client.entity';
import { Product } from 'src/product/product/entities/product.entity';
import { In } from 'typeorm';
import { TransactionQueryDto } from '../dto/transaction-query.dto';
import { TransactionProduct } from '../entities/transaction-product.entity';
import { TransactionPagedResult } from '../helper';
import { TransactionBaseService } from './transaction-base.service';

@Injectable()
export class TransactionFindAllService extends TransactionBaseService {
  async findAll(query: TransactionQueryDto): Promise<TransactionPagedResult> {
    const take = Math.max(1, Math.min(100, Number(query.take) || 10));
    const page = Math.max(1, Number(query.page) || 1);
    const skip = (page - 1) * take;

    const sortBy = query.sortBy ?? 'createdAt';
    const sortDir = query.sortDir ?? 'DESC';

    const startOfDay = (s?: string) =>
      s && /^\d{4}-\d{2}-\d{2}$/.test(s)
        ? new Date(`${s}T00:00:00.000Z`)
        : undefined;
    const endOfDay = (s?: string) =>
      s && /^\d{4}-\d{2}-\d{2}$/.test(s)
        ? new Date(`${s}T23:59:59.999Z`)
        : undefined;

    const from = startOfDay(query.createdFrom);
    const to = endOfDay(query.createdTo);
    const q = (query.q || '').trim();

    // Query header ids with lightweight search
    const qb = this.txRepo
      .createQueryBuilder('t')
      .leftJoin(
        TransactionProduct,
        'tp',
        'tp.transactionId = t.id AND tp.isActive = true',
      )
      .leftJoin(Product, 'p', 'p.id = tp.productId')
      .leftJoin(
        Debt,
        'd',
        '"d"."transactionId" = "t"."id" AND "d"."isActive" = true AND "d"."deletedAt" IS NULL',
      )
      .leftJoin(Client, 'c', '"c"."id"::text = "d"."from"')
      .where('t.isActive = true');

    if (from) qb.andWhere('t.createdAt >= :from', { from });
    if (to) qb.andWhere('t.createdAt <= :to', { to });

    if (query.clientId) qb.andWhere('d.from = :cid', { cid: query.clientId });
    if (query.productId)
      qb.andWhere('tp.productId = :pid', { pid: query.productId });

    if (q) {
      qb.andWhere(
        `(t.comment ILIKE :qq OR p.name ILIKE :qq OR c.name ILIKE :qq)`,
        { qq: `%${q}%` },
      );
    }

    const rawCount = await qb
      .clone()
      .select('COUNT(DISTINCT t.id)', 'cnt')
      .getRawOne<{ cnt: string }>();
    const totalCount = Number(rawCount?.cnt ?? 0);

    const ids = (
      await qb
        .clone()
        .select('t.id', 'id')
        .groupBy('t.id')
        .orderBy(
          sortBy === 'totalSoldPrice' ? 't.totalSoldPrice' : 't.createdAt',
          sortDir,
        )
        .offset(skip)
        .limit(take)
        .getRawMany<{ id: string }>()
    ).map((r) => r.id);

    if (!ids.length) {
      return {
        count: totalCount,
        totalPages: Math.ceil(totalCount / take) || 1,
        page,
        take,
        results: [],
      };
    }

    const headers = await this.txRepo.find({
      where: { id: In(ids) },
      withDeleted: false,
    });
    const byId = new Map(headers.map((h) => [h.id, h]));
    const orderedHeaders = ids.map((id) => byId.get(id)!).filter(Boolean);

    // enrichment (shared)
    const txIds = ids;
    const { debtByTx, payByTx, paidByTx, clientMap } =
      await this.aggregateFinanceForTxIds(txIds);
    const productsByTx = await this.enrichProductsForTxIds(txIds);

    const results = orderedHeaders.map((t) =>
      this.composeTxRow(t, productsByTx, clientMap, {
        debtByTx,
        payByTx,
        paidByTx,
      }),
    );

    return {
      count: totalCount,
      totalPages: Math.ceil(totalCount / take) || 1,
      page,
      take,
      results,
    };
  }
}
