declare interface CreateMaterialBatch {
  amount: number;
  buyPrice: number;
  paid: number;
  supplierId: UUID;
}

// Pagination for raw material party list
declare interface ListPartiesQuery {
  page?: number;
  limit?: number;
}

// Raw material party (batch/lot entry)
declare interface RawMaterialParty {
  id: UUID;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  rawMaterialId: UUID;
  amount: number;
  buyPrice: number;
  supplierId: UUID;
}

// List response
declare type ListPartiesRes = {
  results: RawMaterialParty[];
  count: number;
  take: number;
  page: number;
  totalPages: number;
};

// Create/Update requests
declare interface CreateRawMaterialPartyReq {
  amount: number;
  buyPrice: number;
  supplierId: UUID;
}

declare interface UpdateRawMaterialPartyReq
  extends Partial<CreateRawMaterialPartyReq> {}
