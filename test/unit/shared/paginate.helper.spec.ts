import { describe, expect, it } from 'vitest';

import {
  buildPaginatedResult,
  mapPaginated,
  toSkipTake,
} from '@/domain/shared';

describe('Pagination Utilities', () => {
  describe('buildPaginatedResult', () => {
    it('should build paginated result metadata correctly with multiple pages', () => {
      const items = ['a', 'b'];
      const total = 5;
      const params = { page: 1, perPage: 2 };

      const result = buildPaginatedResult(items, total, params);

      expect(result).toEqual({
        items,
        meta: {
          hasNext: true,
          page: 1,
          perPage: 2,
          total: 5,
          totalPages: 3,
        },
      });
    });

    it('should set hasNext to false when on the last page', () => {
      const items = ['e'];
      const total = 5;
      const params = { page: 3, perPage: 2 };

      const result = buildPaginatedResult(items, total, params);

      expect(result.meta.hasNext).toBe(false);
      expect(result.meta.totalPages).toBe(3);
    });

    it('should handle empty items array and zero total', () => {
      const items: string[] = [];
      const total = 0;
      const params = { page: 1, perPage: 10 };

      const result = buildPaginatedResult(items, total, params);

      expect(result).toEqual({
        items: [],
        meta: {
          hasNext: false,
          page: 1,
          perPage: 10,
          total: 0,
          totalPages: 0,
        },
      });
    });
  });

  describe('mapPaginated', () => {
    it('should transform items keeping original metadata intact', () => {
      const paginatedNumbers = {
        items: [1, 2, 3],
        meta: {
          hasNext: false,
          page: 1,
          perPage: 10,
          total: 3,
          totalPages: 1,
        },
      };

      const result = mapPaginated(
        paginatedNumbers,
        (num) => `Item ${String(num)}`,
      );

      expect(result.items).toEqual(['Item 1', 'Item 2', 'Item 3']);
      expect(result.meta).toEqual(paginatedNumbers.meta);
    });
  });

  describe('toSkipTake', () => {
    it('should calculate skip 0 for first page', () => {
      const result = toSkipTake({ page: 1, perPage: 10 });

      expect(result).toEqual({ skip: 0, take: 10 });
    });

    it('should calculate skip correctly for subsequent pages', () => {
      const result = toSkipTake({ page: 3, perPage: 15 });

      expect(result).toEqual({ skip: 30, take: 15 });
    });
  });
});
