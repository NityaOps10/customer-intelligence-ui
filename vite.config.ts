import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost:3000');
        const pathname = url.pathname;

        try {
          // Dynamic import of mock data
          const { MOCK_INSIGHTS, MOCK_EVIDENCE } = await server.ssrLoadModule('/src/mock.ts');

          if (pathname === '/api/insights') {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(MOCK_INSIGHTS));
            return;
          }

          if (pathname === '/api/download-zip') {
            const JSZip = (await import('jszip')).default;
            const fs = await import('node:fs');
            const path = await import('node:path');
            const zip = new JSZip();
            const rootDir = process.cwd();
            const ignore = new Set(['node_modules', '.git', 'dist', '.cache', 'customer-intelligence-project.zip']);

            const addDir = (currentDir: string, zipFolder: any) => {
              const entries = fs.readdirSync(currentDir, { withFileTypes: true });
              for (const entry of entries) {
                if (ignore.has(entry.name)) continue;
                const full = path.join(currentDir, entry.name);
                if (entry.isDirectory()) {
                  addDir(full, zipFolder.folder(entry.name));
                } else if (entry.isFile()) {
                  zipFolder.file(entry.name, fs.readFileSync(full));
                }
              }
            };

            addDir(rootDir, zip);
            const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', 'attachment; filename="customer-intelligence-project.zip"');
            res.statusCode = 200;
            res.end(buffer);
            return;
          }

          const evidenceMatch = pathname.match(/^\/api\/insights\/([^/]+)\/evidence$/);
          if (evidenceMatch) {
            const insightId = decodeURIComponent(evidenceMatch[1]);
            const evidence = MOCK_EVIDENCE[insightId] || [];
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(evidence));
            return;
          }

          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Endpoint not found' }));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
