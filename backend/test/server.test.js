import test from 'node:test';
import assert from 'node:assert/strict';
import { server } from '../src/server.js';

test('health and score idempotency flow', async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  const base = `http://localhost:${server.address().port}`;
  const health = await fetch(`${base}/health`); assert.equal(health.status, 200);
  const login = await fetch(`${base}/api/auth/mock`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'test@example.test', name: 'Test' }) });
  assert.equal(login.status, 201); const { token } = await login.json();
  const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'idempotency-key': 'test-1' };
  const first = await fetch(`${base}/api/scores`, { method: 'POST', headers, body: JSON.stringify({ gameType: 'quiz', score: 90 }) });
  const second = await fetch(`${base}/api/scores`, { method: 'POST', headers, body: JSON.stringify({ gameType: 'quiz', score: 90 }) });
  assert.equal(first.status, 201); assert.equal(second.status, 200); assert.equal((await first.json()).id, (await second.json()).id);
  server.close();
});
