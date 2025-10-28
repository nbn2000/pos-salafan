// src/raw-material/raw-material-log/services/raw-material-log-find-logs.service.ts
import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, In } from 'typeorm';
import { RawMaterialLogQueryDto } from '../dto/raw-material-log-query.dto';
import { RawMaterialLog } from '../entities/raw-material-log.entity';
import { RawMaterialLogListResult } from '../helper';
import { RawMaterialLogBaseService } from './raw-material-log-base.service';

@Injectable()
export class RawMaterialLogFindLogsService extends RawMaterialLogBaseService {
  async findLogs(query: RawMaterialLogQueryDto): Promise<RawMaterialLogListResult> {
    const { page = 1, take = 6 } = query;
    const skip = (page - 1) * take;

    const where: FindOptionsWhere<RawMaterialLog> = { isActive: true };
    if (query.type) where.type = query.type;

    const [entities, count] = await this.repo.findAndCount({
        where,
        relations: [
          'rawMaterial',
          'rawMaterialBatch',
          'rawMaterialBatch.rawMaterial',
        ],
        withDeleted: true,
        order: { createdAt: 'DESC' },
        skip,
        take,
      });

    // Manually rehydrate raw materials and batches including soft-deleted to ensure names are present
    const rawIds = Array.from(
      new Set(entities.map((e) => e.rawMaterialId).filter(Boolean)),
    );
    const batchIds = Array.from(
      new Set(entities.map((e) => e.rawMaterialBatchId).filter(Boolean)),
    );
    const [raws, batches] = await Promise.all([
      rawIds.length
        ? this.rawRepo.find({ where: { id: In(rawIds) }, withDeleted: true })
        : Promise.resolve([]),
      batchIds.length
        ? this.batchRepo.find({ where: { id: In(batchIds) }, withDeleted: true })
        : Promise.resolve([]),
    ]);
    const rawById = new Map(raws.map((r) => [r.id, r]));
    const batchById = new Map(batches.map((b) => [b.id, b]));
    for (const e of entities) {
      if (e.rawMaterialId) {
        const r = rawById.get(e.rawMaterialId);
        if (r) e.rawMaterial = r;
      }
      if (e.rawMaterialBatchId) {
        const b = batchById.get(e.rawMaterialBatchId);
        if (b) e.rawMaterialBatch = b;
      }
    }

    return {
      count,
      totalPages: Math.ceil(count / take),
      page,
      take,
      results: entities.map((entity) => ({
        id: entity.id,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        type: entity.type,
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
