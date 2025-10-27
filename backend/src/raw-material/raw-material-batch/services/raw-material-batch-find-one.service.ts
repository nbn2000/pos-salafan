// src/raw-material/raw-material-batch/services/raw-material-batch-find-one.service.ts
import { Injectable } from '@nestjs/common';
import { RawMaterialBatchResult, toBatchResult } from '../helper';
import { RawMaterialBatchBaseService } from './raw-material-batch-base.service';

@Injectable()
export class RawMaterialBatchFindOneService extends RawMaterialBatchBaseService {
  async findOne(id: string): Promise<RawMaterialBatchResult> {
    const entity = await this.repo.findOne({
      where: { id, isActive: true },
      relations: ['rawMaterial'],
    });
    if (!entity)
      throw new (await import('@nestjs/common')).NotFoundException(
        'Xomashyo partiyasi topilmadi',
      );
    return toBatchResult(entity);
  }
}
