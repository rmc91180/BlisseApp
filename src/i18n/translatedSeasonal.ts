/**
 * ES / PT translations for seasonal content, game options, playlists, and Truth-or-Dare.
 */
import type { SeasonalGameOption, TruthOrDareItem } from '@/types/app';

// ============================================
// SEASONAL GAME OPTIONS
// ============================================

export const SEASONAL_GAME_OPTIONS_ES: Record<string, SeasonalGameOption> = {
  truth_or_dare: {
    id: 'truth_or_dare',
    emoji: '🎲',
    title: 'Verdad o Reto',
    description: 'Preguntas coquetas que van con la vibra de la temporada',
  },
  date_night: {
    id: 'date_night',
    emoji: '🌙',
    title: 'Generador de Noche de Cita',
    description: 'Una velada pensada para conectar y disfrutar',
  },
  challenge: {
    id: 'challenge',
    emoji: '🎯',
    title: 'Desafío de Temporada',
    description: 'Actividad con objetivos para avanzar jugando',
  },
  spin: {
    id: 'spin',
    emoji: '🎰',
    title: 'Giro Sorpresa',
    description: 'Ruleta rápida para inspiración espontánea',
  },
};

export const SEASONAL_GAME_OPTIONS_PT: Record<string, SeasonalGameOption> = {
  truth_or_dare: {
    id: 'truth_or_dare',
    emoji: '🎲',
    title: 'Verdade ou Desafio',
    description: 'Perguntas sedutoras que combinam com a vibe da temporada',
  },
  date_night: {
    id: 'date_night',
    emoji: '🌙',
    title: 'Gerador de Noite a Dois',
    description: 'Uma noite pensada para conexão e diversão',
  },
  challenge: {
    id: 'challenge',
    emoji: '🎯',
    title: 'Desafio da Temporada',
    description: 'Atividade com metas para progredir brincando',
  },
  spin: {
    id: 'spin',
    emoji: '🎰',
    title: 'Giro Surpresa',
    description: 'Roleta rápida para inspiração espontânea',
  },
};

// ============================================
// SEASONAL THEMES (name, description, tips)
// ============================================

export const SEASONAL_THEME_STRINGS_ES: Record<string, { name: string; description: string; tips: string[] }> = {
  valentines: {
    name: 'Día de San Valentín',
    description: 'Conexión romántica y pasión',
    tips: [
      'Prepara pétalos de rosa',
      'Enciende velas por todas partes',
      'Prepara fresas bañadas en chocolate',
      'Escribe una carta de amor para leer juntos',
    ],
  },
  spring: {
    name: 'Despertar de Primavera',
    description: 'Energía fresca y nuevos comienzos',
    tips: [
      'Abre las ventanas para que entre aire fresco',
      'Prueba la intimidad por la mañana',
      'Lleva flores al dormitorio',
      'Haz limpieza de primavera y luego celebren',
    ],
  },
  summer: {
    name: 'Noches Calientes de Verano',
    description: 'Vibras juguetones y aventureras',
    tips: [
      'Cubitos de hielo para jugar con la temperatura',
      'Organicen una noche de hotel sin salir de la ciudad',
      'Báñense sin ropa si pueden',
      'Momentos nocturnos en el balcón o la terraza',
    ],
  },
  fall: {
    name: 'Otoño Acogedor',
    description: 'Conexión cálida e íntima',
    tips: [
      'Chimenea o velas para el ambiente',
      'Cobijas calientitas y vibra acogedora',
      'Aceite de masaje con aroma a especias',
      'Quédense en la cama los días de lluvia',
    ],
  },
  winter: {
    name: 'Calidez Invernal',
    description: 'Calor corporal y cercanía',
    tips: [
      'El calor corporal es tu mejor aliado',
      'Baño o ducha caliente juntos',
      'Cobijas suaves y piel desnuda',
      'Sorpresa con lencería navideña',
    ],
  },
  newyear: {
    name: 'Chispa de Año Nuevo',
    description: 'Nuevos comienzos y nuevas aventuras',
    tips: [
      'Hagan propósitos de intimidad juntos',
      'Atrevanse a probar algo completamente nuevo',
      'Champán y celebración',
      'Beso de medianoche y mucho más',
    ],
  },
};

export const SEASONAL_THEME_STRINGS_PT: Record<string, { name: string; description: string; tips: string[] }> = {
  valentines: {
    name: 'Dia dos Namorados',
    description: 'Conexão romântica e paixão',
    tips: [
      'Espalhe pétalas de rosa',
      'Acenda velas por todo lado',
      'Prepare morangos cobertos de chocolate',
      'Escreva um bilhete de amor para lerem juntos',
    ],
  },
  spring: {
    name: 'Despertar da Primavera',
    description: 'Energia renovada e novos começos',
    tips: [
      'Abra as janelas para o ar fresco entrar',
      'Experimente intimidade pela manhã',
      'Leve flores para o quarto',
      'Faça faxina de primavera e depois celebrem',
    ],
  },
  summer: {
    name: 'Noites Quentes de Verão',
    description: 'Clima divertido e aventureiro',
    tips: [
      'Cubos de gelo para brincar com a temperatura',
      'Reservem uma noite num hotel pertinho',
      'Mergulho sem roupa se puderem',
      'Momentos noturnos na varanda ou no terraço',
    ],
  },
  fall: {
    name: 'Outono Aconchegante',
    description: 'Conexão quente e íntima',
    tips: [
      'Lareira ou velas para criar o clima',
      'Cobertores quentinhos e clima aconchegante',
      'Óleo de massagem com especiarias',
      'Fiquem na cama nos dias de chuva',
    ],
  },
  winter: {
    name: 'Calor do Inverno',
    description: 'Calor corporal e proximidade',
    tips: [
      'O calor do corpo é seu melhor aliado',
      'Banho ou chuveiro quente a dois',
      'Cobertores fofinhos e pele à mostra',
      'Surpresa com lingerie de fim de ano',
    ],
  },
  newyear: {
    name: 'Faísca de Ano Novo',
    description: 'Recomeços e novas aventuras',
    tips: [
      'Façam metas de intimidade juntos',
      'Ousem experimentar algo completamente novo',
      'Champanhe e celebração',
      'Beijo da meia-noite e muito mais',
    ],
  },
};

// ============================================
// PLAYLIST MOOD LABELS
// ============================================

export const PLAYLIST_MOODS_ES = [
  { id: 'romantic', emoji: '🌹', label: 'Romántico' },
  { id: 'sensual', emoji: '🔥', label: 'Sensual' },
  { id: 'passionate', emoji: '💋', label: 'Apasionado' },
  { id: 'relaxed', emoji: '🌊', label: 'Relajado' },
  { id: 'playful', emoji: '😊', label: 'Juguetón' },
  { id: 'energetic', emoji: '⚡', label: 'Enérgico' },
];

export const PLAYLIST_MOODS_PT = [
  { id: 'romantic', emoji: '🌹', label: 'Romântico' },
  { id: 'sensual', emoji: '🔥', label: 'Sensual' },
  { id: 'passionate', emoji: '💋', label: 'Apaixonado' },
  { id: 'relaxed', emoji: '🌊', label: 'Relaxado' },
  { id: 'playful', emoji: '😊', label: 'Divertido' },
  { id: 'energetic', emoji: '⚡', label: 'Energético' },
];

// ============================================
// CURATED PLAYLIST STRINGS
// ============================================

export const CURATED_PLAYLIST_STRINGS_ES: Array<{ name: string; description: string }> = [
  { name: 'Noche Romántica', description: 'Canciones suaves e íntimas para momentos lentos y románticos' },
  { name: 'Sensual y Lento', description: 'R&B y baladas sensuales para conectar con pasión' },
  { name: 'Después de Medianoche', description: 'Vibras sensuales para altas horas de la noche' },
  { name: 'Chill e Íntimo', description: 'Ritmos suaves para intimidad relajada' },
  { name: 'Ritmo Latino Picante', description: 'Ritmos latinos calientes para subir la temperatura' },
  { name: 'Energía Eléctrica', description: 'Canciones de alta energía para noches aventureras' },
];

export const CURATED_PLAYLIST_STRINGS_PT: Array<{ name: string; description: string }> = [
  { name: 'Noite Romântica', description: 'Faixas suaves e íntimas para momentos lentos e românticos' },
  { name: 'Sensual e Devagar', description: 'R&B e baladas sensuais para conexão apaixonada' },
  { name: 'Depois da Meia-Noite', description: 'Vibes sensuais para altas horas da noite' },
  { name: 'Chill e Íntimo', description: 'Batidas suaves para intimidade relaxada' },
  { name: 'Ritmo Latino Quente', description: 'Ritmos latinos quentes para esquentar o clima' },
  { name: 'Energia Elétrica', description: 'Faixas de alta energia para noites aventureiras' },
];

// ============================================
// TRUTH OR DARE — SPANISH
// ============================================

export const TRUTH_OR_DARE_ES: TruthOrDareItem[] = [
  // ============================================
  // MILD TRUTHS (ids 1-16)
  // ============================================
  { id: 1, type: 'truth', intensity: 'mild', text: '¿Qué es lo que más te gusta de nuestra conexión física?' },
  { id: 2, type: 'truth', intensity: 'mild', text: '¿En qué momento supiste que te atraía?' },
  { id: 3, type: 'truth', intensity: 'mild', text: '¿Qué es eso que hago que siempre te saca una sonrisa?' },
  { id: 4, type: 'truth', intensity: 'mild', text: '¿Cuál es tu recuerdo favorito de nosotros juntos?' },
  { id: 5, type: 'truth', intensity: 'mild', text: '¿Cuál es el lugar más romántico al que te gustaría viajar conmigo?' },
  { id: 6, type: 'truth', intensity: 'mild', text: '¿Qué ropa mía te parece más atractiva?' },
  { id: 7, type: 'truth', intensity: 'mild', text: '¿Qué detalle tierno mío notaste pero nunca me dijiste?' },
  { id: 8, type: 'truth', intensity: 'mild', text: '¿Qué canción te hace pensar en mí?' },
  { id: 9, type: 'truth', intensity: 'mild', text: '¿Qué pasaba por tu mente la primera vez que nos besamos?' },
  { id: 10, type: 'truth', intensity: 'mild', text: '¿Cuál es tu forma favorita de pasar un domingo tranquilo juntos?' },
  { id: 11, type: 'truth', intensity: 'mild', text: '¿Cuál es la cosa más romántica que he hecho por ti?' },
  { id: 12, type: 'truth', intensity: 'mild', text: 'Si pudiéramos revivir un momento juntos, ¿cuál elegirías?' },
  { id: 13, type: 'truth', intensity: 'mild', text: '¿Qué pequeño detalle mío te hace sentir amado(a)?' },
  { id: 14, type: 'truth', intensity: 'mild', text: '¿Cuál fue tu primera impresión de mí?' },
  { id: 15, type: 'truth', intensity: 'mild', text: '¿Cuál es tu cumplido favorito que te he dado?' },
  { id: 16, type: 'truth', intensity: 'mild', text: '¿Qué escena de película te recuerda a nosotros?' },

  // ============================================
  // MEDIUM TRUTHS (ids 17-32)
  // ============================================
  { id: 17, type: 'truth', intensity: 'medium', text: '¿Qué es algo que siempre has querido probar en la cama?' },
  { id: 18, type: 'truth', intensity: 'medium', text: '¿Cuál es el lugar más aventurero donde te gustaría tener intimidad?' },
  { id: 19, type: 'truth', intensity: 'medium', text: '¿Qué es lo que más te enciende de lo que hago?' },
  { id: 20, type: 'truth', intensity: 'medium', text: '¿A qué hora del día te sientes con más ganas?' },
  { id: 21, type: 'truth', intensity: 'medium', text: '¿Cuál es una fantasía que has tenido sobre nosotros?' },
  { id: 22, type: 'truth', intensity: 'medium', text: '¿Qué parte de tu cuerpo te gusta más que yo toque?' },
  { id: 23, type: 'truth', intensity: 'medium', text: '¿Qué es eso que hago que te vuelve loco(a)?' },
  { id: 24, type: 'truth', intensity: 'medium', text: '¿Alguna vez soñaste conmigo? Cuéntame.' },
  { id: 25, type: 'truth', intensity: 'medium', text: '¿Qué es lo que más te atrae de mi cuerpo?' },
  { id: 26, type: 'truth', intensity: 'medium', text: '¿Qué tipo de caricia mía te derrite al instante?' },
  { id: 27, type: 'truth', intensity: 'medium', text: '¿Qué te gustaría que hubiera más en nuestra vida íntima?' },
  { id: 28, type: 'truth', intensity: 'medium', text: '¿Dónde te gusta que te bese y tal vez no lo sé?' },
  { id: 29, type: 'truth', intensity: 'medium', text: '¿Qué es lo que más te gusta de nuestra química?' },
  { id: 30, type: 'truth', intensity: 'medium', text: '¿Cómo sería el final perfecto de una noche de cita?' },
  { id: 31, type: 'truth', intensity: 'medium', text: '¿Cuál es tu señal sutil cuando estás con ganas?' },
  { id: 32, type: 'truth', intensity: 'medium', text: '¿Cuánto tiempo seguido has pensado en ser íntimo(a) conmigo?' },

  // ============================================
  // SPICY TRUTHS (ids 33-44)
  // ============================================
  { id: 33, type: 'truth', intensity: 'spicy', text: '¿Cuál es tu fantasía más secreta que nunca has compartido?' },
  { id: 34, type: 'truth', intensity: 'spicy', text: '¿Qué es lo más atrevido que quieres que te haga esta noche?' },
  { id: 35, type: 'truth', intensity: 'spicy', text: 'Describe tu noche íntima perfecta con todo detalle.' },
  { id: 36, type: 'truth', intensity: 'spicy', text: '¿Qué escenario de juego de roles te excita más?' },
  { id: 37, type: 'truth', intensity: 'spicy', text: '¿Qué es lo más espontáneo que quieres que hagamos?' },
  { id: 38, type: 'truth', intensity: 'spicy', text: 'Si pudieras hacer que yo hiciera lo que quisieras ahora mismo, ¿qué sería?' },
  { id: 39, type: 'truth', intensity: 'spicy', text: '¿Qué posición de la app te da más curiosidad probar?' },
  { id: 40, type: 'truth', intensity: 'spicy', text: '¿Cuál es el lugar más arriesgado donde querrías tener intimidad conmigo?' },
  { id: 41, type: 'truth', intensity: 'spicy', text: '¿Cuánto te gustaría que duraran nuestras sesiones íntimas?' },
  { id: 42, type: 'truth', intensity: 'spicy', text: 'Describe lo que quieres que te haga usando solo sonidos.' },
  { id: 43, type: 'truth', intensity: 'spicy', text: '¿Qué es algo que viste y quieres que recreemos?' },
  { id: 44, type: 'truth', intensity: 'spicy', text: 'Si te susurrara algo al oído ahora, ¿qué te gustaría que fuera?' },

  // ============================================
  // WILD TRUTHS (ids 45-48)
  // ============================================
  { id: 45, type: 'truth', intensity: 'wild', text: '¿Cuál es la fantasía más salvaje que has imaginado sobre nosotros?' },
  { id: 46, type: 'truth', intensity: 'wild', text: 'Describe exactamente cómo quieres que sea esta noche, con todo detalle.' },
  { id: 47, type: 'truth', intensity: 'wild', text: '¿Qué es algo que siempre quisiste probar pero te dio pena pedir?' },
  { id: 48, type: 'truth', intensity: 'wild', text: 'Si no hubiera límites esta noche, ¿qué querrías que hiciéramos?' },

  // ============================================
  // MILD DARES (ids 101-116)
  // ============================================
  { id: 101, type: 'dare', intensity: 'mild', text: 'Dale a tu pareja un masaje de hombros de 30 segundos.' },
  { id: 102, type: 'dare', intensity: 'mild', text: 'Susúrrale al oído algo que amas de ella/él.' },
  { id: 103, type: 'dare', intensity: 'mild', text: 'Tómense de las manos y mírense a los ojos por 60 segundos.' },
  { id: 104, type: 'dare', intensity: 'mild', text: 'Dale a tu pareja un beso lento y romántico.' },
  { id: 105, type: 'dare', intensity: 'mild', text: 'Dile a tu pareja tres cosas que te atraen de ella/él.' },
  { id: 106, type: 'dare', intensity: 'mild', text: 'Bailen lento juntos con una canción imaginaria por un minuto.' },
  { id: 107, type: 'dare', intensity: 'mild', text: 'Dale algo dulce de comer a tu pareja en la boca.' },
  { id: 108, type: 'dare', intensity: 'mild', text: 'Escribe "te amo" en algún lugar del cuerpo de tu pareja con el dedo.' },
  { id: 109, type: 'dare', intensity: 'mild', text: 'Dale besos de mariposa en las mejillas a tu pareja.' },
  { id: 110, type: 'dare', intensity: 'mild', text: 'Juega con el cabello de tu pareja por un minuto.' },
  { id: 111, type: 'dare', intensity: 'mild', text: 'Abraza a tu pareja por detrás y quédate así 30 segundos.' },
  { id: 112, type: 'dare', intensity: 'mild', text: 'Describe a tu pareja usando solo cumplidos por 30 segundos.' },
  { id: 113, type: 'dare', intensity: 'mild', text: 'Dale a tu pareja un beso esquimal (froten sus narices).' },
  { id: 114, type: 'dare', intensity: 'mild', text: 'Recorre el contorno del rostro de tu pareja con la punta del dedo.' },
  { id: 115, type: 'dare', intensity: 'mild', text: 'Deja que tu pareja elija la próxima canción y báilenla juntos.' },
  { id: 116, type: 'dare', intensity: 'mild', text: 'Dale a tu pareja un masaje de manos por un minuto.' },

  // ============================================
  // MEDIUM DARES (ids 117-132)
  // ============================================
  { id: 117, type: 'dare', intensity: 'medium', text: 'Besa el cuello de tu pareja por 30 segundos.' },
  { id: 118, type: 'dare', intensity: 'medium', text: 'Quítate una prenda de ropa de forma seductora.' },
  { id: 119, type: 'dare', intensity: 'medium', text: 'Dale a tu pareja un masaje sensual de espalda por 2 minutos.' },
  { id: 120, type: 'dare', intensity: 'medium', text: 'Recorre la clavícula de tu pareja con tus labios.' },
  { id: 121, type: 'dare', intensity: 'medium', text: 'Susúrrale tu fantasía más grande al oído a tu pareja.' },
  { id: 122, type: 'dare', intensity: 'medium', text: 'Deja que tu pareja te quite una prenda solo con los dientes.' },
  { id: 123, type: 'dare', intensity: 'medium', text: 'Besa a tu pareja en todo el cuerpo excepto los labios por 1 minuto.' },
  { id: 124, type: 'dare', intensity: 'medium', text: 'Haz tu mejor baile seductor por 30 segundos.' },
  { id: 125, type: 'dare', intensity: 'medium', text: 'Mordisquea suavemente la oreja de tu pareja por 20 segundos.' },
  { id: 126, type: 'dare', intensity: 'medium', text: 'Deja que tu pareja te vende los ojos para el próximo reto.' },
  { id: 127, type: 'dare', intensity: 'medium', text: 'Besa desde la muñeca hasta el hombro de tu pareja.' },
  { id: 128, type: 'dare', intensity: 'medium', text: 'Sopla aire caliente en el cuello de tu pareja sin tocar.' },
  { id: 129, type: 'dare', intensity: 'medium', text: 'Dale a tu pareja un masaje de pies por 2 minutos.' },
  { id: 130, type: 'dare', intensity: 'medium', text: 'Quítale los calcetines a tu pareja usando solo la boca.' },
  { id: 131, type: 'dare', intensity: 'medium', text: 'Describe en un susurro lo que quieres hacerle a tu pareja.' },
  { id: 132, type: 'dare', intensity: 'medium', text: 'Deja que tu pareja dibuje algo en tu espalda y adivina qué es.' },

  // ============================================
  // SPICY DARES (ids 133-144)
  // ============================================
  { id: 133, type: 'dare', intensity: 'spicy', text: 'Quítale la camiseta a tu pareja usando solo la boca.' },
  { id: 134, type: 'dare', intensity: 'spicy', text: 'Demuestra tu posición favorita sobre tu pareja (con ropa puesta).' },
  { id: 135, type: 'dare', intensity: 'spicy', text: 'Dale a tu pareja un masaje de cuerpo completo por 3 minutos.' },
  { id: 136, type: 'dare', intensity: 'spicy', text: 'Besa el cuerpo entero de tu pareja de la cabeza a los pies.' },
  { id: 137, type: 'dare', intensity: 'spicy', text: 'Véndales los ojos a tu pareja y provócala por 2 minutos.' },
  { id: 138, type: 'dare', intensity: 'spicy', text: 'Actúen juntos una escena apasionada de película.' },
  { id: 139, type: 'dare', intensity: 'spicy', text: 'Usa un cubo de hielo para trazar un camino por el cuerpo de tu pareja.' },
  { id: 140, type: 'dare', intensity: 'spicy', text: 'Siéntate sobre tu pareja y bésala apasionadamente por 1 minuto.' },
  { id: 141, type: 'dare', intensity: 'spicy', text: 'Deja que tu pareja tenga control total de tus manos por 2 minutos.' },
  { id: 142, type: 'dare', intensity: 'spicy', text: 'Deja un camino de besos desde el cuello hasta la cintura de tu pareja.' },
  { id: 143, type: 'dare', intensity: 'spicy', text: 'Sujeta las manos de tu pareja sobre su cabeza y bésala.' },
  { id: 144, type: 'dare', intensity: 'spicy', text: 'Hazle un baile sensual a tu pareja por 1 minuto.' },

  // ============================================
  // WILD DARES (ids 145-150)
  // ============================================
  { id: 145, type: 'dare', intensity: 'wild', text: 'Recrea la fantasía favorita de tu pareja ahora mismo.' },
  { id: 146, type: 'dare', intensity: 'wild', text: 'Deja que tu pareja tenga el control total por los próximos 5 minutos.' },
  { id: 147, type: 'dare', intensity: 'wild', text: 'Prueben una posición nueva de la app ahora mismo.' },
  { id: 148, type: 'dare', intensity: 'wild', text: 'Tu pareja dirige exactamente lo que pasa por los próximos 5 minutos.' },
  { id: 149, type: 'dare', intensity: 'wild', text: 'Actúen la última fantasía que cualquiera de los dos mencionó esta noche.' },
  { id: 150, type: 'dare', intensity: 'wild', text: 'Usa solo tu boca por los próximos 3 minutos — sin manos.' },
];

// ============================================
// TRUTH OR DARE — PORTUGUESE (BR)
// ============================================

export const TRUTH_OR_DARE_PT: TruthOrDareItem[] = [
  // ============================================
  // MILD TRUTHS (ids 1-16)
  // ============================================
  { id: 1, type: 'truth', intensity: 'mild', text: 'O que você mais gosta da nossa conexão física?' },
  { id: 2, type: 'truth', intensity: 'mild', text: 'Quando você percebeu que se sentia atraído(a) por mim?' },
  { id: 3, type: 'truth', intensity: 'mild', text: 'O que eu faço que sempre te arranca um sorriso?' },
  { id: 4, type: 'truth', intensity: 'mild', text: 'Qual é a sua lembrança favorita de nós dois juntos?' },
  { id: 5, type: 'truth', intensity: 'mild', text: 'Qual é o lugar mais romântico para onde você gostaria de viajar comigo?' },
  { id: 6, type: 'truth', intensity: 'mild', text: 'Qual roupa minha você acha mais atraente?' },
  { id: 7, type: 'truth', intensity: 'mild', text: 'Qual gesto carinhoso meu você percebeu mas nunca me contou?' },
  { id: 8, type: 'truth', intensity: 'mild', text: 'Qual música te faz pensar em mim?' },
  { id: 9, type: 'truth', intensity: 'mild', text: 'O que passava pela sua cabeça no nosso primeiro beijo?' },
  { id: 10, type: 'truth', intensity: 'mild', text: 'Qual é o seu jeito favorito de passar um domingo preguiçoso juntos?' },
  { id: 11, type: 'truth', intensity: 'mild', text: 'Qual é a coisa mais romântica que eu já fiz por você?' },
  { id: 12, type: 'truth', intensity: 'mild', text: 'Se pudéssemos reviver um momento juntos, qual você escolheria?' },
  { id: 13, type: 'truth', intensity: 'mild', text: 'Qual pequeno gesto meu faz você se sentir amado(a)?' },
  { id: 14, type: 'truth', intensity: 'mild', text: 'Qual foi a sua primeira impressão de mim?' },
  { id: 15, type: 'truth', intensity: 'mild', text: 'Qual é o elogio favorito que eu já te fiz?' },
  { id: 16, type: 'truth', intensity: 'mild', text: 'Qual cena de filme te lembra a gente?' },

  // ============================================
  // MEDIUM TRUTHS (ids 17-32)
  // ============================================
  { id: 17, type: 'truth', intensity: 'medium', text: 'O que você sempre quis experimentar na cama?' },
  { id: 18, type: 'truth', intensity: 'medium', text: 'Qual é o lugar mais aventureiro onde você gostaria de ter intimidade?' },
  { id: 19, type: 'truth', intensity: 'medium', text: 'O que eu faço que mais te excita?' },
  { id: 20, type: 'truth', intensity: 'medium', text: 'Em que hora do dia você fica mais no clima?' },
  { id: 21, type: 'truth', intensity: 'medium', text: 'Qual é uma fantasia que você já teve sobre nós dois?' },
  { id: 22, type: 'truth', intensity: 'medium', text: 'Qual parte do seu corpo você mais gosta que eu toque?' },
  { id: 23, type: 'truth', intensity: 'medium', text: 'O que eu faço que te deixa louco(a)?' },
  { id: 24, type: 'truth', intensity: 'medium', text: 'Você já sonhou comigo? Me conta.' },
  { id: 25, type: 'truth', intensity: 'medium', text: 'O que você acha mais atraente no meu corpo?' },
  { id: 26, type: 'truth', intensity: 'medium', text: 'Que tipo de toque meu te derrete na hora?' },
  { id: 27, type: 'truth', intensity: 'medium', text: 'O que você gostaria de ter mais na nossa vida íntima?' },
  { id: 28, type: 'truth', intensity: 'medium', text: 'Onde você gosta de ser beijado(a) e talvez eu não saiba?' },
  { id: 29, type: 'truth', intensity: 'medium', text: 'O que você mais gosta da nossa química?' },
  { id: 30, type: 'truth', intensity: 'medium', text: 'Como seria o final perfeito de uma noite a dois?' },
  { id: 31, type: 'truth', intensity: 'medium', text: 'Qual é o sinal sutil que você dá quando está no clima?' },
  { id: 32, type: 'truth', intensity: 'medium', text: 'Qual foi o maior tempo que você ficou pensando em ter intimidade comigo?' },

  // ============================================
  // SPICY TRUTHS (ids 33-44)
  // ============================================
  { id: 33, type: 'truth', intensity: 'spicy', text: 'Qual é a sua fantasia mais secreta que você nunca contou?' },
  { id: 34, type: 'truth', intensity: 'spicy', text: 'Qual é a coisa mais ousada que você quer que eu faça com você esta noite?' },
  { id: 35, type: 'truth', intensity: 'spicy', text: 'Descreva sua noite íntima perfeita em detalhes.' },
  { id: 36, type: 'truth', intensity: 'spicy', text: 'Qual cenário de roleplay mais te excita?' },
  { id: 37, type: 'truth', intensity: 'spicy', text: 'Qual é a coisa mais espontânea que você quer que a gente faça?' },
  { id: 38, type: 'truth', intensity: 'spicy', text: 'Se você pudesse me fazer fazer qualquer coisa agora, o que seria?' },
  { id: 39, type: 'truth', intensity: 'spicy', text: 'Qual posição do app você tem mais curiosidade de experimentar?' },
  { id: 40, type: 'truth', intensity: 'spicy', text: 'Qual é o lugar mais arriscado onde você gostaria de ter intimidade comigo?' },
  { id: 41, type: 'truth', intensity: 'spicy', text: 'Quanto tempo você gostaria que nossas sessões íntimas durassem?' },
  { id: 42, type: 'truth', intensity: 'spicy', text: 'Descreva o que você quer que eu faça com você usando apenas sons.' },
  { id: 43, type: 'truth', intensity: 'spicy', text: 'O que é algo que você viu e quer que a gente recrie?' },
  { id: 44, type: 'truth', intensity: 'spicy', text: 'Se eu sussurrasse algo no seu ouvido agora, o que você gostaria que fosse?' },

  // ============================================
  // WILD TRUTHS (ids 45-48)
  // ============================================
  { id: 45, type: 'truth', intensity: 'wild', text: 'Qual é a fantasia mais selvagem que você já imaginou sobre nós dois?' },
  { id: 46, type: 'truth', intensity: 'wild', text: 'Descreva exatamente como você quer que seja essa noite, em detalhes.' },
  { id: 47, type: 'truth', intensity: 'wild', text: 'O que é algo que você sempre quis experimentar mas teve vergonha de pedir?' },
  { id: 48, type: 'truth', intensity: 'wild', text: 'Se não houvesse limites esta noite, o que você ia querer que a gente fizesse?' },

  // ============================================
  // MILD DARES (ids 101-116)
  // ============================================
  { id: 101, type: 'dare', intensity: 'mild', text: 'Faça uma massagem nos ombros do seu par por 30 segundos.' },
  { id: 102, type: 'dare', intensity: 'mild', text: 'Sussurre algo que você ama nele(a) no ouvido.' },
  { id: 103, type: 'dare', intensity: 'mild', text: 'Deem as mãos e olhem nos olhos um do outro por 60 segundos.' },
  { id: 104, type: 'dare', intensity: 'mild', text: 'Dê um beijo lento e romântico no seu par.' },
  { id: 105, type: 'dare', intensity: 'mild', text: 'Diga três coisas que você acha atraente no seu par.' },
  { id: 106, type: 'dare', intensity: 'mild', text: 'Dancem uma música lenta imaginária juntos por um minuto.' },
  { id: 107, type: 'dare', intensity: 'mild', text: 'Dê algo doce de comer na boca do seu par.' },
  { id: 108, type: 'dare', intensity: 'mild', text: 'Escreva "eu te amo" em algum lugar do corpo do seu par com o dedo.' },
  { id: 109, type: 'dare', intensity: 'mild', text: 'Dê beijinhos de borboleta nas bochechas do seu par.' },
  { id: 110, type: 'dare', intensity: 'mild', text: 'Brinque com o cabelo do seu par por um minuto.' },
  { id: 111, type: 'dare', intensity: 'mild', text: 'Abrace seu par por trás e fique assim por 30 segundos.' },
  { id: 112, type: 'dare', intensity: 'mild', text: 'Descreva seu par usando apenas elogios por 30 segundos.' },
  { id: 113, type: 'dare', intensity: 'mild', text: 'Dê um beijo de esquimó no seu par (encostem os narizes).' },
  { id: 114, type: 'dare', intensity: 'mild', text: 'Trace o contorno do rosto do seu par com a ponta do dedo.' },
  { id: 115, type: 'dare', intensity: 'mild', text: 'Deixe seu par escolher a próxima música e dancem juntos.' },
  { id: 116, type: 'dare', intensity: 'mild', text: 'Faça uma massagem nas mãos do seu par por um minuto.' },

  // ============================================
  // MEDIUM DARES (ids 117-132)
  // ============================================
  { id: 117, type: 'dare', intensity: 'medium', text: 'Beije o pescoço do seu par por 30 segundos.' },
  { id: 118, type: 'dare', intensity: 'medium', text: 'Tire uma peça de roupa de forma sedutora.' },
  { id: 119, type: 'dare', intensity: 'medium', text: 'Faça uma massagem sensual nas costas do seu par por 2 minutos.' },
  { id: 120, type: 'dare', intensity: 'medium', text: 'Passe seus lábios pela clavícula do seu par.' },
  { id: 121, type: 'dare', intensity: 'medium', text: 'Sussurre sua maior fantasia no ouvido do seu par.' },
  { id: 122, type: 'dare', intensity: 'medium', text: 'Deixe seu par tirar uma peça sua usando apenas os dentes.' },
  { id: 123, type: 'dare', intensity: 'medium', text: 'Beije seu par em todo lugar, menos na boca, por 1 minuto.' },
  { id: 124, type: 'dare', intensity: 'medium', text: 'Faça sua melhor dança sedutora por 30 segundos.' },
  { id: 125, type: 'dare', intensity: 'medium', text: 'Mordisque a orelha do seu par de leve por 20 segundos.' },
  { id: 126, type: 'dare', intensity: 'medium', text: 'Deixe seu par te vendar para o próximo desafio.' },
  { id: 127, type: 'dare', intensity: 'medium', text: 'Beije do pulso até o ombro do seu par.' },
  { id: 128, type: 'dare', intensity: 'medium', text: 'Sopre ar quente no pescoço do seu par sem encostar.' },
  { id: 129, type: 'dare', intensity: 'medium', text: 'Faça uma massagem nos pés do seu par por 2 minutos.' },
  { id: 130, type: 'dare', intensity: 'medium', text: 'Tire as meias do seu par usando apenas a boca.' },
  { id: 131, type: 'dare', intensity: 'medium', text: 'Descreva sussurrando o que quer fazer com seu par.' },
  { id: 132, type: 'dare', intensity: 'medium', text: 'Deixe seu par desenhar algo nas suas costas — adivinhe o que é.' },

  // ============================================
  // SPICY DARES (ids 133-144)
  // ============================================
  { id: 133, type: 'dare', intensity: 'spicy', text: 'Tire a camiseta do seu par usando apenas a boca.' },
  { id: 134, type: 'dare', intensity: 'spicy', text: 'Demonstre sua posição favorita com seu par (de roupa).' },
  { id: 135, type: 'dare', intensity: 'spicy', text: 'Faça uma massagem de corpo inteiro no seu par por 3 minutos.' },
  { id: 136, type: 'dare', intensity: 'spicy', text: 'Beije o corpo inteiro do seu par da cabeça aos pés.' },
  { id: 137, type: 'dare', intensity: 'spicy', text: 'Vende os olhos do seu par e provoque por 2 minutos.' },
  { id: 138, type: 'dare', intensity: 'spicy', text: 'Encenem juntos uma cena quente de filme.' },
  { id: 139, type: 'dare', intensity: 'spicy', text: 'Use um cubo de gelo para traçar um caminho no corpo do seu par.' },
  { id: 140, type: 'dare', intensity: 'spicy', text: 'Sente no colo do seu par e beije com paixão por 1 minuto.' },
  { id: 141, type: 'dare', intensity: 'spicy', text: 'Deixe seu par ter controle total das suas mãos por 2 minutos.' },
  { id: 142, type: 'dare', intensity: 'spicy', text: 'Deixe uma trilha de beijos do pescoço até a cintura do seu par.' },
  { id: 143, type: 'dare', intensity: 'spicy', text: 'Segure as mãos do seu par acima da cabeça e beije.' },
  { id: 144, type: 'dare', intensity: 'spicy', text: 'Faça uma dança sensual no colo do seu par por 1 minuto.' },

  // ============================================
  // WILD DARES (ids 145-150)
  // ============================================
  { id: 145, type: 'dare', intensity: 'wild', text: 'Recrie a fantasia favorita do seu par agora mesmo.' },
  { id: 146, type: 'dare', intensity: 'wild', text: 'Deixe seu par no controle total pelos próximos 5 minutos.' },
  { id: 147, type: 'dare', intensity: 'wild', text: 'Experimentem uma posição nova do app agora mesmo.' },
  { id: 148, type: 'dare', intensity: 'wild', text: 'Seu par dirige exatamente o que acontece pelos próximos 5 minutos.' },
  { id: 149, type: 'dare', intensity: 'wild', text: 'Encenem a última fantasia que qualquer um dos dois mencionou esta noite.' },
  { id: 150, type: 'dare', intensity: 'wild', text: 'Use apenas a boca pelos próximos 3 minutos — sem usar as mãos.' },
];
