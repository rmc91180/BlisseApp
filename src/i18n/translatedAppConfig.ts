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
    body: 'Abre Blisse, elige el ambiente y deja que el ritmo haga lo suyo.',
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
    body: 'Abra o Blisse, escolha o clima e deixe a noite conduzir.',
  },
  {
    headline: 'Clima de encontro em menos de 2 minutos 😘',
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
  san_valentin: [
    { headline: 'Energía de San Valentín, todo el mes 💕', body: 'Más mirada, más besos y un toque de travesura esta noche.' },
    { headline: 'Aquí las cartas de amor son bienvenidas 🌹', body: 'Que sea dulce, coqueto y un poco más atrevido de lo normal.' },
  ],
  ano_nuevo_latam: [
    { headline: 'Año nuevo, chispa nueva 🎆', body: 'Empiecen el año con intención compartida y un poquito de picardía.' },
    { headline: 'La mejor cuenta regresiva es en pareja ✨', body: 'Un beso planeado y una idea nueva pueden cambiar todo el mes.' },
  ],
  semana_santa: [
    { headline: 'Tiempo de pausa, tiempo para ustedes 🌿', body: 'Desaceleren, respiren y conviertan la noche en un pequeño ritual.' },
    { headline: 'Una escapada suave también puede ser en casa 🕯️', body: 'Menos prisa, más presencia y una curiosidad que se note.' },
  ],
  verano_latino: [
    { headline: 'Verano latino: calor, música y antojo ☀️', body: 'Una noche ligera, una idea atrevida y cero sobrepensar.' },
    { headline: 'Lleven la energía de escapada hasta su habitación 🍹', body: 'Que la noche se sienta espontánea, viva y muy de ustedes.' },
  ],
  fiestas_patrias: [
    { headline: 'Fiestas Patrias con química extra 🎉', body: 'Lleven la energía de la celebración hacia algo más íntimo.' },
    { headline: 'Cuando se acaba la fiesta, empieza lo bueno 💃', body: 'Una canción, una sonrisa y un plan pequeño pueden hacer magia.' },
  ],
  dia_de_muertos_nochevieja: [
    { headline: 'Recuerdos tiernos, noche encendida 🕯️', body: 'Honren lo vivido y creen algo nuevo antes de que termine el año.' },
    { headline: 'De los recuerdos a la chispa de hoy ✨', body: 'Una noche cercana, suave y con ese calorcito que sí se queda.' },
  ],
};

export const SEASONAL_HOME_SPARK_MESSAGES_PT: Record<string, Array<{ headline: string; body: string }>> = {
  verao_brasil: [
    { headline: 'Verão brasileiro, química sem pressa 🌴', body: 'Mais leveza, mais calor gostoso e uma noite com cara de férias.' },
    { headline: 'Tragam a energia da praia para dentro de casa ☀️', body: 'Pouco planejamento, muito clima e vontade de ficar perto.' },
  ],
  carnaval: [
    { headline: 'Carnaval para dois: fantasia e provocação 🎭', body: 'Mantenham divertido, leve e um pouquinho mais ousado que o normal.' },
    { headline: 'Quando a folia termina, a brincadeira continua 💋', body: 'Escolham um papel, um acessório ou um desafio para começar.' },
  ],
  outono_a_dois: [
    { headline: 'Outono a dois: menos correria, mais presença 🍁', body: 'Criem um clima calmo e deixem a noite crescer no ritmo de vocês.' },
    { headline: 'Conforto e química fazem um par perfeito 🕯️', body: 'Mais aconchego, mais sintonia e um pouco de travessura boa.' },
  ],
  dia_dos_namorados: [
    { headline: 'Dia dos Namorados com clima especial 💘', body: 'Mais carinho, mais intenção e aquele beijo que demora um pouco mais.' },
    { headline: 'Bilhetes, detalhes e uma boa surpresa 🌹', body: 'Mantenham romântico, gostoso e com espaço para a brincadeira.' },
  ],
  inverno_carinhoso: [
    { headline: 'Inverno carinhoso desbloqueado ❄️', body: 'Cobertor, pele quente e zero motivo para ficar distante.' },
    { headline: 'Frio lá fora, conexão aqui dentro 🔥', body: 'Façam dessa noite o refúgio favorito de vocês.' },
  ],
  primavera_brasil: [
    { headline: 'Primavera brasileira: leveza e curiosidade 🌺', body: 'Uma boa noite para testar algo novo sem tirar a delicadeza do caminho.' },
    { headline: 'Mais cor, mais clima, mais vontade de brincar 🌿', body: 'Deixem a estação lembrar vocês de recomeçar com charme.' },
  ],
  reveillon: [
    { headline: 'Réveillon a dois, com promessa boa 🥂', body: 'Escolham um desejo para o ano e comecem hoje à noite.' },
    { headline: 'Virada com brilho, beijo e intenção ✨', body: 'Façam da última noite do ano o primeiro capítulo do próximo.' },
  ],
};

// ===== SEASONAL TONIGHT TEASERS =====

export const SEASONAL_TONIGHT_TEASERS_ES: Record<string, string[]> = {
  ano_nuevo_latam: ['Capítulo nuevo, beso largo y una idea que marque el tono del mes.'],
  san_valentin: ['Romántico, coqueto y con esa subida de temperatura que sí se nota.'],
  semana_santa: ['Bajen el ritmo y dejen que la tensión suba sola.'],
  verano_latino: ['Espontáneo, cálido y con sabor a escapada.'],
  fiestas_patrias: ['Celebren, vuelvan a casa y conviertan la energía en química.'],
  dia_de_muertos_nochevieja: ['Una noche íntima para recordar, agradecer y encender algo nuevo.'],
};

export const SEASONAL_TONIGHT_TEASERS_PT: Record<string, string[]> = {
  verao_brasil: ['Leve, quente e com aquela energia boa de férias a dois.'],
  carnaval: ['Fantasia, sorriso e um primeiro passo mais ousado.'],
  outono_a_dois: ['Comecem devagar e deixem a química fazer o resto.'],
  dia_dos_namorados: ['Romance com presença, detalhe e um pouco mais de calor.'],
  inverno_carinhoso: ['Aqueçam-se com calma e demorem mais um pouco juntos.'],
  primavera_brasil: ['Clima novo, faísca nova e espaço para tentar algo diferente.'],
  reveillon: ['Fechem o ano com intenção e abram o próximo com coragem.'],
};

// ===== SEASONAL HOOK LINES =====

export const SEASONAL_HOOK_LINES_ES: Record<string, string[]> = {
  ano_nuevo_latam: ['Año nuevo, intención compartida y pasos juguetones.'],
  san_valentin: ['Más mirada, más beso, más complicidad.'],
  semana_santa: ['Pausa rica, conexión suave y curiosidad despierta.'],
  verano_latino: ['Calor, música y más ganas de decir que sí.'],
  fiestas_patrias: ['La celebración también puede terminar en ternura y fuego.'],
  dia_de_muertos_nochevieja: ['Recuerdos dulces y una chispa lista para cerrar el año.'],
};

export const SEASONAL_HOOK_LINES_PT: Record<string, string[]> = {
  verao_brasil: ['Mais leveza, mais calor e mais chance de dizer “fica mais”.'],
  carnaval: ['Brincadeira boa, fantasia leve e química solta.'],
  outono_a_dois: ['Conforto e conexão andando lado a lado.'],
  dia_dos_namorados: ['Mais presença, mais carinho, mais clima.'],
  inverno_carinhoso: ['Cobertor, corpo perto e intenção divertida.'],
  primavera_brasil: ['Recomeço leve com curiosidade e charme.'],
  reveillon: ['Virada com coragem, beijo e promessa boa.'],
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
export const DAILY_JOKE_NOTIFICATION_TITLE_HI = 'Blisse - आज की छेड़छाड़ 💌';

export const HOME_SPARK_MESSAGES_HI: Array<{ headline: string; body: string }> = [
  {
    headline: 'आज का छोटा-सा मकसद: एक-दूसरे को मुस्कुराना 😈',
    body: 'एक चुलबुला विचार चुनिए और उसे पूरी तरह निभाइए।',
  },
  {
    headline: 'कम सोचना, ज़्यादा जुड़ाव ✨',
    body: 'Blisse खोलिए, मन का रंग चुनिए, और रात को अपने ढंग से बहने दीजिए।',
  },
  {
    headline: 'दो मिनट में डेट-नाइट वाली ऊर्जा 😘',
    body: 'एक सुझाव, एक हल्की चुनौती और एक लंबा चुंबन पूरी रात का रंग बदल सकते हैं।',
  },
  {
    headline: 'आपकी प्रेम कहानी ने नया पड़ाव खोला 🌙',
    body: 'सितारे जुटाइए, सिलसिला बनाए रखिए और जुड़ाव को इरादे से मजबूत कीजिए।',
  },
  {
    headline: 'गर्म दिल, हल्की शरारत, और अच्छी यादें 🔥',
    body: 'छोटे इरादतन पल अभी, यादगार नज़दीकी बाद में।',
  },
];

export const TONIGHT_SUGGESTION_TEASERS_HI: string[] = [
  'आज की रात को हल्के से शुरू कीजिए और जिज्ञासा को आगे बढ़ने दीजिए।',
  'आज नज़रें मिलें, हँसी आए और एक निडर शुरुआत हो।',
  'कोई दबाव नहीं। बस मौजूदगी, खेल और अच्छा जुड़ाव।',
  'एक विचार चुनिए और उसे अपने छोटे-से निजी रिवाज़ की तरह निभाइए।',
  'छोटी-सी चिंगारी अभी, प्यारी याद बाद में।',
];

export const LEVEL_MOTIVATOR_LINES_HI: string[] = [
  'हर सितारा अगली शाम को थोड़ा और खास बना देता है।',
  'आप दोनों साथ मिलकर भरोसा, चंचलता और लय बना रहे हैं।',
  'प्रगति आकर्षक होती है। ऐसे ही आगे बढ़िए।',
  'नई चिंगारियों से अनंत लौ तक, एक चुलबुले कदम में।',
  'आप सिर्फ ऐप में नहीं, अपने रिश्ते में भी आगे बढ़ रहे हैं।',
];

export const SEASONAL_HOME_SPARK_MESSAGES_HI: Record<string, Array<{ headline: string; body: string }>> = {
  makar_sankranti: [
    { headline: 'नई धूप, नया इरादा, नई चिंगारी 🪁', body: 'आज रात को हल्केपन और चुलबुली गर्माहट से शुरू कीजिए।' },
    { headline: 'छोटा-सा रिवाज़, गहरा जुड़ाव ✨', body: 'एक ऐसा पल बनाइए जिसे आप फिर दोहराना चाहें।' },
  ],
  basant_panchami: [
    { headline: 'बसंत का मौसम, दिल थोड़ा और खुला हुआ 🌼', body: 'रात को हल्का, कोमल और छेड़छाड़ भरा रहने दीजिए।' },
    { headline: 'नई ऊर्जा, नई नरमी 💛', body: 'एक छोटी-सी रोमांटिक शुरुआत पूरी शाम बदल सकती है।' },
  ],
  holi: [
    { headline: 'रंगों के बाद अब जुड़ाव की बारी 🎨', body: 'हँसी, स्पर्श और चुलबुलापन साथ आने दीजिए।' },
    { headline: 'थोड़ी शरारत, पूरी सहमति 💕', body: 'एक हल्की चुनौती चुनिए और शाम को मज़ेदार बनाइए।' },
  ],
  monsoon_magic: [
    { headline: 'मानसून मूड: बाहर बारिश, भीतर गर्माहट 🌧️', body: 'धीमे पल, नरम रोशनी और पास रहने का बहाना।' },
    { headline: 'बरसाती शामों में जुड़ाव जल्दी खिलता है ☕', body: 'कंबल, चाय और थोड़ी छेड़छाड़ काफी है।' },
  ],
  karva_chauth: [
    { headline: 'इरादे, नज़रों और नरमी की शाम 🌙', body: 'आज रात को अर्थपूर्ण संकेतों से खास बनाइए।' },
    { headline: 'धीमा रोमांस भी बहुत गहरा हो सकता है ✨', body: 'एक-दूसरे के लिए आभार बोलें और फिर पास आएँ।' },
  ],
  diwali: [
    { headline: 'रोशनी बाहर भी, भीतर भी 🪔', body: 'आज एक चमकदार, चुलबुली और अंतरंग रात बनाइए।' },
    { headline: 'उत्सव के बाद की सबसे अच्छी शांति साथ में मिलती है 💫', body: 'एक कोमल पुनर्मिलन का पल चुनिए और उसे लंबा चलने दें।' },
  ],
  winter_wedding_season: [
    { headline: 'जश्न के बाद अपनी निजी गर्माहट ✨', body: 'बाहर की चमक के बाद अपनी सुकून भरी दुनिया बनाइए।' },
    { headline: 'तैयार होने की ऊर्जा को छेड़छाड़ में बदल दीजिए 💌', body: 'थोड़ा आकर्षण, थोड़ी गर्माहट और ढेर सारी नज़दीकी।' },
  ],
};

export const SEASONAL_TONIGHT_TEASERS_HI: Record<string, string[]> = {
  makar_sankranti: ['नई शुरुआत, नरम छेड़छाड़ और एक शाम जो अच्छी दिशा तय करे।'],
  basant_panchami: ['हल्का, ताज़ा और कोमल रोमांस से भरा हुआ।'],
  holi: ['रंगों जितना चुलबुला और हँसी जितना हल्का।'],
  monsoon_magic: ['धीमा, सुकूनभरा और बारिश की तरह ठहरने वाला।'],
  karva_chauth: ['इरादतन, भावुक और करीब लाने वाला।'],
  diwali: ['जश्न के बाद की निजी चमक, सिर्फ आप दोनों के लिए।'],
  winter_wedding_season: ['उत्सव से लौटकर अपना निजी जुड़ाव जगाइए।'],
};

export const SEASONAL_HOOK_LINES_HI: Record<string, string[]> = {
  makar_sankranti: ['नई धूप, नया मन, नया चुलबुला कदम।'],
  basant_panchami: ['नरम मौसम, खुला दिल, और छेड़छाड़ की सही वजह।'],
  holi: ['रंग, हँसी और थोड़ी-सी निडर ऊर्जा।'],
  monsoon_magic: ['बारिश, गर्माहट और रुककर पास आने का बहाना।'],
  karva_chauth: ['नज़र, इरादा और शांत नज़दीकी।'],
  diwali: ['रोशनी, उत्सव और भीतर की निजी चमक।'],
  winter_wedding_season: ['सजे हुए मौसम के बाद अपना सुकूनभरा अध्याय।'],
};

export const COUPLE_PROMPTS_HI = [
  { emoji: '\u{1F4AC}', text: 'पूछिए: इस हफ्ते आपने खुद को सबसे ज़्यादा चाहे गए कब महसूस किया?' },
  { emoji: '\u{1F48B}', text: 'एक धीमा, थोड़ा छेड़छाड़ भरा चुंबन दीजिए। बिना जल्दी किए।' },
  { emoji: '\u{1F4A5}', text: 'आज रात के लिए एक चुलबुला विचार साझा कीजिए।' },
  { emoji: '\u{1F3B5}', text: 'अपना गाना चलाइए और एक मिनट साथ झूमिए।' },
  { emoji: '\u{1F525}', text: 'एक ऐसी बात फुसफुसाइए जो आपको अपने साथी में बेहद आकर्षक लगती है।' },
  { emoji: '\u{1F917}', text: '20-सेकंड गले लगाने की चुनौती। फ़ोन नीचे, नज़रें ऊपर।' },
  { emoji: '\u{1F4CC}', text: 'पिछली रात को 1-10 दें और आज उसे बेहतर बनाने की सोचें।' },
  { emoji: '\u{1F440}', text: '15 सेकंड नज़रें मिलाएँ, फिर माहौल को आगे बढ़ने दें।' },
  { emoji: '\u{1F48C}', text: 'एक लाइन का “बाद में मिलो” नोट लिखिए।' },
  { emoji: '\u{1F31F}', text: 'अपनी सबसे मीठी-सी शरारती याद साझा कीजिए।' },
];
