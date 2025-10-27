import { Injectable } from '@nestjs/common';
import { AnalyticsBaseService } from './analytics-base.service';

@Injectable()
export class AnalyticsStockService extends AnalyticsBaseService {
  async productStockByType(): Promise<{ kg: number; unit: number }> {
    const rows = await this.productBatchRepo
      .createQueryBuilder('pb')
      .innerJoin('pb.product', 'p')
      .select('p.type', 'type')
      .addSelect('COALESCE(SUM(pb.amount),0)', 'total')
      .where('pb.isActive = true AND p.isActive = true')
      .groupBy('p.type')
      .getRawMany<{ type: string; total: string }>();

    let kg = 0;
    let unit = 0;
    for (const r of rows) {
      if (r.type === 'KG') kg += Number(r.total) || 0;
      else if (r.type === 'UNIT') unit += Number(r.total) || 0;
    }
    return { kg, unit };
  }

  async rawStockByType(): Promise<{ kg: number; unit: number }> {
    const rows = await this.rawBatchRepo
      .createQueryBuilder('rb')
      .innerJoin('rb.rawMaterial', 'r')
      .select('r.type', 'type')
      .addSelect('COALESCE(SUM(rb.amount),0)', 'total')
      .where('rb.isActive = true AND r.isActive = true')
      .groupBy('r.type')
      .getRawMany<{ type: string; total: string }>();

    let kg = 0;
    let unit = 0;
    for (const r of rows) {
      if (r.type === 'KG') kg += Number(r.total) || 0;
      else if (r.type === 'UNIT') unit += Number(r.total) || 0;
    }
    return { kg, unit };
  }
}
