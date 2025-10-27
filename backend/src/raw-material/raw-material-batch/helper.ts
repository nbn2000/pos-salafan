import { RawMaterialBatch } from './entities/raw-material-batch.entity';

export interface RawMaterialBatchResult {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  rawMaterialId: string;
  rawMaterialName: string;
  amount: number;
  buyPrice: number;
}

export interface RawMaterialBatchDeletedResult extends RawMaterialBatchResult {
  deletedAt: Date;
}

export function toBatchResult(
  entity: RawMaterialBatch,
): RawMaterialBatchResult {
  return {
    id: entity.id,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    rawMaterialId: entity.rawMaterialId,
    rawMaterialName: entity.rawMaterial?.name ?? '',
    amount: Number(entity.amount),
    buyPrice: Number(entity.buyPrice),
  };
}
