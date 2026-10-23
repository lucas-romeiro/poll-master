import { randomUUID } from 'node:crypto';

import { Poll, ReconstitutePollProps } from '@/domain/poll';

export function makePoll(override?: Partial<ReconstitutePollProps>): Poll {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return Poll.reconstitute({
    endDate: nextWeek,
    id: randomUUID(),
    options: [
      { id: randomUUID(), text: 'TypeScript', votes: 0 },
      { id: randomUUID(), text: 'JavaScript', votes: 0 },
      { id: randomUUID(), text: 'Go', votes: 0 },
    ],
    question: 'Qual é a sua linguagem de programação favorita?',
    startDate: tomorrow,
    ...override,
  });
}
