#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const JSON_SPACES = 2;

const FILES = {
  ui: path.join(ROOT, 'src', 'i18n', 'source', 'ui-strings.json'),
  hiUi: path.join(ROOT, 'src', 'i18n', 'hi-ui.generated.json'),
  es: path.join(ROOT, 'src', 'i18n', 'content', 'es.generated.json'),
  pt: path.join(ROOT, 'src', 'i18n', 'content', 'pt.generated.json'),
  hi: path.join(ROOT, 'src', 'i18n', 'content', 'hi.generated.json'),
  truthDareHi: path.join(ROOT, 'src', 'i18n', 'content', 'truth-or-dare-hi.generated.json'),
  cache: path.join(ROOT, '.translation-cache.json'),
};

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, JSON_SPACES)}\n`, 'utf8');
};

const setNestedHi = (root, dottedKey, value) => {
  const parts = dottedKey.split('.');
  let current = root;
  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) return false;
    current = current[part];
  }
  if (!current || typeof current !== 'object' || !('hi' in current)) return false;
  current.hi = value;
  return true;
};

const replaceInValue = (value, replacements) => {
  if (typeof value === 'string') {
    let next = value;
    for (const [from, to] of Object.entries(replacements)) {
      next = next.split(from).join(to);
    }
    return next;
  }
  if (Array.isArray(value)) return value.map((entry) => replaceInValue(entry, replacements));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, replaceInValue(entry, replacements)]));
  }
  return value;
};

const countEnglishLeakage = (value, { allow = new Set(), ignorePlaceholders = true } = {}) => {
  const regex = /[A-Za-z]{3,}/g;
  const leaks = [];
  const visit = (entry, pathParts) => {
    if (typeof entry === 'string') {
      let text = entry;
      if (ignorePlaceholders) text = text.replace(/\{[^}]+\}/g, '').replace(/https?:\/\/\S+/g, '');
      const words = text.match(regex) || [];
      const bad = words.filter((word) => !allow.has(word));
      if (bad.length) leaks.push({ path: pathParts.join('.'), value: entry, words: bad });
      return;
    }
    if (Array.isArray(entry)) {
      entry.forEach((child, index) => visit(child, [...pathParts, String(index)]));
      return;
    }
    if (entry && typeof entry === 'object') {
      Object.entries(entry).forEach(([key, child]) => visit(child, [...pathParts, key]));
    }
  };
  visit(value, []);
  return leaks;
};

const hiOverrides = {
  'onboarding.name.placeholder': 'आपका नाम या उपनाम',
  'onboarding.relationship.subtitle': 'इससे हम आपका अनुभव आपके लिए बेहतर बना पाएँगे',
  'onboarding.relationship.types.hetero': 'पुरुष और महिला',
  'onboarding.relationship.types.mm': 'पुरुष और पुरुष',
  'onboarding.relationship.types.ff': 'महिला और महिला',
  'onboarding.relationship.types.other': 'अन्य / लचीला',
  'onboarding.relationship.duration.new': '1 साल से कम',
  'onboarding.relationship.duration.established': '1-5 साल',
  'onboarding.relationship.duration.longterm': '5-10 साल',
  'onboarding.relationship.duration.veteran': '10+ साल',
  'onboarding.preferences.subtitle': 'जो भी लागू हो, चुनें',
  'onboarding.preferences.options.deepConnection': 'और गहरा जुड़ाव',
  'onboarding.preferences.options.tryingNew': 'नई चीज़ें आज़माना',
  'onboarding.preferences.options.quickMoments': 'छोटे अंतरंग पल',
  'onboarding.preferences.options.extendedSessions': 'लंबे सत्र',
  'onboarding.preferences.options.foreplayFocus': 'पूर्वरंग और प्रतीक्षा',
  'onboarding.preferences.options.adventurous': 'रोमांचक अनुभव',
  'onboarding.preferences.options.communication': 'बेहतर बातचीत',
  'onboarding.preferences.options.playful': 'चुलबुला और मज़ेदार',
  'onboarding.experience.title': 'आपका अनुभव स्तर',
  'onboarding.legal.title': 'आगे बढ़ने से पहले',
  'onboarding.legal.ageVerification': 'मैं पुष्टि करता/करती हूँ कि मेरी उम्र 18 वर्ष या उससे अधिक है',
  'onboarding.legal.termsAcceptance': 'मैं सहमत हूँ',
  'onboarding.legal.termsOfService': 'सेवा की शर्तों से',
  'onboarding.legal.and': 'और',
  'onboarding.legal.privacyPolicy': 'गोपनीयता नीति से',
  'auth.signIn.title': 'वापस स्वागत है',
  'auth.signIn.email': 'ईमेल',
  'auth.signIn.password': 'पासवर्ड',
  'auth.signIn.button': 'साइन इन करें',
  'auth.signIn.signUp': 'साइन अप करें',
  'auth.signUp.title': 'खाता बनाएँ',
  'auth.signUp.confirmPassword': 'पासवर्ड की पुष्टि करें',
  'auth.signUp.passwordRequirements': 'कम से कम 8 अक्षर',
  'auth.signUp.button': 'खाता बनाएँ',
  'auth.signUp.orContinueWith': 'या इसके साथ जारी रखें',
  'home.greeting.morning': 'सुप्रभात',
  'home.greeting.afternoon': 'शुभ दोपहर',
  'home.greeting.evening': 'शुभ संध्या',
  'home.tonight.title': 'आज रात की पसंद',
  'home.tonight.seeDetails': 'विवरण देखें',
  'home.tonight.refresh': 'कुछ और आज़माएँ',
  'home.mood.passionate': 'जोशीला',
  'home.mood.playful': 'चुलबुला',
  'home.mood.flowing': 'बहता हुआ',
  'home.mood.grounded': 'स्थिर',
  'home.mood.commanding': 'आत्मविश्वासी',
  'home.mood.unified': 'एकताल',
  'home.mood.dynamic': 'ऊर्जावान',
  'home.mood.blossoming': 'खिलता हुआ',
  'home.quickAccess.foreplay': 'पूर्वरंग के विचार',
  'home.quickAccess.sessionBuilder': 'सत्र बनाएँ',
  'home.quickAccess.random': 'मुझे सरप्राइज़ करें',
  'explore.title': 'खोजें',
  'explore.search.placeholder': 'मुद्राएँ खोजें...',
  'explore.sections.positions': 'मुद्राएँ',
  'explore.sections.foreplay': 'पूर्वरंग',
  'explore.sections.byMood': 'मूड के अनुसार',
  'explore.seeAll': 'सब देखें',
  'categories.womanOnTop': 'महिला ऊपर',
  'categories.manOnTop': 'पुरुष ऊपर',
  'categories.rearEntry': 'पीछे से',
  'categories.sitting': 'बैठकर',
  'categories.sideBySide': 'साथ-साथ',
  'categories.standing': 'खड़े होकर',
  'categories.furniture': 'फर्नीचर',
  'categories.exotic': 'अनोखा',
  'categories.wetAndWild': 'गीला और रोमांचक',
  'categories.lightBondage': 'हल्का बंधन',
  'categories.pillowAndProps': 'तकिया और सहारे',
  'difficulty.beginner': 'शुरुआती',
  'difficulty.intermediate': 'मध्यम',
  'difficulty.advanced': 'उन्नत',
  'positionDetail.whyItWorks': 'यह क्यों काम करता है',
  'positionDetail.tips': 'सुझाव',
  'positionDetail.pairsWellWith': 'इसके साथ अच्छा लगता है',
  'positionDetail.goodFor': 'इनके लिए अच्छा',
  'positionDetail.markAsTried': 'आज़माया हुआ चिह्नित करें',
  'positionDetail.tried': 'आज़माया ✓',
  'positionDetail.addToFavorites': 'पसंदीदा में जोड़ें',
  'favorites.title': 'पसंदीदा',
  'favorites.empty.title': 'अभी कोई पसंदीदा नहीं',
  'favorites.empty.subtitle': 'जिन मुद्राओं को आज़माना चाहते हैं, उन्हें दिल आइकन से सहेजें',
  'favorites.filters.all': 'सभी',
  'favorites.filters.positions': 'मुद्राएँ',
  'favorites.filters.foreplay': 'पूर्वरंग',
  'profile.title': 'प्रोफ़ाइल',
  'profile.memberSince': 'सदस्यता शुरू हुई',
  'settings.title': 'सेटिंग्स',
  'settings.sections.relationship': 'रिश्ता',
  'settings.sections.preferences': 'पसंदें',
  'settings.sections.app': 'ऐप',
  'settings.sections.privacy': 'गोपनीयता और सुरक्षा',
  'settings.sections.data': 'आपका डेटा',
  'settings.sections.about': 'परिचय',
  'settings.items.relationshipType': 'रिश्ते का प्रकार',
  'settings.items.experienceLevel': 'अनुभव स्तर',
  'settings.items.interests': 'रुचियाँ',
};

const hiFlatOverrides = {
  ...hiOverrides,
  'tabs.home': 'होम',
  'tabs.explore': 'खोजें',
  'tabs.favorites': 'पसंदीदा',
  'tabs.profile': 'प्रोफ़ाइल',
  'common.all': 'सभी',
  'common.delete': 'हटाएँ',
  'common.done': 'हो गया',
  'common.open': 'खोलें',
  'common.not_set': 'सेट नहीं',
  'common.search': 'खोजें',
  'common.clear': 'साफ़ करें',
  'common.success': 'सफलता',
  'common.update': 'अपडेट करें',
  'common.add': 'जोड़ें',
  'common.add_to_favorites': 'पसंदीदा में जोड़ें',
  'common.remove_from_favorites': 'पसंदीदा से हटाएँ',
  'stats.tried': 'साथ में आज़माया',
  'stats.favorites': 'पसंदीदा',
  'stats.total': 'कुल',
  'stats.challenges': 'चुनौतियाँ',
  'explore.tab.content': 'खेलें',
  'explore.tab.music': 'संगीत',
  'explore.tab.games': 'गेम्स',
  'explore.filter.favorites': 'पसंदीदा',
  'explore.empty_favorites': 'यहाँ अभी कुछ सहेजा नहीं गया।',
  'explore.search_placeholder': '{type} खोजें...',
  'explore.type.positions': 'मुद्राएँ',
  'explore.type.foreplay': 'पूर्वरंग',
  'explore.type.oral': 'ओरल',
  'explore.type.massage': 'मालिश',
  'explore.type.roleplay': 'भूमिका-खेल',
  'explore.sort.all': 'सभी',
  'explore.sort.new': 'नया',
  'explore.sort.new_to_you': 'अभी नहीं आज़माया',
  'explore.sort.tried': 'आज़माया',
  'favorites.favorites_toggle': 'पसंदीदा',
  'favorites.recent_toggle': 'हाल में आज़माया',
  'favorites.positions_count': 'मुद्राएँ ({count})',
  'favorites.foreplay_count': 'पूर्वरंग ({count})',
  'favorites.oral_count': 'ओरल ({count})',
  'profile.menu.settings': 'सेटिंग्स और सुरक्षा',
  'profile.menu.ideas': 'एक विचार भेजें',
  'profile.menu.contact': 'संपर्क करें',
  'profile.menu.terms': 'सेवा की शर्तें',
  'profile.menu.privacy': 'गोपनीयता नीति',
  'profile.menu.signout': 'साइन आउट',
  'settings.section.security': 'गोपनीयता और सुरक्षा',
  'settings.section.language': 'भाषा',
  'settings.section.notifications': 'सूचनाएँ',
  'settings.section.account': 'खाता',
  'settings.section.data': 'आपका डेटा',
  'settings.language': 'भाषा',
  'settings.account.delete': 'खाता हटाएँ',
  'settings.pin.cancel': 'रद्द करें',
  'detail.sections.what_is_it': 'वाइब',
  'detail.sections.good_for': 'इनके लिए अच्छा',
  'detail.sections.pairs_well_with': 'इसके साथ अच्छा लगता है',
  'detail.actions.mark_tried': 'आज़माया चिह्नित करें',
  'spinner.type.position': '💑 मुद्रा',
  'spinner.type.oral': '👄 ओरल',
  'truth_dare.dare': 'डेयर',
  'truth_dare.random': 'सरप्राइज़',
  'truth_dare.card.dare': '😈 डेयर',
};

const esReplacements = {
  'Nuevo sensaciones': 'Nuevas sensaciones',
  'Extendido sesiones': 'Sesiones extendidas',
  'Verbal comunicación': 'Comunicación verbal',
  'Intenso conexión': 'Conexión intensa',
  'Máximo profundidad': 'Profundidad máxima',
  'Compartido esfuerzo': 'Esfuerzo compartido',
  'Cara a cara intimidad': 'Intimidad cara a cara',
  'Juguetón estado de ánimo': 'Estado de ánimo juguetón',
  'Energía liberación': 'Liberación de energía',
  'Su completa control': 'Su control completo',
  'Misionero variedad': 'Variedad en misionero',
  'Largo sesiones': 'Sesiones largas',
  'Flexible parejas': 'Parejas flexibles',
  'The Deck Silla': 'La tumbona',
  'El Lotus': 'El loto',
  'Legs-Up Heaven': 'Piernas al cielo',
  'Deep Fold': 'Plegado profundo',
  'Twist & Shout': 'Giro y gemido',
  'El G-Whiz': 'El punto G',
  'The G-Whiz': 'El punto G',
  'The Deck Chair': 'La tumbona',
  'ojos íntimos contacto': 'contacto visual íntimo',
  'mirada profunda contacto': 'contacto visual profundo',
  'Emocional conexión': 'Conexión emocional',
  'Mobiliario de silla': 'Uso de silla',
  'Desnudarse provocar': 'Provocación al desvestirse',
  'Socios': 'Parejas',
  'socios': 'parejas',
};

const ptReplacements = {
  'Novo sensações': 'Novas sensações',
  'Ela prazer': 'Prazer dela',
  'Ela treino': 'Treino dela',
  'Extended sessões': 'Sessões prolongadas',
  'Compartilhado esforço': 'Esforço compartilhado',
  'Máximo profundidade': 'Profundidade máxima',
  'Pentração profunda': 'Penetração profunda',
  'In vaqueira': 'Na vaqueira',
  'Missionary continua': 'Missionário continua',
  'Ele controla o pace': 'Ele controla o ritmo',
  'Ponto G acesso': 'Acesso ao ponto G',
  'A Lap Dance': 'A dança no colo',
  'Legs-Up Heaven': 'Pernas ao céu',
  'Deep Fold': 'Dobra profunda',
  'Twist & Shout': 'Giro e gemido',
  'The G-Whiz': 'O ponto G',
  'Hovering': 'Flutuar',
  'hovering': 'flutuar',
  'Energia release': 'Liberação de energia',
  'Móveis usar': 'Uso de móveis',
  'Íntimo conexão': 'Conexão íntima',
  'olhar profundo contato': 'contato visual profundo',
  'Grinding funciona': 'O movimento de fricção funciona',
  'grindar': 'fazer movimentos de fricção',
};

const hiReplacements = {
  'द लैप डांस': 'गोद में नृत्य',
  'वेलेडिक्टोरियन': 'गहरा झुकाव',
  'लॉन्च पैड': 'उड़ान मंच',
  'टीम वर्क': 'टीमवर्क',
  'ऑर्गेज्म': 'चरमसुख',
  'सेक्स': 'अंतरंगता',
  'मज़ा अंतरंगता': 'मज़ेदार अंतरंगता',
  'गंदी बात': 'चुलबुली बात',
  'स्थितियां': 'मुद्राएँ',
  'बिल्डिंग तनाव': 'तनाव बनाना',
  'वर्कआउट': 'व्यायाम',
  'रिवर्स काऊ गर्ल': 'उलटी काउगर्ल',
  'काऊ गर्ल': 'काउगर्ल',
};

const truthDareHiReplacements = {
  'बकेट सूची': 'इच्छा-सूची',
  'रसायन शास्त्र': 'केमिस्ट्री',
  'पीजी-13': 'PG-13',
};

const run = () => {
  const changed = [];

  const ui = readJson(FILES.ui);
  let appliedUi = 0;
  for (const [key, value] of Object.entries(hiOverrides)) {
    if (setNestedHi(ui, key, value)) appliedUi += 1;
  }
  writeJson(FILES.ui, ui);
  changed.push(`ui-strings Hindi overrides applied: ${appliedUi}/${Object.keys(hiOverrides).length}`);

  const hiUi = readJson(FILES.hiUi);
  Object.assign(hiUi, hiFlatOverrides);
  writeJson(FILES.hiUi, hiUi);
  changed.push(`hi-ui runtime overrides applied: ${Object.keys(hiFlatOverrides).length}`);

  const contentUpdates = [
    [FILES.es, esReplacements, 'Spanish content polish'],
    [FILES.pt, ptReplacements, 'Portuguese content polish'],
    [FILES.hi, hiReplacements, 'Hindi generated content polish'],
    [FILES.truthDareHi, truthDareHiReplacements, 'Hindi Truth-or-Dare polish'],
  ];

  for (const [filePath, replacements, label] of contentUpdates) {
    const before = fs.readFileSync(filePath, 'utf8');
    const next = replaceInValue(JSON.parse(before.replace(/^\uFEFF/, '')), replacements);
    writeJson(filePath, next);
    changed.push(`${label}: ${Object.keys(replacements).length} exact replacements`);
  }

  if (fs.existsSync(FILES.cache)) {
    const cache = readJson(FILES.cache);
    const polishedCache = replaceInValue(replaceInValue(replaceInValue(cache, esReplacements), ptReplacements), hiReplacements);
    writeJson(FILES.cache, polishedCache);
    changed.push('translation cache polished with the same replacements');
  }

  const hiUiLeaks = countEnglishLeakage(readJson(FILES.hiUi), {
    allow: new Set(['Blisse', 'Spotify', 'Apple', 'Music', 'URL', 'PIN', 'Face', 'Touch', 'ID', 'PG', 'Formspree', 'Email', 'Google', 'App', 'Store', 'Play', 'PostHog', 'Firebase', 'RevenueCat']),
  });

  if (hiUiLeaks.length > 0) {
    console.error('[i18n-fix] Hindi runtime English leakage remains:');
    console.error(JSON.stringify(hiUiLeaks.slice(0, 20), null, 2));
    process.exit(1);
  }

  console.log('[i18n-fix] Completed');
  for (const line of changed) console.log(`  - ${line}`);
};

run();
