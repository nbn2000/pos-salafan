// src/sale/sale.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductBatch } from 'src/product/product-batch/entities/product-batch.entity';
import { Product } from 'src/product/product/entities/product.entity';

import { SaleController } from './sale.controller';

// Facade + sub-services
import { SaleBaseService } from './services/sale-base.service';
import { SaleFindAllService } from './services/sale-find-all.service';
import { SaleFindOneService } from './services/sale-find-one.service';
import { SaleService } from './services/sale.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductBatch])],
  controllers: [SaleController],
  providers: [
    // Facade
    SaleService,
    // Sub-services
    SaleBaseService,
    SaleFindAllService,
    SaleFindOneService,
  ],
  exports: [SaleService],
})
export class SaleModule {}
