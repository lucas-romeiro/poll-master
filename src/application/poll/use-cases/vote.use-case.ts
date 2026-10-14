import { type IPollRepository, PollNotFoundError } from '@/domain/poll';

import { type VoteInput } from '../dtos/poll-params.dto';
import { type PollEventsPublisher } from '../ports/poll-events.publisher';

export class VoteUseCase {
  constructor(
    private readonly polls: IPollRepository,
    private readonly events: PollEventsPublisher,
  ) {}

  async execute({ id, optionId }: VoteInput) {
    const poll = await this.polls.findById(id);

    if (!poll) {
      throw new PollNotFoundError(id);
    }

    poll.ensureCanVote(optionId);
    const votes = await this.polls.incrementVote(optionId);

    this.events.publishVoteRegistered({
      occuredAt: new Date(),
      optionId,
      pollId: id,
      votes,
    });

    return { optionId, pollId: id, votes };
  }
}
