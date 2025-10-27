import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import {
  paginateAndFilter,
  PaginationResult,
} from 'src/common/utils/pagination.util';
import { Repository } from 'typeorm';
import { Debt } from '../entities/debt.entity';
import { DebtResult, toDebtResult } from '../helper';

@Injectable()
export class DebtFindAllService {
  constructor(
    @InjectRepository(Debt) private readonly repo: Repository<Debt>,
  ) {}

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginationResult<DebtResult>> {
    const data = await paginateAndFilter(this.repo, query, { isActive: true });
    return { ...data, results: data.results.map(toDebtResult) };
  }
}
