import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UpdatePollUseCase } from '@/application/poll';
import { UpdatePollInput } from '@/application/poll/dtos/update-poll.dto';
import {
  IPollRepository,
  PollNotEditableError,
  PollNotFoundError,
} from '@/domain/poll';

import { makePoll } from '../../factories';
import { createMockPollRepository } from '../../mocks';

describe('UpdatePollUseCase', () => {
  let pollRepositoryMock: IPollRepository;
  let sut: UpdatePollUseCase;

  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const tomorrow = () => addDays(new Date(), 1);
  const nextWeek = () => addDays(new Date(), 7);

  beforeEach(() => {
    pollRepositoryMock = createMockPollRepository();
    sut = new UpdatePollUseCase(pollRepositoryMock);
  });

  describe('Success Flow', () => {
    it('should update and save a poll successfully when it is NOT_STARTED', async () => {
      const poll = makePoll({
        endDate: nextWeek(),
        question: 'Pergunta Antiga?',
        startDate: tomorrow(),
      });

      vi.mocked(pollRepositoryMock.findById).mockResolvedValueOnce(poll);

      const input: UpdatePollInput = {
        question: 'Pergunta Atualizada com Sucesso?',
      };

      const result = await sut.execute(poll.id, input);

      expect(result.question).toBe('Pergunta Atualizada com Sucesso?');
      expect(pollRepositoryMock.findById).toHaveBeenCalledWith(poll.id);
      expect(pollRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(pollRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: poll.id,
          question: 'Pergunta Atualizada com Sucesso?',
        }),
      );
    });
  });

  describe('Failure Flow', () => {
    it('should throw PollNotFoundError if poll does not exist', async () => {
      const pollId = 'non-existing-id';
      const input: UpdatePollInput = { question: 'Pergunta Teste' };

      await expect(sut.execute(pollId, input)).rejects.toThrow(
        PollNotFoundError,
      );

      expect(pollRepositoryMock.findById).toHaveBeenCalledWith(pollId);
      expect(pollRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should throw PollNotEditableError if poll has already started or finished', async () => {
      const pastStart = addDays(new Date(), -10);
      const pastEnd = addDays(new Date(), -5);

      const poll = makePoll({
        endDate: pastEnd,
        startDate: pastStart,
      });

      vi.mocked(pollRepositoryMock.findById).mockResolvedValueOnce(poll);

      const input: UpdatePollInput = { question: 'Nova Pergunta?' };

      await expect(sut.execute(poll.id, input)).rejects.toThrow(
        PollNotEditableError,
      );

      expect(pollRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should propagate repository errors on search', async () => {
      vi.mocked(pollRepositoryMock.findById).mockRejectedValueOnce(
        new Error('Database search error'),
      );

      await expect(sut.execute('poll-id', {})).rejects.toThrow(
        'Database search error',
      );
      expect(pollRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should propagate repository errors on save', async () => {
      const poll = makePoll({ endDate: nextWeek(), startDate: tomorrow() });
      vi.mocked(pollRepositoryMock.findById).mockResolvedValueOnce(poll);
      vi.mocked(pollRepositoryMock.save).mockRejectedValueOnce(
        new Error('Database save error'),
      );

      await expect(sut.execute(poll.id, {})).rejects.toThrow(
        'Database save error',
      );
    });
  });
});
