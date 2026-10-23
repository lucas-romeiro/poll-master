import { InMemoryPollEvents } from './infrastructure/database/events';
import { prisma, PrismaPollRepository } from './infrastructure/database/prisma';
import { createApp } from './interface/http';

const app = createApp({
  events: new InMemoryPollEvents(),
  polls: new PrismaPollRepository(prisma),
});

const port = Number(process.env.PORT ?? 3000);
const server = app.listen(port, () => {
  console.log(`Poll Master rodando em http://localhost:${String(port)}`);
});

async function shutdown() {
  server.closeAllConnections();
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());
