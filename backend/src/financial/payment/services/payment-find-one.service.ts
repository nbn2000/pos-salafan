import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { assertUuid, PaymentResult, toPaymentResult } from '../helper';

@Injectable()
export class PaymentFindOneService {
  constructor(
    @InjectRepository(Payment) private readonly repo: Repository<Payment>,
  ) {}

  async findOne(id: string): Promise<PaymentResult> {
    assertUuid(id, 'id');
    const entity = await this.repo.findOne({ where: { id, isActive: true } });
    if (!entity) throw new NotFoundException('To‘lov topilmadi');
    return toPaymentResult(entity);
  }
}
