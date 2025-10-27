// src/supplier/services/supplier-finance-base.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Debt } from 'src/financial/debt/entities/debt.entity';
import { Payment } from 'src/financial/payment/entities/payment.entity';
import { PaymentType } from 'src/common/enums/enum';
import { RawMaterialBatch } from 'src/raw-material/raw-material-batch/entities/raw-material-batch.entity';
import { RawMaterialLog } from 'src/raw-material/raw-material-log/entities/raw-material-log.entity';
import { RawMaterial } from 'src/raw-material/raw-material/entities/raw-material.entity';
import { In, Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { toNum } from '../helper';

@Injectable()
export class SupplierFinanceBaseService {
  constructor(
    @InjectRepository(Supplier)
    protected readonly supplierRepo: Repository<Supplier>,
    @InjectRepository(RawMaterial)
    protected readonly rawRepo: Repository<RawMaterial>,
    @InjectRepository(RawMaterialBatch)
    protected readonly batchRepo: Repository<RawMaterialBatch>,
    @InjectRepository(RawMaterialLog)
    protected readonly logRepo: Repository<RawMaterialLog>,
    @InjectRepository(Payment)
    protected readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Debt)
    protected readonly debtRepo: Repository<Debt>,
  ) {}

  protected async getActiveSupplierOrThrow(id: string): Promise<Supplier> {
    const s = await this.supplierRepo.findOne({
      where: { id, isActive: true },
    });
    if (!s) throw new NotFoundException('Ta’minotchi topilmadi');
    return s;
  }

  // --- Maps: payments/debts aggregated by rawMaterialLogId ---

  protected buildPayByLog(payments: Payment[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const p of payments) {
      if (!p.rawMaterialLogId) continue;
      const prev = map.get(p.rawMaterialLogId) ?? 0;
      map.set(p.rawMaterialLogId, prev + toNum(p.amount));
    }
    return map;
  }

  protected buildPayMethodByLog(payments: Payment[]): Map<string, PaymentType> {
    const map = new Map<string, PaymentType>();
    // choose latest payment's type per log
    const latestByLog = new Map<string, { date: Date; type: PaymentType }>();
    for (const p of payments) {
      if (!p.rawMaterialLogId) continue;
      const prev = latestByLog.get(p.rawMaterialLogId);
      const createdAt = p.createdAt;
      if (!prev || (createdAt && createdAt > prev.date)) {
        latestByLog.set(p.rawMaterialLogId, {
          date: createdAt ?? new Date(0),
          type: p.paymentType,
        });
      }
    }
    for (const [logId, info] of latestByLog.entries()) {
      map.set(logId, info.type);
    }
    return map;
  }

  protected buildDebtByLog(debts: Debt[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const d of debts) {
      if (!d.rawMaterialLogId) continue;
      const prev = map.get(d.rawMaterialLogId) ?? 0;
      map.set(d.rawMaterialLogId, prev + toNum(d.amount));
    }
    return map;
  }

  protected buildPaymentsByLog(payments: Payment[]): Map<string, Payment[]> {
    const map = new Map<string, Payment[]>();
    for (const p of payments) {
      if (!p.rawMaterialLogId) continue;
      const arr = map.get(p.rawMaterialLogId) ?? [];
      arr.push(p);
      map.set(p.rawMaterialLogId, arr);
    }
    // Optional: sort payments per log by createdAt ascending
    for (const arr of map.values()) {
      arr.sort((a: Payment, b: Payment) => {
        const ad = a.createdAt ? a.createdAt.getTime() : 0;
        const bd = b.createdAt ? b.createdAt.getTime() : 0;
        return ad - bd;
      });
    }
    return map;
  }

  protected collectLogIds(...maps: Array<Map<string, number>>): string[] {
    const ids: string[] = [];
    for (const m of maps) for (const k of m.keys()) ids.push(k);
    return Array.from(new Set(ids));
  }

  // --- Loads ---

  protected async loadLogsWithRelations(logIds: string[]) {
    const logs = await this.logRepo.find({
      where: { id: In(logIds) },
      withDeleted: true,
      relations: ['rawMaterial', 'rawMaterialBatch'],
      order: { createdAt: 'DESC' },
    });
    const logById = new Map(logs.map((l) => [l.id, l]));
    return { logs, logById };
  }

  protected async preloadMaterials(materialIds: string[]) {
    if (!materialIds.length) return new Map<string, RawMaterial>();
    const materials = await this.rawRepo.find({
      where: { id: In(materialIds) },
      withDeleted: true,
    });
    return new Map(materials.map((m) => [m.id, m]));
  }

  protected async preloadBatches(batchIds: string[]) {
    if (!batchIds.length) return [] as RawMaterialBatch[];
    return this.batchRepo.find({
      where: { id: In(batchIds) },
      withDeleted: true,
      relations: ['rawMaterial'],
      order: { createdAt: 'DESC' },
    });
  }
}
