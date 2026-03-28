/**
 * Centralised landing page copy for all supported locales.
 *
 * Every user-facing string that appears on the main landing page lives
 * here so it can be swapped per-locale in one place.
 */

export type LandingCopy = ReturnType<typeof getLandingCopy>;

export function getLandingCopy(locale: string) {
  const lang = locale.toLowerCase().split("-")[0];

  const base = {
    /* ── Hero card ────────────────────────────────── */
    clarityLabel: "Where are you right now?",
    clarityQuestion:
      "Pick what describes you best so we can match your sprint path.",
    clarityChoices: [
      "I have an idea but no clear offer or direction",
      "I have an offer but no website or system behind it",
      "I have scattered pieces but nothing connected",
      "I am ready to launch but need hands-on support",
    ],

    /* ── Mini cards ───────────────────────────────── */
    miniCards: [
      { icon: "⚡", title: "48h", subtitle: "Your system is live" },
      { icon: "📆", title: "30 Days", subtitle: "To first customer" },
      { icon: "🎯", title: "1 Goal", subtitle: "Clear destination" },
      { icon: "🛡️", title: "Guarantee", subtitle: "Results or we keep going" },
    ],

    /* ── Pain items ───────────────────────────────── */
    painItems: [
      {
        icon: "🧠",
        title: "Too many ideas, no clear next step",
        body: "You have potential directions but no framework to choose. Every option feels equally possible and equally risky, so nothing moves forward.",
      },
      {
        icon: "💸",
        title: "No confidence that people will actually pay",
        body: "You have not validated whether anyone wants what you are building. Without proof of demand, it is hard to commit fully to any direction.",
      },
      {
        icon: "🔄",
        title: "Overthinking replacing execution every day",
        body: "You spend more time planning, researching, and second-guessing than actually building. The gap between knowing and doing keeps growing.",
      },
      {
        icon: "🧩",
        title: "Scattered tools that never become a real business",
        body: "You have a landing page here, a form there, maybe some social posts — but nothing is connected into a system that actually works.",
      },
      {
        icon: "📚",
        title: "Courses that teach, but never help you launch",
        body: "You have consumed plenty of content. What you are missing is not more information — it is a clear launch path and real support while you build it.",
      },
      {
        icon: "🤷",
        title: "Trying to piece everything together alone",
        body: "You do not need more motivation. You need structure, support, and someone building alongside you who has done this before.",
      },
    ],

    /* ── How intro ────────────────────────────────── */
    howIntro: "This is the exact path we use to get you to your first paying client in 30 days.",

    /* ── How steps ────────────────────────────────── */
    howSteps: [
      {
        number: "01",
        title: "\uD83D\uDCA5 Week 1 — Lock Your First Offer (That People Will Actually Pay For)",
        body: "Stop guessing. We validate your idea, define your audience, and build an offer based on real demand.",
        tag: "You leave with",
        checklist: ["A clear offer", "A defined buyer", "Confidence it can sell"],
      },
      {
        number: "02",
        title: "\u26A1 Week 2 — Go Live in 48 Hours",
        body: "Your website, messaging, and client system go live — fast.",
        tag: "You leave with",
        checklist: ["A working website", "Booking system ready", "Follow-up system in place"],
      },
      {
        number: "03",
        title: "\uD83D\uDE80 Week 3 — Start Real Conversations",
        body: "No more waiting. You start talking to real prospects using proven scripts.",
        tag: "You leave with",
        checklist: ["Outreach messages that get replies", "First real leads", "Active conversations"],
      },
      {
        number: "04",
        title: "\uD83D\uDCB0 Week 4 — Close Your First Paying Client",
        body: "We refine your pitch and help you turn conversations into revenue.",
        tag: "You leave with",
        checklist: ["Your first paying client", "A repeatable sales process", "Real momentum"],
        guarantee: "If you don\u2019t reach this point, we keep working with you — free — until you do.",
      },
    ],

    /* ── Featured service ─────────────────────────── */
    featuredBadge: "The Sprint",
    featuredTitle: "The 30-Day Founder Sprint",
    featuredBody:
      "A done-with-you business launch system. One integrated setup that actually works — from idea to first customer, with hands-on support every step of the way.",
    featuredCta: "Apply for the Sprint",
    featuredChecklist: [
      "Idea validation and market direction",
      "Offer creation built around real demand",
      "Website and messaging built with you",
      "Booking and client follow-up system",
      "AI tools configured to save time",
      "30-day execution roadmap",
      "Direct support and feedback throughout",
    ],

    /* ── Services ─────────────────────────────────── */
    services: [
      {
        id: "outreach_templates",
        title: "First Client Acquisition Scripts",
        body: "Know exactly what to say. Outreach and follow-up templates ready to use from day one, designed to start real conversations that convert.",
        cta: "Included in the Sprint",
      },
      {
        id: "automation_setup",
        title: "Automation Setup Support",
        body: "Your system keeps working even when you are not online. We configure the AI tools and automations that save you hours every week.",
        cta: "Included in the Sprint",
      },
      {
        id: "commitment",
        title: "Our Commitment — Results or We Keep Working",
        body: "If you complete the sprint, follow the plan, and do the work — and still do not land your first paying customer in 30 days — we continue working with you at no extra cost until you do.",
        cta: "No hidden fees. No fine print.",
      },
      {
        id: "why_different",
        title: "Why This Is Different",
        body: "Not a course. Not a tool. Not more theory. The Sprint is built around execution — one clear goal, hands-on support, and a system you own when it is over.",
        cta: "One goal: your first paying customer",
      },
    ],

    /* ── Testimonials ─────────────────────────────── */
    testimonials: [
      {
        quote: "I started with scattered thoughts and no strong positioning. By the end of the sprint, I had a validated offer, a defined audience, and a direction I could explain with confidence.",
        name: "From unclear idea to clear paid offer",
        role: "Sprint outcome",
        initial: "1",
        color: "bg-[var(--landing-green-mid)]",
      },
      {
        quote: "Instead of just getting a page online, I left with messaging, booking flow, and follow-up pieces that actually support conversions.",
        name: "From 'I need a website' to a real launch system",
        role: "Sprint outcome",
        initial: "2",
        color: "bg-[var(--landing-green-light)]",
      },
      {
        quote: "I stopped waiting for everything to feel perfect and started having conversations, sending offers, and building momentum around something real.",
        name: "From overthinking to real outreach",
        role: "Sprint outcome",
        initial: "3",
        color: "bg-[var(--landing-amber)] text-[var(--landing-ink)]",
      },
    ],

    /* ── Signal strip ─────────────────────────────── */
    signalStats: [
      { value: "48h", label: "Time to launch" },
      { value: "30", label: "Days to first customer" },
      { value: "1", label: "Clear destination" },
    ],

    /* ── Booking ──────────────────────────────────── */
    bookingTitle: "Apply for the next 30-Day Founder Sprint",
    bookingFallback: "Pick a time that works for you",
  };

  if (lang === "fr") {
    return {
      ...base,
      clarityLabel: "Où en êtes-vous maintenant ?",
      clarityQuestion:
        "Choisissez ce qui vous décrit le mieux pour que nous puissions adapter votre parcours sprint.",
      clarityChoices: [
        "J'ai une idée mais pas d'offre ni de direction claire",
        "J'ai une offre mais pas de site web ni de système derrière",
        "J'ai des éléments éparpillés mais rien de connecté",
        "Je suis prêt(e) à lancer mais j'ai besoin d'un accompagnement concret",
      ],
      miniCards: [
        { icon: "⚡", title: "48h", subtitle: "Votre système est en ligne" },
        { icon: "📆", title: "30 Jours", subtitle: "Jusqu'au premier client" },
        { icon: "🎯", title: "1 Objectif", subtitle: "Une destination claire" },
        { icon: "🛡️", title: "Garantie", subtitle: "Des résultats ou on continue" },
      ],
      painItems: [
        { icon: "🧠", title: "Trop d'idées, aucune prochaine étape claire", body: "Vous avez des directions potentielles mais aucun cadre pour choisir. Chaque option semble aussi possible que risquée, alors rien n'avance." },
        { icon: "💸", title: "Aucune certitude que les gens vont vraiment payer", body: "Vous n'avez pas validé si quelqu'un veut ce que vous construisez. Sans preuve de demande, il est difficile de s'engager pleinement dans une direction." },
        { icon: "🔄", title: "La réflexion excessive remplace l'action chaque jour", body: "Vous passez plus de temps à planifier, rechercher et douter qu'à construire. L'écart entre savoir et faire ne cesse de grandir." },
        { icon: "🧩", title: "Des outils éparpillés qui ne deviennent jamais un vrai business", body: "Vous avez une page ici, un formulaire là, peut-être quelques posts — mais rien n'est connecté en un système qui fonctionne vraiment." },
        { icon: "📚", title: "Des formations qui enseignent, mais ne vous aident jamais à lancer", body: "Vous avez consommé beaucoup de contenu. Ce qui vous manque, ce n'est pas plus d'information — c'est un chemin de lancement clair et un vrai accompagnement pendant que vous construisez." },
        { icon: "🤷", title: "Essayer de tout assembler seul(e)", body: "Vous n'avez pas besoin de plus de motivation. Vous avez besoin de structure, de soutien, et de quelqu'un qui construit à vos côtés et qui l'a déjà fait." },
      ],
      howIntro: "Voici le chemin exact que nous utilisons pour vous amener à votre premier client payant en 30 jours.",
      howSteps: [
        { number: "01", title: "\uD83D\uDCA5 Semaine 1 — Verrouillez votre première offre (que les gens vont vraiment payer)", body: "Arrêtez de deviner. Nous validons votre idée, définissons votre audience, et construisons une offre basée sur la vraie demande.", tag: "Vous repartez avec", checklist: ["Une offre claire", "Un acheteur défini", "La confiance que ça peut se vendre"] },
        { number: "02", title: "\u26A1 Semaine 2 — Passez en ligne en 48 heures", body: "Votre site web, votre message et votre système client sont en ligne — rapidement.", tag: "Vous repartez avec", checklist: ["Un site web fonctionnel", "Système de réservation prêt", "Système de suivi en place"] },
        { number: "03", title: "\uD83D\uDE80 Semaine 3 — Lancez de vraies conversations", body: "Fini l'attente. Vous commencez à parler à de vrais prospects avec des scripts éprouvés.", tag: "Vous repartez avec", checklist: ["Des messages de prospection qui obtiennent des réponses", "Vos premiers vrais leads", "Des conversations actives"] },
        { number: "04", title: "\uD83D\uDCB0 Semaine 4 — Décrochez votre premier client payant", body: "Nous affinons votre pitch et vous aidons à transformer les conversations en revenus.", tag: "Vous repartez avec", checklist: ["Votre premier client payant", "Un processus de vente reproductible", "Un vrai élan"], guarantee: "Si vous n\u2019atteignez pas ce point, nous continuons à travailler avec vous — gratuitement — jusqu\u2019à ce que vous y arriviez." },
      ],
      featuredBadge: "Le Sprint",
      featuredTitle: "Le Sprint Fondateur 30 Jours",
      featuredBody:
        "Un système de lancement de business clé en main. Une mise en place intégrée qui fonctionne vraiment — de l'idée au premier client, avec un accompagnement concret à chaque étape.",
      featuredCta: "Postuler au Sprint",
      featuredChecklist: [
        "Validation d'idée et direction marché",
        "Création d'offre construite autour de la vraie demande",
        "Site web et message construits avec vous",
        "Système de réservation et suivi client",
        "Outils IA configurés pour gagner du temps",
        "Feuille de route d'exécution sur 30 jours",
        "Accompagnement direct et feedback tout au long",
      ],
      services: [
        { id: "outreach_templates", title: "Scripts d'acquisition premier client", body: "Sachez exactement quoi dire. Des modèles de prospection et de suivi prêts à l'emploi dès le premier jour, conçus pour lancer de vraies conversations qui convertissent.", cta: "Inclus dans le Sprint" },
        { id: "automation_setup", title: "Support de mise en place d'automatisation", body: "Votre système continue de fonctionner même quand vous n'êtes pas en ligne. Nous configurons les outils IA et les automatisations qui vous font gagner des heures chaque semaine.", cta: "Inclus dans le Sprint" },
        { id: "commitment", title: "Notre engagement — Des résultats ou on continue", body: "Si vous complétez le sprint, suivez le plan et faites le travail — et que vous n'obtenez toujours pas votre premier client payant en 30 jours — nous continuons à travailler avec vous sans frais supplémentaires jusqu'à ce que ce soit le cas.", cta: "Pas de frais cachés. Pas de petits caractères." },
        { id: "why_different", title: "Pourquoi c'est différent", body: "Pas une formation. Pas un outil. Pas plus de théorie. Le Sprint est construit autour de l'exécution — un objectif clair, un accompagnement concret, et un système qui vous appartient quand c'est fini.", cta: "Un objectif : votre premier client payant" },
      ],
      testimonials: [
        { quote: "J'ai commencé avec des pensées éparpillées et aucun positionnement clair. À la fin du sprint, j'avais une offre validée, un public défini, et une direction que je pouvais expliquer avec confiance.", name: "D'une idée floue à une offre payante claire", role: "Résultat du sprint", initial: "1", color: "bg-[var(--landing-green-mid)]" },
        { quote: "Au lieu de simplement mettre une page en ligne, je suis reparti(e) avec un message, un flux de réservation, et des éléments de suivi qui soutiennent vraiment les conversions.", name: "De « j'ai besoin d'un site » à un vrai système de lancement", role: "Résultat du sprint", initial: "2", color: "bg-[var(--landing-green-light)]" },
        { quote: "J'ai arrêté d'attendre que tout soit parfait et j'ai commencé à avoir des conversations, envoyer des offres, et créer un élan autour de quelque chose de réel.", name: "De la réflexion excessive à la vraie prospection", role: "Résultat du sprint", initial: "3", color: "bg-[var(--landing-amber)] text-[var(--landing-ink)]" },
      ],
      signalStats: [
        { value: "48h", label: "Délai de lancement" },
        { value: "30", label: "Jours jusqu'au premier client" },
        { value: "1", label: "Une destination claire" },
      ],
      bookingTitle: "Postulez au prochain Sprint Fondateur 30 Jours",
      bookingFallback: "Choisissez un créneau qui vous convient",
    };
  }

  if (lang === "es") {
    return {
      ...base,
      clarityLabel: "¿Dónde estás ahora mismo?",
      clarityQuestion:
        "Elige lo que mejor te describe para que podamos adaptar tu camino en el sprint.",
      clarityChoices: [
        "Tengo una idea pero no tengo una oferta ni dirección clara",
        "Tengo una oferta pero no tengo sitio web ni sistema detrás",
        "Tengo piezas dispersas pero nada conectado",
        "Estoy listo/a para lanzar pero necesito apoyo práctico",
      ],
      miniCards: [
        { icon: "⚡", title: "48h", subtitle: "Tu sistema está activo" },
        { icon: "📆", title: "30 Días", subtitle: "Hasta el primer cliente" },
        { icon: "🎯", title: "1 Meta", subtitle: "Destino claro" },
        { icon: "🛡️", title: "Garantía", subtitle: "Resultados o seguimos trabajando" },
      ],
      painItems: [
        { icon: "🧠", title: "Demasiadas ideas, ningún próximo paso claro", body: "Tienes direcciones potenciales pero ningún marco para elegir. Cada opción parece igual de posible e igual de arriesgada, así que nada avanza." },
        { icon: "💸", title: "Sin confianza en que la gente realmente pague", body: "No has validado si alguien quiere lo que estás construyendo. Sin prueba de demanda, es difícil comprometerse completamente con una dirección." },
        { icon: "🔄", title: "Pensar de más reemplaza la ejecución cada día", body: "Pasas más tiempo planificando, investigando y dudando que construyendo. La brecha entre saber y hacer sigue creciendo." },
        { icon: "🧩", title: "Herramientas dispersas que nunca se convierten en un negocio real", body: "Tienes una landing page aquí, un formulario allá, quizás algunos posts — pero nada está conectado en un sistema que realmente funcione." },
        { icon: "📚", title: "Cursos que enseñan, pero nunca te ayudan a lanzar", body: "Has consumido mucho contenido. Lo que te falta no es más información — es un camino claro de lanzamiento y apoyo real mientras construyes." },
        { icon: "🤷", title: "Intentar armar todo solo/a", body: "No necesitas más motivación. Necesitas estructura, apoyo, y alguien que construya a tu lado y que ya lo haya hecho antes." },
      ],
      howIntro: "Este es el camino exacto que usamos para llevarte a tu primer cliente de pago en 30 días.",
      howSteps: [
        { number: "01", title: "\uD83D\uDCA5 Semana 1 — Fija tu primera oferta (por la que la gente realmente pagará)", body: "Deja de adivinar. Validamos tu idea, definimos tu audiencia, y construimos una oferta basada en demanda real.", tag: "Te vas con", checklist: ["Una oferta clara", "Un comprador definido", "Confianza en que puede venderse"] },
        { number: "02", title: "\u26A1 Semana 2 — Sal en línea en 48 horas", body: "Tu sitio web, tu mensaje y tu sistema de clientes salen en línea — rápido.", tag: "Te vas con", checklist: ["Un sitio web funcionando", "Sistema de reservas listo", "Sistema de seguimiento en marcha"] },
        { number: "03", title: "\uD83D\uDE80 Semana 3 — Inicia conversaciones reales", body: "No más esperas. Empiezas a hablar con prospectos reales usando scripts probados.", tag: "Te vas con", checklist: ["Mensajes de prospección que obtienen respuestas", "Tus primeros leads reales", "Conversaciones activas"] },
        { number: "04", title: "\uD83D\uDCB0 Semana 4 — Cierra tu primer cliente de pago", body: "Refinamos tu pitch y te ayudamos a convertir conversaciones en ingresos.", tag: "Te vas con", checklist: ["Tu primer cliente de pago", "Un proceso de ventas repetible", "Impulso real"], guarantee: "Si no llegas a este punto, seguimos trabajando contigo — gratis — hasta que lo logres." },
      ],
      featuredBadge: "El Sprint",
      featuredTitle: "El Sprint Fundador de 30 Días",
      featuredBody:
        "Un sistema de lanzamiento de negocio hecho contigo. Una configuración integrada que realmente funciona — de la idea al primer cliente, con apoyo práctico en cada paso.",
      featuredCta: "Aplica al Sprint",
      featuredChecklist: [
        "Validación de idea y dirección de mercado",
        "Creación de oferta basada en demanda real",
        "Sitio web y mensaje construidos contigo",
        "Sistema de reservas y seguimiento de clientes",
        "Herramientas de IA configuradas para ahorrar tiempo",
        "Hoja de ruta de ejecución de 30 días",
        "Apoyo directo y feedback en todo momento",
      ],
      services: [
        { id: "outreach_templates", title: "Scripts de adquisición de primer cliente", body: "Sabe exactamente qué decir. Plantillas de prospección y seguimiento listas para usar desde el día uno, diseñadas para iniciar conversaciones reales que convierten.", cta: "Incluido en el Sprint" },
        { id: "automation_setup", title: "Soporte de configuración de automatización", body: "Tu sistema sigue trabajando aunque no estés en línea. Configuramos las herramientas de IA y automatizaciones que te ahorran horas cada semana.", cta: "Incluido en el Sprint" },
        { id: "commitment", title: "Nuestro compromiso — Resultados o seguimos trabajando", body: "Si completas el sprint, sigues el plan y haces el trabajo — y aún no consigues tu primer cliente de pago en 30 días — seguimos trabajando contigo sin costo adicional hasta que lo logres.", cta: "Sin tarifas ocultas. Sin letra pequeña." },
        { id: "why_different", title: "Por qué esto es diferente", body: "No es un curso. No es una herramienta. No es más teoría. El Sprint está construido alrededor de la ejecución — una meta clara, apoyo práctico, y un sistema que es tuyo cuando termina.", cta: "Una meta: tu primer cliente de pago" },
      ],
      testimonials: [
        { quote: "Empecé con pensamientos dispersos y sin un posicionamiento claro. Al final del sprint, tenía una oferta validada, una audiencia definida, y una dirección que podía explicar con confianza.", name: "De idea confusa a oferta pagada clara", role: "Resultado del sprint", initial: "1", color: "bg-[var(--landing-green-mid)]" },
        { quote: "En lugar de solo poner una página en línea, salí con mensaje, flujo de reservas, y piezas de seguimiento que realmente apoyan las conversiones.", name: "De 'necesito un sitio web' a un sistema real de lanzamiento", role: "Resultado del sprint", initial: "2", color: "bg-[var(--landing-green-light)]" },
        { quote: "Dejé de esperar a que todo se sintiera perfecto y empecé a tener conversaciones, enviar ofertas, y construir impulso alrededor de algo real.", name: "De pensar de más a prospección real", role: "Resultado del sprint", initial: "3", color: "bg-[var(--landing-amber)] text-[var(--landing-ink)]" },
      ],
      signalStats: [
        { value: "48h", label: "Tiempo de lanzamiento" },
        { value: "30", label: "Días hasta el primer cliente" },
        { value: "1", label: "Destino claro" },
      ],
      bookingTitle: "Aplica al próximo Sprint Fundador de 30 Días",
      bookingFallback: "Elige un horario que te funcione",
    };
  }

  if (lang === "ht") {
    return {
      ...base,
      clarityLabel: "Ki kote ou ye kounye a?",
      clarityQuestion:
        "Chwazi sa ki dekri ou pi byen pou nou ka matche chemen sprint ou.",
      clarityChoices: [
        "Mwen gen yon lide men mwen pa gen yon òf klè ni direksyon",
        "Mwen gen yon òf men mwen pa gen sit wèb ni sistèm dèyè li",
        "Mwen gen moso gaye men anyen pa konekte",
        "Mwen pare pou lanse men mwen bezwen sipò konkrè",
      ],
      miniCards: [
        { icon: "⚡", title: "48h", subtitle: "Sistèm ou an liy" },
        { icon: "📆", title: "30 Jou", subtitle: "Rive nan premye kliyan" },
        { icon: "🎯", title: "1 Objektif", subtitle: "Destinasyon klè" },
        { icon: "🛡️", title: "Garanti", subtitle: "Rezilta oswa nou kontinye" },
      ],
      painItems: [
        { icon: "🧠", title: "Twòp lide, okenn pwochen etap klè", body: "Ou gen direksyon posib men ou pa gen yon kad pou chwazi. Chak opsyon sanble egal posib e egal riske, kidonk anyen pa avanse." },
        { icon: "💸", title: "Okenn konfyans ke moun ap reyèlman peye", body: "Ou pa t valide si yon moun vle sa ou ap bati. San prèv demand, li difisil pou angaje tout fòs ou nan yon direksyon." },
        { icon: "🔄", title: "Reflechi twòp ranplase aksyon chak jou", body: "Ou pase plis tan ap planifye, chèche, ak doute pase bati. Distans ant konnen ak fè a ap grandi toujou." },
        { icon: "🧩", title: "Zouti gaye ki pa janm tounen yon vrè biznis", body: "Ou gen yon paj isit, yon fòmilè la, petèt kèk pòs — men anyen pa konekte nan yon sistèm ki reyèlman mache." },
        { icon: "📚", title: "Fòmasyon ki anseye, men ki pa janm ede ou lanse", body: "Ou te konsome anpil kontni. Sa ki manke ou se pa plis enfòmasyon — se yon chemen lansman klè ak vrè sipò pandan ou ap bati." },
        { icon: "🤷", title: "Eseye rasanble tout bagay poukont ou", body: "Ou pa bezwen plis motivasyon. Ou bezwen estrikti, sipò, ak yon moun k ap bati bò kote ou ki te deja fè sa anvan." },
      ],
      howIntro: "Sa a se chemen egzak nou itilize pou mennen ou nan premye kliyan peyan ou nan 30 jou.",
      howSteps: [
        { number: "01", title: "\uD83D\uDCA5 Semèn 1 — Fikse premye òf ou (ke moun ap reyèlman peye pou li)", body: "Sispann devine. Nou valide lide ou, defini odyans ou, epi bati yon òf ki baze sou vrè demand.", tag: "Ou soti ak", checklist: ["Yon òf klè", "Yon achetè defini", "Konfyans ke li ka vann"] },
        { number: "02", title: "\u26A1 Semèn 2 — Ale an liy nan 48 èdtan", body: "Sit wèb ou, mesaj ou, ak sistèm kliyan ou ale an liy — vit.", tag: "Ou soti ak", checklist: ["Yon sit wèb ki mache", "Sistèm rezèvasyon pare", "Sistèm swivi an plas"] },
        { number: "03", title: "\uD83D\uDE80 Semèn 3 — Kòmanse vrè konvèsasyon", body: "Pa tann ankò. Ou kòmanse pale ak vrè prospèk ak script ki pwouve yo mache.", tag: "Ou soti ak", checklist: ["Mesaj pwospeksyon ki jwenn repons", "Premye vrè lead yo", "Konvèsasyon aktif"] },
        { number: "04", title: "\uD83D\uDCB0 Semèn 4 — Fèmen premye kliyan peyan ou", body: "Nou rafine pitch ou epi ede ou transfòme konvèsasyon an revni.", tag: "Ou soti ak", checklist: ["Premye kliyan peyan ou", "Yon pwosesis lavant ou ka repete", "Vrè elan"], guarantee: "Si ou pa rive nan pwen sa a, nou kontinye travay avèk ou — gratis — jiskaske ou rive." },
      ],
      featuredBadge: "Sprint la",
      featuredTitle: "Sprint Fondatè 30 Jou a",
      featuredBody:
        "Yon sistèm lansman biznis fèt avèk ou. Yon sèl konfigirasyon entegre ki reyèlman mache — depi lide rive nan premye kliyan, ak sipò konkrè nan chak etap.",
      featuredCta: "Aplike pou Sprint la",
      featuredChecklist: [
        "Validasyon lide ak direksyon mache",
        "Kreyasyon òf ki bati sou vrè demand",
        "Sit wèb ak mesaj bati avèk ou",
        "Sistèm rezèvasyon ak swivi kliyan",
        "Zouti IA konfigire pou ekonomize tan",
        "Fèy wout egzekisyon 30 jou",
        "Sipò dirèk ak feedback tout long",
      ],
      services: [
        { id: "outreach_templates", title: "Script akizisyon premye kliyan", body: "Konnen egzakteman sa pou di. Modèl pwospeksyon ak swivi ki pare pou itilize depi premye jou, ki fèt pou kòmanse vrè konvèsasyon ki konvèti.", cta: "Enkli nan Sprint la" },
        { id: "automation_setup", title: "Sipò konfigirasyon otomatizasyon", body: "Sistèm ou a kontinye travay menm lè ou pa an liy. Nou konfigire zouti IA ak otomatizasyon ki fè ou ekonomize plizyè èdtan chak semèn.", cta: "Enkli nan Sprint la" },
        { id: "commitment", title: "Angajman nou — Rezilta oswa nou kontinye travay", body: "Si ou konplete sprint la, swiv plan an, epi fè travay la — epi ou toujou pa jwenn premye kliyan peyan ou nan 30 jou — nou kontinye travay avèk ou san frè siplemantè jiskaske ou jwenn.", cta: "Pa gen frè kache. Pa gen ti lèt." },
        { id: "why_different", title: "Poukisa sa diferan", body: "Se pa yon kou. Se pa yon zouti. Se pa plis teyori. Sprint la bati sou egzekisyon — yon sèl objektif klè, sipò konkrè, ak yon sistèm ki pou ou lè li fini.", cta: "Yon objektif: premye kliyan peyan ou" },
      ],
      testimonials: [
        { quote: "Mwen te kòmanse ak panse gaye e okenn pozisyonman klè. Nan fen sprint la, mwen te gen yon òf valide, yon odyans defini, ak yon direksyon mwen te ka eksplike ak konfyans.", name: "Soti nan lide pa klè rive nan yon òf peyan klè", role: "Rezilta sprint", initial: "1", color: "bg-[var(--landing-green-mid)]" },
        { quote: "Olye mwen te jis mete yon paj an liy, mwen te soti ak mesaj, fliks rezèvasyon, ak moso swivi ki reyèlman sipòte konvèsyon.", name: "Soti nan 'mwen bezwen yon sit wèb' rive nan yon vrè sistèm lansman", role: "Rezilta sprint", initial: "2", color: "bg-[var(--landing-green-light)]" },
        { quote: "Mwen te sispann tann pou tout bagay santi li pafè epi mwen te kòmanse gen konvèsasyon, voye òf, epi bati elan sou yon bagay reyèl.", name: "Soti nan reflechi twòp rive nan vrè pwospeksyon", role: "Rezilta sprint", initial: "3", color: "bg-[var(--landing-amber)] text-[var(--landing-ink)]" },
      ],
      signalStats: [
        { value: "48h", label: "Tan pou lanse" },
        { value: "30", label: "Jou rive nan premye kliyan" },
        { value: "1", label: "Destinasyon klè" },
      ],
      bookingTitle: "Aplike pou pwochen Sprint Fondatè 30 Jou a",
      bookingFallback: "Chwazi yon lè ki bon pou ou",
    };
  }

  if (lang === "pt") {
    return {
      ...base,
      clarityLabel: "Onde você está agora?",
      clarityQuestion:
        "Escolha o que melhor te descreve para que possamos adaptar seu caminho no sprint.",
      clarityChoices: [
        "Tenho uma ideia mas nenhuma oferta ou direção clara",
        "Tenho uma oferta mas nenhum site ou sistema por trás",
        "Tenho peças espalhadas mas nada conectado",
        "Estou pronto/a para lançar mas preciso de apoio prático",
      ],
      miniCards: [
        { icon: "⚡", title: "48h", subtitle: "Seu sistema está no ar" },
        { icon: "📆", title: "30 Dias", subtitle: "Até o primeiro cliente" },
        { icon: "🎯", title: "1 Meta", subtitle: "Destino claro" },
        { icon: "🛡️", title: "Garantia", subtitle: "Resultados ou continuamos" },
      ],
      painItems: [
        { icon: "🧠", title: "Muitas ideias, nenhum próximo passo claro", body: "Você tem direções potenciais mas nenhum framework para escolher. Cada opção parece igualmente possível e arriscada, então nada avança." },
        { icon: "💸", title: "Sem confiança de que as pessoas vão realmente pagar", body: "Você não validou se alguém quer o que está construindo. Sem prova de demanda, é difícil se comprometer totalmente com uma direção." },
        { icon: "🔄", title: "Pensar demais substituindo a execução todo dia", body: "Você passa mais tempo planejando, pesquisando e questionando do que construindo. A distância entre saber e fazer só cresce." },
        { icon: "🧩", title: "Ferramentas espalhadas que nunca viram um negócio real", body: "Você tem uma landing page aqui, um formulário ali, talvez alguns posts — mas nada está conectado em um sistema que realmente funciona." },
        { icon: "📚", title: "Cursos que ensinam, mas nunca ajudam a lançar", body: "Você já consumiu bastante conteúdo. O que falta não é mais informação — é um caminho claro de lançamento e apoio real enquanto você constrói." },
        { icon: "🤷", title: "Tentando montar tudo sozinho/a", body: "Você não precisa de mais motivação. Precisa de estrutura, apoio e alguém construindo ao seu lado que já fez isso antes." },
      ],
      howIntro: "Este é o caminho exato que usamos para levar você ao seu primeiro cliente pagante em 30 dias.",
      howSteps: [
        { number: "01", title: "\uD83D\uDCA5 Semana 1 — Defina sua primeira oferta (pela qual as pessoas vão realmente pagar)", body: "Pare de adivinhar. Validamos sua ideia, definimos seu público, e construímos uma oferta baseada em demanda real.", tag: "Você sai com", checklist: ["Uma oferta clara", "Um comprador definido", "Confiança de que pode vender"] },
        { number: "02", title: "\u26A1 Semana 2 — Fique no ar em 48 horas", body: "Seu site, sua mensagem e seu sistema de clientes ficam no ar — rápido.", tag: "Você sai com", checklist: ["Um site funcionando", "Sistema de agendamento pronto", "Sistema de acompanhamento ativo"] },
        { number: "03", title: "\uD83D\uDE80 Semana 3 — Inicie conversas reais", body: "Chega de esperar. Você começa a falar com prospects reais usando scripts comprovados.", tag: "Você sai com", checklist: ["Mensagens de prospecção que geram respostas", "Seus primeiros leads reais", "Conversas ativas"] },
        { number: "04", title: "\uD83D\uDCB0 Semana 4 — Feche seu primeiro cliente pagante", body: "Refinamos seu pitch e ajudamos você a transformar conversas em receita.", tag: "Você sai com", checklist: ["Seu primeiro cliente pagante", "Um processo de vendas repetível", "Impulso real"], guarantee: "Se você não chegar a esse ponto, continuamos trabalhando com você — de graça — até que consiga." },
      ],
      featuredBadge: "O Sprint",
      featuredTitle: "O Sprint Fundador de 30 Dias",
      featuredBody:
        "Um sistema de lançamento de negócio feito com você. Uma configuração integrada que realmente funciona — da ideia ao primeiro cliente, com apoio prático em cada etapa.",
      featuredCta: "Candidate-se ao Sprint",
      featuredChecklist: [
        "Validação de ideia e direção de mercado",
        "Criação de oferta baseada em demanda real",
        "Site e mensagem construídos com você",
        "Sistema de agendamento e acompanhamento de clientes",
        "Ferramentas de IA configuradas para economizar tempo",
        "Roteiro de execução de 30 dias",
        "Apoio direto e feedback ao longo de todo o processo",
      ],
      services: [
        { id: "outreach_templates", title: "Scripts de aquisição do primeiro cliente", body: "Saiba exatamente o que dizer. Templates de prospecção e acompanhamento prontos para usar desde o primeiro dia, feitos para iniciar conversas reais que convertem.", cta: "Incluído no Sprint" },
        { id: "automation_setup", title: "Suporte de configuração de automação", body: "Seu sistema continua funcionando mesmo quando você não está online. Configuramos as ferramentas de IA e automações que economizam horas toda semana.", cta: "Incluído no Sprint" },
        { id: "commitment", title: "Nosso compromisso — Resultados ou continuamos trabalhando", body: "Se você completar o sprint, seguir o plano e fizer o trabalho — e ainda não conseguir seu primeiro cliente pagante em 30 dias — continuamos trabalhando com você sem custo adicional até conseguir.", cta: "Sem taxas ocultas. Sem letras miúdas." },
        { id: "why_different", title: "Por que isso é diferente", body: "Não é um curso. Não é uma ferramenta. Não é mais teoria. O Sprint é construído em torno da execução — uma meta clara, apoio prático, e um sistema que é seu quando terminar.", cta: "Uma meta: seu primeiro cliente pagante" },
      ],
      testimonials: [
        { quote: "Comecei com pensamentos dispersos e nenhum posicionamento claro. No final do sprint, eu tinha uma oferta validada, um público definido, e uma direção que conseguia explicar com confiança.", name: "De ideia confusa a oferta paga clara", role: "Resultado do sprint", initial: "1", color: "bg-[var(--landing-green-mid)]" },
        { quote: "Em vez de apenas colocar uma página no ar, saí com mensagem, fluxo de agendamento, e peças de acompanhamento que realmente apoiam conversões.", name: "De 'preciso de um site' a um sistema real de lançamento", role: "Resultado do sprint", initial: "2", color: "bg-[var(--landing-green-light)]" },
        { quote: "Parei de esperar tudo ficar perfeito e comecei a ter conversas, enviar ofertas, e construir impulso em torno de algo real.", name: "De pensar demais a prospecção real", role: "Resultado do sprint", initial: "3", color: "bg-[var(--landing-amber)] text-[var(--landing-ink)]" },
      ],
      signalStats: [
        { value: "48h", label: "Tempo para lançar" },
        { value: "30", label: "Dias até o primeiro cliente" },
        { value: "1", label: "Destino claro" },
      ],
      bookingTitle: "Candidate-se ao próximo Sprint Fundador de 30 Dias",
      bookingFallback: "Escolha um horário que funcione para você",
    };
  }

  return base;
}
