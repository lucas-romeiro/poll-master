import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GetPollUseCase } from '@/application/poll';
import { IPollRepository, PollNotFoundError } from '@/domain/poll';

import { makePoll } from '../../factories';
import { createMockPollRepository } from '../../mocks';

describe('GetPollUseCase', () => {
  let pollRepositoryMock: IPollRepository;
  let sut: GetPollUseCase;

  beforeEach(() => {
    pollRepositoryMock = createMockPollRepository();
    sut = new GetPollUseCase(pollRepositoryMock);
  });

  describe('Success Flow', () => {
    it('should find and return a poll mapped to PollOutput', async () => {
      const poll = makePoll({
        question: 'Qual o melhor ORM para Node.js?',
      });
      vi.mocked(pollRepositoryMock.findById).mockResolvedValueOnce(poll);

      const result = await sut.execute(poll.id);

      expect(result).toEqual({
        endDate: poll.endDate.toISOString(),
        id: poll.id,
        options: poll.options.map((option) => ({
          id: option.id,
          text: option.text,
          votes: option.votes,
        })),
        question: 'Qual o melhor ORM para Node.js?',
        startDate: poll.startDate.toISOString(),
        status: poll.status(expect.any(Date) as Date),
        totalVotes: poll.totalVotes,
      });

      expect(pollRepositoryMock.findById).toHaveBeenCalledWith(poll.id);
      expect(pollRepositoryMock.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('Failure Flow', () => {
    it('should throw PollNotFoundError if poll is not found', async () => {
      const nonExistingId = 'non-existing-id';

      await expect(sut.execute(nonExistingId)).rejects.toThrow(
        PollNotFoundError,
      );

      expect(pollRepositoryMock.findById).toHaveBeenCalledWith(nonExistingId);
    });

    it('should propagate exceptions thrown by the repository layer', async () => {
      vi.mocked(pollRepositoryMock.findById).mockRejectedValueOnce(
        new Error('Database query failure'),
      );

      await expect(sut.execute('poll-id')).rejects.toThrow(
        'Database query failure',
      );
    });
  });
});
