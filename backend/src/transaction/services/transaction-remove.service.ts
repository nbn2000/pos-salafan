import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionResult, assertUuid } from '../helper'; // ✅ add assertUuid
import { TransactionBaseService } from './transaction-base.service';

@Injectable()
export class TransactionRemoveService extends TransactionBaseService {
  public findOne!: (id: string) => Promise<TransactionResult>;

  async remove(id: string): Promise<TransactionResult> {
    assertUuid(id, 'id');
    const tx = await this.txRepo.findOne({ where: { id, isActive: true } });
    if (!tx) throw new NotFoundException('Tranzaksiya topilmadi');

    tx.isActive = false;
    tx.deletedAt = new Date();
    const saved = await this.txRepo.save(tx);
    return this.findOne(saved.id);
  }
}
