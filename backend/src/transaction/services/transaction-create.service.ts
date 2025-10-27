import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { Transaction } from '../entities/transaction.entity';
import { TransactionResult } from '../helper';
import { TransactionBaseService } from './transaction-base.service';
// ✅ add these
import { Debt } from 'src/financial/debt/entities/debt.entity';
import { Payment } from 'src/financial/payment/entities/payment.entity';

@Injectable()
export class TransactionCreateService extends TransactionBaseService {
  public findOne!: (id: string) => Promise<TransactionResult>;

  async create(
    dto: CreateTransactionDto,
    actorUserId: string,
  ): Promise<TransactionResult> {
    const hasProducts = Array.isArray(dto.products) && dto.products.length > 0;
    if (!hasProducts) {
      throw new BadRequestException('Kamida bitta mahsulot berilishi shart.');
    }

    await this.getActiveClientOrThrow(dto.clientId);
    // 🔧 now sync; no await needed (but leaving await is harmless)
    this.getActiveUserOrThrow(actorUserId);

    const resolvedProducts = await this.resolveProducts(dto.products ?? []);

    const paid = Number(dto.paid ?? 0);
    if (paid < 0) {
      throw new BadRequestException(
        'To‘langan summalar manfiy bo‘lishi mumkin emas',
      );
    }

    const savedTx = await this.txRepo.manager.transaction(
      async (em: EntityManager) => {
        const txRepo = em.getRepository(Transaction);

        const txEntity = txRepo.create({
          totalSoldPrice: 0,
          comment: dto.comment ?? null,
        });
        const txSaved = await txRepo.save(txEntity);

        const totalProducts = await this.consumeProductsFIFO(
          em,
          txSaved,
          resolvedProducts,
        );

        const totalShouldPay = Number(totalProducts.toFixed(6));
        txSaved.totalSoldPrice = totalShouldPay;
        await txRepo.save(txSaved);

        if (paid - totalShouldPay > 1e-9) {
          throw new BadRequestException(
            'To‘langan summa jami sotuv narxidan oshib ketgan',
          );
        }

        // ✅ typed repos (fixes no-unsafe-* on repo usage)
        const paymentRepo = em.getRepository(Payment);
        const debtRepo = em.getRepository(Debt);

        if (paid > 0) {
          await paymentRepo.save(
            paymentRepo.create({
              amount: paid,
              from: dto.clientId,
              to: actorUserId,
              comment:
                dto.comment ?? `Sotuv tranzaksiyasi uchun to‘lov ${txSaved.id}`,
              transactionId: txSaved.id,
              rawMaterialLogId: null,
            }),
          );
        }

        const remainingAmount = Math.max(0, totalShouldPay - paid);
        if (remainingAmount > 1e-2) {
          await debtRepo.save(
            debtRepo.create({
              amount: Number(remainingAmount.toFixed(4)),
              from: dto.clientId,
              to: actorUserId,
              comment:
                dto.comment ??
                `Sotuv tranzaksiyasi uchun qarz ${txSaved.id} (qolgan qismi)`,
              transactionId: txSaved.id,
              rawMaterialLogId: null,
            }),
          );
        }

        return txSaved;
      },
    );

    return this.findOne(savedTx.id);
  }
}
