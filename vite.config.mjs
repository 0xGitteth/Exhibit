import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath, URL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react()],
    resolve: {
      alias: [
        { find: '@/entities', replacement: path.resolve(__dirname, 'entities') },
        { find: '@/integrations', replacement: path.resolve(__dirname, 'src/integrations') },
        { find: '@/components', replacement: path.resolve(__dirname, 'Components') },
        { find: '@/pages', replacement: path.resolve(__dirname, 'Pages') },
        { find: '@/utils', replacement: path.resolve(__dirname, 'utils') },
        // general '@' to point to ./src (kept last so specific '@/...' aliases win)
        { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      ],
    },
    build: {
      outDir: 'dist',
    },
  };
});
