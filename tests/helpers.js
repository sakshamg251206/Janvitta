/**
 * Shared test fixtures.
 */

/** @typedef {import('../frontend/scripts/core/profile.js').Profile} Profile */

/**
 * A complete, valid profile with neutral answers. Override what a test needs.
 * @param {Partial<Profile>} [overrides]
 * @returns {Profile}
 */
export function makeProfile(overrides = {}) {
  return {
    age: 30,
    gender: 'male',
    annualIncome: 400000,
    occupation: 'salaried',
    caste: 'general',
    area: 'urban',
    hasBplCard: false,
    ownsFarmland: false,
    hasDisability: false,
    hasBankAccount: true,
    ownsPuccaHouse: true,
    isPregnant: false,
    hasDaughterUnder10: false,
    ...overrides,
  };
}
