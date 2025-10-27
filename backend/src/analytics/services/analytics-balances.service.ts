import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { AnalyticsBaseService } from './analytics-base.service';

@Injectable()
export class AnalyticsBalancesService extends AnalyticsBaseService {
  /** Positive receivables = max(0, debts(from clients) - payments(from clients)). */
  async receivablesFromClients(): Promise<number> {
    const clientIds = (
      await this.clientRepo.find({ where: { isActive: true }, select: ['id'] })
    ).map((c) => c.id);

    if (!clientIds.length) return 0;

    // 1) All active client debts (these are POST-upfront = remaining at sale time)
    const debts = await this.debtRepo.find({
      where: { isActive: true, from: In(clientIds) },
      select: ['id', 'amount', 'from', 'transactionId', 'createdAt'],
    });
    if (!debts.length) return 0;

    // Sum total debt
    let totalDebt = 0;
    for (const d of debts) totalDebt += Number(d.amount) || 0;

    // Map debts by (transactionId, clientId) to know when debt was created
    const debtByKey = new Map<string, { createdAt: Date }>();
    const txIds: string[] = [];
    for (const d of debts) {
      if (!d.transactionId) continue; // skip non-tx debts (optional)
      const key = `${d.transactionId}:${d.from}`;
      const prev = debtByKey.get(key);
      if (!prev || d.createdAt < prev.createdAt) {
        debtByKey.set(key, { createdAt: d.createdAt });
      }
      txIds.push(d.transactionId);
    }
    const uniqTxIds = Array.from(new Set(txIds));
    if (!uniqTxIds.length) return Math.max(totalDebt, 0);

    // 2) Only subtract payments that happened AFTER the debt was created for that tx+client
    const pays = await this.paymentRepo.find({
      where: { isActive: true, transactionId: In(uniqTxIds) },
      select: ['amount', 'from', 'to', 'transactionId', 'createdAt'],
    });

    let paidAfter = 0;
    for (const p of pays) {
      if (!p.transactionId) continue;

      // Client paying us (positive), or refunds/contra (negative)
      const keyFrom = `${p.transactionId}:${p.from ?? ''}`;
      const keyTo = `${p.transactionId}:${p.to ?? ''}`;

      const debtFrom = debtByKey.get(keyFrom);
      if (debtFrom && p.createdAt > debtFrom.createdAt) {
        paidAfter += Number(p.amount) || 0; // client -> us
        continue;
      }
      const debtTo = debtByKey.get(keyTo);
      if (debtTo && p.createdAt > debtTo.createdAt) {
        paidAfter -= Number(p.amount) || 0; // us -> client (refund)
      }
    }

    // Outstanding receivables = sum(debts recorded) - payments made AFTER those debts
    return Math.max(0, totalDebt - paidAfter);
  }

  /** Positive payables = outstanding supplier debts after subtracting payments. */
  async payablesToSuppliers(): Promise<number> {
    const suppliers = await this.supplierRepo.find({
      where: { isActive: true },
      select: ['id'],
      withDeleted: true,
    });
    const supplierIds = suppliers.map((s) => s.id);
    if (!supplierIds.length) return 0;

    // 1) Active supplier debts grouped by bucket:
    //    - LOG:<rawMaterialLogId> (log-linked purchase)
    //    - GEN:<supplierId>       (general debt without a log)
    const debts = await this.debtRepo.find({
      where: { from: In(supplierIds), isActive: true },
      withDeleted: true,
    });

    type Bucket = { supplierId: string; amount: number; startedAt: Date };
    const byKey = new Map<string, Bucket>();
    const keyOf = (supplierId: string, logId?: string | null) =>
      logId ? `LOG:${logId}` : `GEN:${supplierId}`;

    for (const d of debts) {
      const supplierId = d.from;
      if (!supplierId) continue;
      const k = keyOf(supplierId, d.rawMaterialLogId);
      const created = d.createdAt ?? new Date(0);
      const prev = byKey.get(k);
      if (prev) {
        prev.amount += Number(d.amount) || 0;
        if (created < prev.startedAt) prev.startedAt = created;
      } else {
        byKey.set(k, {
          supplierId,
          amount: Number(d.amount) || 0,
          startedAt: created,
        });
      }
    }

    if (!byKey.size) return 0;

    // 2) Payments both directions (to supplier = positive, from supplier = negative),
    //    but only those that happen AFTER the bucket's debt was created (ignore upfront).
    const payments = await this.paymentRepo.find({
      where: [
        { to: In(supplierIds), isActive: true },
        { from: In(supplierIds), isActive: true },
      ],
      withDeleted: true,
    });

    const paidByKey = new Map<string, number>();

    for (const p of payments) {
      const isToSupplier = p.to && supplierIds.includes(p.to);
      const isFromSupplier = p.from && supplierIds.includes(p.from);
      if (!isToSupplier && !isFromSupplier) continue;

      const supplierId = isToSupplier ? p.to : p.from;
      const k = keyOf(supplierId, p.rawMaterialLogId);
      const b = byKey.get(k);

      // If payment isn't tied to an existing log bucket, try apply it to general bucket.
      const bucket = b ?? byKey.get(keyOf(supplierId));
      if (!bucket) continue;

      const pAt = p.createdAt ?? new Date(0);
      if (pAt <= bucket.startedAt) continue; // ignore upfront/inline at purchase time

      const amt = Number(p.amount) || 0;
      const delta = isToSupplier ? amt : -amt;
      const targetKey = b ? k : keyOf(supplierId); // use actual or general bucket
      paidByKey.set(targetKey, (paidByKey.get(targetKey) ?? 0) + delta);
    }

    // 3) Sum positive outstanding = debt - post-debt payments
    let total = 0;
    for (const [k, b] of byKey.entries()) {
      const paid = paidByKey.get(k) ?? 0;
      const due = b.amount - paid;
      if (due > 0) total += due;
    }
    return total;
  }
}
