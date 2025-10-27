import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { Payment } from '../entities/payment.entity';
import { PaymentResult, toPaymentResult } from '../helper';
import { PaymentValidationService } from './payment-validation.service';

@Injectable()
export class PaymentCreateService {
  constructor(
    @InjectRepository(Payment) private readonly repo: Repository<Payment>,
    private readonly validator: PaymentValidationService,
  ) {}

  async create(dto: CreatePaymentDto): Promise<PaymentResult> {
    await this.validator.ensurePartyExists(dto.from, 'from');
    await this.validator.ensurePartyExists(dto.to, 'to');
    await this.validator.ensureTransactionExists(dto.transactionId ?? null);
    await this.validator.ensureRawMaterialLogExists(
      dto.rawMaterialLogId ?? null,
    );

    const entity = this.repo.create(dto);
    const saved = await this.repo.save(entity);
    return toPaymentResult(saved);
  }
}
