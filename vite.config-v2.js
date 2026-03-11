import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// V2 variant config — runs on port 5174, uses index-v2.html as entry.
// The original v1 still runs from index.html on port 5173.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
  },
  build: {
    outDir: 'dist-v2',
    rollupOptions: {
      input: 'index-v2.html',
    },
  },
});
