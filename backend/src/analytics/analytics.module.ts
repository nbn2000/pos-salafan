// src/analytics/analytics.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalyticsController } from './analytics.controller';

// Facade
import { AnalyticsService } from './services/analytics.service';

// Sub-services
import { AnalyticsBalancesService } from './services/analytics-balances.service';
import { AnalyticsBaseService } from './services/analytics-base.service';
import { AnalyticsGrossProfitService } from './services/analytics-gross-profit.service';
import { AnalyticsSpendService } from './services/analytics-spend.service';
import { AnalyticsStockService } from './services/analytics-stock.service';

// Entities
import { TransactionProductBatch } from 'src/transaction/entities/transaction-product-batch.entity';
import { TransactionProduct } from 'src/transaction/entities/transaction-product.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';

import { ProductBatch } from 'src/product/product-batch/entities/product-batch.entity';
import { Product } from 'src/product/product/entities/product.entity';

import { RawMaterialBatch } from 'src/raw-material/raw-material-batch/entities/raw-material-batch.entity';
import { RawMaterial } from 'src/raw-material/raw-material/entities/raw-material.entity';

import { Debt } from 'src/financial/debt/entities/debt.entity';
import { Payment } from 'src/financial/payment/entities/payment.entity';

import { Client } from 'src/party/client/entities/client.entity';
import { Supplier } from 'src/party/supplier/entities/supplier.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      TransactionProduct,
      TransactionProductBatch,

      Product,
      ProductBatch,

      RawMaterial,
      RawMaterialBatch,

      Payment,
      Debt,

      Client,
      Supplier,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [
    // Facade
    AnalyticsService,

    // Sub-services
    AnalyticsBaseService,
    AnalyticsBalancesService,
    AnalyticsGrossProfitService,
    AnalyticsSpendService,
    AnalyticsStockService,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
