// src/raw-material/raw-material-batch/services/raw-material-batch-update.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateRawMaterialBatchDto } from '../dto/update-raw-material-batch.dto';
import { RawMaterialBatchResult, toBatchResult } from '../helper';
import { RawMaterialBatchBaseService } from './raw-material-batch-base.service';
import { RawMaterialLogType } from 'src/common/enums/enum';

@Injectable()
export class RawMaterialBatchUpdateService extends RawMaterialBatchBaseService {
  async update(
    id: string,
    rawMaterialId: string,
    dto: UpdateRawMaterialBatchDto,
  ): Promise<RawMaterialBatchResult> {
    const entity = await this.getActiveBatchOrThrow(id);

    // Take a snapshot BEFORE applying any changes
    const prevRawMaterialId: string = entity.rawMaterialId;
    const prevAmount: number = Number(entity.amount);
    const prevBuyPrice: number = Number(entity.buyPrice);

    // Validate and apply raw material change (param), DTO does NOT carry rawMaterialId
    if (rawMaterialId && rawMaterialId !== prevRawMaterialId) {
      try {
        await this.getActiveRawOrThrow(rawMaterialId);
      } catch {
        // keep legacy BadRequest message
        throw new BadRequestException('Xomashyo topilmadi');
      }
      entity.rawMaterialId = rawMaterialId;
    }

    // If attempting to change amount or buyPrice, ensure there is no outstanding debt tied to this batch
    const wantsChangeAmount = dto.amount !== undefined && Number(dto.amount) !== prevAmount;
    const wantsChangePrice = dto.buyPrice !== undefined && Number(dto.buyPrice) !== prevBuyPrice;

    if (wantsChangeAmount || wantsChangePrice) {
      const logs = await this.logRepo.find({
        where: { rawMaterialBatchId: id, isActive: true },
        select: ['id'],
      });
      const logIds = logs.map((l) => l.id);
      if (logIds.length) {
        const { debts, payments } = await this.loadFinanceByLogIds(logIds);
        const debtSum = this.sumAmounts(debts);
        const paymentSum = this.sumAmounts(payments);
        const outstanding = debtSum - paymentSum;
        if (outstanding > 1e-9) {
          throw new BadRequestException(
            'Qarz mavjud bo\'lsa partiya miqdori yoki narxini o\'zgartirib bo\'lmaydi',
          );
        }
      }
    }

    // Apply other mutable fields from DTO explicitly (no unsafe Object.assign for unknown keys)
    if (dto.amount !== undefined) entity.amount = dto.amount;
    if (dto.buyPrice !== undefined) entity.buyPrice = dto.buyPrice;
 

    const saved = await this.repo.save(entity);

    // Build human-friendly diff comment (UZ)
    const changes: string[] = [];

    if (rawMaterialId && rawMaterialId !== prevRawMaterialId) {
      const [oldRaw, newRaw] = await Promise.all([
        this.rawRepo.findOne({
          where: { id: prevRawMaterialId },
          withDeleted: true,
        }),
        this.rawRepo.findOne({
          where: { id: saved.rawMaterialId },
          withDeleted: true,
        }),
      ]);
      const oldName = oldRaw?.name ?? prevRawMaterialId;
      const newName = newRaw?.name ?? saved.rawMaterialId;
      changes.push(`xomashyo: «${oldName}» -> «${newName}»`);
    }

    if (dto.amount !== undefined && Number(dto.amount) !== prevAmount) {
      changes.push(`miqdor: ${prevAmount} -> ${dto.amount}`);
    }
    if (dto.buyPrice !== undefined && Number(dto.buyPrice) !== prevBuyPrice) {
      changes.push(`narx: ${prevBuyPrice} -> ${dto.buyPrice}`);
    }


    if (changes.length) {
      const comment = `Partiya tahrirlandi (id=${saved.id}): ${changes.join(', ')}`;
      await this.logRepo.save(
        this.logRepo.create({
          rawMaterialId: saved.rawMaterialId,
          rawMaterialBatchId: saved.id,
          comment,
          type: RawMaterialLogType.CHANGE_BATCH,
        }),
      );
    }

    return toBatchResult(saved);
  }
}
