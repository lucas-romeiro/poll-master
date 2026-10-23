import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type PollEventsPublisher,
  VoteInput,
  VoteUseCase,
} from '@/application/poll';
import {
  IPollRepository,
  OptionNotFoundError,
  PollNotFoundError,
  PollNotOpenError,
} from '@/domain/poll';

import { makePoll } from '../../factories';
import {
  createMockPollEventsPublisher,
  createMockPollRepository,
} from '../../mocks';

describe('VoteUseCase', () => {
  let pollRepositoryMock: IPollRepository;
  let eventsPublisherMock: PollEventsPublisher;
  let sut: VoteUseCase;

  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const yesterday = () => addDays(new Date(), -1);
  const nextWeek = () => addDays(new Date(), 7);

  beforeEach(() => {
    pollRepositoryMock = createMockPollRepository();
    eventsPublisherMock = createMockPollEventsPublisher();
    sut = new VoteUseCase(pollRepositoryMock, eventsPublisherMock);
  });

  describe('Success Flow', () => {
    it('should increment vote and publish vote registered event successfully', async () => {
      const optionId = 'opt-123';
      const poll = makePoll({
        endDate: nextWeek(),
        options: [
          { id: optionId, text: 'Opção 1', votes: 10 },
          { id: 'opt-456', text: 'Opção 2', votes: 5 },
          { id: 'opt-789', text: 'Opção 3', votes: 2 },
        ],
        startDate: yesterday(),
      });

      vi.mocked(pollRepositoryMock.findById).mockResolvedValueOnce(poll);
      vi.mocked(pollRepositoryMock.incrementVote).mockResolvedValueOnce(11);

      const input: VoteInput = { id: poll.id, optionId };

      const result = await sut.execute(input);

      expect(result).toEqual({
        optionId,
        pollId: poll.id,
        votes: 11,
      });

      expect(pollRepositoryMock.findById).toHaveBeenCalledWith(poll.id);
      expect(pollRepositoryMock.incrementVote).toHaveBeenCalledWith(optionId);

      expect(eventsPublisherMock.publishVoteRegistered).toHaveBeenCalledTimes(
        1,
      );
      expect(eventsPublisherMock.publishVoteRegistered).toHaveBeenCalledWith({
        occuredAt: expect.any(Date) as Date,
        optionId,
        pollId: poll.id,
        votes: 11,
      });
    });
  });

  describe('Failure Flow', () => {
    it('should throw PollNotFoundError if poll does not exist', async () => {
      const input: VoteInput = { id: 'non-existing-id', optionId: 'opt-1' };

      await expect(sut.execute(input)).rejects.toThrow(PollNotFoundError);

      expect(pollRepositoryMock.incrementVote).not.toHaveBeenCalled();
      expect(eventsPublisherMock.publishVoteRegistered).not.toHaveBeenCalled();
    });

    it('should throw PollNotOpenError if poll has not started or has already finished', async () => {
      const futureStart = addDays(new Date(), 2);
      const futureEnd = addDays(new Date(), 10);

      const poll = makePoll({
        endDate: futureEnd,
        startDate: futureStart,
      });

      vi.mocked(pollRepositoryMock.findById).mockResolvedValueOnce(poll);

      const input: VoteInput = {
        id: poll.id,
        optionId: poll.options[0].id,
      };

      await expect(sut.execute(input)).rejects.toThrow(PollNotOpenError);

      expect(pollRepositoryMock.incrementVote).not.toHaveBeenCalled();
      expect(eventsPublisherMock.publishVoteRegistered).not.toHaveBeenCalled();
    });

    it('should throw OptionNotFoundError if optionId does not belong to the poll', async () => {
      const poll = makePoll({
        endDate: nextWeek(),
        startDate: yesterday(),
      });

      vi.mocked(pollRepositoryMock.findById).mockResolvedValueOnce(poll);

      const input: VoteInput = {
        id: poll.id,
        optionId: 'invalid-option-id',
      };

      await expect(sut.execute(input)).rejects.toThrow(OptionNotFoundError);

      expect(pollRepositoryMock.incrementVote).not.toHaveBeenCalled();
      expect(eventsPublisherMock.publishVoteRegistered).not.toHaveBeenCalled();
    });

    it('should not publish event if repository fails on incrementVote', async () => {
      const optionId = 'opt-123';
      const poll = makePoll({
        endDate: nextWeek(),
        options: [
          { id: optionId, text: 'Opção 1', votes: 0 },
          { id: 'opt-2', text: 'Opção 2', votes: 0 },
          { id: 'opt-3', text: 'Opção 3', votes: 0 },
        ],
        startDate: yesterday(),
      });

      vi.mocked(pollRepositoryMock.findById).mockResolvedValueOnce(poll);
      vi.mocked(pollRepositoryMock.incrementVote).mockRejectedValueOnce(
        new Error('Database write failure'),
      );

      const input: VoteInput = { id: poll.id, optionId };

      await expect(sut.execute(input)).rejects.toThrow(
        'Database write failure',
      );

      expect(eventsPublisherMock.publishVoteRegistered).not.toHaveBeenCalled();
    });
  });
});
