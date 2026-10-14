import z from 'zod';

export const createPollSchema = z.object({
  endDate: z.coerce.date(),
  options: z.array(z.string().min(3)).min(3),
  question: z.string().min(10),
  startDate: z.coerce.date(),
});

export type CreatePollInput = z.infer<typeof createPollSchema>;
