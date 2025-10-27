// src/raw-material/raw-material/services/raw-material-update.service.ts
import { Injectable } from '@nestjs/common';
import { UpdateRawMaterialDto } from '../dto/update-raw-material.dto';
import { RawMaterialResult, toRawMaterialResult } from '../helper';
import { RawMaterialBaseService } from './raw-material-base.service';
import { RawMaterialLogType } from 'src/common/enums/enum';

@Injectable()
export class RawMaterialUpdateService extends RawMaterialBaseService {
  async update(
    id: string,
    dto: UpdateRawMaterialDto,
  ): Promise<RawMaterialResult> {
    const entity = await this.getActiveRawOrThrow(id);

// snapshot BEFORE
const prevName = entity.name;
const prevType = entity.type;
const prevPriority = entity.priority;

// apply updates
if (dto.name) entity.name = dto.name;
if (dto.type) entity.type = dto.type;
if (dto.priority) entity.priority = dto.priority;
// priority handled above


const saved = await this.repo.save(entity);

// build diff list
const diffs: string[] = [];
if (dto.name && dto.name !== prevName) diffs.push(`nom: «${prevName}» -> «${dto.name}»`);
if (dto.type && dto.type !== prevType) diffs.push(`turi: ${prevType} -> ${dto.type}`);
if (dto.priority && dto.priority !== prevPriority)
  diffs.push(`prioritet: ${prevPriority} -> ${dto.priority}`);
// priority diff handled above


// attach to any existing batch if possible (so Log row is valid)
if (diffs.length) {
  const anyBatch = await this.batchRepo.findOne({
    where: { rawMaterialId: id },
    order: { createdAt: 'DESC' },
  });
  if (anyBatch) {
    const comment = `«${prevName}» xomashyosi ma'lumotlari o'zgartirildi: ` + diffs.join(', ');
    await this.logRepo.save(
      this.logRepo.create({
        rawMaterialId: id,
        rawMaterialBatchId: anyBatch.id,
        comment,
        type: RawMaterialLogType.CHANGE,
      }),
    );
  }
}

return toRawMaterialResult(saved);

  }
}
