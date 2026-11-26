import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(__dirname, 'server_data');
const notesFilePath = path.join(dataDir, 'notes.json');
const foldersFilePath = path.join(dataDir, 'folders.json');

// Ensure server_data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function notesSyncPlugin() {
  return {
    name: 'notes-sync-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url.split('?')[0];

        // Enable CORS for mobile device requests
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        // ==========================================
        // 1. NOTES API
        // ==========================================
        if (url === '/api/notes') {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            if (fs.existsSync(notesFilePath)) {
              try {
                const data = fs.readFileSync(notesFilePath, 'utf-8');
                res.end(data || '[]');
              } catch (e) {
                res.end('[]');
              }
            } else {
              res.end('[]');
            }
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                let existing = [];
                if (fs.existsSync(notesFilePath)) {
                  try {
                    existing = JSON.parse(fs.readFileSync(notesFilePath, 'utf-8') || '[]');
                  } catch (e) {
                    existing = [];
                  }
                }

                if (Array.isArray(parsed)) {
                  existing = parsed;
                } else if (parsed && parsed.id) {
                  const idx = existing.findIndex(n => n.id === parsed.id);
                  if (idx >= 0) {
                    existing[idx] = parsed;
                  } else {
                    existing.unshift(parsed);
                  }
                }

                fs.writeFileSync(notesFilePath, JSON.stringify(existing, null, 2), 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, count: existing.length }));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }
        }

        if (url.startsWith('/api/notes/') && req.method === 'DELETE') {
          const id = url.replace('/api/notes/', '');
          if (fs.existsSync(notesFilePath)) {
            try {
              let existing = JSON.parse(fs.readFileSync(notesFilePath, 'utf-8') || '[]');
              existing = existing.filter(n => n.id !== id);
              fs.writeFileSync(notesFilePath, JSON.stringify(existing, null, 2), 'utf-8');
            } catch (e) {}
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
          return;
        }

        // ==========================================
        // 2. FOLDERS API
        // ==========================================
        if (url === '/api/folders') {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            if (fs.existsSync(foldersFilePath)) {
              try {
                const data = fs.readFileSync(foldersFilePath, 'utf-8');
                res.end(data || '[]');
              } catch (e) {
                res.end('[]');
              }
            } else {
              res.end('[]');
            }
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                if (Array.isArray(parsed)) {
                  fs.writeFileSync(foldersFilePath, JSON.stringify(parsed, null, 2), 'utf-8');
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, count: parsed.length }));
                } else {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'Expected array of folders' }));
                }
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), notesSyncPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: false
  }
});

