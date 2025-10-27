import { MeasurementType as RecipeMeasurementType } from 'src/common/enums/enum';
import { PaginationResult } from 'src/common/utils/pagination.util';

export interface ProductBatchView {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  productId: string;
  amount: number;
  cost: number | null;
  sellPrice: number | null;
}

export interface ProductView {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  type: RecipeMeasurementType;
  priority?: string;
  batches: ProductBatchView[];
  totalBatchAmount: number;
}

export type ProductPagedView = PaginationResult<ProductView>;

// Totals across the entire store (all active products & batches)
export interface ProductTotals {
  totalLowKg: number;
  totalHighKg: number;
  totalLowUnit: number;
  totalHighUnit: number;
}

// Convenience type for paged results including totals
export type ProductPagedWithTotals = PaginationResult<ProductView> & ProductTotals;

// Low stock notification interface (unchanged)
export interface ProductRefillItem {
  message: string;
  link: string;
}
