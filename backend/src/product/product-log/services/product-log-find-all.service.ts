// src/product/product-log/services/product-log-find-all.service.ts
import { Injectable } from '@nestjs/common';
import {
  paginateAndFilter,
  PaginationResult,
} from 'src/common/utils/pagination.util';
import { In } from 'typeorm';
import { ProductLog } from '../entities/product-log.entity';
import { ProductLogBaseService } from './product-log-base.service';
import { ProductLogQueryDto } from '../dto/product-log-query.dto';
import { ProductLogResult, toLogResult } from '../helper';

@Injectable()
export class ProductLogFindAllService extends ProductLogBaseService {
  // FIND ALL (paginated + filters) – includes product + batch (logic unchanged)
  async findAll(
    query: ProductLogQueryDto,
  ): Promise<PaginationResult<ProductLogResult>> {
    const baseWhere: any = { isActive: true };
    if (query.type) baseWhere.type = query.type;
    const page = await paginateAndFilter(this.logRepo, query, baseWhere);

    // manually attach relations (kept 1:1)
    const ids = page.results.map((log) => log.id);
    const logs = ids.length
      ? await this.logRepo.find({
          where: { id: In(ids) },
          relations: ['product', 'productBatch'],
        })
      : [];

    const logMap = new Map(logs.map((l) => [l.id, l]));
    return {
      ...page,
      results: page.results.map((r) => toLogResult(logMap.get(r.id) ?? r)),
    };
  }
}
