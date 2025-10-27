import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Debt } from 'src/financial/debt/entities/debt.entity';
import { Payment } from 'src/financial/payment/entities/payment.entity';
import { Client } from 'src/party/client/entities/client.entity';
import { ProductBatch } from 'src/product/product-batch/entities/product-batch.entity';
import { ProductLog } from 'src/product/product-log/entities/product-log.entity';
import { Product } from 'src/product/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';

import { TransactionProductBatch } from './entities/transaction-product-batch.entity';
import { TransactionProduct } from './entities/transaction-product.entity';
import { Transaction } from './entities/transaction.entity';

import { TransactionController } from './transaction.controller';

// Facade
import { TransactionService } from './services/transaction.service';

// Sub-services
import { TransactionBaseService } from './services/transaction-base.service';
import { TransactionCreateService } from './services/transaction-create.service';
import { TransactionFindAllService } from './services/transaction-find-all.service';
import { TransactionFindOneService } from './services/transaction-find-one.service';
import { TransactionRemoveService } from './services/transaction-remove.service';
import { TransactionUpdateService } from './services/transaction-update.service';
import { TransactionRevertService } from './services/transaction-revert.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      TransactionProduct,
      TransactionProductBatch,
      Product,
      ProductBatch,
      ProductLog,
      Debt,
      Payment,
      Client,
      User,
    ]),
  ],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    TransactionBaseService,
    TransactionCreateService,
    TransactionFindAllService,
    TransactionFindOneService,
    TransactionUpdateService,
    TransactionRemoveService,
    TransactionRevertService,
  ],
  exports: [TransactionService],
})
export class TransactionModule {}
