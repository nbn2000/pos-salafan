declare type CreateMessagePayload = {
  clientIds: string[];
  message: string;
};

// --- Aliases ---
declare type UUID = string;
declare type ISODateString = string;

// --- Status (kerak bo'lsa kengaytirasiz) ---
declare type MessageStatus = 'SENT' | 'FAILED';

// --- Paginated javob umumiy tipi (agar loyihada bo'lmasa) ---
declare interface PaginatedResponse<T> {
  count: number;
  totalPages: number;
  page: number;
  take: number;
  results: T[];
}

// --- Message.client ---
declare interface MessageClient {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  deletedAt: ISODateString | null;
  isActive: boolean;
  name: string;
  phone: string;
}

// --- Message item ---
declare interface MessageItem {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  deletedAt: ISODateString | null;
  isActive: boolean;

  text: string; // xabar matni
  toPhone: string; // qaysi raqamga yuborilgan
  client: MessageClient; // mijoz obyekti
  clientId: UUID; // mijoz ID
  providerMessageId: string | null; // SMS provider ID (agar bo'lsa)
  status: MessageStatus; // masalan: 'SENT'
}

// --- GET /messages javobi ---
declare type MessagesListResponse = PaginatedResponse<MessageItem>;
