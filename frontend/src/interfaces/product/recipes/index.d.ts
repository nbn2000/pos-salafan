declare interface RecipeMaterialItem {
  semiProductId: UUID;
  amount: number;
}

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

declare interface RecipeUnit {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  productRecipeId: UUID;
  semiProductId: UUID;
  amount: number;
  semiProduct: SemiProductView | null;
  batches: SemiProductBatchView[];
}

declare interface Recipe {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  name: string;
  type: MeasureType;
  units: RecipeUnit[];
}

// ==== Payloads ====
declare interface CreateRecipePayload {
  type: MeasureType;
  name: string;
  units: RecipeMaterialItem[];
}

declare type UpdateRecipePayload = Partial<CreateRecipePayload>;

// ==== Pagination ====
declare interface PaginatedRecipesResponse<T> {
  results: T[];
  count: number;
  page: number;
  take: number;
  totalPages: number;
}
