import { DomainError } from '../../shared';

export class OptionNotFoundError extends DomainError {
  readonly code = 'OPTION_NOT_FOUND';
  readonly type = 'NOT_FOUND';

  constructor(id: string) {
    super(`Opção ${id} não encontrada nesta enquete`);
  }
}
