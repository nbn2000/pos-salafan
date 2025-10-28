// src/raw-material/raw-material-log/services/raw-material-log-find-all.service.ts
import { Injectable } from '@nestjs/common';
import {
  paginateAndFilter,
  PaginationResult,
} from 'src/common/utils/pagination.util';
import { RawMaterialLogResult, toLogResult } from '../helper';
import { RawMaterialLogBaseService } from './raw-material-log-base.service';
import { RawMaterialLogQueryDto } from '../dto/raw-material-log-query.dto';
import { FindOptionsWhere } from 'typeorm';
import { RawMaterialLog } from '../entities/raw-material-log.entity';

@Injectable()
export class RawMaterialLogFindAllService extends RawMaterialLogBaseService {
  async findAll(
    query: RawMaterialLogQueryDto,
  ): Promise<PaginationResult<RawMaterialLogResult>> {
    const baseWhere: FindOptionsWhere<RawMaterialLog> = { isActive: true };
    if (query.type) baseWhere.type = query.type;

    const page = await paginateAndFilter(this.repo, query, baseWhere);

    // Hydrate relations efficiently and preserve original order
    const idMap = await this.hydrateWithRelations(page.results.map((r) => r.id));

    return {
      ...page,
      results: page.results.map((r) => toLogResult(idMap.get(r.id) ?? r)),
    };
  }
}
