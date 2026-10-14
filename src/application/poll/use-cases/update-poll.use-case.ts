import { type IPollRepository, PollNotFoundError } from '@/domain/poll';

import { type PollOutput } from '../dtos/poll-output.dto';
import { type UpdatePollInput } from '../dtos/update-poll.dto';
import { toPollOutput } from '../mappers/poll.mapper';

export class UpdatePollUseCase {
  constructor(private readonly polls: IPollRepository) {}

  async execute(id: string, input: UpdatePollInput): Promise<PollOutput> {
    const poll = await this.polls.findById(id);

    if (!poll) {
      throw new PollNotFoundError(id);
    }

    poll.update(input);
    await this.polls.save(poll);

    return toPollOutput(poll);
  }
}
