const http = require('http');
const https = require('https');

const PAGES = [
  { name: 'Landing Page', path: 'https://economize-ja-production.up.railway.app/' },
  { name: 'Login', path: 'https://economize-ja-production.up.railway.app/login' },
  { name: 'Dashboard', path: 'https://economize-ja-production.up.railway.app/dashboard' },
  { name: 'Contas & Lembretes', path: 'https://economize-ja-production.up.railway.app/bills' },
  { name: 'Transações', path: 'https://economize-ja-production.up.railway.app/transactions' },
  { name: 'Plano PRO', path: 'https://economize-ja-production.up.railway.app/pro' },
];

const API_ENDPOINTS = [
  { name: 'Health Check API', path: 'https://api-production-4879.up.railway.app/' },
  { name: 'Auth API', path: 'https://api-production-4879.up.railway.app/api/v1/auth/login' },
  { name: 'Categories API', path: 'https://api-production-4879.up.railway.app/api/v1/categories' },
  { name: 'Dashboard Summary API', path: 'https://api-production-4879.up.railway.app/api/v1/dashboard/summary?month=2026-08' },
  { name: 'Dashboard Calendar API', path: 'https://api-production-4879.up.railway.app/api/v1/dashboard/calendar?month=2026-08' },
  { name: 'Transactions API', path: 'https://api-production-4879.up.railway.app/api/v1/transactions' },
  { name: 'Bills API', path: 'https://api-production-4879.up.railway.app/api/v1/bills' },
];

async function measureUrl(name, url, method = 'GET') {
  const start = Date.now();
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method }, (res) => {
      let ttfb = Date.now() - start;
      let bodySize = 0;

      res.on('data', (chunk) => {
        bodySize += chunk.length;
      });

      res.on('end', () => {
        const totalDuration = Date.now() - start;
        resolve({
          name,
          url,
          status: res.statusCode,
          ttfb: `${ttfb}ms`,
          totalDuration: `${totalDuration}ms`,
          sizeKb: `${(bodySize / 1024).toFixed(2)} KB`,
          contentEncoding: res.headers['content-encoding'] || 'none',
          cacheControl: res.headers['cache-control'] || 'none',
        });
      });
    });

    req.on('error', (err) => {
      resolve({ name, url, status: 'ERR', error: err.message });
    });

    req.end();
  });
}

async function runAudit() {
  console.log(`\n===============================================================`);
  console.log(`⚡ WEB PERFORMANCE AUDIT — ECONOMIZE JÁ`);
  console.log(`===============================================================\n`);

  console.log(`--- 🌐 1. METRICAS DE PAGINAS FRONTEND ---`);
  for (const page of PAGES) {
    const res = await measureUrl(page.name, page.path);
    console.log(`📄 [${res.status}] ${res.name.padEnd(20)} | TTFB: ${res.ttfb.padEnd(7)} | Total: ${res.totalDuration.padEnd(7)} | Size: ${res.sizeKb.padEnd(9)} | Encoding: ${res.contentEncoding}`);
  }

  console.log(`\n--- ⚙️ 2. METRICAS DE ROTAS DA API REST ---`);
  for (const api of API_ENDPOINTS) {
    const res = await measureUrl(api.name, api.path, api.name.includes('Auth') ? 'POST' : 'GET');
    console.log(`🔌 [${res.status}] ${res.name.padEnd(25)} | TTFB: ${res.ttfb.padEnd(7)} | Total: ${res.totalDuration.padEnd(7)} | Size: ${res.sizeKb.padEnd(9)}`);
  }

  console.log(`\n===============================================================\n`);
}

runAudit();
