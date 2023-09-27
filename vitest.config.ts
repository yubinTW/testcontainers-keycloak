import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    hookTimeout: 120_000,
    testTimeout: 120_000
  }
})
