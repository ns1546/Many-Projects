import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  server: {
    port: 4321,
    host: true,
  },
  build: {
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
    assetsInlineLimit: 4096,
  },
});
