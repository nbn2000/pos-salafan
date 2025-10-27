/* =========================================================
   Types (declare = no imports needed)
   ======================================================= */

// Payment type enum to match backend
declare type PaymentType = 'CASH' | 'CARD' | 'TRANSFER';

/** ------- SALE (catalog/browse) ------- */
declare interface SaleBatch {
  id: string;
  amount: number;
  sellPrice: number | null;
  createdAt: string; // ISO
}

declare interface SaleItem {
  kind: 'product';
  id: string;
  name: string;
  totalAmount: number;
  shouldSellPrice: number | null;
  createdAt: string; // ISO
  images?: Array<{
    id: string;
    url: string;
  }>;
  batches?: SaleBatch[];
}

/** GET /sale list */
declare type SaleListResponse = PaginationResult<SaleItem>;

/** GET /sale/one */
declare interface SaleOneProduct {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
declare interface SaleOneBatch {
  id: string;
  amount: number;
  sellPrice: number | null;
  createdAt: string;
  updatedAt: string;
  productId?: string;
}
declare interface SaleOneResponse {
  kind: 'product';
  product: SaleOneProduct;
  batches?: SaleOneBatch[];
}

/** Query for /sale (extends your shared pagination with includeBatches) */
declare interface SaleBrowseQuery extends PaginationQuery {
  includeBatches?: boolean;
}

/** ------- TRANSACTION (sales history) ------- */
// Mini views from backend helper
declare interface TxProductMini {
  id: string;
  name: string;
  isActive?: boolean;
  deletedAt?: string | null;
}
declare interface TxProductBatchMini {
  id: string;
  amount: number;
  sellPrice: number | null;
  isActive?: boolean;
  deletedAt?: string | null;
}

declare interface TransactionProductBatchResult {
  id: string;
  createdAt: string;
  updatedAt: string;
  amount: number;
  productBatch: TxProductBatchMini;
}

declare interface TransactionProductResult {
  id: string;
  createdAt: string;
  updatedAt: string;
  soldPrice: number;
  product: TxProductMini;
  batches: TransactionProductBatchResult[];
}

declare interface TxClientMini {
  id: string;
  name: string;
  phone: string;
}

declare interface TxFinanceSummary {
  debt: number;
  paid: number;
  due: number;
}

declare interface TransactionResult {
  id: string;
  createdAt: string;
  updatedAt: string;
  totalSoldPrice: number;
  products: TransactionProductResult[] | null;
  comment?: string | null;
  isReversed?: boolean;
  reversedAt?: string | null;

  client: TxClientMini | null;
  finance: TxFinanceSummary;
}

declare type TransactionsListResponse = PaginationResult<TransactionResult>;

/** Create payload — mirrors CreateTransactionDto exactly */
declare interface CreateSalePayload {
  clientId: string;
  products: Array<{
    productId: string;
    amount: number;
    soldPrice?: number | null;
  }>;
  paid?: number; // default 0
  paymentType?: PaymentType;
  comment?: string;
}

/** Query for GET /transaction (extends common pagination) */
declare interface TransactionsQuery extends PaginationQuery {
  q?: string;
  clientId?: string;
  productId?: string;
  sortBy?: 'createdAt' | 'totalSoldPrice';
  sortDir?: 'ASC' | 'DESC';
}
