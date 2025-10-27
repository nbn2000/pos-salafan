// Payment type enum to match backend
declare type PaymentType = 'CASH' | 'CARD' | 'TRANSFER';

// Bazaviy maydonlar
declare interface CreatePaymentBase {
  amount: number;
  from: UUID; // clientId / supplierId / userId (UUID)
  to: UUID; // userId (UUID)
  exchangeRate: number;
  comment?: string; // ixtiyoriy
  paymentType: PaymentType; // required payment method
}

// 1) Tranzaksiya orqali to'lov
declare interface CreatePaymentByTransaction extends CreatePaymentBase {
  transactionId: UUID;
  rawMaterialLogId?: never;
}

// 2) Raw material log orqali to'lov
declare interface CreatePaymentByRawLog extends CreatePaymentBase {
  rawMaterialLogId: UUID;
  transactionId?: never;
}

// Yakuniy payload: ikkita varianti bor, faqat bittasi mos keladi
declare type CreatePaymentPayload =
  | CreatePaymentByTransaction
  | CreatePaymentByRawLog;

// ==== Create payload ====
declare interface PaymentPayload {
  amount: number; // required, > 0
  from: UUID; // required
  to: UUID; // required
  comment?: string; // optional
  transactionId?: UUID | null; // optional
  rawMaterialLogId?: UUID | null; // optional
  paymentType: PaymentType; // required payment method
}

// ==== API response ====
declare interface Payment {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  amount: number;
  from: UUID;
  to: UUID;
  comment: string;
  transactionId: UUID | null;
  rawMaterialLogId: UUID | null;
}
