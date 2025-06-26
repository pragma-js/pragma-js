import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    allowedHosts: [
      '190d-2804-14d-32b2-85d5-5d44-ef12-a446-d3e1.ngrok-free.app',
      'localhost',  // For local testing
      '127.0.0.1'   // For local testing
    ]
  }
});
