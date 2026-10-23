import type {
  IPollRepository,
  Poll,
  ReconstitutePollProps,
} from '@/domain/poll';

import { makePoll } from './make-poll.factory';

const DAY = 86_400_000;

export const openPeriod = () => ({
  endDate: new Date(Date.now() + 7 * DAY),
  startDate: new Date(Date.now() - DAY),
});

export const finishedPeriod = () => ({
  endDate: new Date(Date.now() - DAY),
  startDate: new Date(Date.now() - 10 * DAY),
});

export async function seedPoll(
  repo: IPollRepository,
  override?: Partial<ReconstitutePollProps>,
): Promise<Poll> {
  const poll = makePoll(override);
  await repo.save(poll);
  return poll;
}
