import { Injectable } from '@nestjs/common';
import { AnalyticsBaseService } from './analytics-base.service';

@Injectable()
export class AnalyticsGrossProfitService extends AnalyticsBaseService {
  /**
   * Total profit for products over period:
   * sum(amount * (priceUsed - costPerUnit))
   * priceUsed = COALESCE(tp.soldPrice, pb.sellPrice)
   * costPerUnit = COALESCE(pb.cost, 0)
   */
  async grossProfitProducts(from: Date, to: Date): Promise<number> {
    const row = await this.txProdBatchRepo
      .createQueryBuilder('tpb')
      .innerJoin('tpb.transaction', 't')
      .innerJoin('tpb.transactionProduct', 'tp')
      .innerJoin('tp.product', 'p')
      .innerJoin('tpb.productBatch', 'pb')
      .select(
        `COALESCE(SUM(COALESCE(tpb.amount,0) * ((COALESCE(tp.soldPrice, pb.sellPrice, 0)) - COALESCE(pb.cost,0))),0)`,
        'total',
      )
      .where(
        'tpb.isActive = true AND t.isActive = true AND tp.isActive = true AND p.isActive = true AND pb.isActive = true',
      )
      .andWhere('t.createdAt >= :from', { from })
      .andWhere('t.createdAt <= :to', { to })
      .getRawOne<{ total: string }>();

    return this.num(row);
  }
}
