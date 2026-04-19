/* ============================================
   LabhSetu — Main App Controller
   ============================================ */

// ── State ────────────────────────────────────
let currentProfile = null;
let matchResults = null;

// ── Loading steps sequence ───────────────────
const LOADING_STEPS = [
  "Reading your profile...",
  "Checking PM Kisan eligibility...",
  "Scanning 35+ agriculture schemes...",
  "Checking Ayushman Bharat...",
  "Scanning health schemes...",
  "Checking housing schemes...",
  "Scanning education scholarships...",
  "Checking MUDRA loan eligibility...",
  "Scanning employment schemes...",
  "Checking insurance schemes...",
  "Calculating total benefits...",
  "Preparing your results...",
];

const LOADING_STEPS_HI = [
  "आपकी प्रोफ़ाइल पढ़ी जा रही है...",
  "पीएम किसान पात्रता जांच...",
  "35+ कृषि योजनाएं स्कैन हो रही हैं...",
  "आयुष्मान भारत जांच...",
  "स्वास्थ्य योजनाएं स्कैन हो रही हैं...",
  "आवास योजनाएं जांच...",
  "शिक्षा छात्रवृत्तियां स्कैन...",
  "मुद्रा ऋण पात्रता जांच...",
  "रोजगार योजनाएं स्कैन...",
  "बीमा योजनाएं जांच...",
  "कुल लाभ की गणना...",
  "आपके परिणाम तैयार हो रहे हैं...",
];

const SCHEME_PREVIEW_NAMES = [
  "PM Kisan", "Ayushman Bharat", "PM Awas", "MUDRA Loan",
  "PM Ujjwala", "PMKVY", "eShram", "APY", "PMJJBY",
  "PMSBY", "NSP Scholarship", "MNREGA",
];

// ── DOM Ready ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initChips();
  initForm();
  initTabs();
  initRestart();
  updateProgress(1);
});

// ── Chip selectors ───────────────────────────
function initChips() {
  ['occupation-chips', 'caste-chips'].forEach(groupId => {
    const group = document.getElementById(groupId);
    if (!group) return;

    const hiddenId = groupId === 'occupation-chips' ? 'occupation' : 'casteCategory';
    const hidden = document.getElementById(hiddenId);

    group.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        // Deselect all in group
        group.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
        // Select clicked
        chip.classList.add('selected');
        hidden.value = chip.dataset.value;

        // Clear error
        const errEl = document.getElementById(`err-${hiddenId === 'occupation' ? 'occupation' : 'caste'}`);
        if (errEl) errEl.textContent = '';
      });
    });
  });
}

// ── Income hint ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const incomeInput = document.getElementById('annualIncome');
  const incomeHint = document.getElementById('income-hint');

  if (incomeInput && incomeHint) {
    incomeInput.addEventListener('input', () => {
      const val = parseInt(incomeInput.value) || 0;
      if (val === 0) { incomeHint.textContent = ''; return; }

      let hint = '';
      if (val <= 100000) hint = '🟢 Eligible for most BPL schemes';
      else if (val <= 250000) hint = '🟢 Eligible for many government schemes';
      else if (val <= 500000) hint = '🟡 Eligible for select schemes';
      else if (val <= 800000) hint = '🟡 Eligible for middle-income schemes';
      else hint = '⚪ Fewer schemes, but still checking...';

      incomeHint.textContent = hint;
    });
  }
});

// ── Form submission ──────────────────────────
function initForm() {
  const form = document.getElementById('profile-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Collect profile
    currentProfile = {
      age: parseInt(document.getElementById('age').value),
      gender: document.getElementById('gender').value,
      annualIncome: parseInt(document.getElementById('annualIncome').value) || 0,
      occupation: document.getElementById('occupation').value,
      casteCategory: document.getElementById('casteCategory').value,
      state: document.getElementById('state').value,
      hasBPLCard: document.getElementById('hasBPLCard').checked,
      hasLandHolding: document.getElementById('hasLandHolding').checked,
      isDifferentlyAbled: document.getElementById('isDifferentlyAbled').checked,
      hasBankAccount: document.getElementById('hasBankAccount').checked,
    };

    // Show loading
    showView('loading');
    updateProgress(2);
    await runLoadingAnimation();

    // Match schemes
    matchResults = matchSchemes(currentProfile);

    // Show results
    renderResults(matchResults);
    showView('results');
    updateProgress(3);
  });
}

// ── Validation ───────────────────────────────
function validateForm() {
  let valid = true;

  // Age
  const age = parseInt(document.getElementById('age').value);
  const errAge = document.getElementById('err-age');
  if (!age || age < 1 || age > 120) {
    errAge.textContent = t('err_age');
    valid = false;
  } else {
    errAge.textContent = '';
  }

  // Income
  const income = document.getElementById('annualIncome').value;
  const errIncome = document.getElementById('err-income');
  if (income === '' || parseInt(income) < 0) {
    errIncome.textContent = t('err_income');
    valid = false;
  } else {
    errIncome.textContent = '';
  }

  // Occupation
  const occ = document.getElementById('occupation').value;
  const errOcc = document.getElementById('err-occupation');
  if (!occ) {
    errOcc.textContent = t('err_occupation');
    document.getElementById('occupation-chips').style.animation = 'shake 0.3s ease';
    setTimeout(() => document.getElementById('occupation-chips').style.animation = '', 300);
    valid = false;
  } else {
    errOcc.textContent = '';
  }

  // Caste
  const caste = document.getElementById('casteCategory').value;
  const errCaste = document.getElementById('err-caste');
  if (!caste) {
    errCaste.textContent = t('err_caste');
    valid = false;
  } else {
    errCaste.textContent = '';
  }

  return valid;
}

// ── Loading animation ────────────────────────
async function runLoadingAnimation() {
  const stepEl = document.getElementById('loading-step');
  const barEl = document.getElementById('loading-bar');
  const tagsEl = document.getElementById('loading-schemes');
  const lang = window.currentLang || 'en';
  const steps = lang === 'hi' ? LOADING_STEPS_HI : LOADING_STEPS;

  let tagIndex = 0;

  for (let i = 0; i < steps.length; i++) {
    if (stepEl) stepEl.textContent = steps[i];

    // Progress bar
    const pct = Math.round(((i + 1) / steps.length) * 100);
    if (barEl) barEl.style.width = pct + '%';

    // Trickle scheme tags
    if (tagsEl && tagIndex < SCHEME_PREVIEW_NAMES.length) {
      const tag = document.createElement('span');
      tag.className = 'loading-scheme-tag';
      tag.textContent = SCHEME_PREVIEW_NAMES[tagIndex++];
      tag.style.animationDelay = '0s';
      tagsEl.appendChild(tag);
    }

    await sleep(280);
  }

  await sleep(300);
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// ── Render results ───────────────────────────
function renderResults({ eligible, almost, totalBenefit }) {
  const lang = window.currentLang || 'en';

  // Summary numbers
  document.getElementById('total-amount').textContent = formatBenefit(totalBenefit);
  document.getElementById('eligible-count').textContent = eligible.length;
  document.getElementById('almost-count').textContent = almost.length;
  document.getElementById('tab-eligible-count').textContent = eligible.length;
  document.getElementById('tab-almost-count').textContent = almost.length;

  // Eligible cards
  const eligibleList = document.getElementById('eligible-list');
  eligibleList.innerHTML = '';

  if (eligible.length === 0) {
    eligibleList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">No exact matches found</div>
        <div class="empty-sub">Check the "Almost Eligible" tab — you may qualify with small changes.</div>
      </div>`;
  } else {
    eligible.forEach((scheme, i) => {
      eligibleList.appendChild(buildCard(scheme, 'eligible', i, lang));
    });
  }

  // Almost cards
  const almostList = document.getElementById('almost-list');
  almostList.innerHTML = '';

  if (almost.length === 0) {
    almostList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✅</div>
        <div class="empty-title">Great news!</div>
        <div class="empty-sub">You're eligible for all matching schemes.</div>
      </div>`;
  } else {
    almost.forEach((scheme, i) => {
      almostList.appendChild(buildCard(scheme, 'almost', i, lang));
    });
  }
}

// ── Build a scheme card DOM element ──────────
function buildCard(scheme, type, index, lang) {
  const name = lang === 'hi' ? scheme.name_hi : scheme.name_en;
  const ministry = lang === 'hi' ? scheme.ministry_hi : scheme.ministry_en;
  const desc = lang === 'hi' ? scheme.description_hi : scheme.description_en;

  const card = document.createElement('div');
  card.className = `scheme-card ${type}`;
  card.style.animationDelay = `${index * 0.06}s`;

  const whyOrMissed = type === 'eligible'
    ? `<div class="why-eligible">
         <span class="why-icon">✓</span>
         <span class="why-text">${scheme.matchReason || ''}</span>
       </div>`
    : `<div class="missed-bar">
         <span class="miss-icon">⚠</span>
         <span class="miss-text">${lang === 'hi' ? 'चूक गए: ' : 'Missed: '}${scheme.missedReason || ''}</span>
       </div>`;

  const docTags = (scheme.documents || [])
    .map(d => `<span class="doc-tag">${d}</span>`)
    .join('');

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-top">
        <span class="ministry-tag">${ministry}</span>
        <div class="benefit-chip">
          <span class="benefit-amount">${scheme.benefit_display}</span>
          <span class="benefit-type">${scheme.benefit_type}</span>
        </div>
      </div>
      <div class="scheme-name">${name}</div>
      ${whyOrMissed}
      <button class="card-expand-btn" onclick="toggleDetails(this)" aria-expanded="false">
        <span>▸ Documents needed</span>
      </button>
      <div class="card-extra collapsed" style="max-height:0">
        <div class="docs-section">
          <div class="doc-tags">${docTags}</div>
        </div>
        <p style="font-size:0.8rem;color:var(--grey-2);margin-top:8px;">${desc}</p>
      </div>
    </div>
    <div class="card-footer">
      <a href="${scheme.apply_link}" target="_blank" rel="noopener" class="btn-apply">
        ${lang === 'hi' ? 'अभी आवेदन करें' : 'Apply Now'}
        <span class="apply-arrow">→</span>
      </a>
    </div>
  `;

  return card;
}

// ── Toggle expand/collapse ───────────────────
function toggleDetails(btn) {
  const extra = btn.nextElementSibling;
  const isOpen = btn.getAttribute('aria-expanded') === 'true';

  if (isOpen) {
    extra.style.maxHeight = '0';
    extra.classList.add('collapsed');
    btn.setAttribute('aria-expanded', 'false');
    btn.querySelector('span').textContent = '▸ Documents needed';
  } else {
    extra.classList.remove('collapsed');
    extra.style.maxHeight = extra.scrollHeight + 'px';
    btn.setAttribute('aria-expanded', 'true');
    btn.querySelector('span').textContent = '▾ Hide details';
  }
}

// ── Tabs ─────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.rtab').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;

      document.querySelectorAll('.rtab').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      document.querySelectorAll('.scheme-list').forEach(list => {
        if (list.id === target) {
          list.classList.remove('hidden-tab');
        } else {
          list.classList.add('hidden-tab');
        }
      });
    });
  });
}

// ── Restart ──────────────────────────────────
function initRestart() {
  const btn = document.getElementById('btn-restart');
  if (btn) {
    btn.addEventListener('click', () => {
      // Clear form
      document.getElementById('profile-form').reset();
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
      document.getElementById('occupation').value = '';
      document.getElementById('casteCategory').value = '';
      document.getElementById('income-hint').textContent = '';
      document.getElementById('loading-schemes').innerHTML = '';

      // Reset state
      currentProfile = null;
      matchResults = null;

      showView('form');
      updateProgress(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ── View switcher ────────────────────────────
function showView(name) {
  document.querySelectorAll('.view').forEach(v => {
    v.classList.add('hidden');
    v.classList.remove('active');
  });

  const target = document.getElementById(`view-${name}`);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }
}

// ── Progress bar ─────────────────────────────
function updateProgress(step) {
  const bar = document.getElementById('progress-bar');
  const label = document.getElementById('step-indicator');
  const pct = Math.round((step / 3) * 100);

  if (bar) bar.style.width = pct + '%';
  if (label) label.textContent = t(`step${step}`);
}

// ── CSS shake animation ──────────────────────
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%,100%{ transform: translateX(0); }
    25%    { transform: translateX(-6px); }
    75%    { transform: translateX(6px); }
  }
`;
document.head.appendChild(style);