import { InvalidPollError } from '../errors/invalid-poll.error';

export class PollPeriod {
  private constructor(
    readonly start: Date,
    readonly end: Date,
  ) {}

  static create(start: Date, end: Date): PollPeriod {
    PollPeriod.validateDates(start, end);

    if (PollPeriod.isBeforeNow(start)) {
      throw new InvalidPollError('A data de ínicio não pode ser no passado');
    }

    return new PollPeriod(start, end);
  }

  static reconstitute(start: Date, end: Date): PollPeriod {
    PollPeriod.validateDates(start, end);

    return new PollPeriod(start, end);
  }

  private static validateDates(start: Date, end: Date): void {
    if (!(start instanceof Date) || isNaN(start.getTime())) {
      throw new InvalidPollError(
        'A enquete deve ter uma data de início válida',
      );
    }

    if (!(end instanceof Date) || isNaN(end.getTime())) {
      throw new InvalidPollError(
        'A enquente deve ter uma data de término válida',
      );
    }

    if (end <= start) {
      throw new InvalidPollError(
        'A data de término deve ser posterior à de início',
      );
    }
  }

  private static isBeforeNow(date: Date): boolean {
    const now = new Date();
    now.setSeconds(0, 0);
    return date < now;
  }

  getHours(): number {
    const ms = this.end.getTime() - this.start.getTime();
    return ms / (1000 * 60 * 60);
  }
  hasStarted(now: Date): boolean {
    return now >= this.start;
  }

  hasEnded(now: Date): boolean {
    return now >= this.end;
  }
}
