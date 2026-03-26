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
    clarityLabel: "Your Clarity Session",
    clarityQuestion:
      "What is the hardest part of starting your business right now?",
    clarityChoices: [
      "I have ideas but do not know where to start",
      "I need a website that actually converts",
      "I am drowning in follow-ups and admin",
      "I do not know how to use AI in my business",
    ],

    /* ── Mini cards ───────────────────────────────── */
    miniCards: [
      { icon: "⚡", title: "Idea → Validation", subtitle: "30-Day Sprint" },
      { icon: "🌐", title: "Website Built", subtitle: "That matches your offer" },
      { icon: "🤖", title: "AI Workflows", subtitle: "Set up for your work" },
      { icon: "📬", title: "Follow-Up Systems", subtitle: "On autopilot" },
    ],

    /* ── Pain items ───────────────────────────────── */
    painItems: [
      {
        icon: "🧠",
        title: "Too many ideas, no clear path",
        body: "You know you want to build something, but every direction feels equally possible and equally risky. You need a framework to pick the right one first.",
      },
      {
        icon: "🌐",
        title: "Your website does not match who you are",
        body: "Your business has evolved, but your site still reflects an older version of the offer, or you have not launched because you are not sure what it should say.",
      },
      {
        icon: "📩",
        title: "Follow-ups fall through the cracks",
        body: "Leads go cold because there is no system. Conversations live across inboxes, DMs, and notes, and too much gets missed.",
      },
      {
        icon: "🤖",
        title: "Everyone is using AI, but how?",
        body: "You know AI can help your business, but you do not know where to start or which tools are worth your time.",
      },
      {
        icon: "📅",
        title: "No booking system, no structure",
        body: "Clients have to chase you, or you have to chase them, just to schedule. A simple booking workflow would save hours every week.",
      },
      {
        icon: "🗺️",
        title: "Everything feels equally urgent",
        body: "Marketing, product, sales, and operations all need attention. Without a roadmap, energy gets spent on the wrong next move.",
      },
    ],

    /* ── How steps ────────────────────────────────── */
    howSteps: [
      {
        number: "01",
        title: "Discovery Call — Diagnose the real bottleneck",
        body: "We start with a focused 30-minute call. Not a sales pitch, a real audit of where you are, what is blocking you, and what the highest-leverage move is right now.",
        tag: "Free · 30 minutes",
      },
      {
        number: "02",
        title: "Custom Action Plan — Your exact next steps",
        body: "You get a prioritized roadmap matched to your situation: validating your idea, rebuilding your website messaging, setting up an AI workflow, or all three.",
        tag: "Delivered within 48 hrs",
      },
      {
        number: "03",
        title: "Build Together — We execute with you",
        body: "Depending on your plan, we either hand you tools and templates to run independently, or we build alongside you: website, automation, workflow, or all of the above.",
        tag: "Pilot packages starting at $0 (beta)",
      },
      {
        number: "04",
        title: "Proof + Momentum — Feedback, case study, repeat",
        body: "Early founders in the pilot get direct feedback loops and visible progress. Your results become signal for what scales next.",
        tag: "Founding cohort benefits",
      },
    ],

    /* ── Featured service ─────────────────────────── */
    featuredBadge: "Most Requested",
    featuredTitle: "Idea Validation Sprint",
    featuredBody:
      "You have a business idea, or five. In a focused sprint, we pressure-test the strongest one: who it is really for, whether they will pay, and how to position it with clarity.",
    featuredCta: "Start my sprint",
    featuredChecklist: [
      "Market fit diagnostic",
      "Ideal customer profile",
      "Positioning statement",
      "First-offer recommendation",
      "30-day traction plan",
    ],

    /* ── Services ─────────────────────────────────── */
    services: [
      {
        id: "website_messaging_refresh",
        title: "Website Build & Messaging Refresh",
        body: "Whether you need your first site or your current one no longer reflects your offer, we build pages that say the right thing to the right person.",
        cta: "Rebuild my site",
      },
      {
        id: "ai_workflow_setup",
        title: "AI Workflow Setup",
        body: "From follow-up drafting to onboarding automation, we map your biggest time drains and set up AI tools that actually fit how you work.",
        cta: "Automate my workflow",
      },
      {
        id: "booking_follow_up_system",
        title: "Booking & Follow-Up System",
        body: "A professional booking flow, automated reminders, and a follow-up sequence so leads do not go cold.",
        cta: "Set up my system",
      },
      {
        id: "ai_onboarding",
        title: "AI Onboarding for Brand Owners",
        body: "Not sure which AI apps are useful for your business? We walk you through the tools, set up what fits, and give you templates to move fast.",
        cta: "Learn what AI can do",
      },
    ],

    /* ── Testimonials ─────────────────────────────── */
    testimonials: [
      {
        quote: "I have so many business ideas but I genuinely did not know how to start. Getting an actual action plan changed everything.",
        name: "Doha",
        role: "First-time founder, pilot cohort",
        initial: "D",
        color: "bg-[var(--landing-green-mid)]",
      },
      {
        quote: "My site had not reflected my real offer in over a year. Within a week we had a new page that actually matched what I do.",
        name: "Rembert",
        role: "Creative services founder",
        initial: "R",
        color: "bg-[var(--landing-green-light)]",
      },
      {
        quote: "I needed a booking site and did not know who to trust. BizSproutAI built exactly what I needed, no fluff, just the right thing.",
        name: "Liv",
        role: "Service business owner",
        initial: "L",
        color: "bg-[var(--landing-amber)] text-[var(--landing-ink)]",
      },
    ],

    /* ── Signal strip ─────────────────────────────── */
    signalStats: [
      { value: "309", label: "Organic impressions, no ads" },
      { value: "5+", label: "High-intent leads in 30 days" },
      { value: "Mar '26", label: "Pilot cohort open now" },
    ],

    /* ── Booking ──────────────────────────────────── */
    bookingTitle: "Book your free Founder Clarity Session",
    bookingFallback: "Pick a time that works for you",
  };

  if (lang === "fr") {
    return {
      ...base,
      clarityLabel: "Votre session de clarté",
      clarityQuestion: "Quel est le plus grand défi pour lancer votre business en ce moment ?",
      clarityChoices: [
        "J'ai des idées mais je ne sais pas par où commencer",
        "J'ai besoin d'un site qui convertit vraiment",
        "Je me noie dans les suivis et l'administratif",
        "Je ne sais pas comment utiliser l'IA dans mon business",
      ],
      miniCards: [
        { icon: "⚡", title: "Idée → Validation", subtitle: "Sprint 30 jours" },
        { icon: "🌐", title: "Site web construit", subtitle: "Qui reflète votre offre" },
        { icon: "🤖", title: "Workflows IA", subtitle: "Configurés pour vous" },
        { icon: "📬", title: "Systèmes de suivi", subtitle: "En autopilote" },
      ],
      painItems: [
        { icon: "🧠", title: "Trop d'idées, aucun chemin clair", body: "Vous savez que vous voulez créer quelque chose, mais chaque direction semble aussi possible que risquée. Vous avez besoin d'un cadre pour choisir la bonne en premier." },
        { icon: "🌐", title: "Votre site ne reflète plus qui vous êtes", body: "Votre activité a évolué, mais votre site montre encore l'ancienne version. Ou vous n'avez pas encore lancé parce que vous ne savez pas quoi dire." },
        { icon: "📩", title: "Les suivis passent entre les mailles", body: "Les prospects refroidissent parce qu'il n'y a pas de système. Les conversations sont dispersées entre boîtes mail, DMs et notes." },
        { icon: "🤖", title: "Tout le monde utilise l'IA, mais comment ?", body: "Vous savez que l'IA peut aider votre business, mais vous ne savez pas par où commencer ni quels outils valent le coup." },
        { icon: "📅", title: "Pas de système de réservation, pas de structure", body: "Les clients doivent vous courir après ou l'inverse, juste pour planifier. Un simple workflow de réservation vous ferait gagner des heures." },
        { icon: "🗺️", title: "Tout semble aussi urgent", body: "Marketing, produit, ventes, opérations : tout demande de l'attention. Sans feuille de route, l'énergie est gaspillée." },
      ],
      howSteps: [
        { number: "01", title: "Appel découverte — Identifier le vrai blocage", body: "Nous commençons par un appel ciblé de 30 minutes. Pas de pitch commercial, un vrai audit de votre situation et de la prochaine action à fort impact.", tag: "Gratuit · 30 minutes" },
        { number: "02", title: "Plan d'action personnalisé — Vos prochaines étapes exactes", body: "Vous recevez une feuille de route priorisée : valider votre idée, refondre votre site, mettre en place un workflow IA, ou les trois.", tag: "Livré sous 48h" },
        { number: "03", title: "Construire ensemble — On avance avec vous", body: "Selon votre plan, nous vous fournissons outils et modèles pour avancer seul, ou nous construisons à vos côtés.", tag: "Offres pilotes à partir de 0 $ (bêta)" },
        { number: "04", title: "Résultats + Élan — Feedback, étude de cas, itération", body: "Les fondateurs du pilote bénéficient de boucles de feedback directes. Vos résultats deviennent le signal qui aide à affiner ce qui fonctionne.", tag: "Avantages cohorte fondatrice" },
      ],
      featuredBadge: "Le plus demandé",
      featuredTitle: "Sprint de validation d'idée",
      featuredBody: "Vous avez une idée de business, ou cinq. En un sprint ciblé, nous testons la plus forte : pour qui elle est vraiment, s'ils vont payer, et comment la positionner clairement.",
      featuredCta: "Lancer mon sprint",
      featuredChecklist: [
        "Diagnostic d'adéquation marché",
        "Profil client idéal",
        "Positionnement",
        "Recommandation première offre",
        "Plan de traction 30 jours",
      ],
      services: [
        { id: "website_messaging_refresh", title: "Site web & Refonte du message", body: "Que vous ayez besoin de votre premier site ou que l'actuel ne reflète plus votre offre, nous créons des pages qui parlent à la bonne personne.", cta: "Refondre mon site" },
        { id: "ai_workflow_setup", title: "Configuration workflows IA", body: "Du brouillon de suivi à l'automatisation d'onboarding, nous identifions vos plus gros gaspillages de temps et mettons en place les bons outils IA.", cta: "Automatiser mon workflow" },
        { id: "booking_follow_up_system", title: "Système de réservation & suivi", body: "Un flux de réservation professionnel, des rappels automatiques et une séquence de suivi pour que les prospects ne refroidissent pas.", cta: "Mettre en place mon système" },
        { id: "ai_onboarding", title: "Formation IA pour entrepreneurs", body: "Pas sûr quelles applis IA sont utiles ? Nous vous guidons, configurons ce qui convient et vous donnons des modèles pour démarrer vite.", cta: "Découvrir ce que l'IA peut faire" },
      ],
      testimonials: [
        { quote: "J'avais tellement d'idées de business mais je ne savais vraiment pas par où commencer. Avoir un vrai plan d'action a tout changé.", name: "Doha", role: "Fondatrice débutante, cohorte pilote", initial: "D", color: "bg-[var(--landing-green-mid)]" },
        { quote: "Mon site ne reflétait plus mon offre réelle depuis plus d'un an. En une semaine, j'avais une nouvelle page qui correspondait à ce que je fais.", name: "Rembert", role: "Fondateur services créatifs", initial: "R", color: "bg-[var(--landing-green-light)]" },
        { quote: "J'avais besoin d'un site de réservation et je ne savais pas à qui faire confiance. BizSproutAI a construit exactement ce qu'il me fallait.", name: "Liv", role: "Propriétaire d'entreprise de services", initial: "L", color: "bg-[var(--landing-amber)] text-[var(--landing-ink)]" },
      ],
      signalStats: [
        { value: "309", label: "Impressions organiques, sans pub" },
        { value: "5+", label: "Leads qualifiés en 30 jours" },
        { value: "Mar '26", label: "Cohorte pilote ouverte" },
      ],
      bookingTitle: "Réservez votre session de clarté fondateur gratuite",
      bookingFallback: "Choisissez un créneau qui vous convient",
    };
  }

  if (lang === "es") {
    return {
      ...base,
      clarityLabel: "Tu sesión de claridad",
      clarityQuestion: "¿Cuál es la parte más difícil de empezar tu negocio ahora mismo?",
      clarityChoices: [
        "Tengo ideas pero no sé por dónde empezar",
        "Necesito un sitio web que realmente convierta",
        "Me ahogo en seguimientos y tareas administrativas",
        "No sé cómo usar la IA en mi negocio",
      ],
      miniCards: [
        { icon: "⚡", title: "Idea → Validación", subtitle: "Sprint 30 días" },
        { icon: "🌐", title: "Sitio web creado", subtitle: "Que refleje tu oferta" },
        { icon: "🤖", title: "Workflows de IA", subtitle: "Configurados para ti" },
        { icon: "📬", title: "Sistemas de seguimiento", subtitle: "En autopiloto" },
      ],
      painItems: [
        { icon: "🧠", title: "Demasiadas ideas, ningún camino claro", body: "Sabes que quieres construir algo, pero cada dirección parece igual de posible e igual de arriesgada." },
        { icon: "🌐", title: "Tu sitio web no refleja quién eres", body: "Tu negocio ha evolucionado, pero tu sitio aún muestra la versión anterior. O no has lanzado porque no sabes qué decir." },
        { icon: "📩", title: "Los seguimientos se pierden", body: "Los prospectos se enfrían porque no hay sistema. Las conversaciones están dispersas entre emails, DMs y notas." },
        { icon: "🤖", title: "Todos usan IA, ¿pero cómo?", body: "Sabes que la IA puede ayudar tu negocio, pero no sabes por dónde empezar ni qué herramientas valen la pena." },
        { icon: "📅", title: "Sin sistema de reservas, sin estructura", body: "Los clientes tienen que perseguirte, o tú a ellos, solo para agendar. Un flujo de reservas te ahorraría horas." },
        { icon: "🗺️", title: "Todo parece igual de urgente", body: "Marketing, producto, ventas y operaciones necesitan atención. Sin hoja de ruta, la energía se gasta en lo incorrecto." },
      ],
      howSteps: [
        { number: "01", title: "Llamada de descubrimiento — Diagnosticar el verdadero bloqueo", body: "Comenzamos con una llamada enfocada de 30 minutos. No es un pitch de ventas, es una auditoría real de tu situación.", tag: "Gratis · 30 minutos" },
        { number: "02", title: "Plan de acción personalizado — Tus próximos pasos exactos", body: "Recibes una hoja de ruta priorizada: validar tu idea, rediseñar tu sitio web, configurar un workflow de IA, o las tres cosas.", tag: "Entregado en 48h" },
        { number: "03", title: "Construir juntos — Ejecutamos contigo", body: "Según tu plan, te entregamos herramientas y plantillas para avanzar solo, o construimos a tu lado.", tag: "Paquetes piloto desde $0 (beta)" },
        { number: "04", title: "Resultados + Impulso — Feedback, caso de estudio, repetir", body: "Los fundadores del piloto obtienen bucles de feedback directos. Tus resultados se convierten en señal para lo que escala.", tag: "Beneficios cohorte fundadora" },
      ],
      featuredBadge: "Más solicitado",
      featuredTitle: "Sprint de validación de idea",
      featuredBody: "Tienes una idea de negocio, o cinco. En un sprint enfocado, ponemos a prueba la más fuerte: para quién es, si pagarán, y cómo posicionarla.",
      featuredCta: "Empezar mi sprint",
      featuredChecklist: [
        "Diagnóstico de ajuste al mercado",
        "Perfil de cliente ideal",
        "Declaración de posicionamiento",
        "Recomendación de primera oferta",
        "Plan de tracción de 30 días",
      ],
      services: [
        { id: "website_messaging_refresh", title: "Sitio web y renovación del mensaje", body: "Ya sea que necesites tu primer sitio o el actual ya no refleje tu oferta, creamos páginas que dicen lo correcto a la persona correcta.", cta: "Rediseñar mi sitio" },
        { id: "ai_workflow_setup", title: "Configuración de workflow de IA", body: "Desde seguimientos hasta automatización de onboarding, identificamos tus mayores pérdidas de tiempo y configuramos herramientas de IA.", cta: "Automatizar mi workflow" },
        { id: "booking_follow_up_system", title: "Sistema de reservas y seguimiento", body: "Un flujo de reservas profesional, recordatorios automáticos y una secuencia de seguimiento para que los prospectos no se enfríen.", cta: "Configurar mi sistema" },
        { id: "ai_onboarding", title: "Onboarding de IA para emprendedores", body: "¿No estás seguro qué apps de IA son útiles? Te guiamos, configuramos lo que encaje y te damos plantillas para arrancar rápido.", cta: "Descubrir qué puede hacer la IA" },
      ],
      testimonials: [
        { quote: "Tenía tantas ideas de negocio pero genuinamente no sabía cómo empezar. Tener un plan de acción real lo cambió todo.", name: "Doha", role: "Fundadora primeriza, cohorte piloto", initial: "D", color: "bg-[var(--landing-green-mid)]" },
        { quote: "Mi sitio no reflejaba mi oferta real desde hacía más de un año. En una semana tenía una nueva página que realmente correspondía a lo que hago.", name: "Rembert", role: "Fundador de servicios creativos", initial: "R", color: "bg-[var(--landing-green-light)]" },
        { quote: "Necesitaba un sitio de reservas y no sabía en quién confiar. BizSproutAI construyó exactamente lo que necesitaba.", name: "Liv", role: "Dueña de negocio de servicios", initial: "L", color: "bg-[var(--landing-amber)] text-[var(--landing-ink)]" },
      ],
      signalStats: [
        { value: "309", label: "Impresiones orgánicas, sin anuncios" },
        { value: "5+", label: "Leads de alta intención en 30 días" },
        { value: "Mar '26", label: "Cohorte piloto abierta" },
      ],
      bookingTitle: "Reserva tu sesión de claridad fundador gratuita",
      bookingFallback: "Elige un horario que te funcione",
    };
  }

  if (lang === "ht") {
    return {
      ...base,
      clarityLabel: "Sesyon klète ou a",
      clarityQuestion: "Ki pati ki pi difisil pou kòmanse biznis ou kounye a?",
      clarityChoices: [
        "Mwen gen lide men mwen pa konnen ki kote pou kòmanse",
        "Mwen bezwen yon sit wèb ki reyèlman konvèti",
        "Mwen nwaye nan swivi ak administrasyon",
        "Mwen pa konnen kijan pou itilize IA nan biznis mwen",
      ],
      miniCards: [
        { icon: "⚡", title: "Lide → Validasyon", subtitle: "Sprint 30 jou" },
        { icon: "🌐", title: "Sit wèb bati", subtitle: "Ki matche ak òf ou" },
        { icon: "🤖", title: "Workflow IA", subtitle: "Konfigire pou travay ou" },
        { icon: "📬", title: "Sistèm swivi", subtitle: "Otomatik" },
      ],
      painItems: [
        { icon: "🧠", title: "Twòp lide, okenn chemen klè", body: "Ou konnen ou vle bati yon bagay, men chak direksyon sanble egal posib e egal riske." },
        { icon: "🌐", title: "Sit wèb ou pa reflete kiyès ou ye", body: "Biznis ou te evolye, men sit ou toujou montre ansyen vèsyon an." },
        { icon: "📩", title: "Swivi yo tonbe nan mitan fant yo", body: "Prospèk yo frèt paske pa gen sistèm. Konvèsasyon yo gaye nan bwat postal, DM, ak nòt." },
        { icon: "🤖", title: "Tout moun ap itilize IA, men kijan?", body: "Ou konnen IA ka ede biznis ou, men ou pa konnen ki kote pou kòmanse." },
        { icon: "📅", title: "Pa gen sistèm rezèvasyon, pa gen estrikti", body: "Kliyan yo oblije kouri dèyè ou pou planifye. Yon senp workflow rezèvasyon ta ka fè ou ekonomize plizyè èdtan." },
        { icon: "🗺️", title: "Tout bagay sanble egal ijan", body: "Maketing, pwodwi, lavant, ak operasyon tout bezwen atansyon. San yon fèy wout, enèji gaspiye." },
      ],
      howSteps: [
        { number: "01", title: "Apèl dekouvèt — Dyagnostike vrè blokaj la", body: "Nou kòmanse ak yon apèl 30 minit ki konsantre. Se pa yon pitch lavant, se yon odit reyèl.", tag: "Gratis · 30 minit" },
        { number: "02", title: "Plan aksyon pèsonalize — Pwochen etap egzak ou yo", body: "Ou resevwa yon fèy wout priyoritè: valide lide ou, rebati sit wèb ou, mete kanpe yon workflow IA, oswa twa yo.", tag: "Livré nan 48è" },
        { number: "03", title: "Bati ansanm — Nou egzekite avèk ou", body: "Selon plan ou, nou ba ou zouti ak modèl pou avanse poukont ou, oswa nou bati bò kote ou.", tag: "Pakè pilot apati de $0 (beta)" },
        { number: "04", title: "Rezilta + Élan — Feedback, etid ka, repete", body: "Fondatè nan pilot la jwenn bouk feedback dirèk. Rezilta ou yo tounen siyal pou sa ki mache.", tag: "Avantaj gwoup fondatè" },
      ],
      featuredBadge: "Plis mande",
      featuredTitle: "Sprint validasyon lide",
      featuredBody: "Ou gen yon lide biznis, oswa senk. Nan yon sprint konsantre, nou teste pi fò a: pou kiyès li ye vrèman, èske yo pral peye, epi kijan pou pozisyone li.",
      featuredCta: "Kòmanse sprint mwen",
      featuredChecklist: [
        "Dyagnostik adekasyon mache",
        "Pwofil kliyan ideyal",
        "Deklarasyon pozisyonman",
        "Rekòmandasyon premye òf",
        "Plan traksyon 30 jou",
      ],
      services: [
        { id: "website_messaging_refresh", title: "Sit wèb & Refont mesaj", body: "Ke ou bezwen premye sit ou oswa aktyèl la pa reflete òf ou ankò, nou kreye paj ki pale ak bon moun nan.", cta: "Refonde sit mwen" },
        { id: "ai_workflow_setup", title: "Konfigirasyon workflow IA", body: "Depi rédaksyon swivi jiska otomatizasyon onboarding, nou idantifye pi gwo pèt tan ou yo epi mete kanpe bon zouti IA.", cta: "Otomatize workflow mwen" },
        { id: "booking_follow_up_system", title: "Sistèm rezèvasyon & swivi", body: "Yon fliks rezèvasyon pwofesyonèl, rapèl otomatik, ak yon sekans swivi pou prospèk pa frèt.", cta: "Mete sistèm mwen kanpe" },
        { id: "ai_onboarding", title: "Fòmasyon IA pou antreprenè", body: "Pa sèten ki aplikasyon IA ki itil? Nou gide ou, konfigire sa ki bon, epi ba ou modèl pou kòmanse vit.", cta: "Dekouvri sa IA ka fè" },
      ],
      testimonials: [
        { quote: "Mwen te gen anpil lide biznis men mwen pa t konnen kijan pou kòmanse. Jwenn yon vrè plan aksyon te chanje tout bagay.", name: "Doha", role: "Fondatris k ap kòmanse, gwoup pilot", initial: "D", color: "bg-[var(--landing-green-mid)]" },
        { quote: "Sit mwen pa t reflete vrè òf mwen depi plis pase yon ane. Nan yon semèn mwen te gen yon nouvo paj ki matche ak sa m ap fè.", name: "Rembert", role: "Fondatè sèvis kreyatif", initial: "R", color: "bg-[var(--landing-green-light)]" },
        { quote: "Mwen te bezwen yon sit rezèvasyon e mwen pa t konnen kiyès pou fè konfyans. BizSproutAI te bati egzakteman sa mwen te bezwen.", name: "Liv", role: "Pwopriyetè biznis sèvis", initial: "L", color: "bg-[var(--landing-amber)] text-[var(--landing-ink)]" },
      ],
      signalStats: [
        { value: "309", label: "Enpresyon òganik, san piblisite" },
        { value: "5+", label: "Prospèk entansyon wo nan 30 jou" },
        { value: "Mar '26", label: "Gwoup pilot ouvè kounye a" },
      ],
      bookingTitle: "Rezève sesyon klète fondatè gratis ou a",
      bookingFallback: "Chwazi yon lè ki bon pou ou",
    };
  }

  if (lang === "pt") {
    return {
      ...base,
      clarityLabel: "Sua sessão de clareza",
      clarityQuestion: "Qual é a parte mais difícil de iniciar seu negócio agora?",
      clarityChoices: [
        "Tenho ideias mas não sei por onde começar",
        "Preciso de um site que realmente converta",
        "Estou me afogando em follow-ups e tarefas administrativas",
        "Não sei como usar IA no meu negócio",
      ],
      miniCards: [
        { icon: "⚡", title: "Ideia → Validação", subtitle: "Sprint 30 dias" },
        { icon: "🌐", title: "Site construído", subtitle: "Que reflete sua oferta" },
        { icon: "🤖", title: "Workflows de IA", subtitle: "Configurados para você" },
        { icon: "📬", title: "Sistemas de follow-up", subtitle: "No piloto automático" },
      ],
      painItems: [
        { icon: "🧠", title: "Muitas ideias, nenhum caminho claro", body: "Você sabe que quer construir algo, mas cada direção parece igualmente possível e arriscada." },
        { icon: "🌐", title: "Seu site não reflete quem você é", body: "Seu negócio evoluiu, mas seu site ainda mostra a versão antiga. Ou você não lançou porque não sabe o que dizer." },
        { icon: "📩", title: "Follow-ups caem pelas frestas", body: "Leads esfriam porque não há sistema. Conversas estão espalhadas entre emails, DMs e notas." },
        { icon: "🤖", title: "Todos usam IA, mas como?", body: "Você sabe que IA pode ajudar seu negócio, mas não sabe por onde começar nem quais ferramentas valem a pena." },
        { icon: "📅", title: "Sem sistema de agendamento, sem estrutura", body: "Clientes precisam te perseguir, ou você a eles, só para agendar. Um fluxo simples de reservas economizaria horas." },
        { icon: "🗺️", title: "Tudo parece igualmente urgente", body: "Marketing, produto, vendas e operações precisam de atenção. Sem roteiro, energia é gasta no lugar errado." },
      ],
      howSteps: [
        { number: "01", title: "Chamada de descoberta — Diagnosticar o verdadeiro bloqueio", body: "Começamos com uma chamada focada de 30 minutos. Não é um pitch de vendas, é uma auditoria real da sua situação.", tag: "Grátis · 30 minutos" },
        { number: "02", title: "Plano de ação personalizado — Seus próximos passos exatos", body: "Você recebe um roteiro priorizado: validar sua ideia, reconstruir seu site, configurar um workflow de IA, ou os três.", tag: "Entregue em 48h" },
        { number: "03", title: "Construir juntos — Executamos com você", body: "Dependendo do seu plano, entregamos ferramentas e templates, ou construímos ao seu lado.", tag: "Pacotes piloto a partir de $0 (beta)" },
        { number: "04", title: "Resultados + Impulso — Feedback, caso de estudo, repetir", body: "Fundadores do piloto recebem loops de feedback diretos. Seus resultados viram sinal para o que escala.", tag: "Benefícios da cohort fundadora" },
      ],
      featuredBadge: "Mais solicitado",
      featuredTitle: "Sprint de validação de ideia",
      featuredBody: "Você tem uma ideia de negócio, ou cinco. Em um sprint focado, testamos a mais forte: para quem é, se vão pagar, e como posicionar com clareza.",
      featuredCta: "Começar meu sprint",
      featuredChecklist: [
        "Diagnóstico de fit de mercado",
        "Perfil de cliente ideal",
        "Declaração de posicionamento",
        "Recomendação de primeira oferta",
        "Plano de tração de 30 dias",
      ],
      services: [
        { id: "website_messaging_refresh", title: "Site e renovação de mensagem", body: "Seja seu primeiro site ou o atual não refletindo mais sua oferta, criamos páginas que falam com a pessoa certa.", cta: "Reconstruir meu site" },
        { id: "ai_workflow_setup", title: "Configuração de workflow de IA", body: "De follow-ups a automação de onboarding, mapeamos suas maiores perdas de tempo e configuramos ferramentas de IA.", cta: "Automatizar meu workflow" },
        { id: "booking_follow_up_system", title: "Sistema de agendamento e follow-up", body: "Um fluxo profissional de reservas, lembretes automáticos e sequência de follow-up para leads não esfriarem.", cta: "Configurar meu sistema" },
        { id: "ai_onboarding", title: "Onboarding de IA para empreendedores", body: "Não sabe quais apps de IA são úteis? Guiamos você, configuramos o que encaixa e damos templates para começar rápido.", cta: "Descobrir o que IA pode fazer" },
      ],
      testimonials: [
        { quote: "Eu tinha tantas ideias de negócio mas genuinamente não sabia como começar. Ter um plano de ação real mudou tudo.", name: "Doha", role: "Fundadora iniciante, cohort piloto", initial: "D", color: "bg-[var(--landing-green-mid)]" },
        { quote: "Meu site não refletia minha oferta real há mais de um ano. Em uma semana eu tinha uma nova página que realmente correspondia ao que faço.", name: "Rembert", role: "Fundador de serviços criativos", initial: "R", color: "bg-[var(--landing-green-light)]" },
        { quote: "Eu precisava de um site de agendamento e não sabia em quem confiar. BizSproutAI construiu exatamente o que eu precisava.", name: "Liv", role: "Dona de negócio de serviços", initial: "L", color: "bg-[var(--landing-amber)] text-[var(--landing-ink)]" },
      ],
      signalStats: [
        { value: "309", label: "Impressões orgânicas, sem anúncios" },
        { value: "5+", label: "Leads de alta intenção em 30 dias" },
        { value: "Mar '26", label: "Cohort piloto aberta agora" },
      ],
      bookingTitle: "Agende sua sessão de clareza para fundadores gratuita",
      bookingFallback: "Escolha um horário que funcione para você",
    };
  }

  return base;
}
