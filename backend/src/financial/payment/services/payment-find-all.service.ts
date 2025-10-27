import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import {
  paginateAndFilter,
  PaginationResult,
} from 'src/common/utils/pagination.util';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { PaymentResult, toPaymentResult } from '../helper';

@Injectable()
export class PaymentFindAllService {
  constructor(
    @InjectRepository(Payment) private readonly repo: Repository<Payment>,
  ) {}

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginationResult<PaymentResult>> {
    const data = await paginateAndFilter(this.repo, query, { isActive: true });
    return { ...data, results: data.results.map(toPaymentResult) };
  }
}
