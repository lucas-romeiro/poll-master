import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

config({ path: process.env.ENV_FILE ?? '.env.development' });

export default defineConfig({
  datasource: { url: env('DATABASE_URL') },
  migrations: { path: 'prisma/migrations' },
  schema: 'prisma/schema.prisma',
});
