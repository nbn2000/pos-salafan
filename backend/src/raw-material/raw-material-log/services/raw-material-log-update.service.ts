// src/raw-material/raw-material-log/services/raw-material-log-update.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateRawMaterialLogDto } from '../dto/update-raw-material-log.dto';
import { RawMaterialLogResult, toLogResult } from '../helper';
import { RawMaterialLogBaseService } from './raw-material-log-base.service';

@Injectable()
export class RawMaterialLogUpdateService extends RawMaterialLogBaseService {
  async update(
    id: string,
    dto: UpdateRawMaterialLogDto,
  ): Promise<RawMaterialLogResult> {
    const entity = await this.repo.findOne({ where: { id, isActive: true } });
    if (!entity)
      throw new (await import('@nestjs/common')).NotFoundException(
        'Xomashyo logi topilmadi',
      );

    if (dto.rawMaterialId) {
      const raw = await this.getActiveRaw(dto.rawMaterialId);
      if (!raw) throw new BadRequestException('Xomashyo topilmadi');
      entity.rawMaterialId = dto.rawMaterialId;
    }

    if (dto.rawMaterialBatchId) {
      const batch = await this.getActiveBatch(dto.rawMaterialBatchId);
      if (!batch) throw new BadRequestException('Xomashyo partiyasi topilmadi');
      entity.rawMaterialBatchId = dto.rawMaterialBatchId;
    }

    if (dto.comment) entity.comment = dto.comment;
    if (dto.type) entity.type = dto.type;

    const saved = await this.repo.save(entity);
    return toLogResult(saved);
  }
}
