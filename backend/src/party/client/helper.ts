import { PaginationResult } from 'src/common/utils/pagination.util';
import { Product } from 'src/product/product/entities/product.entity';
import { Client } from './entities/client.entity';

// ---------- existing result types ----------
export interface ClientResult {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  phone: string;
}

export interface ClientDeletedResult extends ClientResult {
  deletedAt: Date;
}

export function toClientResult(entity: Client): ClientResult {
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    name: entity.name,
    phone: entity.phone,
  };
}

// ---------- Product finance result types ----------
export interface ProductMiniView {
  id: string;
  name: string;
}

export interface ClientProductLineFinanceView {
  transactionId: string;
  amount: number;
  soldPrice: number;
  total: number;
  paid: number;
  due: number;
  debt: number;
}

export interface ClientProductFinanceItem {
  product: ProductMiniView;
  credit: number;
  lines: ClientProductLineFinanceView[];
}

export interface ClientProductsFinanceRow {
  client: {
    id: string;
    name: string;
    phone: string;
  };
  credit: number; // total due across this client's products
  items: ClientProductFinanceItem[];
}

export type ClientsProductsFinancePaged =
  PaginationResult<ClientProductsFinanceRow>;

// ---------- helpers ----------
export function productMini(p: Product): ProductMiniView {
  return {
    id: p.id,
    name: p.name,
  };
}

export function toNum(n: unknown): number {
  return n == null || n === '' ? 0 : Number(n);
}
