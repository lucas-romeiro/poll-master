import { randomUUID } from 'crypto';

import { Entity } from '../../shared';
import { InvalidPollError } from '../errors/invalid-poll.error';

export interface OptionProps {
  text: string;
  votes: number;
}

export interface ReconstituteOptionProps extends OptionProps {
  id: string;
}

export class Option extends Entity<OptionProps> {
  private constructor(id: string, props: OptionProps) {
    super(id, props);
  }

  static create(text: string): Option {
    const value = text.trim();

    if (!value) {
      throw new InvalidPollError('O texto da opção é obrigatório');
    }

    return new Option(randomUUID(), {
      text: value,
      votes: 0,
    });
  }

  static reconstitute({ id, ...props }: ReconstituteOptionProps): Option {
    return new Option(id, props);
  }

  get text(): string {
    return this.props.text;
  }

  get votes(): number {
    return this.props.votes;
  }
}
