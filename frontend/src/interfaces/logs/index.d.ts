declare interface LogsData {
  id: number;
  action: 'Delete' | 'Add' | 'Adjust' | 'Restock';
  note: string;
  author: string | null;
  created_at: string;
  product: number | null;
  product_batch: number | null;
  created_by: string | null;
  sku: string | null;
}
