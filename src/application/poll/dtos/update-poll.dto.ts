import z from 'zod';

import { createPollSchema } from './create-poll.dto';

export const updatePollSchema = createPollSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar',
  });

export type UpdatePollInput = z.infer<typeof updatePollSchema>;
