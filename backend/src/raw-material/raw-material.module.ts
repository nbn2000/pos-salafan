// src/raw-material/raw-material.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Debt } from 'src/financial/debt/entities/debt.entity';
import { Payment } from 'src/financial/payment/entities/payment.entity';
import { Supplier } from 'src/party/supplier/entities/supplier.entity';
import { User } from 'src/user/entities/user.entity';

import { RawMaterial } from './raw-material/entities/raw-material.entity';
import { RawMaterialController } from './raw-material/raw-material.controller';
import { RawMaterialBaseService } from './raw-material/services/raw-material-base.service';
import { RawMaterialCreateService } from './raw-material/services/raw-material-create.service';
import { RawMaterialFindAllWithBatchesService } from './raw-material/services/raw-material-find-all-with-batches.service';
import { RawMaterialFindAllService } from './raw-material/services/raw-material-find-all.service';
import { RawMaterialFindOneWithBatchesService } from './raw-material/services/raw-material-find-one-with-batches.service';
import { RawMaterialFindOneService } from './raw-material/services/raw-material-find-one.service';
import { RawMaterialGetOptionsService } from './raw-material/services/raw-material-get-options.service';
import { RawMaterialRemoveService } from './raw-material/services/raw-material-remove.service';
import { RawMaterialUpdateService } from './raw-material/services/raw-material-update.service';
import { RawMaterialService } from './raw-material/services/raw-material.service';
import { RawMaterialFindToRefillService } from './raw-material/services/raw-material-find-to-refill.service';

import { RawMaterialBatch } from './raw-material-batch/entities/raw-material-batch.entity';
import { RawMaterialBatchController } from './raw-material-batch/raw-material-batch.controller';
import { RawMaterialBatchBaseService } from './raw-material-batch/services/raw-material-batch-base.service';
import { RawMaterialBatchCreateService } from './raw-material-batch/services/raw-material-batch-create.service';
import { RawMaterialBatchFindAllService } from './raw-material-batch/services/raw-material-batch-find-all.service';
import { RawMaterialBatchFindByRawService } from './raw-material-batch/services/raw-material-batch-find-by-raw.service';
import { RawMaterialBatchFindOneService } from './raw-material-batch/services/raw-material-batch-find-one.service';
import { RawMaterialBatchRemoveService } from './raw-material-batch/services/raw-material-batch-remove.service';
import { RawMaterialBatchUpdateService } from './raw-material-batch/services/raw-material-batch-update.service';
import { RawMaterialBatchService } from './raw-material-batch/services/raw-material-batch.service';

import { RawMaterialLog } from './raw-material-log/entities/raw-material-log.entity';
import { RawMaterialLogController } from './raw-material-log/raw-material-log.controller';
import { RawMaterialLogBaseService } from './raw-material-log/services/raw-material-log-base.service';
import { RawMaterialLogCreateService } from './raw-material-log/services/raw-material-log-create.service';
import { RawMaterialLogFindAllService } from './raw-material-log/services/raw-material-log-find-all.service';
import { RawMaterialLogFindLogsService } from './raw-material-log/services/raw-material-log-find-logs.service';
import { RawMaterialLogFindOneService } from './raw-material-log/services/raw-material-log-find-one.service';
import { RawMaterialLogRemoveService } from './raw-material-log/services/raw-material-log-remove.service';
import { RawMaterialLogUpdateService } from './raw-material-log/services/raw-material-log-update.service';
import { RawMaterialLogService } from './raw-material-log/services/raw-material-log.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RawMaterial,
      RawMaterialBatch,
      RawMaterialLog,
      Debt,
      Payment,
      Supplier,
      User,
    ]),
  ],
  controllers: [
    RawMaterialController,
    RawMaterialBatchController,
    RawMaterialLogController,
  ],
  providers: [
    // Facades
    RawMaterialService,
    RawMaterialBatchService,
    RawMaterialLogService,

    // RawMaterial sub-services
    RawMaterialBaseService,
    RawMaterialCreateService,
    RawMaterialFindAllService,
    RawMaterialFindAllWithBatchesService,
    RawMaterialFindOneService,
    RawMaterialFindOneWithBatchesService,
    RawMaterialGetOptionsService,
    RawMaterialUpdateService,
    RawMaterialRemoveService,
    RawMaterialFindToRefillService, // NEW

    // RawMaterialBatch sub-services
    RawMaterialBatchBaseService,
    RawMaterialBatchCreateService,
    RawMaterialBatchFindAllService,
    RawMaterialBatchFindOneService,
    RawMaterialBatchFindByRawService,
    RawMaterialBatchUpdateService,
    RawMaterialBatchRemoveService,

    // RawMaterialLog sub-services
    RawMaterialLogBaseService,
    RawMaterialLogCreateService,
    RawMaterialLogFindAllService,
    RawMaterialLogFindOneService,
    RawMaterialLogFindLogsService,
    RawMaterialLogUpdateService,
    RawMaterialLogRemoveService,
  ],
  exports: [RawMaterialService, RawMaterialBatchService, RawMaterialLogService],
})
export class RawMaterialModule {}
