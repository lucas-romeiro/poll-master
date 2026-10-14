import type {
  PaginatedResult,
  PaginationParams,
} from '../interfaces/paginate.interface';

export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  { page, perPage }: PaginationParams,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / perPage);
  return {
    items,
    meta: { hasNext: page < totalPages, page, perPage, total, totalPages },
  };
}

export function mapPaginated<T, R>(
  result: PaginatedResult<T>,
  fn: (item: T) => R,
): PaginatedResult<R> {
  return { ...result, items: result.items.map(fn) };
}

export function toSkipTake({ page, perPage }: PaginationParams) {
  return { skip: (page - 1) * perPage, take: perPage };
}
