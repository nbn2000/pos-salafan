declare interface BatchesData {
  id: number;
  product_batch: {
    id: number;
    created_at: string;
    updated_at: string;
    quantity: number;
    buy_price: string;
    sell_price: string;
    created_by: null | string;
    updated_by: null | string;
    product: number;
  };
  quantity_used: number;
}

declare interface ProductBatchesData {
  id: number;
  created_at: string;
  updated_at: string;
  quantity: number;
  buy_price: number;
  sell_price: number;
  exchange_rate?: number;
  created_by: null | string;
  updated_by: null | string;
  product: number;
}

declare interface ProductBatchCreate {
  payment?: {
    payments?:
      | {
          method: PaymentMethod;
          amount: number;
        }[]
      | null;
    debt_amount: number;
  } | null;
  quantity: number;
  buy_price: number;
  sell_price: number;
  exchange_rate: number;
  product: number;
}
