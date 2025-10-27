declare interface CreateProductBatchPayload {
  productId: UUID;
  productRecipeId: UUID;
  assemblerId: UUID;
  amount: number;
  sellPrice?: number | null;
}

declare type UpdateProductBatchPayload = Partial<CreateProductBatchPayload>;

// ==== Entity ====
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

// ==== Pagination ====
declare interface PaginatedProductBatchesResponse<T> {
  results: T[];
  count: number;
  page: number;
  take: number;
  totalPages: number;
}
