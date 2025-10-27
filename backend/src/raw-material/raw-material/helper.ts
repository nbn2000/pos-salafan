import { BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { PaginationResult } from 'src/common/utils/pagination.util';
import { RawMaterialBatch } from '../raw-material-batch/entities/raw-material-batch.entity';
import { RawMaterial } from './entities/raw-material.entity';

export interface RawMaterialResult {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  type: string;
  priority: string;
  // images removed
}

export interface RawMaterialDeletedResult extends RawMaterialResult {
  deletedAt: Date;
}

export interface RawMaterialBatchView {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  rawMaterialId: string;
  rawMaterialName: string;
  amount: number;
  buyPrice: number;
  payment?: RawMaterialBatchPaymentView;
}

export interface RawMaterialBatchPaymentView {
  supplierName: string;
  paid: number;
  paidStatic: number;
  credit: number;
  creditStatic: number;
}

export interface RawWithBatches {
  material: RawMaterialResult;
  batches: RawMaterialBatchView[];
  totalBatchAmount: number;
}

export interface RawWithBatchesResult extends RawWithBatches {
  batchesCount: number;
  batchesPages: number;
}

export type RawWithBatchesPagedResult = PaginationResult<RawWithBatches>;

// Totals across the entire store (all active raw materials & batches)
export interface RawMaterialTotals {
  totalLowKg: number;
  totalHighKg: number;
  totalLowUnit: number;
  totalHighUnit: number;
}

// Convenience types for paged results including totals
export type RawMaterialPagedWithTotals = PaginationResult<RawMaterialResult> & RawMaterialTotals;
export type RawWithBatchesPagedWithTotals = PaginationResult<RawWithBatches> & RawMaterialTotals;

export interface RawMaterialLogView {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  rawMaterialId: string;
  rawMaterialName: string;
  rawMaterialBatchId: string;
  amount: number;
  comment: string;
}

export type RawMaterialLogListResult = PaginationResult<RawMaterialLogView>;

// NEW: response shape for "to fill store" check
export interface RawMaterialRefillItem {
  message: string;
  link: string;
}

export function parseBool(val: unknown): boolean | undefined {
  if (val === undefined || val === null || val === '') return undefined;
  if (typeof val === 'boolean') return val;

  if (typeof val === 'number') {
    return val !== 0;
  }

  if (typeof val === 'string') {
    const s = val.toLowerCase().trim();
    if (s === 'true' || s === '1' || s === 'yes' || s === 'on') return true;
    if (s === 'false' || s === '0' || s === 'no' || s === 'off') return false;
  }

  return undefined;
}

export interface CreateRawMaterialOptions {
  suppliers: { id: string; name: string; phone: string }[];
  users: { id: string; username: string }[];
}

export function toRawMaterialResult(
  entity: RawMaterial,
): RawMaterialResult {
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    name: entity.name,
    type: entity.type,
    priority: entity.priority,
  };
}

export function toBatchView(entity: RawMaterialBatch): RawMaterialBatchView {
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    rawMaterialId: entity.rawMaterialId,
    rawMaterialName: entity.rawMaterial?.name ?? '',
    amount: Number(entity.amount),

    buyPrice: Number(entity.buyPrice),
  };
}

// ---- local guards to convert DB uuid errors into 400s ----
export function assertUuid(value: string, field: string) {
  if (!isUUID(value)) {
    throw new BadRequestException(`${field} uuid si tog'ri bolishi kerak`);
  }
}

/**
 * Safely parse JSON with a helpful error message.
 */
export function safeParseJson<T = unknown>(s: string, nameForError: string): T {
  try {
    return JSON.parse(s) as T;
  } catch {
    throw new BadRequestException(
      `${nameForError} yaroqli JSON bo‘lishi kerak`,
    );
  }
}

/**
 * Normalize an unknown batch payload (string or object) to a typed, numeric batch.
 */
export function normalizeBatch(raw: unknown): {
  amount: number;
  buyPrice: number;
} {
  if (!raw || typeof raw !== 'object') {
    throw new BadRequestException(`Partiya majburiy va obyekt bo‘lishi kerak`);
  }
  const anyb = raw as Record<string, unknown>;
  const num = (v: unknown, def?: number | null) =>
    v === null || v === undefined || v === '' ? (def ?? 0) : Number(v);

  const amount = num(anyb.amount);
  const buyPrice = num(anyb.buyPrice);

  return {
    amount,
    buyPrice,
  };
}
