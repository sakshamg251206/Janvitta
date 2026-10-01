// @ts-check
/**
 * Interface strings in English and Hindi, plus helpers to apply them.
 * Scheme content lives in the catalog; this file only covers the UI chrome.
 */

/** @typedef {import('../core/profile.js').Lang} Lang */

export const STRINGS = {
  en: {
    page_title: 'LabhSetu — Find government schemes you qualify for',
    skip_link: 'Skip to main content',
    lang_label: 'Language',
    brand_tagline: 'Government scheme finder',

    intro_eyebrow: 'Free · No sign-up · Private',
    intro_title: 'Find the government schemes you qualify for',
    intro_body:
      'Answer a few simple questions. LabhSetu checks your answers against {count} central government schemes and shows what you can apply for, why you qualify, and which documents to bring.',
    step1_title: 'Answer a few questions',
    step1_body: 'About 2 minutes. No name, phone or Aadhaar needed.',
    step2_title: 'See your matches',
    step2_body: 'Each scheme explains why you qualify.',
    step3_title: 'Apply on the official site',
    step3_body: 'Every scheme links to its government portal.',

    form_title: 'Tell us about yourself',
    form_hint: 'All questions are required unless marked optional.',
    errors_title: 'Please fix the following:',

    section_you: 'About you',
    label_age: 'Your age',
    suffix_years: 'years',
    label_gender: 'Gender',

    section_work: 'Work & income',
    label_occupation: 'What do you mainly do?',
    label_income: 'Annual family income',
    hint_income: 'Total yearly income of everyone in your household, in rupees. Enter 0 if none.',
    income_preview: '{amount} per year',
    label_caste: 'Social category',
    hint_caste: 'Used only for schemes reserved for SC, ST or OBC.',

    section_home: 'Home & family',
    label_area: 'Where do you live?',
    label_flags: 'Select everything that applies to you',
    flag_hasBankAccount: 'I have a bank account',
    flag_hasBankAccount_desc: 'Any savings or Jan Dhan account in your name',
    flag_hasBplCard: 'My family has a BPL or NFSA ration card',
    flag_hasBplCard_desc: 'Antyodaya (AAY) or priority-household ration card',
    flag_ownsFarmland: 'I own agricultural land',
    flag_ownsFarmland_desc: 'Land recorded in your name or your family’s',
    flag_ownsPuccaHouse: 'My family owns a pucca house',
    flag_ownsPuccaHouse_desc: 'A permanent house of brick or concrete, anywhere in India',
    flag_hasDisability: 'I have a disability of 40% or more',
    flag_hasDisability_desc: 'As stated on a disability certificate or UDID card',
    flag_hasDaughterUnder10: 'I have a daughter under 10',
    flag_hasDaughterUnder10_desc: 'For savings schemes for girls',
    flag_isPregnant: 'I am currently pregnant',
    flag_isPregnant_desc: 'For maternity benefit schemes',

    submit: 'Show my schemes',
    submit_loading: 'Loading…',
    privacy_note: 'Your answers stay in this browser. Nothing is sent or saved.',

    err_age: 'Enter your age in years (0–120).',
    err_annualIncome: 'Enter your yearly family income in rupees, or 0.',
    err_gender: 'Choose your gender.',
    err_occupation: 'Choose what you mainly do.',
    err_caste: 'Choose your social category.',
    err_area: 'Choose where you live.',

    results_title: 'Your results',
    results_profile: '{age} years · {occupation} · {area}',
    edit_answers: 'Edit answers',
    start_over: 'Start over',
    stat_eligible: 'Schemes you qualify for',
    stat_cash: 'Direct cash in the first year',
    stat_insurance: 'Insurance cover',
    stat_loans: 'Loans available up to',
    stat_none: '—',
    tab_eligible: 'Eligible',
    tab_almost: 'Almost eligible',
    almost_intro: 'You are one step away from these schemes. Each one shows what is missing and how to get it.',

    why_qualify: 'Why you qualify',
    whats_missing: 'What’s missing',
    next_step: 'Next step',
    details_toggle: 'Documents & important notes',
    documents: 'Documents usually needed',
    note: 'Good to know',
    apply: 'Apply on official site',
    opens_new_tab: '(opens in a new tab)',

    empty_eligible_title: 'No exact matches yet',
    empty_eligible_body:
      'Check the “Almost eligible” tab, or review your answers — for example, having a bank account unlocks several schemes.',
    empty_almost_title: 'Nothing on the edge',
    empty_almost_body: 'There are no schemes where you are only one step away.',

    share_title: 'Know someone who could benefit?',
    share_body: 'Share LabhSetu with family and friends. Your answers are not included.',
    share_whatsapp: 'Share on WhatsApp',
    share_copy: 'Copy link',
    share_native: 'Share',
    share_message: 'Find government schemes you may be eligible for — free, in English and Hindi:',
    copied: 'Link copied',
    copy_failed: 'Could not copy. Please copy the address from your browser.',

    disclaimer:
      'Results are a guide, not a guarantee. Scheme rules are simplified and change over time — always confirm on the official portal before applying.',
    footer_independent:
      'LabhSetu is an independent open-source project and is not affiliated with the Government of India.',
    footer_catalog: 'Scheme catalog version {version}',
    footer_source: 'Source code',
    noscript: 'LabhSetu needs JavaScript to check your eligibility. Please enable it and reload the page.',
  },
  hi: {
    page_title: 'लाभसेतु — अपनी पात्र सरकारी योजनाएँ खोजें',
    skip_link: 'मुख्य सामग्री पर जाएँ',
    lang_label: 'भाषा',
    brand_tagline: 'सरकारी योजना खोजक',

    intro_eyebrow: 'मुफ़्त · बिना साइन-अप · निजी',
    intro_title: 'जानिए आप किन सरकारी योजनाओं के पात्र हैं',
    intro_body:
      'कुछ आसान सवालों के जवाब दें। लाभसेतु आपके जवाबों को {count} केंद्रीय सरकारी योजनाओं से मिलाकर बताता है कि आप किनके लिए आवेदन कर सकते हैं, क्यों पात्र हैं, और कौन-से दस्तावेज़ लगेंगे।',
    step1_title: 'कुछ सवालों के जवाब दें',
    step1_body: 'लगभग 2 मिनट। नाम, फ़ोन या आधार की ज़रूरत नहीं।',
    step2_title: 'अपनी योजनाएँ देखें',
    step2_body: 'हर योजना बताती है कि आप क्यों पात्र हैं।',
    step3_title: 'आधिकारिक साइट पर आवेदन करें',
    step3_body: 'हर योजना उसके सरकारी पोर्टल से जुड़ी है।',

    form_title: 'अपने बारे में बताएँ',
    form_hint: 'सभी सवाल ज़रूरी हैं, जब तक वैकल्पिक न लिखा हो।',
    errors_title: 'कृपया इन्हें ठीक करें:',

    section_you: 'आपके बारे में',
    label_age: 'आपकी आयु',
    suffix_years: 'वर्ष',
    label_gender: 'लिंग',

    section_work: 'काम और आय',
    label_occupation: 'आप मुख्य रूप से क्या करते हैं?',
    label_income: 'वार्षिक पारिवारिक आय',
    hint_income: 'आपके घर के सभी सदस्यों की कुल वार्षिक आय, रुपयों में। कोई आय न हो तो 0 लिखें।',
    income_preview: '{amount} प्रति वर्ष',
    label_caste: 'सामाजिक श्रेणी',
    hint_caste: 'केवल SC, ST या OBC के लिए आरक्षित योजनाओं हेतु उपयोग होता है।',

    section_home: 'घर और परिवार',
    label_area: 'आप कहाँ रहते हैं?',
    label_flags: 'जो भी आप पर लागू हो, सब चुनें',
    flag_hasBankAccount: 'मेरा बैंक खाता है',
    flag_hasBankAccount_desc: 'आपके नाम पर कोई भी बचत या जन धन खाता',
    flag_hasBplCard: 'मेरे परिवार के पास BPL या NFSA राशन कार्ड है',
    flag_hasBplCard_desc: 'अंत्योदय (AAY) या प्राथमिकता परिवार राशन कार्ड',
    flag_ownsFarmland: 'मेरे पास कृषि भूमि है',
    flag_ownsFarmland_desc: 'आपके या आपके परिवार के नाम दर्ज भूमि',
    flag_ownsPuccaHouse: 'मेरे परिवार के पास पक्का घर है',
    flag_ownsPuccaHouse_desc: 'भारत में कहीं भी ईंट या कंक्रीट का स्थायी घर',
    flag_hasDisability: 'मुझे 40% या अधिक दिव्यांगता है',
    flag_hasDisability_desc: 'दिव्यांगता प्रमाण पत्र या UDID कार्ड के अनुसार',
    flag_hasDaughterUnder10: 'मेरी 10 वर्ष से कम उम्र की बेटी है',
    flag_hasDaughterUnder10_desc: 'बेटियों की बचत योजनाओं के लिए',
    flag_isPregnant: 'मैं वर्तमान में गर्भवती हूँ',
    flag_isPregnant_desc: 'मातृत्व लाभ योजनाओं के लिए',

    submit: 'मेरी योजनाएँ दिखाएँ',
    submit_loading: 'लोड हो रहा है…',
    privacy_note: 'आपके जवाब इसी ब्राउज़र में रहते हैं। कुछ भी भेजा या सहेजा नहीं जाता।',

    err_age: 'अपनी आयु वर्षों में लिखें (0–120)।',
    err_annualIncome: 'अपनी वार्षिक पारिवारिक आय रुपयों में लिखें, या 0।',
    err_gender: 'अपना लिंग चुनें।',
    err_occupation: 'चुनें कि आप मुख्य रूप से क्या करते हैं।',
    err_caste: 'अपनी सामाजिक श्रेणी चुनें।',
    err_area: 'चुनें कि आप कहाँ रहते हैं।',

    results_title: 'आपके परिणाम',
    results_profile: '{age} वर्ष · {occupation} · {area}',
    edit_answers: 'जवाब बदलें',
    start_over: 'फिर से शुरू करें',
    stat_eligible: 'योजनाएँ जिनके आप पात्र हैं',
    stat_cash: 'पहले वर्ष में सीधा नकद',
    stat_insurance: 'बीमा कवर',
    stat_loans: 'उपलब्ध ऋण, अधिकतम',
    stat_none: '—',
    tab_eligible: 'पात्र',
    tab_almost: 'लगभग पात्र',
    almost_intro: 'इन योजनाओं से आप बस एक कदम दूर हैं। हर योजना बताती है कि क्या कमी है और उसे कैसे पूरा करें।',

    why_qualify: 'आप क्यों पात्र हैं',
    whats_missing: 'क्या कमी है',
    next_step: 'अगला कदम',
    details_toggle: 'दस्तावेज़ और ज़रूरी जानकारी',
    documents: 'आमतौर पर ज़रूरी दस्तावेज़',
    note: 'ध्यान दें',
    apply: 'आधिकारिक साइट पर आवेदन करें',
    opens_new_tab: '(नए टैब में खुलेगा)',

    empty_eligible_title: 'अभी कोई सटीक मिलान नहीं',
    empty_eligible_body:
      '“लगभग पात्र” टैब देखें, या अपने जवाब जाँचें — उदाहरण के लिए, बैंक खाता होने से कई योजनाएँ खुल जाती हैं।',
    empty_almost_title: 'कोई योजना एक कदम दूर नहीं',
    empty_almost_body: 'ऐसी कोई योजना नहीं है जिससे आप केवल एक कदम दूर हों।',

    share_title: 'किसी और को फ़ायदा हो सकता है?',
    share_body: 'लाभसेतु परिवार और दोस्तों के साथ साझा करें। आपके जवाब शामिल नहीं होते।',
    share_whatsapp: 'WhatsApp पर साझा करें',
    share_copy: 'लिंक कॉपी करें',
    share_native: 'साझा करें',
    share_message: 'जानिए आप किन सरकारी योजनाओं के पात्र हो सकते हैं — मुफ़्त, हिंदी और अंग्रेज़ी में:',
    copied: 'लिंक कॉपी हो गया',
    copy_failed: 'कॉपी नहीं हो सका। कृपया ब्राउज़र से पता कॉपी करें।',

    disclaimer:
      'परिणाम केवल मार्गदर्शन हैं, गारंटी नहीं। योजनाओं के नियम सरल किए गए हैं और समय के साथ बदलते हैं — आवेदन से पहले आधिकारिक पोर्टल पर अवश्य पुष्टि करें।',
    footer_independent: 'लाभसेतु एक स्वतंत्र ओपन-सोर्स परियोजना है और भारत सरकार से संबद्ध नहीं है।',
    footer_catalog: 'योजना सूची संस्करण {version}',
    footer_source: 'सोर्स कोड',
    noscript: 'पात्रता जाँचने के लिए लाभसेतु को JavaScript चाहिए। कृपया इसे चालू करके पेज दोबारा लोड करें।',
  },
};

/** @typedef {keyof typeof STRINGS.en} StringKey */

const STORAGE_KEY = 'labhsetu:lang';

/**
 * Look up a string and substitute `{placeholders}`.
 * @param {Lang} lang
 * @param {StringKey} key
 * @param {Record<string, string | number>} [params]
 */
export function t(lang, key, params = {}) {
  const template = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
}

/**
 * Saved choice first, then the browser's preference, then English.
 * @returns {Lang}
 */
export function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'hi') return saved;
  } catch {
    // Storage can be unavailable (private mode, blocked cookies); fall through.
  }
  return navigator.language?.toLowerCase().startsWith('hi') ? 'hi' : 'en';
}

/** @param {Lang} lang */
export function saveLang(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Non-essential preference; ignore storage failures.
  }
}

/**
 * Fill every `[data-i18n]` element's text, and `[data-i18n-attr="attr:key"]`
 * attributes, within `root`.
 *
 * @param {ParentNode} root
 * @param {Lang} lang
 * @param {Record<string, string | number>} [params]
 */
export function translateTree(root, lang, params = {}) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(lang, /** @type {StringKey} */ (el.getAttribute('data-i18n')), params);
  });
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    for (const pair of (el.getAttribute('data-i18n-attr') ?? '').split(',')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(lang, /** @type {StringKey} */ (key), params));
    }
  });
}
