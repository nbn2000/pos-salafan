export type USER_ROLE = 'Merchant' | 'Admin';

export interface MerchantData {
  id: string;
  is_superuser: boolean;
  username: string;
  is_staff: boolean;
  is_active: boolean;
  phone_number: string;
  date_joined: string;
  full_name: string;
  user_role: USER_ROLE;
}

export interface MerchantCreate {
  username: string;
  phone_number: string;
  full_name: string;
  password: string;
}

// Yangi interface'lar sale ma'lumotlari uchun
export interface SalePayment {
  method: string;
  amount: number;
  created_at: string;
  created_by: string | null;
  id: number;
}

export interface ProductBatchPayment {
  id: number;
  created_at: string;
  amount: number;
  method: string;
  created_by: string;
  product_batch: number;
}

export interface ProductBatch {
  id: number;
  product_batch_payments: ProductBatchPayment[];
  created_at: string;
  updated_at: string;
  quantity: number;
  buy_price: number;
  sell_price: number;
  exchange_rate: number | null;
  created_by: string;
  updated_by: string | null;
  product: number;
}

export interface Supplier {
  id: number;
  created_at: string;
  updated_at: string;
  full_name: string;
  phone_number: string;
  created_by: string;
  updated_by: string | null;
}

export interface Category {
  name: string;
  id: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string | null;
}

export interface Product {
  id: number;
  product_batches: ProductBatch[];
  total_quantity: number;
  sell_price: number;
  supplier: Supplier;
  category: Category;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  image: string | null;
  sku: string;
  product_type: string;
  created_by: string;
  updated_by: string | null;
}

export interface SaleItem {
  quantity: number;
  product: Product;
}

export interface Debtor {
  id: number;
  created_at: string;
  updated_at: string;
  phone_number: string;
  full_name: string;
  has_debt: boolean;
  created_by: string | null;
  updated_by: string | null;
}

export interface SaleRecord {
  id: number;
  created_at: string;
  items: SaleItem[];
  payments: SalePayment[];
  exchange_rate: number | null;
  total_sold: number;
  total_paid: number;
  merchant: MerchantData;
  debtor?: Debtor;
}

export interface MerchantSaleIncomeData {
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

  totals: {
    income: number;
    products: number;
    quantity: number;
    sales: number;
  };
  period: {
    start_date?: string;
    end_date?: string;
    is_single_day?: boolean;
  };
  results: SaleRecord[];
  count?: number;
  total_pages?: number;
}
