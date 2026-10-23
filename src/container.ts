import {
  CreatePollUseCase,
  DeletePollUseCase,
  GetPollUseCase,
  ListPollsUseCase,
  PollEventsPublisher,
  PollEventsSubscriber,
  UpdatePollUseCase,
  VoteUseCase,
} from './application/poll';
import { IPollRepository } from './domain/poll';
import {
  PollController,
  PollEventsController,
} from './interface/http/controllers';

export interface Dependencies {
  events: PollEventsPublisher & PollEventsSubscriber;
  polls: IPollRepository;
}

export function makeControllers({ events, polls }: Dependencies) {
  const get = new GetPollUseCase(polls);

  return {
    pollController: new PollController({
      create: new CreatePollUseCase(polls),
      get,
      list: new ListPollsUseCase(polls),
      remove: new DeletePollUseCase(polls),
      update: new UpdatePollUseCase(polls),
      vote: new VoteUseCase(polls, events),
    }),
    pollEventsController: new PollEventsController(get, events),
  };
}
