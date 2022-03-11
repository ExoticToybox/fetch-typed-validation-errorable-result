/// <reference types="vitest" />

import * as path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  test: {
    setupFiles: ['./src/setup-tests/enable-fetch.untestable.ts'],
  },
});
