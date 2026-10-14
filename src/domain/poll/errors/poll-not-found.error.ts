import { DomainError } from '../../shared';

export class PollNotFoundError extends DomainError {
  readonly code = 'POLL_NOT_FOUND';
  readonly type = 'NOT_FOUND';

  constructor(id: string) {
    super(`Enquete ${id} não encontrada`);
  }
}
