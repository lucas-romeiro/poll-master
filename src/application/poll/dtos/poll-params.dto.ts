import z from 'zod';

export const pollIdParamSchema = z.object({ id: z.uuid() });

export const voteParamsSchema = z.object({
  id: z.uuid(),
  optionId: z.uuid(),
});

export type VoteInput = z.infer<typeof voteParamsSchema>;
