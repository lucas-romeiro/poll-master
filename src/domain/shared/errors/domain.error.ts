export type DomainErrorType = 'CONFLICT' | 'NOT_FOUND' | 'VALIDATION';

export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly type: DomainErrorType;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
