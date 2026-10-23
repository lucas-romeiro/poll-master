import express, { type Express } from 'express';
import swaggerUi from 'swagger-ui-express';

import { Dependencies, makeControllers } from '@/container';

import { openApiDocument } from '../docs';
import { errorHandler, notFound } from './middlewares';
import { pollRoutes } from './routes';

export function createApp(deps: Dependencies): Express {
  const app = express();
  const { pollController, pollEventsController } = makeControllers(deps);

  app.use(express.json());
  app.get('/docs.json', (_req, res) => {
    res.json(openApiDocument);
  });
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use('/polls', pollRoutes(pollController, pollEventsController));
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
