// ==== Shared Pagination Types ====

// Query parameters (frontend side) - mirrors backend PaginationQueryDto
declare interface PaginationQuery {
  page?: number;
  take?: number;
  search?: string;
  searchField?: string;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
  createdFrom?: string; // YYYY-MM-DD
  createdTo?: string; // YYYY-MM-DD
}

// Response wrapper (generic)
declare interface PaginationResult<T> {
  count: number;
  results: T[];
  totalPages: number;
  page: number;
  take: number;
}
