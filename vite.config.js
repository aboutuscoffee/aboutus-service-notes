import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/aboutus-service-notes/',
  server: { port: 5182 },
});
