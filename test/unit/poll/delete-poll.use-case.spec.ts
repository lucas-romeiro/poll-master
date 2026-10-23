import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DeletePollUseCase } from '@/application/poll';
import { type IPollRepository, PollNotFoundError } from '@/domain/poll';

import { makePoll } from '../../factories';
import { createMockPollRepository } from '../../mocks';

describe('DeletePollUseCase', () => {
  let pollRepositoryMock: IPollRepository;
  let sut: DeletePollUseCase;

  beforeEach(() => {
    pollRepositoryMock = createMockPollRepository();
    sut = new DeletePollUseCase(pollRepositoryMock);
  });

  describe('Success Flow', () => {
    it('should find and delete a poll successfully', async () => {
      const poll = makePoll();
      vi.mocked(pollRepositoryMock.findById).mockResolvedValueOnce(poll);

      await sut.execute(poll.id);

      expect(pollRepositoryMock.findById).toHaveBeenCalledWith(poll.id);
      expect(pollRepositoryMock.findById).toHaveBeenCalledTimes(1);

      expect(pollRepositoryMock.delete).toHaveBeenCalledWith(poll.id);
      expect(pollRepositoryMock.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Failure Flow', () => {
    it('should throw PollNotFoundError if poll does not exist', async () => {
      const pollId = 'non-existing-id';

      await expect(sut.execute(pollId)).rejects.toThrow(PollNotFoundError);

      expect(pollRepositoryMock.findById).toHaveBeenCalledWith(pollId);
      expect(pollRepositoryMock.delete).not.toHaveBeenCalled();
    });

    it('should propagate exceptions thrown by the repository during search', async () => {
      vi.mocked(pollRepositoryMock.findById).mockRejectedValueOnce(
        new Error('Database search error'),
      );

      await expect(sut.execute('poll-id')).rejects.toThrow(
        'Database search error',
      );
      expect(pollRepositoryMock.delete).not.toHaveBeenCalled();
    });

    it('should propagate exceptions thrown by the repository during deletion', async () => {
      const poll = makePoll();
      vi.mocked(pollRepositoryMock.findById).mockResolvedValueOnce(poll);
      vi.mocked(pollRepositoryMock.delete).mockRejectedValueOnce(
        new Error('Database delete error'),
      );

      await expect(sut.execute(poll.id)).rejects.toThrow(
        'Database delete error',
      );
    });
  });
});
