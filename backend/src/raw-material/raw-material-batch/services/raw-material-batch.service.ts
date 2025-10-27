// src/raw-material/raw-material-batch/services/raw-material-batch.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { PaginationResult } from 'src/common/utils/pagination.util';

import { Debt } from 'src/financial/debt/entities/debt.entity';
import { Payment } from 'src/financial/payment/entities/payment.entity';
import { Supplier } from 'src/party/supplier/entities/supplier.entity';
import { User } from 'src/user/entities/user.entity';

import { RawMaterialLog } from '../../raw-material-log/entities/raw-material-log.entity';
import { RawMaterial } from '../../raw-material/entities/raw-material.entity';
import { RawMaterialBatch } from '../entities/raw-material-batch.entity';

import {
  RawMaterialBatchDeletedResult,
  RawMaterialBatchResult,
} from '../helper';

import { CreateRawMaterialBatchDto } from '../dto/create-raw-material-batch.dto';
import { UpdateRawMaterialBatchDto } from '../dto/update-raw-material-batch.dto';
import { RawMaterialBatchBaseService } from './raw-material-batch-base.service';
import { RawMaterialBatchCreateService } from './raw-material-batch-create.service';
import { RawMaterialBatchFindAllService } from './raw-material-batch-find-all.service';
import { RawMaterialBatchFindByRawService } from './raw-material-batch-find-by-raw.service';
import { RawMaterialBatchFindOneService } from './raw-material-batch-find-one.service';
import { RawMaterialBatchRemoveService } from './raw-material-batch-remove.service';
import { RawMaterialBatchUpdateService } from './raw-material-batch-update.service';

@Injectable()
export class RawMaterialBatchService extends RawMaterialBatchBaseService {
  constructor(
    @InjectRepository(RawMaterialBatch) repo: Repository<RawMaterialBatch>,
    @InjectRepository(RawMaterial) rawRepo: Repository<RawMaterial>,
    @InjectRepository(RawMaterialLog) logRepo: Repository<RawMaterialLog>,
    @InjectRepository(Debt) debtRepo: Repository<Debt>,
    @InjectRepository(Payment) paymentRepo: Repository<Payment>,
    @InjectRepository(Supplier) supplierRepo: Repository<Supplier>,
    @InjectRepository(User) userRepo: Repository<User>,

    // sub-services
    private readonly creator: RawMaterialBatchCreateService,
    private readonly finderAll: RawMaterialBatchFindAllService,
    private readonly finderOneSvc: RawMaterialBatchFindOneService,
    private readonly finderByRaw: RawMaterialBatchFindByRawService,
    private readonly updater: RawMaterialBatchUpdateService,
    private readonly remover: RawMaterialBatchRemoveService,
  ) {
    super(
      repo,
      rawRepo,
      logRepo,
      debtRepo,
      paymentRepo,
      supplierRepo,
      userRepo,
    );
  }

  // ------- Facade: same public API as your original service -------

  create(
    rawMaterialId: string,
    dto: CreateRawMaterialBatchDto,
    actorUserId: string,
  ): Promise<RawMaterialBatchResult> {
    return this.creator.create(rawMaterialId, dto, actorUserId);
  }

  findAll(
    query: PaginationQueryDto,
  ): Promise<PaginationResult<RawMaterialBatchResult>> {
    return this.finderAll.findAll(query);
  }

  findOne(id: string): Promise<RawMaterialBatchResult> {
    return this.finderOneSvc.findOne(id);
  }

  findByRawMaterial(
    rawMaterialId: string,
    query: PaginationQueryDto,
  ): Promise<PaginationResult<RawMaterialBatchResult>> {
    return this.finderByRaw.findByRawMaterial(rawMaterialId, query);
  }

  update(
    id: string,
    rawMaterialId: string,
    dto: UpdateRawMaterialBatchDto,
  ): Promise<RawMaterialBatchResult> {
    return this.updater.update(id, rawMaterialId, dto);
  }

  remove(id: string): Promise<RawMaterialBatchDeletedResult> {
    return this.remover.remove(id);
  }
}
