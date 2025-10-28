// src/raw-material/raw-material-log/helper.ts
import { PaginationResult } from 'src/common/utils/pagination.util';
import { RawMaterialLogType } from 'src/common/enums/enum';
import { RawMaterial } from 'src/raw-material/raw-material/entities/raw-material.entity';
import { RawMaterialBatch } from 'src/raw-material/raw-material-batch/entities/raw-material-batch.entity';
import { RawMaterialLog } from './entities/raw-material-log.entity';

/** ---------- Flat list item returned by most list endpoints ---------- */
export interface RawMaterialLogResult {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  rawMaterialId: string;
  rawMaterialName: string;
  rawMaterialIsActive: boolean;
  rawMaterialDeletedAt?: Date | null;
  rawMaterialBatchId: string;
  amount: number;
  comment: string;
  type: RawMaterialLogType;
}

/** ---------- Nested, fully-hydrated shape (mirrors SemiProduct style) ---------- */
export interface RawMaterialView {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  type: string;
}

export interface RawMaterialBatchView {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  rawMaterialId: string;
  rawMaterialName: string;
  amount: number;
  buyPrice: number;
}

export interface RawMaterialLogNestedResult {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  rawMaterial: RawMaterialView | null;
  rawMaterialBatch: RawMaterialBatchView | null;
  amount: number;
  comment: string;
  type: RawMaterialLogType;
}

export type RawMaterialLogListResult =
  PaginationResult<RawMaterialLogNestedResult>;

export interface RawMaterialLogDeletedResult extends RawMaterialLogResult {
  deletedAt: Date;
}

/* =========================================================================
 * Mapping helpers (kept parallel to the Semi-Product helper style)
 * ========================================================================= */

export function toRawMaterialView(
  entity: RawMaterial | null,
): RawMaterialView | null {
  if (!entity) return null;
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    name: entity.name,
    type: entity.type,
  };
}

export function toRawMaterialBatchView(
  entity: RawMaterialBatch | null,
): RawMaterialBatchView | null {
  if (!entity) return null;
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

/**
 * Flat list mapper.
 * NOTE: RawMaterialLog entity does not have 'amount', so we display the
 * batch amount (matches your original helper behavior).
 */
export function toLogResult(entity: RawMaterialLog): RawMaterialLogResult {
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    rawMaterialId: entity.rawMaterialId,
    rawMaterialName: entity.rawMaterial?.name ?? '',
    rawMaterialIsActive: entity.rawMaterial?.isActive ?? false,
    rawMaterialDeletedAt: entity.rawMaterial?.deletedAt ?? null,
    rawMaterialBatchId: entity.rawMaterialBatchId,
    amount: Number(entity.rawMaterialBatch?.amount ?? 0),
    comment: entity.comment,
    type: entity.type,
  };
}

/**
 * Fully nested mapper (use when a view requires embedded rawMaterial/batch).
 * NOTE: Amount mirrors the batch amount for consistency with flat mapper.
 */
export function toLogNested(entity: RawMaterialLog): RawMaterialLogNestedResult {
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    rawMaterial: toRawMaterialView(entity.rawMaterial ?? null),
    rawMaterialBatch: toRawMaterialBatchView(entity.rawMaterialBatch ?? null),
    amount: Number(entity.rawMaterialBatch?.amount ?? 0),
    comment: entity.comment,
    type: entity.type,
  };
}
