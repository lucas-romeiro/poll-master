import { Poll } from '@/domain/poll';

import type { Prisma } from '../generated/client';

export type PrismaPollWithOptions = Prisma.PollGetPayload<{
  include: { options: true };
}>;

export const PrismaPollMapper = {
  toDomain(raw: PrismaPollWithOptions): Poll {
    return Poll.reconstitute({
      endDate: raw.endDate,
      id: raw.id,
      options: raw.options.map((o) => ({
        id: o.id,
        text: o.text,
        votes: o.votes,
      })),
      question: raw.question,
      startDate: raw.startDate,
    });
  },

  toPersistence(poll: Poll, now = new Date()) {
    return {
      options: poll.options.map((o) => ({ id: o.id, text: o.text })),
      poll: {
        endDate: poll.endDate,
        id: poll.id,
        question: poll.question,
        startDate: poll.startDate,
        status: poll.status(now),
      },
    };
  },
};
