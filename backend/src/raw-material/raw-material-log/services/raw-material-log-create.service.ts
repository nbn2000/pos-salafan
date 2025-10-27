// src/raw-material/raw-material-log/services/raw-material-log-create.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRawMaterialLogDto } from '../dto/create-raw-material-log.dto';
import { RawMaterialLogResult, toLogResult } from '../helper';
import { RawMaterialLogBaseService } from './raw-material-log-base.service';

@Injectable()
export class RawMaterialLogCreateService extends RawMaterialLogBaseService {
  async create(dto: CreateRawMaterialLogDto): Promise<RawMaterialLogResult> {
    const raw = await this.rawRepo.findOne({
      where: { id: dto.rawMaterialId, isActive: true },
    });
    if (!raw) throw new BadRequestException('Xomashyo topilmadi');

    const batch = await this.batchRepo.findOne({
      where: { id: dto.rawMaterialBatchId, isActive: true },
    });
    if (!batch) throw new BadRequestException('Xomashyo partiyasi topilmadi');

    const entity = this.repo.create({ ...dto });
    const saved = await this.repo.save(entity);
    return toLogResult(saved);
  }
}
