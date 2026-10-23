import { InMemoryPollEvents } from '@/infrastructure/database/events';
import { createApp } from '@/interface/http';

import { InMemoryPollRepository } from '../fakes';

export function makeTestApp() {
  const polls = new InMemoryPollRepository();
  const events = new InMemoryPollEvents();
  return { app: createApp({ events, polls }), events, polls };
}
