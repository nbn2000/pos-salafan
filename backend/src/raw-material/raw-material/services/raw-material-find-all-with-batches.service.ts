// src/raw-material/raw-material/services/raw-material-find-all-with-batches.service.ts
import { Injectable } from '@nestjs/common';
import { paginateAndFilter } from 'src/common/utils/pagination.util';
import { FindOptionsWhere, In } from 'typeorm';
import { RawMaterialBatch } from '../../raw-material-batch/entities/raw-material-batch.entity';
import {
  RawWithBatchesPagedResult,
  RawWithBatchesPagedWithTotals,
  RawMaterialBatchView,
  RawMaterialBatchPaymentView,
  toBatchView,
  toRawMaterialResult,
} from '../helper';
import { Payment } from 'src/financial/payment/entities/payment.entity';
import { Debt } from 'src/financial/debt/entities/debt.entity';
import { RawMaterialQueryDto } from '../dto/raw-material-query.dto';
import { RawMaterial } from '../entities/raw-material.entity';
import { RawMaterialBaseService } from './raw-material-base.service';

@Injectable()
export class RawMaterialFindAllWithBatchesService extends RawMaterialBaseService {
  async findAllWithBatches(
    query: RawMaterialQueryDto,
  ): Promise<RawWithBatchesPagedWithTotals> {
    const baseWhere: FindOptionsWhere<RawMaterial> = { isActive: true };
    if (query.priority) baseWhere.priority = query.priority;
    const pageData = await paginateAndFilter(this.repo, query, baseWhere);
    const ids = pageData.results.map((m) => m.id);

    // ✅ Always pass Promises to Promise.all
    const [batches] = await Promise.all([
      ids.length
        ? this.batchRepo.find({
            where: { rawMaterialId: In(ids), isActive: true },
            relations: ['rawMaterial'],
          })
        : Promise.resolve([] as RawMaterialBatch[]),
    ]);

    const batchesByRaw = new Map<string, RawMaterialBatch[]>();
    for (const b of batches) {
      const list = batchesByRaw.get(b.rawMaterialId) ?? [];
      list.push(b);
      batchesByRaw.set(b.rawMaterialId, list);
    }

    // Prepare finance data per batch
    const batchIds = batches.map((b) => b.id);
    const logsByBatch = new Map<string, string[]>();
    const paidByLog = new Map<string, number>();
    const staticDebtByLog = new Map<string, number>();
    const supplierByLogDebtFrom = new Map<string, string>();
    const supplierByLogPayTo = new Map<string, string>();

    if (batchIds.length) {
      const logs = await this.logRepo.find({
        where: { rawMaterialBatchId: In(batchIds) },
        withDeleted: true,
        select: ['id', 'rawMaterialBatchId'],
      });
      const logIds = logs.map((l) => l.id);
      for (const l of logs) {
        const arr = logsByBatch.get(l.rawMaterialBatchId) ?? [];
        arr.push(l.id);
        logsByBatch.set(l.rawMaterialBatchId, arr);
      }

      if (logIds.length) {
        const [payments, debts] = await Promise.all([
          this.paymentRepo.find({ where: { rawMaterialLogId: In(logIds) }, withDeleted: true }),
          this.debtRepo.find({ where: { rawMaterialLogId: In(logIds) }, withDeleted: true }),
        ] as const);

        for (const p of payments) {
          if (!p.rawMaterialLogId) continue;
          paidByLog.set(p.rawMaterialLogId, (paidByLog.get(p.rawMaterialLogId) ?? 0) + Number(p.amount ?? 0));
          if (!supplierByLogPayTo.has(p.rawMaterialLogId) && p.to) {
            supplierByLogPayTo.set(p.rawMaterialLogId, p.to);
          }
        }
        for (const d of debts) {
          if (!d.rawMaterialLogId) continue;
          staticDebtByLog.set(d.rawMaterialLogId, (staticDebtByLog.get(d.rawMaterialLogId) ?? 0) + Number(d.amount ?? 0));
          if (!supplierByLogDebtFrom.has(d.rawMaterialLogId) && d.from) {
            supplierByLogDebtFrom.set(d.rawMaterialLogId, d.from);
          }
        }
      }
    }

    // Preload supplier names
    const supplierIds = new Set<string>();
    for (const [logId, sup] of supplierByLogDebtFrom.entries()) supplierIds.add(sup);
    for (const [logId, sup] of supplierByLogPayTo.entries()) supplierIds.add(sup);
    const supplierNameById = new Map<string, string>();
    if (supplierIds.size) {
      const suppliers = await this.supplierRepo.find({ where: { id: In(Array.from(supplierIds)) }, withDeleted: true });
      for (const s of suppliers) supplierNameById.set(s.id, s.name);
    }

    const joined = pageData.results.map((rm) => {
      const items = batchesByRaw.get(rm.id) ?? [];
      const views: RawMaterialBatchView[] = items.map((b) => {
        const v = toBatchView(b) as RawMaterialBatchView;
        const lgIds = logsByBatch.get(b.id) ?? [];

        let paid = 0;
        let staticDebt = 0;
        let supplierId: string | undefined;
        for (const lid of lgIds) {
          const p = paidByLog.get(lid);
          if (p) paid += p;
          const d = staticDebtByLog.get(lid);
          if (d) staticDebt += d;
          if (!supplierId) supplierId = supplierByLogDebtFrom.get(lid) || supplierByLogPayTo.get(lid);
        }

        const purchaseTotal = Number(v.amount) * Number(v.buyPrice);
        const paidStatic = Math.max(purchaseTotal - staticDebt, 0);
        const credit = Math.max(purchaseTotal - paid, 0);

        const payment: RawMaterialBatchPaymentView = {
          supplierName: supplierId ? (supplierNameById.get(supplierId) ?? '') : '',
          paid,
          paidStatic,
          credit,
          creditStatic: staticDebt,
        };
        v.payment = payment;
        return v;
      });
      const totalBatchAmount = views.reduce((sum, b) => sum + b.amount, 0);

      return {
        material: toRawMaterialResult(rm),
        batches: views,
        totalBatchAmount,
      };
    });

    const totals = await this.computeStoreTotals();
    return { ...pageData, ...totals, results: joined };
  }
}
