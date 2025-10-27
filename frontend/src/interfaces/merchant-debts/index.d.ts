export interface MerchantDebtsData {
  count: number;
  total_pages: number;
  merchant: {
    id: string;
    is_superuser: boolean;
    username: string;
    is_staff: boolean;
    is_active: boolean;
    phone_number: string;
    date_joined: string;
    full_name: string;
    user_role: USER_ROLE;
  };
  results: MerchantDebtProduct[];
}

export interface MerchantDebtProduct {
  id: number;
  product: number;
  name: string;
  sku: string;
  product_type: PRODUCT_TYPE;
  category: string;
  supplier_name: string;
  supplier_phone: string;
  total_debt_amount: number;
}
export interface MerchantDebtProductBatchData {
  count: number;
  total_pages: number;

  results: MerchantDebtProductBatchItem[];
}

export interface MerchantDebtProductBatchItem {
  buy_price: number;
  exchange_rate: number;
  product_batch_payments: MerchantDebtProductBatchPayments[];
  product: number;
  quantity: number;
  sell_price: number;
  amount: number;
  id: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string | null;
}

export type PaymentMethod = 'uzs' | 'card' | 'usd';

export interface MerchantDebtProductBatchPayments {
  id: number;
  created_at: string;
  amount: number;
  method: PaymentMethod;
  created_by: string;
}
export interface MerchantDebtProductBatch {
  id: number;
  debt_amount: number;
  created_at: string;
  updated_at: string;
  quantity: number;
  buy_price: number;
  sell_price: number;
  exchange_rate: number;
  created_by: string;
  updated_by: string | null;
  product: number;
}
