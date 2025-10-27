import { PaginationResult } from 'src/common/utils/pagination.util';
import { RawMaterialBatch } from 'src/raw-material/raw-material-batch/entities/raw-material-batch.entity';
import { RawMaterial } from 'src/raw-material/raw-material/entities/raw-material.entity';
import { Supplier } from './entities/supplier.entity';
import { PaymentType } from 'src/common/enums/enum';

export interface SupplierResult {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  phone: string;
}

export interface SupplierDeletedResult extends SupplierResult {
  deletedAt: Date;
}

export function toSupplierResult(entity: Supplier): SupplierResult {
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    name: entity.name,
    phone: entity.phone,
  };
}

export interface RawMaterialView {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  type: string;
}

export interface SupplierLogView {
  id: string;
  createdAt: Date;
  comment?: string | null;
}

export interface SupplierBatchFinanceView {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  rawMaterialId: string;
  rawMaterialName: string;
  amount: number;
  buyPrice: number;
  // finance fields
  credit: number; // variable current due = total - paid
  creditStatic: number; // initial debt at purchase time
  paid: number; // variable total paid to date
  paidStatic: number; // paid at purchase time
  payments: SupplierPaymentView[]; // payments tied to this batch (via logs)
  logs: SupplierLogView[];
}

export interface SupplierMaterialFinanceItem {
  material: RawMaterialView;
  credit: number; // variable: sum of batch credits
  batches: SupplierBatchFinanceView[];
}

export interface SupplierPaymentView {
  id: string;
  createdAt: Date;
  amount: number;
  paymentType: PaymentType;
}

/** Non-paginated, single supplier row (pretty view) */
export interface SupplierFinanceRow {
  supplier: {
    id: string;
    name: string;
    phone: string;
  };
  credit: number; // variable: sum of material credits
  items: SupplierMaterialFinanceItem[];
}

/** Paginated list of SupplierFinanceRow (for ALL suppliers endpoint) */
export type SuppliersFinancePaged = PaginationResult<SupplierFinanceRow>;

export function toRawMaterialView(rm: RawMaterial): RawMaterialView {
  return {
    id: rm.id,
    createdAt: rm.createdAt,
    updatedAt: rm.updatedAt,
    name: rm.name,
    type: (rm as unknown as { type: string }).type,
  };
}

export function toNum(n: unknown): number {
  return n == null ? 0 : Number(n);
}

export function toBatchFinanceBase(
  b: RawMaterialBatch,
): Omit<
  SupplierBatchFinanceView,
  'credit' | 'creditStatic' | 'paid' | 'paidStatic' | 'logs' | 'payments'
> {
  return {
    id: b.id,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    rawMaterialId: b.rawMaterialId,
    rawMaterialName: b.rawMaterial?.name ?? '',
    amount: Number(b.amount),
    buyPrice: Number(b.buyPrice),
  };
}
