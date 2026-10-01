/**
 * Structural checks on the scheme catalog and UI strings, so that editing
 * data can't silently break the app.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { toRequirements } from '../../frontend/scripts/core/eligibility.js';
import { AREAS, CASTES, FLAG_FIELDS, GENDERS, OCCUPATIONS } from '../../frontend/scripts/core/profile.js';
import { BENEFIT_TYPES, CATEGORIES, DOCUMENTS, SCHEMES } from '../../frontend/scripts/data/schemes.js';
import { STRINGS } from '../../frontend/scripts/ui/i18n.js';

const CRITERIA_KEYS = new Set([
  'minAge',
  'maxAge',
  'maxIncome',
  'gender',
  'occupation',
  'caste',
  'area',
  'flags',
  'anyOf',
]);

/**
 * @param {unknown} value
 * @param {string} label
 */
function assertLocalized(value, label) {
  assert.ok(value && typeof value === 'object', `${label} is localized`);
  for (const lang of ['en', 'hi']) {
    const text = /** @type {Record<string, unknown>} */ (value)[lang];
    assert.ok(typeof text === 'string' && text.trim().length > 0, `${label}.${lang} is non-empty`);
  }
}

/**
 * @param {import('../../frontend/scripts/core/eligibility.js').Criteria} criteria
 * @param {string} label
 */
function assertValidCriteria(criteria, label) {
  for (const key of Object.keys(criteria)) assert.ok(CRITERIA_KEYS.has(key), `${label}: unknown rule "${key}"`);
  for (const g of criteria.gender ?? []) assert.ok(g in GENDERS, `${label}: gender ${g}`);
  for (const o of criteria.occupation ?? []) assert.ok(o in OCCUPATIONS, `${label}: occupation ${o}`);
  for (const c of criteria.caste ?? []) assert.ok(c in CASTES, `${label}: caste ${c}`);
  if (criteria.area) assert.ok(criteria.area in AREAS, `${label}: area ${criteria.area}`);
  for (const [field, value] of Object.entries(criteria.flags ?? {})) {
    assert.ok(FLAG_FIELDS.includes(/** @type {never} */ (field)), `${label}: flag ${field}`);
    assert.equal(typeof value, 'boolean', `${label}: flag ${field} is boolean`);
  }
  if (criteria.minAge !== undefined && criteria.maxAge !== undefined) {
    assert.ok(criteria.minAge <= criteria.maxAge, `${label}: age range`);
  }
  for (const [i, option] of (criteria.anyOf ?? []).entries()) assertValidCriteria(option, `${label}.anyOf[${i}]`);
}

describe('scheme catalog', () => {
  it('has unique, URL-safe ids', () => {
    const ids = SCHEMES.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  for (const scheme of SCHEMES) {
    it(`${scheme.id} is complete and valid`, () => {
      assertLocalized(scheme.name, 'name');
      assertLocalized(scheme.ministry, 'ministry');
      assertLocalized(scheme.summary, 'summary');
      assertLocalized(scheme.benefit.label, 'benefit.label');
      if (scheme.note) assertLocalized(scheme.note, 'note');

      assert.ok(scheme.category in CATEGORIES, 'known category');
      assert.ok(scheme.benefit.type in BENEFIT_TYPES, 'known benefit type');
      if (scheme.benefit.amount !== undefined) assert.ok(scheme.benefit.amount > 0, 'positive amount');

      assert.ok(scheme.documents.length > 0, 'lists documents');
      for (const doc of scheme.documents) assert.ok(doc in DOCUMENTS, `known document ${doc}`);

      const url = new URL(scheme.applyUrl);
      assert.equal(url.protocol, 'https:', 'links use https');

      assertValidCriteria(scheme.criteria, scheme.id);
      assert.ok(toRequirements(scheme.criteria).length > 0, 'has at least one rule');
    });
  }

  it('localizes every dictionary entry', () => {
    for (const dict of [CATEGORIES, BENEFIT_TYPES, DOCUMENTS, GENDERS, OCCUPATIONS, CASTES, AREAS]) {
      for (const [key, value] of Object.entries(dict)) assertLocalized(value, key);
    }
  });
});

describe('UI strings', () => {
  it('has the same keys in English and Hindi', () => {
    assert.deepEqual(Object.keys(STRINGS.hi).sort(), Object.keys(STRINGS.en).sort());
  });

  it('keeps the same placeholders in both languages', () => {
    for (const [key, en] of Object.entries(STRINGS.en)) {
      const hi = STRINGS.hi[/** @type {keyof typeof STRINGS.hi} */ (key)];
      const placeholders = (/** @type {string} */ text) => (text.match(/\{\w+\}/g) ?? []).sort();
      assert.deepEqual(placeholders(hi), placeholders(en), key);
    }
  });
});
