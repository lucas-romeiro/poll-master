import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import z from 'zod';

import { PollStatus } from '@/domain/poll';

extendZodWithOpenApi(z);

export const pollOutputSchema = z
  .object({
    endDate: z
      .string()
      .openapi({ example: '2026-12-31T23:59:59.000Z', format: 'date-time' }),
    id: z.uuid(),
    options: z.array(
      z.object({
        id: z.uuid(),
        text: z.string().openapi({ example: 'TypeScript ' }),
        votes: z.number().int().openapi({ example: 12 }),
      }),
    ),
    question: z.string().openapi({ example: 'Melhor linguagem? ' }),
    startDate: z
      .string()
      .openapi({ example: '2026-10-11T00:00:00.000Z', format: 'date-time' }),
    status: z.enum(PollStatus),
    totalVotes: z.number().int().openapi({ example: 30 }),
  })
  .openapi('Poll');

export const paginatedPollsSchema = z
  .object({
    items: z.array(pollOutputSchema),
    meta: z.object({
      hasNext: z.boolean(),
      page: z.number().int(),
      perPage: z.number().int(),
      total: z.number().int(),
      totalPages: z.number().int(),
    }),
  })
  .openapi('PaginatedPolls');

export const voteResultSchema = z
  .object({ optionId: z.uuid(), pollId: z.uuid(), votes: z.number().int() })
  .openapi('VoteResult');

export const errorSchema = z.object({
  code: z.string().openapi({ example: 'POLL_NOT_EDITABLE' }),
  issues: z
    .array(z.object({ message: z.string(), path: z.string() }))
    .optional(),
  message: z
    .string()
    .openapi({ example: 'A enquete não pode ser editada depois de ínciar ' }),
  status: z.enum(['fail', 'error']),
});
