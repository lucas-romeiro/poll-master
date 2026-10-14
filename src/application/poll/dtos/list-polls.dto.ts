import z from 'zod';

import { PollStatus } from '@/domain/poll';

export const listPollsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(PollStatus).optional(),
});

export type ListPollsInput = z.infer<typeof listPollsQuerySchema>;
