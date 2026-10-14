import type { Poll } from '@/domain/poll';

import type { PollOutput } from '../dtos/poll-output.dto';

export function toPollOutput(poll: Poll, now = new Date()): PollOutput {
  return {
    endDate: poll.endDate.toISOString(),
    id: poll.id,
    options: poll.options.map((o) => ({
      id: o.id,
      text: o.text,
      votes: o.votes,
    })),
    question: poll.question,
    startDate: poll.startDate.toISOString(),
    status: poll.status(now),
    totalVotes: poll.totalVotes,
  };
}
