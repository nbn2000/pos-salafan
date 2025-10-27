import { ProductBatch } from './entities/product-batch.entity';

export interface ProductBatchResult {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  productId: string;
  amount: number;
  cost: number | null;
  sellPrice: number | null;
}

export function toBatchResult(entity: ProductBatch): ProductBatchResult {
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    productId: entity.productId,
    amount: Number(entity.amount),
    cost:
      entity.cost === null || entity.cost === undefined
        ? null
        : Number(entity.cost),
    sellPrice:
      entity.sellPrice === null || entity.sellPrice === undefined
        ? null
        : Number(entity.sellPrice),
  };
}
