import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

@Injectable()
export class AnalyticsBaseService {
  constructor(
    // Transactions
    @InjectRepository(Transaction)
    protected readonly txRepo: Repository<Transaction>,
    @InjectRepository(TransactionProduct)
    protected readonly txProdRepo: Repository<TransactionProduct>,
    @InjectRepository(TransactionProductBatch)
    protected readonly txProdBatchRepo: Repository<TransactionProductBatch>,

    // Products
    @InjectRepository(Product)
    protected readonly productRepo: Repository<Product>,
    @InjectRepository(ProductBatch)
    protected readonly productBatchRepo: Repository<ProductBatch>,

    // Raw materials
    @InjectRepository(RawMaterial)
    protected readonly rawRepo: Repository<RawMaterial>,
    @InjectRepository(RawMaterialBatch)
    protected readonly rawBatchRepo: Repository<RawMaterialBatch>,

    // Finance

    @InjectRepository(Payment)
    protected readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Debt)
    protected readonly debtRepo: Repository<Debt>,

    // Parties
    @InjectRepository(Client)
    protected readonly clientRepo: Repository<Client>,
    @InjectRepository(Supplier)
    protected readonly supplierRepo: Repository<Supplier>,
  ) {}

  /** Reads the numeric total column from `getRawOne` responses. */
  protected num(row?: { total?: string | null }): number {
    return Number(row?.total ?? 0);
  }
}
