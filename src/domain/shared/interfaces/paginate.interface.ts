export interface PaginatedResult<T> {
  items: T[];
  meta: {
    hasNext: boolean;
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page: number;
  perPage: number;
}
