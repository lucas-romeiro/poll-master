import { EventEmitter } from 'node:events';

import {
  PollEventsPublisher,
  PollEventsSubscriber,
  VoteRegisteredEvent,
} from '@/application/poll';

export class InMemoryPollEvents
  implements PollEventsPublisher, PollEventsSubscriber
{
  private readonly emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(0);
  }

  publishVoteRegistered(event: VoteRegisteredEvent): void {
    this.emitter.emit(this.channel(event.pollId), event);
  }

  onVoteRegistered(
    pollId: string,
    listener: (e: VoteRegisteredEvent) => void,
  ): () => void {
    const channel = this.channel(pollId);
    this.emitter.on(channel, listener);
    return () => this.emitter.off(channel, listener);
  }

  private channel(pollId: string): string {
    return `vote:${pollId}`;
  }
}
