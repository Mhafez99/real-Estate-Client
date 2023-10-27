import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';

/** @type {import('vite').UserConfig} */
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3500',
        secure: false,
      },
    },
  },

  plugins: [react()],
});
