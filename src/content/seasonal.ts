/** Seasonal content, truth-or-dare prompts, and playlist data extracted from App.tsx. */

import type {
  SeasonalTheme,
  SeasonalGameAction,
  SeasonalGameOption,
  TruthOrDareItem,
  PlaylistLink,
} from '@/types/app';
import {
  createLocalizedArrayProxy,
  createLocalizedRecordProxy,
} from '@/i18n/languageGetter';
import {
  SEASONAL_GAME_OPTIONS_ES, SEASONAL_GAME_OPTIONS_PT,
  PLAYLIST_MOODS_ES, PLAYLIST_MOODS_PT,
  CURATED_PLAYLIST_STRINGS_ES, CURATED_PLAYLIST_STRINGS_PT,
  TRUTH_OR_DARE_ES, TRUTH_OR_DARE_PT,
} from '@/i18n/translatedSeasonal';

// ============================================
// SEASONAL GAME OPTIONS (localized)
// ============================================

const _SEASONAL_GAME_OPTIONS_EN: Record<SeasonalGameAction, SeasonalGameOption> = {
  truth_or_dare: {
    id: 'truth_or_dare',
    emoji: '🎲',
    title: 'Truth or Dare',
    description: 'Flirty prompts that match the season vibe',
  },
  date_night: {
    id: 'date_night',
    emoji: '🌙',
    title: 'Date Night Generator',
    description: 'Curated evening flow for connection and fun',
  },
  challenge: {
    id: 'challenge',
    emoji: '🎯',
    title: 'Seasonal Challenge',
    description: 'Goal-based activity for playful progression',
  },
  spin: {
    id: 'spin',
    emoji: '🎰',
    title: 'Spin Surprise',
    description: 'Quick randomizer for spontaneous inspiration',
  },
};

export const SEASONAL_GAME_OPTIONS = createLocalizedRecordProxy<
  Record<SeasonalGameAction, SeasonalGameOption>
>({
  en: _SEASONAL_GAME_OPTIONS_EN,
  es: SEASONAL_GAME_OPTIONS_ES as Record<SeasonalGameAction, SeasonalGameOption>,
  pt: SEASONAL_GAME_OPTIONS_PT as Record<SeasonalGameAction, SeasonalGameOption>,
  hi: _SEASONAL_GAME_OPTIONS_EN,
});

// ============================================
// SEASONAL THEMES (locale-aware by language + cultural market)
// ============================================

const createTheme = (
  id: string,
  name: string,
  emoji: string,
  description: string,
  color: string,
  startMonth: number,
  endMonth: number,
  positions: number[],
  foreplay: number[],
  oral: number[],
  roleplay: number[],
  games: SeasonalGameAction[],
  tips: string[],
): SeasonalTheme => ({
  id,
  name,
  emoji,
  description,
  color,
  startMonth,
  endMonth,
  positions,
  foreplay,
  oral,
  roleplay,
  games,
  tips,
});

const _SEASONAL_THEMES_EN: SeasonalTheme[] = [
  createTheme(
    'newyear_reset',
    "New Year's Reset",
    '🎆',
    'Fresh starts, bold intentions, and a playful first chapter',
    '#a855f7',
    1,
    1,
    [3, 8, 13, 19, 24],
    [102, 103, 106, 110],
    [202, 206, 208, 211],
    [401, 406, 414],
    ['challenge', 'spin', 'truth_or_dare'],
    ['Make one playful relationship resolution together', 'Plan a midnight-style countdown kiss even if it is not midnight', 'Pick one new thing to try this month', 'Treat tonight like a soft reset, not a performance'],
  ),
  createTheme(
    'valentines',
    "Valentine's Day",
    '💕',
    'Romantic connection, sweeter rituals, and a little extra heat',
    '#ec4899',
    2,
    2,
    [1, 5, 8, 12, 18],
    [101, 103, 106, 110],
    [201, 202, 205, 206],
    [401, 403, 404],
    ['date_night', 'truth_or_dare', 'challenge'],
    ['Set out flowers, candles, or one small indulgence', 'Read each other one short compliment before starting', 'Choose one thing to do more slowly tonight', 'Leave a note where your partner will find it later'],
  ),
  createTheme(
    'spring_break',
    'Spring Break Energy',
    '🌼',
    'Fresh-air romance, lighter moods, and spontaneous date-night momentum',
    '#84cc16',
    3,
    5,
    [3, 7, 11, 15, 22],
    [104, 105, 107, 112],
    [204, 206, 211, 212],
    [406, 410, 415],
    ['date_night', 'spin', 'challenge'],
    ['Open the windows and reset the room first', 'Go for a daytime flirt before the evening plan', 'Treat this season like permission to try one new ritual', 'Keep the mood light, curious, and easy to start'],
  ),
  createTheme(
    'summer_escape',
    'Summer Escape',
    '☀️',
    'Long evenings, playful chemistry, and getaway-style spontaneity',
    '#f59e0b',
    6,
    8,
    [4, 9, 14, 20, 25],
    [102, 108, 109, 111],
    [203, 207, 208, 210],
    [407, 411, 416],
    ['spin', 'truth_or_dare', 'challenge'],
    ['Plan something that feels like a mini staycation', 'Use temperature, fresh sheets, or a late-night shower to change the mood', 'Keep the plan playful rather than over-scripted', 'Let the evening start outdoors if you can'],
  ),
  createTheme(
    'halloween_nights',
    'Halloween Nights',
    '🎃',
    'Costume energy, playful mystery, and bolder flirting',
    '#ea580c',
    10,
    10,
    [2, 6, 10, 16, 21],
    [101, 104, 106, 108],
    [201, 204, 206, 212],
    [402, 408, 412],
    ['date_night', 'truth_or_dare', 'spin'],
    ['Lean into mystery, not pressure', 'Pick one small costume detail or role to play with', 'Make eye contact part of the game', 'Let one dare lead the evening instead of planning everything'],
  ),
  createTheme(
    'holiday_season',
    'Holiday Season',
    '🕯️',
    'Warm closeness, cozy rituals, and soft end-of-year romance',
    '#3b82f6',
    11,
    12,
    [1, 5, 8, 12, 17],
    [101, 105, 108, 112],
    [201, 205, 209, 212],
    [403, 405, 409],
    ['date_night', 'challenge', 'truth_or_dare'],
    ['Keep the lights softer than usual', 'Turn one evening into a no-phone night', 'Use blankets, warmth, and slower pacing to your advantage', 'End with one ritual you would want to repeat all winter'],
  ),
];

const _SEASONAL_THEMES_ES: SeasonalTheme[] = [
  createTheme(
    'ano_nuevo_latam',
    'Año Nuevo en pareja',
    '🎆',
    'Intenciones compartidas, besos de cuenta regresiva y un comienzo con chispa',
    '#a855f7',
    1,
    1,
    [3, 8, 13, 19, 24],
    [102, 103, 106, 110],
    [202, 206, 208, 211],
    [401, 406, 414],
    ['challenge', 'spin', 'truth_or_dare'],
    ['Compartan una intención amorosa para el mes', 'Hagan su propia cuenta regresiva y bésense al final', 'Estrenen una idea nueva juntos', 'Que la noche se sienta como una página en blanco bonita'],
  ),
  createTheme(
    'san_valentin',
    'San Valentín',
    '💕',
    'Romance, detalle y pasión con energía de celebración',
    '#ec4899',
    2,
    2,
    [1, 5, 8, 12, 18],
    [101, 103, 106, 110],
    [201, 202, 205, 206],
    [401, 403, 404],
    ['date_night', 'truth_or_dare', 'challenge'],
    ['Dejen una nota corta y cariñosa antes de empezar', 'Preparen una pequeña sorpresa visual o sensorial', 'Hagan algo un poco más lento de lo habitual', 'Combinen ternura con una pizca de atrevimiento'],
  ),
  createTheme(
    'semana_santa',
    'Semana Santa y escapadas suaves',
    '🌿',
    'Tiempo compartido, descanso y conexión con aire de pausa',
    '#84cc16',
    3,
    4,
    [3, 7, 11, 15, 22],
    [104, 105, 107, 112],
    [204, 206, 211, 212],
    [406, 410, 415],
    ['date_night', 'spin', 'challenge'],
    ['Bajen el ritmo antes de subir la tensión', 'Aprovechen el tiempo libre para un ritual nuevo', 'Empiecen con ternura y dejen que la curiosidad marque el paso', 'Hagan que la habitación se sienta distinta, aunque no salgan de casa'],
  ),
  createTheme(
    'verano_latino',
    'Verano latino',
    '☀️',
    'Noches largas, piel más despierta y planes con sabor a escapada',
    '#f59e0b',
    5,
    8,
    [4, 9, 14, 20, 25],
    [102, 108, 109, 111],
    [203, 207, 208, 210],
    [407, 411, 416],
    ['spin', 'truth_or_dare', 'challenge'],
    ['Empiecen con música y algo frío para beber', 'Usen el calor a favor, sin apresurarse', 'Hagan una mini cita de balcón, patio o ventana abierta', 'Piensen en aventura, no en perfección'],
  ),
  createTheme(
    'fiestas_patrias',
    'Fiestas Patrias',
    '🎉',
    'Celebración, alegría y una noche para sentirse más unidos',
    '#ea580c',
    9,
    10,
    [2, 6, 10, 16, 21],
    [101, 104, 106, 108],
    [201, 204, 206, 212],
    [402, 408, 412],
    ['date_night', 'truth_or_dare', 'spin'],
    ['Que la celebración siga después de volver a casa', 'Tomen algo divertido del ambiente festivo y háganlo íntimo', 'Cuiden el humor ligero y la complicidad', 'Una sola canción puede convertirse en toda la noche'],
  ),
  createTheme(
    'dia_de_muertos_nochevieja',
    'De Día de Muertos a Nochevieja',
    '🕯️',
    'Recuerdos, cercanía y rituales íntimos para cerrar el año',
    '#3b82f6',
    11,
    12,
    [1, 5, 8, 12, 17],
    [101, 105, 108, 112],
    [201, 205, 209, 212],
    [403, 405, 409],
    ['date_night', 'challenge', 'truth_or_dare'],
    ['Hablen de un recuerdo favorito antes de tocarse', 'Prendan una vela o bajen la luz para cambiar el tono', 'Hagan un plan suave para cerrar el día juntos', 'Terminen la noche con un gesto que quieran repetir el próximo año'],
  ),
];

const _SEASONAL_THEMES_PT: SeasonalTheme[] = [
  createTheme(
    'verao_brasil',
    'Verão brasileiro',
    '🌴',
    'Calor leve, clima solto e conexão com cara de férias',
    '#06b6d4',
    1,
    1,
    [4, 9, 14, 20, 25],
    [102, 108, 109, 111],
    [203, 207, 208, 210],
    [407, 411, 416],
    ['spin', 'truth_or_dare', 'challenge'],
    ['Comecem com banho, música ou roupa leve', 'Tratem a noite como uma escapada curta', 'A ideia é fluir, não impressionar', 'Deixem o calor ajudar o ritmo'],
  ),
  createTheme(
    'carnaval',
    'Clima de Carnaval',
    '🎭',
    'Fantasia, ousadia divertida e energia de festa a dois',
    '#ec4899',
    2,
    3,
    [2, 6, 10, 16, 21],
    [101, 104, 106, 108],
    [201, 204, 206, 212],
    [402, 408, 412],
    ['truth_or_dare', 'spin', 'challenge'],
    ['Brinquem com um acessório, um personagem ou uma regra leve', 'Mantenham a vibe provocante, não exagerada', 'Escolham uma trilha com energia de festa', 'Façam da brincadeira a melhor parte do começo'],
  ),
  createTheme(
    'outono_a_dois',
    'Outono a dois',
    '🍁',
    'Mais presença, mais aconchego e menos pressa',
    '#84cc16',
    4,
    5,
    [3, 7, 11, 15, 22],
    [104, 105, 107, 112],
    [204, 206, 211, 212],
    [406, 410, 415],
    ['date_night', 'spin', 'challenge'],
    ['Desacelerem antes de decidir o que vem depois', 'Criem um clima calmo e íntimo em casa', 'Aproveitem para testar um ritual novo', 'Deixem a noite crescer no ritmo de vocês'],
  ),
  createTheme(
    'dia_dos_namorados',
    'Dia dos Namorados',
    '💘',
    'Romance brasileiro, bilhetes carinhosos e um toque de calor',
    '#f59e0b',
    6,
    6,
    [1, 5, 8, 12, 18],
    [101, 103, 106, 110],
    [201, 202, 205, 206],
    [401, 403, 404],
    ['date_night', 'truth_or_dare', 'challenge'],
    ['Escrevam uma frase que só faça sentido para vocês dois', 'Caprichem em um detalhe, não em dez', 'Façam da gentileza parte da sedução', 'Deem espaço para um beijo mais lento que o normal'],
  ),
  createTheme(
    'inverno_carinhoso',
    'Inverno carinhoso',
    '🧣',
    'Cobertor, corpo perto e uma noite com cara de refúgio',
    '#3b82f6',
    7,
    8,
    [1, 5, 8, 12, 17],
    [101, 105, 108, 112],
    [201, 205, 209, 212],
    [403, 405, 409],
    ['date_night', 'challenge', 'truth_or_dare'],
    ['Usem o frio como desculpa para ficarem mais perto', 'Banho quente ou cobertor mudam tudo', 'Façam menos coisas, mas com mais presença', 'Terminem com aftercare e demora boa'],
  ),
  createTheme(
    'primavera_brasil',
    'Primavera no Brasil',
    '🌺',
    'Leveza, renovação e vontade de experimentar algo novo',
    '#22c55e',
    9,
    11,
    [3, 8, 13, 19, 24],
    [102, 103, 106, 110],
    [202, 206, 208, 211],
    [401, 406, 414],
    ['challenge', 'spin', 'truth_or_dare'],
    ['Abram a janela e deixem o ambiente respirar', 'Escolham uma ideia nova, mas fácil de começar', 'Tratem a curiosidade como parte do romance', 'Misturem carinho, humor e um pequeno risco divertido'],
  ),
  createTheme(
    'reveillon',
    'Réveillon a dois',
    '🥂',
    'Virada de ano, energia nova e promessas que começam na pele',
    '#a855f7',
    12,
    12,
    [3, 8, 13, 19, 24],
    [102, 103, 106, 110],
    [202, 206, 208, 211],
    [401, 406, 414],
    ['challenge', 'spin', 'truth_or_dare'],
    ['Criem uma pequena tradição só de vocês', 'Façam uma contagem regressiva mesmo que já tenha passado da meia-noite', 'Escolham um desejo para o ano novo e deem o primeiro passo hoje', 'Fechem a noite com um gesto que valha repetir'],
  ),
];

const _SEASONAL_THEMES_HI: SeasonalTheme[] = [
  createTheme(
    'makar_sankranti',
    'मकर संक्रांति',
    '🪁',
    'नई धूप, हल्का उत्साह, और एक साथ कुछ नया शुरू करने का मौसम',
    '#f59e0b',
    1,
    1,
    [3, 8, 13, 19, 24],
    [102, 103, 106, 110],
    [202, 206, 208, 211],
    [401, 406, 414],
    ['challenge', 'spin', 'truth_or_dare'],
    ['शाम की शुरुआत एक मीठे इशारे से करें', 'आज एक नया छोटा-सा कपल रिवाज़ बनाइए', 'धीरे शुरू करें और जिज्ञासा को जगह दें', 'हल्की-सी शरारत को बातचीत का हिस्सा बनाइए'],
  ),
  createTheme(
    'basant_panchami',
    'बसंत पंचमी',
    '🌼',
    'ताज़गी, नरम रोमांस और हल्के मूड में जुड़ने का समय',
    '#84cc16',
    2,
    2,
    [1, 5, 8, 12, 18],
    [101, 103, 106, 110],
    [201, 202, 205, 206],
    [401, 403, 404],
    ['date_night', 'truth_or_dare', 'challenge'],
    ['कमरे में थोड़ा रंग या खुशबू जोड़ें', 'एक-दूसरे को एक छोटा-सा नोट लिखें', 'आज की रात को हल्की और खिली हुई रखें', 'कोमलता और छेड़छाड़ का संतुलन बनाइए'],
  ),
  createTheme(
    'holi',
    'होली',
    '🎨',
    'रंग, हँसी, और playful energy से भरी हुई नज़दीकी',
    '#ec4899',
    3,
    3,
    [2, 6, 10, 16, 21],
    [101, 104, 106, 108],
    [201, 204, 206, 212],
    [402, 408, 412],
    ['truth_or_dare', 'spin', 'challenge'],
    ['मज़ाक को सहमति और कोमलता के साथ रखें', 'शाम में रंगों की जगह मूड और संगीत को आने दें', 'एक playful dare से शुरुआत करें', 'हँसी को foreplay का हिस्सा बनने दें'],
  ),
  createTheme(
    'monsoon_magic',
    'मानसून मैजिक',
    '🌧️',
    'बरसाती मौसम, धीमी नज़दीकी, और घर के अंदर की गर्माहट',
    '#3b82f6',
    7,
    9,
    [1, 5, 8, 12, 17],
    [101, 105, 108, 112],
    [201, 205, 209, 212],
    [403, 405, 409],
    ['date_night', 'challenge', 'truth_or_dare'],
    ['बारिश की आवाज़ को बैकग्राउंड बनने दें', 'चाय, कंबल, या गर्म शॉवर से मूड बदलें', 'धीमा, आरामदायक, और करीब रहने वाला प्लान चुनें', 'रात को जल्दी मत कीजिए'],
  ),
  createTheme(
    'karva_chauth',
    'करवा चौथ',
    '🌙',
    'रिवाज़, इरादा, और शाम को खास बनाने वाली भावनात्मक नज़दीकी',
    '#a855f7',
    10,
    10,
    [3, 7, 11, 15, 22],
    [104, 105, 107, 112],
    [204, 206, 211, 212],
    [406, 410, 415],
    ['date_night', 'spin', 'challenge'],
    ['धीरे और सम्मान के साथ शाम का स्वर सेट करें', 'एक-दूसरे के लिए gratitude बोलें', 'रोमांस को gesture-led रखें, performance-led नहीं', 'रात को intention और softness से भरें'],
  ),
  createTheme(
    'diwali',
    'दीवाली',
    '🪔',
    'रोशनी, उत्सव, और घर के भीतर की निजी चमक',
    '#f97316',
    11,
    11,
    [4, 9, 14, 20, 25],
    [102, 108, 109, 111],
    [203, 207, 208, 210],
    [407, 411, 416],
    ['spin', 'truth_or_dare', 'challenge'],
    ['नरम रोशनी को mood setter बनाइए', 'शाम में एक surprise element जोड़ें', 'उत्सव के बाद की quiet connection को जगह दें', 'मीठेपन और flirtiness को साथ रखें'],
  ),
  createTheme(
    'winter_wedding_season',
    'वेडिंग सीज़न रोमांस',
    '✨',
    'सजे हुए माहौल, मिलना-जुलना, और बाद में अपनी निजी chemistry',
    '#8b5cf6',
    12,
    12,
    [4, 9, 14, 20, 25],
    [102, 108, 109, 111],
    [203, 207, 208, 210],
    [407, 411, 416],
    ['spin', 'truth_or_dare', 'challenge'],
    ['किसी celebration energy को अपने लिए reclaim करें', 'तैयार होने के mood को playful बनाइए', 'रात खत्म होने से पहले एक soft reconnect moment तय करें', 'बाहरी शोर के बाद अपनी private vibe बनाइए'],
  ),
];

export const SEASONAL_THEMES = createLocalizedArrayProxy<SeasonalTheme>({
  en: _SEASONAL_THEMES_EN,
  es: _SEASONAL_THEMES_ES,
  pt: _SEASONAL_THEMES_PT,
  hi: _SEASONAL_THEMES_HI,
});

export function getCurrentSeason(): SeasonalTheme | null {
  const month = new Date().getMonth() + 1;
  return SEASONAL_THEMES.find(s =>
    s.startMonth <= s.endMonth
      ? month >= s.startMonth && month <= s.endMonth
      : month >= s.startMonth || month <= s.endMonth
  ) || null;
}

// ============================================
// TRUTH OR DARE CONTENT (localized)
// ============================================

const _TRUTH_OR_DARE_EN: TruthOrDareItem[] = [
  // MILD TRUTHS
  { id: 1, type: 'truth', intensity: 'mild', text: "What was the exact moment you first realized you were attracted to me?" },
  { id: 2, type: 'truth', intensity: 'mild', text: "What's one small habit of mine that secretly turns you on?" },
  { id: 3, type: 'truth', intensity: 'mild', text: "What's the most romantic non-sexual thing I've done for you?" },
  { id: 4, type: 'truth', intensity: 'mild', text: "When did you first fantasize about kissing me?" },
  { id: 5, type: 'truth', intensity: 'mild', text: "What song always makes you think of me in a romantic way?" },
  { id: 6, type: 'truth', intensity: 'mild', text: "What's one thing about my personality you find especially attractive?" },
  { id: 7, type: 'truth', intensity: 'mild', text: "What's your favorite outfit on me lately?" },
  { id: 8, type: 'truth', intensity: 'mild', text: "What's one compliment from me you still remember?" },
  { id: 9, type: 'truth', intensity: 'mild', text: "What kind of kiss from me lingers in your mind the longest?" },
  { id: 10, type: 'truth', intensity: 'mild', text: "What's your favorite lazy-together moment?" },
  { id: 11, type: 'truth', intensity: 'mild', text: "Rate our last kiss out of 10. What would make it an 11?" },
  { id: 12, type: 'truth', intensity: 'mild', text: "What's the flirtiest thought you've had about me in public?" },
  { id: 13, type: 'truth', intensity: 'mild', text: "What part of my body do you secretly stare at the most?" },
  { id: 14, type: 'truth', intensity: 'mild', text: "When was the last time you got turned on just by looking at me?" },
  { id: 15, type: 'truth', intensity: 'mild', text: "What's one thing you want to try with me but haven't asked yet?" },
  { id: 16, type: 'truth', intensity: 'mild', text: "If we had only 5 minutes alone, how would you seduce me?" },
  // MEDIUM TRUTHS
  { id: 17, type: 'truth', intensity: 'medium', text: "What's one habit of mine that instantly gets your attention?" },
  { id: 18, type: 'truth', intensity: 'medium', text: "What piece of my clothing do you find unreasonably attractive?" },
  { id: 19, type: 'truth', intensity: 'medium', text: "What's the naughtiest thought you've had about me in public?" },
  { id: 20, type: 'truth', intensity: 'medium', text: "What's one thing I do during a kiss that you want more of?" },
  { id: 21, type: 'truth', intensity: 'medium', text: "What outfit makes you want to cancel our plans and stay in?" },
  { id: 22, type: 'truth', intensity: 'medium', text: "What's one place you'd love an extra-long kiss from me?" },
  { id: 23, type: 'truth', intensity: 'medium', text: "What playful dare would you secretly hope I pick for you?" },
  { id: 24, type: 'truth', intensity: 'medium', text: "What role-play vibe would you be curious to explore together?" },
  { id: 25, type: 'truth', intensity: 'medium', text: "What part of our chemistry feels strongest lately?" },
  { id: 26, type: 'truth', intensity: 'medium', text: "What's one way I could tease you better?" },
  { id: 27, type: 'truth', intensity: 'medium', text: "What's a flirty text you'd love to get from me tonight?" },
  { id: 28, type: 'truth', intensity: 'medium', text: "What's one thing I do that builds tension fast?" },
  { id: 29, type: 'truth', intensity: 'medium', text: "What does a private weekend with me look like in your head?" },
  { id: 30, type: 'truth', intensity: 'medium', text: "What kind of first move from me works every time?" },
  { id: 31, type: 'truth', intensity: 'medium', text: "What would be your perfect 'meet me later' message from me?" },
  { id: 32, type: 'truth', intensity: 'medium', text: "What kind of touch from me makes you melt fastest?" },
  // SPICY TRUTHS
  { id: 33, type: 'truth', intensity: 'spicy', text: "What's the boldest kiss you'd want from me tonight?" },
  { id: 34, type: 'truth', intensity: 'spicy', text: "What's one fantasy-friendly idea you'd actually try with me?" },
  { id: 35, type: 'truth', intensity: 'spicy', text: "What scene would you most want us to recreate from a movie?" },
  { id: 36, type: 'truth', intensity: 'spicy', text: "If you could plan the mood for tonight, what would you choose first?" },
  { id: 37, type: 'truth', intensity: 'spicy', text: "What's one place you'd want my lips to linger a little longer?" },
  { id: 38, type: 'truth', intensity: 'spicy', text: "What's one thing I do that makes you lose your train of thought?" },
  { id: 39, type: 'truth', intensity: 'spicy', text: "What kind of slow tease works best on you?" },
  { id: 40, type: 'truth', intensity: 'spicy', text: "What's one bolder move you'd trust me to try?" },
  { id: 41, type: 'truth', intensity: 'spicy', text: "What kind of praise from me lands best when we're close?" },
  { id: 42, type: 'truth', intensity: 'spicy', text: "What's the hottest almost-moment we've had lately?" },
  { id: 43, type: 'truth', intensity: 'spicy', text: "If I told you to take the lead tonight, what would you do first?" },
  { id: 44, type: 'truth', intensity: 'spicy', text: "What's one secret wish you'd finally tell me tonight?" },
  // WILD TRUTHS
  { id: 45, type: 'truth', intensity: 'wild', text: "If we had a whole evening alone with no interruptions, what would you want first?" },
  { id: 46, type: 'truth', intensity: 'wild', text: "What's one daring move you want on your Blisse bucket list?" },
  { id: 47, type: 'truth', intensity: 'wild', text: "If I gave you total control for one minute, how would you use it?" },
  { id: 48, type: 'truth', intensity: 'wild', text: "What's one playful rule you'd love us to break on a private weekend away?" },
  // MILD DARES
  { id: 101, type: 'dare', intensity: 'mild', text: "Give me the softest, slowest forehead kiss possible for 30 seconds." },
  { id: 102, type: 'dare', intensity: 'mild', text: "Hold eye contact with me for 45 seconds." },
  { id: 103, type: 'dare', intensity: 'mild', text: "Whisper something you love about my personality in my ear very slowly." },
  { id: 104, type: 'dare', intensity: 'mild', text: "Trace my collarbone with one fingertip for 20 seconds." },
  { id: 105, type: 'dare', intensity: 'mild', text: "Send me a voice note saying one thing you're grateful for about us." },
  { id: 106, type: 'dare', intensity: 'mild', text: "Hold my hand and lead me in a 30-second slow dance." },
  { id: 107, type: 'dare', intensity: 'mild', text: "Give me a 20-second hug with no talking." },
  { id: 108, type: 'dare', intensity: 'mild', text: "Give me three compliments without repeating yourself." },
  { id: 109, type: 'dare', intensity: 'mild', text: "Brush your lips against my cheek and then stop." },
  { id: 110, type: 'dare', intensity: 'mild', text: "Rest your head on my shoulder for one full minute." },
  { id: 111, type: 'dare', intensity: 'mild', text: "Kiss the back of my hand like we're in a movie." },
  { id: 112, type: 'dare', intensity: 'mild', text: "Trace a heart on my back and let me guess it." },
  { id: 113, type: 'dare', intensity: 'mild', text: "Pick our next song and make me sway with you." },
  { id: 114, type: 'dare', intensity: 'mild', text: "Play with my hair for 30 seconds like you missed me." },
  { id: 115, type: 'dare', intensity: 'mild', text: "Tell me exactly how you'd flirt with me on a first date." },
  { id: 116, type: 'dare', intensity: 'mild', text: "Give me one 'meet me later' look with zero words." },
  // MEDIUM DARES
  { id: 117, type: 'dare', intensity: 'medium', text: "Give me a 15-second shoulder or neck massage using only your lips." },
  { id: 118, type: 'dare', intensity: 'medium', text: "Blindfold yourself and guess what part of me is touching you, three tries." },
  { id: 119, type: 'dare', intensity: 'medium', text: "Text me a very flirty but PG-13 message as if we just matched." },
  { id: 120, type: 'dare', intensity: 'medium', text: "Kiss my neck for 30 seconds, no hands." },
  { id: 121, type: 'dare', intensity: 'medium', text: "Undress down to a comfortable layer while maintaining eye contact." },
  { id: 122, type: 'dare', intensity: 'medium', text: "Give me a slow, teasing upper-thigh kiss and stop early." },
  { id: 123, type: 'dare', intensity: 'medium', text: "Let me guide your hand across my waist and back for 30 seconds." },
  { id: 124, type: 'dare', intensity: 'medium', text: "Blindfold me and kiss any part of my body except my lips, three kisses." },
  { id: 125, type: 'dare', intensity: 'medium', text: "Sit on my lap facing me and sway slowly for 30 seconds." },
  { id: 126, type: 'dare', intensity: 'medium', text: "Recreate the most dramatic movie kiss scene you can think of." },
  { id: 127, type: 'dare', intensity: 'medium', text: "Speak only in terrible pickup lines for the next three turns." },
  { id: 128, type: 'dare', intensity: 'medium', text: "Try to compliment me using only food metaphors for 30 seconds." },
  { id: 129, type: 'dare', intensity: 'medium', text: "Give me your best sexy dance move to a ridiculous song." },
  { id: 130, type: 'dare', intensity: 'medium', text: "Act out your best slow-motion 'come here' move." },
  { id: 131, type: 'dare', intensity: 'medium', text: "Trace one line from my wrist to my shoulder with your lips." },
  { id: 132, type: 'dare', intensity: 'medium', text: "Let me pick the next dare you do, no negotiating." },
  // SPICY DARES
  { id: 133, type: 'dare', intensity: 'spicy', text: "Remove one outer layer and then kiss me for 20 seconds." },
  { id: 134, type: 'dare', intensity: 'spicy', text: "Kiss along my neck and collarbone for 30 seconds." },
  { id: 135, type: 'dare', intensity: 'spicy', text: "Let me guide your wrists while we kiss for 20 seconds." },
  { id: 136, type: 'dare', intensity: 'spicy', text: "Give me a lap dance for 30 seconds, music optional." },
  { id: 137, type: 'dare', intensity: 'spicy', text: "Use an ice cube to trace a slow line down my arm or shoulder." },
  { id: 138, type: 'dare', intensity: 'spicy', text: "Straddle my lap fully clothed and hold eye contact for 20 seconds." },
  { id: 139, type: 'dare', intensity: 'spicy', text: "Let me choose exactly where your next three kisses land." },
  { id: 140, type: 'dare', intensity: 'spicy', text: "Whisper what you want from me tonight without saying anything explicit." },
  { id: 141, type: 'dare', intensity: 'spicy', text: "Give me a slow kiss, pull away, and make me ask for another." },
  { id: 142, type: 'dare', intensity: 'spicy', text: "Let me blindfold you while I give you three teasing kisses." },
  { id: 143, type: 'dare', intensity: 'spicy', text: "Recreate your best 'we shouldn't be doing this' movie moment." },
  { id: 144, type: 'dare', intensity: 'spicy', text: "Tell me 'later' with your body language, not words." },
  // WILD DARES
  { id: 145, type: 'dare', intensity: 'wild', text: "Let your partner choose truth or dare for your next turn, no veto." },
  { id: 146, type: 'dare', intensity: 'wild', text: "Give a 60-second slow dance that turns into a kiss at the end." },
  { id: 147, type: 'dare', intensity: 'wild', text: "Remove one more layer if you're comfortable and own the moment." },
  { id: 148, type: 'dare', intensity: 'wild', text: "Let your partner direct your next 30 seconds of flirting." },
  { id: 149, type: 'dare', intensity: 'wild', text: "Do a dramatic countdown-to-kiss scene and stop at the last second." },
  { id: 150, type: 'dare', intensity: 'wild', text: "Pick one prompt from Blisse you've been avoiding and add it to tonight's plan." },
];

export const TRUTH_OR_DARE = createLocalizedArrayProxy<TruthOrDareItem>({
  en: _TRUTH_OR_DARE_EN,
  es: TRUTH_OR_DARE_ES,
  pt: TRUTH_OR_DARE_PT,
  hi: _TRUTH_OR_DARE_EN,
});

// ============================================
// MUSIC PLAYLIST SUGGESTIONS (localized name + description)
// ============================================

const _CURATED_PLAYLISTS_EN: PlaylistLink[] = [
  {
    name: "Romantic Evening",
    mood: "romantic",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX50QitC6Oqtn",
    appleMusicUrl: "https://music.apple.com/us/playlist/romantic-evening/pl.acc464c750b94302b8f6c92b5f43edef",
    description: "Soft, intimate tracks for slow, romantic moments",
  },
  {
    name: "Sensual & Slow",
    mood: "sensual",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DWXqpDKK4ed9O",
    appleMusicUrl: "https://music.apple.com/us/playlist/r-b-slow-jams/pl.451f921fe7484d48bae203f7f0a3cc2e",
    description: "R&B slow jams for passionate connection",
  },
  {
    name: "After Dark",
    mood: "passionate",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO",
    appleMusicUrl: "https://music.apple.com/us/playlist/late-night-vibes/pl.6b3e2a7eb16e4c4a9d3b8a2c1f4e5d6a",
    description: "Sultry, late-night vibes",
  },
  {
    name: "Chill & Intimate",
    mood: "relaxed",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX2UgsUIg75Vg",
    appleMusicUrl: "https://music.apple.com/us/playlist/chill-vibes/pl.2b0f1c3d4e5f6a7b8c9d0e1f2a3b4c5d",
    description: "Mellow beats for relaxed intimacy",
  },
  {
    name: "Spicy Latin",
    mood: "playful",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX10zKzsJ2jva",
    appleMusicUrl: "https://music.apple.com/us/playlist/latin-heat/pl.7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f",
    description: "Hot Latin rhythms to heat things up",
  },
  {
    name: "Electric Energy",
    mood: "dynamic",
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX4fpCWaHOned",
    appleMusicUrl: "https://music.apple.com/us/playlist/dance-workout/pl.9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
    description: "High-energy tracks for adventurous nights",
  },
];

/** Merge translated name+description into base playlist data. */
function buildLocalizedPlaylists(strings: Array<{ name: string; description: string }>): PlaylistLink[] {
  return _CURATED_PLAYLISTS_EN.map((pl, i) => {
    const t = strings[i];
    return t ? { ...pl, name: t.name, description: t.description } : pl;
  });
}

export const CURATED_PLAYLISTS = createLocalizedArrayProxy<PlaylistLink>({
  en: _CURATED_PLAYLISTS_EN,
  es: buildLocalizedPlaylists(CURATED_PLAYLIST_STRINGS_ES),
  pt: buildLocalizedPlaylists(CURATED_PLAYLIST_STRINGS_PT),
  hi: _CURATED_PLAYLISTS_EN,
});

// ============================================
// USER PLAYLIST TYPES & HELPERS
// ============================================

const _PLAYLIST_MOODS_EN = [
  { id: 'romantic', emoji: '🌹', label: 'Romantic' },
  { id: 'sensual', emoji: '🔥', label: 'Sensual' },
  { id: 'passionate', emoji: '💋', label: 'Passionate' },
  { id: 'relaxed', emoji: '🌊', label: 'Relaxed' },
  { id: 'playful', emoji: '😊', label: 'Playful' },
  { id: 'energetic', emoji: '⚡', label: 'Energetic' },
];

export const PLAYLIST_MOODS = createLocalizedArrayProxy<{ id: string; emoji: string; label: string }>({
  en: _PLAYLIST_MOODS_EN,
  es: PLAYLIST_MOODS_ES,
  pt: PLAYLIST_MOODS_PT,
  hi: _PLAYLIST_MOODS_EN,
});

export const MAX_USER_PLAYLISTS = 10;

export function detectPlatform(url: string): 'spotify' | 'apple' | 'youtube' | 'other' {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('spotify.com') || lowerUrl.includes('spotify:')) return 'spotify';
  if (lowerUrl.includes('music.apple.com') || lowerUrl.includes('itunes.apple.com')) return 'apple';
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || lowerUrl.includes('music.youtube.com')) return 'youtube';
  return 'other';
}

export function getPlatformIcon(platform: string): string {
  switch (platform) {
    case 'spotify': return '🟢';
    case 'apple': return '🍎';
    case 'youtube': return '🔴';
    default: return '🎵';
  }
}

export function getPlatformName(platform: string): string {
  switch (platform) {
    case 'spotify': return 'Spotify';
    case 'apple': return 'Apple Music';
    case 'youtube': return 'YouTube Music';
    default: return 'Music Link';
  }
}
