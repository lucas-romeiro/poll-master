import { Router } from 'express';

import { PollController, PollEventsController } from '../controllers';

export function pollRoutes(
  polls: PollController,
  events: PollEventsController,
): Router {
  const router = Router();

  router.post('/', polls.create);
  router.get('/', polls.list);
  router.get('/:id', polls.getById);
  router.patch('/:id', polls.update);
  router.delete('/:id', polls.remove);
  router.post('/:id/options/:optionId/votes', polls.vote);
  router.get('/:id/events', events.stream);

  return router;
}
