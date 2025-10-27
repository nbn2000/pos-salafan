// src/raw-material/raw-material-log/services/raw-material-log-find-logs.service.ts
import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { RawMaterialLogQueryDto } from '../dto/raw-material-log-query.dto';
import { RawMaterialLog } from '../entities/raw-material-log.entity';
import { RawMaterialLogType } from 'src/common/enums/enum';
import { RawMaterialLogListResult } from '../helper';
import { RawMaterialLogBaseService } from './raw-material-log-base.service';

@Injectable()
export class RawMaterialLogFindLogsService extends RawMaterialLogBaseService {
  async findLogs(query: RawMaterialLogQueryDto): Promise<RawMaterialLogListResult> {
    const { page = 1, take = 6 } = query;
    const skip = (page - 1) * take;

    const where: any = { isActive: true };
    if (query.type) where.type = query.type;

    const [entities, count]: [RawMaterialLog[], number] =
      await this.repo.findAndCount({
        where,
        relations: [
          'rawMaterial',
          'rawMaterialBatch',
          'rawMaterialBatch.rawMaterial',
        ],
        order: { createdAt: 'DESC' },
        skip,
        take,
      });

    return {
      count,
      totalPages: Math.ceil(count / take),
      page,
      take,
      results: entities.map((entity) => ({
        id: entity.id,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        type: entity.type as RawMaterialLogType,
        rawMaterial: entity.rawMaterial
          ? {
              id: entity.rawMaterial.id,
              createdAt: entity.rawMaterial.createdAt,
              updatedAt: entity.rawMaterial.updatedAt,
              name: entity.rawMaterial.name,
              type: entity.rawMaterial.type,
            }
          : null,
        rawMaterialBatch: entity.rawMaterialBatch
          ? {
              id: entity.rawMaterialBatch.id,
              createdAt: entity.rawMaterialBatch.createdAt,
              updatedAt: entity.rawMaterialBatch.updatedAt,
              rawMaterialId: entity.rawMaterialBatch.rawMaterialId,
              rawMaterialName: entity.rawMaterialBatch.rawMaterial?.name ?? '',
              amount: Number(entity.rawMaterialBatch.amount),

              buyPrice: Number(entity.rawMaterialBatch.buyPrice),
            }
          : null,
        amount: Number(entity.rawMaterialBatch?.amount ?? 0),
        comment: entity.comment,
      })),
    };
  }
}
