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
    lastUpdated: 'Last Updated: April 2026',
    intro: 'Please read these terms carefully before using Blisse.',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        body: 'By downloading, installing, accessing, or using Blisse ("the App"), you agree to be bound by these Terms of Service. If you do not agree, do not download, install, access, or use the App.',
      },
      {
        heading: '2. Eligibility and Adult-Only Use',
        body: 'You must be at least 18 years old and legally capable of entering into this agreement. Blisse contains mature, relationship-focused content intended only for consenting adults.',
      },
      {
        heading: '3. License Grant and Scope of Use',
        body: 'Subject to these Terms, Blisse grants you a limited, non-exclusive, non-transferable, revocable license to use the App for your personal, lawful, non-commercial use on devices you own or control. You may not sell, rent, lease, sublicense, redistribute, modify, reverse engineer, or create derivative works from the App except where applicable law clearly permits it. If you downloaded the App through Apple, your use must also comply with the applicable Usage Rules in the Apple Media Services Terms and Conditions.',
      },
      {
        heading: '4. Accounts and Access',
        body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. We may suspend, restrict, or terminate access if we reasonably believe you violated these Terms, created risk for other users, or used the App unlawfully.',
      },
      {
        heading: '5. Subscriptions, Trials, Billing, and Cancellation',
        body: 'Some Blisse features require a paid subscription or one-time purchase. Pricing, billing period, and trial terms are shown in the App before purchase. Auto-renewable subscriptions renew automatically unless cancelled at least 24 hours before the end of the current billing period. Payment is charged through your Apple ID account or Google Play account, as applicable, after purchase confirmation. You can manage or cancel subscriptions in your App Store or Google Play account settings, as applicable. Free trial periods, if offered, automatically convert to the paid subscription unless cancelled before the trial ends. If you cancel a monthly subscription, access continues until the end of the then-current monthly billing period. If you cancel an annual subscription, access continues until the end of the then-current annual billing period. If you voluntarily close or terminate a lifetime-access account, access continues until the end of the then-current calendar year unless deletion must occur sooner because you request erasure under applicable law. Except where required by law or the rules of the platform through which you made your purchase, purchases are non-refundable and we do not provide credits for unused time.',
      },
      {
        heading: '6. User Conduct and Consent',
        body: 'You agree to use the App responsibly, lawfully, and ethically. All activities suggested by the App require clear, enthusiastic, ongoing consent from all participants. You are solely responsible for how you use the App and for ensuring that your conduct is lawful, safe, and consensual. Blisse does not endorse coercive, exploitative, or non-consensual conduct.',
      },
      {
        heading: '7. Health and Safety Disclaimer',
        body: 'The App and its content are provided for informational and entertainment purposes only. They do not constitute medical, mental health, therapy, relationship, or other professional advice. Always use your own judgment, respect your physical limits, and consult a qualified professional where appropriate.',
      },
      {
        heading: '8. Third-Party Services and Platform Terms',
        body: 'The App may integrate or interact with third-party services such as Apple Sign-In, Google Sign-In, Firebase, PostHog, Formspree, RevenueCat, the App Store, or Google Play. Those services are governed by their own terms and privacy policies. Blisse is not responsible for third-party services, payment processors, app stores, networks, or devices.',
      },
      {
        heading: '9. Intellectual Property',
        body: 'The App, including its software, design, text, graphics, audio, arrangement, features, and underlying content, is owned by or licensed to Blisse and is protected by intellectual property laws. Except for the limited license granted in these Terms, no rights are transferred to you.',
      },
      {
        heading: '10. Maintenance, Support, Service Changes, and Discontinuation',
        body: 'Blisse may update, change, suspend, or discontinue features at any time. We may also decide to discontinue the App or subscription services entirely. If we do so, we may stop future renewals, stop offering new purchases, and terminate service availability upon commercially reasonable advance notice where practicable, including through the App, by email, or via App Store Connect or Google Play listing metadata. If the App or service is discontinued, access ends when the service shuts down, including for lifetime access, and no refunds, credits, or prorated reimbursements will be issued except where required by applicable law or the rules of the platform through which you made your purchase. To the extent the App is distributed through Apple, you acknowledge that Blisse, and not Apple, is solely responsible for providing any maintenance and support for the App, if any. Apple has no obligation to furnish maintenance or support services for the App. If the App is distributed through Google Play, purchases, billing, cancellation, refunds, and subscription management are also subject to the applicable Google Play terms and policies.',
      },
      {
        heading: '11. Warranty Disclaimer and Platform-Specific Warranty Notice',
        body: 'THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT, AND NON-INFRINGEMENT, TO THE MAXIMUM EXTENT PERMITTED BY LAW. If the App fails to conform to any applicable warranty and you obtained it through Apple, you may notify Apple, and Apple may refund the purchase price, if any, paid for the App. To the maximum extent permitted by law, Apple has no other warranty obligation with respect to the App, and any other claims, losses, liabilities, damages, costs, or expenses attributable to any failure to conform to a warranty are Blisse’s responsibility, if any, under applicable law. If you obtained the App or a subscription through Google Play, any refunds, billing reversals, or purchase disputes are handled subject to the applicable Google Play terms, Google Play refund policies, and applicable law.',
      },
      {
        heading: '12. Product Claims and Platform Responsibility Allocation',
        body: 'Blisse, and not Apple, is responsible for addressing any claims by you or any third party relating to the App or your possession or use of the App, including product liability claims, claims that the App fails to conform to legal or regulatory requirements, and claims arising under consumer protection, privacy, or similar laws. If you obtained the App through Apple, Apple has no responsibility for such claims. Purchases made through Google Play remain subject to the applicable Google Play distribution, billing, and consumer terms.',
      },
      {
        heading: '13. Intellectual Property Claims',
        body: 'Blisse, and not Apple, is responsible for the investigation, defense, settlement, and discharge of any third-party claim that the App or your possession and use of the App infringes that third party’s intellectual property rights. If you obtained the App through Apple, Apple has no responsibility for such claims.',
      },
      {
        heading: '14. Legal Compliance and Export',
        body: 'You represent and warrant that you are not located in a country subject to a U.S. government embargo or designated by the U.S. government as a "terrorist supporting" country, and that you are not listed on any U.S. government list of prohibited or restricted parties. You will not use, export, or re-export the App except as authorized by applicable law.',
      },
      {
        heading: '15. Limitation of Liability',
        body: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, BLISSE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF DATA, PROFITS, GOODWILL, BUSINESS INTERRUPTION, OR DEVICE FAILURE, ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE APP, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. TO THE MAXIMUM EXTENT PERMITTED BY LAW, BLISSE’S TOTAL LIABILITY FOR ALL CLAIMS RELATING TO THE APP SHALL NOT EXCEED THE GREATER OF THE AMOUNT YOU PAID FOR THE APP OR RELATED SUBSCRIPTION IN THE PRECEDING 12 MONTHS OR USD $50.',
      },
      {
        heading: '16. Indemnification',
        body: 'You agree to indemnify, defend, and hold harmless Blisse, its affiliates, licensors, and service providers, and their respective officers, directors, employees, and agents, from and against claims, liabilities, damages, losses, and expenses arising out of or related to your misuse of the App, your violation of these Terms, or your violation of any law or third-party rights.',
      },
      {
        heading: '17. Governing Law and Jurisdiction',
        body: 'These Terms are governed by the laws of the State of Israel, without regard to conflict of laws rules. Any dispute arising out of or relating to these Terms or the App shall be subject to the exclusive jurisdiction of the competent courts in Tel Aviv, Israel, subject to any mandatory consumer protection rights that may apply under non-waivable law.',
      },
      {
        heading: '18. Platform-Specific Beneficiary and Contact',
        body: 'If you obtained the App through Apple, Apple and Apple’s subsidiaries are third-party beneficiaries of these Terms and may enforce them against you. If you obtained the App through Google Play, your purchase and subscription administration are also subject to the applicable Google Play terms and policies. If you have questions about these Terms, contact us at blisse.online@gmail.com. If you require our legal entity name or mailing address for a regulatory or contractual purpose, contact us and we will provide the applicable details.',
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
        body: 'We use PostHog for anonymous, aggregated analytics to improve the App. This includes:\n- Which areas people use\n- General usage patterns\n- App health metrics\n\nWe disable person profiling and send only sanitized event metadata. We do not send free-text notes or contact messages to analytics.',
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
        body: 'Questions about privacy? Contact us at: blisse.online@gmail.com',
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
        body: 'No judgment. Nothing to prove. Just warm connection, a little mischief, and a lot of heart. We designed Blisse to feel like a supportive, playful companion for real couples with real schedules.',
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
    lastUpdated: 'Última actualización: abril 2026',
    intro: 'Lee estos términos cuidadosamente antes de usar Blisse.',
    sections: [
      {
        heading: '1. Aceptación de los términos',
        body: 'Al descargar, instalar, acceder o usar Blisse ("la App"), aceptas quedar obligado por estos Términos de servicio. Si no estás de acuerdo, no descargues, instales, accedas ni uses la App.',
      },
      {
        heading: '2. Elegibilidad y uso solo para adultos',
        body: 'Debes tener al menos 18 años y capacidad legal suficiente para aceptar este acuerdo. Blisse contiene contenido maduro y orientado a relaciones, destinado solo a personas adultas que actúan con consentimiento.',
      },
      {
        heading: '3. Licencia y alcance de uso',
        body: 'Sujeto a estos Términos, Blisse te concede una licencia limitada, no exclusiva, no transferible y revocable para usar la App únicamente con fines personales, lícitos y no comerciales en dispositivos que poseas o controles. No puedes vender, alquilar, sublicenciar, redistribuir, modificar, descompilar, hacer ingeniería inversa ni crear obras derivadas de la App salvo cuando la ley aplicable lo permita de forma imperativa. Si descargaste la App a través de Apple, tu uso también debe cumplir las Reglas de uso aplicables de los Términos y Condiciones de Apple Media Services.',
      },
      {
        heading: '4. Cuentas y acceso',
        body: 'Eres responsable de mantener la confidencialidad de tus credenciales y de toda actividad realizada desde tu cuenta. Podemos suspender, restringir o cancelar el acceso si creemos razonablemente que incumpliste estos Términos, generaste un riesgo para otras personas o utilizaste la App de forma ilícita.',
      },
      {
        heading: '5. Suscripciones, pruebas, facturación y cancelación',
        body: 'Algunas funciones de Blisse requieren una suscripción de pago o una compra única. El precio, el periodo de cobro y las condiciones de prueba se muestran en la App antes de la compra. Las suscripciones auto-renovables se renuevan automáticamente salvo que se cancelen al menos 24 horas antes del final del periodo vigente. El cobro se realiza a través de tu cuenta de Apple ID una vez confirmada la compra. Puedes gestionar o cancelar las suscripciones en los ajustes de tu cuenta de App Store. Las pruebas gratuitas, si se ofrecen, se convertirán automáticamente en suscripción de pago si no se cancelan antes de finalizar el periodo de prueba. Si cancelas una suscripción mensual, el acceso continúa hasta el final del periodo mensual vigente. Si cancelas una suscripción anual, el acceso continúa hasta el final del periodo anual vigente. Si cierras o cancelas voluntariamente una cuenta con acceso de por vida, el acceso continuará hasta el final del año calendario en curso, salvo que la eliminación deba efectuarse antes porque solicites la supresión conforme a la ley aplicable. Salvo cuando la ley o las reglas de la App Store exijan otra cosa, las compras no son reembolsables y no otorgamos créditos por tiempo no utilizado.',
      },
      {
        heading: '6. Conducta del usuario y consentimiento',
        body: 'Aceptas usar la App de forma responsable, lícita y ética. Todas las actividades sugeridas por la App requieren consentimiento claro, entusiasta y continuo de todas las personas participantes. Eres la única persona responsable de cómo usas la App y de asegurarte de que tu conducta sea legal, segura y consensuada. Blisse no promueve conductas coercitivas, explotadoras ni no consentidas.',
      },
      {
        heading: '7. Aviso de salud y seguridad',
        body: 'La App y su contenido se ofrecen solo con fines informativos y de entretenimiento. No constituyen consejo médico, psicológico, terapéutico, relacional ni profesional de ningún otro tipo. Usa siempre tu propio criterio, respeta tus límites físicos y consulta con profesionales cualificados cuando sea apropiado.',
      },
      {
        heading: '8. Servicios de terceros y condiciones de plataforma',
        body: 'La App puede integrarse o interactuar con servicios de terceros como Apple Sign-In, Firebase, PostHog, Formspree, RevenueCat o la App Store. Esos servicios se rigen por sus propios términos y políticas de privacidad. Blisse no es responsable por servicios de terceros, procesadores de pago, tiendas de aplicaciones, redes o dispositivos.',
      },
      {
        heading: '9. Propiedad intelectual',
        body: 'La App, incluyendo su software, diseño, textos, gráficos, audio, estructura, funciones y contenido subyacente, es propiedad de Blisse o de sus licenciantes y está protegida por leyes de propiedad intelectual. Salvo por la licencia limitada concedida en estos Términos, no se te transfiere ningún otro derecho.',
      },
      {
        heading: '10. Mantenimiento, soporte, cambios del servicio y descontinuación',
        body: 'Blisse puede actualizar, cambiar, suspender o interrumpir funciones en cualquier momento. También podemos decidir descontinuar por completo la App o los servicios de suscripción. Si lo hacemos, podremos detener futuras renovaciones, dejar de ofrecer nuevas compras y terminar la disponibilidad del servicio con un aviso previo comercialmente razonable cuando sea practicable, incluso mediante la App, por correo electrónico o a través de App Store Connect. Si la App o el servicio se descontinúan, el acceso finalizará cuando el servicio se apague, incluso para el acceso de por vida, y no se emitirán reembolsos, créditos ni devoluciones prorrateadas salvo cuando la ley aplicable o las reglas de la App Store exijan lo contrario. En la medida en que la App se distribuya a través de Apple, reconoces que Blisse, y no Apple, es la única responsable de prestar mantenimiento y soporte respecto de la App, si existiera tal soporte. Apple no tiene obligación alguna de prestar mantenimiento ni soporte para la App.',
      },
      {
        heading: '11. Exclusión de garantías y aviso específico por plataforma',
        body: 'LA APP SE PROPORCIONA "TAL CUAL" Y "SEGÚN DISPONIBILIDAD", SIN GARANTÍAS DE NINGÚN TIPO, EXPRESAS, IMPLÍCITAS O LEGALES, INCLUIDAS LAS GARANTÍAS DE COMERCIABILIDAD, IDONEIDAD PARA UN FIN PARTICULAR, DISFRUTE PACÍFICO Y NO INFRACCIÓN, EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY. Si la App no se ajusta a una garantía aplicable y la obtuviste a través de Apple, puedes notificarlo a Apple y Apple podrá reembolsar el precio de compra, si lo hubiera, pagado por la App. En la máxima medida permitida por la ley, Apple no tendrá ninguna otra obligación de garantía respecto de la App, y cualquier otra reclamación, pérdida, responsabilidad, daño, coste o gasto atribuible al incumplimiento de una garantía será responsabilidad de Blisse, en su caso, según la ley aplicable. Si obtuviste la App o una suscripción a través de Google Play, cualquier reembolso, reversión de cobro o disputa de compra se tramitará conforme a los términos aplicables de Google Play, sus políticas de reembolso y la ley aplicable.',
      },
      {
        heading: '12. Reclamaciones sobre el producto y asignación de responsabilidad por plataforma',
        body: 'Blisse, y no Apple, es responsable de atender cualquier reclamación tuya o de terceros relacionada con la App o con tu posesión o uso de la App, incluidas reclamaciones por responsabilidad del producto, por incumplimiento de requisitos legales o regulatorios y por obligaciones derivadas de normas de consumo, privacidad u otras similares. Si obtuviste la App a través de Apple, Apple no tiene responsabilidad por dichas reclamaciones. Las compras realizadas a través de Google Play siguen sujetas a los términos aplicables de distribución, facturación y consumo de Google Play.',
      },
      {
        heading: '13. Reclamaciones por propiedad intelectual',
        body: 'Blisse, y no Apple, es responsable de investigar, defender, resolver y extinguir cualquier reclamación de terceros por la que se alegue que la App o tu posesión y uso de la App infringe derechos de propiedad intelectual de terceros. Si obtuviste la App a través de Apple, Apple no tiene responsabilidad por dichas reclamaciones.',
      },
      {
        heading: '14. Cumplimiento legal y controles de exportación',
        body: 'Declaras y garantizas que no te encuentras en un país sujeto a embargo del Gobierno de Estados Unidos ni designado por dicho Gobierno como país que apoya el terrorismo, y que no figuras en ninguna lista de partes prohibidas o restringidas del Gobierno de Estados Unidos. No usarás, exportarás ni reexportarás la App salvo conforme a la legislación aplicable.',
      },
      {
        heading: '15. Limitación de responsabilidad',
        body: 'EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY, BLISSE NO SERÁ RESPONSABLE POR DAÑOS INDIRECTOS, INCIDENTALES, ESPECIALES, CONSECUENTES, EJEMPLARES O PUNITIVOS, NI POR PÉRDIDA DE DATOS, BENEFICIOS, FONDO DE COMERCIO, INTERRUPCIÓN DE NEGOCIO O FALLO DEL DISPOSITIVO, QUE DERIVEN O SE RELACIONEN CON TU USO O IMPOSIBILIDAD DE USAR LA APP, INCLUSO SI SE ADVIRTIÓ DE LA POSIBILIDAD DE DICHOS DAÑOS. EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY, LA RESPONSABILIDAD TOTAL DE BLISSE POR TODAS LAS RECLAMACIONES RELACIONADAS CON LA APP NO SUPERARÁ LA CANTIDAD MAYOR ENTRE LO QUE HAYAS PAGADO POR LA APP O SUSCRIPCIÓN RELACIONADA EN LOS 12 MESES ANTERIORES O USD 50.',
      },
      {
        heading: '16. Indemnización',
        body: 'Aceptas indemnizar, defender y mantener indemne a Blisse, sus afiliadas, licenciantes y proveedores de servicios, así como a sus respectivos directivos, administradores, empleados y agentes, frente a reclamaciones, responsabilidades, daños, pérdidas y gastos derivados de tu uso indebido de la App, de tu incumplimiento de estos Términos o de la infracción de cualquier ley o derecho de terceros.',
      },
      {
        heading: '17. Ley aplicable y jurisdicción',
        body: 'Estos Términos se rigen por las leyes del Estado de Israel, sin aplicar reglas sobre conflicto de leyes. Cualquier controversia que surja de o en relación con estos Términos o con la App quedará sometida a la jurisdicción exclusiva de los tribunales competentes de Tel Aviv, Israel, sin perjuicio de los derechos imperativos de protección al consumidor que pudieran resultar aplicables conforme a una ley no renunciable.',
      },
      {
        heading: '18. Beneficiario por plataforma y contacto',
        body: 'Si obtuviste la App a través de Apple, Apple y sus filiales son terceros beneficiarios de estos Términos y podrán hacerlos valer frente a ti. Si obtuviste la App a través de Google Play, tu compra y la administración de tu suscripción también están sujetas a los términos y políticas aplicables de Google Play. Si tienes preguntas sobre estos Términos, escríbenos a blisse.online@gmail.com. Si necesitas el nombre legal de la entidad o la dirección postal por motivos regulatorios o contractuales, contáctanos y te proporcionaremos los datos aplicables.',
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
        body: 'Tienes control total sobre tus datos locales:\n- acceso: ver tus datos en la App\n- eliminación: Ajustes -> Restablecer datos\n- portabilidad: tus datos existen solo en tu dispositivo',
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
        body: 'Preguntas sobre privacidad: blisse.online@gmail.com',
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
        body: '- Convertir "¿qué hacemos hoy?" en opciones simples y divertidas\n- Fortalecer la comunicación con juegos, retos y rituales sin presión\n- Mantener el impulso con metas semanales, rachas y logros compartidos\n- Personalizar sugerencias según su estado de ánimo y sus señales de preferencia',
      },
      {
        heading: 'Nuestra historia y estilo',
        body: 'Sin juicios ni presión de rendimiento. Solo conexión real, un poco de picardía y mucho corazón. Diseñamos Blisse para parejas reales con vidas reales.',
      },
      {
        heading: 'Comunidad y comentarios',
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
    readAgree: 'He leído y acepto',
  },
};

const PT_CONTENT: LegalLocaleContent = {
  terms: {
    title: 'Termos de serviço',
    lastUpdated: 'Última atualização: abril de 2026',
    intro: 'Leia estes termos com atenção antes de usar o Blisse.',
    sections: [
      {
        heading: '1. Aceitação dos termos',
        body: 'Ao baixar, instalar, acessar ou usar o Blisse ("o App"), você concorda em ficar vinculado a estes Termos de Serviço. Se não concordar, não baixe, instale, acesse nem use o App.',
      },
      {
        heading: '2. Elegibilidade e uso exclusivo para adultos',
        body: 'Você deve ter pelo menos 18 anos de idade e capacidade legal para aceitar este acordo. O Blisse contém conteúdo maduro, voltado a relacionamentos, e é destinado apenas a adultos que participam de forma consensual.',
      },
      {
        heading: '3. Licença e escopo de uso',
        body: 'Sujeito a estes Termos, a Blisse concede a você uma licença limitada, não exclusiva, intransferível e revogável para usar o App apenas para fins pessoais, lícitos e não comerciais, em dispositivos que você possua ou controle. Você não pode vender, alugar, sublicenciar, redistribuir, modificar, descompilar, fazer engenharia reversa nem criar obras derivadas do App, exceto quando a lei aplicável permitir isso de forma obrigatória. Se você baixou o App pela Apple, seu uso também deve obedecer às Regras de Uso aplicáveis dos Termos e Condições dos Apple Media Services.',
      },
      {
        heading: '4. Contas e acesso',
        body: 'Você é responsável por manter a confidencialidade das credenciais da sua conta e por toda atividade realizada nela. Podemos suspender, restringir ou encerrar o acesso se acreditarmos, de forma razoável, que você violou estes Termos, criou risco para outras pessoas ou usou o App de maneira ilícita.',
      },
      {
        heading: '5. Assinaturas, períodos de teste, cobrança e cancelamento',
        body: 'Alguns recursos do Blisse exigem assinatura paga ou compra única. O preço, o período de cobrança e as condições de teste são exibidos no App antes da compra. Assinaturas com renovação automática renovam-se automaticamente, salvo se forem canceladas com pelo menos 24 horas de antecedência do fim do período vigente. O pagamento é cobrado da sua conta Apple ID após a confirmação da compra. Você pode gerenciar ou cancelar assinaturas nos ajustes da sua conta da App Store. Períodos de teste gratuitos, quando oferecidos, convertem-se automaticamente em assinatura paga caso não sejam cancelados antes do fim do teste. Se você cancelar uma assinatura mensal, o acesso continua até o fim do período mensal vigente. Se você cancelar uma assinatura anual, o acesso continua até o fim do período anual vigente. Se você encerrar voluntariamente uma conta com acesso vitalício, o acesso continua até o fim do ano-calendário vigente, salvo se a exclusão precisar ocorrer antes porque você solicitou apagamento nos termos da lei aplicável. Salvo quando a lei ou as regras da App Store exigirem o contrário, as compras não são reembolsáveis e não oferecemos créditos por tempo não utilizado.',
      },
      {
        heading: '6. Conduta do usuário e consentimento',
        body: 'Você concorda em usar o App de forma responsável, lícita e ética. Todas as atividades sugeridas pelo App exigem consentimento claro, entusiasmado e contínuo de todas as pessoas participantes. Você é o único responsável pela forma como usa o App e por garantir que sua conduta seja legal, segura e consensual. A Blisse não promove condutas coercitivas, exploratórias ou não consensuais.',
      },
      {
        heading: '7. Aviso de saúde e segurança',
        body: 'O App e seu conteúdo são fornecidos apenas para fins informativos e de entretenimento. Eles não constituem aconselhamento médico, psicológico, terapêutico, relacional ou profissional de qualquer outro tipo. Use sempre seu próprio julgamento, respeite seus limites físicos e procure profissionais qualificados quando apropriado.',
      },
      {
        heading: '8. Serviços de terceiros e termos de plataforma',
        body: 'O App pode integrar-se ou interagir com serviços de terceiros, como Apple Sign-In, Firebase, PostHog, Formspree, RevenueCat ou a App Store. Esses serviços são regidos por seus próprios termos e políticas de privacidade. A Blisse não é responsável por serviços de terceiros, processadores de pagamento, lojas de aplicativos, redes ou dispositivos.',
      },
      {
        heading: '9. Propriedade intelectual',
        body: 'O App, incluindo seu software, design, textos, gráficos, áudio, estrutura, funcionalidades e conteúdo subjacente, é de propriedade da Blisse ou de seus licenciadores e é protegido por leis de propriedade intelectual. Exceto pela licença limitada concedida nestes Termos, nenhum outro direito é transferido a você.',
      },
      {
        heading: '10. Manutenção, suporte, mudanças no serviço e descontinuação',
        body: 'A Blisse pode atualizar, alterar, suspender ou descontinuar funcionalidades a qualquer momento. Também podemos decidir descontinuar totalmente o App ou os serviços de assinatura. Se isso acontecer, poderemos interromper futuras renovações, deixar de oferecer novas compras e encerrar a disponibilidade do serviço mediante aviso prévio comercialmente razoável, quando praticável, inclusive por meio do App, por e-mail ou via App Store Connect. Se o App ou o serviço forem descontinuados, o acesso terminará quando o serviço for encerrado, inclusive para o acesso vitalício, e não haverá reembolsos, créditos ou devoluções proporcionais, salvo quando a lei aplicável ou as regras da App Store exigirem o contrário. Na medida em que o App seja distribuído pela Apple, você reconhece que a Blisse, e não a Apple, é a única responsável por fornecer manutenção e suporte ao App, se houver tal suporte. A Apple não tem obrigação de fornecer manutenção ou suporte ao App.',
      },
      {
        heading: '11. Isenção de garantias e aviso específico por plataforma',
        body: 'O APP É FORNECIDO "COMO ESTÁ" E "CONFORME DISPONÍVEL", SEM GARANTIAS DE QUALQUER TIPO, EXPRESSAS, IMPLÍCITAS OU LEGAIS, INCLUINDO GARANTIAS DE COMERCIALIZAÇÃO, ADEQUAÇÃO A UM FIM ESPECÍFICO, USO PACÍFICO E NÃO VIOLAÇÃO, NA MAIOR EXTENSÃO PERMITIDA POR LEI. Se o App deixar de atender a uma garantia aplicável e você o tiver obtido pela Apple, você poderá notificar a Apple, e a Apple poderá reembolsar o preço de compra, se houver, pago pelo App. Na maior extensão permitida por lei, a Apple não terá qualquer outra obrigação de garantia em relação ao App, e quaisquer outras reivindicações, perdas, responsabilidades, danos, custos ou despesas atribuíveis a eventual falha de conformidade com garantia serão de responsabilidade da Blisse, se houver, nos termos da lei aplicável. Se você obteve o App ou uma assinatura pelo Google Play, quaisquer reembolsos, estornos ou disputas de compra serão tratados de acordo com os termos aplicáveis do Google Play, suas políticas de reembolso e a lei aplicável.',
      },
      {
        heading: '12. Reclamações sobre o produto e alocação de responsabilidade por plataforma',
        body: 'A Blisse, e não a Apple, é responsável por tratar quaisquer reclamações feitas por você ou por terceiros relacionadas ao App ou à sua posse e uso do App, incluindo reclamações por responsabilidade do produto, por não conformidade com requisitos legais ou regulatórios e por obrigações decorrentes de normas de defesa do consumidor, privacidade ou semelhantes. Se você obteve o App pela Apple, a Apple não tem responsabilidade por tais reclamações. Compras realizadas pelo Google Play permanecem sujeitas aos termos aplicáveis de distribuição, cobrança e consumo do Google Play.',
      },
      {
        heading: '13. Reclamações de propriedade intelectual',
        body: 'A Blisse, e não a Apple, é responsável por investigar, defender, resolver e quitar qualquer reclamação de terceiro alegando que o App ou sua posse e uso do App violam direitos de propriedade intelectual de terceiros. Se você obteve o App pela Apple, a Apple não tem responsabilidade por tais reclamações.',
      },
      {
        heading: '14. Conformidade legal e controles de exportação',
        body: 'Você declara e garante que não está localizado em país sujeito a embargo do governo dos Estados Unidos nem designado por esse governo como país que apoia o terrorismo, e que não consta em nenhuma lista de partes proibidas ou restritas do governo dos Estados Unidos. Você não usará, exportará nem reexportará o App exceto conforme autorizado pela legislação aplicável.',
      },
      {
        heading: '15. Limitação de responsabilidade',
        body: 'NA MAIOR EXTENSÃO PERMITIDA POR LEI, A BLISSE NÃO SERÁ RESPONSÁVEL POR DANOS INDIRETOS, INCIDENTAIS, ESPECIAIS, CONSEQUENCIAIS, EXEMPLARES OU PUNITIVOS, NEM POR PERDA DE DADOS, LUCROS, FUNDO DE COMÉRCIO, INTERRUPÇÃO DE NEGÓCIOS OU FALHA DO DISPOSITIVO, DECORRENTES OU RELACIONADOS AO SEU USO OU À SUA INCAPACIDADE DE USAR O APP, MESMO QUE TENHA SIDO AVISADA DA POSSIBILIDADE DESSES DANOS. NA MAIOR EXTENSÃO PERMITIDA POR LEI, A RESPONSABILIDADE TOTAL DA BLISSE POR TODAS AS RECLAMAÇÕES RELACIONADAS AO APP NÃO EXCEDERÁ O MAIOR VALOR ENTRE O MONTANTE QUE VOCÊ PAGOU PELO APP OU ASSINATURA RELACIONADA NOS 12 MESES ANTERIORES E USD 50.',
      },
      {
        heading: '16. Indenização',
        body: 'Você concorda em indenizar, defender e isentar a Blisse, suas afiliadas, licenciadores e prestadores de serviço, bem como seus respectivos diretores, administradores, empregados e representantes, de e contra reivindicações, responsabilidades, danos, perdas e despesas decorrentes do uso indevido do App, da violação destes Termos ou da violação de qualquer lei ou direito de terceiros.',
      },
      {
        heading: '17. Lei aplicável e jurisdição',
        body: 'Estes Termos são regidos pelas leis do Estado de Israel, sem aplicação de regras de conflito de leis. Qualquer controvérsia decorrente ou relacionada a estes Termos ou ao App será submetida à jurisdição exclusiva dos tribunais competentes de Tel Aviv, Israel, sem prejuízo de quaisquer direitos obrigatórios de proteção ao consumidor que possam ser aplicáveis por força de lei irrenunciável.',
      },
      {
        heading: '18. Beneficiário por plataforma e contato',
        body: 'Se você obteve o App pela Apple, a Apple e suas subsidiárias são terceiras beneficiárias destes Termos e poderão fazê-los valer contra você. Se você obteve o App pelo Google Play, sua compra e a administração da sua assinatura também estão sujeitas aos termos e políticas aplicáveis do Google Play. Se tiver dúvidas sobre estes Termos, escreva para blisse.online@gmail.com. Se você precisar do nome jurídico da entidade ou do endereço postal para finalidade regulatória ou contratual, entre em contato conosco e forneceremos os dados aplicáveis.',
      },
    ],
  },
  privacy: {
    title: 'Política de privacidade',
    lastUpdated: 'Última atualização: fevereiro de 2026',
    intro: 'Sua privacidade é nossa maior prioridade. O Blisse foi criado para proteger suas informações.',
    sections: [
      {
        heading: 'Nosso compromisso com a privacidade',
        body: 'Blisse foi projetado com privacidade como prioridade máxima.',
      },
      {
        heading: 'Dados armazenados localmente no seu dispositivo',
        body: 'Preferências, favoritos, notas, histórico e configurações ficam armazenados no seu dispositivo. A autenticação é processada pelo Firebase, e mensagens de contato ou ideias são enviadas apenas quando você decide enviá-las.',
      },
      {
        heading: 'Serviços de autenticação',
        body: 'O login é feito por Apple Sign-In e Firebase Authentication (Google). Não armazenamos senhas nem credenciais.',
      },
      {
        heading: 'Análise anônima',
        body: 'Usamos o PostHog para análise anônima e agregada:\n- recursos mais usados\n- padrões gerais de uso\n- métricas de desempenho\n\nDesativamos perfis individuais e enviamos apenas metadados sanitizados.',
      },
      {
        heading: 'Informações que NUNCA coletamos',
        body: '- dados biométricos\n- fotos, contatos ou arquivos pessoais\n- localização precisa\n- notas ou mensagens de texto livre nos fluxos de análise\n- venda de informações pessoais',
      },
      {
        heading: 'Serviços de terceiros',
        body: 'O App usa:\n- Firebase Authentication (Google)\n- Apple Sign-In\n- PostHog\n- Formspree\n\nCada serviço possui sua própria política de privacidade.',
      },
      {
        heading: 'Retenção de dados',
        body: 'Seus dados locais permanecem até que você os apague em Configurações ou desinstale o app. Dados anônimos podem ser mantidos por até 24 meses.',
      },
      {
        heading: 'Privacidade infantil',
        body: 'O Blisse é estritamente para adultos com 18 anos ou mais. Não coletamos intencionalmente dados de menores.',
      },
      {
        heading: 'Seus direitos (GDPR/CCPA)',
        body: 'Você controla totalmente seus dados locais:\n- acesso: visualizar seus dados no app\n- exclusão: Configurações -> Redefinir dados\n- portabilidade: seus dados existem apenas no seu dispositivo',
      },
      {
        heading: 'Segurança',
        body: 'Aplicamos práticas padrão de segurança. O PIN opcional usa armazenamento seguro, e biometria é gerenciada pelo dispositivo.',
      },
      {
        heading: 'Alterações nesta política',
        body: 'Podemos atualizar esta política periodicamente. O uso contínuo do app implica aceitação das alterações.',
      },
      {
        heading: 'Lei aplicável e jurisdição',
        body: 'Esta política é regida pelas leis do Estado de Israel. Qualquer disputa será submetida à jurisdição exclusiva dos tribunais competentes de Tel Aviv, Israel.',
      },
      {
        heading: 'Contato',
        body: 'Dúvidas sobre privacidade: blisse.online@gmail.com',
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
        body: '- Transformar "o que fazemos hoje?" em opções simples e divertidas\n- Fortalecer a comunicação com jogos, desafios e rituais sem pressão\n- Manter o ritmo com metas semanais, sequências e marcos compartilhados\n- Personalizar ideias com base no clima e nas preferências de vocês',
      },
      {
        heading: 'Nossa história e nossa vibe',
        body: 'Sem julgamentos e sem pressão de desempenho. Só conexão verdadeira, um toque de brincadeira e muito carinho. Criamos o Blisse para casais reais com rotinas reais.',
      },
      {
        heading: 'Comunidade e sugestões',
        body: 'Estamos construindo uma comunidade de casais que gostam de se divertir juntos. Suas ideias, comentários e sugestões influenciam diretamente o que vamos criar depois.',
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
  hi: EN_CONTENT,
};

export const getLegalContent = (language: AppLanguage): LegalLocaleContent => {
  return LEGAL_CONTENT[language] || LEGAL_CONTENT.en;
};



