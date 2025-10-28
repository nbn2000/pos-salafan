// src/raw-material/raw-material/services/raw-material.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

import { Debt } from 'src/financial/debt/entities/debt.entity';
import { Payment } from 'src/financial/payment/entities/payment.entity';
import { Supplier } from 'src/party/supplier/entities/supplier.entity';
import { User } from 'src/user/entities/user.entity';

import { RawMaterialBatch } from '../../raw-material-batch/entities/raw-material-batch.entity';
import { RawMaterialLog } from '../../raw-material-log/entities/raw-material-log.entity';
import { RawMaterial } from '../entities/raw-material.entity';

import {
  CreateRawMaterialOptions,
  RawMaterialDeletedResult,
  RawMaterialResult,
  RawWithBatchesResult,
  RawMaterialRefillItem,
  RawMaterialPagedWithTotals,
  RawWithBatchesPagedWithTotals,
} from '../helper';

// ✓ bring DTOs from the right module
import { CreateRawMaterialCombinedDto } from '../dto/create-raw-material.dto';
import { UpdateRawMaterialDto } from '../dto/update-raw-material.dto';
import { RawMaterialQueryDto } from '../dto/raw-material-query.dto';

import { RawMaterialBaseService } from './raw-material-base.service';
import { RawMaterialCreateService } from './raw-material-create.service';
import { RawMaterialFindAllWithBatchesService } from './raw-material-find-all-with-batches.service';
import { RawMaterialFindAllService } from './raw-material-find-all.service';
import { RawMaterialFindOneWithBatchesService } from './raw-material-find-one-with-batches.service';
import { RawMaterialFindOneService } from './raw-material-find-one.service';
import { RawMaterialGetOptionsService } from './raw-material-get-options.service';
import { RawMaterialRemoveService } from './raw-material-remove.service';
import { RawMaterialUpdateService } from './raw-material-update.service';
import { RawMaterialFindToRefillService } from './raw-material-find-to-refill.service';

@Injectable()
export class RawMaterialService extends RawMaterialBaseService {
  constructor(
    @InjectRepository(RawMaterial) repo: Repository<RawMaterial>,
    @InjectRepository(RawMaterialBatch) batchRepo: Repository<RawMaterialBatch>,
    @InjectRepository(RawMaterialLog) logRepo: Repository<RawMaterialLog>,
    @InjectRepository(Debt) debtRepo: Repository<Debt>,
    @InjectRepository(Payment) paymentRepo: Repository<Payment>,
    @InjectRepository(Supplier) supplierRepo: Repository<Supplier>,
    @InjectRepository(User) userRepo: Repository<User>,

    private readonly optionsSvc: RawMaterialGetOptionsService,
    private readonly creator: RawMaterialCreateService,
    private readonly finderAll: RawMaterialFindAllService,
    private readonly finderOneSvc: RawMaterialFindOneService,
    private readonly updater: RawMaterialUpdateService,
    private readonly remover: RawMaterialRemoveService,
    private readonly withBatchesAll: RawMaterialFindAllWithBatchesService,
    private readonly withBatchesOne: RawMaterialFindOneWithBatchesService,
    // NEW: refill checker service
    private readonly toRefillSvc: RawMaterialFindToRefillService,
  ) {
    super(
      repo,
      batchRepo,
      logRepo,
      debtRepo,
      paymentRepo,
      supplierRepo,
      userRepo,
    );
  }

  getCreateOptions(): Promise<CreateRawMaterialOptions> {
    return this.optionsSvc.getCreateOptions();
  }

  createWithBatchAndFinance(
    dto: CreateRawMaterialCombinedDto,
    files: Express.Multer.File[] | undefined,
    actorUserId: string | undefined,
  ): Promise<RawMaterialResult> {
    return this.creator.createWithBatchAndFinance(dto, files, actorUserId);
  }

  findAll(
    query: RawMaterialQueryDto,
  ): Promise<RawMaterialPagedWithTotals> {
    return this.finderAll.findAll(query);
  }

  findOne(id: string): Promise<RawMaterialResult> {
    return this.finderOneSvc.findOne(id);
  }

  // ✓ typed update DTO (fixes no-unsafe-argument)
  update(id: string, dto: UpdateRawMaterialDto): Promise<RawMaterialResult> {
    return this.updater.update(id, dto);
  }

  remove(id: string): Promise<RawMaterialDeletedResult> {
    return this.remover.remove(id);
  }

  findAllWithBatches(
    query: PaginationQueryDto,
  ): Promise<RawWithBatchesPagedWithTotals> {
    return this.withBatchesAll.findAllWithBatches(query);
  }

  findOneWithBatches(id: string): Promise<RawWithBatchesResult> {
    return this.withBatchesOne.findOneWithBatches(id);
  }

  // NEW: expose refill results
  findToRefillStore(): Promise<RawMaterialRefillItem[]> {
    return this.toRefillSvc.findToRefillStore();
  }
}
