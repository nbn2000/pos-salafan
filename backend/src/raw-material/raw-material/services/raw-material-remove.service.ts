// src/raw-material/raw-material/services/raw-material-remove.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { RawMaterialDeletedResult, toRawMaterialResult } from '../helper';
import { RawMaterialBaseService } from './raw-material-base.service';
import { RawMaterialLogType } from 'src/common/enums/enum';

@Injectable()
export class RawMaterialRemoveService extends RawMaterialBaseService {
  async remove(id: string): Promise<RawMaterialDeletedResult> {
    const entity = await this.getActiveRawOrThrow(id);

    const activeBatches = await this.batchRepo.find({
      where: { rawMaterialId: id, isActive: true },
      order: { createdAt: 'ASC' },
    });
    const batchesWithStock = activeBatches.filter((b) => Number(b.amount) > 0);
    if (batchesWithStock.length) {
      const details = batchesWithStock
        .map((b) => `partiya #${b.id} da bor ${Number(b.amount)}`)
        .join('; ');
      throw new BadRequestException(
        `Xomashyoni o‘chirishning iloji yo‘q "${entity.name}": zaxira qolgan – ${details}. Avval uni tugating/yoki 0 ga tushiring.`,
      );
    }

    const fin = await this.computeFinancials(id);
    const hasOutstanding = fin.outstanding > 1e-9;
    if (hasOutstanding) {
      throw new BadRequestException(
        `Xomashyoni o‘chirishning iloji yo‘q "${entity.name}": qarzdorlik mavjud (${fin.outstanding}). O‘chirishdan oldin qarz va to‘lovlarni yopishingiz kerak.`,
      );
    }

    // recipe references removed

    entity.isActive = false;
    entity.deletedAt = new Date();
    const saved = await this.repo.save(entity);
    
    // count batches (informational)
    const totalBatches = await this.batchRepo.count({ where: { rawMaterialId: id } });
    // attach log to any available batch (if none, skip logging due to schema)
    const anyBatch = await this.batchRepo.findOne({
      where: { rawMaterialId: id },
      order: { createdAt: 'DESC' },
    });
    if (anyBatch) {
      const comment =
        `«${entity.name}» (id=${entity.id}) xomashyosi o'chirildi. ` +
        `Bog'langan partiyalar soni: ${totalBatches}. Sana: ${new Date().toISOString()}.`;
      await this.logRepo.save(
        this.logRepo.create({
          rawMaterialId: id,
          rawMaterialBatchId: anyBatch.id,
          comment,
          type: RawMaterialLogType.DELETE,
        }),
      );
    }
    
    return {
      ...toRawMaterialResult(saved),
      deletedAt: saved.deletedAt!,
    };
    
  }
}
