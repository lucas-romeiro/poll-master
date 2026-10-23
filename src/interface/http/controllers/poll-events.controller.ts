import { Request, Response } from 'express';

import {
  GetPollUseCase,
  type PollEventsSubscriber,
  pollIdParamSchema,
} from '@/application/poll';

const HEARTBEAT_MS = 15_000;

export class PollEventsController {
  stream = async (req: Request, res: Response): Promise<void> => {
    const { id } = pollIdParamSchema.parse(req.params);
    const poll = await this.getPoll.execute(id);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    send('snapshot', poll);

    const unsubscribe = this.subscriber.onVoteRegistered(id, (e) => {
      send('vote', e);
    });
    const heartbeat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_MS);

    req.on('close', () => {
      clearInterval(heartbeat);
      unsubscribe();
    });
  };

  constructor(
    private readonly getPoll: GetPollUseCase,
    private readonly subscriber: PollEventsSubscriber,
  ) {}
}
