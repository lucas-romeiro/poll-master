import { vi } from 'vitest';

import type { PollEventsPublisher } from '@/application/poll';

export const createMockPollEventsPublisher = (): PollEventsPublisher => ({
  publishVoteRegistered: vi.fn(),
});
