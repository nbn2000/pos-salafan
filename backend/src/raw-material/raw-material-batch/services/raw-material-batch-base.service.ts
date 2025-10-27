// src/raw-material/raw-material-batch/services/raw-material-batch-base.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Debt } from 'src/financial/debt/entities/debt.entity';
import { Payment } from 'src/financial/payment/entities/payment.entity';
import { Supplier } from 'src/party/supplier/entities/supplier.entity';
import { User } from 'src/user/entities/user.entity';

import { RawMaterialLog } from '../../raw-material-log/entities/raw-material-log.entity';
import { RawMaterial } from '../../raw-material/entities/raw-material.entity';
import { RawMaterialBatch } from '../entities/raw-material-batch.entity';

@Injectable()
export class RawMaterialBatchBaseService {
  constructor(
    @InjectRepository(RawMaterialBatch)
    protected readonly repo: Repository<RawMaterialBatch>,
    @InjectRepository(RawMaterial)
    protected readonly rawRepo: Repository<RawMaterial>,
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

  protected async getActiveBatchOrThrow(id: string): Promise<RawMaterialBatch> {
    const entity = await this.repo.findOne({ where: { id, isActive: true } });
    if (!entity) throw new NotFoundException('Xomashyo partiyasi topilmadi');
    return entity;
  }

  protected async getActiveRawOrThrow(id: string): Promise<RawMaterial> {
    const entity = await this.rawRepo.findOne({
      where: { id, isActive: true },
    });
    if (!entity) throw new NotFoundException('Xomashyo topilmadi');
    return entity;
  }

  /** Sum helper (kept local to preserve original math behavior) */
  protected sumAmounts<T extends { amount: number }>(items: T[]): number {
    return items.reduce((s, x) => s + Number(x.amount), 0);
  }

  /** Load debts & payments for a set of rawMaterialLogIds (active only, as original) */
  protected async loadFinanceByLogIds(logIds: string[]) {
    if (!logIds.length)
      return { debts: [], payments: [] as Array<{ amount: number }> };
    const [debts, payments] = await Promise.all([
      this.debtRepo.find({
        where: { rawMaterialLogId: In(logIds), isActive: true },
      }),
      this.paymentRepo.find({
        where: { rawMaterialLogId: In(logIds), isActive: true },
      }),
    ]);
    return { debts, payments };
  }
}
