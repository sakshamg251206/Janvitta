// @ts-check
/**
 * LabhSetu — application entry point.
 *
 * Matching runs entirely in the browser using the same engine and catalog as
 * the API, so answers never leave the device.
 */

import { matchSchemes } from './core/eligibility.js';
import { CATALOG_VERSION, SCHEMES } from './data/schemes.js';
import { createProfileForm } from './ui/form.js';
import { initialLang, saveLang, t, translateTree } from './ui/i18n.js';
import { createResultsView } from './ui/results.js';

/** @typedef {import('./core/profile.js').Lang} Lang */
/** @typedef {import('./core/profile.js').Profile} Profile */

const formEl = /** @type {HTMLFormElement} */ (document.getElementById('profile-form'));
const resultsEl = /** @type {HTMLElement} */ (document.getElementById('results'));
const form = createProfileForm(formEl);
const results = createResultsView(resultsEl);

/** @type {Lang} */
let lang = initialLang();
/** @type {Profile | null} */
let lastProfile = null;

// ── Language ──────────────────────────────────────────────────────

/** @param {Lang} next */
function setLang(next) {
  lang = next;
  document.documentElement.lang = lang;
  document.title = t(lang, 'page_title');
  translateTree(document, lang, { count: SCHEMES.length, version: CATALOG_VERSION });
  document.getElementById('catalog-version')?.replaceChildren(t(lang, 'footer_catalog', { version: CATALOG_VERSION }));
  document.querySelectorAll('.lang-switch__btn').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(/** @type {HTMLElement} */ (btn).dataset.lang === lang));
  });
  form.setLang(lang);
  if (lastProfile) results.render(lastProfile, matchSchemes(lastProfile, SCHEMES), lang);
  updateShareLinks();
}

document.querySelectorAll('.lang-switch__btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const next = /** @type {HTMLElement} */ (btn).dataset.lang === 'hi' ? 'hi' : 'en';
    if (next === lang) return;
    saveLang(next);
    setLang(next);
  });
});

// ── Views ─────────────────────────────────────────────────────────

/** @param {'form' | 'results'} view */
function showView(view) {
  document.querySelectorAll('[data-view]').forEach((el) => {
    /** @type {HTMLElement} */ (el).hidden = /** @type {HTMLElement} */ (el).dataset.view !== view;
  });
  window.scrollTo({ top: 0 });
}

formEl.addEventListener('submit', (event) => {
  event.preventDefault();
  const profile = form.read();
  if (!profile) return;

  lastProfile = profile;
  results.render(profile, matchSchemes(profile, SCHEMES), lang);
  results.showFirstTab();
  showView('results');
  document.getElementById('results-title')?.focus();
});

document.getElementById('edit-btn')?.addEventListener('click', () => {
  showView('form');
  formEl.querySelector('input')?.focus();
});

document.getElementById('reset-btn')?.addEventListener('click', () => {
  lastProfile = null;
  form.reset();
  showView('form');
  formEl.querySelector('input')?.focus();
});

// ── Sharing ───────────────────────────────────────────────────────

/** The public page address, without any query string or fragment. */
function pageUrl() {
  return `${location.origin}${location.pathname}`;
}

function updateShareLinks() {
  const whatsapp = /** @type {HTMLAnchorElement} */ (document.getElementById('share-whatsapp'));
  whatsapp.href = `https://wa.me/?text=${encodeURIComponent(`${t(lang, 'share_message')} ${pageUrl()}`)}`;
}

const nativeShare = /** @type {HTMLButtonElement} */ (document.getElementById('share-native'));
if (typeof navigator.share === 'function') {
  nativeShare.hidden = false;
  nativeShare.addEventListener('click', () => {
    navigator.share({ title: 'LabhSetu', text: t(lang, 'share_message'), url: pageUrl() }).catch(() => {
      // The user dismissed the share sheet; nothing to do.
    });
  });
}

document.getElementById('share-copy')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(pageUrl());
    showToast(t(lang, 'copied'));
  } catch {
    showToast(t(lang, 'copy_failed'));
  }
});

/** @type {number | undefined} */
let toastTimer;

/** @param {string} message */
function showToast(message) {
  const toast = /** @type {HTMLElement} */ (document.getElementById('toast'));
  toast.textContent = message;
  toast.classList.add('toast--visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('toast--visible'), 2500);
}

// ── Start ─────────────────────────────────────────────────────────

form.enable();
setLang(lang);
document.body.dataset.ready = 'true';
