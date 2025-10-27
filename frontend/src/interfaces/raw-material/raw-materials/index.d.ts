// src/types/raw-materials.d.ts
declare type UUID = string;
declare type ISODateString = string;

// Backend's MeasurementType
export type MeasureType = 'KG' | 'UNIT';

// ---- Inline batch (what backend expects inside "batch") ----
export interface MaterialBatchInline {
  amount: number;
  buyPrice: number;
}

// ---- Payment Type enum to match backend ----
export type PaymentType = 'CASH' | 'CARD' | 'TRANSFER';

// ---- Priority enum to match backend ----
export type Priority = 'HIGH' | 'LOW';

// ---- Payment information from backend ----
export interface BatchPaymentInfo {
  supplierName: string;
  paid: number;
  paidStatic: number;
  credit: number;
  creditStatic: number;
}

// ---- Create payload (frontend form → API) ----
export interface CreateMaterialWithBatch {
  name: string;
  type: MeasureType;
  priority?: Priority;
  batch: MaterialBatchInline;
  paid?: number; // default 0 if omitted
  supplierId: UUID;
  paymentType?: PaymentType;
}

// ---- Views returned by backend (keep as you already had, adjusted to enum) ----
export interface RawMaterialImageView {
  id: UUID;
  url: string;
}

export interface MaterialSummary {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  name: string;
  type: MeasureType;
  priority?: Priority;
}

export interface MaterialBatchSummary {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  rawMaterialId: UUID;
  rawMaterialName: string;
  amount: number;
  buyPrice: number;
  payment?: BatchPaymentInfo;
}

export interface RawMaterial {
  material: MaterialSummary;
  batches: MaterialBatchSummary[];
  totalBatchAmount: number;
}

export interface PaginatedRawMaterialsResponse<T> {
  results: T[];
  count: number;
  take: number;
  page: number;
  totalPages: number;
  totalLowKg: number;
  totalHighKg: number;
  totalLowUnit: number;
  totalHighUnit: number;
}
export type RawMaterialBatchesListResponse =
  PaginatedRawMaterialsResponse<MaterialBatchSummary>;
export type RawMaterialsListResponse =
  PaginatedRawMaterialsResponse<RawMaterial>;

// shared list query you used elsewhere
export interface GetDefaultQuery {
  page?: number;
  take?: number;
  search?: string;
  searchField?: string;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
  priority?: Priority;
}

export interface UpdateRawMaterialPayload {
  name?: string;
  type?: MeasureType;
  priority?: Priority;
}

// ---- Batch CRUD operations ----
export interface CreateRawMaterialBatchPayload {
  amount: number;
  buyPrice: number;
  paid?: number;
  supplierId: UUID;
  paymentType?: PaymentType;
}

export interface UpdateRawMaterialBatchPayload {
  amount?: number;
  buyPrice?: number;
  paid?: number;
  supplierId?: UUID;
  paymentType?: PaymentType;
}

// ---- Low stock notification interface ----
export interface RawMaterialRefillItem {
  message: string;
  link: string;
}
