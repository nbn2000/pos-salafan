declare type UUID = string;
declare type ISODateString = string;

// ==== Client model ====
declare interface Client {
  id: UUID;
  name: string;
  phone: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ==== Finance row (per-client, from backend) ====
declare interface ClientFinanceRow {
  client: {
    id: UUID;
    name: string;
    phone: string;
  };
  credit: number;
  items: ClientProductFinanceItem[];
  rawItems: ClientRawFinanceItem[];
}

// --- Products ---
declare interface ClientProductFinanceItem {
  product: { id: UUID; name: string };
  credit: number;
  lines: ClientProductLineFinanceView[];
}

declare interface ClientProductLineFinanceView {
  transactionId: UUID;
  amount: number;
  soldPrice: number;
  total: number;
  paid: number;
  due: number;
  debt: number;
  shouldPayDate?: ISODateString | null;
}

// --- Raw materials ---
declare interface ClientRawFinanceItem {
  rawMaterial: { id: UUID; name: string };
  credit: number;
  lines: ClientRawLineFinanceView[];
}

declare interface ClientRawLineFinanceView {
  transactionId: UUID;
  amount: number;
  soldPrice: number;
  total: number;
  paid: number;
  due: number;
  debt: number;
  shouldPayDate?: ISODateString | null;
}

// ==== Create / Update payload ====
declare interface CreateClientPayload {
  name: string;
  phone: string;
}
