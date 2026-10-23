import type { Request, Response } from 'express';

import {
  createPollSchema,
  CreatePollUseCase,
  DeletePollUseCase,
  GetPollUseCase,
  listPollsQuerySchema,
  ListPollsUseCase,
  pollIdParamSchema,
  updatePollSchema,
  UpdatePollUseCase,
  voteParamsSchema,
  VoteUseCase,
} from '@/application/poll';

export interface PollUseCases {
  create: CreatePollUseCase;
  get: GetPollUseCase;
  list: ListPollsUseCase;
  remove: DeletePollUseCase;
  update: UpdatePollUseCase;
  vote: VoteUseCase;
}

export class PollController {
  create = async (req: Request, res: Response): Promise<void> => {
    const input = createPollSchema.parse(req.body);
    const poll = await this.useCases.create.execute(input);
    res.status(201).json(poll);
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const input = listPollsQuerySchema.parse(req.query);
    res.json(await this.useCases.list.execute(input));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const { id } = pollIdParamSchema.parse(req.params);
    res.json(await this.useCases.get.execute(id));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = pollIdParamSchema.parse(req.params);
    const input = updatePollSchema.parse(req.body);
    res.json(await this.useCases.update.execute(id, input));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const { id } = pollIdParamSchema.parse(req.params);
    await this.useCases.remove.execute(id);
    res.status(204).send();
  };

  vote = async (req: Request, res: Response): Promise<void> => {
    const params = voteParamsSchema.parse(req.params);
    res.json(await this.useCases.vote.execute(params));
  };

  constructor(private readonly useCases: PollUseCases) {}
}
