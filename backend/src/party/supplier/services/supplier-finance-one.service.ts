// src/supplier/services/supplier-finance-one.service.ts
import { Injectable } from '@nestjs/common';
import {
  SupplierBatchFinanceView,
  SupplierFinanceRow,
  SupplierLogView,
  SupplierMaterialFinanceItem,
  toBatchFinanceBase,
  toRawMaterialView,
} from '../helper';
import { SupplierFinanceBaseService } from './supplier-finance-base.service';

@Injectable()
export class SupplierFinanceOneService extends SupplierFinanceBaseService {
  async findRawMaterialsFinance(
    supplierId: string,
  ): Promise<SupplierFinanceRow> {
    const supplier = await this.getActiveSupplierOrThrow(supplierId);

    const [payments, debts] = await Promise.all([
      this.paymentRepo.find({ where: { to: supplierId }, withDeleted: true }),
      this.debtRepo.find({ where: { from: supplierId }, withDeleted: true }),
    ]);

    const payByLog = this.buildPayByLog(payments);
    const debtByLog = this.buildDebtByLog(debts);
    const paymentsByLog = this.buildPaymentsByLog(payments);
    const logIds = this.collectLogIds(payByLog, debtByLog);

    if (!logIds.length) {
      return {
        supplier: {
          id: supplier.id,
          name: supplier.name,
          phone: supplier.phone,
        },
        credit: 0,
        items: [],
      };
    }

    const { logs, logById } = await this.loadLogsWithRelations(logIds);

    const materialIds = Array.from(
      new Set(
        logs.filter((l) => !!l.rawMaterialId).map((l) => l.rawMaterialId),
      ),
    );
    const batchIds = Array.from(
      new Set(
        logs
          .filter((l) => !!l.rawMaterialBatchId)
          .map((l) => l.rawMaterialBatchId),
      ),
    );

    const [materialById, batches] = await Promise.all([
      this.preloadMaterials(materialIds),
      this.preloadBatches(batchIds),
    ]);

    const batchesByMaterial = new Map<string, typeof batches>();
    for (const b of batches) {
      const list = batchesByMaterial.get(b.rawMaterialId) ?? [];
      list.push(b);
      batchesByMaterial.set(b.rawMaterialId, list);
    }

    const logIdsByBatch = new Map<string, string[]>();
    for (const lg of logs) {
      if (!lg.rawMaterialBatchId) continue;
      const arr = logIdsByBatch.get(lg.rawMaterialBatchId) ?? [];
      arr.push(lg.id);
      logIdsByBatch.set(lg.rawMaterialBatchId, arr);
    }

    const items: SupplierMaterialFinanceItem[] = [];
    let credit = 0;

    for (const materialId of materialIds) {
      const material = materialById.get(materialId);
      if (!material) continue;

      const matBatches = batchesByMaterial.get(materialId) ?? [];

      const batchViews: SupplierBatchFinanceView[] = [];
      let materialCredit = 0;

      for (const b of matBatches) {
        const base = toBatchFinanceBase(b);
        const lgIds = logIdsByBatch.get(b.id) ?? [];

        let paid = 0;
        let staticDebt = 0;

        for (const lid of lgIds) {
          const p = payByLog.get(lid);
          if (p) paid += p;
          const d = debtByLog.get(lid);
          if (d) staticDebt += d;
        }

        const purchaseTotal = Number(base.amount) * Number(base.buyPrice);
        const paidStatic = Math.max(purchaseTotal - staticDebt, 0);
        const currentCredit = Math.max(purchaseTotal - paid, 0);

        const logViews: SupplierLogView[] = lgIds.map((lid) => {
          const l = logById.get(lid);
          return {
            id: lid,
            createdAt: l?.createdAt ?? new Date(0),
            comment: l?.comment ?? null,
          } as SupplierLogView;
        });
        const paymentViews = lgIds
          .flatMap((lid) => paymentsByLog.get(lid) ?? [])
          .map((p) => ({
            id: p.id,
            createdAt: p.createdAt,
            amount: Number(p.amount),
            paymentType: p.paymentType,
            comment: p.comment ?? '',
          }));

        materialCredit += currentCredit;

        batchViews.push({
          ...base,
          paid,
          paidStatic,
          credit: currentCredit,
          creditStatic: staticDebt,
          payments: paymentViews,
          logs: logViews,
        });
      }

      credit += materialCredit;

      items.push({
        material: toRawMaterialView(material),
        credit: materialCredit,
        batches: batchViews,
      });
    }

    return {
      supplier: { id: supplier.id, name: supplier.name, phone: supplier.phone },
      credit,
      items,
    };
  }
}
