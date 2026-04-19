/* ============================================
   LabhSetu — Language System
   Supports: English (en) + Hindi (hi)
   ============================================ */

const TRANSLATIONS = {
  en: {
    badge_free: "✦ Free · No Login Required",
    hero_title: "Find Every Scheme\nYou Deserve",
    hero_subtitle: "Answer 8 questions. Discover benefits worth lakhs.",
    label_age: "Age",
    suffix_years: "yrs",
    label_gender: "Gender",
    gender_male: "Male",
    gender_female: "Female",
    gender_other: "Other",
    label_income: "Annual Family Income",
    label_occupation: "Occupation",
    occ_farmer: "🌾 Farmer",
    occ_student: "📚 Student",
    occ_business: "🏪 Business",
    occ_vendor: "🛒 Vendor",
    occ_craftsman: "🔨 Craftsman",
    occ_unemployed: "⏳ Unemployed",
    occ_other: "💼 Service/Other",
    label_caste: "Category",
    label_state: "State",
    label_bpl: "BPL Card",
    desc_bpl: "Below Poverty Line ration card",
    label_land: "Agriculture Land",
    desc_land: "Own any agricultural land",
    label_disabled: "Differently Abled",
    desc_disabled: "40% or more disability",
    label_bank: "Bank Account",
    desc_bank: "Active bank account in your name",
    btn_analyze: "Find My Schemes",
    privacy_note: "🔒 Your data never leaves your device",
    analyzing_title: "Analyzing 100+ Schemes",
    stat_eligible: "Eligible",
    stat_total: "Total Benefits",
    stat_almost: "Almost",
    share_text: "Share with family",
    tab_eligible: "Eligible",
    tab_almost: "Almost Eligible",
    disclaimer: "Eligibility is indicative. Verify at official government portals before applying.",
    btn_restart: "← Check Again",
    err_age: "Please enter a valid age",
    err_income: "Please enter your annual income",
    err_occupation: "Please select your occupation",
    err_caste: "Please select your category",
    step1: "Step 1 of 3: Your Profile",
    step2: "Step 2 of 3: Analyzing...",
    step3: "Step 3 of 3: Results",
    docs_needed: "Documents needed",
    apply_now: "Apply Now →",
    why_eligible: "✓ You qualify because:",
    missed_by: "⚠ Almost! You missed because:",
  },
  hi: {
    badge_free: "✦ मुफ्त · लॉगिन की जरूरत नहीं",
    hero_title: "अपनी हर योजना\nखोजें",
    hero_subtitle: "8 सवालों के जवाब दें। लाखों के लाभ जानें।",
    label_age: "आयु",
    suffix_years: "वर्ष",
    label_gender: "लिंग",
    gender_male: "पुरुष",
    gender_female: "महिला",
    gender_other: "अन्य",
    label_income: "वार्षिक पारिवारिक आय",
    label_occupation: "व्यवसाय",
    occ_farmer: "🌾 किसान",
    occ_student: "📚 छात्र",
    occ_business: "🏪 व्यापार",
    occ_vendor: "🛒 फेरीवाला",
    occ_craftsman: "🔨 कारीगर",
    occ_unemployed: "⏳ बेरोजगार",
    occ_other: "💼 सेवा/अन्य",
    label_caste: "श्रेणी",
    label_state: "राज्य",
    label_bpl: "BPL कार्ड",
    desc_bpl: "गरीबी रेखा से नीचे राशन कार्ड",
    label_land: "कृषि भूमि",
    desc_land: "कोई भी कृषि भूमि का स्वामित्व",
    label_disabled: "दिव्यांग",
    desc_disabled: "40% या अधिक विकलांगता",
    label_bank: "बैंक खाता",
    desc_bank: "आपके नाम पर सक्रिय बैंक खाता",
    btn_analyze: "योजनाएं खोजें",
    privacy_note: "🔒 आपका डेटा आपके डिवाइस से बाहर नहीं जाता",
    analyzing_title: "100+ योजनाओं की जांच हो रही है",
    stat_eligible: "योग्य",
    stat_total: "कुल लाभ",
    stat_almost: "लगभग",
    share_text: "परिवार के साथ शेयर करें",
    tab_eligible: "योग्य",
    tab_almost: "लगभग योग्य",
    disclaimer: "पात्रता सांकेतिक है। आवेदन से पहले सरकारी पोर्टल पर सत्यापित करें।",
    btn_restart: "← दोबारा जांचें",
    err_age: "कृपया सही आयु दर्ज करें",
    err_income: "कृपया वार्षिक आय दर्ज करें",
    err_occupation: "कृपया अपना व्यवसाय चुनें",
    err_caste: "कृपया अपनी श्रेणी चुनें",
    step1: "चरण 1/3: आपकी प्रोफ़ाइल",
    step2: "चरण 2/3: विश्लेषण...",
    step3: "चरण 3/3: परिणाम",
    docs_needed: "आवश्यक दस्तावेज़",
    apply_now: "अभी आवेदन करें →",
    why_eligible: "✓ आप योग्य हैं क्योंकि:",
    missed_by: "⚠ लगभग! आप चूक गए क्योंकि:",
  }
};

let currentLang = localStorage.getItem('labhsetu_lang') || 'en';

function t(key) {
  return TRANSLATIONS[currentLang][key] || TRANSLATIONS['en'][key] || key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = text;
    } else {
      // Preserve line breaks for hero title
      el.innerHTML = text.replace(/\n/g, '<br>');
    }
  });

  // Update chip text
  document.querySelectorAll('.chip[data-value]').forEach(chip => {
    const i18nKey = chip.getAttribute('data-i18n');
    if (i18nKey) chip.textContent = t(i18nKey);
  });

  document.documentElement.lang = currentLang;
  document.body.classList.toggle('lang-hi', currentLang === 'hi');
}

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'hi' : 'en';
  localStorage.setItem('labhsetu_lang', currentLang);
  applyTranslations();

  // Visual feedback on pill
  const pill = document.getElementById('lang-toggle');
  if (pill) {
    pill.style.transform = 'scale(0.92)';
    setTimeout(() => pill.style.transform = '', 150);
  }
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  const btn = document.getElementById('lang-toggle');
  if (btn) btn.addEventListener('click', toggleLanguage);
});