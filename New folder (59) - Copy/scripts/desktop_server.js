/**
 * LedgerX Enterprise Desktop Production Server
 * Ultra-fast native Node HTTP server for desktop deployment.
 * Serves compiled `dist` bundle with SPA deep-linking and zero startup latency.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const PORT = 5173;
const HOST = '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json',
  '.map': 'application/json'
};

// Check if port is already active
function checkServerRunning(port, host, callback) {
  let finished = false;
  const done = (val) => {
    if (!finished) {
      finished = true;
      callback(val);
    }
  };
  const req = http.get(`http://127.0.0.1:${port}/health`, (res) => {
    done(res.statusCode === 200);
  });
  req.on('error', () => {
    done(false);
  });
  req.setTimeout(600, () => {
    req.destroy();
    done(false);
  });
}

function startServer() {
  const server = http.createServer((req, res) => {
    // 1. Health check endpoint for launcher probe
    if (req.url === '/health' || req.url === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ status: 'ok', server: 'LedgerX-Desktop', uptime: process.uptime() }));
      return;
    }

    // 2. Parse request path
    const urlObj = new URL(req.url, `http://${req.headers.host || HOST}`);
    let safePath = path.normalize(urlObj.pathname).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') safePath = '/index.html';

    let filePath = path.join(DIST_DIR, safePath);

    // If file doesn't exist, check public folder or fallback to SPA index.html
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      const publicPath = path.join(PROJECT_ROOT, 'public', safePath);
      if (fs.existsSync(publicPath) && !fs.statSync(publicPath).isDirectory()) {
        filePath = publicPath;
      } else {
        // SPA Fallback: All React Router routes serve dist/index.html
        filePath = path.join(DIST_DIR, 'index.html');
      }
    }

    // Read and serve file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server File Error: ' + err.message);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      // Cache headers: assets with hash can be cached forever, index.html is revalidated
      const headers = {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff'
      };

      // Disable cache for instant desktop updates
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';

      res.writeHead(200, headers);
      res.end(data);
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[LedgerX Server] Port ${PORT} already active. Existing instance running.`);
      process.exit(0);
    } else {
      console.error('[LedgerX Server Error]:', err);
      process.exit(1);
    }
  });

  server.listen(PORT, HOST, () => {
    console.log(`🚀 LedgerX Desktop Server running at http://${HOST}:${PORT}/`);
  });
}

checkServerRunning(PORT, HOST, (isRunning) => {
  if (isRunning) {
    console.log(`[LedgerX Server] Server is already running on http://${HOST}:${PORT}`);
    process.exit(0);
  } else {
    startServer();
  }
});
