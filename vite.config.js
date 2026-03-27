import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Tower-Battle-2/',
  root: '.',
  build: {
    outDir: 'docs',
  },
  server: {
    open: true
  }
});