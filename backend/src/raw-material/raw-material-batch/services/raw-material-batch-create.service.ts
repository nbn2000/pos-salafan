// src/raw-material/raw-material-batch/services/raw-material-batch-create.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentType } from 'src/common/enums/enum';
import { Debt } from 'src/financial/debt/entities/debt.entity';
import { Payment } from 'src/financial/payment/entities/payment.entity';
import { RawMaterialLog } from '../../raw-material-log/entities/raw-material-log.entity';
import { CreateRawMaterialBatchDto } from '../dto/create-raw-material-batch.dto';
import { RawMaterialBatch } from '../entities/raw-material-batch.entity';
import { RawMaterialBatchResult, toBatchResult } from '../helper';
import { RawMaterialBatchBaseService } from './raw-material-batch-base.service';
import { RawMaterialLogType } from 'src/common/enums/enum';

@Injectable()
export class RawMaterialBatchCreateService extends RawMaterialBatchBaseService {
  async create(
    rawMaterialId: string,
    dto: CreateRawMaterialBatchDto,
    actorUserId: string,
  ): Promise<RawMaterialBatchResult> {
    const rawMaterial = await this.getActiveRawOrThrow(rawMaterialId);

    const [supplier, user] = await Promise.all([
      this.supplierRepo.findOne({
        where: { id: dto.supplierId, isActive: true },
      }),
      this.userRepo.findOne({ where: { id: actorUserId, isActive: true } }),
    ]);
    if (!supplier) throw new BadRequestException('Ta’minotchi topilmadi');
    if (!user) throw new BadRequestException('Foydalanuvchi topilmadi');

    if (dto.amount <= 0)
      throw new BadRequestException('miqdor 0 dan katta bo‘lishi kerak');
    if (dto.buyPrice <= 0)
      throw new BadRequestException('buyPrice 0 dan katta bo‘lishi kerak');

    const paid = Number(dto.paid ?? 0);
    if (paid < 0)
      throw new BadRequestException('To‘langan summa manfiy bo‘lishi mumkin emas');

    const total = Number(dto.buyPrice) * Number(dto.amount);
    if (paid > total) {
      throw new BadRequestException(
        'To‘lov umumiy partiya qiymatidan oshib ketmoqda',
      );
    }
    if (paid > 0 && !dto.paymentType)
      throw new BadRequestException('To‘lov turi talab qilinadi (paid > 0)');

    const saved = await this.repo.manager.transaction(async (em) => {
      const batchRepo = em.getRepository(RawMaterialBatch);
      const logRepo = em.getRepository(RawMaterialLog);
      const paymentRepo = em.getRepository(Payment);
      const debtRepo = em.getRepository(Debt);

      const entity = batchRepo.create({ ...dto, rawMaterialId });
      const batchSaved = await batchRepo.save(entity);

      const comment =
        `${rawMaterial.name} xomashyosi uchun YANGI partiya qo‘shildi: ` +
        `miqdor=${dto.amount}, narx=${dto.buyPrice}`;

      const logEntity = logRepo.create({
        rawMaterialId,
        rawMaterialBatchId: batchSaved.id,
        comment,
        type: RawMaterialLogType.ADD_BATCH,
      });
      const logSaved = await logRepo.save(logEntity);

      const debtAmount = total - paid;

      if (paid > 0) {
        const payment = paymentRepo.create({
          amount: paid,
          from: actorUserId,
          to: dto.supplierId,
          comment: `Xomashyo partiyasi uchun to‘lov (xomashyo=${rawMaterial.name}, miqdor=${dto.amount}) jami: ${total}`,
          transactionId: null,
          rawMaterialLogId: logSaved.id,
          paymentType: dto.paymentType as PaymentType,
        });
        await paymentRepo.save(payment);
      }

      if (debtAmount > 0) {
        const debtEntity = debtRepo.create({
          amount: debtAmount,
          from: dto.supplierId,
          to: actorUserId,
          comment: `Xomashyo partiyasi uchun qarz (xomashyo=${rawMaterial.name}, miqdor=${dto.amount}) qoldiq: ${debtAmount}`,
          transactionId: null,
          rawMaterialLogId: logSaved.id,
        });
        await debtRepo.save(debtEntity);
      }

      return batchSaved;
    });

    return toBatchResult(saved);
  }
}
