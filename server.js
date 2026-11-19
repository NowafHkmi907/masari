// MASARI server: serves the site from d1.txt, d2.txt ... without renaming them.
// No dependencies. Run: node server.js   (PORT is read from the environment, default 3000)
const http = require('http');
const fs = require('fs');
const path = require('path');

// To add a new file later: add one line here (URL path -> file name, content type).
const ROUTES = {
  '/':                     ['d1.txt', 'text/html; charset=utf-8'],
  '/index.html':           ['d1.txt', 'text/html; charset=utf-8'],
  '/sw.js':                ['d2.txt', 'application/javascript; charset=utf-8'],
  '/manifest.webmanifest': ['d3.txt', 'application/manifest+json; charset=utf-8'],
  '/icon.svg':             ['d4.txt', 'image/svg+xml'],
  '/README.md':            ['d5.txt', 'text/markdown; charset=utf-8'],
  '/LICENSE':              ['d6.txt', 'text/plain; charset=utf-8']
};

function handler(req, res) {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end('{"ok":true}');
  }
  const r = ROUTES[url];
  if (!r || (req.method !== 'GET' && req.method !== 'HEAD')) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('404 - غير موجود');
  }
  fs.readFile(path.join(__dirname, r[0]), (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('تعذّر قراءة الملف ' + r[0]);
    }
    const h = {
      'Content-Type': r[1],
      'Content-Length': data.length,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    };
    if (url === '/sw.js') h['Service-Worker-Allowed'] = '/';
    res.writeHead(200, h);
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}

module.exports = handler;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  http.createServer(handler).listen(PORT, '0.0.0.0', () => console.log('MASARI running on port ' + PORT));
}
