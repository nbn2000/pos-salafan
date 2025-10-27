// src/party/party.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Debt } from 'src/financial/debt/entities/debt.entity';
import { Payment } from 'src/financial/payment/entities/payment.entity';
import { Product } from 'src/product/product/entities/product.entity';
import { RawMaterialBatch } from 'src/raw-material/raw-material-batch/entities/raw-material-batch.entity';
import { RawMaterialLog } from 'src/raw-material/raw-material-log/entities/raw-material-log.entity';
import { RawMaterial } from 'src/raw-material/raw-material/entities/raw-material.entity';
import { TransactionProductBatch } from 'src/transaction/entities/transaction-product-batch.entity';
import { TransactionProduct } from 'src/transaction/entities/transaction-product.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';

import { ClientController } from './client/client.controller';
import { Client } from './client/entities/client.entity';

// Client services
import { ClientCreateService } from './client/services/client-create.service';
import { ClientFinanceAllService } from './client/services/client-finance-all.service';
import { ClientFinanceOneService } from './client/services/client-finance-one.service';
import { ClientFindAllService } from './client/services/client-find-all.service';
import { ClientFindOneService } from './client/services/client-find-one.service';
import { ClientRemoveService } from './client/services/client-remove.service';
import { ClientUpdateService } from './client/services/client-update.service';
import { ClientWithDebtsService } from './client/services/client-with-debts.service';
import { ClientService } from './client/services/client.service';

import { Supplier } from './supplier/entities/supplier.entity';
import { SupplierController } from './supplier/supplier.controller';

// Supplier services

import { SupplierCreateService } from './supplier/services/supplier-create.service';
import { SupplierFinanceAllService } from './supplier/services/supplier-finance-all.service';
import { SupplierFinanceOneService } from './supplier/services/supplier-finance-one.service';
import { SupplierFindAllService } from './supplier/services/supplier-find-all.service';
import { SupplierFindOneService } from './supplier/services/supplier-find-one.service';
import { SupplierRemoveService } from './supplier/services/supplier-remove.service';
import { SupplierUpdateService } from './supplier/services/supplier-update.service';
import { SupplierService } from './supplier/services/supplier.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      Debt,
      Transaction,
      TransactionProduct,
      TransactionProductBatch,
      Product,
      Client,
      Supplier,
      RawMaterial,
      RawMaterialBatch,
      RawMaterialLog,
    ]),
  ],
  controllers: [ClientController, SupplierController],
  providers: [
    // Client
    ClientService,
    ClientCreateService,
    ClientFindAllService,
    ClientFindOneService,
    ClientUpdateService,
    ClientRemoveService,
    ClientFinanceOneService,
    ClientFinanceAllService,
    ClientWithDebtsService,

    // Supplier
    SupplierService,
    SupplierCreateService,
    SupplierFindAllService,
    SupplierFindOneService,
    SupplierUpdateService,
    SupplierRemoveService,
    SupplierFinanceOneService,
    SupplierFinanceAllService,
  ],
  exports: [ClientService, SupplierService],
})
export class PartyModule {}
