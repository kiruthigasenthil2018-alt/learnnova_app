// LearnNova AI server — answers children's questions with Claude. Keeps your API key OFF the app.
//
//   1. Get a key:  https://console.anthropic.com  → API keys   (this is separate from a claude.ai chat subscription)
//   2. Create  server/.env  (or a .env in the project root) containing:   ANTHROPIC_API_KEY=sk-ant-...
//   3. Run:        node server/server.js        (Node 18+)      or      npm run ai
//   4. Keep it running while you use the app. Health check: http://localhost:3000/health
const http = require('http');
const fs = require('fs');
const { chat, cleanKey } = require('./aiCore');
const path = require('path');

// tiny .env reader (no extra package). Re-read on every request while the key is missing,
// so you can paste your key into server/.env and just ask again - no restart needed.
const loadEnv = () => {
  for (const f of [path.join(__dirname, '.env'), path.join(__dirname, '..', '.env')]) {
    try {
      fs.readFileSync(f, 'utf8').split(/\r?\n/).forEach(line => {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
        if (m && m[2] && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      });
    } catch (e) { /* file not there - fine */ }
  }
};
loadEnv();
const PORT = +process.env.PORT || 3000;
const MODEL = () => process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const getKey = () => { if (!process.env.ANTHROPIC_API_KEY) loadEnv(); return cleanKey(process.env.ANTHROPIC_API_KEY); };

const send = (res, code, obj) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); };

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
  const url = req.url.replace(/^\/api/, '');                      // /api/chat and /chat both work
  if (req.method === 'GET' && url.startsWith('/health')) return send(res, 200, { ok:true, model:MODEL(), hasKey:!!getKey() });
  if (req.method !== 'POST' || !url.startsWith('/chat')) return send(res, 404, { reply:'Not found' });
  let body = '';
  req.on('data', c => { body += c; if (body.length > 200000) req.destroy(); });
  req.on('end', async () => {
    try {
      const { messages, grade } = JSON.parse(body || '{}');
      const out = await chat({ messages, grade, key:getKey(), model:MODEL() });
      send(res, out.status, out.body);
    } catch (e) { console.error(e); send(res, 500, { error:'server', reply:'Server error. Please try again.' }); }
  });
}).listen(PORT, () => console.log(`LearnNova AI server on http://localhost:${PORT}  (model ${MODEL()}, key ${getKey() ? 'found' : 'MISSING - paste it into server/.env'})`));
