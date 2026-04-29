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
  'Woman on Top': 'महिला ऊपर',
  'Man on Top': 'पुरुष ऊपर',
  'Side by Side': 'साथ-साथ',
  'Rear Entry': 'पीछे से',
  'For Her': 'महिला के लिए',
  'For Him': 'पुरुष के लिए',
  Mutual: 'मिलकर',
  Relaxation: 'आराम',
  Sensual: 'मादक',
  Therapeutic: 'आरामदायक',
  Romantic: 'रोमांटिक',
  Fantasy: 'कल्पना',
  Playful: 'चुलबुला',
  Adventurous: 'रोमांचक',
  Beginner: 'शुरुआती',
  Intermediate: 'मध्यम',
  Advanced: 'उन्नत',
  Quick: 'त्वरित',
  Medium: 'मध्यम',
  Extended: 'लंबा',
  Light: 'हल्का',
  Intense: 'तीव्र',
  passionate: 'जोशीला',
  flowing: 'बहता हुआ',
  grounded: 'स्थिर',
  commanding: 'आत्मविश्वासी',
  unified: 'एकताल',
  dynamic: 'ऊर्जावान',
  blossoming: 'खिलता हुआ',
};

const HINDI_PHRASE_MAP: Array<[string, string]> = [
  ['Face to Face', 'आमने-सामने'],
  ['Side-by-Side', 'साथ-साथ'],
  ['Eye contact', 'आँखों का संपर्क'],
  ['Deep connection', 'गहरा जुड़ाव'],
  ['Slow rhythm', 'धीमी लय'],
  ['Slow intimacy', 'धीमी नज़दीकी'],
  ['Deep kissing', 'गहरे चुंबन'],
  ['Morning intimacy', 'सुबह की नज़दीकी'],
  ['Full body massage', 'पूरे शरीर की मालिश'],
  ['Stress relief', 'तनाव से राहत'],
  ['Slow buildup', 'धीमा उभार'],
  ['Building anticipation', 'प्रतीक्षा की गर्माहट'],
  ['Body worship', 'शरीर पर पूरा ध्यान'],
  ['Visual excitement', 'देखने की उत्तेजना'],
  ['Deep penetration', 'गहरी पैठ'],
  ['G-spot', 'जी-स्पॉट'],
  ['Clitoral stimulation', 'क्लिटोरल स्टिम्युलेशन'],
  ['Her orgasm', 'उसका चरमसुख'],
  ['His control', 'उसका नियंत्रण'],
  ['Her pleasure', 'उसका आनंद'],
  ['His workout', 'उसकी मेहनत'],
  ['New sensations', 'नई अनुभूतियाँ'],
  ['Oral play', 'मुख-आधारित खेल'],
  ['Sensation play', 'अनुभूति का खेल'],
  ['Slow foreplay', 'धीमा पूर्वरंग'],
  ['Deep breathing', 'गहरी साँसें'],
  ['Partner yoga', 'पार्टनर योगा'],
  ['Slow positions', 'धीमी मुद्राएँ'],
  ['Any position', 'कोई भी मुद्रा'],
  ['Any intimate activity', 'कोई भी अंतरंग गतिविधि'],
  ['Any position after', 'इसके बाद कोई भी मुद्रा'],
  ['Any bed position', 'बिस्तर की कोई भी मुद्रा'],
  ['Any intimate position', 'कोई भी अंतरंग मुद्रा'],
  ['Any position', 'कोई भी मुद्रा'],
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
  angle: 'कोण',
  pace: 'गति',
  partner: 'साथी',
  partners: 'साथी',
  setup: 'अंदाज़',
  scene: 'माहौल',
  control: 'नियंत्रण',
  support: 'सहारा',
  closeness: 'नज़दीकी',
  communication: 'बातचीत',
  combination: 'मेल',
  feel: 'अहसास',
  focus: 'ध्यान',
  pressure: 'दबाव',
  comfort: 'सहजता',
  build: 'गहराएँ',
  play: 'खेल',
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
  playlist: 'गीत-सूची',
  dare: 'डेयर',
  roleplay: 'भूमिका-अभिनय',
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
  session: 'सत्र',
  balcony: 'बालकनी',
  firelight: 'फ़ायरलाइट',
  wine: 'वाइन',
  pulse: 'पल्स',
  point: 'पॉइंट',
  hum: 'हम',
  kiss: 'चुंबन',
  velvet: 'वेल्वेट',
  tongue: 'टंग',
  rhythm: 'लय',
  rider: 'राइडर',
  welcome: 'वेलकम',
  gentle: 'जेंटल',
  crown: 'क्राउन',
  silk: 'सिल्क',
  slide: 'स्लाइड',
  slow: 'धीमा',
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
    description: `यह ${category} श्रेणी की ${difficulty} मुद्रा है, जिसमें ${mood} ऊर्जा और ${translateHindiLite(item.vibe)} का अहसास मिलता है।`,
    howTo: `इसे आरामदायक ढंग से शुरू करें, कोण को धीरे-धीरे साधें और पूरी तरह खुली बातचीत बनाए रखें।`,
    whyItWorks: `यह अंदाज़ कोण, नज़दीकी और लय के मेल से अलग एहसास देता है और दोनों साथियों को सहजता से खोजने की जगह देता है।`,
    tips: [
      'धीरे शुरू करें और कोण को सहजता के हिसाब से सँभालें।',
      'पूरे समय खुली और साफ़ बातचीत बनाए रखें।',
      'तकियों या सहारे का इस्तेमाल करने में झिझकें नहीं।',
      'तेज़ी से ज़्यादा लय और जुड़ाव पर ध्यान दें।',
    ],
    pairsWellWith: item.pairsWellWith.map(translateHindiLite),
    goodFor: item.goodFor.map(translateHindiLite),
  };
};

const buildHindiForeplayFallback = (item: ForeplayIdea): ForeplayOverlay => ({
  name: translateHindiLite(item.name),
  vibe: translateHindiLite(item.vibe),
  description: `यह ${translateHindiLite(item.category)} श्रेणी का ${translateHindiLite(item.duration)} सुझाव है, जो ${translateHindiLite(item.mood)} मूड और ${translateHindiLite(item.vibe)} पर आधारित है।`,
  howTo: `इसे बिना जल्दबाज़ी के शुरू करें, साथी की प्रतिक्रिया पर ध्यान दें और स्पर्श, साँस या शब्दों को उसी के अनुसार बदलें।`,
  tips: [
    'गति को धीमा रखें ताकि प्रतीक्षा का मज़ा धीरे-धीरे बढ़े।',
    'साथी की देह-भाषा पर ध्यान दें।',
    'ज़्यादा ज़ोर के बजाय विविधता और सही समय पर भरोसा करें।',
    'अगर कुछ अच्छा लगे तो उसी एहसास को थोड़ी देर और ठहरने दें।',
  ],
  pairsWellWith: item.pairsWellWith.map(translateHindiLite),
});

const buildHindiOralFallback = (item: OralPlayIdea): OralOverlay => ({
  name: translateHindiLite(item.name),
  vibe: translateHindiLite(item.vibe),
  description: `यह ${translateHindiLite(item.category)} श्रेणी का सुझाव है, जो ${translateHindiLite(item.mood)} ऊर्जा और ${translateHindiLite(item.vibe)} पर ध्यान देता है।`,
  howTo: 'धीमी शुरुआत करें, दबाव और गति के बारे में पूछते रहें और सहजता को हमेशा पहली जगह दें।',
  tips: [
    'लय को स्थिर रखें और जल्दबाज़ी से बचें।',
    'दबाव के बारे में शब्दों या संकेतों से प्रतिक्रिया लेते रहें।',
    'हाथों और साँस का सहारा इसे और समृद्ध बना सकता है।',
    'हर पल सहजता और सहमति साफ़ रहनी चाहिए।',
  ],
  pairsWellWith: item.pairsWellWith.map(translateHindiLite),
});

const buildHindiMassageFallback = (item: MassageTechnique): MassageOverlay => ({
  name: translateHindiLite(item.name),
  vibe: translateHindiLite(item.vibe),
  description: `यह ${translateHindiLite(item.category)} मालिश तकनीक ${translateHindiLite(item.bodyArea)} पर केंद्रित है और ${translateHindiLite(item.vibe)} एहसास देती है।`,
  howTo: `गर्म हथेलियों, स्थिर दबाव और धीमी साँसों के साथ ${translateHindiLite(item.bodyArea)} हिस्से पर काम करें। दबाव को साथी की सहजता के हिसाब से बदलें।`,
  tips: [
    'दबाव शुरू में हल्का रखें और धीरे-धीरे बढ़ाएँ।',
    'साँस और आराम को पूरे माहौल का हिस्सा बनाएँ।',
    'तेल, लोशन या तौलिये से सहजता बढ़ाई जा सकती है।',
    'अगर देह की प्रतिक्रिया अच्छी हो तो उसी हिस्से पर थोड़ा और समय दें।',
  ],
  pairsWellWith: item.pairsWellWith.map(translateHindiLite),
  bodyArea: translateHindiLite(item.bodyArea),
});

const buildHindiRoleplayFallback = (item: RolePlayScenario): RoleplayOverlay => ({
  name: translateHindiLite(item.name),
  vibe: translateHindiLite(item.vibe),
  description: `यह ${translateHindiLite(item.category)} भूमिका-अभिनय ${translateHindiLite(item.intensity)} तीव्रता के साथ ${translateHindiLite(item.vibe)} माहौल बनाता है।`,
  setup: 'कुछ आसान सामान, सही माहौल और साफ़ सहमति के साथ शुरुआत करें ताकि कल्पना सहजता से बह सके।',
  howToPlay: 'किरदार या परिस्थिति को हल्के से अपनाएँ, बातचीत को चुलबुला रखें और रसायन को धीरे-धीरे गहराने दें।',
  tips: [
    'शुरुआत से पहले सहजता और सीमाएँ साफ़ तय कर लें।',
    'चुलबुलेपन और जुड़ाव को दिखावे से ऊपर रखें।',
    'सामान छोटा हो तब भी ध्यान और लहजा माहौल को मज़बूत बनाते हैं।',
    'हँसी आ जाए तो उसे भी खेल का हिस्सा बने रहने दें।',
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
