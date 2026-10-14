import { InvalidPollError } from '../errors/invalid-poll.error';

export class Question {
  private constructor(readonly value: string) {}

  static create(raw: string): Question {
    const value = raw.trim();

    if (!raw) {
      throw new InvalidPollError('A enquete deve ter uma pergunta');
    }

    if (value.length < 10) {
      throw new InvalidPollError('A pergunta deve ter no mínimo 10 caracteres');
    }

    if (value.length > 255) {
      throw new InvalidPollError(
        'A pergunta deve ter no máximo 255 caracteres',
      );
    }

    return new Question(value);
  }
}
