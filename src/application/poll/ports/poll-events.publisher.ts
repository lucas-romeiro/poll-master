export interface PollEventsPublisher {
  publishVoteRegistered(event: VoteRegisteredEvent): void;
}

export interface VoteRegisteredEvent {
  occuredAt: Date;
  optionId: string;
  pollId: string;
  votes: number;
}
