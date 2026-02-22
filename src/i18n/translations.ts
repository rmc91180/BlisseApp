import authStrings from '@/i18n/source/auth-strings.json';
import uiStrings from '@/i18n/source/ui-strings.json';

export type AppLanguage = 'en' | 'es' | 'pt';

export const SUPPORTED_LANGUAGES: Array<{ code: AppLanguage; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Espanol' },
  { code: 'pt', label: 'Portugues' },
];

type TranslationValue = string;
type TranslationParams = Record<string, string | number>;
type ExternalLanguage = 'en' | 'es' | 'pt-BR';

const toExternalLanguage = (language: AppLanguage): ExternalLanguage => {
  if (language === 'pt') return 'pt-BR';
  return language;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const getByPath = (source: unknown, path: string): unknown => {
  const keys = path.split('.').filter(Boolean);
  let current: unknown = source;
  for (const key of keys) {
    if (!isRecord(current) || !(key in current)) return undefined;
    current = current[key];
  }
  return current;
};

const interpolate = (template: string, params?: TranslationParams): string => {
  if (!params) return template;
  let value = template;
  Object.entries(params).forEach(([paramKey, paramValue]) => {
    value = value.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
  });
  return value;
};

const UI_TRANSLATIONS: Record<AppLanguage, Record<string, TranslationValue>> = {
  en: {
    'tabs.home': 'Home',
    'tabs.explore': 'Explore',
    'tabs.favorites': 'Favorites',
    'tabs.profile': 'Profile',

    'common.all': 'All',
    'common.continue': 'Continue',
    'common.done': 'done',
    'common.open': 'Open',
    'common.not_set': 'Not set',
    'common.search': 'Search',

    'stats.tried': 'Tried',
    'stats.favorites': 'Favorites',
    'stats.total': 'Total',
    'stats.challenges': 'Challenges',

    'home.greeting.morning': 'Good morning',
    'home.greeting.afternoon': 'Good afternoon',
    'home.greeting.evening': 'Good evening',
    'home.hey_name': 'Hey {name}!',
    'home.there': 'there',
    'home.level': 'Level {level}',
    'home.next': 'Next: {emoji}',
    'home.stars_to_level': '{count} stars to {title}',
    'home.week_streak': '{count} week streak! Keep it up!',
    'home.day_login_streak': '{count} day login streak!',
    'home.daily_tease': 'Daily Tease',
    'home.reveal_punchline': 'Reveal punchline',
    'home.punchline': 'Punchline',
    'home.tonight_suggestion': "Tonight's Suggestion",
    'home.how_feeling': 'How are you feeling?',
    'home.weekly_goals': 'Weekly Goals',
    'home.quality.playful': 'Whimsy wheel for bold giggles',
    'home.quality.romance': 'Curated romance, reloaded',
    'home.quality.truth_dare': 'Deeper truths, playful dares',
    'home.quality.challenge': 'Team up and level your love',
    'home.quality.music': 'Mood tracks for two',
    'home.quality.for_you': 'Personalized sparks for your duo',
    'home.quality.moods': 'Pick your vibe, set the tone',
    'home.quality.goals': 'Quick wins that keep flame alive',
    'home.quality.trophies': 'Milestones worth bragging about',

    'explore.title': 'Explore',
    'explore.search_placeholder': 'Search {type}...',
    'explore.type.positions': 'Positions',
    'explore.type.foreplay': 'Foreplay',
    'explore.type.oral': 'Oral',
    'explore.type.massage': 'Massage',
    'explore.type.roleplay': 'Role Play',
    'explore.sort.all': 'All',
    'explore.sort.new': 'New',
    'explore.sort.tried': 'Tried',
    'explore.empty': 'No results found',

    'favorites.title': 'Favorites',
    'favorites.favorites_toggle': 'Favorites',
    'favorites.recent_toggle': 'Recently Tried',
    'favorites.positions_count': 'Positions ({count})',
    'favorites.foreplay_count': 'Foreplay ({count})',
    'favorites.oral_count': 'Oral ({count})',
    'favorites.empty.positions.title': 'No favorite positions yet',
    'favorites.empty.positions.subtitle': 'Tap the heart on positions you love',
    'favorites.empty.foreplay.title': 'No favorite foreplay yet',
    'favorites.empty.foreplay.subtitle': 'Tap the heart on ideas you love',
    'favorites.empty.oral.title': 'No favorite oral yet',
    'favorites.empty.oral.subtitle': 'Tap the heart on ideas you love',
    'favorites.empty.recent.title': 'No recent activity',
    'favorites.empty.recent.subtitle': 'Mark items as tried to see them here',

    'profile.friend': 'Friend',
    'profile.stars_earned': '{count} stars earned',
    'profile.protected': 'Protected',
    'profile.week_streak': '{count} week streak',
    'profile.progress': 'Your Progress',
    'profile.progress_text': '{tried} of {total} items tried ({percent}%)',
    'profile.achievements': 'Achievements',
    'profile.insights': 'Insights',
    'profile.view_stats': 'View Stats',
    'profile.recent_achievements': 'Recent Achievements',
    'profile.notes': 'Your Notes ({count})',
    'profile.unknown': 'Unknown',
    'profile.no_notes': 'No notes',
    'profile.menu.settings': 'Settings & Security',
    'profile.menu.ideas': 'Submit an Idea',
    'profile.menu.contact': 'Contact Us',
    'profile.menu.terms': 'Terms of Service',
    'profile.menu.privacy': 'Privacy Policy',
    'profile.menu.signout': 'Sign Out',
    'profile.version': 'Blisse v1.0.0 - Made with love',
    'profile.signout.title': 'Sign Out',
    'profile.signout.message': 'Are you sure you want to sign out?',
    'profile.signout.error': 'Failed to sign out',

    'settings.title': 'Settings',
    'settings.section.security': 'Privacy & Security',
    'settings.section.language': 'Language',
    'settings.section.appearance': 'Appearance',
    'settings.section.account': 'Account',
    'settings.section.data': 'Your Data',
    'settings.language': 'Language',
    'settings.pin.change': 'Change PIN Lock',
    'settings.pin.set': 'Set PIN Lock',
    'settings.pin.enabled': 'Enabled',
    'settings.pin.off': 'Off',
    'settings.biometrics': 'Use Face/Touch ID',
    'settings.on': 'On',
    'settings.account.name': 'Name',
    'settings.account.experience': 'Experience',
    'settings.account.about': 'About Blisse',
    'settings.account.delete': 'Delete Account',
    'settings.data.total_stars': 'Total Stars',
    'settings.data.items_tried': 'Items Tried',
    'settings.data.reset': 'Reset All Data',
    'settings.pin.setup_title': 'Set 4-Digit PIN',
    'settings.pin.enter': 'Enter PIN',
    'settings.pin.confirm': 'Confirm PIN',
    'settings.pin.cancel': 'Cancel',
    'settings.pin.save': 'Save PIN',
  },
  es: {
    'tabs.home': 'Inicio',
    'tabs.explore': 'Explorar',
    'tabs.favorites': 'Favoritos',
    'tabs.profile': 'Perfil',

    'common.all': 'Todo',
    'common.continue': 'Continuar',
    'common.done': 'hecho',
    'common.open': 'Abrir',
    'common.not_set': 'No definido',
    'common.search': 'Buscar',

    'stats.tried': 'Probado',
    'stats.favorites': 'Favoritos',
    'stats.total': 'Total',
    'stats.challenges': 'Retos',

    'home.greeting.morning': 'Buenos dias',
    'home.greeting.afternoon': 'Buenas tardes',
    'home.greeting.evening': 'Buenas noches',
    'home.hey_name': 'Hola {name}!',
    'home.there': 'amor',
    'home.level': 'Nivel {level}',
    'home.next': 'Siguiente: {emoji}',
    'home.stars_to_level': '{count} estrellas para {title}',
    'home.week_streak': 'Racha de {count} semanas! Sigue asi!',
    'home.day_login_streak': 'Racha de acceso de {count} dias!',
    'home.daily_tease': 'Tease diario',
    'home.reveal_punchline': 'Revelar remate',
    'home.punchline': 'Remate',
    'home.tonight_suggestion': 'Sugerencia de hoy',
    'home.how_feeling': 'Como te sientes?',
    'home.weekly_goals': 'Metas semanales',
    'home.quality.playful': 'Ruleta divertida para retos atrevidos',
    'home.quality.romance': 'Romance curado para recargar la chispa',
    'home.quality.truth_dare': 'Verdades profundas y retos juguetones',
    'home.quality.challenge': 'Crezcan juntos y suban de nivel',
    'home.quality.music': 'Musica para dos',
    'home.quality.for_you': 'Ideas personalizadas para ustedes',
    'home.quality.moods': 'Elige el mood y marca el tono',
    'home.quality.goals': 'Metas rapidas para mantener la llama',
    'home.quality.trophies': 'Logros para celebrar en pareja',

    'explore.title': 'Explorar',
    'explore.search_placeholder': 'Buscar en {type}...',
    'explore.type.positions': 'Posiciones',
    'explore.type.foreplay': 'Preliminares',
    'explore.type.oral': 'Oral',
    'explore.type.massage': 'Masaje',
    'explore.type.roleplay': 'Role play',
    'explore.sort.all': 'Todo',
    'explore.sort.new': 'Nuevo',
    'explore.sort.tried': 'Probado',
    'explore.empty': 'No se encontraron resultados',

    'favorites.title': 'Favoritos',
    'favorites.favorites_toggle': 'Favoritos',
    'favorites.recent_toggle': 'Probado recientemente',
    'favorites.positions_count': 'Posiciones ({count})',
    'favorites.foreplay_count': 'Preliminares ({count})',
    'favorites.oral_count': 'Oral ({count})',
    'favorites.empty.positions.title': 'Aun no hay posiciones favoritas',
    'favorites.empty.positions.subtitle': 'Toca el corazon en las posiciones que amas',
    'favorites.empty.foreplay.title': 'Aun no hay preliminares favoritos',
    'favorites.empty.foreplay.subtitle': 'Toca el corazon en las ideas que amas',
    'favorites.empty.oral.title': 'Aun no hay oral favorito',
    'favorites.empty.oral.subtitle': 'Toca el corazon en las ideas que amas',
    'favorites.empty.recent.title': 'No hay actividad reciente',
    'favorites.empty.recent.subtitle': 'Marca items como probados para verlos aqui',

    'profile.friend': 'Amor',
    'profile.stars_earned': '{count} estrellas ganadas',
    'profile.protected': 'Protegido',
    'profile.week_streak': 'Racha de {count} semanas',
    'profile.progress': 'Tu progreso',
    'profile.progress_text': '{tried} de {total} items probados ({percent}%)',
    'profile.achievements': 'Logros',
    'profile.insights': 'Insights',
    'profile.view_stats': 'Ver estadisticas',
    'profile.recent_achievements': 'Logros recientes',
    'profile.notes': 'Tus notas ({count})',
    'profile.unknown': 'Desconocido',
    'profile.no_notes': 'Sin notas',
    'profile.menu.settings': 'Ajustes y seguridad',
    'profile.menu.ideas': 'Enviar una idea',
    'profile.menu.contact': 'Contactanos',
    'profile.menu.terms': 'Terminos de servicio',
    'profile.menu.privacy': 'Politica de privacidad',
    'profile.menu.signout': 'Cerrar sesion',
    'profile.version': 'Blisse v1.0.0 - Hecho con amor',
    'profile.signout.title': 'Cerrar sesion',
    'profile.signout.message': 'Seguro que quieres cerrar sesion?',
    'profile.signout.error': 'No se pudo cerrar sesion',

    'settings.title': 'Ajustes',
    'settings.section.security': 'Privacidad y seguridad',
    'settings.section.language': 'Idioma',
    'settings.section.appearance': 'Apariencia',
    'settings.section.account': 'Cuenta',
    'settings.section.data': 'Tus datos',
    'settings.language': 'Idioma',
    'settings.pin.change': 'Cambiar PIN',
    'settings.pin.set': 'Configurar PIN',
    'settings.pin.enabled': 'Activo',
    'settings.pin.off': 'Apagado',
    'settings.biometrics': 'Usar Face/Touch ID',
    'settings.on': 'Encendido',
    'settings.account.name': 'Nombre',
    'settings.account.experience': 'Experiencia',
    'settings.account.about': 'Sobre Blisse',
    'settings.account.delete': 'Eliminar cuenta',
    'settings.data.total_stars': 'Estrellas totales',
    'settings.data.items_tried': 'Items probados',
    'settings.data.reset': 'Restablecer todos los datos',
    'settings.pin.setup_title': 'Configurar PIN de 4 digitos',
    'settings.pin.enter': 'Ingresar PIN',
    'settings.pin.confirm': 'Confirmar PIN',
    'settings.pin.cancel': 'Cancelar',
    'settings.pin.save': 'Guardar PIN',
  },
  pt: {
    'tabs.home': 'Inicio',
    'tabs.explore': 'Explorar',
    'tabs.favorites': 'Favoritos',
    'tabs.profile': 'Perfil',

    'common.all': 'Todos',
    'common.continue': 'Continuar',
    'common.done': 'concluido',
    'common.open': 'Abrir',
    'common.not_set': 'Nao definido',
    'common.search': 'Buscar',

    'stats.tried': 'Tentado',
    'stats.favorites': 'Favoritos',
    'stats.total': 'Total',
    'stats.challenges': 'Desafios',

    'home.greeting.morning': 'Bom dia',
    'home.greeting.afternoon': 'Boa tarde',
    'home.greeting.evening': 'Boa noite',
    'home.hey_name': 'Oi {name}!',
    'home.there': 'amor',
    'home.level': 'Nivel {level}',
    'home.next': 'Proximo: {emoji}',
    'home.stars_to_level': '{count} estrelas para {title}',
    'home.week_streak': 'Sequencia de {count} semanas! Continuem!',
    'home.day_login_streak': 'Sequencia de login de {count} dias!',
    'home.daily_tease': 'Tease diario',
    'home.reveal_punchline': 'Revelar punchline',
    'home.punchline': 'Punchline',
    'home.tonight_suggestion': 'Sugestao da noite',
    'home.how_feeling': 'Como voces estao?',
    'home.weekly_goals': 'Metas semanais',
    'home.quality.playful': 'Roleta divertida para desafios ousados',
    'home.quality.romance': 'Romance selecionado para reacender a chama',
    'home.quality.truth_dare': 'Verdades profundas e desafios divertidos',
    'home.quality.challenge': 'Evoluam juntos no amor',
    'home.quality.music': 'Musicas para dois',
    'home.quality.for_you': 'Ideias personalizadas para o casal',
    'home.quality.moods': 'Escolha o clima e defina o tom',
    'home.quality.goals': 'Vitorias rapidas para manter a chama',
    'home.quality.trophies': 'Marcos para comemorar',

    'explore.title': 'Explorar',
    'explore.search_placeholder': 'Buscar em {type}...',
    'explore.type.positions': 'Posicoes',
    'explore.type.foreplay': 'Preliminares',
    'explore.type.oral': 'Oral',
    'explore.type.massage': 'Massagem',
    'explore.type.roleplay': 'Role play',
    'explore.sort.all': 'Todos',
    'explore.sort.new': 'Novo',
    'explore.sort.tried': 'Tentado',
    'explore.empty': 'Nenhum resultado encontrado',

    'favorites.title': 'Favoritos',
    'favorites.favorites_toggle': 'Favoritos',
    'favorites.recent_toggle': 'Tentados recentemente',
    'favorites.positions_count': 'Posicoes ({count})',
    'favorites.foreplay_count': 'Preliminares ({count})',
    'favorites.oral_count': 'Oral ({count})',
    'favorites.empty.positions.title': 'Ainda sem posicoes favoritas',
    'favorites.empty.positions.subtitle': 'Toque no coracao nas posicoes que voces amam',
    'favorites.empty.foreplay.title': 'Ainda sem preliminares favoritos',
    'favorites.empty.foreplay.subtitle': 'Toque no coracao nas ideias que voces amam',
    'favorites.empty.oral.title': 'Ainda sem oral favorito',
    'favorites.empty.oral.subtitle': 'Toque no coracao nas ideias que voces amam',
    'favorites.empty.recent.title': 'Sem atividade recente',
    'favorites.empty.recent.subtitle': 'Marque itens como tentados para ve-los aqui',

    'profile.friend': 'Amor',
    'profile.stars_earned': '{count} estrelas ganhas',
    'profile.protected': 'Protegido',
    'profile.week_streak': 'Sequencia de {count} semanas',
    'profile.progress': 'Seu progresso',
    'profile.progress_text': '{tried} de {total} itens tentados ({percent}%)',
    'profile.achievements': 'Conquistas',
    'profile.insights': 'Insights',
    'profile.view_stats': 'Ver estatisticas',
    'profile.recent_achievements': 'Conquistas recentes',
    'profile.notes': 'Suas notas ({count})',
    'profile.unknown': 'Desconhecido',
    'profile.no_notes': 'Sem notas',
    'profile.menu.settings': 'Configuracoes e seguranca',
    'profile.menu.ideas': 'Enviar uma ideia',
    'profile.menu.contact': 'Contato',
    'profile.menu.terms': 'Termos de servico',
    'profile.menu.privacy': 'Politica de privacidade',
    'profile.menu.signout': 'Sair',
    'profile.version': 'Blisse v1.0.0 - Feito com amor',
    'profile.signout.title': 'Sair',
    'profile.signout.message': 'Tem certeza que deseja sair?',
    'profile.signout.error': 'Falha ao sair',

    'settings.title': 'Configuracoes',
    'settings.section.security': 'Privacidade e seguranca',
    'settings.section.language': 'Idioma',
    'settings.section.appearance': 'Aparencia',
    'settings.section.account': 'Conta',
    'settings.section.data': 'Seus dados',
    'settings.language': 'Idioma',
    'settings.pin.change': 'Alterar PIN',
    'settings.pin.set': 'Definir PIN',
    'settings.pin.enabled': 'Ativo',
    'settings.pin.off': 'Desligado',
    'settings.biometrics': 'Usar Face/Touch ID',
    'settings.on': 'Ligado',
    'settings.account.name': 'Nome',
    'settings.account.experience': 'Experiencia',
    'settings.account.about': 'Sobre Blisse',
    'settings.account.delete': 'Excluir conta',
    'settings.data.total_stars': 'Total de estrelas',
    'settings.data.items_tried': 'Itens tentados',
    'settings.data.reset': 'Resetar todos os dados',
    'settings.pin.setup_title': 'Definir PIN de 4 digitos',
    'settings.pin.enter': 'Digite o PIN',
    'settings.pin.confirm': 'Confirme o PIN',
    'settings.pin.cancel': 'Cancelar',
    'settings.pin.save': 'Salvar PIN',
  },
};

const TERM_TRANSLATIONS: Record<string, Record<AppLanguage, string>> = {
  'Woman on Top': { en: 'Woman on Top', es: 'Mujer arriba', pt: 'Mulher por cima' },
  'Man on Top': { en: 'Man on Top', es: 'Hombre arriba', pt: 'Homem por cima' },
  Sitting: { en: 'Sitting', es: 'Sentados', pt: 'Sentados' },
  'Side by Side': { en: 'Side by Side', es: 'Lado a lado', pt: 'Lado a lado' },
  'Rear Entry': { en: 'Rear Entry', es: 'Entrada posterior', pt: 'Entrada por tras' },
  Standing: { en: 'Standing', es: 'De pie', pt: 'Em pe' },
  Exotic: { en: 'Exotic', es: 'Exotico', pt: 'Exotico' },
  Furniture: { en: 'Furniture', es: 'Muebles', pt: 'Moveis' },

  Touch: { en: 'Touch', es: 'Toque', pt: 'Toque' },
  Sensation: { en: 'Sensation', es: 'Sensacion', pt: 'Sensacao' },
  Mental: { en: 'Mental', es: 'Mental', pt: 'Mental' },
  Connection: { en: 'Connection', es: 'Conexion', pt: 'Conexao' },
  Setting: { en: 'Setting', es: 'Escenario', pt: 'Cenario' },

  'For Her': { en: 'For Her', es: 'Para ella', pt: 'Para ela' },
  'For Him': { en: 'For Him', es: 'Para el', pt: 'Para ele' },
  Mutual: { en: 'Mutual', es: 'Mutuo', pt: 'Mutuo' },

  Relaxation: { en: 'Relaxation', es: 'Relajacion', pt: 'Relaxamento' },
  Sensual: { en: 'Sensual', es: 'Sensual', pt: 'Sensual' },
  Therapeutic: { en: 'Therapeutic', es: 'Terapeutico', pt: 'Terapeutico' },

  Romantic: { en: 'Romantic', es: 'Romantico', pt: 'Romantico' },
  Fantasy: { en: 'Fantasy', es: 'Fantasia', pt: 'Fantasia' },
  Playful: { en: 'Playful', es: 'Jugueton', pt: 'Brincalhao' },
  Adventurous: { en: 'Adventurous', es: 'Aventurero', pt: 'Aventureiro' },

  Beginner: { en: 'Beginner', es: 'Principiante', pt: 'Iniciante' },
  Intermediate: { en: 'Intermediate', es: 'Intermedio', pt: 'Intermediario' },
  Advanced: { en: 'Advanced', es: 'Avanzado', pt: 'Avancado' },
  Light: { en: 'Light', es: 'Suave', pt: 'Leve' },
  Intense: { en: 'Intense', es: 'Intenso', pt: 'Intenso' },

  Quick: { en: 'Quick', es: 'Rapido', pt: 'Rapido' },
  Medium: { en: 'Medium', es: 'Medio', pt: 'Medio' },
  Extended: { en: 'Extended', es: 'Extendido', pt: 'Estendido' },

  Passionate: { en: 'Passionate', es: 'Apasionado', pt: 'Apaixonado' },
  Flowing: { en: 'Flowing', es: 'Fluido', pt: 'Fluido' },
  Grounded: { en: 'Grounded', es: 'Conectado', pt: 'Estavel' },
  Commanding: { en: 'Commanding', es: 'Dominante', pt: 'Dominante' },
  Unified: { en: 'Unified', es: 'Unido', pt: 'Unido' },
  Dynamic: { en: 'Dynamic', es: 'Dinamico', pt: 'Dinamico' },
  Blossoming: { en: 'Blossoming', es: 'Floreciente', pt: 'Florescendo' },
  passionate: { en: 'passionate', es: 'apasionado', pt: 'apaixonado' },
  playful: { en: 'playful', es: 'jugueton', pt: 'brincalhao' },
  flowing: { en: 'flowing', es: 'fluido', pt: 'fluido' },
  grounded: { en: 'grounded', es: 'conectado', pt: 'estavel' },
  commanding: { en: 'commanding', es: 'dominante', pt: 'dominante' },
  unified: { en: 'unified', es: 'unido', pt: 'unido' },
  dynamic: { en: 'dynamic', es: 'dinamico', pt: 'dinamico' },
  blossoming: { en: 'blossoming', es: 'floreciente', pt: 'florescendo' },
  'He gives': { en: 'He gives', es: 'El da', pt: 'Ele conduz' },
  'She gives': { en: 'She gives', es: 'Ella da', pt: 'Ela conduz' },
};

export const translateUi = (language: AppLanguage, key: string, params?: TranslationParams): string => {
  const table = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;
  const fallback = UI_TRANSLATIONS.en[key];
  const template = table[key] ?? fallback ?? key;
  return interpolate(template, params);
};

export const translateFromUiPack = (language: AppLanguage, path: string, params?: TranslationParams): string => {
  const externalLanguage = toExternalLanguage(language);
  const node = getByPath(uiStrings, path);
  if (!isRecord(node)) return '';
  const direct = node[externalLanguage];
  const fallback = node.en;
  const template = typeof direct === 'string' ? direct : typeof fallback === 'string' ? fallback : '';
  return interpolate(template, params);
};

export const translateFromAuthPack = (
  language: AppLanguage,
  screen: string,
  path: string,
  params?: TranslationParams
): string => {
  const externalLanguage = toExternalLanguage(language);
  const screenNode = getByPath(authStrings, `screens.${screen}`);
  if (!isRecord(screenNode)) return '';

  const localizedNode = getByPath(screenNode, externalLanguage);
  const fallbackNode = getByPath(screenNode, 'en');

  const localizedValue = getByPath(localizedNode, path);
  const fallbackValue = getByPath(fallbackNode, path);
  const template = typeof localizedValue === 'string'
    ? localizedValue
    : typeof fallbackValue === 'string'
      ? fallbackValue
      : '';
  return interpolate(template, params);
};

export const translateTerm = (language: AppLanguage, term: string): string => {
  const row = TERM_TRANSLATIONS[term];
  if (!row) return term;
  return row[language] || row.en || term;
};

export const getLanguageLabel = (language: AppLanguage): string => {
  return SUPPORTED_LANGUAGES.find((item) => item.code === language)?.label || 'English';
};

export const getContentTypeKey = (contentType: 'positions' | 'foreplay' | 'oral' | 'massage' | 'roleplay'): string => {
  if (contentType === 'positions') return 'explore.type.positions';
  if (contentType === 'foreplay') return 'explore.type.foreplay';
  if (contentType === 'oral') return 'explore.type.oral';
  if (contentType === 'massage') return 'explore.type.massage';
  return 'explore.type.roleplay';
};
