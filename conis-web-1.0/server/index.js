'use strict';

/**
 * CONIS local static server + mock POST /qualification
 * Replace decideQualification() with production backend without changing the frontend contract.
 *
 * Contract:
 *   POST /qualification
 *   Body: JSON answers object
 *   Response: { status: "A" | "B" | "C", calendlyUrl?: string }
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

/**
 * Mock decision engine — replaceable production implementation.
 * Frontend must not embed this logic.
 */
function decideQualification(answers) {
  if (!answers || typeof answers !== 'object') {
    return { status: 'B' };
  }

  if (answers.ready_for_pilot === 'Ne') {
    return { status: 'A' };
  }

  if (answers.priority === 'Více poptávek') {
    return { status: 'B' };
  }

  const strongVolume =
    answers.annual_sales === '100–300' ||
    answers.annual_sales === 'více než 300';
  const hasTeam = answers.sales_team === 'Ano';
  const decisionFit = answers.priority === 'Lepší rozhodování zákazníků';
  const ready = answers.ready_for_pilot === 'Ano';

  if (strongVolume && hasTeam && decisionFit && ready) {
    return {
      status: 'C',
      calendlyUrl: 'https://calendly.com/conis/rezervace-schuzky',
    };
  }

  return { status: 'B' };
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 1e6) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
    req.on('error', reject);
  });
}

function safeResolve(requestPath) {
  const decoded = decodeURIComponent(requestPath.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const absolute = path.join(ROOT, normalized === path.sep ? 'index.html' : normalized);
  if (!absolute.startsWith(ROOT)) {
    return null;
  }
  return absolute;
}

async function handleQualification(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { Allow: 'POST' });
    res.end('Method Not Allowed');
    return;
  }

  try {
    const raw = await readBody(req);
    const answers = raw ? JSON.parse(raw) : {};
    const decision = decideQualification(answers);
    sendJson(res, 200, decision);
  } catch (error) {
    console.error('[qualification]', error.message);
    sendJson(res, 400, { status: 'B', error: 'Invalid request' });
  }
}

function serveStatic(req, res, pathname) {
  let filePath = safeResolve(pathname === '/' ? '/index.html' : pathname);
  if (!filePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control':
        ext === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const host = req.headers.host || `localhost:${PORT}`;
  const url = new URL(req.url || '/', `http://${host}`);

  if (url.pathname === '/qualification') {
    handleQualification(req, res);
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD, POST' });
    res.end('Method Not Allowed');
    return;
  }

  serveStatic(req, res, url.pathname);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`CONIS web running at http://127.0.0.1:${PORT}`);
});
