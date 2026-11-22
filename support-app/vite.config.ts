import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// This app is published inside the existing user.github.io site at /support/.
export default defineConfig({
  plugins: [react()],
  base: '/support/',
  build: { outDir: 'dist', emptyOutDir: true },
});
