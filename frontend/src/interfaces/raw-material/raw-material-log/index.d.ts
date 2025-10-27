// ==== Primitivlar ====
type ISODateString = string;

// ==== Raw Material Log Types ====
type RawMaterialLogType = 'ADD' | 'ADD_BATCH' | 'CHANGE' | 'CHANGE_BATCH' | 'DELETE' | 'DELETE_BATCH';

// ==== Flat Log Result (from /api/raw-material-log) ====
declare interface RawMaterialLogResult {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  rawMaterialId: UUID;
  rawMaterialName: string;
  rawMaterialBatchId: UUID;
  amount: number;
  comment: string;
  type: RawMaterialLogType;
}

// ==== Nested Objects for Enhanced Logs ====
declare interface RawMaterialView {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  name: string;
  type: string;
}

declare interface RawMaterialBatchView {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  rawMaterialId: UUID;
  rawMaterialName: string;
  amount: number;
  buyPrice: number;
}

// ==== Nested Log Result (from /api/raw-material-log/logs) ====
declare interface RawMaterialLogNestedResult {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  rawMaterial: RawMaterialView | null;
  rawMaterialBatch: RawMaterialBatchView | null;
  amount: number;
  comment: string;
  type: RawMaterialLogType;
}

// ==== Legacy interface for backward compatibility ====
declare interface RawMaterialStockLog extends RawMaterialLogResult {}

// ==== Pagination Responses ====
declare type RawMaterialLogResponse = PaginatedResponse<RawMaterialLogResult>;
declare type RawMaterialLogNestedResponse = PaginatedResponse<RawMaterialLogNestedResult>;
declare type RawMaterialStockLogResponse = RawMaterialLogResponse; // Legacy alias

// ==== Query Parameters ====
declare interface RawMaterialLogQueryParams extends PaginationQuery {
  type?: RawMaterialLogType;
}

// ==== Pagination wrapper ====
declare interface PaginatedResponse<T> {
  count: number;
  results: T[];
  totalPages: number;
  page: number;
  take: number;
}
