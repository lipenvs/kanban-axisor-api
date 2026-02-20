import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    pool: 'forks',
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ["text", "html"],
    },
    server: {
      deps: {
        inline: ['zod'],
      },
    },
  },
})
