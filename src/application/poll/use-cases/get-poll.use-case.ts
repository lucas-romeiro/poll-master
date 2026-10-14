import { type IPollRepository, PollNotFoundError } from '@/domain/poll';

import { type PollOutput } from '../dtos/poll-output.dto';
import { toPollOutput } from '../mappers/poll.mapper';

export class GetPollUseCase {
  constructor(private readonly polls: IPollRepository) {}

  async execute(id: string): Promise<PollOutput> {
    const poll = await this.polls.findById(id);

    if (!poll) {
      throw new PollNotFoundError(id);
    }

    return toPollOutput(poll);
  }
}
