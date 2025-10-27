// src/transaction/helper.ts  (Result views)
import { BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { PaginationResult } from 'src/common/utils/pagination.util';
import { Client } from 'src/party/client/entities/client.entity';
import { ProductBatch } from 'src/product/product-batch/entities/product-batch.entity';
import { Product } from 'src/product/product/entities/product.entity';
import { TransactionProductBatch } from './entities/transaction-product-batch.entity';
import { TransactionProduct } from './entities/transaction-product.entity';
import { Transaction } from './entities/transaction.entity';

//
// Mini views
//
export interface ProductMiniView {
  id: string;
  name: string;
  isActive?: boolean;
  deletedAt?: Date | null;
}

export interface ProductBatchMiniView {
  id: string;
  amount: number;
  sellPrice: number | null;
  cost: number | null;
  isActive?: boolean;
  deletedAt?: Date | null;
}

export interface TransactionProductBatchResult {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  amount: number;
  productBatch: ProductBatchMiniView;
}

export interface TransactionProductResult {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  soldPrice: number;
  product: ProductMiniView;
  batches: TransactionProductBatchResult[];
}

export interface ClientMini {
  id: string;
  name: string;
  phone: string;
}

export interface TxFinanceSummary {
  debt: number;
  paid: number;
  due: number;
}

export interface TransactionResult {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  totalSoldPrice: number;
  products: TransactionProductResult[] | null;
  comment?: string | null;

  isReversed: boolean;
  reversedAt: Date | null;

  // ✅ new fields
  client: ClientMini | null;
  finance: TxFinanceSummary;
}

export type TransactionPagedResult = PaginationResult<TransactionResult>;

//
// helpers
//
export function assertUuid(value: string, field: string) {
  if (!isUUID(value))
    throw new BadRequestException(`${field} yaroqli UUID bo‘lishi shart`);
}
export function toNum(n: any): number {
  return n == null || n === '' ? 0 : Number(n);
}

export function maybeFlags(entity?: {
  isActive?: boolean;
  deletedAt?: Date | null;
}) {
  if (!entity) return {};
  const softDeleted = entity.deletedAt != null || entity.isActive === false;
  return softDeleted
    ? {
        isActive: entity.isActive ?? true,
        deletedAt: entity.deletedAt ?? null,
      }
    : {};
}

export function productMini(p: Product): ProductMiniView {
  return {
    id: p.id,
    name: p.name,
    ...maybeFlags(p),
  };
}

export function productBatchMini(b: ProductBatch): ProductBatchMiniView {
  return {
    id: b.id,
    amount: Number(b.amount),
    sellPrice: b.sellPrice == null ? null : Number(b.sellPrice),
    cost: b.cost == null ? null : Number(b.cost),
    ...maybeFlags(b),
  };
}

export function toTPBResult(
  entity: TransactionProductBatch,
  pb: ProductBatch,
): TransactionProductBatchResult {
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    amount: Number(entity.amount),
    productBatch: productBatchMini(pb),
  };
}

export function toTPResult(
  entity: TransactionProduct,
  product: Product,
  batches: TransactionProductBatchResult[],
): TransactionProductResult {
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    soldPrice: Number(entity.soldPrice),
    product: productMini(product),
    batches,
  };
}

export function toTResult(
  entity: Transaction,
  prodItems: TransactionProductResult[],
  client: Client | null,
  finance: TxFinanceSummary,
): TransactionResult {
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    totalSoldPrice: Number(entity.totalSoldPrice),
    products: prodItems.length ? prodItems : null,
    comment: entity.comment ?? null,

    isReversed: !!entity.isReversed,
    reversedAt: entity.reversedAt ?? null,

    client: client
      ? { id: client.id, name: client.name, phone: client.phone }
      : null,
    finance,
  };
}

