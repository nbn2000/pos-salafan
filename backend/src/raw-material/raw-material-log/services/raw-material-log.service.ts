// src/raw-material/raw-material-log/services/raw-material-log.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationResult } from 'src/common/utils/pagination.util';

import { RawMaterialBatch } from 'src/raw-material/raw-material-batch/entities/raw-material-batch.entity';
import { RawMaterial } from 'src/raw-material/raw-material/entities/raw-material.entity';
import { RawMaterialLog } from '../entities/raw-material-log.entity';

import { CreateRawMaterialLogDto } from '../dto/create-raw-material-log.dto';
import { UpdateRawMaterialLogDto } from '../dto/update-raw-material-log.dto';

import {
  RawMaterialLogDeletedResult,
  RawMaterialLogListResult,
  RawMaterialLogResult,
} from '../helper';

import { RawMaterialLogBaseService } from './raw-material-log-base.service';
import { RawMaterialLogCreateService } from './raw-material-log-create.service';
import { RawMaterialLogFindAllService } from './raw-material-log-find-all.service';
import { RawMaterialLogFindLogsService } from './raw-material-log-find-logs.service';
import { RawMaterialLogFindOneService } from './raw-material-log-find-one.service';
import { RawMaterialLogRemoveService } from './raw-material-log-remove.service';
import { RawMaterialLogUpdateService } from './raw-material-log-update.service';
import { RawMaterialLogQueryDto } from '../dto/raw-material-log-query.dto';

@Injectable()
export class RawMaterialLogService extends RawMaterialLogBaseService {
  constructor(
    @InjectRepository(RawMaterialLog) repo: Repository<RawMaterialLog>,
    @InjectRepository(RawMaterial) rawRepo: Repository<RawMaterial>,
    @InjectRepository(RawMaterialBatch)
    batchRepo: Repository<RawMaterialBatch>,

    // sub-services
    private readonly creator: RawMaterialLogCreateService,
    private readonly finderAll: RawMaterialLogFindAllService,
    private readonly finderOneSvc: RawMaterialLogFindOneService,
    private readonly updater: RawMaterialLogUpdateService,
    private readonly remover: RawMaterialLogRemoveService,
    private readonly listFinder: RawMaterialLogFindLogsService,
  ) {
    super(repo, rawRepo, batchRepo);
  }

  // --- Facade: same public API as your original service ---

  create(dto: CreateRawMaterialLogDto): Promise<RawMaterialLogResult> {
    return this.creator.create(dto);
  }

  findAll(
    query: RawMaterialLogQueryDto,
  ): Promise<PaginationResult<RawMaterialLogResult>> {
    return this.finderAll.findAll(query);
  }

  findOne(id: string): Promise<RawMaterialLogResult> {
    return this.finderOneSvc.findOne(id);
  }

  update(
    id: string,
    dto: UpdateRawMaterialLogDto,
  ): Promise<RawMaterialLogResult> {
    return this.updater.update(id, dto);
  }

  remove(id: string): Promise<RawMaterialLogDeletedResult> {
    return this.remover.remove(id);
  }

  findLogs(query: import('../dto/raw-material-log-query.dto').RawMaterialLogQueryDto): Promise<RawMaterialLogListResult> {
    return this.listFinder.findLogs(query);
  }
}
