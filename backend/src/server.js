import http from 'node:http';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const port = Number(process.env.PORT || 4000);
const secret = process.env.JWT_SECRET || 'local-development-secret-change-me';
const ttl = Number(process.env.JWT_TTL_SECONDS || 3600);
const origins = new Set((process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((v) => v.trim()));

const db = {
  users: new Map(), students: new Map(), scores: new Map(), events: [],
  universities: new Map([['demo-u', { id: 'demo-u', name: 'Siam U' }]])
};

const id = (prefix) => `${prefix}_${crypto.randomUUID()}`;
const b64 = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
function sign(payload) {
  const head = b64({ alg: 'HS256', typ: 'JWT' });
  const body = b64(payload);
  const sig = crypto.createHmac('sha256', secret).update(`${head}.${body}`).digest('base64url');
  return `${head}.${body}.${sig}`;
}
function verify(token) {
  const [head, body, sig] = String(token || '').split('.');
  if (!head || !body || !sig) throw new Error('invalid token');
  const expected = crypto.createHmac('sha256', secret).update(`${head}.${body}`).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) || JSON.parse(Buffer.from(body, 'base64url')).exp < Math.floor(Date.now() / 1000)) throw new Error('invalid token');
  return JSON.parse(Buffer.from(body, 'base64url'));
}
function send(res, status, data, extra = {}) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'x-content-type-options': 'nosniff', 'x-frame-options': 'DENY', ...extra });
  res.end(JSON.stringify(data));
}
function parseBody(req) {
  return new Promise((resolve, reject) => { let raw = ''; req.on('data', (c) => { raw += c; if (raw.length > 1e6) reject(new Error('payload too large')); }); req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('invalid JSON')); } }); });
}
function auth(req) {
  const value = req.headers.authorization || '';
  if (!value.startsWith('Bearer ')) throw Object.assign(new Error('authentication required'), { status: 401 });
  return verify(value.slice(7));
}
function requireRole(user, roles) { if (!roles.includes(user.role)) throw Object.assign(new Error('forbidden'), { status: 403 }); }
function route(path, method, expected, handler) { return path === expected && method === handler.method ? handler : null; }

async function handle(req, res) {
  const origin = req.headers.origin;
  if (origin && origins.has(origin)) res.setHeader('access-control-allow-origin', origin);
  res.setHeader('access-control-allow-headers', 'content-type, authorization, idempotency-key');
  res.setHeader('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { ok: true, service: 'siam-u-backend' });
    if (req.method === 'POST' && url.pathname === '/api/auth/mock') {
      if (process.env.MOCK_OAUTH === 'false') throw Object.assign(new Error('mock provider disabled'), { status: 404 });
      const body = await parseBody(req); if (!body.email || !body.name) throw Object.assign(new Error('email and name are required'), { status: 400 });
      const user = { id: id('usr'), email: body.email, name: body.name, role: body.role === 'admin' ? 'admin' : 'student' }; db.users.set(user.id, user);
      if (user.role === 'student') db.students.set(user.id, { id: user.id, userId: user.id, universityId: 'demo-u', studentCode: `DEMO-${user.id.slice(-6)}` });
      return send(res, 201, { user, token: sign({ sub: user.id, role: user.role, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + ttl }) });
    }
    const user = auth(req);
    if (req.method === 'GET' && url.pathname === '/api/me') return send(res, 200, { user, student: db.students.get(user.sub) || null });
    if (req.method === 'GET' && url.pathname === '/api/leaderboard') {
      const rows = [...db.scores.values()].sort((a, b) => b.score - a.score).slice(0, 100); return send(res, 200, { items: rows });
    }
    if (req.method === 'POST' && url.pathname === '/api/scores') {
      const body = await parseBody(req); const key = req.headers['idempotency-key'];
      if (!key) throw Object.assign(new Error('idempotency-key is required'), { status: 400 });
      const existing = [...db.scores.values()].find((x) => x.userId === user.sub && x.idempotencyKey === key); if (existing) return send(res, 200, existing);
      if (!['memory', 'quiz', 'typing'].includes(body.gameType) || !Number.isInteger(body.score) || body.score < 0 || body.score > 100000) throw Object.assign(new Error('invalid gameType or score'), { status: 400 });
      const score = { id: id('score'), userId: user.sub, gameType: body.gameType, score: body.score, idempotencyKey: key, createdAt: new Date().toISOString() }; db.scores.set(score.id, score); return send(res, 201, score);
    }
    if (req.method === 'GET' && url.pathname === '/api/admin/users') { requireRole(user, ['admin']); return send(res, 200, { items: [...db.users.values()] }); }
    send(res, 404, { error: 'not_found' });
  } catch (error) { send(res, error.status || 500, { error: error.status ? error.message : 'internal_error' }); }
}

export const server = http.createServer(handle);
if (pathToFileURL(process.argv[1]).href === import.meta.url) server.listen(port, () => console.log(`Siam U API listening on http://localhost:${port}`));
