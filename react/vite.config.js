import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({base:'/invincible/',plugins:[react()],build:{outDir:'../react-dist',emptyOutDir:true,cssCodeSplit:false,rollupOptions:{input:'src/main.jsx',output:{entryFileNames:'assets/invincible-app-[hash].js',chunkFileNames:'assets/[name]-[hash].js',assetFileNames:'assets/[name]-[hash][extname]',manualChunks:id=>id.includes('/node_modules/@firebase/')||id.includes('/node_modules/firebase/')?'firebase':undefined}}}});
