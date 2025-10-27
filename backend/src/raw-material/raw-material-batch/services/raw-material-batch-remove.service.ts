// src/raw-material/raw-material-batch/services/raw-material-batch-remove.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { RawMaterialBatchDeletedResult, toBatchResult } from '../helper';
import { RawMaterialLogType } from 'src/common/enums/enum';
import { RawMaterialBatchBaseService } from './raw-material-batch-base.service';

@Injectable()
export class RawMaterialBatchRemoveService extends RawMaterialBatchBaseService {
  async remove(id: string): Promise<RawMaterialBatchDeletedResult> {
    const entity = await this.repo.findOne({
      where: { id, isActive: true },
      relations: ['rawMaterial'],
    });
    if (!entity)
      throw new (await import('@nestjs/common')).NotFoundException(
        'Xomashyo partiyasi topilmadi',
      );

    const remaining = Number(entity.amount);
    if (remaining > 0) {
      throw new BadRequestException(
        `Partiya ${id} ni o‘chirish mumkin emas: qolgan zaxira ${remaining}. Avval nolga tushiring yoki sozlang.`,
      );
    }

    const logs = await this.logRepo.find({
      where: { rawMaterialBatchId: id, isActive: true },
      select: ['id'],
    });
    const logIds = logs.map((l) => l.id);

    if (logIds.length) {
      const { debts, payments } = await this.loadFinanceByLogIds(logIds);
      const debtSum = this.sumAmounts(debts);
      const paySum = this.sumAmounts(payments);
      const outstanding = debtSum - paySum;

      if (outstanding > 1e-9) {
        throw new BadRequestException(
          `Partiya ${id} ni o‘chirish mumkin emas: qarzdorlik mavjud ${outstanding} (loglar: [${logIds.join(
            ', ',
          )}]). Avval qarz va to‘lovlarni yopishingiz kerak.`,
        );
      }
    }

    entity.isActive = false;
    entity.deletedAt = new Date();
    const saved = await this.repo.save(entity);
    
    // log deletion (UZ)
    await this.logRepo.save(
      this.logRepo.create({
        rawMaterialId: saved.rawMaterialId,
        rawMaterialBatchId: saved.id,
        comment:
          `«${entity.rawMaterial.name}» xomashyosi uchun partiya o'chirildi ` +
          `(partiya id=${saved.id}). Sana: ${new Date().toISOString()}.`,
        type: RawMaterialLogType.DELETE_BATCH,
      }),
    );
    
    return { ...toBatchResult(saved), deletedAt: saved.deletedAt! };
    
  }
}
