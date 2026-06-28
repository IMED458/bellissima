import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ command }) => ({
  // GitHub Pages პროექტის საიტი იხსნება /bellissima/ ქვემისამართზე;
  // dev სერვერი კი root-ზე რჩება.
  base: command === 'build' ? '/bellissima/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
}));
