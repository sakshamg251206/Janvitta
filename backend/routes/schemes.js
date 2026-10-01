// @ts-check
import { Router } from 'express';

import { describeRequirement, matchSchemes, toRequirements } from '../../frontend/scripts/core/eligibility.js';
import { parseProfile } from '../../frontend/scripts/core/profile.js';
import {
  BENEFIT_TYPES,
  CATALOG_VERSION,
  CATEGORIES,
  DOCUMENTS,
  SCHEMES,
  findScheme,
} from '../../frontend/scripts/data/schemes.js';
import { HttpError } from '../http-error.js';

/** @typedef {import('../../frontend/scripts/core/eligibility.js').Scheme} Scheme */
/** @typedef {import('../../frontend/scripts/core/profile.js').Lang} Lang */

export const schemesRouter = Router();

/**
 * GET /api/v1/schemes — list the catalog, optionally filtered by category.
 */
schemesRouter.get('/schemes', (req, res) => {
  const lang = readLang(req.query.lang);
  const { category } = req.query;
  if (category !== undefined && (typeof category !== 'string' || !Object.hasOwn(CATEGORIES, category))) {
    throw new HttpError(400, 'INVALID_QUERY', `category must be one of: ${Object.keys(CATEGORIES).join(', ')}.`);
  }

  const schemes = category ? SCHEMES.filter((scheme) => scheme.category === category) : SCHEMES;
  res.json({
    catalogVersion: CATALOG_VERSION,
    count: schemes.length,
    schemes: schemes.map((scheme) => serializeScheme(scheme, lang)),
  });
});

/**
 * GET /api/v1/schemes/:id — a single scheme by its slug.
 */
schemesRouter.get('/schemes/:id', (req, res) => {
  const lang = readLang(req.query.lang);
  const scheme = findScheme(req.params.id);
  if (!scheme) throw new HttpError(404, 'NOT_FOUND', `No scheme with id "${req.params.id}".`);
  res.json({ catalogVersion: CATALOG_VERSION, scheme: serializeScheme(scheme, lang) });
});

/**
 * POST /api/v1/eligibility — match a profile against every scheme.
 * The profile is evaluated in memory and never stored or logged.
 */
schemesRouter.post('/eligibility', (req, res) => {
  const lang = readLang(req.query.lang);
  const parsed = parseProfile(req.body);
  if (!parsed.ok) {
    throw new HttpError(422, 'VALIDATION_ERROR', 'The profile has invalid or missing fields.', parsed.errors);
  }

  const { eligible, almost, summary } = matchSchemes(parsed.profile, SCHEMES);
  res.json({
    catalogVersion: CATALOG_VERSION,
    summary,
    eligible: eligible.map(({ scheme, evaluation }) => ({
      ...serializeScheme(scheme, lang),
      reasons: evaluation.met.map((req) => describeRequirement(req, lang)),
    })),
    almost: almost.map(({ scheme, evaluation }) => ({
      ...serializeScheme(scheme, lang),
      missing: evaluation.nextStep ? describeRequirement(evaluation.nextStep.requirement, lang) : null,
      nextStep: evaluation.nextStep ? evaluation.nextStep.hint[lang] : null,
    })),
  });
});

/**
 * @param {unknown} value
 * @returns {Lang}
 */
function readLang(value) {
  if (value === undefined) return 'en';
  if (value === 'en' || value === 'hi') return value;
  throw new HttpError(400, 'INVALID_QUERY', 'lang must be "en" or "hi".');
}

/**
 * Resolve a catalog entry into a flat, single-language JSON shape.
 * @param {Scheme} scheme
 * @param {Lang} lang
 */
function serializeScheme(scheme, lang) {
  const { benefit } = scheme;
  return {
    id: scheme.id,
    name: scheme.name[lang],
    ministry: scheme.ministry[lang],
    category: { id: scheme.category, label: CATEGORIES[scheme.category][lang] },
    summary: scheme.summary[lang],
    benefit: {
      type: benefit.type,
      typeLabel: BENEFIT_TYPES[benefit.type][lang],
      label: benefit.label[lang],
      amount: benefit.amount ?? null,
      period: benefit.period ?? null,
    },
    requirements: toRequirements(scheme.criteria).map((req) => describeRequirement(req, lang)),
    documents: scheme.documents.map((key) => DOCUMENTS[key][lang]),
    note: scheme.note?.[lang] ?? null,
    applyUrl: scheme.applyUrl,
  };
}
