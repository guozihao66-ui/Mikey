import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

// V2 variant config — runs on port 5174, uses index-v2.html as dev entry.
// For production/Vercel we rename the built HTML entry to index.html so the site root resolves correctly.
function renameV2EntryForVercel() {
  return {
    name: 'rename-v2-entry-for-vercel',
    closeBundle() {
      const outDir = path.resolve(process.cwd(), 'dist-v2');
      const from = path.join(outDir, 'index-v2.html');
      const to = path.join(outDir, 'index.html');

      if (fs.existsSync(from)) {
        fs.copyFileSync(from, to);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), renameV2EntryForVercel()],
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
