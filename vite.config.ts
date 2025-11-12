import federation from '@originjs/vite-plugin-federation';
import { componentTagger } from 'lovable-tagger';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    federation({
      name: 'cms',
      filename: 'remoteEntry.js',
      exposes: {
        './CmsApp': './src/App.tsx',
        './style': './src/index.css',
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ].filter(Boolean),

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    host: true, // permite acesso via LAN (ex: em dispositivos móveis)
    port: 5002, // define a porta do dev server
    open: true, // abre o navegador automaticamente
  },
  preview: {
    port: 5002,
    strictPort: true,
  },
  build: {
    outDir: 'dist', // saída padrão do Vite
    target: 'esnext', // ou 'esnext'
    sourcemap: mode === 'development', // ativa sourcemap só em dev
    emptyOutDir: true, // limpa a pasta dist antes da build
    cssCodeSplit: false,
  },
}));
