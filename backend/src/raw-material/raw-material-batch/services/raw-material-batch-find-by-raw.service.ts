// src/raw-material/raw-material-batch/services/raw-material-batch-find-by-raw.service.ts
import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import {
  paginateAndFilter,
  PaginationResult,
} from 'src/common/utils/pagination.util';
import { RawMaterialBatchResult, toBatchResult } from '../helper';
import { RawMaterialBatchBaseService } from './raw-material-batch-base.service';

@Injectable()
export class RawMaterialBatchFindByRawService extends RawMaterialBatchBaseService {
  async findByRawMaterial(
    rawMaterialId: string,
    query: PaginationQueryDto,
  ): Promise<PaginationResult<RawMaterialBatchResult>> {
    const data = await paginateAndFilter(this.repo, query, {
      isActive: true,
      rawMaterialId,
    });
    return { ...data, results: data.results.map(toBatchResult) };
  }
}
