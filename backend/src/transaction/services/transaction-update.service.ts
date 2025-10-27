import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionResult, assertUuid } from '../helper'; // ✅ add assertUuid
import { TransactionBaseService } from './transaction-base.service';

@Injectable()
export class TransactionUpdateService extends TransactionBaseService {
  public findOne!: (id: string) => Promise<TransactionResult>;

  async update(id: string): Promise<TransactionResult> {
    assertUuid(id, 'id');
    const tx = await this.txRepo.findOne({ where: { id, isActive: true } });
    if (!tx) throw new NotFoundException('Tranzaksiya topilmadi');

    const saved = await this.txRepo.save(tx);
    return this.findOne(saved.id);
  }
}
