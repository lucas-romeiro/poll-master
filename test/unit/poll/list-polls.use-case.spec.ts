import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ListPollsInput, ListPollsUseCase } from '@/application/poll';
import { IPollRepository, PollStatus } from '@/domain/poll';

import { makePoll } from '../../factories';
import { createMockPollRepository } from '../../mocks';

describe('ListPollsUseCase', () => {
  let pollRepositoryMock: IPollRepository;
  let sut: ListPollsUseCase;

  beforeEach(() => {
    pollRepositoryMock = createMockPollRepository();
    sut = new ListPollsUseCase(pollRepositoryMock);
  });

  describe('Success Flow', () => {
    it('should return paginated polls mapped to PollOutput', async () => {
      const poll1 = makePoll({ question: 'Enquete 1?' });
      const poll2 = makePoll({ question: 'Enquete 2?' });

      vi.mocked(pollRepositoryMock.findAll).mockResolvedValueOnce({
        items: [poll1, poll2],
        meta: {
          hasNext: false,
          page: 1,
          perPage: 10,
          total: 2,
          totalPages: 1,
        },
      });

      const input: ListPollsInput = { page: 1, perPage: 10 };

      const result = await sut.execute(input);

      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toEqual(
        expect.objectContaining({
          id: poll1.id,
          question: 'Enquete 1?',
        }),
      );
      expect(result.items[1]).toEqual(
        expect.objectContaining({
          id: poll2.id,
          question: 'Enquete 2?',
        }),
      );

      expect(result.meta).toEqual({
        hasNext: false,
        page: 1,
        perPage: 10,
        total: 2,
        totalPages: 1,
      });

      expect(pollRepositoryMock.findAll).toHaveBeenCalledTimes(1);
      expect(pollRepositoryMock.findAll).toHaveBeenCalledWith({
        page: 1,
        perPage: 10,
        status: undefined,
      });
    });

    it('should pass status filter correctly to repository', async () => {
      const input: ListPollsInput = {
        page: 2,
        perPage: 5,
        status: PollStatus.STARTED,
      };

      await sut.execute(input);

      expect(pollRepositoryMock.findAll).toHaveBeenCalledWith({
        page: 2,
        perPage: 5,
        status: PollStatus.STARTED,
      });
    });

    it('should return empty items list when repository finds no records', async () => {
      const input: ListPollsInput = { page: 1, perPage: 10 };

      const result = await sut.execute(input);

      expect(result.items).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('Failure Flow', () => {
    it('should propagate exceptions thrown by the repository', async () => {
      vi.mocked(pollRepositoryMock.findAll).mockRejectedValueOnce(
        new Error('Database query error'),
      );

      await expect(sut.execute({ page: 1, perPage: 10 })).rejects.toThrow(
        'Database query error',
      );
    });
  });
});
