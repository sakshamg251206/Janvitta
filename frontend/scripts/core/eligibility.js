// @ts-check
/**
 * Eligibility engine.
 *
 * Each scheme declares its rules as data (see `data/schemes.js`). This module
 * checks a profile against those rules and explains the outcome in plain
 * language, in English or Hindi. It is pure and DOM-free so the browser and
 * the API produce identical results.
 */

import { formatCompactINR, joinList } from './format.js';
import { AREAS, CASTES, GENDERS, OCCUPATIONS } from './profile.js';

/** @typedef {import('./profile.js').Profile} Profile */
/** @typedef {import('./profile.js').Lang} Lang */
/** @typedef {import('./profile.js').Localized} Localized */
/** @typedef {import('./profile.js').Gender} Gender */
/** @typedef {import('./profile.js').Occupation} Occupation */
/** @typedef {import('./profile.js').Caste} Caste */
/** @typedef {import('./profile.js').Area} Area */
/** @typedef {import('./profile.js').FlagField} FlagField */

/**
 * Declarative eligibility rules. Every listed rule must hold (logical AND);
 * `anyOf` holds when at least one of its alternatives fully holds.
 *
 * @typedef {object} Criteria
 * @property {number} [minAge]
 * @property {number} [maxAge]
 * @property {number} [maxIncome]  Annual family income ceiling, in rupees.
 * @property {Gender[]} [gender]
 * @property {Occupation[]} [occupation]
 * @property {Caste[]} [caste]
 * @property {Area} [area]
 * @property {Partial<Record<FlagField, boolean>>} [flags]
 * @property {Criteria[]} [anyOf]
 */

/**
 * @typedef {'cash' | 'pension' | 'scholarship' | 'housing' | 'insurance' | 'in_kind' | 'employment' | 'loan' | 'savings' | 'training' | 'banking' | 'registration'} BenefitType
 */

/**
 * @typedef {object} Benefit
 * @property {BenefitType} type
 * @property {Localized} label        Short headline, e.g. "₹6,000 per year".
 * @property {number} [amount]        Rupee value when a fixed figure exists.
 * @property {'year' | 'month' | 'once'} [period]
 */

/**
 * @typedef {object} Scheme
 * @property {string} id              URL-safe slug, stable across releases.
 * @property {Localized} name
 * @property {Localized} ministry
 * @property {string} category
 * @property {Localized} summary
 * @property {Benefit} benefit
 * @property {Criteria} criteria
 * @property {string[]} documents     Keys into the documents dictionary.
 * @property {Localized} [note]       Important exclusions or caveats.
 * @property {string} applyUrl        Official portal (https only).
 */

/**
 * A single checkable condition, flattened out of {@link Criteria}.
 * @typedef {{ kind: 'age', min?: number, max?: number }
 *   | { kind: 'maxIncome', value: number }
 *   | { kind: 'gender', values: Gender[] }
 *   | { kind: 'occupation', values: Occupation[] }
 *   | { kind: 'caste', values: Caste[] }
 *   | { kind: 'area', value: Area }
 *   | { kind: 'flag', field: FlagField, value: boolean }
 *   | { kind: 'anyOf', options: Requirement[][] }} Requirement
 */

/**
 * @typedef {object} Evaluation
 * @property {'eligible' | 'almost' | 'ineligible'} status
 * @property {Requirement[]} met
 * @property {Requirement[]} unmet
 * @property {{ requirement: Requirement, hint: Localized } | null} nextStep
 *   Set for "almost" results: the one missing condition and how to fix it.
 */

/**
 * Below this family income a household may reasonably qualify for a
 * priority-household ration card, so suggesting one is a useful next step.
 * Thresholds vary by state; this is a deliberately loose guard that keeps the
 * hint away from households that clearly would not qualify.
 */
const RATION_CARD_HINT_MAX_INCOME = 300_000;

/** How many years ahead an age requirement still counts as "almost". */
const AGE_LOOKAHEAD_YEARS = 2;

/**
 * Flatten criteria into an ordered list of requirements.
 * @param {Criteria} criteria
 * @returns {Requirement[]}
 */
export function toRequirements(criteria) {
  /** @type {Requirement[]} */
  const list = [];
  if (criteria.minAge !== undefined || criteria.maxAge !== undefined) {
    list.push({ kind: 'age', min: criteria.minAge, max: criteria.maxAge });
  }
  if (criteria.gender?.length) list.push({ kind: 'gender', values: criteria.gender });
  if (criteria.occupation?.length) list.push({ kind: 'occupation', values: criteria.occupation });
  if (criteria.caste?.length) list.push({ kind: 'caste', values: criteria.caste });
  if (criteria.area) list.push({ kind: 'area', value: criteria.area });
  if (criteria.maxIncome !== undefined) list.push({ kind: 'maxIncome', value: criteria.maxIncome });
  for (const [field, value] of Object.entries(criteria.flags ?? {})) {
    list.push({ kind: 'flag', field: /** @type {FlagField} */ (field), value: Boolean(value) });
  }
  if (criteria.anyOf?.length) {
    list.push({ kind: 'anyOf', options: criteria.anyOf.map(toRequirements) });
  }
  return list;
}

/**
 * @param {Requirement} req
 * @param {Profile} profile
 * @returns {boolean}
 */
export function isMet(req, profile) {
  switch (req.kind) {
    case 'age':
      return profile.age >= (req.min ?? -Infinity) && profile.age <= (req.max ?? Infinity);
    case 'maxIncome':
      return profile.annualIncome <= req.value;
    case 'gender':
      return req.values.includes(profile.gender);
    case 'occupation':
      return req.values.includes(profile.occupation);
    case 'caste':
      return req.values.includes(profile.caste);
    case 'area':
      return profile.area === req.value;
    case 'flag':
      return profile[req.field] === req.value;
    case 'anyOf':
      return req.options.some((option) => option.every((r) => isMet(r, profile)));
  }
}

/**
 * Check one scheme against a profile.
 * @param {Scheme} scheme
 * @param {Profile} profile
 * @returns {Evaluation}
 */
export function evaluateScheme(scheme, profile) {
  /** @type {Requirement[]} */
  const met = [];
  /** @type {Requirement[]} */
  const unmet = [];

  for (const req of toRequirements(scheme.criteria)) {
    if (!isMet(req, profile)) {
      unmet.push(req);
    } else if (req.kind === 'anyOf') {
      // Explain the alternative that actually matched, not every alternative.
      const matched = req.options.find((option) => option.every((r) => isMet(r, profile)));
      met.push(...(matched ?? []).map((r) => narrowToProfile(r, profile)));
    } else {
      met.push(narrowToProfile(req, profile));
    }
  }

  if (unmet.length === 0) return { status: 'eligible', met, unmet, nextStep: null };

  const hint = unmet.length === 1 ? nextStepHint(unmet[0], profile) : null;
  if (hint) return { status: 'almost', met, unmet, nextStep: { requirement: unmet[0], hint } };
  return { status: 'ineligible', met, unmet, nextStep: null };
}

/**
 * For a satisfied list requirement, keep only the value that matched, so the
 * explanation reads "Occupation: Farmer" rather than every allowed option.
 * @param {Requirement} req
 * @param {Profile} profile
 * @returns {Requirement}
 */
function narrowToProfile(req, profile) {
  switch (req.kind) {
    case 'gender':
      return { kind: 'gender', values: [profile.gender] };
    case 'occupation':
      return { kind: 'occupation', values: [profile.occupation] };
    case 'caste':
      return { kind: 'caste', values: [profile.caste] };
    default:
      return req;
  }
}

/**
 * A practical next step for a missing condition, or `null` if the condition
 * is not something a person can reasonably change (e.g. gender, category).
 * This keeps "almost eligible" meaningful instead of listing every near miss.
 *
 * @param {Requirement} req
 * @param {Profile} profile
 * @returns {Localized | null}
 */
export function nextStepHint(req, profile) {
  switch (req.kind) {
    case 'age':
      // Only a not-yet-reached minimum age is something time will fix.
      if (req.min !== undefined && profile.age < req.min && profile.age >= req.min - AGE_LOOKAHEAD_YEARS) {
        return {
          en: `You can apply once you turn ${req.min}.`,
          hi: `${req.min} वर्ष के होने पर आप आवेदन कर सकते हैं।`,
        };
      }
      return null;
    case 'flag':
      if (req.field === 'hasBankAccount' && req.value) {
        return {
          en: 'Open a free zero-balance account under PM Jan Dhan Yojana at any bank branch.',
          hi: 'किसी भी बैंक शाखा में पीएम जन धन योजना के तहत मुफ़्त ज़ीरो-बैलेंस खाता खोलें।',
        };
      }
      if (req.field === 'hasBplCard' && req.value && profile.annualIncome <= RATION_CARD_HINT_MAX_INCOME) {
        return {
          en: 'Your income may qualify you for a priority-household (NFSA) ration card — ask at your local ration office.',
          hi: 'आपकी आय पर आपको प्राथमिकता परिवार (NFSA) राशन कार्ड मिल सकता है — अपने स्थानीय राशन कार्यालय में पूछें।',
        };
      }
      return null;
    case 'anyOf':
      for (const option of req.options) {
        const missing = option.filter((r) => !isMet(r, profile));
        if (missing.length === 1) {
          const hint = nextStepHint(missing[0], profile);
          if (hint) return hint;
        }
      }
      return null;
    default:
      return null;
  }
}

/**
 * Describe a requirement in plain language.
 * @param {Requirement} req
 * @param {Lang} lang
 * @returns {string}
 */
export function describeRequirement(req, lang) {
  const hi = lang === 'hi';
  switch (req.kind) {
    case 'age':
      if (req.min !== undefined && req.max !== undefined) {
        return hi ? `आयु ${req.min}–${req.max} वर्ष` : `Aged ${req.min}–${req.max}`;
      }
      if (req.min !== undefined) return hi ? `आयु ${req.min} वर्ष या अधिक` : `Aged ${req.min} or older`;
      return hi ? `आयु ${req.max} वर्ष या कम` : `Aged ${req.max} or younger`;
    case 'maxIncome': {
      const amount = formatCompactINR(req.value, lang);
      return hi ? `पारिवारिक आय ${amount} प्रति वर्ष तक` : `Family income up to ${amount} a year`;
    }
    case 'gender':
      if (req.values.length === 1 && req.values[0] === 'female') return hi ? 'महिलाओं के लिए' : 'For women';
      return `${hi ? 'लिंग' : 'Gender'}: ${joinList(labels(req.values, GENDERS, lang), lang)}`;
    case 'occupation':
      return `${hi ? 'व्यवसाय' : 'Occupation'}: ${joinList(labels(req.values, OCCUPATIONS, lang), lang)}`;
    case 'caste':
      return `${hi ? 'श्रेणी' : 'Category'}: ${joinList(labels(req.values, CASTES, lang), lang)}`;
    case 'area':
      return hi ? `${AREAS[req.value].hi} क्षेत्र में निवास` : `Lives in a ${req.value} area`;
    case 'flag':
      return FLAG_TEXT[req.field][req.value ? 'yes' : 'no'][lang];
    case 'anyOf': {
      const options = req.options.map((option) =>
        option.map((r) => describeRequirement(r, lang)).join(hi ? ' और ' : ' and '),
      );
      return `${hi ? 'इनमें से कोई एक' : 'Any one of'}: ${options.join('; ')}`;
    }
  }
}

/** @type {Record<FlagField, { yes: Localized, no: Localized }>} */
const FLAG_TEXT = {
  hasBplCard: {
    yes: { en: 'Holds a BPL / NFSA ration card', hi: 'BPL / NFSA राशन कार्ड धारक' },
    no: { en: 'Does not hold a BPL ration card', hi: 'BPL राशन कार्ड नहीं है' },
  },
  ownsFarmland: {
    yes: { en: 'Owns agricultural land', hi: 'कृषि भूमि के मालिक' },
    no: { en: 'Does not own agricultural land', hi: 'कृषि भूमि नहीं है' },
  },
  hasDisability: {
    yes: { en: 'Person with a disability (40% or more)', hi: 'दिव्यांग व्यक्ति (40% या अधिक)' },
    no: { en: 'No certified disability', hi: 'प्रमाणित दिव्यांगता नहीं' },
  },
  hasBankAccount: {
    yes: { en: 'Has a bank account', hi: 'बैंक खाता है' },
    no: { en: 'Does not have a bank account yet', hi: 'अभी तक बैंक खाता नहीं है' },
  },
  ownsPuccaHouse: {
    yes: { en: 'Household owns a pucca house', hi: 'परिवार के पास पक्का घर है' },
    no: { en: 'Household does not own a pucca house', hi: 'परिवार के पास पक्का घर नहीं है' },
  },
  isPregnant: {
    yes: { en: 'Currently pregnant', hi: 'वर्तमान में गर्भवती' },
    no: { en: 'Not currently pregnant', hi: 'वर्तमान में गर्भवती नहीं' },
  },
  hasDaughterUnder10: {
    yes: { en: 'Has a daughter under 10', hi: '10 वर्ष से कम उम्र की बेटी है' },
    no: { en: 'No daughter under 10', hi: '10 वर्ष से कम उम्र की बेटी नहीं' },
  },
};

/**
 * @template {string} K
 * @param {K[]} values
 * @param {Record<K, Localized>} dictionary
 * @param {Lang} lang
 */
function labels(values, dictionary, lang) {
  return values.map((value) => dictionary[value][lang]);
}

/** Display order for result lists: direct money first, then everything else. */
const TYPE_ORDER = /** @type {BenefitType[]} */ ([
  'cash',
  'pension',
  'scholarship',
  'housing',
  'insurance',
  'in_kind',
  'employment',
  'loan',
  'savings',
  'training',
  'banking',
  'registration',
]);

/**
 * @typedef {object} MatchedScheme
 * @property {Scheme} scheme
 * @property {Evaluation} evaluation
 */

/**
 * @typedef {object} MatchSummary
 * @property {number} eligibleCount
 * @property {number} almostCount
 * @property {number} firstYearCash  Direct cash and pension payments receivable in a year.
 * @property {number} insuranceCover Combined cover from insurance schemes.
 * @property {number} maxLoan        Largest loan or credit limit available.
 */

/**
 * @typedef {object} MatchResult
 * @property {MatchedScheme[]} eligible
 * @property {MatchedScheme[]} almost
 * @property {MatchSummary} summary
 */

/**
 * Match a profile against a catalog of schemes.
 * @param {Profile} profile
 * @param {readonly Scheme[]} schemes
 * @returns {MatchResult}
 */
export function matchSchemes(profile, schemes) {
  /** @type {MatchedScheme[]} */
  const eligible = [];
  /** @type {MatchedScheme[]} */
  const almost = [];

  for (const scheme of schemes) {
    const evaluation = evaluateScheme(scheme, profile);
    if (evaluation.status === 'eligible') eligible.push({ scheme, evaluation });
    else if (evaluation.status === 'almost') almost.push({ scheme, evaluation });
  }

  eligible.sort(byDisplayOrder);
  almost.sort(byDisplayOrder);

  return { eligible, almost, summary: summarise(eligible, almost.length) };
}

/**
 * Totals are kept in separate buckets on purpose: adding a loan limit or an
 * insurance cover to cash payments would overstate what a person receives.
 *
 * @param {MatchedScheme[]} eligible
 * @param {number} almostCount
 * @returns {MatchSummary}
 */
function summarise(eligible, almostCount) {
  let firstYearCash = 0;
  let insuranceCover = 0;
  let maxLoan = 0;

  for (const { scheme } of eligible) {
    const { type, amount, period } = scheme.benefit;
    if (amount === undefined) continue;
    if (type === 'cash' || type === 'pension') {
      firstYearCash += period === 'month' ? amount * 12 : amount;
    } else if (type === 'insurance') {
      insuranceCover += amount;
    } else if (type === 'loan') {
      maxLoan = Math.max(maxLoan, amount);
    }
  }

  return { eligibleCount: eligible.length, almostCount, firstYearCash, insuranceCover, maxLoan };
}

/**
 * @param {MatchedScheme} a
 * @param {MatchedScheme} b
 */
function byDisplayOrder(a, b) {
  const typeDiff = TYPE_ORDER.indexOf(a.scheme.benefit.type) - TYPE_ORDER.indexOf(b.scheme.benefit.type);
  if (typeDiff !== 0) return typeDiff;
  return (b.scheme.benefit.amount ?? 0) - (a.scheme.benefit.amount ?? 0);
}
