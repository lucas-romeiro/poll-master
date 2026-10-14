import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      exclude: [
        'src/**/generated/**',
        'src/main.ts',
        'src/infrastructure/database/**',
      ],
      include: ['src/**/*.ts'],
      provider: 'v8',
    },
    environment: 'node',
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
  },
});
