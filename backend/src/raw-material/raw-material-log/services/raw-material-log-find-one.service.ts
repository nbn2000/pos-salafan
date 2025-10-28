// src/raw-material/raw-material-log/services/raw-material-log-find-one.service.ts
import { Injectable } from '@nestjs/common';
import { RawMaterialLogResult, toLogResult } from '../helper';
import { RawMaterialLogBaseService } from './raw-material-log-base.service';

@Injectable()
export class RawMaterialLogFindOneService extends RawMaterialLogBaseService {
  async findOne(id: string): Promise<RawMaterialLogResult> {
    const entity = await this.repo.findOne({
      where: { id, isActive: true },
      withDeleted: true,
    });
    if (!entity)
      throw new (await import('@nestjs/common')).NotFoundException(
        'Xomashyo logi topilmadi',
      );
    const map = await this.hydrateWithRelations([entity.id]);
    return toLogResult(map.get(entity.id) ?? entity);
  }
}
