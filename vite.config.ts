import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Collect all available keys
  const apiKeys = [
    env.VITE_API_KEY,
    env.VITE_API_KEY_2,
    env.VITE_API_KEY_3,
    env.VITE_API_KEY_4,
    env.VITE_API_KEY_5,
    env.API_KEY
  ].filter(Boolean);

  return {
    plugins: [react()],
    base: '/Harakatullah/',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    define: {
      // Expose the list of keys for rotation
      'process.env.API_KEYS': JSON.stringify(apiKeys),
      // Fallback for single-key usage
      'process.env.API_KEY': JSON.stringify(apiKeys[0] || ''),
    }
  };
});