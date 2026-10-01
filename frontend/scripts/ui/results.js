// @ts-check
/**
 * Results view: summary figures, Eligible / Almost-eligible tabs, and one
 * card per scheme. Everything is built with DOM APIs and `textContent`, so
 * catalog text can never be interpreted as HTML.
 */

import { describeRequirement } from '../core/eligibility.js';
import { formatCompactINR } from '../core/format.js';
import { AREAS, OCCUPATIONS } from '../core/profile.js';
import { BENEFIT_TYPES, CATEGORIES, DOCUMENTS } from '../data/schemes.js';
import { t, translateTree } from './i18n.js';

/** @typedef {import('../core/profile.js').Lang} Lang */
/** @typedef {import('../core/profile.js').Profile} Profile */
/** @typedef {import('../core/eligibility.js').MatchResult} MatchResult */
/** @typedef {import('../core/eligibility.js').MatchedScheme} MatchedScheme */
/** @typedef {import('./i18n.js').StringKey} StringKey */

/**
 * @param {HTMLElement} root  The #results section.
 */
export function createResultsView(root) {
  const template = /** @type {HTMLTemplateElement} */ (document.getElementById('scheme-card-template'));
  const tabs = /** @type {HTMLButtonElement[]} */ ([...root.querySelectorAll('[role="tab"]')]);

  initTabs();

  /**
   * @param {Profile} profile
   * @param {MatchResult} result
   * @param {Lang} lang
   */
  function render(profile, result, lang) {
    const { summary } = result;
    setText(
      '#results-profile',
      t(lang, 'results_profile', {
        age: profile.age,
        occupation: OCCUPATIONS[profile.occupation][lang],
        area: AREAS[profile.area][lang],
      }),
    );

    setText('#stat-eligible', String(summary.eligibleCount));
    setText('#stat-cash', money(summary.firstYearCash, lang));
    setText('#stat-insurance', money(summary.insuranceCover, lang));
    setText('#stat-loans', money(summary.maxLoan, lang));
    setText('#count-eligible', String(summary.eligibleCount));
    setText('#count-almost', String(summary.almostCount));

    renderList('#list-eligible', result.eligible, 'eligible', lang);
    renderList('#list-almost', result.almost, 'almost', lang);
  }

  /**
   * @param {string} selector
   * @param {MatchedScheme[]} items
   * @param {'eligible' | 'almost'} kind
   * @param {Lang} lang
   */
  function renderList(selector, items, kind, lang) {
    const list = /** @type {HTMLElement} */ (root.querySelector(selector));
    if (items.length === 0) {
      list.replaceChildren(emptyState(kind, lang));
      return;
    }
    list.replaceChildren(...items.map((item) => buildCard(item, kind, lang)));
  }

  /**
   * @param {MatchedScheme} item
   * @param {'eligible' | 'almost'} kind
   * @param {Lang} lang
   */
  function buildCard({ scheme, evaluation }, kind, lang) {
    const fragment = /** @type {DocumentFragment} */ (template.content.cloneNode(true));
    const card = /** @type {HTMLElement} */ (fragment.firstElementChild);
    card.classList.add(`scheme--${kind}`);
    card.dataset.schemeId = scheme.id;

    /** @param {string} name */
    const slot = (name) => /** @type {HTMLElement} */ (card.querySelector(`[data-slot="${name}"]`));

    const categoryLabel = CATEGORIES[scheme.category]?.[lang] ?? scheme.category;
    const typeLabel = BENEFIT_TYPES[scheme.benefit.type][lang];
    slot('category').textContent = categoryLabel;
    // Avoid "Insurance · Insurance" when the category already says it.
    if (typeLabel === categoryLabel) slot('type').remove();
    else slot('type').textContent = typeLabel;
    slot('name').textContent = scheme.name[lang];
    slot('ministry').textContent = scheme.ministry[lang];
    slot('benefit').textContent = scheme.benefit.label[lang];
    slot('summary').textContent = scheme.summary[lang];

    if (kind === 'eligible') {
      slot('missing').remove();
      slot('reasons').replaceChildren(...evaluation.met.map((req) => listItem(describeRequirement(req, lang))));
      if (evaluation.met.length === 0) slot('why').remove();
    } else {
      slot('why').remove();
      const step = evaluation.nextStep;
      slot('missing-text').textContent = step ? describeRequirement(step.requirement, lang) : '';
      slot('next-step').textContent = step ? step.hint[lang] : '';
    }

    slot('documents').replaceChildren(...scheme.documents.map((key) => listItem(DOCUMENTS[key]?.[lang] ?? key)));
    if (scheme.note) slot('note').textContent = scheme.note[lang];
    else slot('note-block').remove();

    const apply = /** @type {HTMLAnchorElement} */ (slot('apply'));
    apply.href = scheme.applyUrl;
    slot('domain').textContent = new URL(scheme.applyUrl).hostname.replace(/^www\./, '');

    translateTree(card, lang);
    return card;
  }

  /**
   * @param {'eligible' | 'almost'} kind
   * @param {Lang} lang
   */
  function emptyState(kind, lang) {
    const box = document.createElement('div');
    box.className = 'empty-state';
    const title = document.createElement('p');
    title.className = 'empty-state__title';
    title.textContent = t(lang, kind === 'eligible' ? 'empty_eligible_title' : 'empty_almost_title');
    const body = document.createElement('p');
    body.textContent = t(lang, kind === 'eligible' ? 'empty_eligible_body' : 'empty_almost_body');
    box.append(title, body);
    return box;
  }

  function initTabs() {
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(tab));
      tab.addEventListener('keydown', (event) => {
        const keys = { ArrowRight: 1, ArrowLeft: -1 };
        let next = null;
        if (event.key in keys) {
          next =
            tabs[(index + keys[/** @type {'ArrowRight' | 'ArrowLeft'} */ (event.key)] + tabs.length) % tabs.length];
        } else if (event.key === 'Home') {
          next = tabs[0];
        } else if (event.key === 'End') {
          next = tabs[tabs.length - 1];
        }
        if (next) {
          event.preventDefault();
          selectTab(next);
          next.focus();
        }
      });
    });
  }

  /** @param {HTMLButtonElement} selected */
  function selectTab(selected) {
    for (const tab of tabs) {
      const isSelected = tab === selected;
      tab.setAttribute('aria-selected', String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '');
      if (panel) panel.hidden = !isSelected;
    }
  }

  /**
   * @param {string} selector
   * @param {string} text
   */
  function setText(selector, text) {
    const el = root.querySelector(selector);
    if (el) el.textContent = text;
  }

  return {
    render,
    showFirstTab() {
      selectTab(tabs[0]);
    },
  };
}

/**
 * @param {number} amount
 * @param {Lang} lang
 */
function money(amount, lang) {
  return amount > 0 ? formatCompactINR(amount, lang) : t(lang, 'stat_none');
}

/** @param {string} text */
function listItem(text) {
  const li = document.createElement('li');
  li.textContent = text;
  return li;
}
