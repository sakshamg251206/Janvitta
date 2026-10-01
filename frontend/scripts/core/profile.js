// @ts-check
/**
 * The applicant profile: the answers a person gives about themselves.
 *
 * This module is the single definition of which questions exist, which
 * answers are allowed, and how raw input (form fields or API JSON) is turned
 * into a clean, validated profile. Both the browser and the API use it.
 */

/** @typedef {'en' | 'hi'} Lang */
/** @typedef {{ en: string, hi: string }} Localized */

/**
 * @typedef {object} Profile
 * @property {number} age
 * @property {Gender} gender
 * @property {number} annualIncome  Annual family income in rupees.
 * @property {Occupation} occupation
 * @property {Caste} caste
 * @property {Area} area
 * @property {boolean} hasBplCard        Holds a BPL / NFSA (priority household) ration card.
 * @property {boolean} ownsFarmland
 * @property {boolean} hasDisability     Certified disability of 40% or more.
 * @property {boolean} hasBankAccount
 * @property {boolean} ownsPuccaHouse    Household owns a permanent (pucca) house.
 * @property {boolean} isPregnant
 * @property {boolean} hasDaughterUnder10
 */

/** @typedef {'female' | 'male' | 'other'} Gender */
/** @typedef {'farmer' | 'wage_worker' | 'street_vendor' | 'artisan' | 'business' | 'salaried' | 'student' | 'unemployed' | 'other'} Occupation */
/** @typedef {'general' | 'obc' | 'sc' | 'st'} Caste */
/** @typedef {'rural' | 'urban'} Area */
/** @typedef {'hasBplCard' | 'ownsFarmland' | 'hasDisability' | 'hasBankAccount' | 'ownsPuccaHouse' | 'isPregnant' | 'hasDaughterUnder10'} FlagField */

export const MIN_AGE = 0;
export const MAX_AGE = 120;
/** Upper bound that rejects obvious typos without limiting real incomes. */
export const MAX_INCOME = 1_000_000_000;

/** @type {Record<Gender, Localized>} */
export const GENDERS = {
  female: { en: 'Female', hi: 'महिला' },
  male: { en: 'Male', hi: 'पुरुष' },
  other: { en: 'Other', hi: 'अन्य' },
};

/** @type {Record<Occupation, Localized>} */
export const OCCUPATIONS = {
  farmer: { en: 'Farmer', hi: 'किसान' },
  wage_worker: { en: 'Daily-wage worker', hi: 'दिहाड़ी मज़दूर' },
  street_vendor: { en: 'Street vendor', hi: 'रेहड़ी-पटरी विक्रेता' },
  artisan: { en: 'Artisan / craftsperson', hi: 'कारीगर / शिल्पकार' },
  business: { en: 'Small business owner', hi: 'छोटा व्यापारी' },
  salaried: { en: 'Salaried employee', hi: 'वेतनभोगी कर्मचारी' },
  student: { en: 'Student', hi: 'छात्र / छात्रा' },
  unemployed: { en: 'Looking for work', hi: 'काम की तलाश में' },
  other: { en: 'Homemaker / retired / other', hi: 'गृहिणी / सेवानिवृत्त / अन्य' },
};

/** @type {Record<Caste, Localized>} */
export const CASTES = {
  general: { en: 'General', hi: 'सामान्य' },
  obc: { en: 'OBC', hi: 'ओबीसी' },
  sc: { en: 'SC', hi: 'अनुसूचित जाति (SC)' },
  st: { en: 'ST', hi: 'अनुसूचित जनजाति (ST)' },
};

/** @type {Record<Area, Localized>} */
export const AREAS = {
  rural: { en: 'Village / rural', hi: 'गाँव / ग्रामीण' },
  urban: { en: 'Town or city / urban', hi: 'शहर / कस्बा' },
};

/** @type {readonly FlagField[]} */
export const FLAG_FIELDS = Object.freeze([
  'hasBplCard',
  'ownsFarmland',
  'hasDisability',
  'hasBankAccount',
  'ownsPuccaHouse',
  'isPregnant',
  'hasDaughterUnder10',
]);

/**
 * @typedef {object} FieldError
 * @property {string} field
 * @property {string} code     Stable machine-readable code (e.g. "required").
 * @property {string} message  English description, for API consumers.
 */

/**
 * @typedef {{ ok: true, profile: Profile } | { ok: false, errors: FieldError[] }} ParseResult
 */

/**
 * Validate and normalise untrusted input into a {@link Profile}.
 *
 * Accepts numbers as numbers or numeric strings (form fields are strings),
 * and booleans as booleans or "true"/"false"/"on". Unknown keys are ignored.
 *
 * @param {unknown} input
 * @returns {ParseResult}
 */
export function parseProfile(input) {
  /** @type {FieldError[]} */
  const errors = [];
  const raw = isRecord(input) ? input : {};
  if (!isRecord(input)) {
    errors.push({ field: '(root)', code: 'invalid_type', message: 'Profile must be a JSON object.' });
  }

  const age = toInteger(raw.age);
  if (raw.age === undefined || raw.age === null || raw.age === '') {
    errors.push({ field: 'age', code: 'required', message: 'Age is required.' });
  } else if (age === null || age < MIN_AGE || age > MAX_AGE) {
    errors.push({
      field: 'age',
      code: 'out_of_range',
      message: `Age must be a whole number between ${MIN_AGE} and ${MAX_AGE}.`,
    });
  }

  const annualIncome = toInteger(raw.annualIncome);
  if (raw.annualIncome === undefined || raw.annualIncome === null || raw.annualIncome === '') {
    errors.push({ field: 'annualIncome', code: 'required', message: 'Annual family income is required.' });
  } else if (annualIncome === null || annualIncome < 0 || annualIncome > MAX_INCOME) {
    errors.push({
      field: 'annualIncome',
      code: 'out_of_range',
      message: 'Annual family income must be a whole number of rupees, 0 or more.',
    });
  }

  const gender = pickEnum(raw.gender, GENDERS, 'gender', errors);
  const occupation = pickEnum(raw.occupation, OCCUPATIONS, 'occupation', errors);
  const caste = pickEnum(raw.caste, CASTES, 'caste', errors);
  const area = pickEnum(raw.area, AREAS, 'area', errors);

  /** @type {Record<FlagField, boolean>} */
  const flags = /** @type {Record<FlagField, boolean>} */ ({});
  for (const field of FLAG_FIELDS) {
    const value = toBoolean(raw[field]);
    if (value === null) {
      errors.push({ field, code: 'invalid_type', message: `${field} must be true or false.` });
    } else {
      flags[field] = value;
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  /** @type {Profile} */
  const profile = {
    age: /** @type {number} */ (age),
    gender: /** @type {Gender} */ (gender),
    annualIncome: /** @type {number} */ (annualIncome),
    occupation: /** @type {Occupation} */ (occupation),
    caste: /** @type {Caste} */ (caste),
    area: /** @type {Area} */ (area),
    ...flags,
  };
  // Pregnancy only applies to women; ignore stale answers after a gender change.
  if (profile.gender !== 'female') profile.isPregnant = false;
  return { ok: true, profile };
}

/**
 * @template {string} K
 * @param {unknown} value
 * @param {Record<K, Localized>} options
 * @param {string} field
 * @param {FieldError[]} errors
 * @returns {K | null}
 */
function pickEnum(value, options, field, errors) {
  if (value === undefined || value === null || value === '') {
    errors.push({ field, code: 'required', message: `${field} is required.` });
    return null;
  }
  if (typeof value === 'string' && Object.hasOwn(options, value)) return /** @type {K} */ (value);
  errors.push({
    field,
    code: 'invalid_option',
    message: `${field} must be one of: ${Object.keys(options).join(', ')}.`,
  });
  return null;
}

/**
 * @param {unknown} value
 * @returns {number | null}
 */
function toInteger(value) {
  if (typeof value === 'number') return Number.isInteger(value) ? value : null;
  if (typeof value === 'string' && /^\s*\d+\s*$/.test(value)) return Number(value);
  return null;
}

/**
 * Missing flags default to false; anything else must be clearly boolean.
 * @param {unknown} value
 * @returns {boolean | null}
 */
function toBoolean(value) {
  if (value === undefined || value === null || value === '') return false;
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 'on') return true;
  if (value === 'false' || value === 'off') return false;
  return null;
}

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
