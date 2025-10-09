import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath, URL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const repository = process.env.GITHUB_REPOSITORY?.split('/')?.pop();
  const defaultBuildBase = repository ? `/${repository}/` : './';

  const explicitBase = env.VITE_BASE_URL?.trim();
  const normalizedExplicitBase = (() => {
    if (!explicitBase) return undefined;

    const withTrailingSlash = explicitBase.endsWith('/') ? explicitBase : `${explicitBase}/`;
    if (withTrailingSlash.startsWith('/') || withTrailingSlash.startsWith('./')) {
      return withTrailingSlash;
    }

    return `/${withTrailingSlash}`;
  })();

  const base = normalizedExplicitBase ?? (command === 'build' ? defaultBuildBase : '/');

  return {
    base,
    plugins: [react()],
    resolve: {
      alias: [
        { find: '@/entities', replacement: path.resolve(__dirname, 'test-stubs/entities') },
        { find: '@/integrations', replacement: path.resolve(__dirname, 'test-stubs/integrations') },
        { find: '@/components/ui', replacement: path.resolve(__dirname, 'test-stubs/components/ui') },
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
