// src/transaction/services/transaction-find-one.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionResult, assertUuid } from '../helper';
import { TransactionBaseService } from './transaction-base.service';

@Injectable()
export class TransactionFindOneService extends TransactionBaseService {
  async findOne(id: string): Promise<TransactionResult> {
    assertUuid(id, 'id');

    const tx = await this.txRepo.findOne({ where: { id, isActive: true } });
    if (!tx) throw new NotFoundException('Tranzaksiya topilmadi');

    const { debtByTx, payByTx, paidByTx, clientMap } =
      await this.aggregateFinanceForTxIds([id]);
    const productsByTx = await this.enrichProductsForTxIds([id]);

    return this.composeTxRow(tx, productsByTx, clientMap, {
      debtByTx,
      payByTx,
      paidByTx,
    });
  }
}
