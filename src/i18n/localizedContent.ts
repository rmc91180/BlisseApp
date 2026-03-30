import type { ForeplayIdea } from '@/content/foreplay';
import type { MassageTechnique } from '@/content/massage';
import type { OralPlayIdea } from '@/content/oralplay';
import type { Position } from '@/content/positions';
import type { RolePlayScenario } from '@/content/roleplay';
import type { AppLanguage } from '@/i18n/translations';
import esGenerated from '@/i18n/content/es.generated.json';
import hiGenerated from '@/i18n/content/hi.generated.json';
import ptGenerated from '@/i18n/content/pt.generated.json';

type PositionOverlay = Partial<Pick<Position, 'name' | 'vibe' | 'description' | 'howTo' | 'whyItWorks' | 'tips' | 'pairsWellWith' | 'goodFor'>>;
type ForeplayOverlay = Partial<Pick<ForeplayIdea, 'name' | 'vibe' | 'description' | 'howTo' | 'tips' | 'pairsWellWith'>>;
type OralOverlay = Partial<Pick<OralPlayIdea, 'name' | 'vibe' | 'description' | 'howTo' | 'tips' | 'pairsWellWith'>>;
type MassageOverlay = Partial<Pick<MassageTechnique, 'name' | 'vibe' | 'description' | 'howTo' | 'tips' | 'pairsWellWith' | 'bodyArea'>>;
type RoleplayOverlay = Partial<Pick<RolePlayScenario, 'name' | 'vibe' | 'description' | 'setup' | 'howToPlay' | 'tips' | 'pairsWellWith'>>;

interface GeneratedOverlay {
  positions: Record<string, PositionOverlay>;
  foreplay: Record<string, ForeplayOverlay>;
  oral: Record<string, OralOverlay>;
  massage: Record<string, MassageOverlay>;
  roleplay: Record<string, RoleplayOverlay>;
}

export interface ContentCatalog {
  positions: Position[];
  foreplay: ForeplayIdea[];
  oral: OralPlayIdea[];
  massage: MassageTechnique[];
  roleplay: RolePlayScenario[];
}

const OVERLAY_BY_LANGUAGE: Record<AppLanguage, GeneratedOverlay | null> = {
  en: null,
  es: esGenerated as GeneratedOverlay,
  pt: ptGenerated as GeneratedOverlay,
  hi: hiGenerated as GeneratedOverlay,
};

const localizedCatalogCache = new Map<AppLanguage, ContentCatalog>();

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const asStringArray = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null;
  const rows = value
    .map((entry) => asNonEmptyString(entry))
    .filter((entry): entry is string => Boolean(entry));
  return rows.length > 0 ? rows : null;
};

const HINDI_EXACT_MAP: Record<string, string> = {
  'Woman on Top': 'वुमन ऑन टॉप',
  'Man on Top': 'मैन ऑन टॉप',
  'Side by Side': 'साइड बाय साइड',
  'Rear Entry': 'रियर एंट्री',
  'For Her': 'फ़ॉर हर',
  'For Him': 'फ़ॉर हिम',
  Mutual: 'म्यूचुअल',
  Relaxation: 'रिलैक्सेशन',
  Sensual: 'सेंसुअल',
  Therapeutic: 'थेरेप्यूटिक',
  Romantic: 'रोमांटिक',
  Fantasy: 'फ़ैंटेसी',
  Playful: 'प्लेफुल',
  Adventurous: 'एडवेंचरस',
  Beginner: 'बिगिनर',
  Intermediate: 'इंटरमीडिएट',
  Advanced: 'एडवांस्ड',
  Quick: 'क्विक',
  Medium: 'मीडियम',
  Extended: 'एक्सटेंडेड',
  Light: 'लाइट',
  Intense: 'इंटेंस',
  passionate: 'पैशनेट',
  flowing: 'फ़्लोइंग',
  grounded: 'ग्राउंडेड',
  commanding: 'कमांडिंग',
  unified: 'यूनिफ़ाइड',
  dynamic: 'डायनेमिक',
  blossoming: 'ब्लॉसमिंग',
};

const HINDI_PHRASE_MAP: Array<[string, string]> = [
  ['Face to Face', 'फ़ेस टू फ़ेस'],
  ['Side-by-Side', 'साइड-बाय-साइड'],
  ['Eye contact', 'आई कॉन्टैक्ट'],
  ['Deep connection', 'डीप कनेक्शन'],
  ['Slow rhythm', 'स्लो रिदम'],
  ['Slow intimacy', 'स्लो इंटिमेसी'],
  ['Deep kissing', 'डीप किसिंग'],
  ['Morning intimacy', 'मॉर्निंग इंटिमेसी'],
  ['Full body massage', 'फुल बॉडी मसाज'],
  ['Stress relief', 'स्ट्रेस रिलीफ़'],
  ['Slow buildup', 'स्लो बिल्ड-अप'],
  ['Building anticipation', 'बिल्डिंग एंटिसिपेशन'],
  ['Body worship', 'बॉडी वर्शिप'],
  ['Visual excitement', 'विज़ुअल एक्साइटमेंट'],
  ['Deep penetration', 'डीप पेनिट्रेशन'],
  ['G-spot', 'जी-स्पॉट'],
  ['Clitoral stimulation', 'क्लिटोरल स्टिम्युलेशन'],
  ['Her orgasm', 'हर ऑर्गैज़्म'],
  ['His control', 'हिस कंट्रोल'],
  ['Her pleasure', 'हर प्लेज़र'],
  ['His workout', 'हिस वर्कआउट'],
  ['New sensations', 'न्यू सेंसेशन्स'],
  ['Oral play', 'ओरल प्ले'],
  ['Sensation play', 'सेंसेशन प्ले'],
  ['Slow foreplay', 'स्लो फोरप्ले'],
  ['Deep breathing', 'डीप ब्रीदिंग'],
  ['Partner yoga', 'पार्टनर योगा'],
  ['Slow positions', 'स्लो पोज़िशन्स'],
  ['Any position', 'कोई भी पोज़िशन'],
  ['Any intimate activity', 'कोई भी अंतरंग गतिविधि'],
  ['Any position after', 'इसके बाद कोई भी पोज़िशन'],
  ['Any bed position', 'कोई भी बेड पोज़िशन'],
  ['Any intimate position', 'कोई भी अंतरंग पोज़िशन'],
  ['Any position', 'कोई भी पोज़िशन'],
  ['The Lotus', 'द लोटस'],
  ['Face-Off', 'फ़ेस-ऑफ़'],
  ['Spooning', 'स्पूनिंग'],
  ['Doggy Style', 'डॉगी स्टाइल'],
  ['Lazy Dog', 'लेज़ी डॉग'],
  ['Cowgirl', 'काउगर्ल'],
  ['Missionary', 'मिशनरी'],
  ['Standing Ovation', 'स्टैंडिंग ओवेशन'],
  ['Kitchen Counter', 'किचन काउंटर'],
  ['The Chairman', 'द चेयरमैन'],
  ['The Spider', 'द स्पाइडर'],
  ['The Pretzel', 'द प्रेट्ज़ेल'],
  ['The Waterfall', 'द वॉटरफॉल'],
];

const HINDI_WORD_MAP: Record<string, string> = {
  the: 'द',
  reverse: 'रिवर्स',
  asian: 'एशियन',
  face: 'फ़ेस',
  to: 'टू',
  cross: 'क्रॉस',
  tandem: 'टैंडम',
  seated: 'सीटेड',
  scissors: 'सिज़र्स',
  lap: 'लैप',
  sit: 'सिट',
  edge: 'एज',
  of: 'ऑफ़',
  bed: 'बेड',
  seat: 'सीट',
  spooning: 'स्पूनिंग',
  pretzel: 'प्रेट्ज़ेल',
  criss: 'क्रिस',
  sidewinder: 'साइडवाइंडर',
  side: 'साइड',
  'side-by-side': 'साइड-बाय-साइड',
  spork: 'स्पॉर्क',
  't-bone': 'टी-बोन',
  scissoring: 'सिज़रिंग',
  lazy: 'लेज़ी',
  sideways: 'साइडवेज़',
  twist: 'ट्विस्ट',
  doggy: 'डॉगी',
  style: 'स्टाइल',
  dog: 'डॉग',
  jockey: 'जॉकी',
  flatiron: 'फ्लैटआयरन',
  speed: 'स्पीड',
  bump: 'बम्प',
  downward: 'डाउनवर्ड',
  leapfrog: 'लीपफ्रॉग',
  standing: 'स्टैंडिंग',
  bulldog: 'बुलडॉग',
  table: 'टेबल',
  top: 'टॉप',
  wheelbarrow: 'व्हीलबैरौ',
  peach: 'पीच',
  ovation: 'ओवेशन',
  ballet: 'बैले',
  dancer: 'डांसर',
  pinball: 'पिनबॉल',
  wizard: 'विज़र्ड',
  lift: 'लिफ्ट',
  shower: 'शॉवर',
  special: 'स्पेशल',
  against: 'अगेन्स्ट',
  wall: 'वॉल',
  squat: 'स्क्वाट',
  balance: 'बैलेंस',
  stairway: 'स्टेयरवे',
  heaven: 'हेवन',
  bridge: 'ब्रिज',
  butter: 'बटर',
  churner: 'चर्नर',
  walking: 'वॉकिंग',
  dip: 'डिप',
  spider: 'स्पाइडर',
  web: 'वेब',
  bodyguard: 'बॉडीगार्ड',
  waterfall: 'वॉटरफॉल',
  suspended: 'सस्पेंडेड',
  congress: 'कांग्रेस',
  octopus: 'ऑक्टोपस',
  rocking: 'रॉकिंग',
  horse: 'हॉर्स',
  desk: 'डेस्क',
  job: 'जॉब',
  couch: 'काउच',
  surfer: 'सर्फ़र',
  sofa: 'सोफ़ा',
  brace: 'ब्रेस',
  kitchen: 'किचन',
  counter: 'काउंटर',
  ottoman: 'ऑटोमन',
  window: 'विंडो',
  recliner: 'रिक्लाइनर',
  vanity: 'वैनिटी',
  staircase: 'स्टेयरकेस',
  sandwich: 'सैंडविच',
  dragon: 'ड्रैगन',
  butterfly: 'बटरफ़्लाई',
  snail: 'स्नेल',
  victory: 'विक्ट्री',
  hinge: 'हिंज',
  kneeling: 'नीलिंग',
  fox: 'फ़ॉक्स',
  finale: 'फ़िनाले',
  quickie: 'क्विकी',
  bent: 'बेंट',
  morning: 'मॉर्निंग',
  rush: 'रश',
  lifted: 'लिफ़्टेड',
  spoon: 'स्पून',
  sleepy: 'स्लीपी',
  sunrise: 'सनराइज़',
  wake: 'वेक',
  up: 'अप',
  call: 'कॉल',
  pillow: 'पिलो',
  princess: 'प्रिंसेस',
  forehead: 'फ़ोरहेड',
  touch: 'टच',
  full: 'फुल',
  embrace: 'एम्ब्रेस',
  synchronized: 'सिंक্ৰोनाइज़्ड',
  held: 'हेल्ड',
  down: 'डाउन',
  prayer: 'प्रेयर',
  eye: 'आई',
  lock: 'लॉक',
  whispered: 'व्हिस्पर्ड',
  breathwork: 'ब्रेथवर्क',
  music: 'म्यूज़िक',
  movement: 'मूवमेंट',
  bath: 'बाथ',
  together: 'टुगेदर',
  cuddling: 'कडलिंग',
  intent: 'इंटेंट',
  candlelit: 'कैंडललिट',
  room: 'रूम',
  fresh: 'फ़्रेश',
  sheets: 'शीट्स',
  hotel: 'होटल',
  picnic: 'पिकनिक',
  outdoor: 'आउटडोर',
  under: 'अंडर',
  stars: 'स्टार्स',
  light: 'लाइट',
  mirror: 'मिरर',
  view: 'व्यू',
  body: 'बॉडी',
  map: 'मैप',
  warm: 'वॉर्म',
  hands: 'हैंड्स',
  journey: 'जर्नी',
  countdown: 'काउंटडाउन',
  pressure: 'प्रेशर',
  play: 'प्ले',
  hot: 'हॉट',
  towel: 'टॉवल',
  wrap: 'रैप',
  flavored: 'फ़्लेवर्ड',
  kisses: 'किसेस',
  sound: 'साउंड',
  exploration: 'एक्सप्लोरेशन',
  cool: 'कूल',
  breeze: 'ब्रीज़',
  wax: 'वैक्स',
  alternative: 'ऑल्टरनेटिव',
  oil: 'ऑयल',
  bucket: 'बकेट',
  list: 'लिस्ट',
  auction: 'ऑक्शन',
  timer: 'टाइमर',
  playlist: 'प्लेलिस्ट',
  dare: 'डेयर',
  roleplay: 'रोलप्ले',
  roulette: 'रूलेट',
  breathing: 'ब्रीदिंग',
  heartbeat: 'हार्टबीट',
  listening: 'लिसनिंग',
  love: 'लव',
  language: 'लैंग्वेज',
  exchange: 'एक्सचेंज',
  yoga: 'योगा',
  rainy: 'रेनी',
  day: 'डे',
  in: 'इन',
  session: 'सेशन',
  balcony: 'बालकनी',
  firelight: 'फ़ायरलाइट',
  wine: 'वाइन',
  pulse: 'पल्स',
  point: 'पॉइंट',
  hum: 'हम',
  kiss: 'किस',
  velvet: 'वेल्वेट',
  tongue: 'टंग',
  rhythm: 'रिदम',
  rider: 'राइडर',
  welcome: 'वेलकम',
  gentle: 'जेंटल',
  crown: 'क्राउन',
  focus: 'फोकस',
  silk: 'सिल्क',
  slide: 'स्लाइड',
  slow: 'स्लो',
  blindfold: 'ब्लाइंडफोल्ड',
  trade: 'ट्रेड',
  compass: 'कम्पास',
  duet: 'डुएट',
};

const replaceAllCaseInsensitive = (text: string, search: string, replacement: string): string =>
  text.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), replacement);

const translateHindiLite = (text: string): string => {
  const exact = HINDI_EXACT_MAP[text];
  if (exact) return exact;

  let result = text;
  for (const [from, to] of HINDI_PHRASE_MAP) {
    result = replaceAllCaseInsensitive(result, from, to);
  }

  result = result.replace(/\b[A-Za-z][A-Za-z'&-]*\b/g, (word) => {
    const mapped = HINDI_WORD_MAP[word.toLowerCase()];
    return mapped || word;
  });

  return result
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.:;!?])/g, '$1')
    .trim();
};

const buildHindiPositionFallback = (item: Position): PositionOverlay => {
  const category = translateHindiLite(item.category);
  const difficulty = translateHindiLite(item.difficulty);
  const mood = translateHindiLite(item.mood);
  return {
    name: translateHindiLite(item.name),
    vibe: translateHindiLite(item.vibe),
    description: `यह ${category} श्रेणी की ${difficulty} पोज़िशन है, जो ${mood} ऊर्जा और ${translateHindiLite(item.vibe)} पर केंद्रित है।`,
    howTo: `इसे ${category.toLowerCase()} setup के रूप में आरामदायक angle से शुरू करें, pace को धीरे-धीरे build करें और पूरी तरह communication बनाए रखें।`,
    whyItWorks: `यह पोज़िशन angle, closeness और rhythm के combination की वजह से अलग feel देती है और partners को comfort के साथ explore करने देती है।`,
    tips: [
      'धीरे शुरू करें और angle को comfort के हिसाब से adjust करें।',
      'Communication को पूरे समय clear रखें।',
      'Pillows या support surfaces इस्तेमाल करने में हिचकें नहीं।',
      'Speed से ज़्यादा rhythm और connection पर ध्यान दें।',
    ],
    pairsWellWith: item.pairsWellWith.map(translateHindiLite),
    goodFor: item.goodFor.map(translateHindiLite),
  };
};

const buildHindiForeplayFallback = (item: ForeplayIdea): ForeplayOverlay => ({
  name: translateHindiLite(item.name),
  vibe: translateHindiLite(item.vibe),
  description: `यह ${translateHindiLite(item.category)} श्रेणी का ${translateHindiLite(item.duration)} idea है, जो ${translateHindiLite(item.mood)} mood और ${translateHindiLite(item.vibe)} पर आधारित है।`,
  howTo: `इसे बिना जल्दबाज़ी के शुरू करें, partner की reaction observe करें और touch, breath या words को उसी के अनुसार adjust करें।`,
  tips: [
    'Pace को slow रखें ताकि anticipation naturally build हो।',
    'Partner की body language पर ध्यान दें।',
    'ज़्यादा force के बजाय variety और timing पर भरोसा करें।',
    'अगर कुछ अच्छा लगे तो उसी feeling को थोड़ा और deepen करें।',
  ],
  pairsWellWith: item.pairsWellWith.map(translateHindiLite),
});

const buildHindiOralFallback = (item: OralPlayIdea): OralOverlay => ({
  name: translateHindiLite(item.name),
  vibe: translateHindiLite(item.vibe),
  description: `यह ${translateHindiLite(item.category)} oral idea है, जो ${translateHindiLite(item.mood)} energy और ${translateHindiLite(item.vibe)} पर focus करता है।`,
  howTo: 'Slow warm-up से शुरू करें, pressure और pace के बारे में check-in करते रहें और comfort को हमेशा priority दें.',
  tips: [
    'Rhythm को steady रखें और जल्दीबाज़ी से बचें।',
    'Pressure के बारे में verbal या non-verbal feedback लेते रहें।',
    'Hands और breath का support इसे और rich बना सकता है।',
    'Comfort और consent हर moment में clear रहना चाहिए।',
  ],
  pairsWellWith: item.pairsWellWith.map(translateHindiLite),
});

const buildHindiMassageFallback = (item: MassageTechnique): MassageOverlay => ({
  name: translateHindiLite(item.name),
  vibe: translateHindiLite(item.vibe),
  description: `यह ${translateHindiLite(item.category)} massage technique ${translateHindiLite(item.bodyArea)} पर focused है और ${translateHindiLite(item.vibe)} feel देती है।`,
  howTo: `Warm hands, steady pressure और slow breathing के साथ ${translateHindiLite(item.bodyArea)} area पर काम करें। Pressure को partner की comfort के हिसाब से adjust करें।`,
  tips: [
    'Pressure शुरू में हल्का रखें और धीरे-धीरे बढ़ाएँ।',
    'Breathing और relaxation को पूरी तरह scene का हिस्सा बनाएँ।',
    'Oil, lotion या towel से comfort बढ़ाया जा सकता है।',
    'अगर body response अच्छा हो तो same area पर थोड़ा और समय दें।',
  ],
  pairsWellWith: item.pairsWellWith.map(translateHindiLite),
  bodyArea: translateHindiLite(item.bodyArea),
});

const buildHindiRoleplayFallback = (item: RolePlayScenario): RoleplayOverlay => ({
  name: translateHindiLite(item.name),
  vibe: translateHindiLite(item.vibe),
  description: `यह ${translateHindiLite(item.category)} roleplay scenario ${translateHindiLite(item.intensity)} intensity के साथ ${translateHindiLite(item.vibe)} mood बनाता है।`,
  setup: 'कुछ simple props, mood-setting details और clear consent के साथ scene तैयार करें ताकि imagination naturally flow करे।',
  howToPlay: 'Character या scenario को lightly commit करें, बातचीत को playful रखें और chemistry को धीरे-धीरे build होने दें।',
  tips: [
    'Scene शुरू करने से पहले comfort level और limits साफ़ रखें।',
    'Playfulness और connection को performance से ऊपर रखें।',
    'Props छोटे हों तो भी attention और tone scene को मजबूत बनाते हैं।',
    'Laughter आए तो उसे भी play का हिस्सा रहने दें।',
  ],
  pairsWellWith: item.pairsWellWith.map(translateHindiLite),
});

const resolveString = (overlayValue: unknown, fallbackValue: string | undefined, sourceValue: string): string =>
  asNonEmptyString(overlayValue) || fallbackValue || sourceValue;

const resolveStringArray = (
  overlayValue: unknown,
  fallbackValue: string[] | undefined,
  sourceValue: string[],
): string[] => asStringArray(overlayValue) || fallbackValue || sourceValue;

const localizePosition = (item: Position, overlay: PositionOverlay | undefined, language: AppLanguage): Position => {
  const fallback = language === 'hi' ? buildHindiPositionFallback(item) : undefined;
  if (!overlay && !fallback) return item;
  return {
    ...item,
    name: resolveString(overlay?.name, fallback?.name, item.name),
    vibe: resolveString(overlay?.vibe, fallback?.vibe, item.vibe),
    description: resolveString(overlay?.description, fallback?.description, item.description),
    howTo: resolveString(overlay?.howTo, fallback?.howTo, item.howTo),
    whyItWorks: resolveString(overlay?.whyItWorks, fallback?.whyItWorks, item.whyItWorks),
    tips: resolveStringArray(overlay?.tips, fallback?.tips, item.tips),
    pairsWellWith: resolveStringArray(overlay?.pairsWellWith, fallback?.pairsWellWith, item.pairsWellWith),
    goodFor: resolveStringArray(overlay?.goodFor, fallback?.goodFor, item.goodFor),
  };
};

const localizeForeplay = (item: ForeplayIdea, overlay: ForeplayOverlay | undefined, language: AppLanguage): ForeplayIdea => {
  const fallback = language === 'hi' ? buildHindiForeplayFallback(item) : undefined;
  if (!overlay && !fallback) return item;
  return {
    ...item,
    name: resolveString(overlay?.name, fallback?.name, item.name),
    vibe: resolveString(overlay?.vibe, fallback?.vibe, item.vibe),
    description: resolveString(overlay?.description, fallback?.description, item.description),
    howTo: resolveString(overlay?.howTo, fallback?.howTo, item.howTo),
    tips: resolveStringArray(overlay?.tips, fallback?.tips, item.tips),
    pairsWellWith: resolveStringArray(overlay?.pairsWellWith, fallback?.pairsWellWith, item.pairsWellWith),
  };
};

const localizeOral = (item: OralPlayIdea, overlay: OralOverlay | undefined, language: AppLanguage): OralPlayIdea => {
  const fallback = language === 'hi' ? buildHindiOralFallback(item) : undefined;
  if (!overlay && !fallback) return item;
  return {
    ...item,
    name: resolveString(overlay?.name, fallback?.name, item.name),
    vibe: resolveString(overlay?.vibe, fallback?.vibe, item.vibe),
    description: resolveString(overlay?.description, fallback?.description, item.description),
    howTo: resolveString(overlay?.howTo, fallback?.howTo, item.howTo),
    tips: resolveStringArray(overlay?.tips, fallback?.tips, item.tips),
    pairsWellWith: resolveStringArray(overlay?.pairsWellWith, fallback?.pairsWellWith, item.pairsWellWith),
  };
};

const localizeMassage = (item: MassageTechnique, overlay: MassageOverlay | undefined, language: AppLanguage): MassageTechnique => {
  const fallback = language === 'hi' ? buildHindiMassageFallback(item) : undefined;
  if (!overlay && !fallback) return item;
  return {
    ...item,
    name: resolveString(overlay?.name, fallback?.name, item.name),
    vibe: resolveString(overlay?.vibe, fallback?.vibe, item.vibe),
    description: resolveString(overlay?.description, fallback?.description, item.description),
    howTo: resolveString(overlay?.howTo, fallback?.howTo, item.howTo),
    tips: resolveStringArray(overlay?.tips, fallback?.tips, item.tips),
    pairsWellWith: resolveStringArray(overlay?.pairsWellWith, fallback?.pairsWellWith, item.pairsWellWith),
    bodyArea: resolveString(overlay?.bodyArea, fallback?.bodyArea, item.bodyArea),
  };
};

const localizeRoleplay = (item: RolePlayScenario, overlay: RoleplayOverlay | undefined, language: AppLanguage): RolePlayScenario => {
  const fallback = language === 'hi' ? buildHindiRoleplayFallback(item) : undefined;
  if (!overlay && !fallback) return item;
  return {
    ...item,
    name: resolveString(overlay?.name, fallback?.name, item.name),
    vibe: resolveString(overlay?.vibe, fallback?.vibe, item.vibe),
    description: resolveString(overlay?.description, fallback?.description, item.description),
    setup: resolveString(overlay?.setup, fallback?.setup, item.setup),
    howToPlay: resolveString(overlay?.howToPlay, fallback?.howToPlay, item.howToPlay),
    tips: resolveStringArray(overlay?.tips, fallback?.tips, item.tips),
    pairsWellWith: resolveStringArray(overlay?.pairsWellWith, fallback?.pairsWellWith, item.pairsWellWith),
  };
};

export const getLocalizedContentCatalog = (language: AppLanguage, source: ContentCatalog): ContentCatalog => {
  if (language === 'en') return source;

  const cached = localizedCatalogCache.get(language);
  if (cached) return cached;

  const overlay = OVERLAY_BY_LANGUAGE[language];
  if (!overlay) return source;

  const localized: ContentCatalog = {
    positions: source.positions.map((item) => localizePosition(item, overlay.positions[String(item.id)], language)),
    foreplay: source.foreplay.map((item) => localizeForeplay(item, overlay.foreplay[String(item.id)], language)),
    oral: source.oral.map((item) => localizeOral(item, overlay.oral[String(item.id)], language)),
    massage: source.massage.map((item) => localizeMassage(item, overlay.massage[String(item.id)], language)),
    roleplay: source.roleplay.map((item) => localizeRoleplay(item, overlay.roleplay[String(item.id)], language)),
  };

  localizedCatalogCache.set(language, localized);
  return localized;
};
