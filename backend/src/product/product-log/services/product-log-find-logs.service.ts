// src/product/product-log/services/product-log-find-logs.service.ts
import { Injectable } from '@nestjs/common';
import { FindOptionsWhere } from 'typeorm';
import { ProductLog } from '../entities/product-log.entity';
import { ProductLogListResult, toLogNested } from '../helper';
import { ProductLogBaseService } from './product-log-base.service';
import { ProductLogQueryDto } from '../dto/product-log-query.dto';

@Injectable()
export class ProductLogFindLogsService extends ProductLogBaseService {
  async findLogs(query: ProductLogQueryDto): Promise<ProductLogListResult> {
    const { page = 1, take = 6 } = query;
    const skip = (page - 1) * take;

    const where: FindOptionsWhere<ProductLog> = { isActive: true };
    if (query.type) where.type = query.type;

    const [entities, count] = await this.logRepo.findAndCount({
      where,
      relations: ['product', 'productBatch', 'productBatch.product'],
      withDeleted: true,
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    // Rehydrate soft-deleted relations so names remain visible
    const ids = entities.map((e) => e.id);
    const map = await this.hydrateWithRelations(ids);
    const full = entities.map((e) => map.get(e.id) ?? e);

    return {
      count,
      totalPages: Math.ceil(count / take),
      page,
      take,
      results: full.map((e) => toLogNested(e)),
    };
  }
}
