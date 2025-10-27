// src/raw-material/raw-material-log/services/raw-material-log-remove.service.ts
import { Injectable } from '@nestjs/common';
import { RawMaterialLogDeletedResult, toLogResult } from '../helper';
import { RawMaterialLogBaseService } from './raw-material-log-base.service';

@Injectable()
export class RawMaterialLogRemoveService extends RawMaterialLogBaseService {
  async remove(id: string): Promise<RawMaterialLogDeletedResult> {
    const entity = await this.repo.findOne({ where: { id, isActive: true } });
    if (!entity)
      throw new (await import('@nestjs/common')).NotFoundException(
        'Xomashyo logi topilmadi',
      );

    entity.isActive = false;
    entity.deletedAt = new Date();
    const saved = await this.repo.save(entity);

    return { ...toLogResult(saved), deletedAt: saved.deletedAt! };
  }
}
