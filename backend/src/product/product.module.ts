// src/product/product.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductBatch } from './product-batch/entities/product-batch.entity';
import { ProductLog } from './product-log/entities/product-log.entity';
import { Product } from './product/entities/product.entity';

import { ProductController } from './product/product.controller';
import { ProductBaseService } from './product/services/product-base.service';
import { ProductCreateService } from './product/services/product-create.service';
import { ProductFindAllService } from './product/services/product-find-all.service';
import { ProductFindOneService } from './product/services/product-find-one.service';
import { ProductRemoveService } from './product/services/product-remove.service';
import { ProductUpdateService } from './product/services/product-update.service';
import { ProductService } from './product/services/product.service';

import { ProductBatchController } from './product-batch/product-batch.controller';
import { ProductBatchBaseService } from './product-batch/services/product-batch-base.service';
import { ProductBatchCreateService } from './product-batch/services/product-batch-create.service';
import { ProductBatchFindAllService } from './product-batch/services/product-batch-find-all.service';
import { ProductBatchFindByProductService } from './product-batch/services/product-batch-find-by-product.service';
import { ProductBatchFindOneService } from './product-batch/services/product-batch-find-one.service';
import { ProductBatchRemoveService } from './product-batch/services/product-batch-remove.service';
import { ProductBatchUpdateService } from './product-batch/services/product-batch-update.service';
import { ProductBatchService } from './product-batch/services/product-batch.service';

import { ProductLogController } from './product-log/product-log.controller';
import { ProductLogBaseService } from './product-log/services/product-log-base.service';
import { ProductLogFindAllService } from './product-log/services/product-log-find-all.service';
import { ProductLogFindOneService } from './product-log/services/product-log-find-one.service';
import { ProductLogRemoveService } from './product-log/services/product-log-remove.service';
import { ProductLogService } from './product-log/services/product-log.service';
import { ProductLogFindLogsService } from './product-log/services/product-log-find-logs.service';

// Recipe, assembler, and image modules removed

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductBatch, ProductLog]),
  ],
  controllers: [
    ProductController,
    ProductBatchController,
    ProductLogController,
  ],
  providers: [
    // === Product
    ProductService,
    ProductBaseService,
    ProductCreateService,
    ProductFindAllService,
    ProductFindOneService,
    ProductUpdateService,
    ProductRemoveService,

    // === ProductBatch
    ProductBatchService,
    ProductBatchBaseService,
    ProductBatchCreateService,
    ProductBatchFindAllService,
    ProductBatchFindOneService,
    ProductBatchFindByProductService,
    ProductBatchUpdateService,
    ProductBatchRemoveService,

    // === ProductLog
    ProductLogService,
    ProductLogBaseService,
    ProductLogFindAllService,
    ProductLogFindOneService,
    ProductLogRemoveService,
    ProductLogFindLogsService,

  ],
  exports: [
    ProductService,
    ProductBatchService,
    ProductLogService,
  ],
})
export class ProductModule {}
