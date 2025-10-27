import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { Payment } from '../entities/payment.entity';
import { assertUuid, PaymentResult, toPaymentResult } from '../helper';
import { PaymentValidationService } from './payment-validation.service';

@Injectable()
export class PaymentUpdateService {
  constructor(
    @InjectRepository(Payment) private readonly repo: Repository<Payment>,
    private readonly validator: PaymentValidationService,
  ) {}

  async update(id: string, dto: UpdatePaymentDto): Promise<PaymentResult> {
    assertUuid(id, 'id');
    const entity = await this.repo.findOne({ where: { id, isActive: true } });
    if (!entity) throw new NotFoundException('To‘lov topilmadi');

    if (dto.from !== undefined)
      await this.validator.ensurePartyExists(dto.from, 'from');
    if (dto.to !== undefined)
      await this.validator.ensurePartyExists(dto.to, 'to');
    if (dto.transactionId !== undefined)
      await this.validator.ensureTransactionExists(dto.transactionId ?? null);
    if (dto.rawMaterialLogId !== undefined)
      await this.validator.ensureRawMaterialLogExists(
        dto.rawMaterialLogId ?? null,
      );

    Object.assign(entity, dto);
    const saved = await this.repo.save(entity);
    return toPaymentResult(saved);
  }
}
