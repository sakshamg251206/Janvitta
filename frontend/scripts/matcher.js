/* ============================================
   LabhSetu — Eligibility Matching Engine
   ============================================ */

/**
 * Match a user profile against all schemes.
 * Returns { eligible: [], almost: [], totalBenefit: number }
 */
function matchSchemes(profile) {
  const eligible = [];
  const almost = [];

  SCHEMES.forEach(scheme => {
    const result = checkEligibility(scheme, profile);

    if (result.status === 'eligible') {
      eligible.push({ ...scheme, matchReason: result.reason });
    } else if (result.status === 'almost') {
      almost.push({ ...scheme, missedReason: result.missedReason });
    }
  });

  // Sort by benefit amount descending
  eligible.sort((a, b) => b.benefit_amount - a.benefit_amount);
  almost.sort((a, b) => b.benefit_amount - a.benefit_amount);

  // Calculate total benefit
  const totalBenefit = eligible.reduce((sum, s) => sum + s.benefit_amount, 0);

  return { eligible, almost, totalBenefit };
}

/**
 * Core eligibility check for a single scheme.
 */
function checkEligibility(scheme, profile) {
  const c = scheme.criteria;
  const missedReasons = [];

  // ── Age checks ──────────────────────────────
  if (c.min_age !== undefined && profile.age < c.min_age) {
    missedReasons.push(`Must be at least ${c.min_age} years old`);
  }
  if (c.max_age !== undefined && profile.age > c.max_age) {
    missedReasons.push(`Must be under ${c.max_age} years old`);
  }

  // ── Gender check ────────────────────────────
  if (c.gender && c.gender.length > 0) {
    if (!c.gender.includes(profile.gender)) {
      missedReasons.push(`Only for ${c.gender.join('/')}`);
    }
  }

  // ── Occupation check ────────────────────────
  if (c.occupation && c.occupation.length > 0) {
    if (!c.occupation.includes(profile.occupation)) {
      missedReasons.push(`Occupation must be: ${c.occupation.join(' or ')}`);
    }
  }

  // ── Income check ────────────────────────────
  if (c.max_income !== null && c.max_income !== undefined) {
    if (profile.annualIncome > c.max_income) {
      missedReasons.push(`Income must be below ₹${formatINR(c.max_income)}`);
    }
  }

  // ── BPL check ───────────────────────────────
  if (c.has_bpl === true && !profile.hasBPLCard) {
    missedReasons.push('Requires BPL card');
  }

  // ── Land check ──────────────────────────────
  if (c.has_land === true && !profile.hasLandHolding) {
    missedReasons.push('Requires agricultural land ownership');
  }

  // ── Bank account check ──────────────────────
  if (c.has_bank === true && !profile.hasBankAccount) {
    missedReasons.push('Requires active bank account');
  }

  // ── Disability check ────────────────────────
  if (c.is_disabled === true && !profile.isDifferentlyAbled) {
    missedReasons.push('For differently-abled persons only');
  }

  // ── Caste check ─────────────────────────────
  if (c.caste && c.caste.length > 0) {
    if (!c.caste.includes(profile.casteCategory)) {
      missedReasons.push(`Category must be: ${c.caste.join(' or ')}`);
    }
  }

  // ── Stand Up India special gender ───────────
  if (c.gender_special) {
    const isScSt = ['SC', 'ST'].includes(profile.casteCategory);
    const isWoman = profile.gender === 'female';
    if (!isScSt && !isWoman) {
      missedReasons.push('Only for SC/ST or Women entrepreneurs');
    }
  }

  // ── Decide result ───────────────────────────
  if (missedReasons.length === 0) {
    return {
      status: 'eligible',
      reason: buildWhyText(scheme, profile),
    };
  }

  // "Almost" if only 1 criteria missed
  if (missedReasons.length === 1) {
    return {
      status: 'almost',
      missedReason: missedReasons[0],
    };
  }

  return { status: 'not_eligible' };
}

/**
 * Build a human-readable "why you qualify" string.
 */
function buildWhyText(scheme, profile) {
  const lang = window.currentLang || 'en';
  if (lang === 'hi' && scheme.why_hi) return scheme.why_hi;
  return scheme.why_en || 'You meet all eligibility criteria.';
}

/**
 * Format number in Indian style (e.g. 250000 → "2,50,000")
 */
function formatINR(num) {
  if (!num) return '0';
  return num.toLocaleString('en-IN');
}

/**
 * Format benefit amount for display
 */
function formatBenefit(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

window.matchSchemes = matchSchemes;
window.formatINR = formatINR;
window.formatBenefit = formatBenefit;