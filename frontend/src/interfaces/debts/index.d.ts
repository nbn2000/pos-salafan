// ==== Common ====
declare type UUID = string;
declare type ISODateString = string;

// ==== Create payload ====
declare interface DebtPayload {
  amount: number; // required, > 0
  from: UUID; // required
  to: UUID; // required
  comment?: string; // optional
  transactionId?: UUID | null; // optional
  rawMaterialLogId?: UUID | null; // optional
  shouldPayDate?: ISODateString | null; // optional (backend accepts null)
}

// ==== API response ====
declare interface Debt {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  amount: number;
  from: UUID;
  to: UUID;
  comment: string;
  transactionId: UUID | null;
  rawMaterialLogId: UUID | null;
  shouldPayDate?: ISODateString | null;
}
