// Product log type enum
declare type ProductLogType = 'ADD' | 'ADD-BATCH' | 'CHANGE' | 'CHANGE-BATCH' | 'DELETE' | 'DELETE-BATCH';

// Flat product log result (from /api/product-log endpoint)
declare interface ProductLogResult {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  productId: UUID;
  productName: string;
  productBatchId: UUID | null;
  amount: number;
  comment: string;
  type: ProductLogType;
}

// Product view for nested results
declare interface ProductView {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  name: string;
  type: string;
}

// Product batch view for nested results
declare interface ProductBatchView {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  productId: UUID;
  productName: string;
  amount: number;
  sellPrice: number | null;
  cost: number | null;
}

// Enhanced product log result with nested objects (from /api/product-log/logs endpoint)
declare interface ProductLogNestedResult {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  product: ProductView | null;
  productBatch: ProductBatchView | null;
  amount: number;
  comment: string;
  type: ProductLogType;
}

// Query parameters for product logs
declare interface ProductLogQueryParams extends PaginationQuery {
  type?: ProductLogType;
}

// Legacy interface for backward compatibility
declare interface ProductStockLog extends ProductLogResult {}

// Response types
declare type ProductStockLogResponse = PaginatedResponse<ProductLogResult>;
declare type ProductLogListResponse = PaginatedResponse<ProductLogNestedResult>;
