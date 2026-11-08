// Локальный сервер для разработки: node dev-server.js → http://localhost:3000
import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import handler from './api/handler.js';

const PORT = process.env.PORT || 3000;
const ROOT = path.join(process.cwd(), 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith('/api/')) {
    req.url = `/api/handler?route=${encodeURIComponent(url.pathname.slice(5))}&${url.searchParams}`;
    return handler(req, res);
  }
  const p = url.pathname;
  const candidates = [p, `${p}.html`, path.join(p, 'index.html')];
  if (p.startsWith('/portal')) candidates.push('/portal/index.html');
  for (const c of candidates) {
    const file = path.join(ROOT, path.normalize(c));
    if (!file.startsWith(ROOT)) break;
    try {
      const stat = await fs.stat(file);
      if (!stat.isFile()) continue;
      res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
      return res.end(await fs.readFile(file));
    } catch {}
  }
  res.statusCode = 404;
  res.end('Not found');
}).listen(PORT, () => console.log(`Hawkins Education → http://localhost:${PORT}`));
