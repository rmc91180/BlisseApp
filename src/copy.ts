export type VoiceLanguage = 'en' | 'es' | 'pt' | 'hi';

type VoiceLine = string;
type VoiceLineSet = VoiceLine[];

export type VoiceCopyPack = {
  entry: {
    headline: VoiceLineSet;
    subline: VoiceLineSet;
    primaryCTA: VoiceLineSet;
    secondaryCTA: VoiceLineSet;
  };
  origin: {
    subtitle: VoiceLine;
    whyTitle: VoiceLine;
    whyBody: VoiceLine;
    forTitle: VoiceLine;
    forBody: VoiceLine;
    howTitle: VoiceLine;
    howBody: VoiceLine;
    cta: VoiceLine;
    backCta: VoiceLine;
  };
  home: {
    header: VoiceLineSet;
    helper: VoiceLineSet;
    pickedForTonight: VoiceLine;
    vibeQuestion: VoiceLine;
    setTonightVibe: VoiceLine;
    vibeHelper: VoiceLine;
    exploreFreely: VoiceLine;
    suggestionsExplainerSelected: VoiceLine;
    suggestionsExplainerEmpty: VoiceLine;
    whyWeMadeThis: VoiceLine;
    quietWinsHidden: VoiceLine;
    quietWinsShown: VoiceLine;
    moods: {
      easy: VoiceLineSet;
      slow: VoiceLineSet;
      playful: VoiceLineSet;
      change: VoiceLineSet;
      surprise: VoiceLineSet;
    };
    greeting: {
      morning: (name: string) => string;
      morningContext: VoiceLine;
      afternoon: (name: string) => string;
      afternoonContext: VoiceLine;
      evening: (name: string) => string;
      eveningContext: VoiceLine;
      night: (name: string) => string;
      nightContext: VoiceLine;
    };
    trialBanner: (days: number) => string;
    tonightSession: {
      label: VoiceLine;
      title: VoiceLine;
      subtitle: VoiceLine;
      teaser: VoiceLine;
      cta: VoiceLine;
    };
    forYouSubtitle: VoiceLine;
    profile: {
      rhythmHeading: VoiceLine;
      ideasPlayed: (count: number) => string;
      styleWarmup: VoiceLine;
      youLeanInto: VoiceLine;
      styleUpdates: VoiceLine;
    };
  };
  suggestion: {
    titleFallback: VoiceLineSet;
    reason: VoiceLineSet;
    badge: {
      position: VoiceLine;
      foreplay: VoiceLine;
      oral: VoiceLine;
      massage: VoiceLine;
      roleplay: VoiceLine;
    };
    cta: VoiceLineSet;
    fallbackVibe: VoiceLine;
  };
  detail: {
    opener: VoiceLineSet;
    closer: VoiceLineSet;
    coachTitle: VoiceLine;
  };
  empty: {
    loading: VoiceLineSet;
    nothingYet: VoiceLineSet;
    exploreBody: VoiceLine;
    clearFilters: VoiceLine;
  };
  progress: {
    header: VoiceLineSet;
    streak: VoiceLineSet;
    weekComplete: VoiceLineSet;
    encouragement: VoiceLineSet;
    cardTitle: VoiceLine;
    cardPreparing: VoiceLine;
    cardCollapsedA11y: VoiceLine;
    cardExpandedA11y: VoiceLine;
  };
  return: {
    welcomeBack: VoiceLineSet;
    easeBack: VoiceLineSet;
  };
  generic: {
    yes: VoiceLineSet;
    no: VoiceLineSet;
    close: VoiceLineSet;
    continue: VoiceLineSet;
  };
  labels: {
    brandName: VoiceLine;
    appDataTitle: VoiceLine;
    activityLog: VoiceLine;
    interactionHistory: VoiceLine;
    notesSaved: VoiceLine;
    totalStarsEarned: VoiceLine;
    collectionLevel2Lock: VoiceLine;
    profileEnergy: VoiceLine;
    profileType: VoiceLine;
    shareBlisse: VoiceLine;
    version: VoiceLine;
    levelUpTitle: VoiceLine;
    levelUpUnlockedNow: VoiceLine;
    levelUpClaim: VoiceLine;
  };
  dailyBonus: {
    title: VoiceLine;
    dayStreak: (day: number) => string;
    collect: (count: number) => string;
    collected: (count: number) => string;
    caption: VoiceLine;
  };
  moodCheck: {
    header: VoiceLine;
    subheader: VoiceLine;
    helper: VoiceLine;
    refineTitle: VoiceLine;
    energySoft: VoiceLine;
    energyPlayful: VoiceLine;
    paceShort: VoiceLine;
    paceUnfold: VoiceLine;
    cta: VoiceLine;
    ctaA11y: VoiceLine;
  };
  sessionPlan: {
    progress: VoiceLine;
    coachTitle: VoiceLine;
    details: VoiceLine;
    openAction: VoiceLine;
    tryAction: VoiceLine;
    regenerate: VoiceLine;
    regenerateA11y: VoiceLine;
    cta: VoiceLine;
    ctaA11y: VoiceLine;
    start: VoiceLine;
    move: VoiceLine;
    finish: VoiceLine;
    fallbackName: VoiceLine;
    fallbackVibe: VoiceLine;
    coachIntro: Record<string, VoiceLine>;
  };
  sessionRating: {
    progress: VoiceLine;
    title: VoiceLine;
    subtitle: VoiceLine;
    emojiPrompt: VoiceLine;
    microcopy: {
      hot: VoiceLineSet;
      warm: VoiceLineSet;
      neutral: VoiceLineSet;
    };
    reactionA11y: {
      hot: VoiceLine;
      warm: VoiceLine;
      neutral: VoiceLine;
    };
    doneSimple: VoiceLine;
    saveWorked: VoiceLine;
    fallbackStartLabel: VoiceLine;
    fallbackMoveLabel: VoiceLine;
    fallbackFinishLabel: VoiceLine;
    coachLabel: VoiceLine;
    coachBody: VoiceLine;
    remember: VoiceLine;
    optional: VoiceLine;
    feelNow: VoiceLine;
    tried: VoiceLine;
    saveFavorites: VoiceLine;
    rateOnly: VoiceLine;
    chooseRating: VoiceLine;
    starsEarnedTitle: (count: number) => string;
    starsEarnedSubtitle: VoiceLine;
    achievements: VoiceLine;
    noAchievements: VoiceLine;
    done: VoiceLine;
    rateA11y: (value: number) => string;
    fallbackCloser: VoiceLine;
    postMood: VoiceLine;
  };
  sessionClosers: Record<string, VoiceLine>;
  onboarding: {
    namePreview: (name: string) => string;
    payoffHeader: (name: string) => string;
    payoffSubline: {
      deepConnection: VoiceLine;
      spiceThingsUp: VoiceLine;
      adventurous: VoiceLine;
      quickies: VoiceLine;
      default: VoiceLine;
    };
    payoffValueIdeas: (count: number) => string;
    payoffValueChallenges: VoiceLine;
    payoffValueDateNights: VoiceLine;
    payoffUnlock: VoiceLine;
    payoffCta: VoiceLine;
    payoffCancel: VoiceLine;
    welcomeSubtitle: VoiceLine;
    welcomeExisting: VoiceLine;
  };
  paywall: {
    title: VoiceLine;
    subtitle: VoiceLine;
    featureIdeas: VoiceLine;
    featureChallenges: VoiceLine;
    featurePrivacy: VoiceLine;
    primaryCta: VoiceLine;
    contact: VoiceLine;
  };
  share: {
    appReferral: (link: string) => string;
    position: (name: string, link: string) => string;
    foreplay: (name: string, link: string) => string;
    oral: (name: string, link: string) => string;
    massage: (name: string, link: string) => string;
    roleplay: (name: string, link: string) => string;
  };
  notifications: {
    dailyTease: VoiceLineSet;
    streakTitle: VoiceLine;
    streakBodies: VoiceLineSet;
    reactivationTitle: VoiceLine;
    reactivationBodies: VoiceLineSet;
  };
  coach: {
    systemPrompt: VoiceLine;
    fallbackNotes: VoiceLineSet;
    userPrompt: (contentType: string, item: { name: string; vibe?: string; whyItWorks?: string; description?: string; category?: string }) => string;
  };
};

const buildPack = (language: VoiceLanguage): VoiceCopyPack => {
  if (language === 'es') {
    return {
      entry: {
        headline: ['Acerquense más.', 'Aquí se pone bueno.', 'Lo mejor empieza aquí.', 'Su parte favorita del día.'],
        subline: ['Sin pensar. Solo disfruten.', 'Pongan el mood.', 'Déjense llevar.', 'Sin prisa.'],
        primaryCTA: ['Comenzar', 'Vamos', 'Entrar'],
        secondaryCTA: ['Ya estuve aquí', 'De vuelta'],
      },
      origin: {
        subtitle: 'Una forma más suave de encontrar la vibra juntos.',
        whyTitle: 'Por qué lo hicimos',
        whyBody: 'Queríamos algo que una pareja pudiera abrir sin sentirse observada, dirigida ni puesta a prueba.',
        forTitle: 'Para qué sirve',
        forBody: 'Blisse es para jugar, acercarse, coquetear y prender una chispa sin tener que hablarlo todo primero.',
        howTitle: 'Cómo usarlo',
        howBody: 'Pongan la vibra que se sienta real. Tomen una idea, salten otra, cambien de opinión cuando quieran. Su ritmo es el ritmo correcto.',
        cta: 'Empecemos',
        backCta: 'Volver a Blisse',
      },
      home: {
        header: ['Vibra de esta noche', 'Pongan el mood', 'Su tipo de noche'],
        helper: ['Sin reglas. Solo elijan.', 'Vayan con lo que se siente bien.', 'Sin presión.'],
        pickedForTonight: 'Sugerencias para esta noche',
        vibeQuestion: '¿Qué quieren hacer ahora?',
        setTonightVibe: 'Pongan la vibra de esta noche',
        vibeHelper: 'Pongan primero la vibra de esta noche. Lo demás puede ir fácil.',
        exploreFreely: 'Explorar libremente',
        suggestionsExplainerSelected: 'Todo lo de abajo va con esta vibra.',
        suggestionsExplainerEmpty: 'Pongan una vibra primero; lo demás sigue.',
        whyWeMadeThis: 'Por qué hicimos esto',
        quietWinsHidden: 'Pequeños momentos y chispas guardadas',
        quietWinsShown: 'Ocultar los pequeños momentos',
        moods: {
          easy: ['Fácil y cerca', 'Sin esfuerzo', 'Solo relajarse'],
          slow: ['Lento y rico', 'Sin apuro', 'Suavecito'],
          playful: ['A jugar', 'Un poco de diversión', 'Modo coqueteo'],
          change: ['Cambiar la vibra', 'Algo distinto', 'Mezclarlo'],
          surprise: ['Sorpréndanme', 'Elijan ustedes', 'Me animo'],
        },
        greeting: {
          morning: (name) => `Buenos días, ${name} ☀️`,
          morningContext: 'Empiecen el día con un poco de conexión.',
          afternoon: (name) => `Hola ${name} 👋`,
          afternoonContext: 'Vayan armando la noche.',
          evening: (name) => `Buenas noches, ${name} 🌙`,
          eveningContext: 'Hoy pinta muy bien.',
          night: (name) => `Todavía despiertos, ${name} 🌸`,
          nightContext: 'Sin juicio. Hay ideas lindas acá.',
        },
        trialBanner: (days) => `✨ Prueba gratis · ${days} día${days === 1 ? '' : 's'} restantes — Mantengan la chispa encendida`,
        tonightSession: {
          label: 'Sesión de hoy',
          title: '3 pasos fáciles y calientes',
          subtitle: 'Mood → Flow → Glow',
          teaser: 'Cero esfuerzo. Mucha química.',
          cta: 'Empezar sesión →',
        },
        forYouSubtitle: 'Muy su estilo',
        profile: {
          rhythmHeading: 'Su ritmo',
          ideasPlayed: (count) => `${count} de 400+ ideas jugadas`,
          styleWarmup: 'Sigan así — su estilo se está calentando 🌱',
          youLeanInto: 'Ustedes van por:',
          styleUpdates: 'Esto se ajusta mientras juegan juntos',
        },
      },
      suggestion: {
        titleFallback: ['Esto los llama.', 'Esto se siente bien.', 'Muy ustedes.', 'Donde más les gusta.', 'Fácil. Familiar. Rico.'],
        reason: ['Les gusta suave y cerca.', 'Esto les calza perfecto.', 'Siempre vuelven a esta vibra.', 'Esto suele pegar justo.', 'Misma frecuencia.'],
        badge: {
          position: '✨ Posición',
          foreplay: '✨ Previo',
          oral: '✨ Oral',
          massage: '✨ Masaje',
          roleplay: '✨ Roleplay',
        },
        cta: ['Ir', 'Probar', 'Empiecen aquí'],
        fallbackVibe: 'Suave, cálido y fácil de entrar.',
      },
      detail: {
        opener: ['Tómense su tiempo.', 'Sin apuro. Que suba.', 'Pónganse cómodos.', 'Disfruten esto.', 'Vayan lento si quieren.'],
        closer: ['Quédense ahí.', 'Dejen que pase.', 'Ya lo tienen.'],
        coachTitle: 'Para ustedes 🌸',
      },
      empty: {
        loading: ['Calentando…', 'Denos un segundo.', 'Ya casi.'],
        nothingYet: ['Empiecen suave.', 'Vamos de a poco.', 'Buen lugar para arrancar.'],
        exploreBody: 'Quiten el filtro o cambien de pestaña para otra vibra.',
        clearFilters: 'Quitar filtros',
      },
      progress: {
        header: ['Esta semana', 'Ahora'],
        streak: ['Siguen en ritmo 🔥', 'Muy buen flow 🔥', 'Ritmo precioso 🔥'],
        weekComplete: ['Se sintió buenísimo.', 'Gran ritmo esta semana.', 'Están encendidos.'],
        encouragement: ['Ya casi 🌸', 'No frenen ahora 🌸', 'Sigan el flow 🌸'],
        cardTitle: 'Esta semana',
        cardPreparing: 'Armando esta semana...',
        cardCollapsedA11y: 'Expandir tarjeta de esta semana',
        cardExpandedA11y: 'Cerrar tarjeta de esta semana',
      },
      return: {
        welcomeBack: ['Qué lindo verlos.', 'De vuelta por más.', 'Llegaron justo.'],
        easeBack: ['Vamos suave.', 'Simple y rico.', 'Empiecen con algo familiar.'],
      },
      generic: {
        yes: ['Sí', 'Claro', 'Dale'],
        no: ['Ahora no', 'Luego'],
        close: ['Cerrar', 'Listo'],
        continue: ['Continuar', 'Seguir'],
      },
      labels: {
        brandName: 'Blisse',
        appDataTitle: 'Datos de la app',
        activityLog: 'Registro de actividad',
        interactionHistory: 'Historial de interacciones',
        notesSaved: 'Notas guardadas',
        totalStarsEarned: 'Estrellas totales',
        collectionLevel2Lock: 'Más packs se desbloquean en Nivel 2',
        profileEnergy: 'Energía:',
        profileType: 'Tipo:',
        shareBlisse: 'Comparte Blisse con otra pareja',
        version: 'Versión',
        levelUpTitle: 'Subiste de nivel',
        levelUpUnlockedNow: 'Ya desbloqueaste',
        levelUpClaim: 'Tomar recompensa →',
      },
      dailyBonus: {
        title: 'Daily Bliss Drop',
        dayStreak: (day) => `Día ${day} de racha 🔥`,
        collect: (count) => `Tomar ${count} ⭐`,
        collected: (count) => `Listo ${count} ⭐`,
        caption: 'Mañana hay más. Su lugar sigue cálido.',
      },
      moodCheck: {
        header: 'Así va esta noche',
        subheader: 'Elijan su energía. Todo lo demás fluye.',
        helper: 'Elijan lo que se siente real. Pueden cambiar de idea cuando quieran.',
        refineTitle: '¿Un ajuste chiquito?',
        energySoft: 'Energía suave',
        energyPlayful: 'Más juguetón',
        paceShort: 'Corto y rico',
        paceUnfold: 'Que se despliegue',
        cta: 'Vamos',
        ctaA11y: 'Armar sesión',
      },
      sessionPlan: {
        progress: 'Paso 2 de 3',
        coachTitle: 'Nota para esta noche',
        details: 'Abrir',
        openAction: 'Abrir',
        tryAction: 'Probar',
        regenerate: 'Cambiarlo 🔀',
        regenerateA11y: 'Regenerar sesión',
        cta: 'Estamos bien →',
        ctaA11y: 'Estamos listos, vamos',
        start: 'Empiecen con...',
        move: 'Sigan con...',
        finish: 'Terminen con...',
        fallbackName: 'Algo nuevo',
        fallbackVibe: 'Una opción elegida para esta noche.',
        coachIntro: {
          romantic: 'Lento, cerca, sin prisa.',
          passionate: 'Calor alto desde el inicio.',
          playful: 'Ligero, travieso, y a reír.',
          adventurous: 'Hoy toca algo diferente.',
          relaxed: 'Suave y cómodo esta noche.',
          quickie: 'Rápido y directo.',
        },
      },
      sessionRating: {
        progress: 'Paso 3 de 3',
        title: 'Eso fue...',
        subtitle: 'Sin pensarlo demasiado',
        emojiPrompt: 'Elijan una vibra',
        microcopy: {
          hot: ['Uf. Eso pegó fuerte.', 'Sí, eso estuvo muy bueno.'],
          warm: ['Suave y rico. Muy bien.', 'Quedó cerca, quedó lindo.'],
          neutral: ['Tranqui. La próxima se mueve distinto.', 'Todo bien. Seguimos jugando.'],
        },
        reactionA11y: {
          hot: 'Se sintió intenso',
          warm: 'Se sintió cercano',
          neutral: 'Se sintió neutral',
        },
        doneSimple: 'Listo',
        saveWorked: 'Guardar lo que funcionó ❤️',
        fallbackStartLabel: 'Empiecen con...',
        fallbackMoveLabel: 'Sigan con...',
        fallbackFinishLabel: 'Terminen con...',
        coachLabel: 'Para ustedes 🌸',
        coachBody: 'Guarden lo que se sintió rico. Eso vuelve fácil.',
        remember: 'Para guardar',
        optional: 'Opcional',
        feelNow: 'Ahora mismo',
        tried: 'Marcar todo como probado ✓',
        saveFavorites: 'Guardar favoritos ❤️',
        rateOnly: 'Solo calificar y cerrar',
        chooseRating: 'Elijan una calificación para seguir',
        starsEarnedTitle: (count) => `Ganaron ${count} ⭐`,
        starsEarnedSubtitle: 'Estrellas de esta sesión',
        achievements: 'Nuevas insignias',
        noAchievements: 'Hoy no cayó insignia nueva. El ritmo sigue caliente.',
        done: 'Listo por hoy →',
        rateA11y: (value) => `Calificar ${value} estrellas`,
        fallbackCloser: 'Hoy se eligieron. Eso siempre gana.',
        postMood: 'Después de la sesión',
      },
      sessionClosers: {
        romantic: 'Eligieron calidez. Guárdenla cerca.',
        passionate: 'Ese fuego les queda increíble.',
        playful: 'La risa también enciende.',
        adventurous: 'Fueron atrevidos y cercanos. Gran mezcla.',
        relaxed: 'Comodidad y conexión. Golazo.',
        quickie: 'Poco tiempo, gran noche.',
      },
      onboarding: {
        namePreview: (name) => `Hola ${name} — pongamos esto delicioso 👋`,
        payoffHeader: (name) => `Hecho para ustedes, ${name || 'ustedes'} 👋`,
        payoffSubline: {
          deepConnection: 'Les gusta cerca, lento y real. Perfecto.',
          spiceThingsUp: 'Quieren calor nuevo. Esta noche se prende.',
          adventurous: 'Les gusta el borde. Esto les va a encantar.',
          quickies: 'Cuando es rápido, también puede ser increíble.',
          default: 'Aparecieron. Ya es una gran jugada.',
        },
        payoffValueIdeas: (count) => `${count}+ Ideas`,
        payoffValueChallenges: 'Retos',
        payoffValueDateNights: 'Noches de cita',
        payoffUnlock: 'Desbloquear para jugar →',
        payoffCta: 'Empezar →',
        payoffCancel: 'Cancelen cuando quieran · Sin compromiso',
        welcomeSubtitle: 'Pongan el mood. Que empiece lo bueno.',
        welcomeExisting: 'Ya dentro · Iniciar sesión',
      },
      paywall: {
        title: 'Más espacio para jugar',
        subtitle: 'Todo lo que necesitan para noches como esta.',
        featureIdeas: '🌸 400+ ideas, posiciones y date nights',
        featureChallenges: '🎯 Dares semanales y picks de esta noche',
        featurePrivacy: '🔒 Privado · Sin anuncios · Cancela cuando quieras',
        primaryCta: 'Desbloquear ahora →',
        contact: 'Somos personas reales. Escríbannos cuando quieran.',
      },
      share: {
        appReferral: (link) => `Usamos Blisse para encender la noche juntos 🌸 ${link}`,
        position: (name, link) => `Probamos ${name} esta noche — lo vimos en Blisse 🌸 ${link}`,
        foreplay: (name, link) => `Esta idea de Blisse cambió la noche: ${name} ✨ ${link}`,
        oral: (name, link) => `Hoy probamos esta idea: ${name} 👄 Blisse 🌸 ${link}`,
        massage: (name, link) => `Este masaje cambió toda la vibra: ${name} 💆 Blisse 🌸 ${link}`,
        roleplay: (name, link) => `Hicimos este juego de roles: ${name} 🎭 Blisse 🌸 ${link}`,
      },
      notifications: {
        dailyTease: [
          'Algo lento y conectado los espera esta noche 🌸',
          'Empiecen con las manos. Lo demás llega solo.',
          'Es su movimiento. Nosotros ponemos la chispa 🎯',
          'Diez minutos y todo cambia.',
          'Hoy hay algo nuevo para ustedes 👀',
          'Las mejores noches empiezan cuando aparecen.',
          'Les guardamos algo rico. Vengan a verlo ✨',
        ],
        streakTitle: 'La chispa sigue viva ✨',
        streakBodies: [
          'Anduvieron ocupados. Aquí seguimos 🌸',
          'Sin presión. Solo un empujoncito suave para hoy.',
          'La racha está descansando. La retoman cuando quieran 🔥',
        ],
        reactivationTitle: 'Seguimos acá ✨',
        reactivationBodies: [
          'Ya pasó una semana. Hay ideas nuevas para ustedes.',
          'Seguimos aquí, y seguimos apostando por ustedes 🌸',
          'Su lugar quedó guardado. Vuelvan cuando quieran.',
        ],
      },
      coach: {
        systemPrompt: `You are writing a short, warm note meant for two people sharing a moment together.
The tone is warm, light, optional, flirty, and never detached or judgmental.
Keep it to 2-3 sentences.
Do not explain why anything works.
Do not give advice, teach, pressure, guilt, urgency, or improvement framing.
Speak to both people together as "you two", gently and casually.`,
        fallbackNotes: [
          'Ustedes dos ya están en sintonía. Fácil y cerca alcanza.',
          'Lento, rápido, o en algún punto medio. A su manera cuenta.',
          'No hace falta perfección. Estar aquí juntos ya es mucho.',
          'Una sonrisa también puede ser un buen lugar para quedarse.',
          'Esta noche es de ustedes. Nada más.',
          'La chispa ya está. Puede quedarse suave.',
          'Donde se siente bien, hay espacio para quedarse.',
          'Su ritmo puede ser exactamente este.',
        ],
        userPrompt: (contentType, item) => `A little context for the note:
Name: ${item.name}
Type: ${contentType}
Vibe: ${item.vibe || 'Warm and connecting'}
Category: ${item.category || 'General'}

Write the final note in Spanish.`,
      },
    };
  }

  if (language === 'pt') {
    return {
      entry: {
        headline: ['Cheguem mais perto.', 'Aqui fica bom de verdade.', 'O melhor começa aqui.', 'A melhor parte do dia.'],
        subline: ['Sem pensar. Só curtir.', 'Escolham a vibe.', 'Deixem fluir.', 'Sem pressa.'],
        primaryCTA: ['Começar', 'Vamos', 'Entrar'],
        secondaryCTA: ['Já estive aqui', 'De volta'],
      },
      origin: {
        subtitle: 'Um jeito mais leve de encontrar a vibe juntos.',
        whyTitle: 'Por que criamos isso',
        whyBody: 'Queríamos algo que um casal pudesse abrir sem se sentir observado, conduzido ou colocado à prova.',
        forTitle: 'Pra que serve',
        forBody: 'Blisse é pra brincar, chegar perto, flertar e acender uma faísca sem precisar conversar tudo antes.',
        howTitle: 'Como usar',
        howBody: 'Escolham a vibe que parece verdadeira. Peguem uma ideia, pulem outra, mudem de ideia quando quiserem. O ritmo certo é o de vocês.',
        cta: 'Vamos começar',
        backCta: 'Voltar ao Blisse',
      },
      home: {
        header: ['Vibe da noite', 'Definam o clima', 'Noite com a cara de vocês'],
        helper: ['Sem regra. Só escolham.', 'Vão no que bate gostoso.', 'Sem pressão.'],
        pickedForTonight: 'Sugestões pra hoje',
        vibeQuestion: 'O que vocês querem fazer agora?',
        setTonightVibe: 'Definir a vibe da noite',
        vibeHelper: 'Definam primeiro a vibe da noite. O resto pode ficar leve.',
        exploreFreely: 'Explorar livremente',
        suggestionsExplainerSelected: 'Tudo abaixo combina com essa vibe.',
        suggestionsExplainerEmpty: 'Escolham uma vibe primeiro; o resto acompanha.',
        whyWeMadeThis: 'Por que criamos isso',
        quietWinsHidden: 'Pequenas faíscas guardadas',
        quietWinsShown: 'Esconder as pequenas faíscas',
        moods: {
          easy: ['Leve e perto', 'Sem esforço', 'Só relaxar'],
          slow: ['Devagar e quente', 'Sem correria', 'No ritmo certo'],
          playful: ['Vamos brincar', 'Um toque divertido', 'Clima de flerte'],
          change: ['Mudar a vibe', 'Algo diferente', 'Misturar tudo'],
          surprise: ['Surpreende', 'Vocês escolhem', 'Topo tudo'],
        },
        greeting: {
          morning: (name) => `Bom dia, ${name} ☀️`,
          morningContext: 'Comecem o dia com um toque de conexão.',
          afternoon: (name) => `Oi ${name} 👋`,
          afternoonContext: 'Já vão montando a noite.',
          evening: (name) => `Boa noite, ${name} 🌙`,
          eveningContext: 'Hoje promete.',
          night: (name) => `Ainda acordados, ${name} 🌸`,
          nightContext: 'Sem julgamento. Tem ideias boas aqui.',
        },
        trialBanner: (days) => `✨ Teste grátis · ${days} dia${days === 1 ? '' : 's'} restantes — Mantenham a faísca acesa`,
        tonightSession: {
          label: 'Sessão da noite',
          title: '3 passos fáceis e quentes',
          subtitle: 'Mood → Flow → Glow',
          teaser: 'Pouco esforço. Muita química.',
          cta: 'Começar sessão →',
        },
        forYouSubtitle: 'Muito a cara de vocês',
        profile: {
          rhythmHeading: 'Ritmo de vocês',
          ideasPlayed: (count) => `${count} de 400+ ideias curtidas`,
          styleWarmup: 'Continuem — o estilo de vocês está aquecendo 🌱',
          youLeanInto: 'Vocês curtem mais:',
          styleUpdates: 'Isso muda enquanto vocês jogam juntos',
        },
      },
      suggestion: {
        titleFallback: ['Isso está chamando vocês.', 'Isso bate certo.', 'Muito vocês.', 'Bem onde vocês gostam.', 'Fácil. Familiar. Gostoso.'],
        reason: ['Vocês gostam de perto e no ritmo lento.', 'Isso combina demais com vocês.', 'Vocês sempre voltam pra essa vibe.', 'Isso costuma acertar em cheio.', 'Mesma sintonia.'],
        badge: {
          position: '✨ Posição',
          foreplay: '✨ Preliminar',
          oral: '✨ Oral',
          massage: '✨ Massagem',
          roleplay: '✨ Roleplay',
        },
        cta: ['Ir', 'Vamos tentar', 'Comecem por aqui'],
        fallbackVibe: 'Suave, quente e fácil de entrar.',
      },
      detail: {
        opener: ['Curtam com calma.', 'Sem pressa. Deixa crescer.', 'Cheguem perto.', 'Aproveitem isso.', 'Vão devagar se quiserem.'],
        closer: ['Fiquem nisso.', 'Deixem acontecer.', 'Vocês têm isso.'],
        coachTitle: 'Pra vocês 🌸',
      },
      empty: {
        loading: ['Aquecendo…', 'Um segundinho.', 'Quase lá.'],
        nothingYet: ['Comecem leve.', 'Vamos no simples.', 'Ótimo lugar pra começar.'],
        exploreBody: 'Limpem o filtro ou mudem de aba para outra vibe.',
        clearFilters: 'Limpar filtros',
      },
      progress: {
        header: ['Esta semana', 'Agora'],
        streak: ['Segue o ritmo 🔥', 'Fluxo bonito 🔥', 'Ritmo gostoso 🔥'],
        weekComplete: ['Foi bom demais.', 'Ritmo lindo na semana.', 'Vocês estão acesos.'],
        encouragement: ['Tá quase 🌸', 'Não para agora 🌸', 'Segue o flow 🌸'],
        cardTitle: 'Esta semana',
        cardPreparing: 'Montando esta semana...',
        cardCollapsedA11y: 'Expandir cartão da semana',
        cardExpandedA11y: 'Recolher cartão da semana',
      },
      return: {
        welcomeBack: ['Bom ver vocês.', 'De volta pra mais.', 'Chegaram na hora certa.'],
        easeBack: ['Vamos leve.', 'Sem complicar.', 'Comecem com algo familiar.'],
      },
      generic: {
        yes: ['Sim', 'Claro', 'Bora'],
        no: ['Agora não', 'Depois'],
        close: ['Fechar', 'Pronto'],
        continue: ['Continuar', 'Seguir'],
      },
      labels: {
        brandName: 'Blisse',
        appDataTitle: 'Dados do app',
        activityLog: 'Registro de atividade',
        interactionHistory: 'Histórico de interações',
        notesSaved: 'Notas salvas',
        totalStarsEarned: 'Estrelas totais',
        collectionLevel2Lock: 'Mais coleções liberam no Nível 2',
        profileEnergy: 'Energia:',
        profileType: 'Tipo:',
        shareBlisse: 'Compartilhe o Blisse com outro casal',
        version: 'Versão',
        levelUpTitle: 'Nível novo',
        levelUpUnlockedNow: 'Liberado agora',
        levelUpClaim: 'Pegar recompensa →',
      },
      dailyBonus: {
        title: 'Daily Bliss Drop',
        dayStreak: (day) => `Dia ${day} de sequência 🔥`,
        collect: (count) => `Pegar ${count} ⭐`,
        collected: (count) => `Pegou ${count} ⭐`,
        caption: 'Amanhã tem mais. O lugar de vocês segue quentinho.',
      },
      moodCheck: {
        header: 'A noite começa aqui',
        subheader: 'Escolham a energia. O resto encaixa.',
        helper: 'Escolham o que parece verdadeiro. Vocês podem mudar de ideia quando quiserem.',
        refineTitle: 'Um ajuste rapidinho?',
        energySoft: 'Energia suave',
        energyPlayful: 'Mais brincalhão',
        paceShort: 'Curto e gostoso',
        paceUnfold: 'Deixar acontecer',
        cta: 'Bora',
        ctaA11y: 'Montar sessão',
      },
      sessionPlan: {
        progress: 'Passo 2 de 3',
        coachTitle: 'Nota para hoje',
        details: 'Abrir',
        openAction: 'Abrir',
        tryAction: 'Tenta essa',
        regenerate: 'Mudar o clima 🔀',
        regenerateA11y: 'Gerar sessão novamente',
        cta: 'Fechou →',
        ctaA11y: 'Estamos prontos, vamos',
        start: 'Comecem com...',
        move: 'Sigam para...',
        finish: 'Finalizem com...',
        fallbackName: 'Algo novo',
        fallbackVibe: 'Uma escolha pensada para hoje à noite.',
        coachIntro: {
          romantic: 'Devagar, perto e gostoso.',
          passionate: 'Calor lá em cima desde já.',
          playful: 'Leve, divertido, sem peso.',
          adventurous: 'Hoje é dia de algo novo.',
          relaxed: 'Conforto e conexão.',
          quickie: 'Rápido e certeiro.',
        },
      },
      sessionRating: {
        progress: 'Passo 3 de 3',
        title: 'Isso foi...',
        subtitle: 'Sem pensar muito',
        emojiPrompt: 'Escolham a vibe',
        microcopy: {
          hot: ['Nossa. Isso bateu forte.', 'Aí sim. Clima lá no alto.'],
          warm: ['Quente e gostoso. Bem vocês.', 'Leve, perto e bom.'],
          neutral: ['Tudo certo. A próxima muda o jogo.', 'Sem drama. Seguimos no flow.'],
        },
        reactionA11y: {
          hot: 'Foi intenso',
          warm: 'Foi próximo',
          neutral: 'Foi neutro',
        },
        doneSimple: 'Pronto',
        saveWorked: 'Salvar o que funcionou ❤️',
        fallbackStartLabel: 'Comecem com...',
        fallbackMoveLabel: 'Sigam para...',
        fallbackFinishLabel: 'Finalizem com...',
        coachLabel: 'Pra vocês 🌸',
        coachBody: 'Guardem o que bateu gostoso. Depois fica fácil repetir.',
        remember: 'Pra guardar',
        optional: 'Opcional',
        feelNow: 'Agora',
        tried: 'Marcar tudo como testado ✓',
        saveFavorites: 'Salvar favoritos ❤️',
        rateOnly: 'Só avaliar e fechar',
        chooseRating: 'Escolham uma nota para seguir',
        starsEarnedTitle: (count) => `Vocês ganharam ${count} ⭐`,
        starsEarnedSubtitle: 'Estrelas desta sessão',
        achievements: 'Novas insígnias',
        noAchievements: 'Sem insígnia nova hoje. O ritmo segue quente.',
        done: 'Encerrar por hoje →',
        rateA11y: (value) => `Avaliar com ${value} estrelas`,
        fallbackCloser: 'Hoje vocês se escolheram. Isso vale tudo.',
        postMood: 'Depois da sessão',
      },
      sessionClosers: {
        romantic: 'Vocês escolheram calor e carinho. Guardem isso.',
        passionate: 'Esse fogo combina demais com vocês.',
        playful: 'Riso também acende.',
        adventurous: 'Vocês foram ousados e próximos. Combinação perfeita.',
        relaxed: 'Conforto e conexão. Lindo.',
        quickie: 'Pouco tempo, noite marcante.',
      },
      onboarding: {
        namePreview: (name) => `Oi ${name} — vamos deixar isso gostoso 👋`,
        payoffHeader: (name) => `Feito pra vocês, ${name || 'vocês'} 👋`,
        payoffSubline: {
          deepConnection: 'Vocês gostam de perto, lento e real. Perfeito.',
          spiceThingsUp: 'Vocês querem fogo novo. Hoje vai render.',
          adventurous: 'Vocês gostam da beirinha. Vai bater bonito.',
          quickies: 'Quando é rápido, também pode ser intenso.',
          default: 'Vocês apareceram. Já é uma baita jogada.',
        },
        payoffValueIdeas: (count) => `${count}+ Ideias`,
        payoffValueChallenges: 'Desafios',
        payoffValueDateNights: 'Noites a dois',
        payoffUnlock: 'Desbloquear pra jogar →',
        payoffCta: 'Começar →',
        payoffCancel: 'Cancelem quando quiserem · Sem compromisso',
        welcomeSubtitle: 'Escolham a vibe. Daqui fica bom.',
        welcomeExisting: 'Já por aqui · Entrar',
      },
      paywall: {
        title: 'Mais espaço para brincar',
        subtitle: 'Tudo que vocês precisam para noites assim.',
        featureIdeas: '🌸 400+ ideias, posições e date nights',
        featureChallenges: '🎯 Dares semanais e picks da noite',
        featurePrivacy: '🔒 Privado · Sem anúncios · Cancele quando quiser',
        primaryCta: 'Desbloquear agora →',
        contact: 'Somos gente de verdade. Chamem quando quiserem.',
      },
      share: {
        appReferral: (link) => `A gente usa Blisse pra esquentar a noite 🌸 ${link}`,
        position: (name, link) => `Tentamos ${name} hoje — achamos no Blisse 🌸 ${link}`,
        foreplay: (name, link) => `Essa ideia do Blisse mudou nossa noite: ${name} ✨ ${link}`,
        oral: (name, link) => `Hoje testamos essa ideia: ${name} 👄 Blisse 🌸 ${link}`,
        massage: (name, link) => `Essa massagem mudou o clima todo: ${name} 💆 Blisse 🌸 ${link}`,
        roleplay: (name, link) => `Fizemos esse roleplay: ${name} 🎭 Blisse 🌸 ${link}`,
      },
      notifications: {
        dailyTease: [
          'Algo lento e conectado espera vocês hoje 🌸',
          'Comecem pelas mãos. O resto vem junto.',
          'A jogada é de vocês. A faísca é nossa 🎯',
          'Dez minutos e tudo muda.',
          'Hoje tem algo novo pra vocês 👀',
          'As melhores noites começam quando vocês aparecem.',
          'Guardamos algo gostoso. Vem ver ✨',
        ],
        streakTitle: 'A faísca segue viva ✨',
        streakBodies: [
          'Vocês andaram ocupados. Estamos aqui 🌸',
          'Sem pressão. Só um toque leve pra hoje.',
          'A sequência está descansando. Vocês retomam quando quiserem 🔥',
        ],
        reactivationTitle: 'Seguimos por aqui ✨',
        reactivationBodies: [
          'Já faz uma semana. Tem ideia nova esperando vocês.',
          'A gente continua aqui, torcendo por vocês 🌸',
          'O lugar de vocês está guardado. Voltem quando quiserem.',
        ],
      },
      coach: {
        systemPrompt: `You are writing a short, warm note meant for two people sharing a moment together.
The tone is warm, light, optional, flirty, and never detached or judgmental.
Keep it to 2-3 sentences.
Do not explain why anything works.
Do not give advice, teach, pressure, guilt, urgency, or improvement framing.
Speak to both people together as "you two", gently and casually.`,
        fallbackNotes: [
          'Vocês já estão em sintonia. Leve e perto já basta.',
          'Devagar, rápido, ou no meio do caminho. Do jeito de vocês conta.',
          'Não precisa perfeição. Estar aqui juntos já é muito.',
          'Um sorriso também pode ser um bom lugar pra ficar.',
          'Hoje é noite de vocês.',
          'A faísca já existe. Ela pode ficar suave.',
          'Onde bate gostoso, cabe ficar mais um pouco.',
          'O ritmo de vocês pode ser exatamente esse.',
        ],
        userPrompt: (contentType, item) => `A little context for the note:
Name: ${item.name}
Type: ${contentType}
Vibe: ${item.vibe || 'Warm and connecting'}
Category: ${item.category || 'General'}

Write the final note in Brazilian Portuguese.`,
      },
    };
  }

  if (language === 'hi') {
    return {
      entry: {
        headline: ['और करीब आइए।', 'यहीं से मज़ा शुरू होता है।', 'सबसे अच्छा हिस्सा यहीं है।', 'दिन का सबसे प्यारा पल।'],
        subline: ['सोचना नहीं। बस महसूस करना।', 'मूड सेट करें।', 'बस फ्लो में जाएं।', 'आराम से।'],
        primaryCTA: ['शुरू करें', 'चलें', 'अभी शुरू'],
        secondaryCTA: ['मैं पहले से यहां हूं', 'फिर से आए हैं'],
      },
      origin: {
        subtitle: 'साथ में आज की vibe ढूंढने का नरम तरीका।',
        whyTitle: 'हमने इसे क्यों बनाया',
        whyBody: 'हम चाहते थे कि कपल्स इसे खोलें और उन्हें analyze, manage या test जैसा महसूस न हो।',
        forTitle: 'यह किसलिए है',
        forBody: 'Blisse खेल, नज़दीकी, flirt और उस छोटी चिंगारी के लिए है, बिना पहले सब कुछ समझाने की ज़रूरत के।',
        howTitle: 'इसे कैसे इस्तेमाल करें',
        howBody: 'जो vibe सच लगे उसे चुनें। एक idea लें, दूसरा छोड़ दें, जब चाहें मन बदलें। आपकी pace ही सही pace है।',
        cta: 'चलो शुरू करें',
        backCta: 'Blisse पर वापस',
      },
      home: {
        header: ['आज रात की vibe', 'मूड सेट करें', 'आज की रात आपकी तरह'],
        helper: ['कोई नियम नहीं। बस चुनें।', 'जो सही लगे वही चुनें।', 'कोई दबाव नहीं।'],
        pickedForTonight: 'आज रात की suggestions',
        vibeQuestion: 'अभी आप क्या करना चाहते हैं?',
        setTonightVibe: 'आज रात की vibe सेट करें',
        vibeHelper: 'पहले आज रात की vibe सेट करें। बाकी सब आसान रह सकता है।',
        exploreFreely: 'आराम से explore करें',
        suggestionsExplainerSelected: 'नीचे सब इसी vibe से match करता है।',
        suggestionsExplainerEmpty: 'पहले vibe चुनें; बाकी सब अपने-आप flow करेगा।',
        whyWeMadeThis: 'हमने यह क्यों बनाया',
        quietWinsHidden: 'छोटी sparks और saved moments',
        quietWinsShown: 'छोटी sparks छुपाएं',
        moods: {
          easy: ['आसान और करीब', 'बिना मेहनत', 'बस रिलैक्स'],
          slow: ['धीमा और गहरा', 'आराम से', 'बहुत नरम'],
          playful: ['चलो खेलें', 'थोड़ा मज़ा', 'फ्लर्ट मूड'],
          change: ['कुछ बदलें', 'कुछ नया', 'मूड बदलें'],
          surprise: ['सरप्राइज दें', 'आप चुनें', 'मैं तैयार हूं'],
        },
        greeting: {
          morning: (name) => `गुड मॉर्निंग, ${name} ☀️`,
          morningContext: 'दिन की शुरुआत थोड़ी कनेक्शन से करें।',
          afternoon: (name) => `हे ${name} 👋`,
          afternoonContext: 'आज रात के लिए मूड बनाइए।',
          evening: (name) => `गुड ईवनिंग, ${name} 🌙`,
          eveningContext: 'आज रात अच्छी लग रही है।',
          night: (name) => `अभी जाग रहे हैं, ${name} 🌸`,
          nightContext: 'नो जजमेंट। हमारे पास ideas हैं।',
        },
        trialBanner: (days) => `✨ फ्री ट्रायल · ${days} दिन बाकी — चिंगारी अनलॉक रखें`,
        tonightSession: {
          label: 'आज की सेशन',
          title: '3 आसान और गर्म स्टेप्स',
          subtitle: 'Mood → Flow → Glow',
          teaser: 'कम मेहनत। ज्यादा केमिस्ट्री।',
          cta: 'सेशन शुरू करें →',
        },
        forYouSubtitle: 'बिल्कुल आपकी vibe',
        profile: {
          rhythmHeading: 'आपकी लय',
          ideasPlayed: (count) => `${count} of 400+ ideas played`,
          styleWarmup: 'बस ऐसे ही — आपकी style गर्म हो रही है 🌱',
          youLeanInto: 'आप ज़्यादा पसंद करते हैं:',
          styleUpdates: 'ये साथ खेलते-खेलते अपडेट होता है',
        },
      },
      suggestion: {
        titleFallback: ['ये आपको बुला रहा है।', 'ये सही लग रहा है।', 'बहुत आपकी तरह।', 'ठीक वहीं जहां पसंद है।', 'आसान। अपना। अच्छा।'],
        reason: ['आपको धीमा और करीब पसंद है।', 'ये आपकी vibe में बैठता है।', 'आप बार-बार यहां लौटते हैं।', 'ये अक्सर सही hit करता है।', 'आपकी ही frequency।'],
        badge: {
          position: '✨ Position',
          foreplay: '✨ Foreplay',
          oral: '✨ Oral',
          massage: '✨ Massage',
          roleplay: '✨ Roleplay',
        },
        cta: ['चलो', 'ट्राई करें', 'यहीं से शुरू'],
        fallbackVibe: 'नरम, गर्म और आसान।',
      },
      detail: {
        opener: ['आराम से करें।', 'कोई जल्दी नहीं। बनने दें।', 'पास आएं।', 'इसे महसूस करें।', 'धीरे जाएं अगर चाहें।'],
        closer: ['यहीं रहें।', 'इसे होने दें।', 'आप कर लेंगे।'],
        coachTitle: 'आप दोनों के लिए 🌸',
      },
      empty: {
        loading: ['वार्म हो रहा है…', 'एक सेकंड दें।', 'बस आ गया।'],
        nothingYet: ['आसान से शुरू करें।', 'धीरे-धीरे चलते हैं।', 'शुरुआत के लिए बढ़िया जगह।'],
        exploreBody: 'फिल्टर हटाएं या नई vibe के लिए टैब बदलें।',
        clearFilters: 'फिल्टर साफ करें',
      },
      progress: {
        header: ['यह सप्ताह', 'अभी'],
        streak: ['लय जारी है 🔥', 'बहुत अच्छा flow 🔥', 'नाइस रिद्म 🔥'],
        weekComplete: ['बहुत अच्छा लगा।', 'इस हफ्ते बढ़िया रिद्म।', 'आप लोग on fire हैं।'],
        encouragement: ['बस थोड़ा और 🌸', 'अब मत रुकिए 🌸', 'flow बनाए रखें 🌸'],
        cardTitle: 'यह सप्ताह',
        cardPreparing: 'इस हफ्ते को सेट कर रहे हैं...',
        cardCollapsedA11y: 'इस सप्ताह कार्ड खोलें',
        cardExpandedA11y: 'इस सप्ताह कार्ड बंद करें',
      },
      return: {
        welcomeBack: ['फिर मिलकर अच्छा लगा।', 'और के लिए वापस आए हैं।', 'सही समय पर आए।'],
        easeBack: ['धीरे से शुरू करें।', 'इसे आसान रखें।', 'किसी familiar चीज़ से शुरू करें।'],
      },
      generic: {
        yes: ['हाँ', 'ज़रूर', 'क्यों नहीं'],
        no: ['अभी नहीं', 'बाद में'],
        close: ['बंद करें', 'हो गया'],
        continue: ['जारी रखें', 'आगे बढ़ें'],
      },
      labels: {
        brandName: 'Blisse',
        appDataTitle: 'ऐप डेटा',
        activityLog: 'एक्टिविटी लॉग',
        interactionHistory: 'इंटरैक्शन हिस्ट्री',
        notesSaved: 'सेव की गई नोट्स',
        totalStarsEarned: 'कुल स्टार्स',
        collectionLevel2Lock: 'और पैक्स लेवल 2 पर खुलेंगे',
        profileEnergy: 'एनर्जी:',
        profileType: 'टाइप:',
        shareBlisse: 'Blisse किसी और कपल के साथ शेयर करें',
        version: 'वर्ज़न',
        levelUpTitle: 'लेवल अप',
        levelUpUnlockedNow: 'अब अनलॉक हुआ',
        levelUpClaim: 'रिवार्ड लें →',
      },
      dailyBonus: {
        title: 'Daily Bliss Drop',
        dayStreak: (day) => `Day ${day} streak 🔥`,
        collect: (count) => `Collect ${count} ⭐`,
        collected: (count) => `Collected ${count} ⭐`,
        caption: 'कल और मिलेगा। आपकी जगह गर्म रखी है।',
      },
      moodCheck: {
        header: 'आज रात का मूड सेट करें',
        subheader: 'अपनी ऊर्जा चुनें। बाकी खुद फ्लो करेगा।',
        helper: 'जो सच लगे वही चुनें। जब चाहें मन बदल सकते हैं।',
        refineTitle: 'एक छोटा सा tune-up?',
        energySoft: 'नरम energy',
        energyPlayful: 'थोड़ा playful',
        paceShort: 'छोटा और sweet',
        paceUnfold: 'धीरे-धीरे खुलने दें',
        cta: 'चलें',
        ctaA11y: 'सेशन बनाएं',
      },
      sessionPlan: {
        progress: 'चरण 2 में से 3',
        coachTitle: 'आज की नोट',
        details: 'खोलें',
        openAction: 'खोलें',
        tryAction: 'इसे ट्राय करें',
        regenerate: 'मूड बदलें 🔀',
        regenerateA11y: 'सेशन फिर बनाएं',
        cta: 'ठीक है →',
        ctaA11y: 'हम तैयार हैं, चलें',
        start: 'शुरुआत करें...',
        move: 'फिर आगे बढ़ें...',
        finish: 'अंत करें...',
        fallbackName: 'कुछ नया',
        fallbackVibe: 'आज रात के लिए एक चुना हुआ विकल्प।',
        coachIntro: {
          romantic: 'धीमा, करीब, और नरम।',
          passionate: 'शुरू से ही गर्म।',
          playful: 'हल्का और मस्ती वाला।',
          adventurous: 'आज कुछ नया करें।',
          relaxed: 'आराम से, साथ में।',
          quickie: 'छोटा, तेज़, अच्छा।',
        },
      },
      sessionRating: {
        progress: 'चरण 3 में से 3',
        title: 'ये था...',
        subtitle: 'ज़्यादा मत सोचिए',
        emojiPrompt: 'एक vibe चुनें',
        microcopy: {
          hot: ['वाह. ये बहुत अच्छा था.', 'हाँ, ये तो कमाल था.'],
          warm: ['नरम और करीब. अच्छा लगा.', 'आराम से, सही vibe में.'],
          neutral: ['ठीक है. अगली बार और मज़ा आएगा.', 'कोई बात नहीं. खेल जारी रखें.'],
        },
        reactionA11y: {
          hot: 'तीव्र लगा',
          warm: 'करीब लगा',
          neutral: 'न्यूट्रल लगा',
        },
        doneSimple: 'हो गया',
        saveWorked: 'जो काम आया उसे सेव करें ❤️',
        fallbackStartLabel: 'शुरुआत करें...',
        fallbackMoveLabel: 'फिर आगे बढ़ें...',
        fallbackFinishLabel: 'अंत करें...',
        coachLabel: 'आप दोनों के लिए 🌸',
        coachBody: 'जो सही लगा उसे सेव करें। वही फिर सबसे अच्छा लगेगा।',
        remember: 'याद रखने के लिए',
        optional: 'वैकल्पिक',
        feelNow: 'अभी',
        tried: 'सबको tried मार्क करें ✓',
        saveFavorites: 'फेवरेट सेव करें ❤️',
        rateOnly: 'सिर्फ रेट करें और बंद करें',
        chooseRating: 'आगे बढ़ने के लिए रेटिंग चुनें',
        starsEarnedTitle: (count) => `आपने ${count} ⭐ कमाए`,
        starsEarnedSubtitle: 'इस सेशन के सितारे',
        achievements: 'नई बैज',
        noAchievements: 'आज नया बैज नहीं। आपकी रिद्म अभी भी गर्म है।',
        done: 'आज के लिए पूरा →',
        rateA11y: (value) => `${value} स्टार रेटिंग दें`,
        fallbackCloser: 'आज आपने एक-दूसरे को चुना। यही सब कुछ है।',
        postMood: 'सेशन के बाद',
      },
      sessionClosers: {
        romantic: 'आज आपने गर्माहट चुनी। इसे पास रखें।',
        passionate: 'ये आग आप दोनों पर खूब जंचती है।',
        playful: 'हंसी भी चिंगारी बढ़ाती है।',
        adventurous: 'आपने बोल्ड चुना और करीब रहे। कमाल।',
        relaxed: 'आराम और कनेक्शन। यही सही है।',
        quickie: 'कम समय, बड़ी रात।',
      },
      onboarding: {
        namePreview: (name) => `हे ${name} — आज रात खूबसूरत बनाते हैं 👋`,
        payoffHeader: (name) => `आज रात के लिए तैयार, ${name || 'you two'} 👋`,
        payoffSubline: {
          deepConnection: 'आपको धीमा, करीब और real पसंद है। परफेक्ट।',
          spiceThingsUp: 'आप नई गर्माहट चाहते हैं। आज रात बढ़िया रहेगी।',
          adventurous: 'आपको edge पसंद है। ये खूब जमेगा।',
          quickies: 'जब तेज़ चाहिए, वही सही होता है।',
          default: 'आप आए। यही सबसे अच्छी शुरुआत है।',
        },
        payoffValueIdeas: (count) => `${count}+ आइडियाज़`,
        payoffValueChallenges: 'चैलेंज',
        payoffValueDateNights: 'डेट नाइट्स',
        payoffUnlock: 'Unlock to play →',
        payoffCta: "Let's Begin →",
        payoffCancel: 'कभी भी cancel करें · कोई commitment नहीं',
        welcomeSubtitle: 'मूड सेट करें। अब अच्छा शुरू होता है।',
        welcomeExisting: 'पहले से यहां · Sign In',
      },
      paywall: {
        title: 'साथ खेलने की और जगह',
        subtitle: 'ऐसी रातों के लिए सब कुछ, आराम से।',
        featureIdeas: '🌸 400+ ideas, positions और date nights',
        featureChallenges: '🎯 Weekly dares और tonight picks',
        featurePrivacy: '🔒 Private · No ads · Cancel anytime',
        primaryCta: 'Start My Subscription →',
        contact: 'हम असली लोग हैं। कभी भी संपर्क करें।',
      },
      share: {
        appReferral: (link) => `हम Blisse के साथ अपनी रातें और करीब बनाते हैं 🌸 ${link}`,
        position: (name, link) => `आज हमने ${name} ट्राय किया — Blisse पर मिला 🌸 ${link}`,
        foreplay: (name, link) => `Blisse का यह आइडिया हमारी शाम बदल गया: ${name} ✨ ${link}`,
        oral: (name, link) => `आज हमने यह आइडिया ट्राय किया: ${name} 👄 Blisse 🌸 ${link}`,
        massage: (name, link) => `इस मसाज ने पूरी vibe बदल दी: ${name} 💆 Blisse 🌸 ${link}`,
        roleplay: (name, link) => `आज हमने यह roleplay किया: ${name} 🎭 Blisse 🌸 ${link}`,
      },
      notifications: {
        dailyTease: [
          'आज रात कुछ धीमा और करीब आपका इंतज़ार कर रहा है 🌸',
          'हाथों से शुरू करें। बाकी खुद होगा।',
          'आपकी चाल। हमारी तरफ से थोड़ी चिंगारी 🎯',
          'सिर्फ दस मिनट और एहसास बदल जाएगा।',
          'आज रात कुछ नया आपका इंतज़ार कर रहा है 👀',
          'सबसे अच्छी रातें बस साथ आने से शुरू होती हैं।',
          'हमने कुछ खास रखा है। आकर देखें ✨',
        ],
        streakTitle: 'चिंगारी अभी भी ज़िंदा है ✨',
        streakBodies: [
          'आप दोनों व्यस्त थे। हम यहीं हैं 🌸',
          'कोई दबाव नहीं। बस आज के लिए हल्की याद दिलाहट।',
          'स्ट्रीक आराम कर रही है। जब चाहें फिर शुरू करें 🔥',
        ],
        reactivationTitle: 'हम अभी भी यहीं हैं ✨',
        reactivationBodies: [
          'एक हफ्ता हो गया। नए ideas आपका इंतज़ार कर रहे हैं।',
          'हम यहीं हैं। और अब भी आप दोनों के लिए rooting कर रहे हैं 🌸',
          'आपकी जगह सुरक्षित है। जब चाहें लौट आएं।',
        ],
      },
      coach: {
        systemPrompt: `You are writing a short, warm note meant for two people sharing a moment together.
The tone is warm, light, optional, flirty, and never detached or judgmental.
Keep it to 2-3 sentences.
Do not explain why anything works.
Do not give advice, teach, pressure, guilt, urgency, or improvement framing.
Speak to both people together as "you two", gently and casually.`,
        fallbackNotes: [
          'आप दोनों पहले से sync में हैं। हल्का और करीब काफी है।',
          'धीमा, तेज़, या बीच में कहीं। आपका तरीका ही सही है।',
          'परफेक्ट होने की जरूरत नहीं। साथ होना ही काफी है।',
          'एक मुस्कान भी ठहरने की अच्छी जगह हो सकती है।',
          'आज की रात आपकी है।',
          'चिंगारी पहले से है। वह नरम भी रह सकती है।',
          'जहां अच्छा लगे, वहां थोड़ी जगह और है।',
          'आपकी लय जैसी है, वैसी ही प्यारी है।',
        ],
        userPrompt: (contentType, item) => `A little context for the note:
Name: ${item.name}
Type: ${contentType}
Vibe: ${item.vibe || 'Warm and connecting'}
Category: ${item.category || 'General'}

Write the final note in Hindi.`,
      },
    };
  }

  return {
    entry: {
      headline: ['Let us get closer.', 'This is where it gets good.', 'Closer starts here.', 'Your favorite part of the day.'],
      subline: ['No thinking. Just enjoy.', 'Set the mood.', 'Go with it.', 'Take it easy.'],
      primaryCTA: ['Get started', 'Let us go', 'Jump in'],
      secondaryCTA: ['I have been here before', 'Back again'],
    },
    origin: {
      subtitle: 'A softer way to find your mood together.',
      whyTitle: 'Why we built this',
      whyBody: 'We wanted something couples could open without feeling studied, managed, or put on the spot.',
      forTitle: 'What it is for',
      forBody: 'Blisse is here for play, closeness, flirting, and those nights when you want a little spark but not a whole conversation first.',
      howTitle: 'How to use it',
      howBody: 'Pick the vibe that feels true. Take one idea, skip another, change your mind whenever. Your pace is the right pace.',
      cta: 'Let us begin',
      backCta: 'Back to Blisse',
    },
    home: {
      header: ['Tonight\'s vibe', 'Set the mood', 'Your kind of night'],
      helper: ['No rules. Just pick.', 'Go with what feels right.', 'No pressure.'],
      pickedForTonight: 'Tonight\'s suggestions',
      vibeQuestion: 'What do you want to do right now?',
      setTonightVibe: 'Set tonight\'s vibe',
      vibeHelper: 'Set tonight\'s vibe first. The rest can stay easy.',
      exploreFreely: 'Explore freely',
      suggestionsExplainerSelected: 'Everything below is picked to match this vibe.',
      suggestionsExplainerEmpty: 'Pick a vibe first — everything else follows.',
      whyWeMadeThis: 'Why we made this',
      quietWinsHidden: 'Little wins and saved sparks',
      quietWinsShown: 'Hide the little wins',
      moods: {
        easy: ['Easy and close', 'No effort', 'Just relax'],
        slow: ['Slow burn', 'Take it slow', 'Nice and easy'],
        playful: ['Let us play', 'A little fun', 'Feeling flirty'],
        change: ['Change it up', 'Something different', 'Mix it up'],
        surprise: ['Surprise me', 'You choose', 'I am open'],
      },
      greeting: {
        morning: (name) => `Good morning, ${name} ☀️`,
        morningContext: 'A little connection can fit anywhere.',
        afternoon: (name) => `Hey ${name} 👋`,
        afternoonContext: 'Set something up for tonight.',
        evening: (name) => `Good evening, ${name} 🌙`,
        eveningContext: 'Tonight\'s looking good.',
        night: (name) => `Still up, ${name} 🌸`,
        nightContext: 'No judgment. We have ideas.',
      },
      trialBanner: (days) => `✨ Free trial · ${days} day${days === 1 ? '' : 's'} left — Keep the spark unlocked`,
      tonightSession: {
        label: 'Tonight',
        title: 'A little flow for two',
        subtitle: 'Mood first. Everything else follows.',
        teaser: 'Low effort, warm chemistry, and no pressure.',
        cta: 'Let\'s begin →',
      },
      forYouSubtitle: 'Very your vibe',
      profile: {
        rhythmHeading: 'Your Rhythm',
        ideasPlayed: (count) => `${count} of 400+ ideas played`,
        styleWarmup: 'Keep going — your style is warming up 🌱',
        youLeanInto: 'You lean into:',
        styleUpdates: 'This updates as you play together',
      },
    },
    suggestion: {
      titleFallback: ['This one is calling your name.', 'This feels right.', 'Very you.', 'Right where you like it.', 'Easy. Familiar. Good.'],
      reason: ['You like it slow and close.', 'This matches your vibe.', 'You always come back to this.', 'This usually hits just right.', 'Right on your wavelength.'],
      badge: {
        position: '✨ Position',
        foreplay: '✨ Foreplay',
        oral: '✨ Oral',
        massage: '✨ Massage',
        roleplay: '✨ Roleplay',
      },
      cta: ['Go', 'Let us try', 'This could fit'],
      fallbackVibe: 'Soft, close, and easy to slip into.',
    },
    detail: {
      opener: ['Take your time with this one.', 'No rush. Let it build.', 'Settle in.', 'Enjoy this.', 'Go slow if you want.'],
      closer: ['Stay here if it feels good.', 'Let it unfold.', 'Follow what feels warm.'],
      coachTitle: 'For you two 🌸',
    },
    empty: {
      loading: ['Warming up…', 'Give us a second.', 'Almost there.'],
      nothingYet: ['Let us start easy.', 'We will take it slow.', 'This is a good place to begin.'],
      exploreBody: 'Clear the filter, or switch tabs for a fresh vibe.',
      clearFilters: 'Clear filters',
    },
    progress: {
      header: ['This week', 'Right now'],
      streak: ['Still going 🔥', 'In a good flow 🔥', 'Nice rhythm 🔥'],
      weekComplete: ['That felt good.', 'Nice little rhythm this week.', 'You made room for each other.'],
      encouragement: ['You are right there 🌸', 'Nice and easy 🌸', 'Keep it soft 🌸'],
      cardTitle: 'Little wins',
      cardPreparing: 'Keeping this light...',
      cardCollapsedA11y: 'Expand this week card',
      cardExpandedA11y: 'Collapse this week card',
    },
    return: {
      welcomeBack: ['Good to see you.', 'Back for more.', 'Right on time.'],
      easeBack: ['Let us ease in.', 'We will keep it simple.', 'Start with something familiar.'],
    },
    generic: {
      yes: ['Yes', 'Sure', 'Why not'],
      no: ['Not now', 'Maybe later'],
      close: ['That\'s enough for now', 'All set'],
      continue: ['Let\'s keep going', 'Keep going'],
    },
    labels: {
      brandName: 'Blisse',
      appDataTitle: 'App data',
      activityLog: 'Activity log',
      interactionHistory: 'Interaction history',
      notesSaved: 'Notes saved',
      totalStarsEarned: 'Total stars earned',
      collectionLevel2Lock: 'More packs unlock at Level 2',
      profileEnergy: 'Energy:',
      profileType: 'Type:',
      shareBlisse: 'Share Blisse with another couple',
      version: 'Version',
      levelUpTitle: 'Level Up!',
      levelUpUnlockedNow: 'Unlocked now',
      levelUpClaim: 'Claim your reward →',
    },
    dailyBonus: {
      title: 'Daily Bliss Drop',
      dayStreak: (day) => `Day ${day} streak! 🔥`,
      collect: (count) => `Collect ${count} ⭐`,
      collected: (count) => `Collected ${count} ⭐`,
      caption: 'More stars tomorrow. Your spot stays warm.',
    },
    moodCheck: {
      header: 'Tonight\'s vibe',
      subheader: 'Set tonight\'s vibe. We will keep it easy from there.',
      helper: 'Pick what feels true. You can change your mind anytime.',
      refineTitle: 'A tiny tune-up?',
      energySoft: 'Soft energy',
      energyPlayful: 'More playful',
      paceShort: 'Short and sweet',
      paceUnfold: 'Let it unfold',
      cta: 'Let\'s go',
      ctaA11y: 'Let us go',
    },
    sessionPlan: {
      progress: '',
      coachTitle: 'Tonight\'s note',
      details: 'Open',
      openAction: 'Take a look',
      tryAction: 'Try this',
      regenerate: 'Change it up',
      regenerateA11y: 'Regenerate session',
      cta: 'We\'re good →',
      ctaA11y: 'We are good',
      start: 'Begin with...',
      move: 'Move into...',
      finish: 'Finish with...',
      fallbackName: 'Something new',
      fallbackVibe: 'This could fit tonight.',
      coachIntro: {
        romantic: 'Slow, close, and warm tonight.',
        passionate: 'Heat first. No waiting.',
        playful: 'Keep it fun and flirty.',
        adventurous: 'One fresh spark could feel good tonight.',
        relaxed: 'Easy, soft, and together.',
        quickie: 'Quick and hot.',
      },
    },
    sessionRating: {
      progress: '',
      title: 'That was...',
      subtitle: 'No overthinking',
      emojiPrompt: 'Pick the vibe',
      microcopy: {
        hot: ['That hit. Keep that energy.', 'Yes. That was a lot of fun.'],
        warm: ['Soft and close. Very good.', 'Easy, warm, and right.'],
        neutral: ['All good. Next one can be different.', 'No pressure. Keep it playful.'],
      },
      reactionA11y: {
        hot: 'Felt hot',
        warm: 'Felt close',
        neutral: 'Felt neutral',
      },
      doneSimple: 'All set',
      saveWorked: 'Save what worked ❤️',
      fallbackStartLabel: 'Begin with...',
      fallbackMoveLabel: 'Move into...',
      fallbackFinishLabel: 'Finish with...',
      coachLabel: 'For you two 🌸',
      coachBody: 'Keep the moments that felt good. They can come back whenever you want.',
      remember: 'Keep this',
      optional: 'Optional',
      feelNow: 'Right now',
      tried: 'Mark all as tried ✓',
      saveFavorites: 'Save favorites ❤️',
      rateOnly: 'Just rate and close',
      chooseRating: 'Choose whatever feels closest',
      starsEarnedTitle: (count) => `You earned ${count} ⭐`,
      starsEarnedSubtitle: 'Stars earned this session',
      achievements: 'New badges',
      noAchievements: 'No new badge tonight. Your rhythm is still hot.',
      done: 'All set for tonight →',
      rateA11y: (value) => `Rate ${value} stars`,
      fallbackCloser: 'You picked each other tonight. That always wins.',
      postMood: 'Post-session mood',
    },
    sessionClosers: {
      romantic: 'You chose warmth tonight. Keep that feeling close.',
      passionate: 'That fire fits you two.',
      playful: 'Laughing together turns the spark up.',
      adventurous: 'You went bold and stayed close. Perfect combo.',
      relaxed: 'Comfort and closeness. Beautiful move.',
      quickie: 'You made a short window count.',
    },
    onboarding: {
      namePreview: (name) => `Hey ${name} — let us set this up for you two 👋`,
      payoffHeader: (name) => `Made for tonight, ${name || 'you two'} 👋`,
      payoffSubline: {
        deepConnection: 'You like it close, slow, and real. Perfect.',
        spiceThingsUp: 'You want fresh heat. Let us turn it up tonight.',
        adventurous: 'You like a little edge. This will hit just right.',
        quickies: 'Sometimes fast is the move. Keep it hot and simple.',
        default: 'You showed up. That is already a very good start.',
      },
      payoffValueIdeas: (count) => `${count}+ Ideas`,
      payoffValueChallenges: 'Challenges',
      payoffValueDateNights: 'Date Nights',
      payoffUnlock: 'Unlock to play →',
      payoffCta: 'Let us begin →',
      payoffCancel: 'Cancel anytime · No commitment',
      welcomeSubtitle: 'Set the mood. Let it get good.',
      welcomeExisting: 'Already in · Sign In',
    },
    paywall: {
      title: 'More room to play, together',
      subtitle: 'Everything you need for nights like this.',
      featureIdeas: '🌸 400+ ideas, positions and date nights',
      featureChallenges: '🎯 Weekly dares and tonight picks',
      featurePrivacy: '🔒 Private · No ads · Cancel anytime',
      primaryCta: 'Start My Subscription →',
      contact: 'We are real people. Reach us anytime.',
    },
    share: {
      appReferral: (link) => `We use Blisse to explore together — you should try it 🌸 ${link}`,
      position: (name, link) => `We tried ${name} tonight — found it in Blisse 🌸 ${link}`,
      foreplay: (name, link) => `This foreplay idea from Blisse changed our evening: ${name} ✨ ${link}`,
      oral: (name, link) => `We tried this idea tonight — ${name} 👄 Found it on Blisse 🌸 ${link}`,
      massage: (name, link) => `This massage pick changed the whole vibe tonight: ${name} 💆 Found it on Blisse 🌸 ${link}`,
      roleplay: (name, link) => `We did this roleplay tonight — ${name}. Found it in Blisse 🌸 ${link}`,
    },
    notifications: {
      dailyTease: [
        'Something slow and connected is waiting for you tonight 🌸',
        'Start with your hands. The rest follows.',
        'Your move. We have plenty for you two 🎯',
        'Ten minutes. That is all it takes.',
        'New tonight: something you have not tried yet 👀',
        'The best nights start when you show up.',
        'We picked something for you two. Come see it ✨',
      ],
      streakTitle: 'Keep your spark alive ✨',
      streakBodies: [
        'You have been busy. We get it. Still here when you are ready 🌸',
        'No pressure. Just a soft nudge for tonight.',
        'Your streak is resting. Pick it back up whenever 🔥',
      ],
      reactivationTitle: 'Still here for you ✨',
      reactivationBodies: [
        'It has been a week. New ideas are waiting.',
        'Still here. Still rooting for you two 🌸',
        'Your spot is saved. Come back anytime.',
      ],
    },
    coach: {
      systemPrompt: `You are writing a short, warm note meant for two people sharing a moment together.
The tone is warm, light, optional, flirty, and never detached or judgmental.
Keep it to 2-3 sentences.
Do not explain why anything works.
Do not give advice, teach, pressure, guilt, urgency, or improvement framing.
Speak to both people together as "you two", gently and casually.`,
      fallbackNotes: [
        'You two are already in sync. Easy and close is enough.',
        'Slow, fast, or somewhere in between. Your way counts.',
        'No perfect needed tonight. Being here together is plenty.',
        'A shared smile is a good place to linger.',
        'Tonight is yours. Play can stay light.',
        'The spark is already here. Let it stay soft.',
        'Where it feels good, there is room to linger.',
        'Your rhythm can be exactly what it is.',
      ],
      userPrompt: (contentType, item) => `A little context for the note:
Name: ${item.name}
Type: ${contentType}
Vibe: ${item.vibe || 'Warm and connecting'}
Category: ${item.category || 'General'}

Write the final note in English.`,
    },
  };
};

export const resolveVoiceLanguage = (language?: string): VoiceLanguage => {
  if (language === 'es' || language === 'pt' || language === 'hi') return language;
  return 'en';
};

export const getVoiceCopy = (language?: string): VoiceCopyPack => {
  return buildPack(resolveVoiceLanguage(language));
};

const hashSeed = (seed: string | number): number => {
  const text = String(seed);
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

const dayKey = () => new Date().toISOString().slice(0, 10);

export const pickVoiceLine = (
  lines: VoiceLineSet,
  seed: string | number = dayKey(),
): VoiceLine => {
  if (!Array.isArray(lines) || lines.length === 0) return '';
  return lines[hashSeed(seed) % lines.length];
};
