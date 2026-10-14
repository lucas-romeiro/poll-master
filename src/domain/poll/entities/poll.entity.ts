import { randomUUID } from 'crypto';

import { Entity } from '../../shared';
import { InvalidPollError } from '../errors/invalid-poll.error';
import { OptionNotFoundError } from '../errors/option-not-found.error';
import { PollNotEditableError } from '../errors/poll-not-editable.error';
import { PollNotOpenError } from '../errors/poll-not-open.error';
import { PollPeriod } from '../values_objects/poll-period.vo';
import { PollStatus } from '../values_objects/poll-status.vo';
import { Question } from '../values_objects/question.vo';
import { Option, type ReconstituteOptionProps } from './option.entity';

const MIN_OPTIONS = 3;

export interface CreatePollProps {
  endDate: Date;
  options: string[];
  question: string;
  startDate: Date;
}

export interface ReconstitutePollProps {
  endDate: Date;
  id: string;
  options: ReconstituteOptionProps[];
  question: string;
  startDate: Date;
}

export type UpdatePollProps = Partial<CreatePollProps>;

interface PollProps {
  options: Option[];
  period: PollPeriod;
  question: Question;
}

export class Poll extends Entity<PollProps> {
  private constructor(id: string, props: PollProps) {
    super(id, props);
  }

  static create(input: CreatePollProps): Poll {
    const options = input.options.map((text) => Option.create(text));
    Poll.ensureMinOptions(options);

    return new Poll(randomUUID(), {
      options,
      period: PollPeriod.create(input.startDate, input.endDate),
      question: Question.create(input.question),
    });
  }

  static reconstitute(data: ReconstitutePollProps): Poll {
    return new Poll(data.id, {
      options: data.options.map((props) => Option.reconstitute({ ...props })),
      period: PollPeriod.reconstitute(data.startDate, data.endDate),
      question: Question.create(data.question),
    });
  }

  private static ensureMinOptions(options: Option[]): void {
    if (options.length < MIN_OPTIONS) {
      throw new InvalidPollError(
        `A enquete deve ter no mínimo ${String(MIN_OPTIONS)} opções`,
      );
    }
  }

  status(now = new Date()): PollStatus {
    const { period } = this.props;

    if (!period.hasStarted(now)) {
      return PollStatus.NOT_STARTED;
    }

    if (period.hasEnded(now)) {
      return PollStatus.FINISHED;
    }

    return this.totalVotes === 0 ? PollStatus.STARTED : PollStatus.IN_PROGRESS;
  }

  update(input: UpdatePollProps, now = new Date()): void {
    if (this.status(now) !== PollStatus.NOT_STARTED) {
      throw new PollNotEditableError();
    }

    if (input.question !== undefined) {
      this.props.question = Question.create(input.question);
    }

    if (input.startDate || input.endDate) {
      this.props.period = PollPeriod.create(
        input.startDate ?? this.startDate,
        input.endDate ?? this.endDate,
      );
    }

    if (input.options) {
      const options = input.options.map((text) => Option.create(text));
      Poll.ensureMinOptions(options);
      this.props.options = options;
    }
  }

  ensureCanVote(optionId: string, now = new Date()): void {
    const status = this.status(now);

    if (status !== PollStatus.STARTED && status !== PollStatus.IN_PROGRESS) {
      throw new PollNotOpenError();
    }

    if (!this.props.options.some((o) => o.id === optionId)) {
      throw new OptionNotFoundError(optionId);
    }
  }

  get question(): string {
    return this.props.question.value;
  }

  get startDate(): Date {
    return this.props.period.start;
  }

  get endDate(): Date {
    return this.props.period.end;
  }

  get options(): readonly Option[] {
    return [...this.props.options];
  }

  get totalVotes(): number {
    return this.props.options.reduce((sum, o) => sum + o.votes, 0);
  }
}
