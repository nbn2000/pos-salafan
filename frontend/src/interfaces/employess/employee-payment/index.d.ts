// Har bir to‘lov yozuvi
declare type WorkerPayment = {
  id: string;
  workerId: string;
  amount: number;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

// Ishchi + to‘lovlar + umumiy to‘lov (detail javob)
declare type WorkerDetailWithPayments = {
  id: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  name: string;
  salary: number;
  position: string;
  payments: WorkerPayment[];
  totalPaid: number;
  totalPaidFrom?: string; // ISO 'YYYY-MM-DD' (optional)
  totalPaidTo?: string; // ISO 'YYYY-MM-DD' (optional)
};

// Yangi to‘lov yaratish payloadi (/:workerId/payments)
declare type CreateWorkerPaymentDto = {
  amount: number;
};

// (Agar kerak bo‘lsa) to‘lovni yangilash
declare type UpdateWorkerPaymentDto = {
  amount?: number;
};

declare type PaginatedResponse<T> = {
  results: T[];
  count: number;
  page: number;
  take: number;
  totalPages: number;
};

declare type WorkerListResponse = PaginatedResponse<WorkerListItem>;

declare type WorkerPaymentsListResponse = PaginatedResponse<WorkerPayment>;
