import type { VoteRegisteredEvent } from './poll-events.publisher';

export interface PollEventsSubscriber {
  onVoteRegistered(
    pollId: string,
    listener: (e: VoteRegisteredEvent) => void,
  ): () => void;
}
