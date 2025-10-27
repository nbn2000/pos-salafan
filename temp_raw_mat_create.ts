// src/raw-material/raw-material/services/raw-material-create.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentType } from 'src/common/enums/enum';
import { Debt } from 'src/financial/debt/entities/debt.entity';
import { Payment } from 'src/financial/payment/entities/payment.entity';
import { RawMaterialBatch } from '../../raw-material-batch/entities/raw-material-batch.entity';
import { RawMaterialLog } from '../../raw-material-log/entities/raw-material-log.entity';
import { RawMaterial } from '../entities/raw-material.entity';
import { assertUuid, normalizeBatch, RawMaterialResult, safeParseJson, toRawMaterialResult } from '../helper';
import { CreateRawMaterialCombinedDto } from '../dto/create-raw-material.dto';
import { RawMaterialBaseService } from './raw-material-base.service';

@Injectable()
export class RawMaterialCreateService extends RawMaterialBaseService {
  async createWithBatchAndFinance(
    dto: CreateRawMaterialCombinedDto,
    _files: Express.Multer.File[] | undefined,
    actorUserId: string | undefined,
  ): Promise<RawMaterialResult> {
    assertUuid(dto.supplierId, 'supplierId');
    if (!actorUserId) throw new BadRequestException('Foydalanuvchi IDsi talab qilinadi');
    assertUuid(actorUserId, 'userId (token)');

    const rawBatchUnknown: unknown = typeof dto.batch === 'string' ? safeParseJson(dto.batch, 'batch') : dto.batch;
    const batch = normalizeBatch(rawBatchUnknown as Record<string, unknown>);

    const [supplier, user] = await Promise.all([
      this.supplierRepo.findOne({ where: { id: dto.supplierId, isActive: true } }),
      this.userRepo.findOne({ where: { id: actorUserId, isActive: true } }),
    ]);
    if (!supplier) throw new BadRequestException('Taâ€™minotchi topilmadi');
    if (!user) throw new BadRequestException('Foydalanuvchi topilmadi');

    const paid = Number(dto.paid ?? 0);
    if (!isFinite(batch.amount) || batch.amount <= 0)
      throw new BadRequestException('Batch miqdori 0 dan katta boâ€™lishi kerak');
    if (!isFinite(batch.buyPrice) || batch.buyPrice <= 0)
      throw new BadRequestException('Olish narxi 0 dan katta boâ€™lishi kerak');
    if (paid < 0) throw new BadRequestException('Toâ€™langan summa manfiy boâ€™lishi mumkin emas');

    const result = Number(batch.buyPrice) * Number(batch.amount);
    if (paid > result) throw new BadRequestException('Toâ€™langan summa umumiy xarajatdan oshib ketgan');

    const savedRaw = await this.repo.manager.transaction(async (em) => {
      const rawRepo = em.getRepository(RawMaterial);
      const batchRepo = em.getRepository(RawMaterialBatch);
      const logRepo = em.getRepository(RawMaterialLog);
      const paymentRepo = em.getRepository(Payment);
      const debtRepo = em.getRepository(Debt);

      const rawSaved = await rawRepo.save(
        rawRepo.create({ name: dto.name, type: dto.type }),
      );

      const batchSaved = await batchRepo.save(
        batchRepo.create({ rawMaterialId: rawSaved.id, amount: Number(batch.amount), buyPrice: Number(batch.buyPrice) }),
      );

      const comment =
        `â€œ${rawSaved.name}â€ nomli xomashyo yaratildi va birinchi partiya qoâ€™shildi: ` +
        `miqdor=${batch.amount}, narx=${batch.buyPrice}`;
      const logSaved = await logRepo.save(
        logRepo.create({ rawMaterialId: rawSaved.id, rawMaterialBatchId: batchSaved.id, comment }),
      );

      const debtAmount = result - paid;
      const pType = dto.paymentType ?? PaymentType.CASH;

      if (paid > 0) {
        await paymentRepo.save(
          paymentRepo.create({
            amount: paid,
            from: actorUserId,
            to: dto.supplierId,
            comment: `Xomashyo "${rawSaved.name}" uchun toâ€™lov, miqdor=${batch.amount}, umumiy: ${result}`,
            transactionId: null,
            rawMaterialLogId: logSaved.id,
            paymentType: pType,
          }),
        );
      }

      if (debtAmount > 0) {
        await debtRepo.save(
          debtRepo.create({
            amount: debtAmount,
            from: dto.supplierId,
            to: actorUserId,
            comment: `Xomashyo "${rawSaved.name}" uchun qarz, miqdor=${batch.amount}, qoldiq: ${debtAmount}`,
            transactionId: null,
            rawMaterialLogId: logSaved.id,
            paymentType: pType,
          }),
        );
      }

      return rawSaved;
    });

    return toRawMaterialResult(savedRaw);
  }
}
