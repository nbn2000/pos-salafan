import { BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { Payment } from './entities/payment.entity';
import { PaymentType } from 'src/common/enums/enum';

export interface PaymentResult {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  amount: number;
  from: string;
  to: string;
  paymentType: PaymentType;
  comment: string;
  transactionId: string | null;
  rawMaterialLogId: string | null;
}

export interface PaymentDeletedResult extends PaymentResult {
  deletedAt: Date;
}

export function toPaymentResult(entity: Payment): PaymentResult {
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    amount: Number(entity.amount),
    from: entity.from,
    to: entity.to,
    paymentType: entity.paymentType,
    comment: entity.comment,
    transactionId: entity.transactionId,
    rawMaterialLogId: entity.rawMaterialLogId,
  };
}

export function assertUuid(value: string, field: string) {
  if (!isUUID(value))
    throw new BadRequestException(`${field} haqiqiy UUID bo‘lishi kerak`);
}
export function assertUuidOrNull(
  value: string | null | undefined,
  field: string,
) {
  if (value === null || value === undefined) return;
  assertUuid(value, field);
}
