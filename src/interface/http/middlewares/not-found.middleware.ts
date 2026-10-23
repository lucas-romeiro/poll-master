import { RequestHandler } from 'express';

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({
    code: 'ROUTE_NOT_FOUND',
    message: `Rota ${req.method} ${req.path} não encontrada`,
    status: 'fail',
  });
};
