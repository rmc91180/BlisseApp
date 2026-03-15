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
  { id: 1, type: 'truth', intensity: 'mild', text: '¿Cuál fue el momento exacto en que te diste cuenta de que te atraía?' },
  { id: 2, type: 'truth', intensity: 'mild', text: '¿Qué pequeño hábito mío te resulta secretamente irresistible?' },
  { id: 3, type: 'truth', intensity: 'mild', text: '¿Qué es lo más romántico y no sexual que he hecho por ti?' },
  { id: 4, type: 'truth', intensity: 'mild', text: '¿Cuándo fantaseaste por primera vez con besarme?' },
  { id: 5, type: 'truth', intensity: 'mild', text: '¿Qué canción siempre te hace pensar en mí de forma romántica?' },
  { id: 6, type: 'truth', intensity: 'mild', text: '¿Qué aspecto de mi personalidad te parece especialmente atractivo?' },
  { id: 7, type: 'truth', intensity: 'mild', text: '¿Cuál es tu atuendo favorito en mí últimamente?' },
  { id: 8, type: 'truth', intensity: 'mild', text: '¿Qué cumplido mío sigues recordando?' },
  { id: 9, type: 'truth', intensity: 'mild', text: '¿Qué tipo de beso mío se te queda más tiempo en la mente?' },
  { id: 10, type: 'truth', intensity: 'mild', text: '¿Cuál es tu momento favorito de flojera juntos?' },
  { id: 11, type: 'truth', intensity: 'mild', text: 'Califica nuestro último beso del 1 al 10. ¿Qué lo llevaría a 11?' },
  { id: 12, type: 'truth', intensity: 'mild', text: '¿Cuál es el pensamiento más coqueto que has tenido sobre mí en público?' },
  { id: 13, type: 'truth', intensity: 'mild', text: '¿Qué parte de mi cuerpo miras en secreto más que ninguna otra?' },
  { id: 14, type: 'truth', intensity: 'mild', text: '¿Cuándo fue la última vez que te encendí solo con mirarte?' },
  { id: 15, type: 'truth', intensity: 'mild', text: '¿Qué te gustaría probar conmigo y todavía no me has pedido?' },
  { id: 16, type: 'truth', intensity: 'mild', text: 'Si tuviéramos solo cinco minutos a solas, ¿cómo me seducirías?' },

  { id: 17, type: 'truth', intensity: 'medium', text: '¿Qué hábito mío capta tu atención al instante?' },
  { id: 18, type: 'truth', intensity: 'medium', text: '¿Qué prenda mía te parece absurdamente atractiva?' },
  { id: 19, type: 'truth', intensity: 'medium', text: '¿Cuál es el pensamiento más atrevido que has tenido sobre mí en público?' },
  { id: 20, type: 'truth', intensity: 'medium', text: '¿Qué hago al besarte que te gustaría que repitiera más?' },
  { id: 21, type: 'truth', intensity: 'medium', text: '¿Qué atuendo mío te hace querer cancelar los planes y quedarte conmigo?' },
  { id: 22, type: 'truth', intensity: 'medium', text: '¿En qué lugar te gustaría que un beso mío durara un poco más?' },
  { id: 23, type: 'truth', intensity: 'medium', text: '¿Qué reto juguetón te gustaría en secreto que te tocara?' },
  { id: 24, type: 'truth', intensity: 'medium', text: '¿Qué tipo de juego de roles te daría curiosidad explorar juntos?' },
  { id: 25, type: 'truth', intensity: 'medium', text: '¿Qué parte de nuestra química sientes más fuerte últimamente?' },
  { id: 26, type: 'truth', intensity: 'medium', text: '¿De qué forma podría provocarte mejor?' },
  { id: 27, type: 'truth', intensity: 'medium', text: '¿Qué mensaje coqueto te encantaría recibir de mí esta noche?' },
  { id: 28, type: 'truth', intensity: 'medium', text: '¿Qué hago que crea tensión entre nosotros muy rápido?' },
  { id: 29, type: 'truth', intensity: 'medium', text: '¿Cómo sería un fin de semana privado conmigo en tu cabeza?' },
  { id: 30, type: 'truth', intensity: 'medium', text: '¿Qué primer movimiento mío te funciona siempre?' },
  { id: 31, type: 'truth', intensity: 'medium', text: '¿Cuál sería tu mensaje perfecto de "nos vemos luego" de mi parte?' },
  { id: 32, type: 'truth', intensity: 'medium', text: '¿Qué tipo de caricia mía te derrite más rápido?' },

  { id: 33, type: 'truth', intensity: 'spicy', text: '¿Cuál es el beso más atrevido que te gustaría que te diera esta noche?' },
  { id: 34, type: 'truth', intensity: 'spicy', text: '¿Qué idea de fantasía sí probarías conmigo de verdad?' },
  { id: 35, type: 'truth', intensity: 'spicy', text: '¿Qué escena de película te gustaría más recrear conmigo?' },
  { id: 36, type: 'truth', intensity: 'spicy', text: 'Si pudieras diseñar el ambiente de esta noche, ¿qué elegirías primero?' },
  { id: 37, type: 'truth', intensity: 'spicy', text: '¿En qué parte te gustaría que mis labios se quedaran un poco más?' },
  { id: 38, type: 'truth', intensity: 'spicy', text: '¿Qué hago que te hace perder el hilo de lo que pensabas?' },
  { id: 39, type: 'truth', intensity: 'spicy', text: '¿Qué tipo de provocación lenta funciona mejor contigo?' },
  { id: 40, type: 'truth', intensity: 'spicy', text: '¿Qué movimiento un poco más atrevido confiarías en que yo probara?' },
  { id: 41, type: 'truth', intensity: 'spicy', text: '¿Qué tipo de elogio mío te llega más cuando estamos cerca?' },
  { id: 42, type: 'truth', intensity: 'spicy', text: '¿Cuál ha sido nuestro casi-momento más intenso últimamente?' },
  { id: 43, type: 'truth', intensity: 'spicy', text: 'Si te dijera que tomes la iniciativa esta noche, ¿qué harías primero?' },
  { id: 44, type: 'truth', intensity: 'spicy', text: '¿Qué deseo secreto te animarías a contarme por fin esta noche?' },

  { id: 45, type: 'truth', intensity: 'wild', text: 'Si tuviéramos una noche entera a solas y sin interrupciones, ¿qué querrías primero?' },
  { id: 46, type: 'truth', intensity: 'wild', text: '¿Qué movimiento atrevido pondrías en tu lista pendiente de Blisse?' },
  { id: 47, type: 'truth', intensity: 'wild', text: 'Si te diera el control total por un minuto, ¿cómo lo usarías?' },
  { id: 48, type: 'truth', intensity: 'wild', text: '¿Qué regla juguetona te encantaría romper en una escapada privada de fin de semana?' },

  { id: 101, type: 'dare', intensity: 'mild', text: 'Dame el beso en la frente más suave y lento posible durante 30 segundos.' },
  { id: 102, type: 'dare', intensity: 'mild', text: 'Sostén mi mirada durante 45 segundos.' },
  { id: 103, type: 'dare', intensity: 'mild', text: 'Susúrrame muy despacio algo que ames de mi personalidad.' },
  { id: 104, type: 'dare', intensity: 'mild', text: 'Recorre mi clavícula con la punta de un dedo durante 20 segundos.' },
  { id: 105, type: 'dare', intensity: 'mild', text: 'Envíame una nota de voz diciendo algo que agradeces de nuestra relación.' },
  { id: 106, type: 'dare', intensity: 'mild', text: 'Tómame de la mano y guíame en un baile lento de 30 segundos.' },
  { id: 107, type: 'dare', intensity: 'mild', text: 'Dame un abrazo de 20 segundos sin hablar.' },
  { id: 108, type: 'dare', intensity: 'mild', text: 'Hazme tres cumplidos sin repetir ninguno.' },
  { id: 109, type: 'dare', intensity: 'mild', text: 'Roza mi mejilla con tus labios y luego detente.' },
  { id: 110, type: 'dare', intensity: 'mild', text: 'Apoya tu cabeza en mi hombro durante un minuto completo.' },
  { id: 111, type: 'dare', intensity: 'mild', text: 'Besa el dorso de mi mano como si estuviéramos en una película.' },
  { id: 112, type: 'dare', intensity: 'mild', text: 'Dibuja un corazón en mi espalda y deja que lo adivine.' },
  { id: 113, type: 'dare', intensity: 'mild', text: 'Elige nuestra próxima canción y hazme balancearme contigo.' },
  { id: 114, type: 'dare', intensity: 'mild', text: 'Juega con mi pelo durante 30 segundos como si me hubieras extrañado.' },
  { id: 115, type: 'dare', intensity: 'mild', text: 'Dime exactamente cómo coquetearías conmigo en una primera cita.' },
  { id: 116, type: 'dare', intensity: 'mild', text: 'Dame una mirada de "nos vemos luego" sin usar palabras.' },

  { id: 117, type: 'dare', intensity: 'medium', text: 'Dame un masaje de hombros o cuello de 15 segundos usando solo tus labios.' },
  { id: 118, type: 'dare', intensity: 'medium', text: 'Véndate los ojos y adivina qué parte de mí te está tocando; tienes tres intentos.' },
  { id: 119, type: 'dare', intensity: 'medium', text: 'Envíame un mensaje muy coqueto, pero sin pasarte, como si acabáramos de conectar.' },
  { id: 120, type: 'dare', intensity: 'medium', text: 'Bésame el cuello durante 30 segundos, sin usar las manos.' },
  { id: 121, type: 'dare', intensity: 'medium', text: 'Quítate una capa exterior y luego bésame manteniendo la mirada.' },
  { id: 122, type: 'dare', intensity: 'medium', text: 'Dame un beso lento y provocador cerca del muslo y detente antes.' },
  { id: 123, type: 'dare', intensity: 'medium', text: 'Déjame guiar tu mano por mi cintura y mi espalda durante 30 segundos.' },
  { id: 124, type: 'dare', intensity: 'medium', text: 'Véndame los ojos y bésame en cualquier parte del cuerpo excepto en los labios, tres veces.' },
  { id: 125, type: 'dare', intensity: 'medium', text: 'Siéntate en mi regazo mirándome y mécete despacio durante 30 segundos.' },
  { id: 126, type: 'dare', intensity: 'medium', text: 'Recrea la escena de beso de película más dramática que se te ocurra.' },
  { id: 127, type: 'dare', intensity: 'medium', text: 'Habla solo con pésimas frases para ligar durante los próximos tres turnos.' },
  { id: 128, type: 'dare', intensity: 'medium', text: 'Intenta halagarme usando solo metáforas de comida durante 30 segundos.' },
  { id: 129, type: 'dare', intensity: 'medium', text: 'Enséñame tu mejor paso sexy con una canción ridícula.' },
  { id: 130, type: 'dare', intensity: 'medium', text: 'Haz tu mejor gesto de "ven aquí" en cámara lenta.' },
  { id: 131, type: 'dare', intensity: 'medium', text: 'Traza una línea desde mi muñeca hasta mi hombro con tus labios.' },
  { id: 132, type: 'dare', intensity: 'medium', text: 'Déjame elegir el próximo reto que harás, sin negociar.' },

  { id: 133, type: 'dare', intensity: 'spicy', text: 'Quítate una capa exterior y luego bésame durante 20 segundos.' },
  { id: 134, type: 'dare', intensity: 'spicy', text: 'Bésame por el cuello y la clavícula durante 30 segundos.' },
  { id: 135, type: 'dare', intensity: 'spicy', text: 'Déjame guiar tus muñecas mientras nos besamos durante 20 segundos.' },
  { id: 136, type: 'dare', intensity: 'spicy', text: 'Hazme un baile en el regazo de 30 segundos; la música es opcional.' },
  { id: 137, type: 'dare', intensity: 'spicy', text: 'Usa un cubo de hielo para trazar una línea lenta por mi brazo o mi hombro.' },
  { id: 138, type: 'dare', intensity: 'spicy', text: 'Siéntate en mi regazo con ropa y sostén la mirada durante 20 segundos.' },
  { id: 139, type: 'dare', intensity: 'spicy', text: 'Déjame elegir exactamente dónde aterrizan tus próximos tres besos.' },
  { id: 140, type: 'dare', intensity: 'spicy', text: 'Susúrrame qué te gustaría de esta noche sin decir nada explícito.' },
  { id: 141, type: 'dare', intensity: 'spicy', text: 'Dame un beso lento, aléjate y haz que te pida otro.' },
  { id: 142, type: 'dare', intensity: 'spicy', text: 'Déjame vendarte los ojos mientras te doy tres besos provocadores.' },
  { id: 143, type: 'dare', intensity: 'spicy', text: 'Recrea tu mejor momento tipo "no deberíamos estar haciendo esto" de película.' },
  { id: 144, type: 'dare', intensity: 'spicy', text: 'Dime "luego" con tu lenguaje corporal, no con palabras.' },

  { id: 145, type: 'dare', intensity: 'wild', text: 'Deja que tu pareja elija verdad o reto para tu próximo turno, sin veto.' },
  { id: 146, type: 'dare', intensity: 'wild', text: 'Haz un baile lento de 60 segundos que termine en un beso.' },
  { id: 147, type: 'dare', intensity: 'wild', text: 'Quítate una capa más si te sientes cómodo(a) y aduéñate del momento.' },
  { id: 148, type: 'dare', intensity: 'wild', text: 'Deja que tu pareja dirija tus próximos 30 segundos de coqueteo.' },
  { id: 149, type: 'dare', intensity: 'wild', text: 'Haz una escena dramática de cuenta regresiva hasta un beso y detente en el último segundo.' },
  { id: 150, type: 'dare', intensity: 'wild', text: 'Elige un prompt de Blisse que has estado evitando y agrégalo al plan de esta noche.' },
];

// ============================================
// TRUTH OR DARE — PORTUGUESE (BR)
// ============================================

export const TRUTH_OR_DARE_PT: TruthOrDareItem[] = [
  { id: 1, type: 'truth', intensity: 'mild', text: 'Qual foi o momento exato em que você percebeu que se sentia atraído(a) por mim?' },
  { id: 2, type: 'truth', intensity: 'mild', text: 'Que pequeno hábito meu você acha secretamente irresistível?' },
  { id: 3, type: 'truth', intensity: 'mild', text: 'Qual foi a coisa mais romântica e nada sexual que já fiz por você?' },
  { id: 4, type: 'truth', intensity: 'mild', text: 'Quando foi a primeira vez que você fantasiou me beijando?' },
  { id: 5, type: 'truth', intensity: 'mild', text: 'Que música sempre faz você pensar em mim de um jeito romântico?' },
  { id: 6, type: 'truth', intensity: 'mild', text: 'O que na minha personalidade você acha especialmente atraente?' },
  { id: 7, type: 'truth', intensity: 'mild', text: 'Qual roupa minha tem sido a sua favorita ultimamente?' },
  { id: 8, type: 'truth', intensity: 'mild', text: 'Qual elogio meu ainda ficou na sua memória?' },
  { id: 9, type: 'truth', intensity: 'mild', text: 'Que tipo de beijo meu fica mais tempo na sua cabeça?' },
  { id: 10, type: 'truth', intensity: 'mild', text: 'Qual é o seu momento preguiçoso favorito comigo?' },
  { id: 11, type: 'truth', intensity: 'mild', text: 'Dê uma nota para o nosso último beijo. O que faria ele virar nota 11?' },
  { id: 12, type: 'truth', intensity: 'mild', text: 'Qual foi o pensamento mais coqueto que você já teve sobre mim em público?' },
  { id: 13, type: 'truth', intensity: 'mild', text: 'Que parte do meu corpo você observa em segredo mais do que qualquer outra?' },
  { id: 14, type: 'truth', intensity: 'mild', text: 'Quando foi a última vez que eu te deixei aceso(a) só com um olhar?' },
  { id: 15, type: 'truth', intensity: 'mild', text: 'O que você gostaria de experimentar comigo e ainda não me pediu?' },
  { id: 16, type: 'truth', intensity: 'mild', text: 'Se tivéssemos só cinco minutos a sós, como você me seduziria?' },

  { id: 17, type: 'truth', intensity: 'medium', text: 'Que hábito meu chama sua atenção imediatamente?' },
  { id: 18, type: 'truth', intensity: 'medium', text: 'Qual peça de roupa minha você acha absurdamente atraente?' },
  { id: 19, type: 'truth', intensity: 'medium', text: 'Qual foi o pensamento mais ousado que você já teve sobre mim em público?' },
  { id: 20, type: 'truth', intensity: 'medium', text: 'O que eu faço durante um beijo que você queria que eu repetisse mais?' },
  { id: 21, type: 'truth', intensity: 'medium', text: 'Que visual meu te faz querer cancelar os planos e ficar em casa comigo?' },
  { id: 22, type: 'truth', intensity: 'medium', text: 'Em que lugar você gostaria que um beijo meu demorasse um pouco mais?' },
  { id: 23, type: 'truth', intensity: 'medium', text: 'Qual desafio brincalhão você secretamente gostaria que caísse para você?' },
  { id: 24, type: 'truth', intensity: 'medium', text: 'Que tipo de interpretação despertaria sua curiosidade de explorar juntos?' },
  { id: 25, type: 'truth', intensity: 'medium', text: 'Que parte da nossa química parece mais forte ultimamente?' },
  { id: 26, type: 'truth', intensity: 'medium', text: 'De que forma eu poderia te provocar melhor?' },
  { id: 27, type: 'truth', intensity: 'medium', text: 'Que mensagem flertando você adoraria receber de mim esta noite?' },
  { id: 28, type: 'truth', intensity: 'medium', text: 'O que eu faço que cria tensão entre nós bem rápido?' },
  { id: 29, type: 'truth', intensity: 'medium', text: 'Como seria um fim de semana privado comigo na sua cabeça?' },
  { id: 30, type: 'truth', intensity: 'medium', text: 'Que primeiro movimento meu funciona sempre com você?' },
  { id: 31, type: 'truth', intensity: 'medium', text: 'Qual seria sua mensagem perfeita de "te vejo depois" vinda de mim?' },
  { id: 32, type: 'truth', intensity: 'medium', text: 'Que tipo de toque meu faz você derreter mais rápido?' },

  { id: 33, type: 'truth', intensity: 'spicy', text: 'Qual é o beijo mais ousado que você gostaria que eu te desse hoje?' },
  { id: 34, type: 'truth', intensity: 'spicy', text: 'Que ideia digna de fantasia você realmente toparia tentar comigo?' },
  { id: 35, type: 'truth', intensity: 'spicy', text: 'Que cena de filme você mais gostaria de recriar comigo?' },
  { id: 36, type: 'truth', intensity: 'spicy', text: 'Se você pudesse montar o clima desta noite, o que escolheria primeiro?' },
  { id: 37, type: 'truth', intensity: 'spicy', text: 'Em que lugar você gostaria que meus lábios ficassem um pouco mais?' },
  { id: 38, type: 'truth', intensity: 'spicy', text: 'O que eu faço que te faz perder o fio do pensamento?' },
  { id: 39, type: 'truth', intensity: 'spicy', text: 'Que tipo de provocação lenta funciona melhor com você?' },
  { id: 40, type: 'truth', intensity: 'spicy', text: 'Que movimento um pouco mais ousado você confiaria que eu testasse?' },
  { id: 41, type: 'truth', intensity: 'spicy', text: 'Que tipo de elogio meu chega mais forte quando estamos colados?' },
  { id: 42, type: 'truth', intensity: 'spicy', text: 'Qual foi o nosso quase-momento mais intenso ultimamente?' },
  { id: 43, type: 'truth', intensity: 'spicy', text: 'Se eu dissesse para você tomar a iniciativa hoje, o que faria primeiro?' },
  { id: 44, type: 'truth', intensity: 'spicy', text: 'Que desejo secreto você finalmente me contaria hoje?' },

  { id: 45, type: 'truth', intensity: 'wild', text: 'Se tivéssemos uma noite inteira a sós e sem interrupções, o que você ia querer primeiro?' },
  { id: 46, type: 'truth', intensity: 'wild', text: 'Que movimento mais ousado entraria na sua lista de desejos do Blisse?' },
  { id: 47, type: 'truth', intensity: 'wild', text: 'Se eu te desse controle total por um minuto, como você usaria?' },
  { id: 48, type: 'truth', intensity: 'wild', text: 'Que regra brincalhona você adoraria quebrar numa escapada privada de fim de semana?' },

  { id: 101, type: 'dare', intensity: 'mild', text: 'Me dê o beijo na testa mais suave e mais lento possível por 30 segundos.' },
  { id: 102, type: 'dare', intensity: 'mild', text: 'Sustente meu olhar por 45 segundos.' },
  { id: 103, type: 'dare', intensity: 'mild', text: 'Sussurre bem devagar algo que você ama na minha personalidade.' },
  { id: 104, type: 'dare', intensity: 'mild', text: 'Passe a ponta de um dedo pela minha clavícula por 20 segundos.' },
  { id: 105, type: 'dare', intensity: 'mild', text: 'Me mande um áudio dizendo uma coisa que você agradece no nosso relacionamento.' },
  { id: 106, type: 'dare', intensity: 'mild', text: 'Pegue na minha mão e me conduza numa dança lenta de 30 segundos.' },
  { id: 107, type: 'dare', intensity: 'mild', text: 'Me dê um abraço de 20 segundos sem falar nada.' },
  { id: 108, type: 'dare', intensity: 'mild', text: 'Faça três elogios para mim sem repetir nenhum.' },
  { id: 109, type: 'dare', intensity: 'mild', text: 'Encoste seus lábios de leve na minha bochecha e pare logo depois.' },
  { id: 110, type: 'dare', intensity: 'mild', text: 'Descanse sua cabeça no meu ombro por um minuto inteiro.' },
  { id: 111, type: 'dare', intensity: 'mild', text: 'Beije as costas da minha mão como se estivéssemos num filme.' },
  { id: 112, type: 'dare', intensity: 'mild', text: 'Desenhe um coração nas minhas costas e me deixe adivinhar.' },
  { id: 113, type: 'dare', intensity: 'mild', text: 'Escolha nossa próxima música e me faça balançar com você.' },
  { id: 114, type: 'dare', intensity: 'mild', text: 'Brinque com meu cabelo por 30 segundos como se estivesse com saudade.' },
  { id: 115, type: 'dare', intensity: 'mild', text: 'Me diga exatamente como você flertaria comigo num primeiro encontro.' },
  { id: 116, type: 'dare', intensity: 'mild', text: 'Me dê um olhar de "te vejo depois" sem usar palavras.' },

  { id: 117, type: 'dare', intensity: 'medium', text: 'Me dê uma massagem de ombro ou pescoço de 15 segundos usando só os lábios.' },
  { id: 118, type: 'dare', intensity: 'medium', text: 'Venda os próprios olhos e tente adivinhar que parte de mim está tocando você; você tem três chances.' },
  { id: 119, type: 'dare', intensity: 'medium', text: 'Me mande uma mensagem bem provocante, mas sem exagerar, como se a gente tivesse acabado de se conhecer.' },
  { id: 120, type: 'dare', intensity: 'medium', text: 'Beije meu pescoço por 30 segundos, sem usar as mãos.' },
  { id: 121, type: 'dare', intensity: 'medium', text: 'Tire uma camada externa de roupa e depois me beije mantendo contato visual.' },
  { id: 122, type: 'dare', intensity: 'medium', text: 'Me dê um beijo lento e provocante perto da coxa e pare antes.' },
  { id: 123, type: 'dare', intensity: 'medium', text: 'Deixe eu guiar sua mão pela minha cintura e minhas costas por 30 segundos.' },
  { id: 124, type: 'dare', intensity: 'medium', text: 'Venda meus olhos e me beije em qualquer parte do corpo, menos na boca, três vezes.' },
  { id: 125, type: 'dare', intensity: 'medium', text: 'Sente no meu colo de frente para mim e balance devagar por 30 segundos.' },
  { id: 126, type: 'dare', intensity: 'medium', text: 'Recrie a cena de beijo de filme mais dramática que você conseguir imaginar.' },
  { id: 127, type: 'dare', intensity: 'medium', text: 'Fale só com cantadas ruins nas próximas três rodadas.' },
  { id: 128, type: 'dare', intensity: 'medium', text: 'Tente me elogiar usando apenas metáforas com comida por 30 segundos.' },
  { id: 129, type: 'dare', intensity: 'medium', text: 'Me mostre seu melhor passo sexy com uma música completamente ridícula.' },
  { id: 130, type: 'dare', intensity: 'medium', text: 'Faça seu melhor gesto de "vem cá" em câmera lenta.' },
  { id: 131, type: 'dare', intensity: 'medium', text: 'Trace uma linha do meu pulso até meu ombro com os seus lábios.' },
  { id: 132, type: 'dare', intensity: 'medium', text: 'Deixe eu escolher o próximo desafio que você vai fazer, sem negociar.' },

  { id: 133, type: 'dare', intensity: 'spicy', text: 'Tire uma camada externa e depois me beije por 20 segundos.' },
  { id: 134, type: 'dare', intensity: 'spicy', text: 'Beije meu pescoço e minha clavícula por 30 segundos.' },
  { id: 135, type: 'dare', intensity: 'spicy', text: 'Deixe eu guiar seus pulsos enquanto a gente se beija por 20 segundos.' },
  { id: 136, type: 'dare', intensity: 'spicy', text: 'Faça uma lap dance de 30 segundos para mim; música opcional.' },
  { id: 137, type: 'dare', intensity: 'spicy', text: 'Use um cubo de gelo para traçar uma linha lenta pelo meu braço ou ombro.' },
  { id: 138, type: 'dare', intensity: 'spicy', text: 'Sente no meu colo, de roupa, e sustente o olhar por 20 segundos.' },
  { id: 139, type: 'dare', intensity: 'spicy', text: 'Deixe eu escolher exatamente onde pousam seus próximos três beijos.' },
  { id: 140, type: 'dare', intensity: 'spicy', text: 'Sussurre o que você gostaria desta noite sem dizer nada explícito.' },
  { id: 141, type: 'dare', intensity: 'spicy', text: 'Me dê um beijo lento, se afaste e me faça pedir outro.' },
  { id: 142, type: 'dare', intensity: 'spicy', text: 'Deixe eu vendar seus olhos enquanto te dou três beijos provocantes.' },
  { id: 143, type: 'dare', intensity: 'spicy', text: 'Recrie seu melhor momento de filme "a gente não devia estar fazendo isso".' },
  { id: 144, type: 'dare', intensity: 'spicy', text: 'Me diga "depois" com a linguagem do seu corpo, não com palavras.' },

  { id: 145, type: 'dare', intensity: 'wild', text: 'Deixe seu par escolher verdade ou desafio para a sua próxima rodada, sem veto.' },
  { id: 146, type: 'dare', intensity: 'wild', text: 'Faça uma dança lenta de 60 segundos que termine em beijo.' },
  { id: 147, type: 'dare', intensity: 'wild', text: 'Tire mais uma camada de roupa se você estiver confortável e assuma o momento.' },
  { id: 148, type: 'dare', intensity: 'wild', text: 'Deixe seu par dirigir seus próximos 30 segundos de flerte.' },
  { id: 149, type: 'dare', intensity: 'wild', text: 'Faça uma contagem dramática até um beijo e pare no último segundo.' },
  { id: 150, type: 'dare', intensity: 'wild', text: 'Escolha um prompt do Blisse que você vem evitando e coloque no plano desta noite.' },
];
