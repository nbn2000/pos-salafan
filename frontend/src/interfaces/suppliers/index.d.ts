// ==== Supplier model ====
declare interface Supplier {
  id: UUID;
  name: string;
  phone: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ==== Finance row (per-supplier, from backend) ====
declare interface SupplierFinanceRow {
  supplier: {
    id: UUID;
    name: string;
    phone: string;
  };
  credit: number;
  items: SupplierMaterialFinanceItem[];
}

declare interface SupplierMaterialFinanceItem {
  material: {
    id: UUID;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    name: string;
    type: string;
  };
  credit: number;
  batches: SupplierBatchFinanceView[];
}

declare interface SupplierBatchFinanceView {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  rawMaterialId: UUID;
  rawMaterialName: string;
  amount: number;
  buyPrice: number;
  // finance fields
  credit: number; // variable current due = total - paid
  creditStatic: number; // initial debt at purchase time
  paid: number; // variable total paid to date
  paidStatic: number; // paid at purchase time
  logs: SupplierLogView[];
}

declare interface SupplierLogView {
  id: UUID;
  createdAt: ISODateString;
  comment?: string | null;
}

// ==== Create / Update payload ====
declare interface CreateSupplierPayload {
  name: string;
  phone: string;
}
