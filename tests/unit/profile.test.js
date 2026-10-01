import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseProfile } from '../../frontend/scripts/core/profile.js';
import { makeProfile } from '../helpers.js';

/** @param {unknown} input */
function errorFields(input) {
  const result = parseProfile(input);
  assert.equal(result.ok, false);
  return result.ok ? [] : result.errors.map((e) => `${e.field}:${e.code}`);
}

describe('parseProfile', () => {
  it('accepts a complete profile unchanged', () => {
    const profile = makeProfile();
    assert.deepEqual(parseProfile(profile), { ok: true, profile });
  });

  it('accepts form-style strings for numbers and booleans', () => {
    const result = parseProfile({
      ...makeProfile(),
      age: '42',
      annualIncome: '250000',
      hasBplCard: 'on',
      ownsFarmland: 'false',
    });
    assert.ok(result.ok);
    assert.equal(result.profile.age, 42);
    assert.equal(result.profile.annualIncome, 250000);
    assert.equal(result.profile.hasBplCard, true);
    assert.equal(result.profile.ownsFarmland, false);
  });

  it('defaults missing yes/no answers to false', () => {
    const { age, gender, annualIncome, occupation, caste, area } = makeProfile();
    const result = parseProfile({ age, gender, annualIncome, occupation, caste, area });
    assert.ok(result.ok);
    assert.equal(result.profile.hasBankAccount, false);
  });

  it('reports every missing required field', () => {
    assert.deepEqual(errorFields({}), [
      'age:required',
      'annualIncome:required',
      'gender:required',
      'occupation:required',
      'caste:required',
      'area:required',
    ]);
  });

  it('rejects non-objects', () => {
    for (const input of [null, 'text', 42, []]) {
      assert.ok(errorFields(input).includes('(root):invalid_type'));
    }
  });

  it('rejects out-of-range and non-integer numbers', () => {
    assert.ok(errorFields({ ...makeProfile(), age: 121 }).includes('age:out_of_range'));
    assert.ok(errorFields({ ...makeProfile(), age: -1 }).includes('age:out_of_range'));
    assert.ok(errorFields({ ...makeProfile(), age: 30.5 }).includes('age:out_of_range'));
    assert.ok(errorFields({ ...makeProfile(), annualIncome: '1e6' }).includes('annualIncome:out_of_range'));
    assert.ok(errorFields({ ...makeProfile(), annualIncome: -5 }).includes('annualIncome:out_of_range'));
  });

  it('rejects unknown options, including prototype keys', () => {
    assert.ok(errorFields({ ...makeProfile(), occupation: 'astronaut' }).includes('occupation:invalid_option'));
    assert.ok(errorFields({ ...makeProfile(), caste: 'SC' }).includes('caste:invalid_option'));
    assert.ok(errorFields({ ...makeProfile(), gender: 'toString' }).includes('gender:invalid_option'));
  });

  it('rejects ambiguous booleans', () => {
    assert.ok(errorFields({ ...makeProfile(), hasBplCard: 'yes' }).includes('hasBplCard:invalid_type'));
  });

  it('ignores a pregnancy answer unless the person is female', () => {
    const result = parseProfile({ ...makeProfile({ gender: 'male' }), isPregnant: true });
    assert.ok(result.ok);
    assert.equal(result.profile.isPregnant, false);
  });

  it('ignores unknown keys', () => {
    const result = parseProfile({ ...makeProfile(), isAdmin: true });
    assert.ok(result.ok);
    assert.equal('isAdmin' in result.profile, false);
  });
});
