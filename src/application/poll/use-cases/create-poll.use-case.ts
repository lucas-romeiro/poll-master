import { type IPollRepository, Poll } from '@/domain/poll';

import { type CreatePollInput } from '../dtos/create-poll.dto';
import { type PollOutput } from '../dtos/poll-output.dto';
import { toPollOutput } from '../mappers/poll.mapper';

export class CreatePollUseCase {
  constructor(private readonly polls: IPollRepository) {}

  async execute(input: CreatePollInput): Promise<PollOutput> {
    const poll = Poll.create(input);
    await this.polls.save(poll);
    return toPollOutput(poll);
  }
}
