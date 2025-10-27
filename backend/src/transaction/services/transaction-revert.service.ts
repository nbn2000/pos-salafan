import {
    BadRequestException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { EntityManager } from 'typeorm';
  
  import { Transaction } from '../entities/transaction.entity';
  import { TransactionProductBatch } from '../entities/transaction-product-batch.entity';
  import { TransactionProduct } from '../entities/transaction-product.entity';
  import { ProductBatch } from 'src/product/product-batch/entities/product-batch.entity';
  import { ProductLog } from 'src/product/product-log/entities/product-log.entity';
  import { Payment } from 'src/financial/payment/entities/payment.entity';
  import { Debt } from 'src/financial/debt/entities/debt.entity';
  import { TransactionResult, assertUuid } from '../helper';
  import { TransactionBaseService } from './transaction-base.service';
  
  @Injectable()
  export class TransactionRevertService extends TransactionBaseService {
    public findOne!: (id: string) => Promise<TransactionResult>;
  
    async revert(id: string, actorUserId: string): Promise<TransactionResult> {
      assertUuid(id, 'id');
      this.getActiveUserOrThrow(actorUserId);
  
      const tx = await this.txRepo.findOne({ where: { id, isActive: true } });
      if (!tx) throw new NotFoundException('Tranzaksiya topilmadi');
      if (tx.isReversed)
        throw new BadRequestException('Tranzaksiya allaqachon bekor qilingan');
  
      const resultId = await this.txRepo.manager.transaction(
        async (em: EntityManager) => {
          const txRepo = em.getRepository(Transaction);
          const tpbRepo = em.getRepository(TransactionProductBatch);
          const tpRepo = em.getRepository(TransactionProduct);
          const pBatchRepo = em.getRepository(ProductBatch);
          const pLogRepo = em.getRepository(ProductLog);
          const paymentRepo = em.getRepository(Payment);
          const debtRepo = em.getRepository(Debt);
  
          // 1) Restore warehouse batches from TPB
          const tpb = await tpbRepo.find({
            where: { transactionId: id },
            withDeleted: true,
            relations: ['productBatch', 'transactionProduct'],
            order: { createdAt: 'ASC' },
          });
  
          for (const row of tpb) {
            const pb =
              row.productBatch ??
              (await pBatchRepo.findOne({
                where: { id: row.productBatchId },
                withDeleted: true,
              }));
            if (!pb) {
              throw new NotFoundException(
                `Product batch not found for TPB ${row.id} (batchId=${row.productBatchId})`,
              );
            }
  
            const tp =
              row.transactionProduct ??
              (await tpRepo.findOne({
                where: { id: row.productId }, // TPB.productId -> TransactionProduct.id
                withDeleted: true,
              }));
  
            const add = Number(row.amount) || 0;
  
            pb.amount = Number(pb.amount || 0) + add;
            if (pb.isActive === false || pb.deletedAt) {
              pb.isActive = true;
              Object.assign(pb, { deletedAt: null });
            }
            await pBatchRepo.save(pb);
  
            await pLogRepo.save(
              pLogRepo.create({
                productId: tp?.productId ?? null,
                productBatchId: pb.id,
                comment: `Revert tx ${id}: ${add} qaytarildi`,
              }),
            );
  
            // prevent double-revert on the same row
            if (row.isActive) {
              row.isActive = false;
              row.deletedAt = new Date();
              await tpbRepo.save(row);
            }
          }
  
          // 2) Reverse finance: soft-delete original payments & debts
          const payments = await paymentRepo.find({
            where: { transactionId: id, isActive: true },
          });
          for (const p of payments) {
            p.isActive = false;
            p.deletedAt = new Date();
            await paymentRepo.save(p);
          }
  
          const debts = await debtRepo.find({
            where: { transactionId: id, isActive: true },
          });
          for (const d of debts) {
            d.isActive = false;
            d.deletedAt = new Date();
            await debtRepo.save(d);
          }
  
          // 3) Mark transaction reversed
          tx.isReversed = true;
          tx.reversedAt = new Date();
          await txRepo.save(tx);
  
          return tx.id;
        },
      );
  
      return this.findOne(resultId);
    }
  }
  