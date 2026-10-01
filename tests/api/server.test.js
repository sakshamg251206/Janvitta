import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { createApp } from '../../backend/app.js';
import { loadConfig } from '../../backend/config.js';
import { SCHEMES } from '../../frontend/scripts/data/schemes.js';
import { makeProfile } from '../helpers.js';

/** @type {import('node:http').Server[]} */
const servers = [];
let baseUrl = '';

/**
 * Start the app on an ephemeral port and return its base URL.
 * @param {Record<string, string>} env
 */
async function startServer(env) {
  const app = createApp(loadConfig({ NODE_ENV: 'test', ...env }));
  /** @type {import('node:http').Server} */
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  servers.push(server);
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  return `http://127.0.0.1:${address.port}`;
}

before(async () => {
  baseUrl = await startServer({ RATE_LIMIT_MAX: '1000', CORS_ORIGINS: 'https://partner.example' });
});

after(() => Promise.all(servers.map((s) => new Promise((resolve) => s.close(() => resolve(undefined))))));

/**
 * @param {string} path
 * @param {RequestInit} [init]
 */
async function request(path, init, base = baseUrl) {
  const res = await fetch(`${base}${path}`, init);
  const type = res.headers.get('content-type') ?? '';
  const body = type.includes('application/json') ? await res.json() : await res.text();
  return { res, body };
}

/** @param {unknown} payload */
function postEligibility(payload, query = '') {
  return request(`/api/v1/eligibility${query}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  });
}

describe('health and static files', () => {
  it('reports health', async () => {
    const { res, body } = await request('/health');
    assert.equal(res.status, 200);
    assert.deepEqual(body, { status: 'ok' });
  });

  it('serves the frontend with security headers', async () => {
    const { res, body } = await request('/');
    assert.equal(res.status, 200);
    assert.match(String(body), /<title>LabhSetu/);
    assert.match(res.headers.get('content-security-policy') ?? '', /script-src 'self'/);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-powered-by'), null);
  });

  it('serves the shared engine as an ES module', async () => {
    const { res } = await request('/scripts/core/eligibility.js');
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type') ?? '', /javascript/);
  });
});

describe('GET /api/v1/schemes', () => {
  it('lists the whole catalog', async () => {
    const { res, body } = await request('/api/v1/schemes');
    assert.equal(res.status, 200);
    assert.equal(body.count, SCHEMES.length);
    assert.equal(body.schemes[0].id, SCHEMES[0].id);
    assert.equal(typeof body.catalogVersion, 'string');
  });

  it('filters by category and localizes', async () => {
    const { body } = await request('/api/v1/schemes?category=health&lang=hi');
    assert.ok(body.count > 0);
    for (const scheme of body.schemes) assert.equal(scheme.category.id, 'health');
    assert.equal(body.schemes[0].category.label, 'स्वास्थ्य');
  });

  it('rejects unknown categories and languages', async () => {
    assert.equal((await request('/api/v1/schemes?category=space')).res.status, 400);
    const { res, body } = await request('/api/v1/schemes?lang=fr');
    assert.equal(res.status, 400);
    assert.equal(body.error.code, 'INVALID_QUERY');
  });

  it('returns one scheme by id, or 404', async () => {
    const found = await request('/api/v1/schemes/pm-kisan');
    assert.equal(found.res.status, 200);
    assert.equal(found.body.scheme.name, 'PM Kisan Samman Nidhi');
    assert.ok(found.body.scheme.requirements.length > 0);

    const missing = await request('/api/v1/schemes/does-not-exist');
    assert.equal(missing.res.status, 404);
    assert.equal(missing.body.error.code, 'NOT_FOUND');
  });
});

describe('POST /api/v1/eligibility', () => {
  it('matches a valid profile', async () => {
    const profile = makeProfile({ occupation: 'farmer', ownsFarmland: true, area: 'rural' });
    const { res, body } = await postEligibility(profile);
    assert.equal(res.status, 200);
    const pmKisan = body.eligible.find((/** @type {{ id: string }} */ s) => s.id === 'pm-kisan');
    assert.ok(pmKisan);
    assert.deepEqual(pmKisan.reasons, ['Occupation: Farmer', 'Owns agricultural land']);
    assert.equal(body.summary.eligibleCount, body.eligible.length);
  });

  it('explains "almost" results with a next step', async () => {
    const { body } = await postEligibility(makeProfile({ hasBankAccount: false }), '?lang=hi');
    const pmjjby = body.almost.find((/** @type {{ id: string }} */ s) => s.id === 'pmjjby');
    assert.ok(pmjjby);
    assert.equal(pmjjby.missing, 'बैंक खाता है');
    assert.match(pmjjby.nextStep, /जन धन/);
  });

  it('returns field-level validation errors', async () => {
    const { res, body } = await postEligibility({ age: 'old' });
    assert.equal(res.status, 422);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
    assert.ok(body.error.details.some((/** @type {{ field: string }} */ d) => d.field === 'age'));
  });

  it('rejects malformed and oversized JSON', async () => {
    const malformed = await postEligibility('{"age":');
    assert.equal(malformed.res.status, 400);
    assert.equal(malformed.body.error.code, 'INVALID_JSON');

    const huge = await postEligibility({ ...makeProfile(), padding: 'x'.repeat(20_000) });
    assert.equal(huge.res.status, 413);
  });
});

describe('API behaviour', () => {
  it('returns JSON 404 for unknown API routes', async () => {
    const { res, body } = await request('/api/v1/nope');
    assert.equal(res.status, 404);
    assert.equal(body.error.code, 'NOT_FOUND');
  });

  it('allows only configured CORS origins', async () => {
    const allowed = await request('/api/v1/schemes/pm-kisan', { headers: { origin: 'https://partner.example' } });
    assert.equal(allowed.res.headers.get('access-control-allow-origin'), 'https://partner.example');

    const other = await request('/api/v1/schemes/pm-kisan', { headers: { origin: 'https://evil.example' } });
    assert.equal(other.res.headers.get('access-control-allow-origin'), null);
  });

  it('rate-limits clients', async () => {
    const limited = await startServer({ RATE_LIMIT_MAX: '3' });
    const statuses = [];
    let last;
    for (let i = 0; i < 4; i += 1) {
      last = await request('/api/v1/schemes/pm-kisan', undefined, limited);
      statuses.push(last.res.status);
    }
    assert.deepEqual(statuses, [200, 200, 200, 429]);
    assert.equal(last?.body.error.code, 'RATE_LIMITED');
    assert.ok(last?.res.headers.get('ratelimit-policy'));
  });
});
