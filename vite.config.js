import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd()); // Carrega as variáveis do .env

  return {
    server: {
      host: env.VITE_HOST || 'localhost',
      port: parseInt(env.VITE_PORT) || 3000,
      open: true, // Abre o navegador automaticamente
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)), // Alias para facilitar imports
      },
    },
    define: {
      // Define variáveis globais para uso no código Vue
      'process.env': {
        VITE_API_BASE_URL: env.VITE_API_BASE_URL,
        VITE_ENVIRONMENT: env.VITE_ENVIRONMENT,
      },
    },
    plugins: [vue()],
  };
});

