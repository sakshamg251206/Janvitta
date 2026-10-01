// @ts-check
/**
 * Profile form: renders the answer choices, keeps conditional questions in
 * sync, and turns the form into a validated profile with friendly errors.
 */

import { formatCompactINR, formatINR } from '../core/format.js';
import { AREAS, CASTES, GENDERS, OCCUPATIONS, parseProfile } from '../core/profile.js';
import { t } from './i18n.js';

/** @typedef {import('../core/profile.js').Lang} Lang */
/** @typedef {import('../core/profile.js').Profile} Profile */
/** @typedef {import('../core/profile.js').Localized} Localized */
/** @typedef {import('../core/profile.js').FlagField} FlagField */
/** @typedef {import('./i18n.js').StringKey} StringKey */

/** Choice groups rendered as radio "chips", keyed by form field name. */
const CHOICE_GROUPS = /** @type {const} */ ({
  gender: GENDERS,
  occupation: OCCUPATIONS,
  caste: CASTES,
  area: AREAS,
});

/** Yes/no questions, in the order they are asked. */
const FLAG_ORDER = /** @type {FlagField[]} */ ([
  'hasBankAccount',
  'hasBplCard',
  'ownsFarmland',
  'ownsPuccaHouse',
  'hasDisability',
  'hasDaughterUnder10',
  'isPregnant',
]);

/** Fields in on-screen order, used to order the error summary. */
const FIELD_ORDER = ['age', 'gender', 'occupation', 'annualIncome', 'caste', 'area'];

/**
 * @param {HTMLFormElement} form
 */
export function createProfileForm(form) {
  /** @type {Lang} */
  let lang = 'en';
  /** @type {Set<string>} fields with a visible error, re-validated as the user edits */
  const invalidFields = new Set();

  const ageInput = /** @type {HTMLInputElement} */ (form.elements.namedItem('age'));
  const incomeInput = /** @type {HTMLInputElement} */ (form.elements.namedItem('annualIncome'));
  const incomePreview = /** @type {HTMLElement} */ (form.querySelector('#income-preview'));
  const errorSummary = /** @type {HTMLElement} */ (form.querySelector('#error-summary'));
  const errorList = /** @type {HTMLElement} */ (form.querySelector('#error-list'));

  renderChoices();
  renderFlags();

  form.addEventListener('input', (event) => {
    const target = /** @type {HTMLInputElement} */ (event.target);
    if (target === ageInput || target === incomeInput) {
      // Keep numeric fields to digits so pasted values like "2,50,000" just work.
      const digits = target.value.replace(/\D/g, '');
      if (digits !== target.value) target.value = digits;
    }
    if (target === incomeInput) updateIncomePreview();
    if (target.name === 'gender') syncConditionalQuestions();
    if (invalidFields.has(target.name)) revalidate();
  });

  function renderChoices() {
    for (const [name, options] of Object.entries(CHOICE_GROUPS)) {
      const container = /** @type {HTMLElement} */ (form.querySelector(`[data-choices="${name}"]`));
      container.replaceChildren(
        ...Object.keys(options).map((value) => {
          const label = document.createElement('label');
          label.className = 'choice';
          const input = document.createElement('input');
          input.type = 'radio';
          input.name = name;
          input.value = value;
          const text = document.createElement('span');
          text.className = 'choice__text';
          text.dataset.option = value;
          label.append(input, text);
          return label;
        }),
      );
    }
  }

  function renderFlags() {
    const list = /** @type {HTMLElement} */ (form.querySelector('#flag-list'));
    list.replaceChildren(
      ...FLAG_ORDER.map((field) => {
        const label = document.createElement('label');
        label.className = 'switch';
        label.dataset.flag = field;
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = field;
        input.setAttribute('role', 'switch');
        const text = document.createElement('span');
        text.className = 'switch__text';
        const title = document.createElement('span');
        title.className = 'switch__title';
        title.dataset.i18n = `flag_${field}`;
        const desc = document.createElement('span');
        desc.className = 'switch__desc';
        desc.dataset.i18n = `flag_${field}_desc`;
        text.append(title, desc);
        const track = document.createElement('span');
        track.className = 'switch__track';
        track.setAttribute('aria-hidden', 'true');
        label.append(input, text, track);
        return label;
      }),
    );
  }

  /** Pregnancy is only asked when the person has said they are female. */
  function syncConditionalQuestions() {
    const isFemale = readRadio('gender') === 'female';
    const row = /** @type {HTMLElement} */ (form.querySelector('[data-flag="isPregnant"]'));
    row.hidden = !isFemale;
    if (!isFemale) /** @type {HTMLInputElement} */ (form.elements.namedItem('isPregnant')).checked = false;
  }

  function updateIncomePreview() {
    const value = incomeInput.value;
    if (value === '') {
      incomePreview.textContent = '';
      return;
    }
    const amount = Number(value);
    const compact = formatCompactINR(amount, lang);
    const full = formatINR(amount);
    const shown = compact === full ? full : `${full} (${compact})`;
    incomePreview.textContent = t(lang, 'income_preview', { amount: shown });
  }

  /** @param {string} name */
  function readRadio(name) {
    const checked = /** @type {HTMLInputElement | null} */ (form.querySelector(`input[name="${name}"]:checked`));
    return checked?.value ?? '';
  }

  function readRaw() {
    /** @type {Record<string, string | boolean>} */
    const raw = {
      age: ageInput.value,
      annualIncome: incomeInput.value,
      gender: readRadio('gender'),
      occupation: readRadio('occupation'),
      caste: readRadio('caste'),
      area: readRadio('area'),
    };
    for (const field of FLAG_ORDER) {
      raw[field] = /** @type {HTMLInputElement} */ (form.elements.namedItem(field)).checked;
    }
    return raw;
  }

  /**
   * @param {string[]} fields
   * @param {{ summary: boolean }} options
   */
  function showErrors(fields, { summary }) {
    invalidFields.clear();
    for (const name of FIELD_ORDER) {
      const message = form.querySelector(`#${name}-error`);
      const field = form.querySelector(`#field-${name}`);
      const hasError = fields.includes(name);
      if (hasError) invalidFields.add(name);
      if (message) message.textContent = hasError ? t(lang, /** @type {StringKey} */ (`err_${name}`)) : '';
      field?.classList.toggle('field--invalid', hasError);
      form.querySelectorAll(`input[name="${name}"]`).forEach((control) => {
        if (hasError) control.setAttribute('aria-invalid', 'true');
        else control.removeAttribute('aria-invalid');
      });
    }

    if (!summary) {
      if (fields.length === 0) errorSummary.hidden = true;
      return;
    }
    errorList.replaceChildren(
      ...fields.map((name) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#field-${name}`;
        link.textContent = t(lang, /** @type {StringKey} */ (`err_${name}`));
        link.addEventListener('click', (event) => {
          event.preventDefault();
          focusField(name);
        });
        item.append(link);
        return item;
      }),
    );
    errorSummary.hidden = fields.length === 0;
  }

  /** @param {string} name */
  function focusField(name) {
    const target =
      form.querySelector(`#${name}`) ??
      form.querySelector(`input[name="${name}"]:checked`) ??
      form.querySelector(`input[name="${name}"]`);
    /** @type {HTMLElement | null} */ (target)?.focus();
    form.querySelector(`#field-${name}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  /** Re-check while the user is correcting errors, without re-announcing the summary. */
  function revalidate() {
    const result = parseProfile(readRaw());
    const fields = result.ok ? [] : orderedFields(result.errors.map((e) => e.field));
    showErrors(fields, { summary: false });
    if (!errorSummary.hidden) showErrors(fields, { summary: true });
  }

  /** @param {string[]} fields */
  function orderedFields(fields) {
    return FIELD_ORDER.filter((name) => fields.includes(name));
  }

  return {
    /**
     * Validate the form. Returns the profile, or `null` after showing errors
     * and moving focus to the error summary.
     * @returns {Profile | null}
     */
    read() {
      const result = parseProfile(readRaw());
      if (result.ok) {
        showErrors([], { summary: true });
        return result.profile;
      }
      showErrors(orderedFields(result.errors.map((e) => e.field)), { summary: true });
      errorSummary.focus();
      errorSummary.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return null;
    },

    reset() {
      form.reset();
      showErrors([], { summary: true });
      updateIncomePreview();
      syncConditionalQuestions();
    },

    /** @param {Lang} nextLang */
    setLang(nextLang) {
      lang = nextLang;
      for (const [name, options] of Object.entries(CHOICE_GROUPS)) {
        form.querySelectorAll(`[data-choices="${name}"] [data-option]`).forEach((el) => {
          const option = /** @type {Record<string, Localized>} */ (options)[
            /** @type {HTMLElement} */ (el).dataset.option ?? ''
          ];
          el.textContent = option[lang];
        });
      }
      updateIncomePreview();
      if (invalidFields.size > 0) revalidate();
    },

    enable() {
      syncConditionalQuestions();
      const submit = /** @type {HTMLButtonElement} */ (form.querySelector('#submit-btn'));
      submit.disabled = false;
      submit.querySelector('span')?.setAttribute('data-i18n', 'submit');
    },
  };
}
