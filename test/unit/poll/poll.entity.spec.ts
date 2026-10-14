import { describe, expect, it } from 'vitest';

import {
  InvalidPollError,
  OptionNotFoundError,
  Poll,
  PollNotEditableError,
  PollNotOpenError,
  PollStatus,
} from '@/domain/poll';

describe('Poll Aggregate Root', () => {
  const futureStart = new Date(Date.now() + 1000 * 60 * 60 * 24);
  const futureEnd = new Date(Date.now() + 1000 * 60 * 60 * 48);

  const validProps = {
    endDate: futureEnd,
    options: ['TypeScript', 'JavaScript', 'Python'],
    question: 'Qual a sua linguagem de programação favorita?',
    startDate: futureStart,
  };

  describe('Creation Flow (create)', () => {
    it('should create a poll successfully with valid options and period', () => {
      const poll = Poll.create(validProps);

      expect(poll.id).toBeDefined();
      expect(poll.question).toBe(validProps.question);
      expect(poll.options).toHaveLength(3);
      expect(poll.totalVotes).toBe(0);
      expect(poll.startDate).toBe(validProps.startDate);
      expect(poll.endDate).toBe(validProps.endDate);
    });

    it('should throw an error if the poll has less than the minimum options (3)', () => {
      const invalidProps = {
        ...validProps,
        options: ['TypeScript', 'JavaScript'],
      };

      expect(() => Poll.create(invalidProps)).toThrow(InvalidPollError);
      expect(() => Poll.create(invalidProps)).toThrow(
        'A enquete deve ter no mínimo 3 opções',
      );
    });
  });

  describe('Status Evaluation (status)', () => {
    it('should return NOT_STARTED if current time is before start date', () => {
      const poll = Poll.create(validProps);
      const beforeStart = new Date(futureStart.getTime() - 1000 * 60);

      expect(poll.status(beforeStart)).toBe(PollStatus.NOT_STARTED);
    });

    it('should return STARTED if current time is within period and no votes cast', () => {
      const poll = Poll.create(validProps);
      const during = new Date(futureStart.getTime() + 1000 * 60);

      expect(poll.status(during)).toBe(PollStatus.STARTED);
    });

    it('should return FINISHED if current time is after end date', () => {
      const poll = Poll.create(validProps);
      const afterEnd = new Date(futureEnd.getTime() + 1000 * 60);

      expect(poll.status(afterEnd)).toBe(PollStatus.FINISHED);
    });
  });

  describe('Update Flow (update)', () => {
    it('should update poll details successfully when status is NOT_STARTED', () => {
      const poll = Poll.create(validProps);
      const beforeStart = new Date(futureStart.getTime() - 1000 * 60);

      poll.update(
        {
          question: 'Qual framework você mais utiliza no dia a dia?',
        },
        beforeStart,
      );

      expect(poll.question).toBe(
        'Qual framework você mais utiliza no dia a dia?',
      );
    });

    it('should throw PollNotEditableError if trying to update a poll that has already started', () => {
      const poll = Poll.create(validProps);
      const during = new Date(futureStart.getTime() + 1000 * 60);

      expect(() => {
        poll.update({ question: 'Nova pergunta?' }, during);
      }).toThrow(PollNotEditableError);
    });
  });

  describe('Voting Rules (ensureCanVote)', () => {
    it('should allow voting if the poll status is STARTED or IN_PROGRESS', () => {
      const poll = Poll.create(validProps);
      const during = new Date(futureStart.getTime() + 1000 * 60);
      const optionId = poll.options[0].id;

      expect(() => {
        poll.ensureCanVote(optionId, during);
      }).not.toThrow();
    });

    it('should throw PollNotOpenError if voting before start or after end', () => {
      const poll = Poll.create(validProps);
      const beforeStart = new Date(futureStart.getTime() - 1000 * 60);
      const optionId = poll.options[0].id;

      expect(() => {
        poll.ensureCanVote(optionId, beforeStart);
      }).toThrow(PollNotOpenError);
    });

    it('should throw OptionNotFoundError if option does not exist in the poll', () => {
      const poll = Poll.create(validProps);
      const during = new Date(futureStart.getTime() + 1000 * 60);

      expect(() => {
        poll.ensureCanVote('invalid-option-id', during);
      }).toThrow(OptionNotFoundError);
    });
  });

  describe('Reconstitution Flow (reconstitute)', () => {
    it('should reconstitute a poll correctly with given id and options', () => {
      const customId = 'poll-uuid-123';
      const reconstituted = Poll.reconstitute({
        endDate: futureEnd,
        id: customId,
        options: [
          { id: 'opt-1', text: 'Sim', votes: 10 },
          { id: 'opt-2', text: 'Não', votes: 5 },
          { id: 'opt-3', text: 'Talvez', votes: 2 },
        ],
        question: 'Questão reconstituição?',
        startDate: futureStart,
      });

      expect(reconstituted.id).toBe(customId);
      expect(reconstituted.totalVotes).toBe(17);
      expect(reconstituted.options).toHaveLength(3);
      expect(reconstituted.options[0].votes).toBe(10);
    });
  });
});
