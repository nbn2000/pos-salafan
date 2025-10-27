// src/product/product-log/services/product-log-find-logs.service.ts
import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { ProductLog } from '../entities/product-log.entity';
import { ProductLogListResult, toLogNested } from '../helper';
import { ProductLogBaseService } from './product-log-base.service';
import { ProductLogQueryDto } from '../dto/product-log-query.dto';

@Injectable()
export class ProductLogFindLogsService extends ProductLogBaseService {
  async findLogs(query: ProductLogQueryDto): Promise<ProductLogListResult> {
    const { page = 1, take = 6 } = query;
    const skip = (page - 1) * take;

    const where: any = { isActive: true };
    if (query.type) where.type = query.type;

    const [entities, count]: [ProductLog[], number] = await this.logRepo.findAndCount({
      where,
      relations: ['product', 'productBatch', 'productBatch.product'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    return {
      count,
      totalPages: Math.ceil(count / take),
      page,
      take,
      results: entities.map((e) => toLogNested(e)),
    };
  }
}

