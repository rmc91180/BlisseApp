import { AppLanguage } from '@/i18n/translations';

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalDocument {
  title: string;
  lastUpdated: string;
  intro?: string;
  sections: LegalSection[];
}

export interface AboutDocument {
  title: string;
  subtitle: string;
  intro: string[];
  sections: LegalSection[];
}

interface LegalLocaleContent {
  terms: LegalDocument;
  privacy: LegalDocument;
  about: AboutDocument;
  common: {
    scrollHint: string;
    readAll: string;
    readAgree: string;
  };
}

const EN_CONTENT: LegalLocaleContent = {
  terms: {
    title: 'Terms of Service',
    lastUpdated: 'Last Updated: February 2026',
    intro: 'Please read these terms carefully before using Blisse.',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        body: 'By downloading, installing, or using Blisse ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the App.',
      },
      {
        heading: '2. Eligibility',
        body: 'You must be at least 18 years of age to use this App. By using Blisse, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into this agreement. The App contains adult content intended for consenting adults only.',
      },
      {
        heading: '3. Description of Service',
        body: 'Blisse is an intimate wellness app designed to help couples explore and enhance their relationship through curated suggestions, activity tracking, and educational content. The App is intended for use by consenting adult couples.',
      },
      {
        heading: '4. User Conduct & Consent',
        body: 'You agree to use the App responsibly and ethically. All activities suggested by the App require enthusiastic, ongoing consent from all parties involved. You are solely responsible for ensuring consent in your relationships. The App does not encourage or condone any non-consensual activities.',
      },
      {
        heading: '5. Health & Safety Disclaimer',
        body: 'The content in this App is for informational and entertainment purposes only. It is NOT medical, therapeutic, or professional health advice. Always consult qualified healthcare professionals for any health concerns. Use suggestions at your own discretion and within your physical capabilities.',
      },
      {
        heading: '6. Intellectual Property',
        body: 'All content, features, and functionality of the App, including but not limited to text, graphics, logos, and software, are the exclusive property of Blisse and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without prior written consent.',
      },
      {
        heading: '7. Privacy',
        body: 'Your privacy is important to us. Please review our Privacy Policy, which explains how we handle your information. By using the App, you consent to our privacy practices as described therein.',
      },
      {
        heading: '8. Limitation of Liability',
        body: 'THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY LAW, BLISSE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE APP. You use the App at your own risk and discretion.',
      },
      {
        heading: '9. Indemnification',
        body: 'You agree to indemnify and hold harmless Blisse, its affiliates, and their respective officers, directors, and employees from any claims, damages, or expenses arising from your use of the App or violation of these Terms.',
      },
      {
        heading: '10. Modifications & Termination',
        body: 'We reserve the right to modify these Terms at any time. Continued use of the App after changes constitutes acceptance of the modified Terms. We may terminate or suspend your access to the App at any time, without notice, for conduct that we believe violates these Terms.',
      },
      {
        heading: '11. Governing Law and Jurisdiction',
        body: 'These Terms shall be governed by and construed in accordance with the laws of the State of Israel, without regard to conflict of law principles. Any dispute arising out of or relating to these Terms or the App shall be subject to the exclusive jurisdiction of the competent courts in Tel Aviv, Israel.',
      },
      {
        heading: '12. Contact Us',
        body: 'If you have questions about these Terms, please contact us at: legal@blisse.online',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'Last Updated: February 2026',
    intro: 'Your privacy is our highest priority. We understand the sensitive nature of Blisse and have built it to protect your information.',
    sections: [
      {
        heading: 'Our Commitment to Privacy',
        body: 'Blisse is designed with privacy as our highest priority. We understand the sensitive nature of this App and have built it to protect your information.',
      },
      {
        heading: 'Data Stored Locally on Your Device',
        body: 'Your preferences, favorites, notes, activity history, and settings are stored locally on your device. Authentication is processed by Firebase, and contact or idea messages are sent only when you explicitly submit them through Formspree email delivery.',
      },
      {
        heading: 'Authentication Services',
        body: 'Sign-in is handled by Apple Sign-In and Firebase Authentication (Google). We do not store passwords or access your credentials directly. These services have their own privacy policies.',
      },
      {
        heading: 'Anonymous Analytics',
        body: 'We use PostHog for anonymous, aggregated analytics to improve the App. This includes:\n- Which features are most popular\n- General usage patterns\n- App performance metrics\n\nWe disable person profiling and send only sanitized event metadata. We do not send free-text notes or contact messages to analytics.',
      },
      {
        heading: 'Information We NEVER Collect',
        body: '- Your biometric data (Face ID and Touch ID are handled by your device)\n- Your photos, contacts, or personal files\n- Your precise location\n- Your free-text notes or support messages in analytics streams\n- Any sale of your personal information',
      },
      {
        heading: 'Third-Party Services',
        body: 'The App uses the following third-party services:\n- Firebase Authentication (Google) - secure sign-in\n- Apple Sign-In - iOS authentication\n- PostHog - anonymous analytics\n- Formspree - support messages you submit\n\nEach service has its own privacy policy governing their data practices.',
      },
      {
        heading: 'Data Retention',
        body: 'Your local data persists until you delete it via Settings or uninstall the App. Anonymous analytics data is retained for up to 24 months to analyze long-term trends.',
      },
      {
        heading: "Children's Privacy",
        body: 'Blisse is strictly for adults 18 years and older. We do not knowingly collect data from anyone under 18. If we learn we have collected information from a minor, we will delete it immediately.',
      },
      {
        heading: 'Your Rights (GDPR/CCPA)',
        body: 'Since your personal data is stored locally on your device, you have complete control:\n- Access: View your data anytime in the App\n- Deletion: Delete all data via Settings -> Reset Data\n- Portability: Your data exists only on your device\n\nFor EU residents (GDPR) and California residents (CCPA), you may contact us to exercise additional rights regarding any data we may process.',
      },
      {
        heading: 'Security',
        body: "We use industry-standard security practices. Local data is protected by your device's security. The optional PIN lock uses secure storage. Biometric authentication is handled entirely by your device's secure enclave.",
      },
      {
        heading: 'Changes to This Policy',
        body: 'We may update this Privacy Policy periodically. We will notify you of significant changes through the App. Continued use after changes constitutes acceptance.',
      },
      {
        heading: 'Governing Law and Jurisdiction',
        body: 'This Privacy Policy shall be governed by and construed in accordance with the laws of the State of Israel, without regard to conflict of law principles. Any dispute arising out of or relating to this Privacy Policy or the App shall be subject to the exclusive jurisdiction of the competent courts in Tel Aviv, Israel.',
      },
      {
        heading: 'Contact Us',
        body: 'Questions about privacy? Contact us at: privacy@blisse.online',
      },
    ],
  },
  about: {
    title: 'Why We Built Blisse',
    subtitle: 'From Tammy & Mark, married 20 years, to couples everywhere',
    intro: [
      'We are Tammy and Mark. After 20 years of marriage, we learned that love stays strong when you keep being intentional, playful, and curious with each other.',
      'Blisse started as our own private experiment to improve communication, flirt more, and make date-night energy easier to create in real life.',
      'When it started helping us reconnect in small daily moments, we decided to share it with other couples too.',
    ],
    sections: [
      {
        heading: 'What Blisse helps couples do',
        body: '- Turn "What should we do tonight?" into simple, playful options\n- Strengthen communication with low-pressure prompts, games, and shared rituals\n- Keep momentum with weekly goals, streaks, and meaningful milestones\n- Personalize ideas based on your mood and feedback loop',
      },
      {
        heading: 'Our story and vibe',
        body: 'No judgment. No performance pressure. Just warm connection, a little mischief, and a lot of heart. We designed Blisse to feel like a supportive, playful companion for real couples with real schedules.',
      },
      {
        heading: 'Community and feedback',
        body: 'We are building a community of fun-loving couples. Your ideas, feedback, and stories directly shape what we build next, and we read every submission.',
      },
      {
        heading: 'Our promise',
        body: 'Blisse is private by default and emotionally safe by design, so you can focus on each other and keep your connection alive over time.',
      },
    ],
  },
  common: {
    scrollHint: 'Scroll to read all',
    readAll: 'Please Read All',
    readAgree: 'I Have Read & Agree',
  },
};

const ES_CONTENT: LegalLocaleContent = {
  terms: {
    title: 'Términos de servicio',
    lastUpdated: 'Última actualización: febrero 2026',
    intro: 'Lee estos términos cuidadosamente antes de usar Blisse.',
    sections: [
      {
        heading: '1. Aceptación de términos',
        body: 'Al descargar, instalar o usar Blisse ("la App"), aceptas estos términos de servicio. Si no estás de acuerdo, no uses la App.',
      },
      {
        heading: '2. Elegibilidad',
        body: 'Debes tener al menos 18 años para usar esta App. Al usar Blisse, declaras que tienes 18 años o más y capacidad legal para aceptar este acuerdo. La App contiene contenido para adultos y solo para adultos con consentimiento.',
      },
      {
        heading: '3. Descripción del servicio',
        body: 'Blisse es una app de bienestar íntimo para ayudar a parejas a explorar y fortalecer su relación mediante sugerencias curadas, seguimiento de actividades y contenido educativo.',
      },
      {
        heading: '4. Conducta del usuario y consentimiento',
        body: 'Aceptas usar la App de forma responsable y ética. Todas las actividades requieren consentimiento entusiasta y continuo de todas las personas involucradas. Eres responsable de asegurar ese consentimiento.',
      },
      {
        heading: '5. Aviso de salud y seguridad',
        body: 'El contenido es solo informativo y de entretenimiento. NO es consejo médico, terapéutico ni profesional. Consulta profesionales de salud cuando sea necesario.',
      },
      {
        heading: '6. Propiedad intelectual',
        body: 'Todo el contenido, funciones y software de la App son propiedad exclusiva de Blisse y están protegidos por leyes de propiedad intelectual.',
      },
      {
        heading: '7. Privacidad',
        body: 'Tu privacidad es importante. Revisa nuestra política de privacidad para conocer como tratamos tu información.',
      },
      {
        heading: '8. Limitacion de responsabilidad',
        body: 'LA APP SE PROPORCIONA "TAL CUAL" SIN GARANTÍAS. EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY, BLISSE NO SERÁ RESPONSABLE POR DAÑOS INDIRECTOS, INCIDENTALES, ESPECIALES, CONSECUENTES O PUNITIVOS.',
      },
      {
        heading: '9. Indemnización',
        body: 'Aceptas mantener indemne a Blisse y su equipo frente a reclamos, daños o gastos derivados del uso de la App o incumplimiento de estos términos.',
      },
      {
        heading: '10. Modificaciones y terminación',
        body: 'Podemos modificar estos términos en cualquier momento. El uso continuo de la App implica aceptación de los cambios.',
      },
      {
        heading: '11. Ley aplicable y jurisdicción',
        body: 'Estos términos se rigen por las leyes del Estado de Israel. Cualquier disputa se somete a la jurisdicción exclusiva de los tribunales competentes de Tel Aviv, Israel.',
      },
      {
        heading: '12. Contacto',
        body: 'Si tienes preguntas sobre estos términos, escríbenos a: legal@blisse.online',
      },
    ],
  },
  privacy: {
    title: 'Política de privacidad',
    lastUpdated: 'Última actualización: febrero 2026',
    intro: 'Tu privacidad es nuestra prioridad. Diseñamos Blisse para proteger tu información.',
    sections: [
      {
        heading: 'Nuestro compromiso con la privacidad',
        body: 'Blisse fue diseñada con la privacidad como prioridad máxima.',
      },
      {
        heading: 'Datos almacenados localmente en tu dispositivo',
        body: 'Tus preferencias, favoritos, notas, historial y configuraciones se almacenan localmente. La autenticación se procesa por Firebase y los mensajes de contacto o ideas se envían solo cuando tú los envías.',
      },
      {
        heading: 'Servicios de autenticación',
        body: 'El inicio de sesión se gestiona con Apple Sign-In y Firebase Authentication (Google). No almacenamos contraseñas ni credenciales.',
      },
      {
        heading: 'Analítica anónima',
        body: 'Usamos PostHog para analítica anónima y agregada:\n- funciones más usadas\n- patrones generales de uso\n- métricas de rendimiento\n\nDesactivamos perfiles de personas y enviamos solo metadatos saneados.',
      },
      {
        heading: 'Información que NUNCA recopilamos',
        body: '- datos biométricos\n- fotos, contactos o archivos personales\n- ubicación precisa\n- notas o mensajes de texto libre en analítica\n- venta de información personal',
      },
      {
        heading: 'Servicios de terceros',
        body: 'La App usa:\n- Firebase Authentication (Google)\n- Apple Sign-In\n- PostHog\n- Formspree\n\nCada servicio tiene su propia política de privacidad.',
      },
      {
        heading: 'Retención de datos',
        body: 'Tus datos locales permanecen hasta que los borres en Ajustes o desinstales la App. Los datos anónimos de analítica pueden guardarse hasta 24 meses.',
      },
      {
        heading: 'Privacidad de menores',
        body: 'Blisse es solo para adultos de 18 años o más. No recopilamos datos intencionalmente de menores.',
      },
      {
        heading: 'Tus derechos (GDPR/CCPA)',
        body: 'Tienes control total sobre tus datos locales:\n- acceso: ver datos en la App\n- eliminación: Ajustes -> Reiniciar datos\n- portabilidad: datos solo en tu dispositivo',
      },
      {
        heading: 'Seguridad',
        body: 'Aplicamos prácticas estándar de seguridad. El PIN opcional usa almacenamiento seguro y la biometría la gestiona tu dispositivo.',
      },
      {
        heading: 'Cambios en esta política',
        body: 'Podemos actualizar esta política periódicamente. El uso continuo implica aceptación de cambios.',
      },
      {
        heading: 'Ley aplicable y jurisdicción',
        body: 'Esta política se rige por las leyes del Estado de Israel. Cualquier disputa se somete a la jurisdicción exclusiva de los tribunales competentes de Tel Aviv, Israel.',
      },
      {
        heading: 'Contacto',
        body: 'Preguntas sobre privacidad: privacy@blisse.online',
      },
    ],
  },
  about: {
    title: 'Por qué creamos Blisse',
    subtitle: 'De Tammy y Mark, casados hace 20 años, para parejas reales',
    intro: [
      'Somos Tammy y Mark. Después de 20 años de matrimonio, aprendimos que la conexión crece cuando hay intención, juego y curiosidad.',
      'Blisse empezó como nuestro propio experimento para mejorar la comunicación, coquetear más y recuperar esa energía especial en lo cotidiano.',
      'Cuando vimos que nos ayudaba de verdad, decidimos compartirlo con otras parejas.',
    ],
    sections: [
      {
        heading: 'Lo que Blisse ayuda a hacer',
        body: '- Convertir "¿qué hacemos hoy?" en opciones simples y divertidas\n- Fortalecer la comunicación con juegos, retos y rituales sin presión\n- Mantener el impulso con metas semanales, rachas y logros compartidos\n- Personalizar sugerencias según el estado de ánimo y el feedback de ustedes',
      },
      {
        heading: 'Nuestra historia y estilo',
        body: 'Sin juicios ni presión de rendimiento. Solo conexión real, un poco de picardía y mucho corazón. Diseñamos Blisse para parejas reales con vidas reales.',
      },
      {
        heading: 'Comunidad y feedback',
        body: 'Estamos construyendo una comunidad de parejas que aman divertirse juntas. Sus ideas, comentarios y sugerencias influyen directamente en lo que construimos después.',
      },
      {
        heading: 'Nuestra promesa',
        body: 'Blisse es privada por defecto y emocionalmente segura desde el diseño, para que puedan enfocarse en ustedes y mantener viva la conexión.',
      },
    ],
  },
  common: {
    scrollHint: 'Desliza para leer todo',
    readAll: 'Lee todo primero',
    readAgree: 'He leido y acepto',
  },
};

const PT_CONTENT: LegalLocaleContent = {
  terms: {
    title: 'Termos de serviço',
    lastUpdated: 'Última atualização: fevereiro 2026',
    intro: 'Leia estes termos com atenção antes de usar o Blisse.',
    sections: [
      {
        heading: '1. Aceitação dos termos',
        body: 'Ao baixar, instalar ou usar o Blisse ("o App"), você concorda com estes termos. Se não concordar, não use o App.',
      },
      {
        heading: '2. Elegibilidade',
        body: 'Você deve ter pelo menos 18 anos para usar este App. Ao usar o Blisse, você declara que tem capacidade legal para aceitar este acordo. O App contem conteúdo adulto para adultos com consentimento.',
      },
      {
        heading: '3. Descrição do serviço',
        body: 'Blisse é um app de bem-estar íntimo para ajudar casais a explorar e fortalecer a relação com sugestões curadas, acompanhamento de atividades e conteúdo educativo.',
      },
      {
        heading: '4. Conduta e consentimento',
        body: 'Você concorda em usar o App de forma responsável e ética. Todas as atividades exigem consentimento entusiastico e continuo de todas as partes.',
      },
      {
        heading: '5. Aviso de saúde e segurança',
        body: 'O conteúdo do App é apenas informativo e de entretenimento. Não é orientação médica ou terapêutica.',
      },
      {
        heading: '6. Propriedade intelectual',
        body: 'Todo conteúdo, funcionalidades e software do App são propriedade exclusiva do Blisse e protegidos por leis de propriedade intelectual.',
      },
      {
        heading: '7. Privacidade',
        body: 'Sua privacidade é importante. Consulte nossa Política de Privacidade para entender como tratamos seus dados.',
      },
      {
        heading: '8. Limitacao de responsabilidade',
        body: 'O APP E FORNECIDO "COMO ESTÁ", SEM GARANTIAS. NA MAIOR EXTENSÃO PERMITIDA POR LEI, A BLISSE NÃO SERÁ RESPONSÁVEL POR DANOS INDIRETOS, INCIDENTAIS, ESPECIAIS, CONSEQUENCIAIS OU PUNITIVOS.',
      },
      {
        heading: '9. Indenização',
        body: 'Você concorda em indenizar e isentar a Blisse e sua equipe de reclamações, danos ou despesas decorrentes do uso do App ou violacao destes termos.',
      },
      {
        heading: '10. Alterações e encerramento',
        body: 'Podemos alterar estes termos a qualquer momento. O uso continuo do App implica aceitação das alterações.',
      },
      {
        heading: '11. Lei aplicável e jurisdição',
        body: 'Estes termos sao regidos pelas leis do Estado de Israel. Qualquer disputa sera submetida a jurisdição exclusiva dos tribunais competentes de Tel Aviv, Israel.',
      },
      {
        heading: '12. Contato',
        body: 'Se tiver dúvidas sobre estes termos, escreva para: legal@blisse.online',
      },
    ],
  },
  privacy: {
    title: 'Política de privacidade',
    lastUpdated: 'Ultima atualizacao: fevereiro 2026',
    intro: 'Sua privacidade é nossa maior prioridade. O Blisse foi criado para proteger suas informações.',
    sections: [
      {
        heading: 'Nosso compromisso com a privacidade',
        body: 'Blisse foi projetado com privacidade como prioridade máxima.',
      },
      {
        heading: 'Dados armazenados localmente no seu dispositivo',
        body: 'Preferências, favoritos, notas, histórico e configurações ficam no seu dispositivo. Autenticação é processada pelo Firebase, e mensagens de contato ou ideias sao enviadas somente quando você envia.',
      },
      {
        heading: 'Servicos de autenticacao',
        body: 'Login e feito por Apple Sign-In e Firebase Authentication (Google). Não armazenamos senhas nem credenciais.',
      },
      {
        heading: 'Analítica anónima',
        body: 'Usamos PostHog para analítica anônima e agregada:\n- recursos mais usados\n- padroes gerais de uso\n- métricas de desempenho\n\nDesativamos perfis de pessoa e enviamos apenas metadados saneados.',
      },
      {
        heading: 'Informações que NUNCA coletamos',
        body: '- dados biométricos\n- fotos, contatos ou arquivos pessoais\n- localizacao precisa\n- notas ou mensagens de texto livre na analitica\n- venda de informações pessoais',
      },
      {
        heading: 'Servicos de terceiros',
        body: 'O App usa:\n- Firebase Authentication (Google)\n- Apple Sign-In\n- PostHog\n- Formspree\n\nCada serviço possui sua própria política de privacidade.',
      },
      {
        heading: 'Retenção de dados',
        body: 'Seus dados locais permanecem ate que você os apague em Configurações ou desinstale o App. Dados anônimos podem ser mantidos por ate 24 meses.',
      },
      {
        heading: 'Privacidade infantil',
        body: 'Blisse e estritamente para adultos com 18 anos ou mais. Nao coletamos intencionalmente dados de menores.',
      },
      {
        heading: 'Seus direitos (GDPR/CCPA)',
        body: 'Você controla totalmente seus dados locais:\n- acesso: visualizar dados no App\n- exclusão: Configurações -> Resetar dados\n- portabilidade: dados somente no seu dispositivo',
      },
      {
        heading: 'Seguranca',
        body: 'Aplicamos práticas padrão de segurança. O PIN opcional usa armazenamento seguro, e biometria é gerenciada pelo dispositivo.',
      },
      {
        heading: 'Alterações nesta política',
        body: 'Podemos atualizar esta politica periodicamente. O uso continuo do App implica aceitacao das alteracoes.',
      },
      {
        heading: 'Lei aplicavel e jurisdicao',
        body: 'Esta politica e regida pelas leis do Estado de Israel. Qualquer disputa sera submetida a jurisdicao exclusiva dos tribunais competentes de Tel Aviv, Israel.',
      },
      {
        heading: 'Contato',
        body: 'Dúvidas sobre privacidade: privacy@blisse.online',
      },
    ],
  },
  about: {
    title: 'Por que criamos o Blisse',
    subtitle: 'De Tammy e Mark, casados há 20 anos, para casais reais',
    intro: [
      'Somos Tammy e Mark. Depois de 20 anos de casamento, aprendemos que a conexão cresce quando existe intenção, leveza e curiosidade.',
      'O Blisse começou como nosso próprio experimento para melhorar a comunicação, flertar mais e trazer de volta aquela energia gostosa do início.',
      'Quando vimos que isso estava ajudando de verdade no dia a dia, decidimos compartilhar com outros casais.',
    ],
    sections: [
      {
        heading: 'Como o Blisse ajuda vocês',
        body: '- Transformar "o que fazemos hoje?" em opções simples e divertidas\n- Fortalecer a comunicação com jogos, desafios e rituais sem pressão\n- Manter o ritmo com metas semanais, sequências e marcos compartilhados\n- Personalizar ideias com base no humor e no feedback de vocês',
      },
      {
        heading: 'Nossa história e nossa vibe',
        body: 'Sem julgamentos e sem pressão de desempenho. Só conexão verdadeira, um toque de brincadeira e muito carinho. Criamos o Blisse para casais reais com rotinas reais.',
      },
      {
        heading: 'Comunidade e feedback',
        body: 'Estamos construindo uma comunidade de casais que gostam de se divertir juntos. Suas ideias, feedbacks e sugestões influenciam diretamente o que vamos criar depois.',
      },
      {
        heading: 'Nossa promessa',
        body: 'O Blisse é privado por padrão e emocionalmente seguro por design, para que vocês foquem um no outro e mantenham a conexão viva com o tempo.',
      },
    ],
  },
  common: {
    scrollHint: 'Role para ler tudo',
    readAll: 'Leia tudo primeiro',
    readAgree: 'Li e concordo',
  },
};

const LEGAL_CONTENT: Record<AppLanguage, LegalLocaleContent> = {
  en: EN_CONTENT,
  es: ES_CONTENT,
  pt: PT_CONTENT,
};

export const getLegalContent = (language: AppLanguage): LegalLocaleContent => {
  return LEGAL_CONTENT[language] || LEGAL_CONTENT.en;
};


