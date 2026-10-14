import { vi } from 'vitest';

import type { PollEventsSubscriber } from '@/application/poll';

export const createMockPollEventsSubscriber = (): PollEventsSubscriber => ({
  onVoteRegistered: vi.fn().mockReturnValue(vi.fn()),
});
