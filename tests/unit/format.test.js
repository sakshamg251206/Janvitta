import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatCompactINR, formatINR, joinList } from '../../frontend/scripts/core/format.js';

describe('formatINR', () => {
  it('uses Indian digit grouping', () => {
    assert.equal(formatINR(0), '₹0');
    assert.equal(formatINR(6000), '₹6,000');
    assert.equal(formatINR(250000), '₹2,50,000');
    assert.equal(formatINR(10000000), '₹1,00,00,000');
  });
});

describe('formatCompactINR', () => {
  it('uses lakh and crore units', () => {
    assert.equal(formatCompactINR(50000), '₹50,000');
    assert.equal(formatCompactINR(100000), '₹1 lakh');
    assert.equal(formatCompactINR(250000), '₹2.5 lakh');
    assert.equal(formatCompactINR(10000000), '₹1 crore');
    assert.equal(formatCompactINR(15500000), '₹1.55 crore');
  });

  it('localises units into Hindi', () => {
    assert.equal(formatCompactINR(500000, 'hi'), '₹5 लाख');
    assert.equal(formatCompactINR(20000000, 'hi'), '₹2 करोड़');
  });
});

describe('joinList', () => {
  it('joins naturally in both languages', () => {
    assert.equal(joinList(['SC'], 'en'), 'SC');
    assert.equal(joinList(['SC', 'ST'], 'en'), 'SC or ST');
    assert.equal(joinList(['SC', 'ST', 'OBC'], 'en'), 'SC, ST or OBC');
    assert.equal(joinList(['SC', 'ST'], 'hi'), 'SC या ST');
  });
});
