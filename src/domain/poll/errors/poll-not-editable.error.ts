import { DomainError } from '../../shared';

export class PollNotEditableError extends DomainError {
  readonly code = 'POLL_NOT_EDITABLE';
  readonly type = 'CONFLICT';

  constructor() {
    super('A enquete não pode ser editada depois de iniciar');
  }
}
