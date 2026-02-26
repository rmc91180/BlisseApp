/**
 * ES / PT translations for appConfig UI content.
 * English originals stay in appConfig.ts; these are the localized mirrors.
 */

// ===== HOME SPARK MESSAGES =====

export const HOME_SPARK_MESSAGES_ES: Array<{ headline: string; body: string }> = [
  {
    headline: 'Enciende la chispa esta noche 💕',
    body: 'Caricias juguetonas, susurros sinceros y una pequeña aventura a la vez.',
  },
  {
    headline: 'La conexión te sienta bien ✨',
    body: 'Abre Blisse, elige un mood y convierte momentos simples en recuerdos cómplices.',
  },
  {
    headline: 'Menos scroll, más química 😘',
    body: 'Elige un mood y deja que la app los guíe a algo inolvidable.',
  },
  {
    headline: 'Tu historia de amor, con niveles extra 🌙',
    body: 'Colecciona estrellas, desbloquea sorpresas y mantén la chispa toda la semana.',
  },
  {
    headline: 'Corazones cálidos. Sonrisas traviesas. 🔥',
    body: 'Un poco de intención esta noche puede sentirse como un gran reinicio para ambos.',
  },
];

export const HOME_SPARK_MESSAGES_PT: Array<{ headline: string; body: string }> = [
  {
    headline: 'Acenda a chama hoje à noite 💕',
    body: 'Toques divertidos, sussurros sinceros e uma pequena aventura de cada vez.',
  },
  {
    headline: 'Conexão combina com você ✨',
    body: 'Abra o Blisse, escolha um vibe e transforme momentos comuns em segredos de vocês.',
  },
  {
    headline: 'Menos rolagem, mais química 😘',
    body: 'Escolha um mood e deixe o app guiar vocês dois para algo inesquecível.',
  },
  {
    headline: 'Sua história de amor, com fases bônus 🌙',
    body: 'Colecione estrelas, desbloqueie surpresas e mantenham a cumplicidade a semana toda.',
  },
  {
    headline: 'Corações quentes. Sorrisos travessos. 🔥',
    body: 'Um pouco de intenção hoje à noite pode ser o recomeço que vocês dois precisam.',
  },
];

// ===== TONIGHT SUGGESTION TEASERS =====

export const TONIGHT_SUGGESTION_TEASERS_ES: string[] = [
  'Listos para una aventura acogedora? Sin prisa, solo intimidad divertida.',
  'Esta noche es para mirarse a los ojos, reírse y dar un paso atrevido.',
  'Empiecen suave, sigan curiosos, y dejen que la química haga lo suyo.',
  'Menos presión, más presencia y mucha más diversión.',
  'Una chispa ahora, un recuerdo inolvidable después.',
];

export const TONIGHT_SUGGESTION_TEASERS_PT: string[] = [
  'Prontos para uma aventura aconchegante? Sem pressa, só intimidade divertida.',
  'Hoje é para olhar nos olhos, rir e dar um passo ousado.',
  'Comecem devagar, continuem curiosos e deixem a química fazer o resto.',
  'Menos cobrança, mais presença e muito mais diversão.',
  'Uma faísca agora, uma memória inesquecível depois.',
];

// ===== LEVEL MOTIVATOR LINES =====

export const LEVEL_MOTIVATOR_LINES_ES: string[] = [
  'Cada estrella es un pequeño voto por su relación.',
  'Están construyendo confianza, diversión y ritmo juntos.',
  'El progreso es atractivo. Sigan así, enamorados.',
  'De Novatos a Llama Eterna, un paso divertido a la vez.',
  'No solo están subiendo de nivel en la app. Están subiendo de nivel como pareja.',
];

export const LEVEL_MOTIVATOR_LINES_PT: string[] = [
  'Cada estrela é um pequeno voto pelo relacionamento de vocês.',
  'Vocês estão construindo confiança, diversão e sintonia juntos.',
  'Progresso é atraente. Continuem assim, pombinhos.',
  'De Novatos a Chama Eterna, um passo divertido de cada vez.',
  'Vocês não estão só subindo de nível no app. Estão subindo de nível juntos.',
];

// ===== SEASONAL HOME SPARK MESSAGES =====

export const SEASONAL_HOME_SPARK_MESSAGES_ES: Record<string, Array<{ headline: string; body: string }>> = {
  valentines: [
    { headline: 'Energía de San Valentín, todo el mes 💕', body: 'Rituales románticos, retos divertidos y contacto visual extra esta noche.' },
    { headline: 'Aquí las cartas de amor son bienvenidas 🌹', body: 'Que sea dulce, coqueto y un poquito atrevido de la mejor manera.' },
  ],
  spring: [
    { headline: 'La primavera es tu botón de reinicio 🌸', body: 'Nuevo ánimo, nueva energía, nuevas historias para crear juntos.' },
    { headline: 'Nueva estación, nuevas chispas 🌿', body: 'Prueben algo nuevo esta noche y dejen que la curiosidad los guíe.' },
  ],
  summer: [
    { headline: 'Noches calientes de verano desbloqueadas ☀️', body: 'Retos divertidos, vibras espontáneas y cero sobrepensar.' },
    { headline: 'Súbanle al calor, mantengan la diversión 🍹', body: 'Modo aventura activado. Elijan un reto y a jugar.' },
  ],
  fall: [
    { headline: 'Temporada acogedora, conexión más cercana 🍂', body: 'Más despacio, más calidez, y la tensión juguetona siempre viva.' },
    { headline: 'Noches de otoño, luces más suaves 🕯️', body: 'Comodidad más química es una combinación imbatible.' },
  ],
  winter: [
    { headline: 'El calorcito invernal empieza aquí ❄️', body: 'Cobijas, calor corporal y cercanía intencional.' },
    { headline: 'Frío afuera, chispa adentro 🔥', body: 'Haz que esta noche se sienta como tu secreto favorito.' },
  ],
  newyear: [
    { headline: 'Año nuevo, mismo amor, juego más atrevido 🎆', body: 'Fija una intención divertida y hazla realidad esta noche.' },
    { headline: 'Energía de capítulo nuevo ✨', body: 'Pequeños rituales compartidos hoy, gran impulso de pareja mañana.' },
  ],
};

export const SEASONAL_HOME_SPARK_MESSAGES_PT: Record<string, Array<{ headline: string; body: string }>> = {
  valentines: [
    { headline: 'Energia de Dia dos Namorados o mês inteiro 💕', body: 'Rituais românticos, desafios divertidos e contato visual extra hoje à noite.' },
    { headline: 'Bilhetinhos de amor são bem-vindos aqui 🌹', body: 'Mantenham doce, sedutor e um pouquinho ousado da melhor forma.' },
  ],
  spring: [
    { headline: 'A primavera é o botão de reinício de vocês 🌸', body: 'Novo ânimo, nova energia, novas histórias para criarem juntos.' },
    { headline: 'Nova estação, novas faíscas 🌿', body: 'Experimentem algo novo hoje e deixem a curiosidade guiar.' },
  ],
  summer: [
    { headline: 'Noites quentes de verão desbloqueadas ☀️', body: 'Desafios divertidos, vibe espontânea e zero encucação.' },
    { headline: 'Aumentem o calor, mantenham a diversão 🍹', body: 'Modo aventura ativado. Escolham um desafio e partam pra ação.' },
  ],
  fall: [
    { headline: 'Temporada aconchegante, conexão mais íntima 🍂', body: 'Desacelerem, se aqueçam e mantenham a tensão gostosa no ar.' },
    { headline: 'Noites de outono, luzes mais suaves 🕯️', body: 'Conforto mais química é uma combinação perfeita.' },
  ],
  winter: [
    { headline: 'O aconchego do inverno começa aqui ❄️', body: 'Cobertores, calor corporal e proximidade intencional.' },
    { headline: 'Frio lá fora, faísca aqui dentro 🔥', body: 'Façam dessa noite o segredo favorito de vocês.' },
  ],
  newyear: [
    { headline: 'Ano novo, mesmo amor, jogo mais ousado 🎆', body: 'Definam uma intenção divertida e realizem ela hoje à noite.' },
    { headline: 'Energia de capítulo novo ✨', body: 'Pequenos rituais compartilhados agora, grande impulso no relacionamento depois.' },
  ],
};

// ===== SEASONAL TONIGHT TEASERS =====

export const SEASONAL_TONIGHT_TEASERS_ES: Record<string, string[]> = {
  valentines: ['Romántico y juguetón, con la cantidad justa de calor.'],
  spring: ['Cita con energía fresca: comienzo suave, final atrevido.'],
  summer: ['Espontáneo y picante, sin ninguna presión.'],
  fall: ['Acogedor, cercano e imposible de apurar.'],
  winter: ['Caliéntense despacio y quédense cerquita más tiempo.'],
  newyear: ['Prueben algo nuevo y llámenlo su ritual de la suerte.'],
};

export const SEASONAL_TONIGHT_TEASERS_PT: Record<string, string[]> = {
  valentines: ['Romântico e divertido, com a dose certa de calor.'],
  spring: ['Encontro com energia renovada: começo suave, final ousado.'],
  summer: ['Espontâneo e picante, sem pressão nenhuma.'],
  fall: ['Aconchegante, íntimo e impossível de apressar.'],
  winter: ['Aqueçam-se devagar e fiquem juntinhos por mais tempo.'],
  newyear: ['Experimentem algo novo e chamem de ritual da sorte de vocês.'],
};

// ===== SEASONAL HOOK LINES =====

export const SEASONAL_HOOK_LINES_ES: Record<string, string[]> = {
  valentines: ['Transforma noches normales en energía de festival del amor.'],
  spring: ['Nuevos comienzos y experimentos divertidos los esperan.'],
  summer: ['Noches más largas, decisiones más atrevidas, más risas.'],
  fall: ['Comodidad y química se encuentran en cada momento acogedor.'],
  winter: ['Calor corporal y cercanía son toda la vibra.'],
  newyear: ['Comienzos frescos y primeros pasos atrevidos.'],
};

export const SEASONAL_HOOK_LINES_PT: Record<string, string[]> = {
  valentines: ['Transforme noites comuns em energia de festa do amor.'],
  spring: ['Novos começos e experiências divertidas esperam por vocês.'],
  summer: ['Noites mais longas, escolhas mais ousadas, mais risadas.'],
  fall: ['Conforto e química se encontram em cada momento aconchegante.'],
  winter: ['Calor corporal e proximidade são toda a vibe.'],
  newyear: ['Recomeços e primeiros passos ousados.'],
};

// ===== COUPLE CONNECTION PROMPTS =====

export const COUPLE_PROMPTS_ES = [
  { emoji: '\u{1F4AC}', text: '\u00BFQu\u00E9 los hizo sonre\u00EDr hoy? Preg\u00FAntense mutuamente' },
  { emoji: '\u{1F495}', text: 'Compartan algo que aprecian de su pareja' },
  { emoji: '\u{1FAC2}', text: 'T\u00F3mense de las manos 30 segundos y respiren juntos' },
  { emoji: '\u{1F48C}', text: 'Escr\u00EDbanse una nota de amor de una l\u00EDnea' },
  { emoji: '\u{1F440}', text: 'M\u00EDrense a los ojos durante 10 segundos' },
  { emoji: '\u{1F3B5}', text: 'Pongan "su canci\u00F3n" y bailen juntos' },
  { emoji: '\u{1F48B}', text: 'Dale a tu pareja un beso inesperado en la frente' },
  { emoji: '\u{1F31F}', text: 'Compartan su recuerdo favorito juntos' },
  { emoji: '\u{1F917}', text: 'Un abrazo de 20 segundos \u2014 sin celulares, solo presencia' },
  { emoji: '\u{1F525}', text: 'Sus\u00FArrale algo irresistible que amas de tu pareja' },
];

export const COUPLE_PROMPTS_PT = [
  { emoji: '\u{1F4AC}', text: 'O que fez voc\u00EAs sorrirem hoje? Perguntem um ao outro' },
  { emoji: '\u{1F495}', text: 'Compartilhem algo que apreciam no parceiro(a)' },
  { emoji: '\u{1FAC2}', text: 'Deem as m\u00E3os por 30 segundos e respirem juntos' },
  { emoji: '\u{1F48C}', text: 'Escrevam um bilhetinho de amor de uma linha' },
  { emoji: '\u{1F440}', text: 'Olhem nos olhos um do outro por 10 segundos' },
  { emoji: '\u{1F3B5}', text: 'Coloquem "a m\u00FAsica de voc\u00EAs" e dancem juntos' },
  { emoji: '\u{1F48B}', text: 'D\u00EA um beijo inesperado na testa do seu amor' },
  { emoji: '\u{1F31F}', text: 'Compartilhem a mem\u00F3ria favorita de voc\u00EAs' },
  { emoji: '\u{1F917}', text: 'Um abra\u00E7o de 20 segundos \u2014 sem celular, s\u00F3 presen\u00E7a' },
  { emoji: '\u{1F525}', text: 'Sussurre algo irresist\u00EDvel que ama no(a) parceiro(a)' },
];

// ===== NOTIFICATION TITLE =====

export const DAILY_JOKE_NOTIFICATION_TITLE_ES = 'Blisse - Provocación Diaria 💌';
export const DAILY_JOKE_NOTIFICATION_TITLE_PT = 'Blisse - Provocação Diária 💌';
