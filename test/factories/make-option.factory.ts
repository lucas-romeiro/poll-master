import { randomUUID } from 'node:crypto';

import { Option, ReconstituteOptionProps } from '@/domain/poll';

export function makeOption(
  override?: Partial<ReconstituteOptionProps>,
): Option {
  return Option.reconstitute({
    id: randomUUID(),
    text: 'Opção de teste',
    votes: 0,
    ...override,
  });
}
