// src/client/services/client-find-all.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import {
  paginateAndFilter,
  PaginationResult,
} from 'src/common/utils/pagination.util';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';
import { ClientResult, toClientResult } from '../helper';

@Injectable()
export class ClientFindAllService {
  constructor(
    @InjectRepository(Client)
    private readonly repo: Repository<Client>,
  ) {}

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginationResult<ClientResult>> {
    const data = await paginateAndFilter(this.repo, query, { isActive: true });
    return { ...data, results: data.results.map(toClientResult) };
  }
}
