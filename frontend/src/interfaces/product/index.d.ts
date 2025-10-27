// Priority enum to match backend
declare type Priority = 'HIGH' | 'LOW';

declare interface CreateProductPayload {
  name: string;
  type: MeasureType;
  amount: number;
  cost?: number | null;
  sellPrice?: number | null;
  priority?: Priority;
}

// ==== Entities ====
declare interface ProductImage {
  id: UUID;
  url: string;
}

declare interface ProductWithBatches {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  name: string;
  type: MeasureType;
  priority?: Priority;
  batches: ProductBatchView[];
  totalBatchAmount: number;
}

// ==== Product Batch View (backend aligned) ====
declare interface ProductBatchView {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  productId: UUID;
  amount: number;
  sellPrice: number | null;
}

// ==== Legacy Product Batch (keeping for compatibility) ====
declare interface ProductBatch {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  productId: UUID;
  productRecipeId: UUID;
  amount: number;
  cost: number;
  sellPrice: number | null;
  recipe: ProductRecipe | null;
}

// ==== Product Recipe ====
declare interface SemiProductView {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  name: string;
  type: MeasureType;
}

declare interface SemiProductBatchView {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  semiProductId: UUID;
  semiProductName: string;
  amount: number;
  cost: number;
  sellPrice: number | null;
}

declare interface ProductRecipeUnit {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  productRecipeId: UUID;
  semiProductId: UUID;
  amount: number;
  semiProduct: SemiProductView | null;
  batches: SemiProductBatchView[];
}

declare interface ProductRecipe {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  name: string;
  type: MeasureType;
  units: ProductRecipeUnit[];
}

declare interface PaginatedProductsResponse<T> {
  results: T[];
  count: number;
  page: number;
  take: number;
  totalPages: number;
  // KPI totals from backend
  totalLowKg: number;
  totalHighKg: number;
  totalLowUnit: number;
  totalHighUnit: number;
}

// ---- Low stock notification interface ----
declare interface ProductRefillItem {
  message: string;
  link: string;
}
