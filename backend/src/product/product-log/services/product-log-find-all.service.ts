// src/product/product-log/services/product-log-find-all.service.ts
import { Injectable } from '@nestjs/common';
import {
  paginateAndFilter,
  PaginationResult,
} from 'src/common/utils/pagination.util';
import { FindOptionsWhere } from 'typeorm';
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
    const baseWhere: FindOptionsWhere<ProductLog> = { isActive: true };
    if (query.type) baseWhere.type = query.type;
    const page = await paginateAndFilter(this.logRepo, query, baseWhere);

    // Hydrate including soft-deleted relations, preserve order
    const idMap = await this.hydrateWithRelations(page.results.map((r) => r.id));
    return {
      ...page,
      results: page.results.map((r) => toLogResult(idMap.get(r.id) ?? r)),
    };
  }
}
