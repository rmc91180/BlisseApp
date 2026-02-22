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
    subtitle: 'Made by a real couple, for real couples',
    intro: [
      'Blisse started from a simple realization: once real life gets busy, connection can drift into autopilot.',
      'We wanted a playful way to bring back intention, excitement, and emotional closeness without pressure.',
    ],
    sections: [
      {
        heading: 'What Blisse helps you do',
        body: '- Turn "What should we do tonight?" into easy, fun options\n- Build trust and chemistry with playful prompts and dares\n- Keep momentum with weekly goals and shared milestones\n- Personalize ideas based on your mood and feedback loop',
      },
      {
        heading: 'Our vibe',
        body: 'No judgment. No performance pressure. Just meaningful connection with a little mischief and a lot of heart.',
      },
      {
        heading: 'Our promise',
        body: 'We design Blisse to feel emotionally warm, playful, and private by default, so you can focus on each other.',
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
    title: 'Terminos de servicio',
    lastUpdated: 'Ultima actualizacion: febrero 2026',
    intro: 'Lee estos terminos cuidadosamente antes de usar Blisse.',
    sections: [
      {
        heading: '1. Aceptacion de terminos',
        body: 'Al descargar, instalar o usar Blisse ("la App"), aceptas estos terminos de servicio. Si no estas de acuerdo, no uses la App.',
      },
      {
        heading: '2. Elegibilidad',
        body: 'Debes tener al menos 18 anos para usar esta App. Al usar Blisse, declaras que tienes 18 anos o mas y capacidad legal para aceptar este acuerdo. La App contiene contenido para adultos y solo para adultos con consentimiento.',
      },
      {
        heading: '3. Descripcion del servicio',
        body: 'Blisse es una app de bienestar intimo para ayudar a parejas a explorar y fortalecer su relacion mediante sugerencias curadas, seguimiento de actividades y contenido educativo.',
      },
      {
        heading: '4. Conducta del usuario y consentimiento',
        body: 'Aceptas usar la App de forma responsable y etica. Todas las actividades requieren consentimiento entusiasta y continuo de todas las personas involucradas. Eres responsable de asegurar ese consentimiento.',
      },
      {
        heading: '5. Aviso de salud y seguridad',
        body: 'El contenido es solo informativo y de entretenimiento. NO es consejo medico, terapeutico ni profesional. Consulta profesionales de salud cuando sea necesario.',
      },
      {
        heading: '6. Propiedad intelectual',
        body: 'Todo el contenido, funciones y software de la App son propiedad exclusiva de Blisse y estan protegidos por leyes de propiedad intelectual.',
      },
      {
        heading: '7. Privacidad',
        body: 'Tu privacidad es importante. Revisa nuestra politica de privacidad para conocer como tratamos tu informacion.',
      },
      {
        heading: '8. Limitacion de responsabilidad',
        body: 'LA APP SE PROPORCIONA "TAL CUAL" SIN GARANTIAS. EN LA MAXIMA MEDIDA PERMITIDA POR LA LEY, BLISSE NO SERA RESPONSABLE POR DANOS INDIRECTOS, INCIDENTALES, ESPECIALES, CONSECUENTES O PUNITIVOS.',
      },
      {
        heading: '9. Indemnizacion',
        body: 'Aceptas mantener indemne a Blisse y su equipo frente a reclamos, danos o gastos derivados del uso de la App o incumplimiento de estos terminos.',
      },
      {
        heading: '10. Modificaciones y terminacion',
        body: 'Podemos modificar estos terminos en cualquier momento. El uso continuo de la App implica aceptacion de los cambios.',
      },
      {
        heading: '11. Ley aplicable y jurisdiccion',
        body: 'Estos terminos se rigen por las leyes del Estado de Israel. Cualquier disputa se somete a la jurisdiccion exclusiva de los tribunales competentes de Tel Aviv, Israel.',
      },
      {
        heading: '12. Contacto',
        body: 'Si tienes preguntas sobre estos terminos, escribenos a: legal@blisse.online',
      },
    ],
  },
  privacy: {
    title: 'Politica de privacidad',
    lastUpdated: 'Ultima actualizacion: febrero 2026',
    intro: 'Tu privacidad es nuestra prioridad. Disenamos Blisse para proteger tu informacion.',
    sections: [
      {
        heading: 'Nuestro compromiso con la privacidad',
        body: 'Blisse fue disenada con la privacidad como prioridad maxima.',
      },
      {
        heading: 'Datos almacenados localmente en tu dispositivo',
        body: 'Tus preferencias, favoritos, notas, historial y configuraciones se almacenan localmente. La autenticacion se procesa por Firebase y los mensajes de contacto o ideas se envian solo cuando tu los envias.',
      },
      {
        heading: 'Servicios de autenticacion',
        body: 'El inicio de sesion se gestiona con Apple Sign-In y Firebase Authentication (Google). No almacenamos contrasenas ni credenciales.',
      },
      {
        heading: 'Analitica anonima',
        body: 'Usamos PostHog para analitica anonima y agregada:\n- funciones mas usadas\n- patrones generales de uso\n- metricas de rendimiento\n\nDesactivamos perfiles de personas y enviamos solo metadatos saneados.',
      },
      {
        heading: 'Informacion que NUNCA recopilamos',
        body: '- datos biometricos\n- fotos, contactos o archivos personales\n- ubicacion precisa\n- notas o mensajes de texto libre en analitica\n- venta de informacion personal',
      },
      {
        heading: 'Servicios de terceros',
        body: 'La App usa:\n- Firebase Authentication (Google)\n- Apple Sign-In\n- PostHog\n- Formspree\n\nCada servicio tiene su propia politica de privacidad.',
      },
      {
        heading: 'Retencion de datos',
        body: 'Tus datos locales permanecen hasta que los borres en Ajustes o desinstales la App. Los datos anonimos de analitica pueden guardarse hasta 24 meses.',
      },
      {
        heading: 'Privacidad de menores',
        body: 'Blisse es solo para adultos de 18 anos o mas. No recopilamos datos intencionalmente de menores.',
      },
      {
        heading: 'Tus derechos (GDPR/CCPA)',
        body: 'Tienes control total sobre tus datos locales:\n- acceso: ver datos en la App\n- eliminacion: Ajustes -> Reiniciar datos\n- portabilidad: datos solo en tu dispositivo',
      },
      {
        heading: 'Seguridad',
        body: 'Aplicamos practicas estandar de seguridad. El PIN opcional usa almacenamiento seguro y la biometria la gestiona tu dispositivo.',
      },
      {
        heading: 'Cambios en esta politica',
        body: 'Podemos actualizar esta politica periodicamente. El uso continuo implica aceptacion de cambios.',
      },
      {
        heading: 'Ley aplicable y jurisdiccion',
        body: 'Esta politica se rige por las leyes del Estado de Israel. Cualquier disputa se somete a la jurisdiccion exclusiva de los tribunales competentes de Tel Aviv, Israel.',
      },
      {
        heading: 'Contacto',
        body: 'Preguntas sobre privacidad: privacy@blisse.online',
      },
    ],
  },
  about: {
    title: 'Por que creamos Blisse',
    subtitle: 'Hecha por una pareja real, para parejas reales',
    intro: [
      'Blisse nacio de una idea simple: cuando la vida se acelera, la conexion puede entrar en piloto automatico.',
      'Queriamos una forma divertida de recuperar intencion, emocion y cercania sin presion.',
    ],
    sections: [
      {
        heading: 'Lo que Blisse te ayuda a hacer',
        body: '- Convertir "que hacemos hoy?" en opciones faciles\n- Fortalecer confianza y quimica con retos y juegos\n- Mantener constancia con metas semanales\n- Personalizar ideas segun su mood y feedback',
      },
      {
        heading: 'Nuestro estilo',
        body: 'Sin juicios ni presion. Conexion real con un poco de picardia y mucho corazon.',
      },
      {
        heading: 'Nuestra promesa',
        body: 'Disenamos Blisse para que se sienta calida, divertida y privada por defecto.',
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
    title: 'Termos de servico',
    lastUpdated: 'Ultima atualizacao: fevereiro 2026',
    intro: 'Leia estes termos com atencao antes de usar o Blisse.',
    sections: [
      {
        heading: '1. Aceitacao dos termos',
        body: 'Ao baixar, instalar ou usar o Blisse ("o App"), voce concorda com estes termos. Se nao concordar, nao use o App.',
      },
      {
        heading: '2. Elegibilidade',
        body: 'Voce deve ter pelo menos 18 anos para usar este App. Ao usar o Blisse, voce declara que tem capacidade legal para aceitar este acordo. O App contem conteudo adulto para adultos com consentimento.',
      },
      {
        heading: '3. Descricao do servico',
        body: 'Blisse e um app de bem-estar intimo para ajudar casais a explorar e fortalecer a relacao com sugestoes curadas, acompanhamento de atividades e conteudo educativo.',
      },
      {
        heading: '4. Conduta e consentimento',
        body: 'Voce concorda em usar o App de forma responsavel e etica. Todas as atividades exigem consentimento entusiastico e continuo de todas as partes.',
      },
      {
        heading: '5. Aviso de saude e seguranca',
        body: 'O conteudo do App e apenas informativo e de entretenimento. Nao e orientacao medica ou terapeutica.',
      },
      {
        heading: '6. Propriedade intelectual',
        body: 'Todo conteudo, funcionalidades e software do App sao propriedade exclusiva do Blisse e protegidos por leis de propriedade intelectual.',
      },
      {
        heading: '7. Privacidade',
        body: 'Sua privacidade e importante. Consulte nossa Politica de Privacidade para entender como tratamos seus dados.',
      },
      {
        heading: '8. Limitacao de responsabilidade',
        body: 'O APP E FORNECIDO "COMO ESTA", SEM GARANTIAS. NA MAIOR EXTENSAO PERMITIDA POR LEI, A BLISSE NAO SERA RESPONSAVEL POR DANOS INDIRETOS, INCIDENTAIS, ESPECIAIS, CONSEQUENCIAIS OU PUNITIVOS.',
      },
      {
        heading: '9. Indenizacao',
        body: 'Voce concorda em indenizar e isentar a Blisse e sua equipe de reclamacoes, danos ou despesas decorrentes do uso do App ou violacao destes termos.',
      },
      {
        heading: '10. Alteracoes e encerramento',
        body: 'Podemos alterar estes termos a qualquer momento. O uso continuo do App implica aceitacao das alteracoes.',
      },
      {
        heading: '11. Lei aplicavel e jurisdicao',
        body: 'Estes termos sao regidos pelas leis do Estado de Israel. Qualquer disputa sera submetida a jurisdicao exclusiva dos tribunais competentes de Tel Aviv, Israel.',
      },
      {
        heading: '12. Contato',
        body: 'Se tiver duvidas sobre estes termos, escreva para: legal@blisse.online',
      },
    ],
  },
  privacy: {
    title: 'Politica de privacidade',
    lastUpdated: 'Ultima atualizacao: fevereiro 2026',
    intro: 'Sua privacidade e nossa maior prioridade. O Blisse foi criado para proteger suas informacoes.',
    sections: [
      {
        heading: 'Nosso compromisso com a privacidade',
        body: 'Blisse foi projetado com privacidade como prioridade maxima.',
      },
      {
        heading: 'Dados armazenados localmente no seu dispositivo',
        body: 'Preferencias, favoritos, notas, historico e configuracoes ficam no seu dispositivo. Autenticacao e processada pelo Firebase, e mensagens de contato ou ideias sao enviadas somente quando voce envia.',
      },
      {
        heading: 'Servicos de autenticacao',
        body: 'Login e feito por Apple Sign-In e Firebase Authentication (Google). Nao armazenamos senhas nem credenciais.',
      },
      {
        heading: 'Analitica anonima',
        body: 'Usamos PostHog para analitica anonima e agregada:\n- recursos mais usados\n- padroes gerais de uso\n- metricas de desempenho\n\nDesativamos perfis de pessoa e enviamos apenas metadados saneados.',
      },
      {
        heading: 'Informacoes que NUNCA coletamos',
        body: '- dados biometricos\n- fotos, contatos ou arquivos pessoais\n- localizacao precisa\n- notas ou mensagens de texto livre na analitica\n- venda de informacoes pessoais',
      },
      {
        heading: 'Servicos de terceiros',
        body: 'O App usa:\n- Firebase Authentication (Google)\n- Apple Sign-In\n- PostHog\n- Formspree\n\nCada servico possui sua propria politica de privacidade.',
      },
      {
        heading: 'Retencao de dados',
        body: 'Seus dados locais permanecem ate que voce os apague em Configuracoes ou desinstale o App. Dados anonimos podem ser mantidos por ate 24 meses.',
      },
      {
        heading: 'Privacidade infantil',
        body: 'Blisse e estritamente para adultos com 18 anos ou mais. Nao coletamos intencionalmente dados de menores.',
      },
      {
        heading: 'Seus direitos (GDPR/CCPA)',
        body: 'Voce controla totalmente seus dados locais:\n- acesso: visualizar dados no App\n- exclusao: Configuracoes -> Resetar dados\n- portabilidade: dados somente no seu dispositivo',
      },
      {
        heading: 'Seguranca',
        body: 'Aplicamos praticas padrao de seguranca. O PIN opcional usa armazenamento seguro, e biometria e gerenciada pelo dispositivo.',
      },
      {
        heading: 'Alteracoes nesta politica',
        body: 'Podemos atualizar esta politica periodicamente. O uso continuo do App implica aceitacao das alteracoes.',
      },
      {
        heading: 'Lei aplicavel e jurisdicao',
        body: 'Esta politica e regida pelas leis do Estado de Israel. Qualquer disputa sera submetida a jurisdicao exclusiva dos tribunais competentes de Tel Aviv, Israel.',
      },
      {
        heading: 'Contato',
        body: 'Duvidas sobre privacidade: privacy@blisse.online',
      },
    ],
  },
  about: {
    title: 'Por que criamos o Blisse',
    subtitle: 'Feito por um casal real, para casais reais',
    intro: [
      'Blisse nasceu de uma percepcao simples: quando a vida fica corrida, a conexao pode entrar no piloto automatico.',
      'Queriamos uma forma divertida de recuperar intencao, entusiasmo e proximidade emocional sem pressao.',
    ],
    sections: [
      {
        heading: 'Como o Blisse ajuda voces',
        body: '- Transformar "o que fazemos hoje?" em opcoes simples\n- Fortalecer confianca e quimica com jogos e desafios\n- Manter constancia com metas semanais\n- Personalizar ideias com base no mood e feedback',
      },
      {
        heading: 'Nosso estilo',
        body: 'Sem julgamento e sem pressao de desempenho. Apenas conexao significativa com um toque de brincadeira.',
      },
      {
        heading: 'Nossa promessa',
        body: 'Criamos o Blisse para ser acolhedor, divertido e privado por padrao, para voces focarem um no outro.',
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


