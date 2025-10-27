// src/raw-material/raw-material/services/raw-material-base.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Debt } from 'src/financial/debt/entities/debt.entity';
import { Payment } from 'src/financial/payment/entities/payment.entity';
import { Supplier } from 'src/party/supplier/entities/supplier.entity';
import { User } from 'src/user/entities/user.entity';

import { RawMaterialBatch } from '../../raw-material-batch/entities/raw-material-batch.entity';
import { RawMaterialLog } from '../../raw-material-log/entities/raw-material-log.entity';
import { RawMaterial } from '../entities/raw-material.entity';
import { MeasurementType, Priority } from 'src/common/enums/enum';
import { assertUuid, RawMaterialResult, RawMaterialTotals, toRawMaterialResult } from '../helper';

@Injectable()
export class RawMaterialBaseService {
  constructor(
    @InjectRepository(RawMaterial)
    protected readonly repo: Repository<RawMaterial>,
    @InjectRepository(RawMaterialBatch)
    protected readonly batchRepo: Repository<RawMaterialBatch>,
    @InjectRepository(RawMaterialLog)
    protected readonly logRepo: Repository<RawMaterialLog>,
    @InjectRepository(Debt)
    protected readonly debtRepo: Repository<Debt>,
    @InjectRepository(Payment)
    protected readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Supplier)
    protected readonly supplierRepo: Repository<Supplier>,
    @InjectRepository(User)
    protected readonly userRepo: Repository<User>,
  ) {}

  protected async getActiveRawOrThrow(id: string): Promise<RawMaterial> {
    assertUuid(id, 'id');
    const entity = await this.repo.findOne({ where: { id, isActive: true } });
    if (!entity) throw new NotFoundException('Xom ashyo topilmadi');
    return entity;
  }

  // Single-currency financials (exact logic preserved from original)
  protected async computeFinancials(rawMaterialId: string): Promise<{
    totalCost: number;
    totalDebt: number;
    totalPayment: number;
    outstanding: number;
    logIds: string[];
  }> {
    assertUuid(rawMaterialId, 'rawMaterialId');

    const batches = await this.batchRepo.find({
      where: { rawMaterialId: rawMaterialId, isActive: true },
    });

    let totalCost = 0;
    for (const b of batches) {
      const amount = Number(b.amount);
      totalCost += amount * Number(b.buyPrice);
    }

    const batchIds = batches.map((b) => b.id);
    const logs = batchIds.length
      ? await this.logRepo.find({
          where: { rawMaterialBatchId: In(batchIds), isActive: true },
          select: ['id'],
        })
      : [];
    const logIds = logs.map((l) => l.id);

    let totalDebt = 0;
    let totalPayment = 0;

    if (logIds.length) {
      const [debts, payments] = await Promise.all([
        this.debtRepo.find({
          where: { rawMaterialLogId: In(logIds), isActive: true },
        }),
        this.paymentRepo.find({
          where: { rawMaterialLogId: In(logIds), isActive: true },
        }),
      ]);

      for (const d of debts) totalDebt += Number(d.amount);
      for (const p of payments) totalPayment += Number(p.amount);
    }

    const outstanding = totalDebt - totalPayment;

    return { totalCost, totalDebt, totalPayment, outstanding, logIds };
  }

  // helper to build RawMaterialResult (images removed)
  protected toResult(entity: RawMaterial): Promise<RawMaterialResult> {
    return Promise.resolve(toRawMaterialResult(entity));
  }

  // Compute store-wide totals across all active raw materials and batches
  protected async computeStoreTotals(): Promise<RawMaterialTotals> {
    const batches = await this.batchRepo.find({ where: { isActive: true }, relations: ['rawMaterial'] });

    let totalLowKg = 0;
    let totalHighKg = 0;
    let totalLowUnit = 0;
    let totalHighUnit = 0;

    for (const b of batches) {
      const rm = b.rawMaterial;
      if (!rm || !rm.isActive) continue;

      const amount = Number(b.amount) || 0;
      if (rm.type === MeasurementType.KG) {
        if (rm.priority === Priority.LOW) totalLowKg += amount;
        else if (rm.priority === Priority.HIGH) totalHighKg += amount;
      } else if (rm.type === MeasurementType.PIECE) {
        if (rm.priority === Priority.LOW) totalLowUnit += amount;
        else if (rm.priority === Priority.HIGH) totalHighUnit += amount;
      }
    }

    return { totalLowKg, totalHighKg, totalLowUnit, totalHighUnit };
  }
}
