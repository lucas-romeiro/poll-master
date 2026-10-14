import { DomainError } from '../../shared';

export class InvalidPollError extends DomainError {
  readonly code = 'INVALID_POLL';
  readonly type = 'VALIDATION';
}
