import { MOOD_PLAYLISTS } from '@/constants/gamification';
import {
  foreplayIdeas,
  massageTechniques,
  oralPlayIdeas,
  positions,
  rolePlayScenarios,
} from '@/content/localizedContent';
import type { ContentType, MoodPlaylist } from '@/types/app';
import type { AppLanguage } from '@/i18n/translations';

export type MoodRefinement = {
  energy?: 'soft' | 'warm' | 'bright';
  texture?: 'close' | 'playful';
  pace?: 'short' | 'unfold';
};

export type MoodSuggestion = {
  type: ContentType;
  item: any;
  score?: number;
  reason: string;
};

type SourceRecommendation = {
  type: string;
  item: any;
  score?: number;
  reason?: string;
};

const CONTENT_BY_TYPE: Record<ContentType, any[]> = {
  foreplay: foreplayIdeas,
  oral: oralPlayIdeas,
  massage: massageTechniques,
  position: positions,
  roleplay: rolePlayScenarios,
};

const HOME_BALANCE: ContentType[] = ['foreplay', 'oral', 'massage', 'position'];
const SESSION_BALANCE: ContentType[] = ['foreplay', 'oral', 'massage', 'position'];

const MOOD_LINES: Record<AppLanguage, Record<string, { why: string; how: string; short: string; unfold: string; playful: string; close: string }>> = {
  en: {
    unified: { why: 'This keeps you close, warm, and in the same little world.', how: 'Let it be slow. Stay with the parts that make you both soften.', short: 'Short and sweet is welcome here.', unfold: 'Let it unfold if it starts to feel good.', playful: 'Keep it light enough to smile through.', close: 'Stay close enough to read each other easily.' },
    passionate: { why: 'This fits a hotter mood without turning it into a performance.', how: 'Keep it simple, direct, and easy to change if the heat shifts.', short: 'Short and sweet is welcome here.', unfold: 'Let it unfold if it starts to feel good.', playful: 'Keep it light enough to smile through.', close: 'Stay close enough to read each other easily.' },
    playful: { why: 'This gives the room a little mischief without making anything serious.', how: 'Laugh if it gets silly. That is part of the charm.', short: 'Short and sweet is welcome here.', unfold: 'Let it unfold if it starts to feel good.', playful: 'Keep it light enough to smile through.', close: 'Stay close enough to read each other easily.' },
    dynamic: { why: 'This brings something fresh while keeping one foot in comfort.', how: 'Try the spark, then keep only what feels good tonight.', short: 'Short and sweet is welcome here.', unfold: 'Let it unfold if it starts to feel good.', playful: 'Keep it light enough to smile through.', close: 'Stay close enough to read each other easily.' },
    flowing: { why: 'This belongs to a soft, unhurried kind of night.', how: 'No need to rush. Let the mood find its own pace.', short: 'Short and sweet is welcome here.', unfold: 'Let it unfold if it starts to feel good.', playful: 'Keep it light enough to smile through.', close: 'Stay close enough to read each other easily.' },
    grounded: { why: 'This feels steady, familiar, and easy to settle into.', how: 'Keep it close and comfortable. Small shifts are enough.', short: 'Short and sweet is welcome here.', unfold: 'Let it unfold if it starts to feel good.', playful: 'Keep it light enough to smile through.', close: 'Stay close enough to read each other easily.' },
    commanding: { why: 'This suits a more led, confident mood while staying warm.', how: 'Let one of you take the lead, and keep it playful enough to change.', short: 'Short and sweet is welcome here.', unfold: 'Let it unfold if it starts to feel good.', playful: 'Keep it light enough to smile through.', close: 'Stay close enough to read each other easily.' },
    blossoming: { why: 'This opens the night gently, with curiosity instead of pressure.', how: 'Start small. Let the brave part arrive when it wants to.', short: 'Short and sweet is welcome here.', unfold: 'Let it unfold if it starts to feel good.', playful: 'Keep it light enough to smile through.', close: 'Stay close enough to read each other easily.' },
  },
  es: {
    unified: { why: 'Esto los mantiene cerca, cálidos y en el mismo mundo pequeño.', how: 'Déjenlo ir lento. Quédense en lo que los suaviza.', short: 'Corto y rico también vale.', unfold: 'Dejen que se despliegue si empieza a sentirse bien.', playful: 'Manténganlo ligero, con espacio para sonreír.', close: 'Quédense lo bastante cerca para leerse fácil.' },
    passionate: { why: 'Esto va con una vibra más caliente sin volverla una actuación.', how: 'Simple, directo y fácil de cambiar si el calor se mueve.', short: 'Corto y rico también vale.', unfold: 'Dejen que se despliegue si empieza a sentirse bien.', playful: 'Manténganlo ligero, con espacio para sonreír.', close: 'Quédense lo bastante cerca para leerse fácil.' },
    playful: { why: 'Esto le da a la noche un poco de travesura sin ponerla seria.', how: 'Ríanse si se pone tonto. También es parte del encanto.', short: 'Corto y rico también vale.', unfold: 'Dejen que se despliegue si empieza a sentirse bien.', playful: 'Manténganlo ligero, con espacio para sonreír.', close: 'Quédense lo bastante cerca para leerse fácil.' },
    dynamic: { why: 'Esto trae algo fresco sin soltar del todo lo cómodo.', how: 'Prueben la chispa y quédense solo con lo que se siente bien.', short: 'Corto y rico también vale.', unfold: 'Dejen que se despliegue si empieza a sentirse bien.', playful: 'Manténganlo ligero, con espacio para sonreír.', close: 'Quédense lo bastante cerca para leerse fácil.' },
    flowing: { why: 'Esto pertenece a una noche suave y sin apuro.', how: 'No hace falta correr. Dejen que la vibra encuentre su ritmo.', short: 'Corto y rico también vale.', unfold: 'Dejen que se despliegue si empieza a sentirse bien.', playful: 'Manténganlo ligero, con espacio para sonreír.', close: 'Quédense lo bastante cerca para leerse fácil.' },
    grounded: { why: 'Esto se siente estable, familiar y fácil de habitar.', how: 'Manténganlo cerca y cómodo. Los cambios pequeños alcanzan.', short: 'Corto y rico también vale.', unfold: 'Dejen que se despliegue si empieza a sentirse bien.', playful: 'Manténganlo ligero, con espacio para sonreír.', close: 'Quédense lo bastante cerca para leerse fácil.' },
    commanding: { why: 'Esto calza con una vibra más segura y llevada, pero cálida.', how: 'Que uno guíe un poco, con espacio para cambiar.', short: 'Corto y rico también vale.', unfold: 'Dejen que se despliegue si empieza a sentirse bien.', playful: 'Manténganlo ligero, con espacio para sonreír.', close: 'Quédense lo bastante cerca para leerse fácil.' },
    blossoming: { why: 'Esto abre la noche con curiosidad, no con presión.', how: 'Empiecen pequeño. Lo valiente puede llegar cuando quiera.', short: 'Corto y rico también vale.', unfold: 'Dejen que se despliegue si empieza a sentirse bien.', playful: 'Manténganlo ligero, con espacio para sonreír.', close: 'Quédense lo bastante cerca para leerse fácil.' },
  },
  pt: {
    unified: { why: 'Isso mantém vocês perto, quentes e no mesmo mundinho.', how: 'Deixem ir devagar. Fiquem no que amolece vocês dois.', short: 'Curto e gostoso também vale.', unfold: 'Deixem acontecer se começar a bater bem.', playful: 'Mantenham leve o bastante pra sorrir.', close: 'Fiquem perto o suficiente pra se lerem fácil.' },
    passionate: { why: 'Isso combina com uma vibe mais quente sem virar performance.', how: 'Simples, direto e fácil de mudar se o calor mudar.', short: 'Curto e gostoso também vale.', unfold: 'Deixem acontecer se começar a bater bem.', playful: 'Mantenham leve o bastante pra sorrir.', close: 'Fiquem perto o suficiente pra se lerem fácil.' },
    playful: { why: 'Isso coloca um pouco de travessura na noite sem pesar.', how: 'Riam se ficar bobo. Isso também é parte do charme.', short: 'Curto e gostoso também vale.', unfold: 'Deixem acontecer se começar a bater bem.', playful: 'Mantenham leve o bastante pra sorrir.', close: 'Fiquem perto o suficiente pra se lerem fácil.' },
    dynamic: { why: 'Isso traz algo fresco sem largar o conforto.', how: 'Provem a faísca e fiquem só com o que bater bem.', short: 'Curto e gostoso também vale.', unfold: 'Deixem acontecer se começar a bater bem.', playful: 'Mantenham leve o bastante pra sorrir.', close: 'Fiquem perto o suficiente pra se lerem fácil.' },
    flowing: { why: 'Isso pertence a uma noite suave e sem pressa.', how: 'Não precisa correr. Deixem a vibe achar o ritmo dela.', short: 'Curto e gostoso também vale.', unfold: 'Deixem acontecer se começar a bater bem.', playful: 'Mantenham leve o bastante pra sorrir.', close: 'Fiquem perto o suficiente pra se lerem fácil.' },
    grounded: { why: 'Isso parece estável, familiar e fácil de entrar.', how: 'Mantenham perto e confortável. Pequenas mudanças bastam.', short: 'Curto e gostoso também vale.', unfold: 'Deixem acontecer se começar a bater bem.', playful: 'Mantenham leve o bastante pra sorrir.', close: 'Fiquem perto o suficiente pra se lerem fácil.' },
    commanding: { why: 'Isso combina com uma vibe mais conduzida, confiante e quente.', how: 'Deixem alguém puxar um pouco, com espaço pra mudar.', short: 'Curto e gostoso também vale.', unfold: 'Deixem acontecer se começar a bater bem.', playful: 'Mantenham leve o bastante pra sorrir.', close: 'Fiquem perto o suficiente pra se lerem fácil.' },
    blossoming: { why: 'Isso abre a noite com curiosidade, não pressão.', how: 'Comecem pequeno. A parte ousada chega quando quiser.', short: 'Curto e gostoso também vale.', unfold: 'Deixem acontecer se começar a bater bem.', playful: 'Mantenham leve o bastante pra sorrir.', close: 'Fiquem perto o suficiente pra se lerem fácil.' },
  },
  hi: {
    unified: { why: 'यह आपको करीब, warm और एक ही छोटी दुनिया में रखता है।', how: 'इसे धीमा रहने दें। जहां दोनों नरम पड़ें, वहीं ठहरें।', short: 'छोटा और sweet भी अच्छा है।', unfold: 'अच्छा लगे तो इसे खुलने दें।', playful: 'इतना हल्का रखें कि मुस्कान बनी रहे।', close: 'इतने करीब रहें कि एक-दूसरे को आसानी से पढ़ सकें।' },
    passionate: { why: 'यह गर्म vibe में फिट बैठता है, बिना performance बनाए।', how: 'Simple, direct और बदलने के लिए आसान रखें।', short: 'छोटा और sweet भी अच्छा है।', unfold: 'अच्छा लगे तो इसे खुलने दें।', playful: 'इतना हल्का रखें कि मुस्कान बनी रहे।', close: 'इतने करीब रहें कि एक-दूसरे को आसानी से पढ़ सकें।' },
    playful: { why: 'यह रात में थोड़ी शरारत लाता है, बिना भारी बनाए।', how: 'अगर silly लगे तो हंस लें। वही charm है।', short: 'छोटा और sweet भी अच्छा है।', unfold: 'अच्छा लगे तो इसे खुलने दें।', playful: 'इतना हल्का रखें कि मुस्कान बनी रहे।', close: 'इतने करीब रहें कि एक-दूसरे को आसानी से पढ़ सकें।' },
    dynamic: { why: 'यह कुछ fresh लाता है, comfort को साथ रखते हुए।', how: 'Spark try करें, फिर वही रखें जो अच्छा लगे।', short: 'छोटा और sweet भी अच्छा है।', unfold: 'अच्छा लगे तो इसे खुलने दें।', playful: 'इतना हल्का रखें कि मुस्कान बनी रहे।', close: 'इतने करीब रहें कि एक-दूसरे को आसानी से पढ़ सकें।' },
    flowing: { why: 'यह नरम, बिना जल्दी वाली रात के लिए है।', how: 'जल्दी की ज़रूरत नहीं। vibe को अपनी pace खोजने दें।', short: 'छोटा और sweet भी अच्छा है।', unfold: 'अच्छा लगे तो इसे खुलने दें।', playful: 'इतना हल्का रखें कि मुस्कान बनी रहे।', close: 'इतने करीब रहें कि एक-दूसरे को आसानी से पढ़ सकें।' },
    grounded: { why: 'यह steady, familiar और easy लगता है।', how: 'इसे करीब और comfortable रखें। छोटे बदलाव काफी हैं।', short: 'छोटा और sweet भी अच्छा है।', unfold: 'अच्छा लगे तो इसे खुलने दें।', playful: 'इतना हल्का रखें कि मुस्कान बनी रहे।', close: 'इतने करीब रहें कि एक-दूसरे को आसानी से पढ़ सकें।' },
    commanding: { why: 'यह ज्यादा confident, led और warm vibe में फिट बैठता है।', how: 'एक को थोड़ा lead करने दें, और बदलने की जगह रखें।', short: 'छोटा और sweet भी अच्छा है।', unfold: 'अच्छा लगे तो इसे खुलने दें।', playful: 'इतना हल्का रखें कि मुस्कान बनी रहे।', close: 'इतने करीब रहें कि एक-दूसरे को आसानी से पढ़ सकें।' },
    blossoming: { why: 'यह रात को curiosity से खोलता है, pressure से नहीं।', how: 'छोटे से शुरू करें। brave हिस्सा अपने समय पर आएगा।', short: 'छोटा और sweet भी अच्छा है।', unfold: 'अच्छा लगे तो इसे खुलने दें।', playful: 'इतना हल्का रखें कि मुस्कान बनी रहे।', close: 'इतने करीब रहें कि एक-दूसरे को आसानी से पढ़ सकें।' },
  },
};

export const getMoodContext = (moodIdOrMood?: string | null): MoodPlaylist | null => {
  if (!moodIdOrMood) return null;
  return MOOD_PLAYLISTS.find((mood) => mood.id === moodIdOrMood || mood.mood === moodIdOrMood) || null;
};

export const getMoodValue = (moodIdOrMood?: string | null): string | null => {
  const mood = getMoodContext(moodIdOrMood);
  return mood?.mood || moodIdOrMood || null;
};

export const getMoodLine = (moodValue?: string | null, language: AppLanguage = 'en') => (
  MOOD_LINES[language]?.[moodValue || ''] || MOOD_LINES.en[moodValue || ''] || MOOD_LINES.en.unified
);

const scoreKey = (type: string, item: any) => `${type}:${Number(item?.id || 0)}`;

const stableItemScore = (type: ContentType, item: any, sourceScores: Map<string, number>): number => {
  const fromSource = sourceScores.get(scoreKey(type, item));
  if (typeof fromSource === 'number') return fromSource;
  const id = Number(item?.id || 0);
  return 40 + ((id * 17 + type.length * 11) % 30);
};

const TYPE_LABELS: Record<AppLanguage, Record<ContentType, string>> = {
  en: { foreplay: 'foreplay', oral: 'touch', massage: 'closeness', position: 'position', roleplay: 'play' },
  es: { foreplay: 'previo', oral: 'toque', massage: 'cercania', position: 'posicion', roleplay: 'juego' },
  pt: { foreplay: 'preliminar', oral: 'toque', massage: 'proximidade', position: 'posicao', roleplay: 'brincadeira' },
  hi: { foreplay: 'foreplay', oral: 'touch', massage: 'closeness', position: 'position', roleplay: 'play' },
};

export const explainMoodSuggestion = (
  moodValue: string | null | undefined,
  type: ContentType,
  refinement?: MoodRefinement,
  language: AppLanguage = 'en'
): string => {
  const line = getMoodLine(moodValue, language);
  const pace = refinement?.pace === 'short'
    ? line.short
    : refinement?.pace === 'unfold'
      ? line.unfold
      : line.how;
  const texture = refinement?.texture === 'playful'
    ? line.playful
    : refinement?.texture === 'close'
      ? line.close
      : pace;

  const typeLabel = TYPE_LABELS[language]?.[type] || TYPE_LABELS.en[type];
  if (language === 'es') return `${line.why}\nPara este ${typeLabel}, ${texture.charAt(0).toLowerCase()}${texture.slice(1)}`;
  if (language === 'pt') return `${line.why}\nPara esse ${typeLabel}, ${texture.charAt(0).toLowerCase()}${texture.slice(1)}`;
  if (language === 'hi') return `${line.why}\nइस ${typeLabel} के लिए, ${texture}`;
  return `${line.why}\nFor this ${typeLabel}, ${texture.charAt(0).toLowerCase()}${texture.slice(1)}`;
};

export const buildMoodBalancedSuggestions = (
  moodIdOrMood: string | null | undefined,
  sourceRecommendations: SourceRecommendation[],
  count = 4,
  refinement?: MoodRefinement,
  language: AppLanguage = 'en'
): MoodSuggestion[] => {
  const moodValue = getMoodValue(moodIdOrMood);
  if (!moodValue) return [];

  const sourceScores = new Map<string, number>();
  sourceRecommendations.forEach((recommendation, index) => {
    sourceScores.set(
      scoreKey(recommendation.type, recommendation.item),
      typeof recommendation.score === 'number' ? recommendation.score : 100 - index
    );
  });

  const selected: MoodSuggestion[] = [];
  const used = new Set<string>();
  const balance: ContentType[] = count <= 4 ? HOME_BALANCE : [...HOME_BALANCE, 'roleplay'];

  balance.forEach((type) => {
    if (selected.length >= count) return;
    const pool = CONTENT_BY_TYPE[type]
      .filter((item) => item?.mood === moodValue)
      .sort((a, b) => stableItemScore(type, b, sourceScores) - stableItemScore(type, a, sourceScores));
    const item = pool.find((candidate) => !used.has(scoreKey(type, candidate)));
    if (!item) return;
    used.add(scoreKey(type, item));
    selected.push({
      type,
      item,
      score: stableItemScore(type, item, sourceScores),
      reason: explainMoodSuggestion(moodValue, type, refinement, language),
    });
  });

  if (selected.length < count) {
    const extras = (Object.keys(CONTENT_BY_TYPE) as ContentType[])
      .flatMap((type) => CONTENT_BY_TYPE[type].map((item) => ({ type, item })))
      .filter(({ item }) => item?.mood === moodValue)
      .sort((a, b) => stableItemScore(b.type, b.item, sourceScores) - stableItemScore(a.type, a.item, sourceScores));

    extras.forEach(({ type, item }) => {
      if (selected.length >= count) return;
      const key = scoreKey(type, item);
      if (used.has(key)) return;
      used.add(key);
      selected.push({
        type,
        item,
        score: stableItemScore(type, item, sourceScores),
        reason: explainMoodSuggestion(moodValue, type, refinement, language),
      });
    });
  }

  return selected;
};

export const buildMoodSessionSteps = (
  mood: MoodPlaylist,
  sourceRecommendations: SourceRecommendation[],
  refinement?: MoodRefinement,
  language: AppLanguage = 'en'
): MoodSuggestion[] => (
  buildMoodBalancedSuggestions(mood.mood, sourceRecommendations, SESSION_BALANCE.length, refinement, language)
);
