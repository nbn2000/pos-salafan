// src/raw-material/raw-material/services/raw-material-find-one-with-batches.service.ts
import { Injectable } from '@nestjs/common';
import {
  RawWithBatchesResult,
  toBatchView,
  toRawMaterialResult,
} from '../helper';
import { RawMaterialBaseService } from './raw-material-base.service';

@Injectable()
export class RawMaterialFindOneWithBatchesService extends RawMaterialBaseService {
  async findOneWithBatches(id: string): Promise<RawWithBatchesResult> {
    const raw = await this.getActiveRawOrThrow(id);

    const [entities] = await Promise.all([
      this.batchRepo.find({
        where: { rawMaterialId: id, isActive: true },
        relations: ['rawMaterial'],
        order: { createdAt: 'DESC' },
      }),
    ]);

    const views = entities.map(toBatchView);
    const totalBatchAmount = views.reduce((sum, b) => sum + b.amount, 0);

    return {
      material: toRawMaterialResult(raw),
      batches: views,
      totalBatchAmount,
      batchesCount: entities.length,
      batchesPages: 1,
    };
  }
}
