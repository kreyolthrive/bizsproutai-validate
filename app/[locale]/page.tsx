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
      heroLead: "Amenez votre idée",
      heroLeadLine2: "à son ",
      heroEmphasis: "premier client.",
      heroBody:
        "La plupart des fondateurs ne calent pas à cause d'une mauvaise idée. Ils calent parce qu'ils ne savent pas quoi faire en premier. La validation gratuite vous montre exactement où vous en êtes et votre prochain mouvement le plus clair — en moins d'une minute.",
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
        "Gratuit pour commencer. Sans compte. Si vous rejoignez le Sprint et n'avez pas encore décroché votre premier client payant en 30 jours, nous continuons à travailler avec vous sans frais supplémentaires jusqu'à ce que ce soit le cas.",
      trustTitle: "Fondateurs déjà en pilote",
      trustMeta: "Cohorte initiale — places limitées",

      /* ── Booking section ── */
      bookingSectionEyebrow: "Vous préférez parler d'abord ?",
      bookingSectionNote:
        "L'appel de diagnostic est une option secondaire pour les fondateurs qui préfèrent discuter avant de commencer. La validation gratuite reste la voie la plus rapide.",
    };
  }

  if (normalized === "es") {
    return {
      heroEyebrow: "Validación de idea gratuita",
      heroLead: "Lleva tu idea",
      heroLeadLine2: "a su ",
      heroEmphasis: "primer cliente.",
      heroBody:
        "La mayoría de los fundadores no se estancan por una mala idea. Se estancan porque no saben qué hacer primero. La validación gratuita te dice exactamente dónde estás y tu próximo movimiento más claro — en menos de un minuto.",
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
        "Gratis para empezar. Sin cuenta. Si te unes al Sprint y aún no has conseguido tu primer cliente de pago en 30 días, seguimos trabajando contigo sin costo adicional hasta que lo logres.",
      trustTitle: "Fundadores ya en piloto",
      trustMeta: "Cohorte inicial — plazas limitadas",

      bookingSectionEyebrow: "¿Prefieres hablar primero?",
      bookingSectionNote:
        "La llamada diagnóstico es una opción secundaria para fundadores que prefieren hablar antes de empezar. La validación gratuita sigue siendo la ruta más rápida.",
    };
  }

  if (normalized === "ht") {
    return {
      heroEyebrow: "Validasyon lide gratis",
      heroLead: "Mennen lide ou",
      heroLeadLine2: "rive nan ",
      heroEmphasis: "premye kliyan li.",
      heroBody:
        "Pifò fondatè pa bloke akòz yon move lide. Yo bloke paske yo pa konnen sa pou yo fè an premye. Validasyon gratis di ou egzakteman kote ou ye ak pwochen mouvman ou ki pi klè — nan mwens pase yon minit.",
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
        "Gratis pou kòmanse. San kont. Si ou rantre nan Sprint la epi ou poko jwenn premye kliyan peyan ou nan 30 jou, nou kontinye travay avèk ou san frè siplemantè jiskaske ou jwenn.",
      trustTitle: "Fondatè deja nan pilòt",
      trustMeta: "Premye gwoup — plas limite",

      bookingSectionEyebrow: "Ou pito pale an premye?",
      bookingSectionNote:
        "Apèl dyagnostik la se yon opsyon segondè pou fondatè ki pito pale anvan yo kòmanse. Validasyon gratis rete wout ki pi rapid la.",
    };
  }

  if (normalized === "pt") {
    return {
      heroEyebrow: "Validação de ideia gratuita",
      heroLead: "Leve sua ideia",
      heroLeadLine2: "ao seu ",
      heroEmphasis: "primeiro cliente.",
      heroBody:
        "A maioria dos fundadores não trava por causa de uma ideia ruim. Eles travam porque não sabem o que fazer primeiro. A validação gratuita te diz exatamente onde você está e seu próximo movimento mais claro — em menos de um minuto.",
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
        "Gratuito para começar. Sem conta. Se você entrar no Sprint e ainda não tiver conseguido seu primeiro cliente pagante em 30 dias, continuamos trabalhando com você sem custo adicional até conseguir.",
      trustTitle: "Fundadores já no piloto",
      trustMeta: "Coorte inicial — vagas limitadas",

      bookingSectionEyebrow: "Prefere falar primeiro?",
      bookingSectionNote:
        "A chamada diagnóstico é uma opção secundária para fundadores que preferem conversar antes de começar. A validação gratuita continua sendo a rota mais rápida.",
    };
  }

  return {
    /* ── Hero ── */
    heroEyebrow: "Free Business Validation",
    heroLead: "Get your idea",
    heroLeadLine2: "to its ",
    heroEmphasis: "first customer.",
    heroBody:
      "Most founders don't stall because of a bad idea. They stall because they don't know what to do first. Free validation tells you exactly where you are and your clearest next move — in under a minute.",
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
      "Free to start. No account needed. If you join the Sprint and still haven't landed your first paying customer in 30 days, we continue working with you at no extra cost until you do.",
    trustTitle: "Founders already in pilot",
    trustMeta: "Early cohort — spots limited",

    /* ── Booking section ── */
    bookingSectionEyebrow: "Prefer to talk first?",
    bookingSectionNote:
      "The fit call is a secondary option for founders who prefer to speak before starting. Free validation is still the fastest path.",
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const copy = getCopy(locale);
  const lc = getLandingCopy(locale);
  const validateHref = `/${locale}/validate`;
  const focusItems = lc.painItems.slice(0, 4);

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

            <h1 className="landing-reveal mt-6 max-w-[18ch] font-[family:var(--font-serif)] text-[clamp(2.6rem,4.2vw,3.8rem)] leading-[1.08] tracking-[-0.01em] text-[var(--landing-green-deep)]">
              {copy.heroLead}
              {copy.heroEmphasis && (
                <>
                  <br />
                  {copy.heroLeadLine2}
                  <em className="italic text-[var(--landing-green-light)]">{copy.heroEmphasis}</em>
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
            <div className="landing-reveal mt-8 flex items-start gap-3 rounded-xl border border-[rgba(26,58,42,0.1)] bg-white/70 px-[18px] py-[14px] [border-left:3px_solid_var(--landing-sprout)]">
              <span className="mt-0.5 flex-shrink-0 text-[1.1rem]">🛡️</span>
              <p className="text-[0.85rem] leading-[1.55] text-[var(--landing-ink)]">
                <strong className="font-semibold text-[var(--landing-green-deep)]">{copy.guaranteeTitle}.</strong>{" "}
                {copy.guaranteeBody}
              </p>
            </div>

            {/* Micro-trust avatars */}
            <div className="landing-reveal mt-6 flex items-center gap-3">
              <div className="flex">
                {(
                  [
                    { i: "D", bg: "bg-[var(--landing-green-mid)]", text: "text-white" },
                    { i: "R", bg: "bg-[#3d7a55]", text: "text-white" },
                    { i: "L", bg: "bg-[var(--landing-green-light)]", text: "text-white" },
                    { i: "S", bg: "bg-[var(--landing-amber)]", text: "text-[var(--landing-ink)]" },
                  ] as const
                ).map(({ i, bg, text }, idx) => (
                  <div
                    key={i}
                    style={{ marginLeft: idx === 0 ? 0 : "-8px" }}
                    className={`flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--warm-white)] ${bg} ${text} text-[0.65rem] font-bold`}
                  >
                    {i}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[0.78rem] font-semibold text-[var(--landing-green-deep)]">
                  {copy.trustTitle}
                </p>
                <p className="text-[0.72rem] text-[var(--landing-muted)]">{copy.trustMeta}</p>
              </div>
            </div>

            {/* Testimonials */}
            <div className="landing-reveal mt-8 space-y-[10px]">
              <div className="flex gap-3 rounded-[14px] border border-[rgba(26,58,42,0.1)] bg-white p-4 shadow-sm transition hover:translate-x-0.5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--landing-green-mid)] text-[0.7rem] font-bold text-white">D</div>
                <div>
                  <p className="text-[0.83rem] leading-[1.55] text-[var(--landing-ink)]">&ldquo;I had too many ideas and no idea where to start. Getting a clear next step changed everything for me.&rdquo;</p>
                  <p className="mt-[5px] text-[0.72rem] text-[var(--landing-muted)]"><strong className="text-[var(--landing-green-deep)]">Doha</strong> · Early pilot founder</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-[14px] border border-[rgba(26,58,42,0.1)] bg-white p-4 shadow-sm transition hover:translate-x-0.5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#4a8c5c] text-[0.7rem] font-bold text-white">R</div>
                <div>
                  <p className="text-[0.83rem] leading-[1.55] text-[var(--landing-ink)]">&ldquo;My site hadn&rsquo;t matched my real offer in over a year. Within days we had messaging that finally made sense.&rdquo;</p>
                  <p className="mt-[5px] text-[0.72rem] text-[var(--landing-muted)]"><strong className="text-[var(--landing-green-deep)]">Rembert</strong> · Creative services founder</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-[14px] border border-[rgba(26,58,42,0.1)] bg-white p-4 shadow-sm transition hover:translate-x-0.5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--landing-amber)] text-[0.7rem] font-bold text-[var(--landing-ink)]">L</div>
                <div>
                  <p className="text-[0.83rem] leading-[1.55] text-[var(--landing-ink)]">&ldquo;I just needed someone to tell me what to build first. That&rsquo;s exactly what the validation did.&rdquo;</p>
                  <p className="mt-[5px] text-[0.72rem] text-[var(--landing-muted)]"><strong className="text-[var(--landing-green-deep)]">Liv</strong> · Service business owner</p>
                </div>
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

      {/* ── Section 2: Pain — Why founders stall ── */}
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

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {focusItems.slice(0, 3).map((item) => (
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

      {/* ── Section 3: Guarantee + CTA bridge ── */}
      <section className="bg-[var(--landing-cream)] px-5 py-16 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="landing-reveal mx-auto mb-8 flex max-w-xl items-start gap-3 rounded-xl border border-[rgba(26,58,42,0.1)] bg-white/70 px-[18px] py-[14px] text-left [border-left:3px_solid_var(--landing-sprout)]">
            <span className="mt-0.5 flex-shrink-0 text-[1.1rem]">🛡️</span>
            <p className="text-[0.85rem] leading-[1.55] text-[var(--landing-ink)]">
              <strong className="font-semibold text-[var(--landing-green-deep)]">{copy.guaranteeTitle}.</strong>{" "}
              {copy.guaranteeBody}
            </p>
          </div>

          <div className="landing-reveal flex flex-col items-center gap-3">
            <a
              href={validateHref}
              className="inline-flex items-center justify-center rounded-full bg-[var(--landing-green-deep)] px-10 py-4 text-[1.05rem] font-bold text-white shadow-[0_4px_24px_rgba(26,58,42,0.2)] transition hover:-translate-y-0.5 hover:bg-[var(--landing-green-mid)] hover:shadow-[0_10px_36px_rgba(26,58,42,0.28)]"
            >
              {lc.validationCta} →
            </a>
            <p className="text-[0.8rem] text-[var(--landing-muted)]">{copy.freeResultCtaNote}</p>
            <a
              href="#booking"
              className="mt-2 text-[0.88rem] font-semibold text-[var(--landing-muted)] underline underline-offset-4 transition hover:text-[var(--landing-green-deep)]"
            >
              {copy.ctaSecondary} ↓
            </a>
            <p className="text-[0.73rem] text-[var(--landing-muted)]">{copy.ctaDiagNote}</p>
          </div>
        </div>
      </section>

      {/* ── Section 4: Booking calendar ── */}
      <section id="booking" className="px-5 pb-16 pt-12 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="landing-reveal text-center">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
              {copy.bookingSectionEyebrow}
            </p>
            <h2 className="mt-4 font-[family:var(--font-serif)] text-[clamp(1.9rem,3.6vw,3rem)] leading-tight text-[var(--landing-green-deep)]">
              {lc.bookingTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--landing-muted)]">
              {lc.bookingSubheading}
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
              "@type": "Service",
              name: "30-Day Founder Sprint",
              description:
                "A done-with-you founder sprint that helps early-stage founders validate their idea, build the right launch asset, start real conversations, and reach their first paying customer in 30 days.",
              provider: {
                "@type": "Organization",
                name: "BizSproutAI",
                url: "https://validate.bizsproutai.com",
              },
              offers: {
                "@type": "Offer",
                category: "Business Launch Program",
                availability: "https://schema.org/LimitedAvailability",
                url: "https://cal.com/bizsproutai/30-min-founder-clarity-session",
              },
            },
          ]),
        }}
      />
    </main>
  );
}
