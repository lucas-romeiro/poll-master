import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { DomainError, type DomainErrorType } from '@/domain/shared';

const statusType: Record<DomainErrorType, number> = {
  CONFLICT: 409,
  NOT_FOUND: 404,
  VALIDATION: 422,
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      issues: err.issues.map((i) => ({
        message: i.message,
        path: i.path.map(String).join('.'),
      })),
      message: 'Dados de entrada inválidos',
      status: 'fail',
    });
    return;
  }

  if (err instanceof DomainError) {
    res.status(statusType[err.type]).json({
      code: err.code,
      message: err.message,
      status: 'fail',
    });
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      code: 'MALFORMED_JSON',
      message: 'JSON inválido',
      status: 'fail',
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'Erro interno do servidor',
    status: 'error',
  });
  next();
};
