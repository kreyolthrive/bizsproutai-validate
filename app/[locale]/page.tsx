import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { LandingPageReveal } from "@/components/marketing/LandingPageReveal";
import { BookingCalendar } from "@/components/marketing/BookingCalendar";
import { HeroQuizCard } from "@/components/marketing/HeroQuizCard";
import { LandingPageTracker } from "@/components/marketing/LandingPageTracker";
import { getLandingCopy } from "@/i18n/landingCopy";

type Props = {
  params: Promise<{ locale: string }>;
};

function getCopy(locale: string) {
  const normalized = locale.toLowerCase().split("-")[0];

  if (normalized === "fr") {
    return {
      /* ── Hero ── */
      heroEyebrow: "Validation d'idée gratuite",
      heroLead: "Amenez votre idée à son premier client.",
      heroEmphasis: "",
      heroBody:
        "BizSproutAI vous aide à valider votre idée, identifier le bon premier actif, le construire, le distribuer et vous adapter jusqu'à atteindre un vrai résultat de marché.",
      heroNote: "Première étape gratuite. Obtenez votre étape, le premier actif recommandé et votre prochain mouvement en quelques minutes.",
      secondary: "Voir comment ça marche",

      /* ── Free result section ── */
      freeResultEyebrow: "Ce que vous obtenez de la validation gratuite",
      freeResultTitle: "Connaissez votre étape. Connaissez votre prochain mouvement.",
      freeResultBody:
        "La plupart des fondateurs calent parce qu'ils travaillent sur la mauvaise chose au mauvais stade. La validation gratuite vous montre exactement où vous en êtes et le chemin le plus direct vers votre premier vrai client.",

      /* ── Pain section ── */
      painEyebrow: "Le vrai problème",
      painTitle:
        "Vous n'êtes pas bloqué par manque de potentiel. Vous êtes bloqué par manque de chemin clair.",
      painBody:
        "La plupart des fondateurs n'ont pas besoin de plus de motivation. Ils ont besoin de structure, de soutien et d'un système qui transforme les idées en action.",

      /* ── How section ── */
      howEyebrow: "Comment BizSproutAI fonctionne",
      howTitle: "Cinq étapes. Une destination claire.",
      howBody:
        "De la validation de votre idée à votre premier client payant — BizSproutAI vous accompagne à chaque étape avec des outils, un système, et un soutien concret.",
      howStepsOverview: [
        { number: "01", label: "Valider", desc: "Voyez votre étape et votre meilleur prochain mouvement" },
        { number: "02", label: "Recommander", desc: "Obtenez le bon actif et le bon chemin" },
        { number: "03", label: "Construire", desc: "Créez votre système de lancement" },
        { number: "04", label: "Lancer", desc: "Démarrez de vraies conversations" },
        { number: "05", label: "Améliorer", desc: "Affinez jusqu'à ce que ça fonctionne" },
      ],
      howIntroLabel: "Le Sprint Fondateur de 30 Jours — en détail",

      /* ── After validation section ── */
      afterValidationEyebrow: "La prochaine étape après la validation gratuite",
      afterValidationTitle: "La validation est juste la première couche.",
      afterValidationBody:
        "La validation gratuite vous montre votre étape et votre meilleur prochain mouvement. La plateforme complète BizSproutAI vous emmène de ce prochain mouvement jusqu'à votre premier client payant — avec un soutien concret, un sprint complet, et une aide à la construction à chaque étape.",
      afterValidationFreeBadge: "Validation gratuite",
      afterValidationPlatformBadge: "Plateforme complète BizSproutAI",
      afterValidationFreeItems: [
        "Votre étape actuelle identifiée",
        "Premier actif recommandé",
        "Vos 3–4 prochaines étapes",
        "Une erreur critique à éviter",
      ],
      afterValidationCta: "Débloquez votre sprint complet dans BizSproutAI →",
      afterValidationFreeTitle: "Ce que vous obtenez maintenant",
      afterValidationPlatformTitle: "Ce que vous débloquez ensuite",
      afterValidationFreeNote: "Gratuit. En moins d'une minute. Sans compte.",
      freeResultCtaNote: "Gratuit · Sans compte · En moins d'une minute",
      faqTitle: "Ce que les fondateurs veulent généralement savoir avant de commencer.",
      faqSubtitle: "Commencez par la validation gratuite. Si vous voulez aller plus loin, le Sprint est la prochaine étape.",
      ctaDiagNote: "30 min de diagnostic · sans argumentaire · juste de la clarté",

      /* ── Sprint / services section ── */
      servicesEyebrow: "La prochaine étape après la validation gratuite",
      servicesTitle: "De la validation gratuite au lancement complet.",
      servicesBody:
        "La validation gratuite est la première étape. Le Sprint Fondateur de 30 Jours vous emmène jusqu'au bout — de votre premier actif recommandé jusqu'à votre premier client payant.",

      /* ── Proof section ── */
      proofEyebrow: "À quoi le succès peut ressembler",
      proofTitle: "De vrais résultats de fondateurs. Un vrai élan commercial.",
      proofBody:
        "L'objectif du Sprint n'est pas de vous laisser avec plus de notes ou de plans inachevés. C'est de vous aider à créer des résultats comme ceux-ci.",

      /* ── Signal strip ── */
      signalCta: "Démarrer ma validation gratuite",

      /* ── Final CTA section ── */
      ctaEyebrow: "Première étape gratuite. Sans compte.",
      ctaTitle: "Prêt à amener votre idée vers son premier client ?",
      ctaEmphasis: "Commencez gratuitement. Avancez avec clarté.",
      ctaBody:
        "Validez votre idée maintenant, obtenez votre étape et votre premier actif recommandé, et suivez le chemin que BizSproutAI construit pour vous — jusqu'à votre premier vrai résultat de marché.",
      ctaPrimary: "Démarrer ma validation gratuite",
      ctaSecondary: "Réserver un appel diagnostic gratuit",
      emailPrefix: "Vous préférez écrire ?",

      /* ── Guarantee + trust ── */
      guaranteeTitle: "Des résultats ou on continue — gratuitement",
      guaranteeBody:
        "Si vous suivez le plan et n'obtenez pas de client payant en 30 jours, nous continuons à travailler avec vous sans frais supplémentaires jusqu'à ce que ce soit le cas.",
      trustTitle: "Fondateurs validés cette semaine",
      trustMeta: "Gratuit · Moins d'une minute · Sans compte",

      /* ── Booking section ── */
      bookingSectionEyebrow: "Vous préférez parler d'abord ?",
      bookingSectionNote:
        "L'appel de diagnostic est une option secondaire pour les fondateurs qui préfèrent discuter avant de commencer. La validation gratuite reste la voie la plus rapide.",
    };
  }

  if (normalized === "es") {
    return {
      heroEyebrow: "Validación de idea gratuita",
      heroLead: "Lleva tu idea a su primer cliente.",
      heroEmphasis: "",
      heroBody:
        "BizSproutAI te ayuda a validar tu idea, identificar el primer activo correcto, construirlo, distribuirlo y adaptarte hasta alcanzar un resultado real en el mercado.",
      heroNote: "Primer paso gratuito. Obtén tu etapa, el primer activo recomendado y tu próximo movimiento en minutos.",
      secondary: "Ver cómo funciona",
      freeResultEyebrow: "Qué obtienes de la validación gratuita",
      freeResultTitle: "Conoce tu etapa. Conoce tu próximo movimiento.",
      freeResultBody:
        "La mayoría de los fundadores se estancan porque trabajan en lo incorrecto en la etapa incorrecta. La validación gratuita te muestra exactamente dónde estás y el camino más directo hacia tu primer cliente real.",
      painEyebrow: "El verdadero problema",
      painTitle:
        "No estás estancado por falta de potencial. Estás estancado por falta de un camino claro.",
      painBody:
        "La mayoría de los fundadores no necesitan más motivación. Necesitan estructura, apoyo y un sistema que convierta ideas en acción.",
      howEyebrow: "Cómo funciona BizSproutAI",
      howTitle: "Cinco pasos. Un destino claro.",
      howBody:
        "Desde validar tu idea hasta tu primer cliente de pago — BizSproutAI te acompaña en cada paso con herramientas, un sistema y apoyo práctico.",
      howStepsOverview: [
        { number: "01", label: "Validar", desc: "Ve tu etapa y tu mejor próximo movimiento" },
        { number: "02", label: "Recomendar", desc: "Obtén el activo y camino correctos" },
        { number: "03", label: "Construir", desc: "Crea tu sistema de lanzamiento" },
        { number: "04", label: "Lanzar", desc: "Inicia conversaciones reales" },
        { number: "05", label: "Mejorar", desc: "Refina hasta que funcione" },
      ],
      howIntroLabel: "El Sprint Fundador de 30 Días — en detalle",
      afterValidationEyebrow: "El siguiente paso después de la validación gratuita",
      afterValidationTitle: "La validación es solo la primera capa.",
      afterValidationBody:
        "La validación gratuita te muestra tu etapa y tu mejor próximo movimiento. La plataforma completa BizSproutAI te lleva desde ese movimiento hasta tu primer cliente de pago — con apoyo práctico, un sprint completo, y ayuda de construcción en cada etapa.",
      afterValidationFreeBadge: "Validación gratuita",
      afterValidationPlatformBadge: "Plataforma completa BizSproutAI",
      afterValidationFreeItems: [
        "Tu etapa actual identificada",
        "Primer activo recomendado",
        "Tus 3–4 próximos pasos",
        "Un error crítico a evitar",
      ],
      afterValidationCta: "Accede a tu sprint completo en BizSproutAI →",
      afterValidationFreeTitle: "Lo que obtienes ahora mismo",
      afterValidationPlatformTitle: "Lo que desbloqueas a continuación",
      afterValidationFreeNote: "Gratis. Menos de un minuto. Sin cuenta.",
      freeResultCtaNote: "Gratis · Sin cuenta · Menos de un minuto",
      faqTitle: "Lo que los fundadores suelen querer saber antes de empezar.",
      faqSubtitle: "Empieza con la validación gratuita. Si quieres ir más lejos, el Sprint es el siguiente paso.",
      ctaDiagNote: "30 min de diagnóstico · sin argumentario · solo claridad",
      servicesEyebrow: "El siguiente paso después de la validación gratuita",
      servicesTitle: "De la validación gratuita al lanzamiento completo.",
      servicesBody:
        "La validación gratuita es el primer paso. El Sprint Fundador de 30 Días te lleva hasta el final — desde tu primer activo recomendado hasta tu primer cliente de pago.",
      proofEyebrow: "Cómo puede verse el éxito",
      proofTitle: "Resultados reales de fundadores. Impulso real de negocio.",
      proofBody:
        "El objetivo del Sprint no es dejarte con más notas o planes sin terminar. Es ayudarte a crear resultados como estos.",
      signalCta: "Iniciar mi validación gratuita",
      ctaEyebrow: "Primer paso gratuito. Sin cuenta.",
      ctaTitle: "¿Listo para llevar tu idea a su primer cliente?",
      ctaEmphasis: "Empieza gratis. Avanza con claridad.",
      ctaBody:
        "Valida tu idea ahora, obtén tu etapa y tu primer activo recomendado, y sigue el camino que BizSproutAI construye para ti — hasta tu primer resultado real en el mercado.",
      ctaPrimary: "Iniciar mi validación gratuita",
      ctaSecondary: "Reservar llamada diagnóstico gratuita",
      emailPrefix: "¿Prefieres escribir?",
      guaranteeTitle: "Resultados o seguimos trabajando — gratis",
      guaranteeBody:
        "Si sigues el plan y no consigues un cliente de pago en 30 días, seguimos trabajando contigo sin costo adicional hasta que lo logres.",
      trustTitle: "Fundadores validados esta semana",
      trustMeta: "Gratis · Menos de 1 min · Sin cuenta",

      bookingSectionEyebrow: "¿Prefieres hablar primero?",
      bookingSectionNote:
        "La llamada diagnóstico es una opción secundaria para fundadores que prefieren hablar antes de empezar. La validación gratuita sigue siendo la ruta más rápida.",
    };
  }

  if (normalized === "ht") {
    return {
      heroEyebrow: "Validasyon lide gratis",
      heroLead: "Mennen lide ou rive nan premye kliyan li.",
      heroEmphasis: "",
      heroBody:
        "BizSproutAI ede ou valide lide ou, idantifye premye mwayen ki bon an, bati li, distribye li, epi adapte ou jiskaske ou jwenn yon vrè rezilta nan mache a.",
      heroNote: "Premye etap gratis. Jwenn etap ou, premye mwayen rekòmande, ak pwochen mouvman ou an kèk minit.",
      secondary: "Gade kijan li mache",
      freeResultEyebrow: "Sa ou jwenn nan validasyon gratis",
      freeResultTitle: "Konnen etap ou. Konnen pwochen mouvman ou.",
      freeResultBody:
        "Pifò fondatè bloke paske yo travay sou move bagay nan move etap. Validasyon gratis montre ou egzakteman kote ou ye ak chemen ki pi dirèk pou rive nan premye vrè kliyan ou.",
      painEyebrow: "Vrè pwoblèm nan",
      painTitle:
        "Ou pa bloke paske ou manke potansyèl. Ou bloke paske ou manke yon chemen klè.",
      painBody:
        "Pifò fondatè pa bezwen plis motivasyon. Yo bezwen estrikti, sipò, ak yon sistèm ki transfòme lide yo an aksyon.",
      howEyebrow: "Kijan BizSproutAI mache",
      howTitle: "Senk etap. Yon sèl destinasyon klè.",
      howBody:
        "Soti nan valide lide ou rive nan premye kliyan peyan ou — BizSproutAI akonpaye ou nan chak etap.",
      howStepsOverview: [
        { number: "01", label: "Valide", desc: "Wè etap ou ak pi bon pwochen mouvman ou" },
        { number: "02", label: "Rekòmande", desc: "Jwenn bon mwayen ak bon chemen" },
        { number: "03", label: "Bati", desc: "Kreye sistèm lansman ou" },
        { number: "04", label: "Lanse", desc: "Kòmanse vrè konvèsasyon" },
        { number: "05", label: "Amelyore", desc: "Rafine jiskaske li mache" },
      ],
      howIntroLabel: "Sprint Fondatè 30 Jou a — an detay",
      afterValidationEyebrow: "Pwochen etap apre validasyon gratis",
      afterValidationTitle: "Validasyon se jis premye kouch la.",
      afterValidationBody:
        "Validasyon gratis montre ou etap ou ak pi bon pwochen mouvman ou. Platfòm konplè BizSproutAI mennen ou soti nan mouvman sa rive nan premye kliyan peyan ou.",
      afterValidationFreeBadge: "Validasyon gratis",
      afterValidationPlatformBadge: "Platfòm konplè BizSproutAI",
      afterValidationFreeItems: [
        "Etap ou kounye a idantifye",
        "Premye mwayen rekòmande",
        "3–4 pwochen etap ou yo",
        "Yon erè kritik pou evite",
      ],
      afterValidationCta: "Deblouke sprint konplè ou nan BizSproutAI →",
      afterValidationFreeTitle: "Sa ou jwenn kounye a",
      afterValidationPlatformTitle: "Sa ou debloke apre",
      afterValidationFreeNote: "Gratis. Mwens pase yon minit. San kont.",
      freeResultCtaNote: "Gratis · San kont · Mwens pase yon minit",
      faqTitle: "Sa fondatè yo vle konnen anvan yo kòmanse.",
      faqSubtitle: "Kòmanse ak validasyon gratis la. Si ou vle ale pi lwen, Sprint la se pwochen etap la.",
      ctaDiagNote: "30 minit dyagnostik · pa gen vant · jis klarifikasyon",
      servicesEyebrow: "Pwochen etap apre validasyon gratis",
      servicesTitle: "Soti nan validasyon gratis rive nan lanse nèt.",
      servicesBody:
        "Validasyon gratis se premye etap la. Sprint Fondatè 30 Jou a mennen ou jiskaske finalman.",
      proofEyebrow: "Kisa siksè ka sanble",
      proofTitle: "Vrè rezilta fondatè. Vrè elan biznis.",
      proofBody:
        "Objektif Sprint la se pa kite ou ak plis nòt oswa plan ki pa fini. Se ede ou kreye rezilta tankou sa yo.",
      signalCta: "Kòmanse validasyon gratis mwen",
      ctaEyebrow: "Premye etap gratis. San kont.",
      ctaTitle: "Pare pou mennen lide ou rive nan premye kliyan li?",
      ctaEmphasis: "Kòmanse gratis. Avanse ak klarifikasyon.",
      ctaBody:
        "Valide lide ou kounye a, jwenn etap ou ak premye mwayen rekòmande, epi swiv chemen BizSproutAI bati pou ou — jiskaske ou jwenn premye vrè rezilta ou nan mache a.",
      ctaPrimary: "Kòmanse validasyon gratis mwen",
      ctaSecondary: "Rezève yon apèl dyagnostik gratis",
      emailPrefix: "Ou pito ekri?",
      guaranteeTitle: "Rezilta oswa nou kontinye — gratis",
      guaranteeBody:
        "Si ou swiv plan an epi ou pa jwenn yon kliyan peyan nan 30 jou, nou kontinye travay avèk ou san frè siplemantè jiskaske ou jwenn.",
      trustTitle: "Fondatè validé semèn sa a",
      trustMeta: "Gratis · Mwens 1 minit · San kont",

      bookingSectionEyebrow: "Ou pito pale an premye?",
      bookingSectionNote:
        "Apèl dyagnostik la se yon opsyon segondè pou fondatè ki pito pale anvan yo kòmanse. Validasyon gratis rete wout ki pi rapid la.",
    };
  }

  if (normalized === "pt") {
    return {
      heroEyebrow: "Validação de ideia gratuita",
      heroLead: "Leve sua ideia ao primeiro cliente.",
      heroEmphasis: "",
      heroBody:
        "BizSproutAI ajuda você a validar sua ideia, identificar o primeiro ativo certo, construí-lo, distribuí-lo e se adaptar até alcançar um resultado real no mercado.",
      heroNote: "Primeiro passo gratuito. Obtenha sua etapa, o primeiro ativo recomendado e seu próximo movimento em minutos.",
      secondary: "Veja como funciona",
      freeResultEyebrow: "O que você recebe da validação gratuita",
      freeResultTitle: "Saiba sua etapa. Saiba seu próximo movimento.",
      freeResultBody:
        "A maioria dos fundadores trava porque está trabalhando na coisa errada na etapa errada. A validação gratuita mostra exatamente onde você está e o caminho mais direto para o seu primeiro cliente real.",
      painEyebrow: "O verdadeiro problema",
      painTitle:
        "Você não está travado por falta de potencial. Você está travado por falta de um caminho claro.",
      painBody:
        "A maioria dos fundadores não precisa de mais motivação. Eles precisam de estrutura, apoio e um sistema que transforme ideias em ação.",
      howEyebrow: "Como o BizSproutAI funciona",
      howTitle: "Cinco etapas. Um destino claro.",
      howBody:
        "Desde validar sua ideia até seu primeiro cliente pagante — BizSproutAI te acompanha em cada etapa com ferramentas, um sistema e apoio prático.",
      howStepsOverview: [
        { number: "01", label: "Validar", desc: "Veja sua etapa e seu melhor próximo movimento" },
        { number: "02", label: "Recomendar", desc: "Obtenha o ativo e caminho certos" },
        { number: "03", label: "Construir", desc: "Crie seu sistema de lançamento" },
        { number: "04", label: "Lançar", desc: "Inicie conversas reais" },
        { number: "05", label: "Melhorar", desc: "Refine até funcionar" },
      ],
      howIntroLabel: "O Sprint Fundador de 30 Dias — em detalhes",
      afterValidationEyebrow: "O próximo passo após a validação gratuita",
      afterValidationTitle: "A validação é apenas a primeira camada.",
      afterValidationBody:
        "A validação gratuita mostra sua etapa e seu melhor próximo movimento. A plataforma completa BizSproutAI leva você desse próximo movimento até seu primeiro cliente pagante — com apoio prático, um sprint completo, e ajuda de construção em cada etapa.",
      afterValidationFreeBadge: "Validação gratuita",
      afterValidationPlatformBadge: "Plataforma completa BizSproutAI",
      afterValidationFreeItems: [
        "Sua etapa atual identificada",
        "Primeiro ativo recomendado",
        "Seus 3–4 próximos passos",
        "Um erro crítico a evitar",
      ],
      afterValidationCta: "Acesse seu sprint completo no BizSproutAI →",
      afterValidationFreeTitle: "O que você recebe agora",
      afterValidationPlatformTitle: "O que você desbloqueia a seguir",
      afterValidationFreeNote: "Gratuito. Menos de um minuto. Sem conta.",
      freeResultCtaNote: "Gratuito · Sem conta · Menos de um minuto",
      faqTitle: "O que os fundadores geralmente querem saber antes de começar.",
      faqSubtitle: "Comece com a validação gratuita. Se quiser ir mais longe, o Sprint é o próximo passo.",
      ctaDiagNote: "30 min de diagnóstico · sem argumentação · apenas clareza",
      servicesEyebrow: "O próximo passo após a validação gratuita",
      servicesTitle: "Da validação gratuita ao lançamento completo.",
      servicesBody:
        "A validação gratuita é o primeiro passo. O Sprint Fundador de 30 Dias leva você até o fim — do seu primeiro ativo recomendado até seu primeiro cliente pagante.",
      proofEyebrow: "Como o sucesso pode parecer",
      proofTitle: "Resultados reais de fundadores. Impulso real de negócio.",
      proofBody:
        "O objetivo do Sprint não é deixar você com mais anotações ou planos inacabados. É ajudar você a criar resultados como estes.",
      signalCta: "Iniciar minha validação gratuita",
      ctaEyebrow: "Primeiro passo gratuito. Sem conta.",
      ctaTitle: "Pronto para levar sua ideia ao primeiro cliente?",
      ctaEmphasis: "Comece grátis. Avance com clareza.",
      ctaBody:
        "Valide sua ideia agora, obtenha sua etapa e o primeiro ativo recomendado, e siga o caminho que o BizSproutAI constrói para você — até o seu primeiro resultado real no mercado.",
      ctaPrimary: "Iniciar minha validação gratuita",
      ctaSecondary: "Agendar chamada diagnóstico gratuita",
      emailPrefix: "Prefere escrever?",
      guaranteeTitle: "Resultados ou continuamos trabalhando — de graça",
      guaranteeBody:
        "Se você seguir o plano e não conseguir um cliente pagante em 30 dias, continuamos trabalhando com você sem custo adicional até conseguir.",
      trustTitle: "Fundadores validados esta semana",
      trustMeta: "Gratuito · Menos de 1 min · Sem conta",

      bookingSectionEyebrow: "Prefere falar primeiro?",
      bookingSectionNote:
        "A chamada diagnóstico é uma opção secundária para fundadores que preferem conversar antes de começar. A validação gratuita continua sendo a rota mais rápida.",
    };
  }

  return {
    /* ── Hero ── */
    heroEyebrow: "Free Business Validation",
    heroLead: "Get your idea to its first customer.",
    heroEmphasis: "",
    heroBody:
      "BizSproutAI helps you validate your idea, identify the right first asset, build it, distribute it, and adapt until you reach a real market outcome.",
    heroNote: "Free first step. Get your stage, recommended first asset, and next move in minutes.",
    secondary: "See How It Works",

    /* ── Free result section ── */
    freeResultEyebrow: "What you get from free validation",
    freeResultTitle: "Know your stage. Know your next move.",
    freeResultBody:
      "Most founders stall because they are working on the wrong thing at the wrong stage. Free validation shows you exactly where you are and the most direct path to your first real customer.",

    /* ── Pain section ── */
    painEyebrow: "The real problem",
    painTitle:
      "You are not stuck because you lack potential. You are stuck because you lack a clear path.",
    painBody:
      "Most founders do not need more motivation. They need structure, support, and a system that turns ideas into action.",

    /* ── How section ── */
    howEyebrow: "How BizSproutAI works",
    howTitle: "Five steps. One clear destination.",
    howBody:
      "From validating your idea to your first paying customer — BizSproutAI guides you through every step with tools, a system, and real execution support.",
    howStepsOverview: [
      { number: "01", label: "Validate", desc: "See your stage and your best next move" },
      { number: "02", label: "Recommend", desc: "Get the right asset and the right path" },
      { number: "03", label: "Build", desc: "Create your launch system" },
      { number: "04", label: "Launch", desc: "Start real conversations" },
      { number: "05", label: "Improve", desc: "Refine until it works" },
    ],
    howIntroLabel: "The 30-Day Founder Sprint — in detail",

    /* ── After validation section ── */
    afterValidationEyebrow: "The next step after free validation",
    afterValidationTitle: "Validation is just the first layer.",
    afterValidationBody:
      "Free validation shows you your stage and your best next move. The full BizSproutAI platform takes you from that next move all the way to your first paying customer — with hands-on support, a complete sprint, and build help at every stage.",
    afterValidationFreeBadge: "Free Validation",
    afterValidationPlatformBadge: "Full BizSproutAI Platform",
    afterValidationFreeItems: [
      "Your current stage identified",
      "First asset recommended",
      "Your 3–4 next steps",
      "One critical mistake to avoid",
    ],
    afterValidationCta: "Unlock your full sprint inside BizSproutAI →",
    afterValidationFreeTitle: "What you get right now",
    afterValidationPlatformTitle: "What you unlock next",
    afterValidationFreeNote: "Free. Takes under a minute. No account required.",
    freeResultCtaNote: "Free · No account needed · Takes under a minute",
    faqTitle: "What founders usually want to know before they start.",
    faqSubtitle: "Start with the free validation. If you want to go further, the Sprint is the next step.",
    ctaDiagNote: "30-min diagnostic · no pitch · just clarity",

    /* ── Sprint / services section ── */
    servicesEyebrow: "The next step after free validation",
    servicesTitle: "From free validation to full launch.",
    servicesBody:
      "Free validation is the first step. The 30-Day Founder Sprint takes you the rest of the way — from your recommended first asset all the way to your first paying customer.",

    /* ── Proof section ── */
    proofEyebrow: "What success can look like",
    proofTitle: "Real founder outcomes. Real business momentum.",
    proofBody:
      "The goal of the Sprint is not to leave you with more notes, ideas, or unfinished plans. It is to help you create outcomes like these.",

    /* ── Signal strip ── */
    signalCta: "Start Free Validation",

    /* ── Final CTA section ── */
    ctaEyebrow: "Free first step. No account needed.",
    ctaTitle: "Ready to get your idea to its first customer?",
    ctaEmphasis: "Start free. Move with clarity.",
    ctaBody:
      "Validate your idea now, get your stage and recommended first asset, and follow the path BizSproutAI builds for you — all the way to your first real market outcome.",
    ctaPrimary: "Start Free Validation",
    ctaSecondary: "Book a Free Fit Call",
    emailPrefix: "Prefer email?",

    /* ── Guarantee + trust ── */
    guaranteeTitle: "Results or we keep working — free",
    guaranteeBody:
      "If you follow the plan and don't land a paying customer in 30 days, we keep working with you at no extra cost until you do.",
    trustTitle: "Founders validated this week",
    trustMeta: "Free · Under 1 min · No account needed",

    /* ── Booking section ── */
    bookingSectionEyebrow: "Prefer to talk first?",
    bookingSectionNote:
      "The fit call is a secondary option for founders who prefer to speak before starting. Free validation is still the fastest path.",
  };
}

const faqItems = [
  {
    question: "What do I get from the free validation?",
    answer:
      "You get your current stage, your recommended first asset, your clearest 3–4 next steps, and one key mistake to avoid. It is real, specific, and based on where you are right now — not generic advice.",
  },
  {
    question: "What happens after I validate?",
    answer:
      "You get a result immediately. If you want to go deeper — full sprint plan, build support, day-by-day execution, and hands-on guidance — you continue into the full BizSproutAI platform.",
  },
  {
    question: "What exactly happens in the full sprint?",
    answer:
      "We validate your idea, define the buyer, shape a real offer, build the right launch asset, start outreach, and work toward your first paying customer — step by step with direct support.",
  },
  {
    question: "What if I do not land a first paying customer in 30 days?",
    answer:
      "If you complete the sprint, follow the plan, and do the work, we keep working with you at no extra cost until you do.",
  },
  {
    question: "How much does the full Sprint cost?",
    answer:
      "The Sprint is an application-only program. Pricing is shared during the fit call — what matters first is whether it is the right fit for where you are right now. The free validation is always the best first step.",
  },
  {
    question: "Do I need technical skills to use BizSproutAI?",
    answer:
      "No. The Sprint is designed for founders at any technical level. We work with tools you already have, or help you set up simple ones that require no coding.",
  },
  {
    question: "What if my idea is not ready to launch yet?",
    answer:
      "That is exactly what free validation is for. If your idea needs more work before it is launch-ready, the validation will show you what is missing and what to do first — before you invest time or money in the wrong direction.",
  },
];

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const copy = getCopy(locale);
  const lc = getLandingCopy(locale);
  const validateHref = `/${locale}/validate`;
  const phoneHref = "https://cal.com/bizsproutai/30-min-founder-clarity-session";
  const emailHref = "mailto:info@bizsproutai.com";
  const focusItems = lc.painItems.slice(0, 4);
  const sprintSteps = lc.howSteps.slice(0, 4);
  const signalStats = lc.signalStats.slice(0, 4);

  return (
    <main className="overflow-x-hidden bg-[var(--warm-white)] text-[var(--ink)]">
      <LandingPageTracker />
      <LandingPageReveal />

      {/* ── Section 1: Hero — Free Validation ── */}
      <section
        id="who"
        className="relative overflow-hidden px-5 pb-16 pt-36 md:pt-28 lg:px-10 lg:pt-36"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8%] top-[62%] h-[320px] w-[320px] rounded-full bg-[rgba(74,140,92,0.06)] blur-3xl" />
          <div className="absolute right-[6%] top-[8%] h-[360px] w-[360px] rounded-full bg-[rgba(126,200,80,0.06)] blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[1fr_0.82fr]">
          {/* Left column */}
          <div>
            <div className="landing-reveal mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(126,200,80,0.14)] text-sm font-medium text-[var(--landing-green-mid)]">
                WD
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--landing-green-deep)]">
                  Wagner Desir
                </p>
                <p className="mt-px text-xs text-[var(--landing-muted)]">
                  Founder, BizSproutAI
                </p>
              </div>
            </div>

            <div className="landing-reveal inline-flex items-center gap-2 rounded-full border border-[rgba(126,200,80,0.3)] bg-[rgba(126,200,80,0.14)] px-3.5 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[var(--landing-green-mid)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--landing-sprout)]" />
              {copy.heroEyebrow}
            </div>

            <h1 className="landing-reveal mt-6 max-w-[18ch] font-[family:var(--font-serif)] text-[clamp(2.4rem,4.8vw,4.6rem)] leading-[1.02] tracking-[-0.03em] text-[var(--landing-green-deep)]">
              {copy.heroLead}
              {copy.heroEmphasis && (
                <>
                  <br />
                  <em>{copy.heroEmphasis}</em>
                </>
              )}
            </h1>

            <p className="landing-reveal mt-5 max-w-[34rem] text-[1.02rem] leading-[1.65] text-[var(--landing-muted)]">
              {copy.heroBody}
            </p>

            <div className="landing-reveal mt-7 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href={validateHref}
                className="inline-flex items-center justify-center rounded-full bg-[var(--landing-green-deep)] px-8 py-4 text-[1.05rem] font-bold text-white shadow-[0_4px_24px_rgba(26,58,42,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--landing-green-mid)] hover:shadow-[0_10px_36px_rgba(26,58,42,0.28)]"
              >
                {lc.validationCta} →
              </a>
              <a
                href={`/${locale}#how`}
                className="text-center text-[0.92rem] font-semibold text-[var(--landing-muted)] underline underline-offset-[3px] transition hover:text-[var(--landing-green-deep)]"
              >
                {copy.secondary} ↓
              </a>
            </div>
            <p className="landing-reveal mt-3 text-[0.8rem] text-[var(--landing-muted)]">
              {copy.heroNote}
            </p>

            {/* Guarantee box */}
            <div className="landing-reveal mt-8 flex items-start gap-3 rounded-2xl border border-[rgba(126,200,80,0.25)] bg-[rgba(126,200,80,0.07)] px-5 py-4">
              <span className="mt-0.5 text-[1.1rem]">🛡️</span>
              <div>
                <p className="text-[0.82rem] font-semibold text-[var(--landing-green-deep)]">
                  {copy.guaranteeTitle}
                </p>
                <p className="mt-0.5 text-[0.78rem] leading-[1.5] text-[var(--landing-muted)]">
                  {copy.guaranteeBody}
                </p>
              </div>
            </div>

            {/* Micro-trust avatars */}
            <div className="landing-reveal mt-6 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["D", "R", "L", "S"].map((initial) => (
                  <div
                    key={initial}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--warm-white)] bg-[var(--landing-green-mid)] text-[0.65rem] font-bold text-white"
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[0.8rem] font-semibold text-[var(--landing-green-deep)]">
                  {copy.trustTitle}
                </p>
                <p className="text-[0.72rem] text-[var(--landing-muted)]">{copy.trustMeta}</p>
              </div>
            </div>

            {/* Testimonials */}
            <div className="landing-reveal mt-8 space-y-3">
              <div className="rounded-2xl border border-[rgba(26,58,42,0.08)] bg-white p-4 shadow-sm">
                <p className="text-[0.83rem] leading-[1.55] text-[var(--landing-muted)]">
                  &ldquo;I had a scattered idea and no real direction. Two weeks into the Sprint I
                  had a paid offer and my first client conversation.&rdquo;
                </p>
                <p className="mt-2 text-[0.75rem] font-semibold text-[var(--landing-green-deep)]">
                  Doha M. — Sprint founder
                </p>
              </div>
              <div className="rounded-2xl border border-[rgba(26,58,42,0.08)] bg-white p-4 shadow-sm">
                <p className="text-[0.83rem] leading-[1.55] text-[var(--landing-muted)]">
                  &ldquo;I stopped overthinking and started moving. The validation took under a
                  minute and the next step was obvious.&rdquo;
                </p>
                <p className="mt-2 text-[0.75rem] font-semibold text-[var(--landing-green-deep)]">
                  Rembert A. — Sprint founder
                </p>
              </div>
              <div className="rounded-2xl border border-[rgba(26,58,42,0.08)] bg-white p-4 shadow-sm">
                <p className="text-[0.83rem] leading-[1.55] text-[var(--landing-muted)]">
                  &ldquo;I had been &lsquo;about to launch&rsquo; for months. After the Sprint, my
                  system was live and I landed my first paying client in week three.&rdquo;
                </p>
                <p className="mt-2 text-[0.75rem] font-semibold text-[var(--landing-green-deep)]">
                  Liv T. — Sprint founder
                </p>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="landing-reveal lg:sticky lg:top-28">
            <HeroQuizCard
              eyebrow={lc.clarityLabel}
              question={lc.clarityQuestion}
              options={lc.clarityChoices}
              cta={lc.quizCta}
              footer={lc.widgetNote}
              outcomes={lc.miniCards.map((c) => ({
                icon: c.icon,
                label: c.title,
                sub: c.subtitle,
              }))}
              locale={locale}
            />
          </div>
        </div>
      </section>

      {/* ── Section 2: What you get for free ── */}
      <section className="bg-[var(--landing-cream)] px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="landing-reveal mx-auto max-w-[44rem] text-center">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
              {copy.freeResultEyebrow}
            </p>
            <h2 className="mt-4 font-[family:var(--font-serif)] text-[clamp(1.95rem,3.8vw,3.4rem)] leading-[1.08] text-[var(--landing-green-deep)]">
              {copy.freeResultTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--landing-muted)]">
              {copy.freeResultBody}
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {lc.freeFeatures.map((item) => (
              <article
                key={item.title}
                className="landing-reveal rounded-[22px] border border-[rgba(26,58,42,0.07)] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(26,58,42,0.08)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[rgba(126,200,80,0.12)] text-xl">
                  {item.icon}
                </div>
                <h3 className="mt-5 font-[family:var(--font-serif)] text-[1.18rem] leading-tight text-[var(--landing-green-deep)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-[0.88rem] leading-[1.7] text-[var(--landing-muted)]">
                  {item.body}
                </p>
              </article>
            ))}
          </div>

          <div className="landing-reveal mt-10 text-center">
            <a
              href={validateHref}
              className="inline-flex items-center justify-center rounded-full bg-[var(--landing-green-deep)] px-10 py-4 text-[1.05rem] font-bold text-white shadow-[0_4px_24px_rgba(26,58,42,0.2)] transition hover:-translate-y-0.5 hover:bg-[var(--landing-green-mid)] hover:shadow-[0_10px_36px_rgba(26,58,42,0.28)]"
            >
              {lc.validationCta} →
            </a>
            <p className="mt-3 text-[0.8rem] text-[var(--landing-muted)]">
              {copy.freeResultCtaNote}
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 3: Why founders get stuck (Pain) ── */}
      <section id="pain" className="px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="landing-reveal mx-auto max-w-[44rem] text-center">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
              {copy.painEyebrow}
            </p>
            <h2 className="mt-4 font-[family:var(--font-serif)] text-[clamp(1.95rem,3.8vw,3.4rem)] leading-[1.08] text-[var(--landing-green-deep)]">
              {copy.painTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--landing-muted)]">
              {copy.painBody}
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {focusItems.map((item) => (
              <article
                key={item.title}
                className="landing-reveal rounded-[22px] border border-[rgba(26,58,42,0.07)] bg-[var(--landing-cream)] p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(26,58,42,0.08)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[rgba(126,200,80,0.12)] text-xl">
                  {item.icon}
                </div>
                <h3 className="mt-5 font-[family:var(--font-serif)] text-[1.3rem] leading-tight text-[var(--landing-green-deep)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-[0.92rem] leading-[1.7] text-[var(--landing-muted)]">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: How BizSproutAI works ── */}
      <section id="how" className="bg-[var(--landing-cream)] px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="landing-reveal mx-auto max-w-[42rem] text-center">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
              {copy.howEyebrow}
            </p>
            <h2 className="mt-4 font-[family:var(--font-serif)] text-[clamp(1.95rem,3.8vw,3.4rem)] leading-[1.08] text-[var(--landing-green-deep)]">
              {copy.howTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--landing-muted)]">
              {copy.howBody}
            </p>
          </div>

          {/* 5-step process overview */}
          <div className="mt-12 grid gap-3 sm:grid-cols-5">
            {copy.howStepsOverview.map((step, i) => (
              <div
                key={step.number}
                className="landing-reveal flex flex-col items-center rounded-[18px] border border-[rgba(26,58,42,0.08)] bg-white p-5 text-center shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(126,200,80,0.14)] font-[family:var(--font-display)] text-sm font-bold text-[var(--landing-green-deep)]">
                  {step.number}
                </div>
                <p className="mt-3 font-semibold text-[0.9rem] text-[var(--landing-green-deep)]">
                  {step.label}
                </p>
                <p className="mt-1 text-[0.75rem] leading-[1.5] text-[var(--landing-muted)]">
                  {step.desc}
                </p>
                {i < copy.howStepsOverview.length - 1 && (
                  <span className="absolute hidden" />
                )}
              </div>
            ))}
          </div>

          {/* Sprint weeks detail */}
          <div className="mt-16">
            <p className="landing-reveal mb-8 text-center text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
              {copy.howIntroLabel}
            </p>

            <div className="grid gap-8 lg:grid-cols-[1.06fr_0.72fr]">
              <div className="space-y-0">
                {sprintSteps.map((step) => (
                  <div
                    key={step.number}
                    className="landing-reveal grid gap-5 border-b border-dashed border-[rgba(26,58,42,0.12)] py-8 sm:grid-cols-[68px_1fr]"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[rgba(26,58,42,0.14)] font-[family:var(--font-display)] text-base font-bold text-[var(--landing-green-deep)]">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="font-[family:var(--font-serif)] text-[1.42rem] leading-tight text-[var(--landing-green-deep)]">
                        {step.title}
                      </h3>
                      <p className="mt-3 max-w-xl text-[0.92rem] leading-7 text-[var(--landing-muted)]">
                        {step.body}
                      </p>
                      <div className="mt-4">
                        <span className="inline-flex rounded-full bg-[rgba(126,200,80,0.12)] px-3.5 py-1.5 text-[0.78rem] font-semibold text-[var(--landing-green-mid)]">
                          {step.tag}
                        </span>
                        {step.checklist && (
                          <ul className="mt-3 space-y-1.5">
                            {step.checklist.map((item) => (
                              <li
                                key={item}
                                className="flex items-center gap-2 text-[0.88rem] text-[var(--landing-green-deep)]"
                              >
                                <span className="text-[var(--landing-sprout)]">&#10003;</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                        {step.guarantee && (
                          <p className="mt-4 rounded-xl border border-[rgba(126,200,80,0.3)] bg-[rgba(126,200,80,0.08)] px-4 py-3 text-[0.85rem] font-semibold text-[var(--landing-green-deep)]">
                            {step.guarantee}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <aside className="landing-reveal lg:sticky lg:top-28">
                <div className="relative min-h-[380px] overflow-hidden rounded-[24px] bg-[var(--landing-green-deep)] sm:min-h-[460px]">
                  <Image
                    src="/Wagner.profile2-CBfCr4Al.png"
                    alt="BizSproutAI founder portrait"
                    fill
                    sizes="(max-width: 1024px) 100vw, 34vw"
                    className="object-cover object-top"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--landing-green-deep)] to-transparent" />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: What happens after validation ── */}
      <section className="px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="landing-reveal mx-auto max-w-[42rem] text-center">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
              {copy.afterValidationEyebrow}
            </p>
            <h2 className="mt-4 font-[family:var(--font-serif)] text-[clamp(1.95rem,3.8vw,3.4rem)] leading-[1.08] text-[var(--landing-green-deep)]">
              {copy.afterValidationTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--landing-muted)]">
              {copy.afterValidationBody}
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {/* Free column */}
            <div className="landing-reveal rounded-[24px] border border-[rgba(26,58,42,0.1)] bg-[var(--landing-cream)] p-8">
              <div className="inline-flex rounded-full border border-[rgba(26,58,42,0.15)] bg-white px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--landing-green-mid)]">
                {copy.afterValidationFreeBadge}
              </div>
              <h3 className="mt-4 font-[family:var(--font-serif)] text-[1.45rem] leading-tight text-[var(--landing-green-deep)]">
                {copy.afterValidationFreeTitle}
              </h3>
              <ul className="mt-5 space-y-3">
                {copy.afterValidationFreeItems.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[0.92rem] text-[var(--landing-green-deep)]">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(126,200,80,0.2)] text-[0.65rem] text-[var(--landing-sprout)]">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl border border-[rgba(126,200,80,0.2)] bg-white px-4 py-3">
                <p className="text-[0.82rem] font-semibold text-[var(--landing-green-deep)]">
                  {copy.afterValidationFreeNote}
                </p>
              </div>
            </div>

            {/* Platform column */}
            <div className="landing-reveal rounded-[24px] bg-[var(--landing-green-deep)] p-8 text-white">
              <div className="inline-flex rounded-full bg-[var(--landing-amber)] px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--landing-ink)]">
                {copy.afterValidationPlatformBadge}
              </div>
              <h3 className="mt-4 font-[family:var(--font-serif)] text-[1.45rem] leading-tight">
                {copy.afterValidationPlatformTitle}
              </h3>
              <ul className="mt-5 space-y-3">
                {lc.platformFeatures.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[0.9rem] text-white/85">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(126,200,80,0.18)] text-[0.65rem] text-[var(--landing-sprout)]">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={phoneHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-[var(--landing-sprout)] px-5 py-3.5 text-[0.92rem] font-semibold text-[var(--landing-ink)] transition hover:brightness-105"
              >
                {copy.afterValidationCta}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 6: Sprint offer ── */}
      <section className="overflow-hidden bg-[var(--landing-green-deep)] px-5 py-20 text-white lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="landing-reveal mx-auto max-w-[42rem] text-center">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-sprout)]">
              {copy.servicesEyebrow}
            </p>
            <h2 className="mt-4 font-[family:var(--font-serif)] text-[clamp(1.95rem,3.8vw,3.4rem)] leading-[1.08]">
              {copy.servicesTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-white/68">
              {copy.servicesBody}
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            <article className="landing-reveal grid gap-8 rounded-[24px] border border-[rgba(126,200,80,0.22)] bg-[rgba(126,200,80,0.08)] p-7 lg:col-span-2 lg:grid-cols-2">
              <div>
                <div className="inline-flex rounded-full bg-[var(--landing-amber)] px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[var(--landing-ink)]">
                  {lc.featuredBadge}
                </div>
                <h3 className="mt-4 font-[family:var(--font-serif)] text-[1.55rem] leading-tight sm:text-[1.8rem]">
                  {lc.featuredTitle}
                </h3>
                <p className="mt-4 text-[0.9rem] leading-7 text-white/70">
                  {lc.featuredBody}
                </p>
                <a
                  href={phoneHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex text-[0.9rem] font-semibold text-[var(--landing-sprout)] transition hover:translate-x-1"
                >
                  {lc.featuredCta} →
                </a>
              </div>
              <div className="rounded-[18px] bg-white/[0.05] p-5">
                <div className="space-y-3 text-[0.9rem] text-white/82">
                  {lc.featuredChecklist.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(126,200,80,0.18)] text-[0.65rem] text-[var(--landing-sprout)]">
                        ✓
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </article>

            {lc.services.map((service) => (
              <article
                key={service.id}
                className="landing-reveal rounded-[20px] border border-white/10 bg-white/[0.05] p-7"
              >
                <h3 className="font-[family:var(--font-serif)] text-[1.45rem] leading-tight">
                  {service.title}
                </h3>
                <p className="mt-3 text-[0.9rem] leading-7 text-white/65">
                  {service.body}
                </p>
                <p className="mt-5 text-[0.9rem] font-semibold text-[var(--landing-sprout)]">
                  {service.cta}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 7: Testimonials ── */}
      <section id="outcomes" className="bg-[var(--landing-cream)] px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="landing-reveal mx-auto max-w-[42rem] text-center">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
              {copy.proofEyebrow}
            </p>
            <h2 className="mt-4 font-[family:var(--font-serif)] text-[clamp(1.95rem,3.8vw,3.4rem)] leading-[1.08] text-[var(--landing-green-deep)]">
              {copy.proofTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--landing-muted)]">
              {copy.proofBody}
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {lc.testimonials.map((item) => (
              <article
                key={item.name}
                className="landing-reveal rounded-[20px] border border-[rgba(26,58,42,0.07)] bg-white p-7 shadow-sm"
              >
                <div className="text-base tracking-[0.2em] text-[var(--landing-amber)]">
                  ★★★★★
                </div>
                <p className="mt-4 font-[family:var(--font-serif)] text-[1.05rem] leading-[1.55] text-[var(--landing-green-deep)]">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${item.color}`}
                  >
                    {item.initial}
                  </div>
                  <div>
                    <div className="text-[0.86rem] font-semibold text-[var(--landing-ink)]">
                      {item.name}
                    </div>
                    <div className="text-[0.75rem] text-[var(--landing-muted)]">
                      {item.role}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Signal stats strip ── */}
      <div className="landing-reveal border-y border-[rgba(26,58,42,0.08)] bg-[var(--warm-white)] px-5 py-10 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8">
          <div className="grid flex-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {signalStats.map((stat) => (
              <div key={stat.label}>
                <div className="font-[family:var(--font-display)] text-[2rem] font-extrabold text-[var(--landing-green-deep)]">
                  {stat.value}
                </div>
                <div className="mt-1 text-[0.8rem] text-[var(--landing-muted)]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <a
            href={validateHref}
            className="inline-flex rounded-full bg-[var(--landing-green-deep)] px-8 py-4 text-[1rem] font-bold text-white shadow-[0_4px_20px_rgba(26,58,42,0.2)] transition hover:-translate-y-0.5 hover:bg-[var(--landing-green-mid)] hover:shadow-[0_8px_28px_rgba(26,58,42,0.26)]"
          >
            {copy.signalCta} →
          </a>
        </div>
      </div>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-[var(--landing-cream)] px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="landing-reveal mx-auto max-w-[42rem] text-center">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
              FAQ
            </p>
            <h2 className="mt-4 font-[family:var(--font-serif)] text-[clamp(1.95rem,3.8vw,3.4rem)] leading-[1.08] text-[var(--landing-green-deep)]">
              {copy.faqTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--landing-muted)]">
              {copy.faqSubtitle}
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            {faqItems.map((item, index) => (
              <details
                key={item.question}
                open={index === 0}
                className="landing-reveal overflow-hidden rounded-[20px] border border-[rgba(26,58,42,0.08)] bg-white shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-6 py-5">
                  <span className="font-[family:var(--font-serif)] text-[1.12rem] leading-tight text-[var(--landing-green-deep)]">
                    {item.question}
                  </span>
                  <span className="text-xl font-light text-[var(--landing-green-light)]">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-6 text-[0.95rem] leading-7 text-[var(--landing-muted)]">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section id="cta" className="relative overflow-hidden px-5 py-20 lg:px-10">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(126,200,80,0.07),_transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="landing-reveal text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
            {copy.ctaEyebrow}
          </p>
          <h2 className="landing-reveal mt-4 font-[family:var(--font-serif)] text-[clamp(1.95rem,3.8vw,3.4rem)] leading-[1.08] text-[var(--landing-green-deep)]">
            {copy.ctaTitle}
            <br />
            <em className="text-[var(--landing-green-light)]">
              {copy.ctaEmphasis}
            </em>
          </h2>
          <p className="landing-reveal mx-auto mt-4 max-w-xl text-base leading-7 text-[var(--landing-muted)]">
            {copy.ctaBody}
          </p>
          <div className="landing-reveal mt-8 flex flex-wrap items-start justify-center gap-3">
            <a
              href={validateHref}
              className="inline-flex rounded-full bg-[var(--landing-green-deep)] px-9 py-4 text-[1.05rem] font-bold text-white shadow-[0_4px_24px_rgba(26,58,42,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--landing-green-mid)] hover:shadow-[0_12px_36px_rgba(26,58,42,0.28)]"
            >
              {copy.ctaPrimary} →
            </a>
            <div className="flex flex-col items-center gap-1">
              <a
                href={phoneHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full border border-[rgba(26,58,42,0.2)] px-7 py-4 text-base font-semibold text-[var(--landing-green-deep)] transition hover:border-[var(--landing-green-deep)] hover:bg-[rgba(26,58,42,0.04)]"
              >
                {copy.ctaSecondary}
              </a>
              <span className="text-[0.73rem] text-[var(--landing-muted)]">
                {copy.ctaDiagNote}
              </span>
            </div>
          </div>
          <p className="landing-reveal mt-6 text-sm text-[var(--landing-muted)]">
            {copy.emailPrefix}{" "}
            <a
              href={emailHref}
              className="font-semibold text-[var(--landing-green-deep)] underline underline-offset-4"
            >
              info@bizsproutai.com
            </a>
          </p>
        </div>
      </section>

      {/* ── Booking calendar — secondary / lower-intent path ── */}
      <section className="bg-[var(--landing-cream)] px-5 pb-8 pt-6 lg:px-10 lg:pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="landing-reveal text-center">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
              {copy.bookingSectionEyebrow}
            </p>
            <h2 className="mt-4 font-[family:var(--font-serif)] text-[clamp(1.9rem,3.6vw,3rem)] leading-tight text-[var(--landing-green-deep)]">
              {lc.bookingTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[var(--landing-muted)]">
              {lc.bookingSubheading}
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[var(--landing-muted)]">
              {copy.bookingSectionNote}
            </p>
          </div>

          <div className="landing-reveal mt-10 rounded-[28px] border border-[rgba(26,58,42,0.1)] bg-white p-4 shadow-[0_24px_60px_rgba(26,58,42,0.08)] md:p-6">
            <BookingCalendar
              title="Founder Sprint Fit Call"
              subtitle={lc.bookingSubtitle}
              hideHeader
              className="max-w-none"
              frameClassName="overflow-hidden rounded-[1.5rem] border border-[rgba(26,58,42,0.08)] bg-white shadow-[0_18px_50px_rgba(26,58,42,0.08)]"
            />
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "BizSproutAI",
              url: "https://validate.bizsproutai.com",
              logo: "https://validate.bizsproutai.com/bizsproutai-logo.png",
              description:
                "BizSproutAI helps early-stage founders validate their idea for free, get their clearest next step, and move into a full 30-day launch sprint with hands-on support.",
              sameAs: [],
              contactPoint: {
                "@type": "ContactPoint",
                email: "info@bizsproutai.com",
                contactType: "customer support",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "Course",
              name: "30-Day Founder Sprint",
              description:
                "A done-with-you founder sprint that helps early-stage founders validate their idea, build the right launch asset, start real conversations, and reach their first paying customer in 30 days.",
              provider: {
                "@type": "Organization",
                name: "BizSproutAI",
                url: "https://validate.bizsproutai.com",
              },
              hasCourseInstance: {
                "@type": "CourseInstance",
                courseMode: "online",
                duration: "P30D",
              },
              offers: {
                "@type": "Offer",
                category: "Business Launch Program",
                availability: "https://schema.org/LimitedAvailability",
                url: "https://cal.com/bizsproutai/30-min-founder-clarity-session",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqItems.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.answer,
                },
              })),
            },
          ]),
        }}
      />
    </main>
  );
}
