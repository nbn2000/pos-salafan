// src/transaction/services/transaction.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Debt } from 'src/financial/debt/entities/debt.entity';
import { Payment } from 'src/financial/payment/entities/payment.entity';
import { Client } from 'src/party/client/entities/client.entity';
import { ProductBatch } from 'src/product/product-batch/entities/product-batch.entity';
import { ProductLog } from 'src/product/product-log/entities/product-log.entity';
import { Product } from 'src/product/product/entities/product.entity';

import { TransactionProductBatch } from '../entities/transaction-product-batch.entity';
import { TransactionProduct } from '../entities/transaction-product.entity';
import { Transaction } from '../entities/transaction.entity';

import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { TransactionQueryDto } from '../dto/transaction-query.dto';
import { TransactionPagedResult, TransactionResult } from '../helper';

import { TransactionBaseService } from './transaction-base.service';
import { TransactionCreateService } from './transaction-create.service';
import { TransactionFindAllService } from './transaction-find-all.service';
import { TransactionFindOneService } from './transaction-find-one.service';
import { TransactionRemoveService } from './transaction-remove.service';
import { TransactionUpdateService } from './transaction-update.service';
import { TransactionRevertService } from './transaction-revert.service';

@Injectable()
export class TransactionService extends TransactionBaseService {
  constructor(
    @InjectRepository(Transaction) txRepo: Repository<Transaction>,

    @InjectRepository(TransactionProduct)
    txProdRepo: Repository<TransactionProduct>,
    @InjectRepository(TransactionProductBatch)
    txProdBatchRepo: Repository<TransactionProductBatch>,

    @InjectRepository(Product) productRepo: Repository<Product>,
    @InjectRepository(ProductBatch) productBatchRepo: Repository<ProductBatch>,
    @InjectRepository(ProductLog) productLogRepo: Repository<ProductLog>,

    @InjectRepository(Payment) paymentRepo: Repository<Payment>,
    @InjectRepository(Debt) debtRepo: Repository<Debt>,
    @InjectRepository(Client) clientRepo: Repository<Client>,

    // sub-services
    private readonly creator: TransactionCreateService,
    private readonly finderAll: TransactionFindAllService,
    private readonly finderOneSvc: TransactionFindOneService,
    private readonly updater: TransactionUpdateService,
    private readonly remover: TransactionRemoveService,
    private readonly reverter: TransactionRevertService,
  ) {
    super(
      txRepo,
      txProdRepo,
      txProdBatchRepo,
      productRepo,
      productBatchRepo,
      productLogRepo,
      paymentRepo,
      debtRepo,
      clientRepo,
    );

    // wire callbacks where needed
    this.creator.findOne = (id: string) => this.findOne(id);
    this.updater.findOne = (id: string) => this.findOne(id);
    this.remover.findOne = (id: string) => this.findOne(id);
    this.reverter.findOne = (id: string) => this.findOne(id);
  }

  create(
    dto: CreateTransactionDto,
    actorUserId: string,
  ): Promise<TransactionResult> {
    return this.creator.create(dto, actorUserId);
  }

  findAll(query: TransactionQueryDto): Promise<TransactionPagedResult> {
    return this.finderAll.findAll(query);
  }

  findOne(id: string): Promise<TransactionResult> {
    return this.finderOneSvc.findOne(id);
  }

  update(id: string): Promise<TransactionResult> {
    return this.updater.update(id);
  }

  remove(id: string): Promise<TransactionResult> {
    return this.remover.remove(id);
  }
  revert(id: string, actorUserId: string): Promise<TransactionResult> {
    return this.reverter.revert(id, actorUserId);
  }
}
