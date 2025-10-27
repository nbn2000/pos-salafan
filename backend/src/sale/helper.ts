export interface SaleItem {
  kind: 'product';
  id: string;
  name: string;
  totalAmount: number;
  shouldSellPrice: number | null;
  createdAt: Date;
  batches?: Array<{
    id: string;
    amount: number;
    sellPrice: number | null;
    createdAt: Date;
  }>;
}

export interface PaginationQuery {
  page?: number | string;
  take?: number | string;
  search?: string;
  searchField?: string;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
  createdFrom?: string;
  createdTo?: string;
  includeBatches?: boolean | string;
}

export interface PagedResult<T> {
  count: number;
  totalPages: number;
  page: number;
  take: number;
  results: T[];
}

export function parseBool(v: any, def = false): boolean {
  if (v === undefined || v === null) return def;
  if (typeof v === 'boolean') return v;
  const s = String(v).toLowerCase().trim();
  return s === '1' || s === 'true' || s === 'yes';
}

export function dateOnlyBoundary(
  ymd?: string,
  boundary: 'start' | 'end' = 'start',
): Date | undefined {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return undefined;
  const [y, m, d] = ymd.split('-').map(Number);
  return boundary === 'start'
    ? new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0))
    : new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
}
