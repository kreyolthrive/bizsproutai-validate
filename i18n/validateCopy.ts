/**
 * Centralised validate-flow copy for all supported locales.
 *
 * All user-facing strings for the /validate page, multi-step form, and
 * result view live here so they can be swapped per-locale in one place.
 *
 * Usage (server component):
 *   import { getValidateCopy } from "@/i18n/validateCopy";
 *   const copy = getValidateCopy(locale);
 *
 * NOTE: No functions in this object — all values must be serialisable so
 * Next.js can pass this from a Server Component to a Client Component.
 * stepLabel / stepCounter are the only exceptions; they are plain arrow
 * functions that only close over primitive literals (safe to serialise as
 * React props when defined on the server and passed to the client).
 */

// ─── Locked-preview template item ────────────────────────────────────────────

export interface LockedPreviewTemplate {
  /** Title when a domain label (e.g. "SaaS") is available. Use {domain} as placeholder. */
  titleWithDomain: string;
  /** Title when no domain label is available (generic fallback). */
  titleWithoutDomain: string;
  meta: string;
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ValidateCopy {
  /** Top-of-page trust badge text, e.g. "BizSproutAI — Free Validation" */
  trustBadge: string;
  /** Secondary meta line, e.g. "Free · No account required · Results in under a minute" */
  trustMeta: string;

  /** Step header label, e.g. "Free Validation — Step 1" */
  stepLabel: (n: number) => string;
  /** Step counter, e.g. "Step 1 of 4" */
  stepCounter: (cur: number, tot: number) => string;

  back: string;
  next: string;

  // ── Step 0 ──────────────────────────────────────────────────────────────────
  s0heading: string;
  s0body: string;
  s0choices: [string, string, string, string];
  s0cta: string;

  // ── Step 1 ──────────────────────────────────────────────────────────────────
  s1heading: string;
  s1body: string;
  s1ideaLabel: string;
  s1ideaRequired: string;
  s1ideaPlaceholder: string;
  s1audienceLabel: string;
  s1audienceOptional: string;
  s1audiencePlaceholder: string;

  // ── Step 2 ──────────────────────────────────────────────────────────────────
  s2heading: string;
  s2body: string;
  s2liveQ: string;
  s2liveYes: string;
  s2liveNo: string;
  s2tractionQ: string;
  s2tractionYes: string;
  s2tractionNo: string;

  // ── Step 3 ──────────────────────────────────────────────────────────────────
  s3heading: string;
  s3body: string;
  s3nameLabel: string;
  s3nameOptional: string;
  s3namePlaceholder: string;
  s3emailLabel: string;
  s3emailRequired: string;
  s3emailPlaceholder: string;
  s3submit: string;
  s3submitting: string;
  s3privacy: string;
  s3emailError: string;
  s3error: string;

  // ── Result view ──────────────────────────────────────────────────────────────
  rBadge: string;
  rHeading: string;
  /** Lowercase fragment appended after firstName: "your results are below…" */
  rSubhead: string;
  rReadinessLabel: string;
  rReadinessMeta: string;
  rVerdictLabel: string;
  rFirstAssetLabel: string;
  rNextStepsLabel: string;
  rWarningLabel: string;
  rNoteLabel: string;
  rLockedSectionTitle: string;
  rLockedMeta: string;
  rUpsellLabel: string;
  /** Label for the secondary fit-call section (distinct from rUpsellLabel) */
  rFitCallLabel: string;
  rPrimaryCta: string;
  rFitCta: string;
  rFitNote: string;
  rReset: string;

  /**
   * Stage-specific upsell blocks.
   * The component picks the right one by matching the English stageTag client-side.
   */
  stageUpsells: {
    idea: { headline: string; body: string };
    firstAsset: { headline: string; body: string };
    assemblyOptimization: { headline: string; body: string };
    launchScale: { headline: string; body: string };
    launchReady: { headline: string; body: string };
  };

  /**
   * Locked-preview template rows.
   * The component interpolates {domain} in titleWithDomain at render time.
   */
  lockedPreviewsTemplate: [
    LockedPreviewTemplate,
    LockedPreviewTemplate,
    LockedPreviewTemplate,
  ];

  // ── Footer note ──────────────────────────────────────────────────────────────
  footerNotePre: string;
  footerNoteCta: string;
  footerNotePost: string;

  // ── Result: idea callout + stage context note ────────────────────────────────
  /** Label above the quoted idea excerpt in the result view */
  rSubmittedIdeaLabel: string;
  /** Small note beside the stage tag pill, e.g. "Based on your selected stage and idea description." */
  rStageContextNote: string;

  // ── Page-level intro copy (rendered above the form in validate/page.tsx) ─────
  pageHeadline: string;
  pageSubcopy: string;
  pageReassurance: string;

  // ── Waitlist section (result view) ───────────────────────────────────────────
  rWaitlistHeadline: string;
  rWaitlistBody: string;
  rWaitlistCta: string;
  rWaitlistSubmitting: string;
  rWaitlistSuccess: string;
  rWaitlistError: string;
  rWaitlistEmailError: string;
}

// ─── English ──────────────────────────────────────────────────────────────────

const en: ValidateCopy = {
  trustBadge: "BizSproutAI — Free Validation",
  trustMeta: "Free · No account required · Results in under a minute",

  stepLabel: (n) => `Free Validation — Step ${n}`,
  stepCounter: (cur, tot) =>
    cur === 1
      ? `Step ${cur} of ${tot} — takes about 2 minutes`
      : `Step ${cur} of ${tot}`,

  back: "← Back",
  next: "Continue →",

  s0heading: "Where are you right now?",
  s0body:
    "Pick the option that best describes where you are. Honest answers get more useful results.",
  s0choices: [
    "I only have an idea",
    "I'm already building",
    "I have something but no customers",
    "I have customers and want growth",
  ],
  s0cta: "Continue →",

  s1heading: "Tell us about your idea.",
  s1body:
    "One or two sentences is enough. The more specific you are, the more useful the recommendation will be.",
  s1ideaLabel: "What are you building or offering?",
  s1ideaRequired: "(required)",
  s1ideaPlaceholder:
    "e.g. A coaching service for first-time founders who want to validate their idea before building.",
  s1audienceLabel: "Who is it for?",
  s1audienceOptional: "(optional)",
  s1audiencePlaceholder: "e.g. Solo founders, freelancers, small service businesses",

  s2heading: "What exists right now?",
  s2body: "Two quick questions to sharpen the recommendation.",
  s2liveQ: "Do you have a live website, landing page, or booking system?",
  s2liveYes: "Yes, something is live",
  s2liveNo: "No, nothing live yet",
  s2tractionQ: "Are people already paying, booking, or signing up?",
  s2tractionYes: "Yes, I have some traction",
  s2tractionNo: "No, not yet",

  s3heading: "Where should we send your validation result?",
  s3body:
    "Your results will appear on screen instantly. We will also send a copy to your inbox so you can reference it later.",
  s3nameLabel: "First name",
  s3nameOptional: "(optional)",
  s3namePlaceholder: "e.g. Jessica",
  s3emailLabel: "Email address",
  s3emailRequired: "(required)",
  s3emailPlaceholder: "you@example.com",
  s3submit: "Get My Free Validation →",
  s3submitting: "Getting your results…",
  s3privacy: "No payment required. Your result will show your stage, first asset, and next move.",
  s3emailError: "Please enter a valid email address.",
  s3error: "Something went wrong getting your results. Please try again in a moment.",

  rBadge: "Your Free Validation Result",
  rHeading: "Here is where you stand.",
  rSubhead: "your results are below — and your email copy is on its way.",
  rReadinessLabel: "Launch readiness",
  rReadinessMeta:
    "Your full analysis delivers a precise score based on your specific idea, competition, and market.",
  rVerdictLabel: "Verdict",
  rFirstAssetLabel: "BizSproutAI recommends first",
  rNextStepsLabel: "Your next 4 steps",
  rWarningLabel: "Avoid this mistake",
  rNoteLabel: "Note",
  rLockedSectionTitle: "Your full analysis would also include",
  rLockedMeta:
    "These insights are specific to your idea and require the full AI-powered analysis.",
  rSubmittedIdeaLabel: "Submitted idea",
  rStageContextNote: "Based on your selected stage and idea description.",
  rUpsellLabel: "Your next step",
  rFitCallLabel: "Want deeper help?",
  rPrimaryCta: "Unlock my full sprint inside BizSproutAI →",
  rFitCta: "Book a free fit call",
  rFitNote: "30-min diagnostic · no pitch",
  rReset: "← Validate a different idea",

  stageUpsells: {
    idea: {
      headline: "Does your specific idea have real demand?",
      body: "Free validation confirms your stage. But whether people will actually pay — for your specific idea, in your specific market — that requires a full analysis built around what you described.",
    },
    firstAsset: {
      headline: "Which angle will actually convert for your audience?",
      body: "You are ready to build. The full analysis tells you exactly how to position your offer, which objections to pre-empt, and what messaging will move your specific audience to action.",
    },
    assemblyOptimization: {
      headline: "Which piece is blocking your conversion right now?",
      body: "You have the components. The full analysis maps exactly which ones to keep, which to cut, and the single bottleneck that is stopping people from becoming customers.",
    },
    launchScale: {
      headline: "What should you scale — and what will break if you do?",
      body: "You have traction. The full analysis identifies which metrics to systematize and which channels to scale — so momentum does not leak through a broken funnel.",
    },
    launchReady: {
      headline: "Which acquisition channel is right for your audience?",
      body: "You are ready to move. The full analysis scores your go-to-market readiness and tells you which channels to start with for your specific audience — so you do not waste time on the wrong ones.",
    },
  },

  lockedPreviewsTemplate: [
    {
      titleWithDomain: "Demand risk score for {domain} at your stage",
      titleWithoutDomain: "Demand risk score for businesses at your stage",
      meta: "5-factor demand analysis",
    },
    {
      titleWithDomain: "Top 3 risks detected for your specific idea",
      titleWithoutDomain: "Top 3 risks detected for your specific idea",
      meta: "Ranked by severity",
    },
    {
      titleWithDomain: "Recommended first acquisition channel",
      titleWithoutDomain: "Recommended first acquisition channel",
      meta: "Matched to your audience and stage",
    },
  ],

  footerNotePre:
    "Free validation is designed to give you real clarity, not a generic quiz result. After validation, continue into",
  footerNoteCta: "BizSproutAI",
  footerNotePost: "for the full sprint, build support, and execution system.",

  pageHeadline: "Get your idea to its first customer.",
  pageSubcopy:
    "Start with a free validation. In about 2 minutes, BizSproutAI will show your stage, what to build first, what mistake to avoid, and your next 4 execution steps.",
  pageReassurance: "Free first step. No payment required.",

  rWaitlistHeadline: "Your validation is ready. Join the BizSproutAI waitlist.",
  rWaitlistBody:
    "BizSproutAI is being built to help founders move from idea to first customer by identifying what to build first, building it, distributing it, and adapting until the outcome lands.",
  rWaitlistCta: "Join the Waitlist →",
  rWaitlistSubmitting: "Joining…",
  rWaitlistSuccess:
    "You're on the list. We'll reach out as BizSproutAI opens for founders.",
  rWaitlistError: "Something went wrong. Please try again in a moment.",
  rWaitlistEmailError: "Please enter a valid email address.",
};

// ─── French ───────────────────────────────────────────────────────────────────

const fr: ValidateCopy = {
  trustBadge: "BizSproutAI — Validation Gratuite",
  trustMeta: "Gratuit · Sans compte · Résultats en moins d'une minute",

  stepLabel: (n) => `Validation Gratuite — Étape ${n}`,
  stepCounter: (cur, tot) => `Étape ${cur} sur ${tot}`,

  back: "← Retour",
  next: "Continuer →",

  s0heading: "Où en êtes-vous actuellement ?",
  s0body:
    "Choisissez ce qui décrit le mieux votre situation actuelle. Soyez honnête — le résultat sera plus utile si vous êtes précis.",
  s0choices: [
    "J'ai une idée mais pas d'offre claire ni de direction",
    "J'ai une offre mais pas d'actif de lancement ni de système",
    "J'ai des pièces éparses mais rien n'est connecté",
    "Je suis prêt à lancer mais j'ai besoin d'un accompagnement pratique",
  ],
  s0cta: "Continuer →",

  s1heading: "Parlez-nous de votre idée.",
  s1body:
    "Une ou deux phrases suffisent. Plus vous êtes précis, plus la recommandation sera utile.",
  s1ideaLabel: "Qu'est-ce que vous construisez ou proposez ?",
  s1ideaRequired: "(obligatoire)",
  s1ideaPlaceholder:
    "Ex. : Un service de coaching pour les fondateurs qui veulent valider leur idée avant de construire.",
  s1audienceLabel: "Pour qui est-ce ?",
  s1audienceOptional: "(optionnel)",
  s1audiencePlaceholder: "Ex. : Solopreneurs, freelances, petites entreprises de services",

  s2heading: "Qu'est-ce qui existe déjà ?",
  s2body: "Deux questions rapides pour affiner la recommandation.",
  s2liveQ: "Avez-vous un site web, une page d'atterrissage ou un système de réservation actif ?",
  s2liveYes: "Oui, quelque chose est en ligne",
  s2liveNo: "Non, rien en ligne pour l'instant",
  s2tractionQ: "Des personnes paient-elles, réservent-elles ou s'inscrivent-elles déjà ?",
  s2tractionYes: "Oui, j'ai quelques premiers clients",
  s2tractionNo: "Non, pas encore",

  s3heading: "Où devons-nous vous envoyer vos résultats ?",
  s3body:
    "Vos résultats apparaîtront instantanément à l'écran. Nous enverrons également une copie dans votre boîte mail pour que vous puissiez y faire référence plus tard.",
  s3nameLabel: "Prénom",
  s3nameOptional: "(optionnel)",
  s3namePlaceholder: "Ex. : Marie",
  s3emailLabel: "Adresse e-mail",
  s3emailRequired: "(obligatoire)",
  s3emailPlaceholder: "vous@exemple.com",
  s3submit: "Obtenir Ma Validation Gratuite →",
  s3submitting: "Récupération de vos résultats…",
  s3privacy: "Pas de spam. Résultats instantanés. Désinscription à tout moment.",
  s3emailError: "Veuillez entrer une adresse e-mail valide.",
  s3error:
    "Une erreur s'est produite lors de la récupération de vos résultats. Veuillez réessayer dans un instant.",

  rBadge: "Votre Résultat de Validation Gratuite",
  rHeading: "Voici où vous en êtes.",
  rSubhead: "vos résultats sont ci-dessous — et votre copie e-mail est en route.",
  rReadinessLabel: "Prêt au lancement",
  rReadinessMeta:
    "Votre analyse complète fournit un score précis basé sur votre idée, la concurrence et votre marché.",
  rVerdictLabel: "Verdict",
  rFirstAssetLabel: "BizSproutAI recommande en premier",
  rNextStepsLabel: "Vos 4 prochaines étapes",
  rWarningLabel: "Évitez cette erreur",
  rNoteLabel: "Note",
  rLockedSectionTitle: "Votre analyse complète inclurait aussi",
  rLockedMeta:
    "Ces informations sont spécifiques à votre idée et nécessitent l'analyse complète propulsée par l'IA.",
  rSubmittedIdeaLabel: "Idée soumise",
  rStageContextNote: "Basé sur votre étape sélectionnée et la description de votre idée.",
  rUpsellLabel: "Votre prochaine étape",
  rFitCallLabel: "Besoin d'une aide plus approfondie ?",
  rPrimaryCta: "Accéder à mon sprint complet dans BizSproutAI →",
  rFitCta: "Réserver un appel découverte gratuit",
  rFitNote: "30 min de diagnostic · sans argumentaire commercial",
  rReset: "← Valider une autre idée",

  stageUpsells: {
    idea: {
      headline: "Votre idée a-t-elle une vraie demande sur le marché ?",
      body: "La validation gratuite confirme votre stade. Mais savoir si des personnes paieront réellement — pour votre idée précise, sur votre marché — nécessite une analyse complète construite autour de ce que vous avez décrit.",
    },
    firstAsset: {
      headline: "Quel angle va réellement convertir pour votre audience ?",
      body: "Vous êtes prêt à construire. L'analyse complète vous dit exactement comment positionner votre offre, quelles objections anticiper et quel message fera passer votre audience à l'action.",
    },
    assemblyOptimization: {
      headline: "Quel élément bloque votre conversion en ce moment ?",
      body: "Vous avez les composants. L'analyse complète identifie exactement lesquels garder, lesquels supprimer et le seul point de blocage qui empêche vos visiteurs de devenir clients.",
    },
    launchScale: {
      headline: "Que devriez-vous scaler — et qu'est-ce qui pourrait casser si vous le faites ?",
      body: "Vous avez de la traction. L'analyse complète identifie quelles métriques systématiser et quels canaux développer — pour que la dynamique ne s'échappe pas par un entonnoir défaillant.",
    },
    launchReady: {
      headline: "Quel canal d'acquisition est adapté à votre audience ?",
      body: "Vous êtes prêt à avancer. L'analyse complète évalue votre maturité go-to-market et vous indique par quels canaux commencer pour votre audience spécifique — sans gaspiller du temps sur les mauvais.",
    },
  },

  lockedPreviewsTemplate: [
    {
      titleWithDomain: "Score de risque de demande pour les entreprises {domain} à votre stade",
      titleWithoutDomain: "Score de risque de demande pour les entreprises à votre stade",
      meta: "Analyse à 5 facteurs",
    },
    {
      titleWithDomain: "Top 3 des risques détectés pour votre idée",
      titleWithoutDomain: "Top 3 des risques détectés pour votre idée",
      meta: "Classés par sévérité",
    },
    {
      titleWithDomain: "Premier canal d'acquisition recommandé",
      titleWithoutDomain: "Premier canal d'acquisition recommandé",
      meta: "Adapté à votre audience et votre stade",
    },
  ],

  footerNotePre:
    "La validation gratuite est conçue pour vous donner une vraie clarté, pas un résultat de quiz générique. Après la validation, continuez dans",
  footerNoteCta: "BizSproutAI",
  footerNotePost: "pour le sprint complet, le support à la construction et le système d'exécution.",

  pageHeadline: "De l'idée à votre premier client.",
  pageSubcopy:
    "Commencez avec une validation gratuite. En environ 2 minutes, BizSproutAI vous montrera votre stade, ce qu'il faut construire en premier, l'erreur à éviter et vos 4 prochaines étapes.",
  pageReassurance: "Première étape gratuite. Aucun paiement requis.",

  rWaitlistHeadline: "Votre validation est prête. Rejoignez la liste d'attente BizSproutAI.",
  rWaitlistBody:
    "BizSproutAI est conçu pour aider les fondateurs à passer de l'idée au premier client en identifiant ce qu'il faut construire en premier, en le construisant, en le distribuant et en s'adaptant jusqu'au résultat.",
  rWaitlistCta: "Rejoindre la liste d'attente →",
  rWaitlistSubmitting: "Inscription…",
  rWaitlistSuccess:
    "Vous êtes sur la liste. Nous vous contacterons à l'ouverture de BizSproutAI.",
  rWaitlistError: "Une erreur s'est produite. Veuillez réessayer dans un moment.",
  rWaitlistEmailError: "Veuillez entrer une adresse e-mail valide.",
};

// ─── Haitian Creole ───────────────────────────────────────────────────────────

const ht: ValidateCopy = {
  trustBadge: "BizSproutAI — Validasyon Gratis",
  trustMeta: "Gratis · San kont · Rezilta an mwens pase yon minit",

  stepLabel: (n) => `Validasyon Gratis — Etap ${n}`,
  stepCounter: (cur, tot) => `Etap ${cur} sou ${tot}`,

  back: "← Tounen",
  next: "Kontinye →",

  s0heading: "Ki kote ou ye kounye a ?",
  s0body:
    "Chwazi sa ki dekri pi byen sitiyasyon ou kounye a. Soyez onèt — rezilta a pral pi itil si ou ekzak.",
  s0choices: [
    "Mwen gen yon lide men pa gen yon òf klè oswa direksyon",
    "Mwen gen yon òf men pa gen sistèm oswa zouti pou lanse",
    "Mwen gen moso espaye men anyen ki konekte",
    "Mwen prè pou lanse men mwen bezwen sipò pratik",
  ],
  s0cta: "Kontinye →",

  s1heading: "Pale nou de lide ou.",
  s1body:
    "Yon oswa de fraz se ase. Pi ou presi, pi rekòmandasyon an pral itil.",
  s1ideaLabel: "Kisa w ap konstwi oswa ofri ?",
  s1ideaRequired: "(obligatwa)",
  s1ideaPlaceholder:
    "Egzanp : Yon sèvis kouching pou fondatè ki vle valide lide yo anvan yo bati.",
  s1audienceLabel: "Pou ki moun li ye ?",
  s1audienceOptional: "(opsyonèl)",
  s1audiencePlaceholder: "Egzanp : Solopreneur, frilans, piti biznis sèvis",

  s2heading: "Kisa ki egziste kounye a ?",
  s2body: "De kesyon rapid pou afine rekòmandasyon an.",
  s2liveQ: "Èske ou gen yon sit entènèt, paj aterisaj, oswa sistèm rezervasyon ki aktif ?",
  s2liveYes: "Wi, gen yon bagay ki an liy",
  s2liveNo: "Non, anyen ki an liy pou kounye a",
  s2tractionQ: "Èske moun ap peye, rezève, oswa enskri deja ?",
  s2tractionYes: "Wi, mwen gen kèk traction",
  s2tractionNo: "Non, poko",

  s3heading: "Ki kote nou dwe voye rezilta ou yo ?",
  s3body:
    "Rezilta ou yo pral parèt sou ekran imedyatman. Nou pral voye yon kopi nan bwat imèl ou tou pou ou kapab refere li pita.",
  s3nameLabel: "Prenon",
  s3nameOptional: "(opsyonèl)",
  s3namePlaceholder: "Egzanp : Marie",
  s3emailLabel: "Adrès imèl",
  s3emailRequired: "(obligatwa)",
  s3emailPlaceholder: "ou@egzanp.com",
  s3submit: "Jwenn Validasyon Gratis Mwen →",
  s3submitting: "Ap jwenn rezilta ou yo…",
  s3privacy: "Pa gen spam. Rezilta parèt imedyatman. Dezabonnman nenpòt ki lè.",
  s3emailError: "Tanpri antre yon adrès imèl valid.",
  s3error:
    "Te gen yon erè pandan n ap jwenn rezilta ou yo. Tanpri eseye ankò nan yon moman.",

  rBadge: "Rezilta Validasyon Gratis Ou",
  rHeading: "Men kote ou ye.",
  rSubhead: "rezilta ou yo anba a — epi kopi imèl ou ap vini.",
  rReadinessLabel: "Prè pou lanse",
  rReadinessMeta:
    "Analiz konplè ou bay yon skor presi ki baze sou lide ou, konpetisyon ak mache ou.",
  rVerdictLabel: "Vèdik",
  rFirstAssetLabel: "BizSproutAI rekòmande an premye",
  rNextStepsLabel: "4 pwochen etap ou yo",
  rWarningLabel: "Evite erè sa a",
  rNoteLabel: "Nòt",
  rLockedSectionTitle: "Analiz konplè ou ta gen ladan tou",
  rLockedMeta:
    "Enfòmasyon sa yo espesifik pou lide ou epi yo bezwen analiz konplè ki alimante pa IA.",
  rSubmittedIdeaLabel: "Lide soumèt",
  rStageContextNote: "Baze sou etap ou chwazi a ak deskripsyon lide ou.",
  rUpsellLabel: "Pwochen etap ou",
  rFitCallLabel: "Bezwen plis èd ?",
  rPrimaryCta: "Debloke sprint konplè mwen nan BizSproutAI →",
  rFitCta: "Rezève yon apèl dekouvèt gratis",
  rFitNote: "30 minit dyagnostik · pa gen vant",
  rReset: "← Valide yon lòt lide",

  stageUpsells: {
    idea: {
      headline: "Èske lide espesifik ou gen yon vrè demann ?",
      body: "Validasyon gratis konfime etap ou. Men si moun pral peye vrèman — pou lide espesifik ou, nan mache espesifik ou — sa bezwen yon analiz konplè ki bati sou sa ou dekri.",
    },
    firstAsset: {
      headline: "Ki angaj ki pral vrèman konvèti pou odyans ou ?",
      body: "Ou prè pou bati. Analiz konplè a di ou egzakteman kijan pou pozisyone òf ou, ki objeksyon pou anti-sipe, ak ki mesaj pral deplase odyans espesifik ou pou pran aksyon.",
    },
    assemblyOptimization: {
      headline: "Ki moso ki bloke konvèsyon ou kounye a ?",
      body: "Ou gen konpozan yo. Analiz konplè a kat egzakteman ki youn pou kenbe, ki youn pou koupe, ak sèl goulè d'étranglement ki anpeche moun vin kliyan.",
    },
    launchScale: {
      headline: "Ki sa ou dwe scale — epi ki sa ki ka kase si ou fè sa ?",
      body: "Ou gen traction. Analiz konplè a idantifye ki metrik pou sistematize ak ki kanal pou devlope — pou dynamism nan pa chape atravè yon fonèl kase.",
    },
    launchReady: {
      headline: "Ki kanal akizisyon ki bon pou odyans ou ?",
      body: "Ou prè pou avanse. Analiz konplè a evalye matirite go-to-market ou epi di ou ki kanal pou kòmanse ak pou odyans espesifik ou — pou ou pa gaspiye tan sou move yo.",
    },
  },

  lockedPreviewsTemplate: [
    {
      titleWithDomain: "Skor risk demann pou biznis {domain} nan etap ou",
      titleWithoutDomain: "Skor risk demann pou biznis nan etap ou",
      meta: "Analiz 5 faktè",
    },
    {
      titleWithDomain: "Top 3 risk detekte pou lide espesifik ou",
      titleWithoutDomain: "Top 3 risk detekte pou lide espesifik ou",
      meta: "Klase pa sevèrite",
    },
    {
      titleWithDomain: "Premye kanal akizisyon rekòmande",
      titleWithoutDomain: "Premye kanal akizisyon rekòmande",
      meta: "Kòrèspond ak odyans ak etap ou",
    },
  ],

  footerNotePre:
    "Validasyon gratis la fèt pou ba ou yon vrè klarifikasyon, pa yon rezilta kiz jenerik. Apre validasyon an, kontinye nan",
  footerNoteCta: "BizSproutAI",
  footerNotePost: "pou sprint konplè a, sipò bati, ak sistèm ekzekisyon.",

  pageHeadline: "De lide ou a premye kliyan ou.",
  pageSubcopy:
    "Kòmanse ak yon validasyon gratis. Nan anviwon 2 minit, BizSproutAI pral montre etap ou, sa pou bati an premye, erè pou evite, ak 4 pwochen etap ekzekisyon ou.",
  pageReassurance: "Premye etap gratis. Pa gen peman obligatwa.",

  rWaitlistHeadline: "Validasyon ou prè. Rantre nan lis datant BizSproutAI.",
  rWaitlistBody:
    "BizSproutAI ap bati pou ede fondatè yo pase de lide a premye kliyan an pa idantifye sa pou bati an premye, bati li, distribiye li, epi adapte jouk rezilta a rive.",
  rWaitlistCta: "Rantre nan lis datant →",
  rWaitlistSubmitting: "Ap enskri…",
  rWaitlistSuccess:
    "Ou sou lis la. Nou pral kontakte ou lè BizSproutAI ouvri pou fondatè yo.",
  rWaitlistError: "Te gen yon erè. Tanpri eseye ankò nan yon moman.",
  rWaitlistEmailError: "Tanpri antre yon adrès imèl valid.",
};

// ─── Spanish ──────────────────────────────────────────────────────────────────

const es: ValidateCopy = {
  trustBadge: "BizSproutAI — Validación Gratuita",
  trustMeta: "Gratis · Sin cuenta · Resultados en menos de un minuto",

  stepLabel: (n) => `Validación Gratuita — Paso ${n}`,
  stepCounter: (cur, tot) => `Paso ${cur} de ${tot}`,

  back: "← Atrás",
  next: "Continuar →",

  s0heading: "¿Dónde estás ahora mismo?",
  s0body:
    "Elige lo que mejor describe tu situación actual. Sé honesto — el resultado será más útil si eres preciso.",
  s0choices: [
    "Tengo una idea pero no tengo una oferta clara ni dirección definida",
    "Tengo una oferta pero no tengo un activo o sistema de lanzamiento",
    "Tengo piezas dispersas pero nada está conectado",
    "Estoy listo para lanzar pero necesito acompañamiento práctico",
  ],
  s0cta: "Continuar →",

  s1heading: "Cuéntanos sobre tu idea.",
  s1body:
    "Una o dos frases es suficiente. Cuanto más específico seas, más útil será la recomendación.",
  s1ideaLabel: "¿Qué estás construyendo u ofreciendo?",
  s1ideaRequired: "(requerido)",
  s1ideaPlaceholder:
    "Ej.: Un servicio de coaching para fundadores que quieren validar su idea antes de construir.",
  s1audienceLabel: "¿Para quién es?",
  s1audienceOptional: "(opcional)",
  s1audiencePlaceholder: "Ej.: Solopreneurs, freelancers, pequeños negocios de servicios",

  s2heading: "¿Qué existe ahora mismo?",
  s2body: "Dos preguntas rápidas para afinar la recomendación.",
  s2liveQ: "¿Tienes un sitio web, página de aterrizaje o sistema de reservas activo?",
  s2liveYes: "Sí, algo está en línea",
  s2liveNo: "No, nada en línea todavía",
  s2tractionQ: "¿Ya hay personas que pagan, reservan o se registran?",
  s2tractionYes: "Sí, tengo algo de tracción",
  s2tractionNo: "No, todavía no",

  s3heading: "¿Dónde debemos enviarte los resultados?",
  s3body:
    "Tus resultados aparecerán en pantalla de inmediato. También enviaremos una copia a tu correo para que puedas consultarla después.",
  s3nameLabel: "Nombre",
  s3nameOptional: "(opcional)",
  s3namePlaceholder: "Ej.: Carlos",
  s3emailLabel: "Correo electrónico",
  s3emailRequired: "(requerido)",
  s3emailPlaceholder: "tu@ejemplo.com",
  s3submit: "Obtener Mi Validación Gratuita →",
  s3submitting: "Obteniendo tus resultados…",
  s3privacy: "Sin spam. Resultados instantáneos. Cancela la suscripción cuando quieras.",
  s3emailError: "Por favor ingresa una dirección de correo válida.",
  s3error:
    "Algo salió mal al obtener tus resultados. Por favor intenta de nuevo en un momento.",

  rBadge: "Tu Resultado de Validación Gratuita",
  rHeading: "Aquí es donde estás.",
  rSubhead: "tus resultados están abajo — y tu copia de correo está en camino.",
  rReadinessLabel: "Preparación para el lanzamiento",
  rReadinessMeta:
    "Tu análisis completo entrega un puntaje preciso basado en tu idea específica, competencia y mercado.",
  rVerdictLabel: "Veredicto",
  rFirstAssetLabel: "BizSproutAI recomienda primero",
  rNextStepsLabel: "Tus próximos 4 pasos",
  rWarningLabel: "Evita este error",
  rNoteLabel: "Nota",
  rLockedSectionTitle: "Tu análisis completo también incluiría",
  rLockedMeta:
    "Estos datos son específicos para tu idea y requieren el análisis completo impulsado por IA.",
  rSubmittedIdeaLabel: "Idea enviada",
  rStageContextNote: "Basado en tu etapa seleccionada y la descripción de tu idea.",
  rUpsellLabel: "Tu próximo paso",
  rFitCallLabel: "¿Necesitas ayuda más profunda?",
  rPrimaryCta: "Desbloquear mi sprint completo en BizSproutAI →",
  rFitCta: "Reservar una llamada de diagnóstico gratuita",
  rFitNote: "30 min de diagnóstico · sin argumentario de ventas",
  rReset: "← Validar una idea diferente",

  stageUpsells: {
    idea: {
      headline: "¿Tu idea específica tiene demanda real en el mercado?",
      body: "La validación gratuita confirma tu etapa. Pero si las personas realmente pagarán — por tu idea específica, en tu mercado específico — eso requiere un análisis completo construido alrededor de lo que describiste.",
    },
    firstAsset: {
      headline: "¿Qué ángulo va a convertir realmente para tu audiencia?",
      body: "Estás listo para construir. El análisis completo te dice exactamente cómo posicionar tu oferta, qué objeciones anticipar y qué mensaje moverá a tu audiencia específica a tomar acción.",
    },
    assemblyOptimization: {
      headline: "¿Qué pieza está bloqueando tu conversión ahora mismo?",
      body: "Tienes los componentes. El análisis completo mapea exactamente cuáles conservar, cuáles eliminar y el único cuello de botella que impide que las personas se conviertan en clientes.",
    },
    launchScale: {
      headline: "¿Qué deberías escalar — y qué se podría romper si lo haces?",
      body: "Tienes tracción. El análisis completo identifica qué métricas sistematizar y qué canales escalar — para que el impulso no se pierda a través de un embudo roto.",
    },
    launchReady: {
      headline: "¿Qué canal de adquisición es el correcto para tu audiencia?",
      body: "Estás listo para avanzar. El análisis completo evalúa tu preparación go-to-market y te dice con qué canales empezar para tu audiencia específica — para que no pierdas tiempo en los equivocados.",
    },
  },

  lockedPreviewsTemplate: [
    {
      titleWithDomain: "Puntaje de riesgo de demanda para negocios de {domain} en tu etapa",
      titleWithoutDomain: "Puntaje de riesgo de demanda para negocios en tu etapa",
      meta: "Análisis de 5 factores",
    },
    {
      titleWithDomain: "Top 3 riesgos detectados para tu idea específica",
      titleWithoutDomain: "Top 3 riesgos detectados para tu idea específica",
      meta: "Clasificados por severidad",
    },
    {
      titleWithDomain: "Primer canal de adquisición recomendado",
      titleWithoutDomain: "Primer canal de adquisición recomendado",
      meta: "Adaptado a tu audiencia y etapa",
    },
  ],

  footerNotePre:
    "La validación gratuita está diseñada para darte claridad real, no un resultado de quiz genérico. Después de la validación, continúa en",
  footerNoteCta: "BizSproutAI",
  footerNotePost: "para el sprint completo, soporte de construcción y sistema de ejecución.",

  pageHeadline: "De tu idea a tu primer cliente.",
  pageSubcopy:
    "Empieza con una validación gratuita. En aproximadamente 2 minutos, BizSproutAI te mostrará tu etapa, qué construir primero, qué error evitar y tus próximos 4 pasos de ejecución.",
  pageReassurance: "Primer paso gratuito. Sin pago requerido.",

  rWaitlistHeadline: "Tu validación está lista. Únete a la lista de espera de BizSproutAI.",
  rWaitlistBody:
    "BizSproutAI se está construyendo para ayudar a los fundadores a pasar de la idea al primer cliente identificando qué construir primero, construyéndolo, distribuyéndolo y adaptándolo hasta lograr el resultado.",
  rWaitlistCta: "Unirse a la lista de espera →",
  rWaitlistSubmitting: "Uniéndome…",
  rWaitlistSuccess:
    "Estás en la lista. Te contactaremos cuando BizSproutAI abra para fundadores.",
  rWaitlistError: "Algo salió mal. Por favor intenta de nuevo en un momento.",
  rWaitlistEmailError: "Por favor ingresa una dirección de correo válida.",
};

// ─── Portuguese ───────────────────────────────────────────────────────────────

const pt: ValidateCopy = {
  trustBadge: "BizSproutAI — Validação Gratuita",
  trustMeta: "Gratuito · Sem conta · Resultados em menos de um minuto",

  stepLabel: (n) => `Validação Gratuita — Passo ${n}`,
  stepCounter: (cur, tot) => `Passo ${cur} de ${tot}`,

  back: "← Voltar",
  next: "Continuar →",

  s0heading: "Onde você está agora?",
  s0body:
    "Escolha o que melhor descreve sua situação atual. Seja honesto — o resultado será mais útil se você for preciso.",
  s0choices: [
    "Tenho uma ideia mas não tenho uma oferta clara nem direção definida",
    "Tenho uma oferta mas não tenho um ativo ou sistema de lançamento",
    "Tenho peças espalhadas mas nada está conectado",
    "Estou pronto para lançar mas preciso de apoio prático",
  ],
  s0cta: "Continuar →",

  s1heading: "Fale-nos sobre sua ideia.",
  s1body:
    "Uma ou duas frases é suficiente. Quanto mais específico você for, mais útil será a recomendação.",
  s1ideaLabel: "O que você está construindo ou oferecendo?",
  s1ideaRequired: "(obrigatório)",
  s1ideaPlaceholder:
    "Ex.: Um serviço de coaching para fundadores que querem validar sua ideia antes de construir.",
  s1audienceLabel: "Para quem é?",
  s1audienceOptional: "(opcional)",
  s1audiencePlaceholder: "Ex.: Solopreneurs, freelancers, pequenas empresas de serviço",

  s2heading: "O que existe agora?",
  s2body: "Duas perguntas rápidas para refinar a recomendação.",
  s2liveQ: "Você tem um site, página de destino ou sistema de reservas ativo?",
  s2liveYes: "Sim, algo está no ar",
  s2liveNo: "Não, nada no ar ainda",
  s2tractionQ: "Pessoas já estão pagando, reservando ou se inscrevendo?",
  s2tractionYes: "Sim, tenho alguma tração",
  s2tractionNo: "Não, ainda não",

  s3heading: "Para onde devemos enviar seus resultados?",
  s3body:
    "Seus resultados aparecerão na tela imediatamente. Também enviaremos uma cópia para o seu e-mail para que você possa consultá-la depois.",
  s3nameLabel: "Primeiro nome",
  s3nameOptional: "(opcional)",
  s3namePlaceholder: "Ex.: Ana",
  s3emailLabel: "Endereço de e-mail",
  s3emailRequired: "(obrigatório)",
  s3emailPlaceholder: "voce@exemplo.com",
  s3submit: "Obter Minha Validação Gratuita →",
  s3submitting: "Obtendo seus resultados…",
  s3privacy: "Sem spam. Resultados instantâneos. Cancele a qualquer momento.",
  s3emailError: "Por favor insira um endereço de e-mail válido.",
  s3error:
    "Algo deu errado ao obter seus resultados. Por favor tente novamente em um momento.",

  rBadge: "Seu Resultado de Validação Gratuita",
  rHeading: "Aqui está onde você está.",
  rSubhead: "seus resultados estão abaixo — e sua cópia de e-mail está a caminho.",
  rReadinessLabel: "Prontidão para lançamento",
  rReadinessMeta:
    "Sua análise completa fornece uma pontuação precisa com base na sua ideia específica, concorrência e mercado.",
  rVerdictLabel: "Veredicto",
  rFirstAssetLabel: "BizSproutAI recomenda primeiro",
  rNextStepsLabel: "Seus próximos 4 passos",
  rWarningLabel: "Evite este erro",
  rNoteLabel: "Nota",
  rLockedSectionTitle: "Sua análise completa também incluiria",
  rLockedMeta:
    "Esses insights são específicos para sua ideia e exigem a análise completa impulsionada por IA.",
  rSubmittedIdeaLabel: "Ideia enviada",
  rStageContextNote: "Baseado na sua etapa selecionada e na descrição da sua ideia.",
  rUpsellLabel: "Seu próximo passo",
  rFitCallLabel: "Quer ajuda mais aprofundada?",
  rPrimaryCta: "Desbloquear meu sprint completo no BizSproutAI →",
  rFitCta: "Agendar uma chamada de diagnóstico gratuita",
  rFitNote: "30 min de diagnóstico · sem argumentação de vendas",
  rReset: "← Validar uma ideia diferente",

  stageUpsells: {
    idea: {
      headline: "Sua ideia específica tem demanda real no mercado?",
      body: "A validação gratuita confirma seu estágio. Mas se as pessoas realmente pagarão — pela sua ideia específica, no seu mercado específico — isso exige uma análise completa construída em torno do que você descreveu.",
    },
    firstAsset: {
      headline: "Qual ângulo vai realmente converter para o seu público?",
      body: "Você está pronto para construir. A análise completa diz exatamente como posicionar sua oferta, quais objeções antecipar e qual mensagem vai mover seu público específico para tomar ação.",
    },
    assemblyOptimization: {
      headline: "Qual peça está bloqueando sua conversão agora?",
      body: "Você tem os componentes. A análise completa mapeia exatamente quais manter, quais cortar e o único gargalo que está impedindo as pessoas de se tornarem clientes.",
    },
    launchScale: {
      headline: "O que você deve escalar — e o que pode quebrar se fizer isso?",
      body: "Você tem tração. A análise completa identifica quais métricas sistematizar e quais canais escalar — para que o impulso não vaze por um funil quebrado.",
    },
    launchReady: {
      headline: "Qual canal de aquisição é o certo para o seu público?",
      body: "Você está pronto para avançar. A análise completa avalia sua prontidão go-to-market e diz quais canais iniciar para o seu público específico — para você não desperdiçar tempo nos errados.",
    },
  },

  lockedPreviewsTemplate: [
    {
      titleWithDomain: "Pontuação de risco de demanda para negócios de {domain} no seu estágio",
      titleWithoutDomain: "Pontuação de risco de demanda para negócios no seu estágio",
      meta: "Análise de 5 fatores",
    },
    {
      titleWithDomain: "Top 3 riscos detectados para sua ideia específica",
      titleWithoutDomain: "Top 3 riscos detectados para sua ideia específica",
      meta: "Classificados por severidade",
    },
    {
      titleWithDomain: "Primeiro canal de aquisição recomendado",
      titleWithoutDomain: "Primeiro canal de aquisição recomendado",
      meta: "Adaptado ao seu público e estágio",
    },
  ],

  footerNotePre:
    "A validação gratuita é projetada para dar clareza real, não um resultado de quiz genérico. Após a validação, continue no",
  footerNoteCta: "BizSproutAI",
  footerNotePost: "para o sprint completo, suporte de construção e sistema de execução.",

  pageHeadline: "Da sua ideia ao primeiro cliente.",
  pageSubcopy:
    "Comece com uma validação gratuita. Em cerca de 2 minutos, BizSproutAI mostrará sua etapa, o que construir primeiro, o erro a evitar e seus próximos 4 passos de execução.",
  pageReassurance: "Primeiro passo gratuito. Sem pagamento necessário.",

  rWaitlistHeadline: "Sua validação está pronta. Entre na lista de espera do BizSproutAI.",
  rWaitlistBody:
    "O BizSproutAI está sendo construído para ajudar fundadores a ir da ideia ao primeiro cliente identificando o que construir primeiro, construindo, distribuindo e adaptando até o resultado chegar.",
  rWaitlistCta: "Entrar na lista de espera →",
  rWaitlistSubmitting: "Entrando…",
  rWaitlistSuccess:
    "Você está na lista. Entraremos em contato quando o BizSproutAI abrir para fundadores.",
  rWaitlistError: "Algo deu errado. Por favor tente novamente em um momento.",
  rWaitlistEmailError: "Por favor insira um endereço de e-mail válido.",
};

// ─── Locale map ───────────────────────────────────────────────────────────────

const copyMap: Record<string, ValidateCopy> = { en, fr, ht, es, pt };

/**
 * Returns the ValidateCopy for the given locale.
 * Falls back to English for unknown locales.
 */
export function getValidateCopy(locale: string): ValidateCopy {
  const lang = locale.toLowerCase().split("-")[0];
  return copyMap[lang] ?? en;
}
