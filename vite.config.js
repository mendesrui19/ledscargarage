import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        catalogo: resolve(__dirname, 'catalogo.html'),
      },
    },
  },
});
