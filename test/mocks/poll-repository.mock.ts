import { vi } from 'vitest';

import type { IPollRepository } from '@/domain/poll';

export const createMockPollRepository = (): IPollRepository => ({
  delete: vi.fn().mockResolvedValue(undefined),
  findAll: vi.fn().mockResolvedValue({
    items: [],
    meta: {
      hasNext: false,
      page: 1,
      perPage: 10,
      total: 0,
      totalPages: 0,
    },
  }),
  findById: vi.fn().mockResolvedValue(null),
  incrementVote: vi.fn().mockResolvedValue(1),
  save: vi.fn().mockResolvedValue(undefined),
});
