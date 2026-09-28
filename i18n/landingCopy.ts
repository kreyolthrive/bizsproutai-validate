/** Public landing-page copy. Claims describe guidance, never guaranteed business outcomes. */
export type LandingCopy = {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  primary: string;
  secondary: string;
  note: string;
  label: string;
  resultTitle: string;
  resultIntro: string;
  results: [string, string][];
  evidence: string;
  audienceLabel: string;
  audienceTitle: string;
  audiences: [string, string][];
  methodLabel: string;
  methodTitle: string;
  methodIntro: string;
  steps: [string, string][];
  nextLabel: string;
  nextTitle: string;
  appTitle: string;
  appBody: string;
  appCta: string;
  coachingTitle: string;
  coachingBody: string;
  coachingCta: string;
  coachingNote: string;
  feedbackTitle: string;
  founderLabel: string;
  anonymousNote: string;
  quotes: string[];
  faqTitle: string;
  faqs: [string, string][];
  finalTitle: string;
  finalBody: string;
  founderIntro: string;
  founderLink: string;
  nav: {
    audience: string;
    how: string;
    support: string;
    skip: string;
    open: string;
    close: string;
  };
};

const copy: Record<string, LandingCopy> = {
  en: {
    eyebrow: "Business validation & guided execution",
    title: "Turn your business idea into",
    accent: "a clear next step.",
    description:
      "BizSproutAI helps first-time founders clarify ideas, test assumptions, create business assets, and take practical steps toward their first customer.",
    primary: "Start free validation",
    secondary: "See how it works",
    note: "Free to start · No account required for validation",
    label: "Your starting point",
    resultTitle: "Less guessing. A clearer direction.",
    resultIntro:
      "Describe your idea. Get a structured starting point for deciding what to test and what to create next.",
    results: [
      [
        "Your current stage",
        "Understand where your idea needs more clarity or evidence.",
      ],
      [
        "A recommended first asset",
        "An interview script, outreach message, or offer test—not always an app.",
      ],
      [
        "Practical next steps",
        "Focus on a small set of actions you can take with real customers.",
      ],
      [
        "A mistake to avoid",
        "Spot a risk before investing more time or money.",
      ],
    ],
    evidence:
      "An AI assessment is a starting point. Customer conversations and real-world tests provide the evidence.",
    audienceLabel: "Built for your next move",
    audienceTitle: "Start where you are.",
    audiences: [
      [
        "You have an idea",
        "Clarify who it helps, what problem it solves, and which assumption to test first.",
      ],
      [
        "You are ready to build",
        "Choose a useful first asset before committing to a bigger product.",
      ],
      [
        "You have launched but feel stuck",
        "Revisit your offer and customer signals to decide what to improve.",
      ],
    ],
    methodLabel: "How it works",
    methodTitle: "Validation and execution, connected.",
    methodIntro:
      "A practical method: understand the problem, test the assumptions, create the right asset, and learn from the response.",
    steps: [
      [
        "Clarify the idea",
        "Describe your customer, their problem, your offer, and your constraints.",
      ],
      [
        "Choose what to test",
        "Use structured guidance to identify the assumptions that need evidence.",
      ],
      [
        "Create your first asset",
        "Turn the next step into something useful: a discovery script, outreach message, or offer test page.",
      ],
      [
        "Act, learn, improve",
        "Talk to potential customers, record what happens, and adjust your next move.",
      ],
    ],
    nextLabel: "After validation",
    nextTitle: "Keep moving, with the support you need.",
    appTitle: "Continue in BizSproutAI",
    appBody:
      "Explore the main platform to connect validation, business assets, and guided execution. Start with the asset that fits your stage.",
    appCta: "Explore the platform",
    coachingTitle: "Prefer hands-on guidance?",
    coachingBody:
      "Discuss a 30-day Founder Sprint focused on testing assumptions, creating your first asset, and taking practical steps toward a first customer.",
    coachingCta: "Book a free fit call",
    coachingNote:
      "Coaching is optional. Scope and fees are discussed before you commit. Customer results and timelines vary.",
    feedbackTitle: "What founders have shared",
    founderLabel: "Founder",
    anonymousNote:
      "Names withheld at the founders’ request. Individual experiences are not promises of results.",
    quotes: [
      "I had too many ideas and no idea where to start. Getting a clear next step changed everything for me.",
      "I just needed someone to tell me what to build first. That’s exactly what the validation did.",
    ],
    faqTitle: "A few things worth knowing.",
    faqs: [
      [
        "What does free validation include?",
        "A structured assessment of your idea, your current stage, a recommended first asset, practical next steps, and a risk to consider.",
      ],
      [
        "Does a score prove my idea will succeed?",
        "No. Scores help organize your next decisions. They do not predict revenue or replace evidence from customers.",
      ],
      [
        "Do I need to know how to code?",
        "No coding is needed to start validation. Your first asset may be an interview script or an outreach message rather than software.",
      ],
      [
        "Is a paying customer guaranteed in 30 days?",
        "No. The sprint provides structure for action and learning. Demand, execution, and circumstances affect results.",
      ],
      [
        "Do I have to book a call or buy coaching?",
        "No. Start with free validation. The fit call is an optional conversation about whether additional support suits your needs.",
      ],
    ],
    finalTitle: "You do not need every answer to begin.",
    finalBody:
      "Start with your idea. Find the next assumption to test and the next action to take.",
    founderIntro: "Founded by Wagner Desir, business and mindset strategist.",
    founderLink: "Meet the founder",
    nav: {
      audience: "Who it’s for",
      how: "How it works",
      support: "Next steps",
      skip: "Skip to main content",
      open: "Open navigation menu",
      close: "Close navigation menu",
    },
  },
  fr: {
    eyebrow: "Validation d’entreprise et mise en œuvre guidée",
    title: "Transformez votre idée en",
    accent: "une prochaine étape claire.",
    description:
      "BizSproutAI aide les nouveaux entrepreneurs à clarifier leurs idées, tester leurs hypothèses, créer des outils utiles et avancer concrètement vers leur premier client.",
    primary: "Commencer la validation gratuite",
    secondary: "Voir comment ça marche",
    note: "Gratuit pour commencer · Aucun compte requis pour la validation",
    label: "Votre point de départ",
    resultTitle: "Moins de suppositions. Plus de clarté.",
    resultIntro:
      "Décrivez votre idée. Obtenez une base structurée pour choisir quoi tester et quoi créer ensuite.",
    results: [
      [
        "Votre stade actuel",
        "Repérez ce qui demande plus de clarté ou de preuves.",
      ],
      [
        "Un premier outil recommandé",
        "Un guide d’entretien, un message de prospection ou un test d’offre : pas forcément une application.",
      ],
      [
        "Des étapes concrètes",
        "Concentrez-vous sur quelques actions auprès de vrais clients potentiels.",
      ],
      [
        "Une erreur à éviter",
        "Identifiez un risque avant d’investir davantage de temps ou d’argent.",
      ],
    ],
    evidence:
      "Une évaluation par IA est un point de départ. Les échanges avec les clients et les tests réels apportent les preuves.",
    audienceLabel: "Pour votre prochaine étape",
    audienceTitle: "Partez de là où vous êtes.",
    audiences: [
      [
        "Vous avez une idée",
        "Précisez à qui elle s’adresse, le problème qu’elle résout et l’hypothèse à tester.",
      ],
      [
        "Vous êtes prêt à créer",
        "Choisissez un premier outil utile avant de développer un produit plus ambitieux.",
      ],
      [
        "Vous avez lancé, mais vous bloquez",
        "Revenez sur votre offre et les retours clients pour choisir quoi améliorer.",
      ],
    ],
    methodLabel: "Comment ça marche",
    methodTitle: "Relier validation et action.",
    methodIntro:
      "Une méthode concrète : comprendre le problème, tester les hypothèses, créer le bon outil et apprendre des retours.",
    steps: [
      [
        "Clarifiez votre idée",
        "Décrivez votre client, son problème, votre offre et vos contraintes.",
      ],
      [
        "Choisissez quoi tester",
        "Identifiez les hypothèses qui nécessitent des preuves grâce à un parcours structuré.",
      ],
      [
        "Créez votre premier outil",
        "Préparez un guide d’entretien, un message de prospection ou une page de test d’offre.",
      ],
      [
        "Agissez, apprenez, améliorez",
        "Échangez avec des clients potentiels, consignez les résultats et ajustez la suite.",
      ],
    ],
    nextLabel: "Après la validation",
    nextTitle: "Avancez avec le soutien adapté.",
    appTitle: "Continuez dans BizSproutAI",
    appBody:
      "Explorez la plateforme principale pour relier validation, outils de lancement et mise en œuvre guidée. Commencez par ce qui correspond à votre stade.",
    appCta: "Explorer la plateforme",
    coachingTitle: "Vous préférez être accompagné ?",
    coachingBody:
      "Découvrez un Sprint Fondateur de 30 jours pour tester vos hypothèses, créer votre premier outil et avancer vers un premier client.",
    coachingCta: "Réserver un appel gratuit",
    coachingNote:
      "L’accompagnement est facultatif. Le périmètre et les tarifs sont discutés avant tout engagement. Les résultats et les délais varient.",
    feedbackTitle: "Ce que des fondateurs nous ont confié",
    founderLabel: "Fondateur",
    anonymousNote:
      "Noms non publiés à la demande des fondateurs. Les expériences individuelles ne constituent pas une promesse de résultat.",
    quotes: [
      "J’avais trop d’idées et je ne savais pas par où commencer. Avoir une prochaine étape claire a tout changé pour moi.",
      "J’avais simplement besoin de savoir quoi créer en premier. C’est exactement ce que la validation m’a apporté.",
    ],
    faqTitle: "Quelques réponses avant de commencer.",
    faqs: [
      [
        "Que comprend la validation gratuite ?",
        "Une évaluation structurée, votre stade actuel, un premier outil recommandé, des prochaines étapes et un risque à considérer.",
      ],
      [
        "Un score prouve-t-il que mon idée réussira ?",
        "Non. Il aide à organiser vos décisions, sans prédire vos revenus ni remplacer les preuves recueillies auprès des clients.",
      ],
      [
        "Faut-il savoir coder ?",
        "Non pour commencer la validation. Un guide d’entretien ou un message de prospection peut être plus utile qu’un logiciel.",
      ],
      [
        "Un client payant est-il garanti en 30 jours ?",
        "Non. Le sprint structure l’action et l’apprentissage. La demande, l’exécution et le contexte influencent les résultats.",
      ],
      [
        "Dois-je réserver un appel ou acheter un accompagnement ?",
        "Non. Commencez gratuitement. L’appel est une option pour discuter d’un soutien adapté à vos besoins.",
      ],
    ],
    finalTitle: "Pas besoin de toutes les réponses pour commencer.",
    finalBody:
      "Partez de votre idée. Identifiez la prochaine hypothèse à tester et l’action à entreprendre.",
    founderIntro:
      "Fondé par Wagner Desir, stratège en entrepreneuriat et en développement personnel.",
    founderLink: "Rencontrer le fondateur",
    nav: {
      audience: "Pour qui",
      how: "La méthode",
      support: "La suite",
      skip: "Aller au contenu principal",
      open: "Ouvrir le menu",
      close: "Fermer le menu",
    },
  },
  es: {
    eyebrow: "Validación de negocios y ejecución guiada",
    title: "Convierte tu idea de negocio en",
    accent: "un siguiente paso claro.",
    description:
      "BizSproutAI ayuda a quienes emprenden por primera vez a aclarar ideas, probar supuestos, crear recursos para su negocio y dar pasos concretos hacia su primer cliente.",
    primary: "Iniciar validación gratuita",
    secondary: "Ver cómo funciona",
    note: "Empieza gratis · La validación no requiere cuenta",
    label: "Tu punto de partida",
    resultTitle: "Menos suposiciones. Más claridad.",
    resultIntro:
      "Describe tu idea. Obtén una base estructurada para decidir qué probar y qué crear después.",
    results: [
      [
        "Tu etapa actual",
        "Identifica dónde necesitas más claridad o evidencia.",
      ],
      [
        "Un primer recurso recomendado",
        "Un guion de entrevista, un mensaje de contacto o una prueba de oferta; no siempre una app.",
      ],
      [
        "Pasos prácticos",
        "Concéntrate en unas pocas acciones con clientes potenciales reales.",
      ],
      [
        "Un error que evitar",
        "Detecta un riesgo antes de invertir más tiempo o dinero.",
      ],
    ],
    evidence:
      "Una evaluación con IA es un punto de partida. Las conversaciones con clientes y las pruebas reales aportan la evidencia.",
    audienceLabel: "Para tu siguiente paso",
    audienceTitle: "Empieza donde estás.",
    audiences: [
      [
        "Tienes una idea",
        "Aclara a quién ayuda, qué problema resuelve y qué supuesto probar primero.",
      ],
      [
        "Estás listo para crear",
        "Elige un primer recurso útil antes de comprometerte con un producto más grande.",
      ],
      [
        "Ya lanzaste, pero estás estancado",
        "Revisa tu oferta y las señales de tus clientes para decidir qué mejorar.",
      ],
    ],
    methodLabel: "Cómo funciona",
    methodTitle: "Validación y ejecución, conectadas.",
    methodIntro:
      "Un método práctico: entender el problema, probar supuestos, crear el recurso adecuado y aprender de la respuesta.",
    steps: [
      [
        "Aclara tu idea",
        "Describe a tu cliente, su problema, tu oferta y tus limitaciones.",
      ],
      [
        "Elige qué probar",
        "Identifica los supuestos que necesitan evidencia con una guía estructurada.",
      ],
      [
        "Crea tu primer recurso",
        "Prepara un guion de entrevista, un mensaje de contacto o una página para probar tu oferta.",
      ],
      [
        "Actúa, aprende y mejora",
        "Habla con clientes potenciales, registra lo que sucede y ajusta tu próximo paso.",
      ],
    ],
    nextLabel: "Después de validar",
    nextTitle: "Avanza con el apoyo que necesitas.",
    appTitle: "Continúa en BizSproutAI",
    appBody:
      "Explora la plataforma principal para conectar validación, recursos de negocio y ejecución guiada. Empieza con lo que corresponda a tu etapa.",
    appCta: "Explorar la plataforma",
    coachingTitle: "¿Prefieres acompañamiento?",
    coachingBody:
      "Conoce el Sprint para Fundadores de 30 días: prueba supuestos, crea tu primer recurso y da pasos concretos hacia un primer cliente.",
    coachingCta: "Reservar una llamada gratuita",
    coachingNote:
      "El acompañamiento es opcional. El alcance y los precios se acuerdan antes de comprometerte. Los resultados y plazos varían.",
    feedbackTitle: "Lo que nos han contado los fundadores",
    founderLabel: "Fundador",
    anonymousNote:
      "Nombres omitidos a petición de los fundadores. Las experiencias individuales no son promesas de resultados.",
    quotes: [
      "Tenía demasiadas ideas y no sabía por dónde empezar. Tener un siguiente paso claro lo cambió todo para mí.",
      "Solo necesitaba saber qué crear primero. Eso es exactamente lo que me aportó la validación.",
    ],
    faqTitle: "Lo que conviene saber antes de empezar.",
    faqs: [
      [
        "¿Qué incluye la validación gratuita?",
        "Una evaluación estructurada, tu etapa actual, un primer recurso recomendado, próximos pasos y un riesgo que considerar.",
      ],
      [
        "¿Una puntuación prueba que mi idea tendrá éxito?",
        "No. Ayuda a organizar tus decisiones, pero no predice ingresos ni sustituye la evidencia de clientes.",
      ],
      [
        "¿Necesito saber programar?",
        "No para empezar la validación. Un guion de entrevista o un mensaje de contacto puede ser más útil que un programa.",
      ],
      [
        "¿Se garantiza un cliente de pago en 30 días?",
        "No. El sprint estructura la acción y el aprendizaje. La demanda, la ejecución y las circunstancias influyen en los resultados.",
      ],
      [
        "¿Debo reservar una llamada o contratar acompañamiento?",
        "No. Empieza con la validación gratuita. La llamada es opcional para evaluar qué apoyo necesitas.",
      ],
    ],
    finalTitle: "No necesitas todas las respuestas para empezar.",
    finalBody:
      "Empieza con tu idea. Encuentra el siguiente supuesto que probar y la próxima acción que tomar.",
    founderIntro:
      "Fundado por Wagner Desir, estratega de negocios y mentalidad.",
    founderLink: "Conoce al fundador",
    nav: {
      audience: "Para quién",
      how: "Cómo funciona",
      support: "Próximos pasos",
      skip: "Ir al contenido principal",
      open: "Abrir menú",
      close: "Cerrar menú",
    },
  },
  ht: {
    eyebrow: "Validasyon biznis ak gid pou pase alaksyon",
    title: "Bay lide biznis ou",
    accent: "yon pwochen etap klè.",
    description:
      "BizSproutAI ede moun k ap lanse premye biznis yo klarifye lide yo, teste sa yo sipoze, kreye zouti pou biznis yo, epi fè etap konkrè pou jwenn premye kliyan yo.",
    primary: "Kòmanse validasyon gratis",
    secondary: "Gade kijan li mache",
    note: "Kòmanse gratis · Ou pa bezwen kont pou validasyon an",
    label: "Pwen depa ou",
    resultTitle: "Mwens devinèt. Plis klète.",
    resultIntro:
      "Dekri lide ou. Jwenn yon baz ki byen òganize pou deside sa pou teste ak sa pou kreye apre.",
    results: [
      [
        "Etap ou ye kounye a",
        "Wè ki kote lide ou bezwen plis klète oswa prèv.",
      ],
      [
        "Yon premye zouti rekòmande",
        "Yon gid entèvyou, yon mesaj pou kontakte moun, oswa yon tès òf; se pa toujou yon aplikasyon.",
      ],
      [
        "Pwochen aksyon yo",
        "Konsantre sou kèk aksyon ou ka fè ak vrè kliyan potansyèl.",
      ],
      [
        "Yon erè pou evite",
        "Idantifye yon risk anvan ou depanse plis tan oswa lajan.",
      ],
    ],
    evidence:
      "Yon evalyasyon ak IA se yon pwen depa. Konvèsasyon ak kliyan ak tès nan lavi reyèl bay prèv yo.",
    audienceLabel: "Pou pwochen etap ou",
    audienceTitle: "Kòmanse kote ou ye a.",
    audiences: [
      [
        "Ou gen yon lide",
        "Klarifye kiyès li ede, ki pwoblèm li rezoud, ak ki sipozisyon pou teste an premye.",
      ],
      [
        "Ou pare pou bati",
        "Chwazi yon premye zouti itil anvan ou angaje w nan yon pi gwo pwodwi.",
      ],
      [
        "Ou deja lanse, men ou bloke",
        "Revize òf ou ak sa kliyan yo montre w pou deside sa pou amelyore.",
      ],
    ],
    methodLabel: "Kijan li mache",
    methodTitle: "Validasyon ak aksyon, konekte.",
    methodIntro:
      "Yon metòd pratik: konprann pwoblèm nan, teste sipozisyon yo, kreye bon zouti a, epi aprann nan repons yo.",
    steps: [
      [
        "Klarifye lide a",
        "Dekri kliyan ou, pwoblèm li, òf ou, ak limit ou genyen.",
      ],
      [
        "Chwazi sa pou teste",
        "Sèvi ak yon gid byen òganize pou idantifye sipozisyon ki bezwen prèv.",
      ],
      [
        "Kreye premye zouti ou",
        "Prepare yon gid entèvyou, yon mesaj pou kontakte kliyan, oswa yon paj pou teste òf ou.",
      ],
      [
        "Aji, aprann, amelyore",
        "Pale ak kliyan potansyèl, note sa ki pase, epi ajiste pwochen aksyon ou.",
      ],
    ],
    nextLabel: "Apre validasyon",
    nextTitle: "Kontinye avanse ak sipò ou bezwen an.",
    appTitle: "Kontinye nan BizSproutAI",
    appBody:
      "Eksplore platfòm prensipal la pou konekte validasyon, zouti biznis ak aksyon gide. Kòmanse ak sa ki mache pou etap ou ye a.",
    appCta: "Eksplore platfòm nan",
    coachingTitle: "Ou pito yon akonpayman?",
    coachingBody:
      "Dekouvri yon Sprint Fondatè 30 jou pou teste sipozisyon ou, kreye premye zouti ou, epi fè etap konkrè pou jwenn yon premye kliyan.",
    coachingCta: "Rezève yon apèl gratis",
    coachingNote:
      "Akonpayman an pa obligatwa. N ap diskite sa sèvis la gen ladan l ak pri a anvan ou angaje w. Rezilta ak delè yo varye.",
    feedbackTitle: "Sa fondatè yo pataje avèk nou",
    founderLabel: "Fondatè",
    anonymousNote:
      "Nou pa pibliye non yo paske fondatè yo mande sa. Eksperyans chak moun pa yon pwomès rezilta.",
    quotes: [
      "Mwen te gen twòp lide e mwen pa t konnen ki kote pou kòmanse. Lè mwen te jwenn yon pwochen etap klè, sa te chanje tout bagay pou mwen.",
      "Mwen te jis bezwen konnen sa pou m bati an premye. Se egzakteman sa validasyon an te ban mwen.",
    ],
    faqTitle: "Kèk bagay pou konnen anvan ou kòmanse.",
    faqs: [
      [
        "Kisa validasyon gratis la gen ladan l?",
        "Yon evalyasyon byen òganize, etap ou ye a, yon premye zouti rekòmande, pwochen aksyon ak yon risk pou konsidere.",
      ],
      [
        "Èske yon nòt pwouve lide m ap reyisi?",
        "Non. Nòt yo ede òganize desizyon ou. Yo pa predi revni e yo pa ranplase prèv kliyan yo bay.",
      ],
      [
        "Èske mwen bezwen konn kode?",
        "Non pou kòmanse validasyon an. Yon gid entèvyou oswa yon mesaj pou kontakte moun ka pi itil pase lojisyèl.",
      ],
      [
        "Èske gen garanti pou jwenn yon kliyan peyan nan 30 jou?",
        "Non. Sprint la bay estrikti pou aji ak aprann. Demann, fason ou aji, ak sikonstans yo enfliyanse rezilta yo.",
      ],
      [
        "Èske mwen oblije rezève yon apèl oswa peye akonpayman?",
        "Non. Kòmanse ak validasyon gratis la. Apèl la se yon opsyon pou wè ki sipò ki mache pou ou.",
      ],
    ],
    finalTitle: "Ou pa bezwen tout repons yo pou kòmanse.",
    finalBody:
      "Kòmanse ak lide ou. Jwenn pwochen sipozisyon pou teste a ak pwochen aksyon pou fè a.",
    founderIntro:
      "Wagner Desir, stratèj biznis ak mantalite, se fondatè platfòm nan.",
    founderLink: "Rankontre fondatè a",
    nav: {
      audience: "Pou kiyès",
      how: "Kijan li mache",
      support: "Pwochen etap",
      skip: "Ale nan kontni prensipal la",
      open: "Louvri meni an",
      close: "Fèmen meni an",
    },
  },
  pt: {
    eyebrow: "Validação de negócios e execução guiada",
    title: "Transforme sua ideia de negócio em",
    accent: "um próximo passo claro.",
    description:
      "O BizSproutAI ajuda quem está empreendendo pela primeira vez a esclarecer ideias, testar hipóteses, criar recursos para o negócio e dar passos práticos rumo ao primeiro cliente.",
    primary: "Começar a validação gratuita",
    secondary: "Veja como funciona",
    note: "Comece grátis · A validação não exige conta",
    label: "Seu ponto de partida",
    resultTitle: "Menos suposições. Mais clareza.",
    resultIntro:
      "Descreva sua ideia. Receba uma base estruturada para decidir o que testar e o que criar a seguir.",
    results: [
      [
        "Seu estágio atual",
        "Identifique onde sua ideia precisa de mais clareza ou evidências.",
      ],
      [
        "Um primeiro recurso recomendado",
        "Um roteiro de entrevista, uma mensagem de contato ou um teste de oferta; nem sempre um aplicativo.",
      ],
      [
        "Próximos passos práticos",
        "Concentre-se em algumas ações com clientes potenciais reais.",
      ],
      [
        "Um erro a evitar",
        "Identifique um risco antes de investir mais tempo ou dinheiro.",
      ],
    ],
    evidence:
      "Uma avaliação por IA é um ponto de partida. Conversas com clientes e testes reais fornecem as evidências.",
    audienceLabel: "Para seu próximo passo",
    audienceTitle: "Comece de onde você está.",
    audiences: [
      [
        "Você tem uma ideia",
        "Esclareça quem ela ajuda, qual problema resolve e qual hipótese testar primeiro.",
      ],
      [
        "Você está pronto para criar",
        "Escolha um primeiro recurso útil antes de investir em um produto maior.",
      ],
      [
        "Você já lançou, mas está travado",
        "Reveja sua oferta e os sinais dos clientes para decidir o que melhorar.",
      ],
    ],
    methodLabel: "Como funciona",
    methodTitle: "Validação e execução, conectadas.",
    methodIntro:
      "Um método prático: entender o problema, testar hipóteses, criar o recurso certo e aprender com as respostas.",
    steps: [
      [
        "Esclareça a ideia",
        "Descreva seu cliente, o problema, sua oferta e suas limitações.",
      ],
      [
        "Escolha o que testar",
        "Use uma orientação estruturada para identificar as hipóteses que precisam de evidências.",
      ],
      [
        "Crie seu primeiro recurso",
        "Prepare um roteiro de entrevista, uma mensagem de contato ou uma página de teste de oferta.",
      ],
      [
        "Aja, aprenda e melhore",
        "Converse com clientes potenciais, registre o que acontece e ajuste seu próximo passo.",
      ],
    ],
    nextLabel: "Depois da validação",
    nextTitle: "Avance com o apoio de que precisa.",
    appTitle: "Continue no BizSproutAI",
    appBody:
      "Explore a plataforma principal para conectar validação, recursos de negócio e execução guiada. Comece pelo que combina com seu estágio.",
    appCta: "Explorar a plataforma",
    coachingTitle: "Prefere acompanhamento?",
    coachingBody:
      "Conheça um Sprint Fundador de 30 dias para testar hipóteses, criar seu primeiro recurso e dar passos práticos rumo a um primeiro cliente.",
    coachingCta: "Agendar uma conversa gratuita",
    coachingNote:
      "O acompanhamento é opcional. Escopo e valores são discutidos antes do compromisso. Resultados e prazos variam.",
    feedbackTitle: "O que os fundadores compartilharam",
    founderLabel: "Fundador",
    anonymousNote:
      "Nomes omitidos a pedido dos fundadores. Experiências individuais não são promessas de resultados.",
    quotes: [
      "Eu tinha ideias demais e não sabia por onde começar. Ter um próximo passo claro mudou tudo para mim.",
      "Eu só precisava saber o que criar primeiro. Foi exatamente isso que a validação me trouxe.",
    ],
    faqTitle: "O que vale saber antes de começar.",
    faqs: [
      [
        "O que a validação gratuita inclui?",
        "Uma avaliação estruturada, seu estágio atual, um primeiro recurso recomendado, próximos passos e um risco a considerar.",
      ],
      [
        "Uma pontuação prova que minha ideia dará certo?",
        "Não. Ela ajuda a organizar decisões, mas não prevê receita nem substitui evidências dos clientes.",
      ],
      [
        "Preciso saber programar?",
        "Não para começar a validação. Um roteiro de entrevista ou uma mensagem de contato pode ser mais útil que um software.",
      ],
      [
        "Um cliente pagante é garantido em 30 dias?",
        "Não. O sprint estrutura a ação e o aprendizado. Demanda, execução e contexto influenciam os resultados.",
      ],
      [
        "Preciso agendar uma conversa ou contratar acompanhamento?",
        "Não. Comece com a validação gratuita. A conversa é opcional para avaliar o apoio que faz sentido para você.",
      ],
    ],
    finalTitle: "Você não precisa de todas as respostas para começar.",
    finalBody:
      "Comece com sua ideia. Encontre a próxima hipótese a testar e a próxima ação a tomar.",
    founderIntro:
      "Fundado por Wagner Desir, estrategista de negócios e mentalidade.",
    founderLink: "Conheça o fundador",
    nav: {
      audience: "Para quem",
      how: "Como funciona",
      support: "Próximos passos",
      skip: "Ir ao conteúdo principal",
      open: "Abrir menu",
      close: "Fechar menu",
    },
  },
};

export function getLandingCopy(locale: string): LandingCopy {
  return copy[locale.toLowerCase().split("-")[0]] ?? copy.en;
}
