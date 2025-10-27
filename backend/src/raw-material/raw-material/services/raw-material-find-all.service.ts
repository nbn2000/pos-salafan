// src/raw-material/raw-material/services/raw-material-find-all.service.ts
import { Injectable } from '@nestjs/common';
import {
  paginateAndFilter,
  PaginationResult,
} from 'src/common/utils/pagination.util';
import { RawMaterialPagedWithTotals, RawMaterialResult, toRawMaterialResult } from '../helper';
import { RawMaterialQueryDto } from '../dto/raw-material-query.dto';
import { FindOptionsWhere } from 'typeorm';
import { RawMaterial } from '../entities/raw-material.entity';
import { RawMaterialBaseService } from './raw-material-base.service';

@Injectable()
export class RawMaterialFindAllService extends RawMaterialBaseService {
  async findAll(
    query: RawMaterialQueryDto,
  ): Promise<RawMaterialPagedWithTotals> {
    const baseWhere: FindOptionsWhere<RawMaterial> = { isActive: true };
    if (query.priority) baseWhere.priority = query.priority;
    const page = await paginateAndFilter(this.repo, query, baseWhere);
    const totals = await this.computeStoreTotals();
    return {
      ...page,
      ...totals,
      results: page.results.map((rm) => toRawMaterialResult(rm)),
    };
  }
}

