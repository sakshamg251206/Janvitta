// @ts-check
/**
 * Scheme catalog — the single source of truth for every scheme the app knows.
 *
 * Covers central (all-India) government schemes that an individual or
 * household applies for. Rules are simplified to the questions the app asks;
 * every scheme links to its official portal, which remains the authority.
 *
 * To add or update a scheme, see CONTRIBUTING.md. `npm test` validates the
 * catalog's structure (unique ids, known rule keys, https links, both
 * languages present).
 */

/** @typedef {import('../core/eligibility.js').Scheme} Scheme */
/** @typedef {import('../core/eligibility.js').BenefitType} BenefitType */
/** @typedef {import('../core/profile.js').Localized} Localized */

/** Bump when scheme content changes so API consumers can detect updates. */
export const CATALOG_VERSION = '2026.10';

/** @type {Record<string, Localized>} */
export const CATEGORIES = {
  agriculture: { en: 'Agriculture', hi: 'कृषि' },
  housing: { en: 'Housing', hi: 'आवास' },
  health: { en: 'Health', hi: 'स्वास्थ्य' },
  women_child: { en: 'Women & child', hi: 'महिला एवं बाल' },
  education: { en: 'Education', hi: 'शिक्षा' },
  insurance: { en: 'Insurance', hi: 'बीमा' },
  pension: { en: 'Pension', hi: 'पेंशन' },
  food: { en: 'Food & fuel', hi: 'खाद्य एवं ईंधन' },
  employment: { en: 'Jobs & skills', hi: 'रोज़गार एवं कौशल' },
  business: { en: 'Business & loans', hi: 'व्यापार एवं ऋण' },
  disability: { en: 'Disability', hi: 'दिव्यांगता' },
  banking: { en: 'Banking', hi: 'बैंकिंग' },
};

/** @type {Record<BenefitType, Localized>} */
export const BENEFIT_TYPES = {
  cash: { en: 'Cash', hi: 'नकद' },
  pension: { en: 'Pension', hi: 'पेंशन' },
  scholarship: { en: 'Scholarship', hi: 'छात्रवृत्ति' },
  housing: { en: 'Housing aid', hi: 'आवास सहायता' },
  insurance: { en: 'Insurance', hi: 'बीमा' },
  in_kind: { en: 'In kind', hi: 'वस्तु रूप में' },
  employment: { en: 'Employment', hi: 'रोज़गार' },
  loan: { en: 'Loan', hi: 'ऋण' },
  savings: { en: 'Savings', hi: 'बचत' },
  training: { en: 'Training', hi: 'प्रशिक्षण' },
  banking: { en: 'Banking', hi: 'बैंकिंग' },
  registration: { en: 'Registration', hi: 'पंजीकरण' },
};

/** @type {Record<string, Localized>} */
export const DOCUMENTS = {
  aadhaar: { en: 'Aadhaar card', hi: 'आधार कार्ड' },
  bank_passbook: { en: 'Bank passbook', hi: 'बैंक पासबुक' },
  land_records: { en: 'Land records', hi: 'भूमि रिकॉर्ड' },
  income_certificate: { en: 'Income certificate', hi: 'आय प्रमाण पत्र' },
  caste_certificate: { en: 'Caste certificate', hi: 'जाति प्रमाण पत्र' },
  ration_card: { en: 'Ration card', hi: 'राशन कार्ड' },
  disability_certificate: { en: 'Disability certificate (UDID)', hi: 'दिव्यांगता प्रमाण पत्र (UDID)' },
  age_proof: { en: 'Age proof', hi: 'आयु प्रमाण' },
  address_proof: { en: 'Address proof', hi: 'पते का प्रमाण' },
  photo: { en: 'Passport-size photo', hi: 'पासपोर्ट साइज़ फोटो' },
  mobile: { en: 'Mobile number linked to Aadhaar', hi: 'आधार से जुड़ा मोबाइल नंबर' },
  admission_proof: { en: 'Admission / fee receipt', hi: 'प्रवेश / शुल्क रसीद' },
  marksheet: { en: 'Previous marksheet', hi: 'पिछली अंकतालिका' },
  business_plan: { en: 'Business plan / project report', hi: 'व्यापार योजना / प्रोजेक्ट रिपोर्ट' },
  vending_certificate: { en: 'Vending certificate or ULB letter', hi: 'वेंडिंग प्रमाण पत्र या नगर निकाय पत्र' },
  mcp_card: { en: 'Mother & Child Protection (MCP) card', hi: 'मातृ एवं शिशु सुरक्षा (MCP) कार्ड' },
  birth_certificate: { en: "Daughter's birth certificate", hi: 'बेटी का जन्म प्रमाण पत्र' },
};

/** @type {readonly Scheme[]} */
export const SCHEMES = Object.freeze([
  // ── Agriculture ────────────────────────────────────────────────
  {
    id: 'pm-kisan',
    name: { en: 'PM Kisan Samman Nidhi', hi: 'पीएम किसान सम्मान निधि' },
    ministry: { en: 'Ministry of Agriculture & Farmers Welfare', hi: 'कृषि एवं किसान कल्याण मंत्रालय' },
    category: 'agriculture',
    summary: {
      en: 'Income support of ₹6,000 a year, paid directly into the bank account in three instalments of ₹2,000.',
      hi: '₹6,000 प्रति वर्ष की आय सहायता, ₹2,000 की तीन किस्तों में सीधे बैंक खाते में।',
    },
    benefit: { type: 'cash', amount: 6000, period: 'year', label: { en: '₹6,000 per year', hi: '₹6,000 प्रति वर्ष' } },
    criteria: { occupation: ['farmer'], flags: { ownsFarmland: true } },
    documents: ['aadhaar', 'land_records', 'bank_passbook'],
    note: {
      en: 'Not available to income-tax payers, government employees, institutional landholders or professionals such as doctors and lawyers.',
      hi: 'आयकरदाता, सरकारी कर्मचारी, संस्थागत भूमिधारक और डॉक्टर-वकील जैसे पेशेवर पात्र नहीं हैं।',
    },
    applyUrl: 'https://pmkisan.gov.in',
  },
  {
    id: 'kisan-credit-card',
    name: { en: 'Kisan Credit Card (KCC)', hi: 'किसान क्रेडिट कार्ड (KCC)' },
    ministry: { en: 'Ministry of Agriculture & Farmers Welfare', hi: 'कृषि एवं किसान कल्याण मंत्रालय' },
    category: 'agriculture',
    summary: {
      en: 'Short-term crop credit from banks. With interest subvention and prompt repayment, loans up to ₹3 lakh cost about 4% a year.',
      hi: 'बैंकों से अल्पकालिक फसल ऋण। ब्याज छूट और समय पर भुगतान पर ₹3 लाख तक का ऋण लगभग 4% वार्षिक ब्याज पर।',
    },
    benefit: { type: 'loan', amount: 300000, label: { en: 'Credit up to ₹3 lakh', hi: '₹3 लाख तक का ऋण' } },
    criteria: { minAge: 18, occupation: ['farmer'] },
    documents: ['aadhaar', 'land_records', 'photo'],
    note: {
      en: 'Tenant farmers, sharecroppers, fishers and animal-husbandry farmers can also apply through their bank.',
      hi: 'काश्तकार, बटाईदार, मछुआरे और पशुपालक किसान भी अपने बैंक से आवेदन कर सकते हैं।',
    },
    applyUrl: 'https://pmkisan.gov.in',
  },
  {
    id: 'pmfby',
    name: { en: 'Pradhan Mantri Fasal Bima Yojana', hi: 'प्रधानमंत्री फसल बीमा योजना' },
    ministry: { en: 'Ministry of Agriculture & Farmers Welfare', hi: 'कृषि एवं किसान कल्याण मंत्रालय' },
    category: 'agriculture',
    summary: {
      en: 'Crop insurance against natural calamities, pests and disease. Farmers pay 2% (kharif), 1.5% (rabi) or 5% (commercial crops) of the premium.',
      hi: 'प्राकृतिक आपदा, कीट और रोग से फसल बीमा। किसान केवल 2% (खरीफ), 1.5% (रबी) या 5% (वाणिज्यिक फसल) प्रीमियम देते हैं।',
    },
    benefit: { type: 'insurance', label: { en: 'Crop insurance', hi: 'फसल बीमा' } },
    criteria: { occupation: ['farmer'] },
    documents: ['aadhaar', 'land_records', 'bank_passbook'],
    note: {
      en: 'Sum insured depends on the crop and district. Tenant farmers and sharecroppers are covered too.',
      hi: 'बीमा राशि फसल और ज़िले पर निर्भर करती है। काश्तकार और बटाईदार भी शामिल हैं।',
    },
    applyUrl: 'https://pmfby.gov.in',
  },

  // ── Housing ────────────────────────────────────────────────────
  {
    id: 'pmay-urban',
    name: { en: 'PM Awas Yojana – Urban 2.0', hi: 'प्रधानमंत्री आवास योजना – शहरी 2.0' },
    ministry: { en: 'Ministry of Housing & Urban Affairs', hi: 'आवास एवं शहरी कार्य मंत्रालय' },
    category: 'housing',
    summary: {
      en: 'Help to build, buy or rent an affordable home in a town or city, including central assistance of up to ₹2.5 lakh per house.',
      hi: 'शहर या कस्बे में किफ़ायती घर बनाने, खरीदने या किराये पर लेने में मदद, प्रति घर ₹2.5 लाख तक की केंद्रीय सहायता सहित।',
    },
    benefit: { type: 'housing', amount: 250000, period: 'once', label: { en: 'Up to ₹2.5 lakh', hi: '₹2.5 लाख तक' } },
    criteria: { area: 'urban', maxIncome: 900000, flags: { ownsPuccaHouse: false } },
    documents: ['aadhaar', 'income_certificate', 'bank_passbook', 'address_proof'],
    note: {
      en: 'For EWS, LIG and MIG families (income up to ₹9 lakh) with no pucca house anywhere in India.',
      hi: 'EWS, LIG और MIG परिवारों (₹9 लाख तक आय) के लिए, जिनके पास भारत में कहीं पक्का घर नहीं है।',
    },
    applyUrl: 'https://pmay-urban.gov.in',
  },
  {
    id: 'pmay-gramin',
    name: { en: 'PM Awas Yojana – Gramin', hi: 'प्रधानमंत्री आवास योजना – ग्रामीण' },
    ministry: { en: 'Ministry of Rural Development', hi: 'ग्रामीण विकास मंत्रालय' },
    category: 'housing',
    summary: {
      en: 'Grant to build a pucca house for rural families who are homeless or living in a kutcha house.',
      hi: 'बेघर या कच्चे घर में रहने वाले ग्रामीण परिवारों को पक्का घर बनाने के लिए अनुदान।',
    },
    benefit: {
      type: 'housing',
      amount: 120000,
      period: 'once',
      label: { en: '₹1.2 lakh (₹1.3 lakh in hilly states)', hi: '₹1.2 लाख (पहाड़ी राज्यों में ₹1.3 लाख)' },
    },
    criteria: { area: 'rural', flags: { ownsPuccaHouse: false } },
    documents: ['aadhaar', 'bank_passbook', 'mobile'],
    note: {
      en: 'Beneficiaries are selected through the Awaas+ household survey and approved by the Gram Sabha.',
      hi: 'लाभार्थियों का चयन आवास+ सर्वेक्षण से होता है और ग्राम सभा द्वारा अनुमोदन किया जाता है।',
    },
    applyUrl: 'https://pmayg.nic.in',
  },

  // ── Health ─────────────────────────────────────────────────────
  {
    id: 'ayushman-bharat',
    name: { en: 'Ayushman Bharat PM-JAY', hi: 'आयुष्मान भारत पीएम-जय' },
    ministry: { en: 'Ministry of Health & Family Welfare', hi: 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय' },
    category: 'health',
    summary: {
      en: 'Free hospital treatment up to ₹5 lakh per family per year at empanelled public and private hospitals.',
      hi: 'सूचीबद्ध सरकारी और निजी अस्पतालों में प्रति परिवार प्रति वर्ष ₹5 लाख तक का मुफ़्त इलाज।',
    },
    benefit: {
      type: 'insurance',
      amount: 500000,
      period: 'year',
      label: { en: '₹5 lakh health cover / year', hi: '₹5 लाख स्वास्थ्य कवर / वर्ष' },
    },
    criteria: { anyOf: [{ flags: { hasBplCard: true } }, { minAge: 70 }] },
    documents: ['aadhaar', 'ration_card', 'mobile'],
    note: {
      en: 'Families are covered based on SECC deprivation data; every citizen aged 70+ is covered regardless of income. Check your name at beneficiary.nha.gov.in.',
      hi: 'परिवार SECC आँकड़ों के आधार पर शामिल हैं; 70+ आयु के सभी नागरिक आय की परवाह किए बिना शामिल हैं। beneficiary.nha.gov.in पर अपना नाम देखें।',
    },
    applyUrl: 'https://beneficiary.nha.gov.in',
  },

  // ── Women & child ──────────────────────────────────────────────
  {
    id: 'pmmvy',
    name: { en: 'PM Matru Vandana Yojana', hi: 'प्रधानमंत्री मातृ वंदना योजना' },
    ministry: { en: 'Ministry of Women & Child Development', hi: 'महिला एवं बाल विकास मंत्रालय' },
    category: 'women_child',
    summary: {
      en: 'Maternity benefit of ₹5,000 for the first child, and ₹6,000 for a second child if it is a girl, paid to the mother’s bank account.',
      hi: 'पहले बच्चे के लिए ₹5,000 और दूसरी संतान बेटी होने पर ₹6,000 का मातृत्व लाभ, माँ के बैंक खाते में।',
    },
    benefit: { type: 'cash', amount: 5000, period: 'once', label: { en: '₹5,000 – ₹6,000', hi: '₹5,000 – ₹6,000' } },
    criteria: {
      gender: ['female'],
      minAge: 19,
      flags: { isPregnant: true },
      anyOf: [
        { maxIncome: 800000 },
        { caste: ['sc', 'st'] },
        { flags: { hasBplCard: true } },
        { flags: { hasDisability: true } },
      ],
    },
    documents: ['aadhaar', 'mcp_card', 'bank_passbook'],
    note: {
      en: 'Not for women in regular government employment. Register at your Anganwadi centre or health facility.',
      hi: 'नियमित सरकारी नौकरी वाली महिलाओं के लिए नहीं। अपने आंगनवाड़ी केंद्र या स्वास्थ्य केंद्र पर पंजीकरण करें।',
    },
    applyUrl: 'https://pmmvy.wcd.gov.in',
  },
  {
    id: 'janani-suraksha',
    name: { en: 'Janani Suraksha Yojana', hi: 'जननी सुरक्षा योजना' },
    ministry: { en: 'Ministry of Health & Family Welfare', hi: 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय' },
    category: 'women_child',
    summary: {
      en: 'Cash assistance for delivering in a government or accredited hospital, to encourage safe institutional births.',
      hi: 'सरकारी या मान्यता प्राप्त अस्पताल में प्रसव कराने पर नकद सहायता, ताकि सुरक्षित संस्थागत प्रसव हो।',
    },
    benefit: { type: 'cash', label: { en: '₹600 – ₹1,400 on delivery', hi: 'प्रसव पर ₹600 – ₹1,400' } },
    criteria: {
      gender: ['female'],
      flags: { isPregnant: true },
      anyOf: [{ flags: { hasBplCard: true } }, { caste: ['sc', 'st'] }],
    },
    documents: ['aadhaar', 'mcp_card', 'bank_passbook'],
    note: {
      en: 'The amount depends on your state and whether you live in a rural or urban area. Ask your ASHA worker.',
      hi: 'राशि आपके राज्य और ग्रामीण/शहरी क्षेत्र पर निर्भर करती है। अपनी आशा कार्यकर्ता से पूछें।',
    },
    applyUrl: 'https://nhm.gov.in',
  },
  {
    id: 'sukanya-samriddhi',
    name: { en: 'Sukanya Samriddhi Yojana', hi: 'सुकन्या समृद्धि योजना' },
    ministry: { en: 'Ministry of Finance', hi: 'वित्त मंत्रालय' },
    category: 'women_child',
    summary: {
      en: 'High-interest, tax-free savings account for a daughter’s education and marriage. Deposit from ₹250 a year.',
      hi: 'बेटी की शिक्षा और विवाह के लिए ऊँचे ब्याज वाला कर-मुक्त बचत खाता। ₹250 प्रति वर्ष से जमा शुरू।',
    },
    benefit: { type: 'savings', label: { en: 'Tax-free savings', hi: 'कर-मुक्त बचत' } },
    criteria: { flags: { hasDaughterUnder10: true } },
    documents: ['birth_certificate', 'aadhaar', 'address_proof'],
    note: {
      en: 'Open at any post office or authorised bank. Up to two daughters per family.',
      hi: 'किसी भी डाकघर या अधिकृत बैंक में खोलें। प्रति परिवार अधिकतम दो बेटियाँ।',
    },
    applyUrl: 'https://www.nsiindia.gov.in',
  },

  // ── Education ──────────────────────────────────────────────────
  {
    id: 'post-matric-scholarship',
    name: {
      en: 'Post-Matric Scholarships for SC, ST & OBC Students',
      hi: 'SC, ST और OBC छात्रों के लिए पोस्ट-मैट्रिक छात्रवृत्ति',
    },
    ministry: {
      en: 'Ministries of Social Justice and Tribal Affairs',
      hi: 'सामाजिक न्याय एवं जनजातीय कार्य मंत्रालय',
    },
    category: 'education',
    summary: {
      en: 'Covers tuition fees and a monthly maintenance allowance for studies after Class 10, up to PhD.',
      hi: 'कक्षा 10 के बाद पीएचडी तक की पढ़ाई के लिए शिक्षण शुल्क और मासिक भत्ता।',
    },
    benefit: { type: 'scholarship', label: { en: 'Fees + monthly allowance', hi: 'शुल्क + मासिक भत्ता' } },
    criteria: { occupation: ['student'], caste: ['sc', 'st', 'obc'], maxIncome: 250000 },
    documents: ['aadhaar', 'caste_certificate', 'income_certificate', 'marksheet', 'admission_proof'],
    note: {
      en: 'Apply on the National Scholarship Portal or your state scholarship portal before the yearly deadline.',
      hi: 'वार्षिक अंतिम तिथि से पहले राष्ट्रीय छात्रवृत्ति पोर्टल या अपने राज्य पोर्टल पर आवेदन करें।',
    },
    applyUrl: 'https://scholarships.gov.in',
  },
  {
    id: 'pm-vidyalaxmi',
    name: { en: 'PM Vidyalaxmi Education Loan', hi: 'पीएम विद्यालक्ष्मी शिक्षा ऋण' },
    ministry: { en: 'Ministry of Education', hi: 'शिक्षा मंत्रालय' },
    category: 'education',
    summary: {
      en: 'Collateral-free, guarantor-free education loans for students admitted to quality higher-education institutions.',
      hi: 'गुणवत्तापूर्ण उच्च शिक्षा संस्थानों में प्रवेश पाने वाले छात्रों के लिए बिना गारंटी, बिना जमानत शिक्षा ऋण।',
    },
    benefit: {
      type: 'loan',
      amount: 750000,
      label: { en: 'Up to ₹7.5 lakh, no collateral', hi: '₹7.5 लाख तक, बिना गारंटी' },
    },
    criteria: { occupation: ['student'] },
    documents: ['aadhaar', 'admission_proof', 'marksheet', 'income_certificate'],
    note: {
      en: 'Families earning up to ₹8 lakh a year also get a 3% interest subsidy on loans up to ₹10 lakh.',
      hi: '₹8 लाख तक वार्षिक आय वाले परिवारों को ₹10 लाख तक के ऋण पर 3% ब्याज छूट भी मिलती है।',
    },
    applyUrl: 'https://pmvidyalaxmi.co.in',
  },

  // ── Insurance ──────────────────────────────────────────────────
  {
    id: 'pmjjby',
    name: { en: 'PM Jeevan Jyoti Bima Yojana', hi: 'प्रधानमंत्री जीवन ज्योति बीमा योजना' },
    ministry: { en: 'Ministry of Finance', hi: 'वित्त मंत्रालय' },
    category: 'insurance',
    summary: {
      en: 'Life cover of ₹2 lakh for death due to any cause, for a premium of ₹436 a year auto-debited from your bank account.',
      hi: 'किसी भी कारण से मृत्यु पर ₹2 लाख का जीवन बीमा, ₹436 वार्षिक प्रीमियम बैंक खाते से स्वतः कटता है।',
    },
    benefit: { type: 'insurance', amount: 200000, label: { en: '₹2 lakh life cover', hi: '₹2 लाख जीवन बीमा' } },
    criteria: { minAge: 18, maxAge: 50, flags: { hasBankAccount: true } },
    documents: ['aadhaar', 'bank_passbook'],
    applyUrl: 'https://www.jansuraksha.gov.in',
  },
  {
    id: 'pmsby',
    name: { en: 'PM Suraksha Bima Yojana', hi: 'प्रधानमंत्री सुरक्षा बीमा योजना' },
    ministry: { en: 'Ministry of Finance', hi: 'वित्त मंत्रालय' },
    category: 'insurance',
    summary: {
      en: 'Accident cover of ₹2 lakh for death or full disability (₹1 lakh for partial disability) for ₹20 a year.',
      hi: 'दुर्घटना में मृत्यु या पूर्ण विकलांगता पर ₹2 लाख (आंशिक पर ₹1 लाख) का बीमा, केवल ₹20 प्रति वर्ष में।',
    },
    benefit: { type: 'insurance', amount: 200000, label: { en: '₹2 lakh accident cover', hi: '₹2 लाख दुर्घटना बीमा' } },
    criteria: { minAge: 18, maxAge: 70, flags: { hasBankAccount: true } },
    documents: ['aadhaar', 'bank_passbook'],
    applyUrl: 'https://www.jansuraksha.gov.in',
  },

  // ── Pension ────────────────────────────────────────────────────
  {
    id: 'atal-pension',
    name: { en: 'Atal Pension Yojana', hi: 'अटल पेंशन योजना' },
    ministry: { en: 'Ministry of Finance', hi: 'वित्त मंत्रालय' },
    category: 'pension',
    summary: {
      en: 'Save a small amount every month and receive a guaranteed pension of ₹1,000 to ₹5,000 a month from age 60.',
      hi: 'हर महीने थोड़ी बचत करें और 60 वर्ष की आयु से ₹1,000 से ₹5,000 मासिक गारंटीड पेंशन पाएँ।',
    },
    benefit: { type: 'savings', label: { en: '₹1,000 – ₹5,000 / month at 60', hi: '60 पर ₹1,000 – ₹5,000 / माह' } },
    criteria: { minAge: 18, maxAge: 40, flags: { hasBankAccount: true } },
    documents: ['aadhaar', 'bank_passbook', 'mobile'],
    note: {
      en: 'Income-tax payers cannot join. The monthly contribution depends on your age and chosen pension.',
      hi: 'आयकरदाता शामिल नहीं हो सकते। मासिक योगदान आपकी आयु और चुनी गई पेंशन पर निर्भर करता है।',
    },
    applyUrl: 'https://www.npscra.nsdl.co.in',
  },
  {
    id: 'old-age-pension',
    name: { en: 'Indira Gandhi National Old Age Pension', hi: 'इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन' },
    ministry: { en: 'Ministry of Rural Development', hi: 'ग्रामीण विकास मंत्रालय' },
    category: 'pension',
    summary: {
      en: 'Monthly pension for elderly people from BPL households. Most states add their own top-up to the central amount.',
      hi: 'BPL परिवारों के बुज़ुर्गों के लिए मासिक पेंशन। अधिकांश राज्य केंद्रीय राशि में अपनी राशि जोड़ते हैं।',
    },
    benefit: {
      type: 'pension',
      amount: 200,
      period: 'month',
      label: { en: '₹200 – ₹500 / month + state share', hi: '₹200 – ₹500 / माह + राज्य अंश' },
    },
    criteria: { minAge: 60, flags: { hasBplCard: true } },
    documents: ['aadhaar', 'age_proof', 'ration_card', 'bank_passbook'],
    note: {
      en: 'Central share is ₹200 a month from 60 to 79 and ₹500 from 80. Apply through your gram panchayat or municipal office.',
      hi: 'केंद्रीय अंश 60–79 वर्ष पर ₹200 और 80 वर्ष से ₹500 प्रति माह है। ग्राम पंचायत या नगर कार्यालय में आवेदन करें।',
    },
    applyUrl: 'https://nsap.nic.in',
  },

  // ── Food & fuel ────────────────────────────────────────────────
  {
    id: 'pmgkay',
    name: { en: 'PM Garib Kalyan Anna Yojana', hi: 'प्रधानमंत्री गरीब कल्याण अन्न योजना' },
    ministry: {
      en: 'Ministry of Consumer Affairs, Food & Public Distribution',
      hi: 'उपभोक्ता मामले, खाद्य एवं सार्वजनिक वितरण मंत्रालय',
    },
    category: 'food',
    summary: {
      en: 'Free food grain every month through ration shops: 5 kg per person, or 35 kg per family for Antyodaya cards.',
      hi: 'राशन दुकानों से हर महीने मुफ़्त अनाज: प्रति व्यक्ति 5 किलो, या अंत्योदय कार्ड पर प्रति परिवार 35 किलो।',
    },
    benefit: {
      type: 'in_kind',
      label: { en: '5 kg free grain / person / month', hi: '5 किलो मुफ़्त अनाज / व्यक्ति / माह' },
    },
    criteria: { flags: { hasBplCard: true } },
    documents: ['ration_card', 'aadhaar'],
    applyUrl: 'https://nfsa.gov.in',
  },
  {
    id: 'ujjwala',
    name: { en: 'PM Ujjwala Yojana', hi: 'प्रधानमंत्री उज्ज्वला योजना' },
    ministry: { en: 'Ministry of Petroleum & Natural Gas', hi: 'पेट्रोलियम एवं प्राकृतिक गैस मंत्रालय' },
    category: 'food',
    summary: {
      en: 'Free LPG connection with a first refill and stove for women from poor households.',
      hi: 'गरीब परिवारों की महिलाओं को पहली रिफिल और चूल्हे के साथ मुफ़्त LPG कनेक्शन।',
    },
    benefit: { type: 'in_kind', label: { en: 'Free LPG connection', hi: 'मुफ़्त LPG कनेक्शन' } },
    criteria: { gender: ['female'], minAge: 18, flags: { hasBplCard: true } },
    documents: ['aadhaar', 'ration_card', 'bank_passbook'],
    note: {
      en: 'Only if no one in the household already has an LPG connection.',
      hi: 'केवल तभी जब परिवार में किसी के पास पहले से LPG कनेक्शन न हो।',
    },
    applyUrl: 'https://www.pmuy.gov.in',
  },

  // ── Jobs & skills ──────────────────────────────────────────────
  {
    id: 'mgnrega',
    name: { en: 'MGNREGA (Rural Job Guarantee)', hi: 'मनरेगा (ग्रामीण रोज़गार गारंटी)' },
    ministry: { en: 'Ministry of Rural Development', hi: 'ग्रामीण विकास मंत्रालय' },
    category: 'employment',
    summary: {
      en: 'Guaranteed paid work of up to 100 days a year for every rural household, at the state’s notified daily wage.',
      hi: 'हर ग्रामीण परिवार को राज्य की अधिसूचित मज़दूरी पर साल में 100 दिन तक का गारंटीड काम।',
    },
    benefit: { type: 'employment', label: { en: 'Up to 100 days of paid work', hi: '100 दिन तक का सवेतन काम' } },
    criteria: { area: 'rural', minAge: 18 },
    documents: ['aadhaar', 'photo', 'bank_passbook'],
    note: {
      en: 'Apply for a job card at your gram panchayat. Work must be provided within 15 days of asking.',
      hi: 'ग्राम पंचायत में जॉब कार्ड के लिए आवेदन करें। माँगने के 15 दिन के भीतर काम देना अनिवार्य है।',
    },
    applyUrl: 'https://nrega.nic.in',
  },
  {
    id: 'pmkvy',
    name: { en: 'PM Kaushal Vikas Yojana', hi: 'प्रधानमंत्री कौशल विकास योजना' },
    ministry: { en: 'Ministry of Skill Development & Entrepreneurship', hi: 'कौशल विकास एवं उद्यमिता मंत्रालय' },
    category: 'employment',
    summary: {
      en: 'Free, industry-recognised skill training and certification, with help finding a job afterwards.',
      hi: 'मुफ़्त, उद्योग-मान्य कौशल प्रशिक्षण और प्रमाणपत्र, साथ में नौकरी खोजने में मदद।',
    },
    benefit: { type: 'training', label: { en: 'Free training + certificate', hi: 'मुफ़्त प्रशिक्षण + प्रमाणपत्र' } },
    criteria: { minAge: 15, maxAge: 45, occupation: ['unemployed', 'student', 'wage_worker', 'other'] },
    documents: ['aadhaar', 'bank_passbook', 'photo'],
    applyUrl: 'https://www.skillindiadigital.gov.in',
  },
  {
    id: 'e-shram',
    name: { en: 'e-Shram Card', hi: 'ई-श्रम कार्ड' },
    ministry: { en: 'Ministry of Labour & Employment', hi: 'श्रम एवं रोज़गार मंत्रालय' },
    category: 'employment',
    summary: {
      en: 'Free registration for unorganised workers. You get a Universal Account Number that links you to social-security schemes.',
      hi: 'असंगठित श्रमिकों के लिए मुफ़्त पंजीकरण। आपको एक यूनिवर्सल अकाउंट नंबर मिलता है जो सामाजिक सुरक्षा योजनाओं से जोड़ता है।',
    },
    benefit: { type: 'registration', label: { en: 'Free worker ID (UAN)', hi: 'मुफ़्त श्रमिक पहचान (UAN)' } },
    criteria: {
      minAge: 16,
      maxAge: 59,
      occupation: ['farmer', 'wage_worker', 'street_vendor', 'artisan', 'other'],
    },
    documents: ['aadhaar', 'mobile', 'bank_passbook'],
    note: {
      en: 'Not for EPFO/ESIC members or income-tax payers. Register online or at a Common Service Centre.',
      hi: 'EPFO/ESIC सदस्य या आयकरदाता पात्र नहीं। ऑनलाइन या कॉमन सर्विस सेंटर पर पंजीकरण करें।',
    },
    applyUrl: 'https://eshram.gov.in',
  },

  // ── Business & loans ───────────────────────────────────────────
  {
    id: 'mudra',
    name: { en: 'PM Mudra Yojana', hi: 'प्रधानमंत्री मुद्रा योजना' },
    ministry: { en: 'Ministry of Finance', hi: 'वित्त मंत्रालय' },
    category: 'business',
    summary: {
      en: 'Collateral-free business loans in four tiers — Shishu (up to ₹50,000), Kishore (up to ₹5 lakh), Tarun (up to ₹10 lakh) and Tarun Plus (up to ₹20 lakh).',
      hi: 'चार श्रेणियों में बिना गारंटी व्यापार ऋण — शिशु (₹50,000 तक), किशोर (₹5 लाख तक), तरुण (₹10 लाख तक) और तरुण प्लस (₹20 लाख तक)।',
    },
    benefit: {
      type: 'loan',
      amount: 2000000,
      label: { en: 'Up to ₹20 lakh, no collateral', hi: '₹20 लाख तक, बिना गारंटी' },
    },
    criteria: { minAge: 18, occupation: ['business', 'street_vendor', 'artisan'] },
    documents: ['aadhaar', 'address_proof', 'business_plan', 'bank_passbook'],
    note: {
      en: 'For non-farm income-generating activities. Tarun Plus is for borrowers who have repaid a Tarun loan.',
      hi: 'गैर-कृषि आय वाली गतिविधियों के लिए। तरुण प्लस उन्हीं के लिए है जिन्होंने तरुण ऋण चुका दिया है।',
    },
    applyUrl: 'https://www.mudra.org.in',
  },
  {
    id: 'pm-svanidhi',
    name: { en: 'PM SVANidhi', hi: 'पीएम स्वनिधि' },
    ministry: { en: 'Ministry of Housing & Urban Affairs', hi: 'आवास एवं शहरी कार्य मंत्रालय' },
    category: 'business',
    summary: {
      en: 'Collateral-free working-capital loans for street vendors, given in three rising tranches, with cashback on digital payments.',
      hi: 'रेहड़ी-पटरी विक्रेताओं के लिए तीन बढ़ती किस्तों में बिना गारंटी कार्यशील पूंजी ऋण, डिजिटल भुगतान पर कैशबैक के साथ।',
    },
    benefit: { type: 'loan', amount: 50000, label: { en: 'Up to ₹50,000 in tranches', hi: 'किस्तों में ₹50,000 तक' } },
    criteria: { occupation: ['street_vendor'], area: 'urban' },
    documents: ['aadhaar', 'vending_certificate', 'bank_passbook'],
    note: {
      en: 'Repaying on time unlocks the next, larger loan and a 7% interest subsidy.',
      hi: 'समय पर भुगतान से अगला बड़ा ऋण और 7% ब्याज सब्सिडी मिलती है।',
    },
    applyUrl: 'https://pmsvanidhi.mohua.gov.in',
  },
  {
    id: 'stand-up-india',
    name: { en: 'Stand-Up India', hi: 'स्टैंड-अप इंडिया' },
    ministry: { en: 'Ministry of Finance', hi: 'वित्त मंत्रालय' },
    category: 'business',
    summary: {
      en: 'Bank loans from ₹10 lakh to ₹1 crore for SC, ST and women entrepreneurs starting a new enterprise.',
      hi: 'नया उद्यम शुरू करने वाले SC, ST और महिला उद्यमियों के लिए ₹10 लाख से ₹1 करोड़ तक का बैंक ऋण।',
    },
    benefit: { type: 'loan', amount: 10000000, label: { en: '₹10 lakh – ₹1 crore', hi: '₹10 लाख – ₹1 करोड़' } },
    criteria: {
      minAge: 18,
      occupation: ['business'],
      anyOf: [{ caste: ['sc', 'st'] }, { gender: ['female'] }],
    },
    documents: ['aadhaar', 'caste_certificate', 'business_plan', 'address_proof'],
    note: {
      en: 'Only for greenfield (first-time) enterprises in manufacturing, services, trading or agri-allied activities.',
      hi: 'केवल विनिर्माण, सेवा, व्यापार या कृषि-संबद्ध क्षेत्र के नए (पहली बार) उद्यमों के लिए।',
    },
    applyUrl: 'https://www.standupmitra.in',
  },
  {
    id: 'pm-vishwakarma',
    name: { en: 'PM Vishwakarma', hi: 'पीएम विश्वकर्मा' },
    ministry: { en: 'Ministry of Micro, Small & Medium Enterprises', hi: 'सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय' },
    category: 'business',
    summary: {
      en: 'For traditional artisans in 18 trades: skill training with a stipend, a ₹15,000 toolkit incentive and loans up to ₹3 lakh at 5% interest.',
      hi: '18 पारंपरिक व्यवसायों के कारीगरों के लिए: वज़ीफ़े के साथ प्रशिक्षण, ₹15,000 टूलकिट प्रोत्साहन और 5% ब्याज पर ₹3 लाख तक ऋण।',
    },
    benefit: {
      type: 'loan',
      amount: 300000,
      label: { en: 'Up to ₹3 lakh at 5% + toolkit', hi: '5% पर ₹3 लाख तक + टूलकिट' },
    },
    criteria: { minAge: 18, occupation: ['artisan'] },
    documents: ['aadhaar', 'mobile', 'bank_passbook', 'ration_card'],
    note: {
      en: 'One member per family; government employees and their families are not eligible. Register at a Common Service Centre.',
      hi: 'प्रति परिवार एक सदस्य; सरकारी कर्मचारी और उनके परिवार पात्र नहीं। कॉमन सर्विस सेंटर पर पंजीकरण करें।',
    },
    applyUrl: 'https://pmvishwakarma.gov.in',
  },

  // ── Disability ─────────────────────────────────────────────────
  {
    id: 'disability-pension',
    name: { en: 'Indira Gandhi National Disability Pension', hi: 'इंदिरा गांधी राष्ट्रीय दिव्यांग पेंशन' },
    ministry: { en: 'Ministry of Rural Development', hi: 'ग्रामीण विकास मंत्रालय' },
    category: 'disability',
    summary: {
      en: 'Monthly pension for persons with severe disability from BPL households, with state top-ups in most states.',
      hi: 'BPL परिवारों के गंभीर दिव्यांग व्यक्तियों के लिए मासिक पेंशन, अधिकांश राज्यों में राज्य अंश सहित।',
    },
    benefit: {
      type: 'pension',
      amount: 300,
      period: 'month',
      label: { en: '₹300 / month + state share', hi: '₹300 / माह + राज्य अंश' },
    },
    criteria: { minAge: 18, maxAge: 79, flags: { hasDisability: true, hasBplCard: true } },
    documents: ['aadhaar', 'disability_certificate', 'ration_card', 'bank_passbook'],
    note: {
      en: 'Requires 80% or more disability. Apply through your gram panchayat or municipal office.',
      hi: '80% या अधिक दिव्यांगता आवश्यक। ग्राम पंचायत या नगर कार्यालय में आवेदन करें।',
    },
    applyUrl: 'https://nsap.nic.in',
  },
  {
    id: 'nhfdc-loans',
    name: { en: 'NHFDC Loans for Persons with Disabilities', hi: 'दिव्यांगजनों के लिए NHFDC ऋण' },
    ministry: { en: 'Department of Empowerment of Persons with Disabilities', hi: 'दिव्यांगजन सशक्तिकरण विभाग' },
    category: 'disability',
    summary: {
      en: 'Concessional loans for self-employment, small business and higher education for persons with disabilities.',
      hi: 'दिव्यांगजनों के लिए स्वरोज़गार, छोटे व्यापार और उच्च शिक्षा हेतु रियायती ऋण।',
    },
    benefit: { type: 'loan', label: { en: 'Low-interest loans', hi: 'कम ब्याज ऋण' } },
    criteria: { minAge: 18, flags: { hasDisability: true } },
    documents: ['aadhaar', 'disability_certificate', 'income_certificate', 'business_plan'],
    applyUrl: 'https://www.nhfdc.nic.in',
  },

  // ── Banking ────────────────────────────────────────────────────
  {
    id: 'jan-dhan',
    name: { en: 'PM Jan Dhan Yojana', hi: 'प्रधानमंत्री जन धन योजना' },
    ministry: { en: 'Ministry of Finance', hi: 'वित्त मंत्रालय' },
    category: 'banking',
    summary: {
      en: 'A free zero-balance bank account with a RuPay debit card and ₹2 lakh accident insurance. Needed for most cash-transfer schemes.',
      hi: 'RuPay डेबिट कार्ड और ₹2 लाख दुर्घटना बीमा के साथ मुफ़्त ज़ीरो-बैलेंस बैंक खाता। अधिकांश नकद योजनाओं के लिए ज़रूरी।',
    },
    benefit: { type: 'banking', label: { en: 'Free bank account', hi: 'मुफ़्त बैंक खाता' } },
    criteria: { minAge: 10, flags: { hasBankAccount: false } },
    documents: ['aadhaar', 'photo'],
    applyUrl: 'https://pmjdy.gov.in',
  },
]);

/**
 * @param {string} id
 * @returns {Scheme | undefined}
 */
export function findScheme(id) {
  return SCHEMES.find((scheme) => scheme.id === id);
}
