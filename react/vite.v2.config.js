import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('./v2', import.meta.url));
export default defineConfig({
  root, base: '/invincible/v2/', plugins: [react()],
  // Never clean V1's react-dist or refresh its HTML loaders.
  build: {outDir: '../../v2-dist', emptyOutDir: true},
  server: {host: 'localhost'},
});
