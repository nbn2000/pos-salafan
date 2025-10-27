import { BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { Debt } from './entities/debt.entity';

export interface DebtResult {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  amount: number;
  from: string;
  to: string;
  comment: string;
  transactionId: string | null;
  rawMaterialLogId: string | null;
}

export interface DebtDeletedResult extends DebtResult {
  deletedAt: Date;
}

export function toDebtResult(entity: Debt): DebtResult {
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    amount: Number(entity.amount),
    from: entity.from,
    to: entity.to,
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
