// src/supplier/services/supplier-finance-all.service.ts
import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { paginateAndFilter } from 'src/common/utils/pagination.util';
import { In } from 'typeorm';
import {
  SupplierBatchFinanceView,
  SupplierFinanceRow,
  SupplierLogView,
  SupplierMaterialFinanceItem,
  SuppliersFinancePaged,
  toBatchFinanceBase,
  toRawMaterialView,
} from '../helper';
import { SupplierFinanceBaseService } from './supplier-finance-base.service';

@Injectable()
export class SupplierFinanceAllService extends SupplierFinanceBaseService {
  async findAllRawMaterialsFinance(
    query: PaginationQueryDto,
  ): Promise<SuppliersFinancePaged> {
    const page = await paginateAndFilter(this.supplierRepo, query, {
      isActive: true,
    });
    const suppliers = page.results;
    if (!suppliers.length) return { ...page, results: [] };

    const supplierIds = suppliers.map((s) => s.id);

    const [payments, debts] = await Promise.all([
      this.paymentRepo.find({
        where: { to: In(supplierIds) },
        withDeleted: true,
      }),
      this.debtRepo.find({
        where: { from: In(supplierIds) },
        withDeleted: true,
      }),
    ]);
    const paymentsByLog = this.buildPaymentsByLog(payments);

    const payBySupplierLog = new Map<string, Map<string, number>>();
    for (const p of payments) {
      if (!p.to || !p.rawMaterialLogId) continue;
      const m = payBySupplierLog.get(p.to) ?? new Map<string, number>();
      const prev = m.get(p.rawMaterialLogId) ?? 0;
      m.set(p.rawMaterialLogId, prev + (Number(p.amount) || 0));
      payBySupplierLog.set(p.to, m);
    }

    const debtBySupplierLog = new Map<string, Map<string, number>>();
    for (const d of debts) {
      if (!d.from || !d.rawMaterialLogId) continue;
      const m = debtBySupplierLog.get(d.from) ?? new Map<string, number>();
      const prev = m.get(d.rawMaterialLogId) ?? 0;
      m.set(d.rawMaterialLogId, prev + (Number(d.amount) || 0));
      debtBySupplierLog.set(d.from, m);
    }

    const allLogIds: string[] = Array.from(
      new Set<string>([
        ...Array.from(payBySupplierLog.values()).flatMap((m) =>
          Array.from(m.keys()),
        ),
        ...Array.from(debtBySupplierLog.values()).flatMap((m) =>
          Array.from(m.keys()),
        ),
      ]),
    );

    if (!allLogIds.length) {
      return { ...page, results: [] };
    }

    const { logs, logById } = await this.loadLogsWithRelations(allLogIds);

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

    const allLogIdsByBatch = new Map<string, string[]>();
    for (const lg of logs) {
      if (!lg.rawMaterialBatchId) continue;
      const arr = allLogIdsByBatch.get(lg.rawMaterialBatchId) ?? [];
      arr.push(lg.id);
      allLogIdsByBatch.set(lg.rawMaterialBatchId, arr);
    }

    const rows: SupplierFinanceRow[] = [];

    for (const s of suppliers) {
      const payByLog = payBySupplierLog.get(s.id) ?? new Map<string, number>();
      const debtByLog =
        debtBySupplierLog.get(s.id) ?? new Map<string, number>();

      const myLogIds = new Set<string>([
        ...Array.from(payByLog.keys()),
        ...Array.from(debtByLog.keys()),
      ]);

      if (!myLogIds.size) {
        rows.push({
          supplier: { id: s.id, name: s.name, phone: s.phone },
          credit: 0,
          items: [],
        });
        continue;
      }

      const myLogs = logs.filter((l) => myLogIds.has(l.id));
      const myMaterialIds = Array.from(
        new Set(
          myLogs.filter((l) => !!l.rawMaterialId).map((l) => l.rawMaterialId),
        ),
      );

      const items: SupplierMaterialFinanceItem[] = [];
      let credit = 0;

      for (const materialId of myMaterialIds) {
        const material = materialById.get(materialId);
        if (!material) continue;

        const matBatches = batchesByMaterial.get(materialId) ?? [];

        const batchViews: SupplierBatchFinanceView[] = [];
        let materialCredit = 0;

        for (const b of matBatches) {
          const lgIds = (allLogIdsByBatch.get(b.id) ?? []).filter((id) =>
            myLogIds.has(id),
          );
          if (!lgIds.length) continue;

          const base = toBatchFinanceBase(b);

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

        if (batchViews.length) {
          items.push({
            material: toRawMaterialView(material),
            credit: materialCredit,
            batches: batchViews,
          });
        }
      }

      rows.push({
        supplier: { id: s.id, name: s.name, phone: s.phone },
        credit,
        items,
      });
    }

    return { ...page, results: rows };
  }
}
