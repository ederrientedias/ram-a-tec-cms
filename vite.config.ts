import { componentTagger } from 'lovable-tagger';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react(), mode === 'development' && componentTagger()].filter(Boolean),

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    host: true, // permite acesso via LAN (ex: em dispositivos móveis)
    port: 8080, // define a porta do dev server
    open: true, // abre o navegador automaticamente
  },

  build: {
    outDir: 'dist', // saída padrão do Vite
    sourcemap: mode === 'development', // ativa sourcemap só em dev
    emptyOutDir: true, // limpa a pasta dist antes da build
  },
}));
