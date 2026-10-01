import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  describeRequirement,
  evaluateScheme,
  matchSchemes,
  toRequirements,
} from '../../frontend/scripts/core/eligibility.js';
import { SCHEMES, findScheme } from '../../frontend/scripts/data/schemes.js';
import { makeProfile } from '../helpers.js';

/** @param {string} id */
function scheme(id) {
  const found = findScheme(id);
  assert.ok(found, `scheme ${id} exists`);
  return found;
}

/**
 * @param {import('../../frontend/scripts/core/eligibility.js').MatchedScheme[]} list
 */
const ids = (list) => list.map((item) => item.scheme.id);

describe('evaluateScheme', () => {
  it('marks a landholding farmer eligible for PM-KISAN', () => {
    const result = evaluateScheme(scheme('pm-kisan'), makeProfile({ occupation: 'farmer', ownsFarmland: true }));
    assert.equal(result.status, 'eligible');
    assert.deepEqual(result.unmet, []);
  });

  it('does not offer PM-KISAN to a farmer without land as "almost"', () => {
    const result = evaluateScheme(scheme('pm-kisan'), makeProfile({ occupation: 'farmer', ownsFarmland: false }));
    assert.equal(result.status, 'ineligible');
  });

  it('applies age bounds inclusively', () => {
    const pmjjby = scheme('pmjjby');
    assert.equal(evaluateScheme(pmjjby, makeProfile({ age: 18 })).status, 'eligible');
    assert.equal(evaluateScheme(pmjjby, makeProfile({ age: 50 })).status, 'eligible');
    assert.equal(evaluateScheme(pmjjby, makeProfile({ age: 51 })).status, 'ineligible');
  });

  it('applies the income ceiling inclusively', () => {
    const pmay = scheme('pmay-urban');
    const base = { area: /** @type {const} */ ('urban'), ownsPuccaHouse: false };
    assert.equal(evaluateScheme(pmay, makeProfile({ ...base, annualIncome: 900000 })).status, 'eligible');
    assert.equal(evaluateScheme(pmay, makeProfile({ ...base, annualIncome: 900001 })).status, 'ineligible');
  });

  // Regression: the old rules required SC/ST *and* applied a separate gender
  // rule, so women from other categories were wrongly rejected.
  it('offers Stand-Up India to women entrepreneurs of any category', () => {
    const standUp = scheme('stand-up-india');
    const woman = makeProfile({ gender: 'female', occupation: 'business', caste: 'general' });
    const scMan = makeProfile({ gender: 'male', occupation: 'business', caste: 'sc' });
    const generalMan = makeProfile({ gender: 'male', occupation: 'business', caste: 'general' });
    assert.equal(evaluateScheme(standUp, woman).status, 'eligible');
    assert.equal(evaluateScheme(standUp, scMan).status, 'eligible');
    assert.equal(evaluateScheme(standUp, generalMan).status, 'ineligible');
  });

  it('covers every citizen aged 70+ under Ayushman Bharat regardless of ration card', () => {
    const result = evaluateScheme(scheme('ayushman-bharat'), makeProfile({ age: 72, hasBplCard: false }));
    assert.equal(result.status, 'eligible');
  });

  it('explains only the alternative that actually matched', () => {
    const result = evaluateScheme(scheme('ayushman-bharat'), makeProfile({ age: 72 }));
    assert.deepEqual(
      result.met.map((req) => describeRequirement(req, 'en')),
      ['Aged 70 or older'],
    );
  });

  it('names the person’s own value when a list requirement is met', () => {
    const result = evaluateScheme(scheme('e-shram'), makeProfile({ age: 30, occupation: 'farmer' }));
    assert.equal(result.status, 'eligible');
    assert.ok(result.met.map((req) => describeRequirement(req, 'en')).includes('Occupation: Farmer'));
  });
});

describe('"almost eligible" is limited to things a person can act on', () => {
  it('suggests opening a bank account when that is the only gap', () => {
    const result = evaluateScheme(scheme('pmjjby'), makeProfile({ hasBankAccount: false }));
    assert.equal(result.status, 'almost');
    assert.match(result.nextStep?.hint.en ?? '', /Jan Dhan/);
  });

  it('suggests waiting when the minimum age is close', () => {
    const result = evaluateScheme(scheme('pmsby'), makeProfile({ age: 17 }));
    assert.equal(result.status, 'almost');
    assert.match(result.nextStep?.hint.en ?? '', /turn 18/);
  });

  // Regression: previously any single missed rule counted as "almost", so a
  // 25-year-old was told they almost qualified for an old-age pension.
  it('does not treat a distant age requirement as almost', () => {
    const result = evaluateScheme(scheme('old-age-pension'), makeProfile({ age: 25, hasBplCard: true }));
    assert.equal(result.status, 'ineligible');
  });

  it('does not treat a maximum age that has passed as almost', () => {
    const result = evaluateScheme(scheme('pmjjby'), makeProfile({ age: 51 }));
    assert.equal(result.status, 'ineligible');
  });

  it('does not treat gender or category as almost', () => {
    const result = evaluateScheme(scheme('ujjwala'), makeProfile({ gender: 'male', hasBplCard: true }));
    assert.equal(result.status, 'ineligible');
  });

  it('only suggests a ration card to lower-income households', () => {
    const pmgkay = scheme('pmgkay');
    assert.equal(evaluateScheme(pmgkay, makeProfile({ annualIncome: 120000 })).status, 'almost');
    assert.equal(evaluateScheme(pmgkay, makeProfile({ annualIncome: 2000000 })).status, 'ineligible');
  });

  it('finds an actionable step inside an "any one of" rule', () => {
    const result = evaluateScheme(scheme('ayushman-bharat'), makeProfile({ age: 40, annualIncome: 100000 }));
    assert.equal(result.status, 'almost');
    assert.match(result.nextStep?.hint.en ?? '', /ration card/);
  });
});

describe('matchSchemes', () => {
  it('returns no schemes twice and keeps eligible and almost separate', () => {
    const { eligible, almost } = matchSchemes(makeProfile({ hasBankAccount: false }), SCHEMES);
    const all = [...ids(eligible), ...ids(almost)];
    assert.equal(new Set(all).size, all.length);
  });

  it('offers a Jan Dhan account to people without a bank account', () => {
    const { eligible } = matchSchemes(makeProfile({ hasBankAccount: false }), SCHEMES);
    assert.ok(ids(eligible).includes('jan-dhan'));
  });

  it('keeps cash, insurance and loans in separate totals', () => {
    const profile = makeProfile({
      occupation: 'farmer',
      ownsFarmland: true,
      area: 'rural',
      annualIncome: 150000,
      ownsPuccaHouse: true,
    });
    const { eligible, summary } = matchSchemes(profile, SCHEMES);
    assert.equal(summary.eligibleCount, eligible.length);
    assert.equal(summary.firstYearCash, 6000, 'PM-KISAN only');
    assert.equal(summary.insuranceCover, 400000, 'PMJJBY + PMSBY');
    assert.equal(summary.maxLoan, 300000, 'Kisan Credit Card');
  });

  it('annualises monthly pensions in the cash total', () => {
    const { summary } = matchSchemes(makeProfile({ age: 65, hasBplCard: true, annualIncome: 50000 }), SCHEMES);
    assert.equal(summary.firstYearCash, 200 * 12);
  });

  it('lists direct cash benefits before loans', () => {
    const profile = makeProfile({ occupation: 'farmer', ownsFarmland: true });
    const list = ids(matchSchemes(profile, SCHEMES).eligible);
    assert.ok(list.indexOf('pm-kisan') < list.indexOf('kisan-credit-card'));
  });
});

describe('describeRequirement', () => {
  it('describes requirements in both languages', () => {
    for (const s of SCHEMES) {
      for (const req of toRequirements(s.criteria)) {
        assert.ok(describeRequirement(req, 'en').length > 0, `${s.id} en`);
        assert.ok(describeRequirement(req, 'hi').length > 0, `${s.id} hi`);
      }
    }
  });

  it('formats age ranges and income limits readably', () => {
    assert.equal(describeRequirement({ kind: 'age', min: 18, max: 50 }, 'en'), 'Aged 18–50');
    assert.equal(
      describeRequirement({ kind: 'maxIncome', value: 250000 }, 'en'),
      'Family income up to ₹2.5 lakh a year',
    );
    assert.equal(
      describeRequirement({ kind: 'maxIncome', value: 250000 }, 'hi'),
      'पारिवारिक आय ₹2.5 लाख प्रति वर्ष तक',
    );
  });
});
