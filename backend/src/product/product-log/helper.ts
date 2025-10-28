import { PaginationResult } from 'src/common/utils/pagination.util';
import { ValueTransformer } from 'typeorm';
import { ProductLogType } from 'src/common/enums/enum';
import { Product } from '../product/entities/product.entity';
import { ProductBatch } from '../product-batch/entities/product-batch.entity';
import { ProductLog } from './entities/product-log.entity';

export interface ProductLogResult {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  productId: string;
  productName: string;
  productIsActive: boolean;
  productDeletedAt?: Date | null;
  productBatchId: string | null;
  amount: number;
  comment: string;
  type: ProductLogType;
}

export interface ProductView {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  type: string;
}

export interface ProductBatchView {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  productId: string;
  productName: string;
  amount: number;
  sellPrice: number | null;
  cost: number | null;
}

export interface ProductLogNestedResult {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  product: ProductView | null;
  productBatch: ProductBatchView | null;
  amount: number;
  comment: string;
  type: ProductLogType;
}

export type ProductLogListResult = PaginationResult<ProductLogNestedResult>;

export function toProductView(entity: Product | null): ProductView | null {
  if (!entity) return null;
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    name: entity.name,
    type: entity.type,
  };
}

export function toProductBatchView(
  entity: ProductBatch | null,
): ProductBatchView | null {
  if (!entity) return null;
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    productId: entity.productId,
    productName: entity?.product?.name ?? '',
    amount: Number(entity.amount),
    sellPrice: entity.sellPrice == null ? null : Number(entity.sellPrice),
    cost: entity.cost == null ? null : Number(entity.cost),
  };
}

export function toLogResult(entity: ProductLog): ProductLogResult {
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    productId: entity.productId,
    productName: entity.product?.name ?? '',
    productIsActive: entity.product?.isActive ?? false,
    productDeletedAt: entity.product?.deletedAt ?? null,
    productBatchId: entity.productBatchId ?? null,
    amount: Number(entity.productBatch?.amount ?? 0),
    comment: entity.comment,
    type: entity.type,
  };
}

export function toLogNested(entity: ProductLog): ProductLogNestedResult {
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    product: toProductView(entity.product ?? null),
    productBatch: toProductBatchView(entity.productBatch ?? null),
    amount: Number(entity.productBatch?.amount ?? 0),
    comment: entity.comment,
    type: entity.type,
  };
}

// Re-export numeric transformer used by ProductBatch entity
export const numericTransformer: ValueTransformer = {
  to: (value: number | null | undefined): number | null =>
    value == null ? null : value,
  from: (value: string | number | null): number | null =>
    value == null ? null : Number(value),
};
