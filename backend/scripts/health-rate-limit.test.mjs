import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';

// Keep the budget tiny so an accidental limiter regression is visible.
process.env.NODE_ENV = 'test';
process.env.RATE_LIMIT_MAX = '2';

const { createApp } = await import('../app.js');

test('liveness probes are never throttled, while API requests still are', async () => {
  const server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');

  try {
    const origin = `http://127.0.0.1:${server.address().port}`;

    for (let i = 0; i < 6; i += 1) {
      const response = await fetch(`${origin}/health`);
      assert.equal(response.status, 200, `GET /health attempt ${i + 1}`);
      assert.deepEqual(await response.json(), { ok: true, service: 'fzac-backend' });
    }

    const headResponse = await fetch(`${origin}/health`, { method: 'HEAD' });
    assert.equal(headResponse.status, 200, 'HEAD /health');

    for (let i = 0; i < 2; i += 1) {
      const response = await fetch(`${origin}/api/public-config`);
      assert.equal(response.status, 200, `API request ${i + 1}`);
    }

    const limitedResponse = await fetch(`${origin}/api/public-config`);
    assert.equal(limitedResponse.status, 429, 'the third API request remains rate-limited');
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
