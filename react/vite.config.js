import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({base:'/invincible/',plugins:[react()],build:{outDir:'../react-dist',emptyOutDir:true,rollupOptions:{input:'src/main.jsx',output:{entryFileNames:'assets/invincible-app.js',chunkFileNames:'assets/[name].js',assetFileNames:'assets/invincible-app.[ext]'}}}});
