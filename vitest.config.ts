import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/utils/dateFormatter.ts',
        'src/utils/releaseNotesParser.ts',
        'src/utils/schengenCalculator.ts',
      ],
    },
  },
});
