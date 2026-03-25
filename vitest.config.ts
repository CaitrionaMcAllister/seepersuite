import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      // server-only throws in non-RSC environments; mock it for tests
      'server-only': path.resolve(__dirname, '__mocks__/server-only.ts'),
    },
  },
})
