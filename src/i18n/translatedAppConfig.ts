/**
 * ES / PT translations for appConfig UI content.
 * English originals stay in appConfig.ts; these are the localized mirrors.
 */

// ===== HOME SPARK MESSAGES =====

export const HOME_SPARK_MESSAGES_ES: Array<{ headline: string; body: string }> = [
  {
    headline: 'Misión de hoy: hacer que se sonrojen 😈',
    body: 'Elijan una idea juguetona y síganla hasta el final.',
  },
  {
    headline: 'Menos pensar, más química ✨',
    body: 'Abre Blisse, elige un mood y deja que el ritmo haga lo suyo.',
  },
  {
    headline: 'Energía de cita en menos de 2 minutos 😘',
    body: 'Un prompt, un reto y un beso pueden cambiar toda la noche.',
  },
  {
    headline: 'Tu historia de amor desbloqueó niveles extra 🌙',
    body: 'Coleccionen estrellas, cuiden la racha y mantengan la diversión con intención.',
  },
  {
    headline: 'Corazones cálidos. Travesuras suaves. 🔥',
    body: 'Pequeños momentos intencionales ahora, recuerdos inolvidables después.',
  },
];

export const HOME_SPARK_MESSAGES_PT: Array<{ headline: string; body: string }> = [
  {
    headline: 'Missão de hoje: fazer vocês corarem 😈',
    body: 'Escolham uma ideia divertida e sigam até o fim.',
  },
  {
    headline: 'Menos pensar, mais química ✨',
    body: 'Abra o Blisse, escolha um mood e deixe o clima conduzir.',
  },
  {
    headline: 'Clima de date em menos de 2 minutos 😘',
    body: 'Uma ideia, um desafio e um beijo podem virar a noite.',
  },
  {
    headline: 'A história de vocês acabou de ganhar níveis bônus 🌙',
    body: 'Colecionem estrelas, mantenham a sequência e curtam com intenção.',
  },
  {
    headline: 'Corações quentes. Travessura na medida. 🔥',
    body: 'Pequenos momentos intencionais agora, memórias inesquecíveis depois.',
  },
];

// ===== TONIGHT SUGGESTION TEASERS =====

export const TONIGHT_SUGGESTION_TEASERS_ES: string[] = [
  '¿Listos para una aventura acogedora? Empiecen suave y sigan curiosos.',
  'Esta noche es para mirarse, reír y dar un paso atrevido.',
  'Sin presión. Solo presencia, juego y buena química.',
  'Elijan una idea y háganla su pequeño secreto.',
  'Una chispa ahora, un recuerdo inolvidable después.',
];

export const TONIGHT_SUGGESTION_TEASERS_PT: string[] = [
  'Prontos para uma aventura aconchegante? Comecem leve e sigam curiosos.',
  'Hoje é noite de olhar nos olhos, rir e dar um passo ousado.',
  'Sem pressão. Só presença, brincadeira e boa química.',
  'Escolham uma ideia e tratem como segredo favorito.',
  'Uma faísca agora, uma memória inesquecível depois.',
];

// ===== LEVEL MOTIVATOR LINES =====

export const LEVEL_MOTIVATOR_LINES_ES: string[] = [
  'Cada estrella hace que el próximo reto se sienta mejor.',
  'Están construyendo confianza, juego y ritmo juntos.',
  'El progreso es atractivo. Sigan así, enamorados.',
  'De Nuevas Chispas a Llama Eterna, un paso juguetón a la vez.',
  'No solo suben de nivel en la app. También como pareja.',
];

export const LEVEL_MOTIVATOR_LINES_PT: string[] = [
  'Cada estrela deixa o próximo desafio ainda melhor.',
  'Vocês estão construindo confiança, jogo e sintonia juntos.',
  'Progresso é atraente. Continuem assim, pombinhos.',
  'De Novas Faíscas até Chama Eterna, um passo de cada vez.',
  'Vocês não estão só subindo no app. Estão subindo juntos.',
];

// ===== SEASONAL HOME SPARK MESSAGES =====

export const SEASONAL_HOME_SPARK_MESSAGES_ES: Record<string, Array<{ headline: string; body: string }>> = {
  valentines: [
    { headline: 'Energía de San Valentín, todo el mes 💕', body: 'Más mirada, más besos y un toque de travesura esta noche.' },
    { headline: 'Aquí las cartas de amor son bienvenidas 🌹', body: 'Que sea dulce, coqueto y un poco más atrevido de lo normal.' },
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
    { headline: 'El calorcito invernal empieza aquí ❄️', body: 'Cobijas, calor corporal y cero excusas.' },
    { headline: 'Frío afuera, chispa adentro 🔥', body: 'Haz que esta noche se sienta como tu secreto favorito.' },
  ],
  newyear: [
    { headline: 'Año nuevo, mismo amor, juego más atrevido 🎆', body: 'Fija una intención divertida y hazla realidad esta noche.' },
    { headline: 'Energía de capítulo nuevo ✨', body: 'Pequeños rituales compartidos hoy, gran impulso de pareja mañana.' },
  ],
};

export const SEASONAL_HOME_SPARK_MESSAGES_PT: Record<string, Array<{ headline: string; body: string }>> = {
  valentines: [
    { headline: 'Energia de Dia dos Namorados o mês inteiro 💕', body: 'Mais olho no olho, mais beijos e travessura na medida hoje à noite.' },
    { headline: 'Bilhetinhos de amor são bem-vindos aqui 🌹', body: 'Mantenham doce, sedutor e um pouco mais ousado que o normal.' },
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
    { headline: 'O aconchego do inverno começa aqui ❄️', body: 'Cobertor, calor corporal e zero desculpas.' },
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
  valentines: ['Modo San Valentín: más miradas, más besos, más juego.'],
  spring: ['Nuevos comienzos y experimentos divertidos los esperan.'],
  summer: ['Noches más largas, decisiones más atrevidas, más risas.'],
  fall: ['Comodidad y química se encuentran en cada momento acogedor.'],
  winter: ['Cobija + calor corporal + intención juguetona = plan perfecto.'],
  newyear: ['Comienzos frescos y primeros pasos atrevidos.'],
};

export const SEASONAL_HOOK_LINES_PT: Record<string, string[]> = {
  valentines: ['Clima de Dia dos Namorados: mais olhar, mais beijo, mais brincadeira.'],
  spring: ['Novos começos e experiências divertidas esperam por vocês.'],
  summer: ['Noites mais longas, escolhas mais ousadas, mais risadas.'],
  fall: ['Conforto e química se encontram em cada momento aconchegante.'],
  winter: ['Cobertor + calor corporal + intenção divertida = noite perfeita.'],
  newyear: ['Recomeços e primeiros passos ousados.'],
};

// ===== COUPLE CONNECTION PROMPTS =====

export const COUPLE_PROMPTS_ES = [
  { emoji: '\u{1F4AC}', text: 'Pregunten: ¿cuándo te sentiste más deseado esta semana?' },
  { emoji: '\u{1F48B}', text: 'Un beso lento y juguetón. Sin prisa.' },
  { emoji: '\u{1F4A5}', text: 'Compartan una idea atrevida para esta noche.' },
  { emoji: '\u{1F3B5}', text: 'Pongan su canción y bailen un minuto completo.' },
  { emoji: '\u{1F525}', text: 'Susurra una cosa irresistible de tu pareja.' },
  { emoji: '\u{1F917}', text: 'Reto de abrazo 20 segundos. Sin celular.' },
  { emoji: '\u{1F4CC}', text: 'Califiquen anoche del 1 al 10 y súbanlo hoy.' },
  { emoji: '\u{1F440}', text: 'Contacto visual 15 segundos, luego sigan el momento.' },
  { emoji: '\u{1F48C}', text: 'Escribe una nota corta de “nos vemos luego”.' },
  { emoji: '\u{1F31F}', text: 'Compartan su recuerdo más travieso y tierno.' },
];

export const COUPLE_PROMPTS_PT = [
  { emoji: '\u{1F4AC}', text: 'Perguntem: quando você se sentiu mais desejado nesta semana?' },
  { emoji: '\u{1F48B}', text: 'Um beijo lento e provocante. Sem pressa.' },
  { emoji: '\u{1F4A5}', text: 'Compartilhem uma ideia ousada para hoje à noite.' },
  { emoji: '\u{1F3B5}', text: 'Toquem a música de vocês e dancem por 1 minuto.' },
  { emoji: '\u{1F525}', text: 'Sussurre uma coisa irresistível sobre seu amor.' },
  { emoji: '\u{1F917}', text: 'Desafio do abraço: 20 segundos, sem celular.' },
  { emoji: '\u{1F4CC}', text: 'Dê uma nota para ontem e tentem superar hoje.' },
  { emoji: '\u{1F440}', text: 'Contato visual por 15 segundos e sigam o clima.' },
  { emoji: '\u{1F48C}', text: 'Escreva um bilhete curto de “te encontro depois”.' },
  { emoji: '\u{1F31F}', text: 'Compartilhem a lembrança mais travessa e carinhosa.' },
];

// ===== NOTIFICATION TITLE =====

export const DAILY_JOKE_NOTIFICATION_TITLE_ES = 'Blisse - Provocación Diaria 💌';
export const DAILY_JOKE_NOTIFICATION_TITLE_PT = 'Blisse - Provocação Diária 💌';
