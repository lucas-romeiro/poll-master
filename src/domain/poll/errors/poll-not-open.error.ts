import { DomainError } from '../../shared';

export class PollNotOpenError extends DomainError {
  readonly code = 'POLL_NOT_OPEN';
  readonly type = 'CONFLICT';

  constructor() {
    super('A enquete não está aberta para votação');
  }
}
