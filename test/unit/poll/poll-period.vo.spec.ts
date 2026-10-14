import { describe, expect, it } from 'vitest';

import { InvalidPollError, PollPeriod } from '@/domain/poll';

describe('PollPeriod Value Object', () => {
  const futureDate1 = new Date(Date.now() + 1000 * 60 * 60 * 24);
  const futureDate2 = new Date(Date.now() + 1000 * 60 * 60 * 48);
  const pastDate = new Date('2020-01-01T00:00:00Z');

  describe('Creation Flow', () => {
    it('should create a valid poll period successfully', () => {
      const period = PollPeriod.create(futureDate1, futureDate2);

      expect(period.start).toBe(futureDate1);
      expect(period.end).toBe(futureDate2);
    });
  });

  describe('Validation Errors', () => {
    it('should throw an error if start date is invalid (not a Date instance)', () => {
      // @ts-expect-error - Testando comportamento em runtime com tipo incorreto
      expect(() => PollPeriod.create('invalid-date', futureDate2)).toThrow(
        InvalidPollError,
      );
      // @ts-expect-error - Testando comportamento em runtime com tipo incorreto
      expect(() => PollPeriod.create('invalid-date', futureDate2)).toThrow(
        'A enquete deve ter uma data de início válida',
      );
    });

    it('should throw an error if start date is an Invalid Date object', () => {
      const invalidDate = new Date('invalid');

      expect(() => PollPeriod.create(invalidDate, futureDate2)).toThrow(
        InvalidPollError,
      );
      expect(() => PollPeriod.create(invalidDate, futureDate2)).toThrow(
        'A enquete deve ter uma data de início válida',
      );
    });

    it('should throw an error if end date is invalid', () => {
      // @ts-expect-error - Testando comportamento em runtime com tipo incorreto
      expect(() => PollPeriod.create(futureDate1, 'invalid-date')).toThrow(
        InvalidPollError,
      );
      // @ts-expect-error - Testando comportamento em runtime com tipo incorreto
      expect(() => PollPeriod.create(futureDate1, 'invalid-date')).toThrow(
        'A enquente deve ter uma data de término válida',
      );
    });

    it('should throw an error if start date is in the past', () => {
      expect(() => PollPeriod.create(pastDate, futureDate2)).toThrow(
        InvalidPollError,
      );
      expect(() => PollPeriod.create(pastDate, futureDate2)).toThrow(
        'A data de ínicio não pode ser no passado',
      );
    });

    it('should throw an error if end date is before or equal to start date', () => {
      expect(() => PollPeriod.create(futureDate1, futureDate1)).toThrow(
        InvalidPollError,
      );
      expect(() => PollPeriod.create(futureDate1, futureDate1)).toThrow(
        'A data de término deve ser posterior à de início',
      );
      expect(() => PollPeriod.create(futureDate2, futureDate1)).toThrow(
        InvalidPollError,
      );
    });
  });

  describe('Business Methods', () => {
    it('should calculate hours correctly', () => {
      const start = new Date('2030-01-01T10:00:00Z');
      const end = new Date('2030-01-01T15:00:00Z');
      const period = PollPeriod.create(start, end);

      expect(period.getHours()).toBe(5);
    });

    it('should check if poll has started or ended based on a given time', () => {
      const start = new Date('2030-01-01T10:00:00Z');
      const end = new Date('2030-01-01T15:00:00Z');
      const period = PollPeriod.create(start, end);

      const beforeStart = new Date('2030-01-01T09:00:00Z');
      const during = new Date('2030-01-01T12:00:00Z');
      const afterEnd = new Date('2030-01-01T16:00:00Z');

      expect(period.hasStarted(beforeStart)).toBe(false);
      expect(period.hasStarted(during)).toBe(true);

      expect(period.hasEnded(during)).toBe(false);
      expect(period.hasEnded(afterEnd)).toBe(true);
    });
  });
});
