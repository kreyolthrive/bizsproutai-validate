/**
 * Locale-keyed content for the validation engine.
 *
 * Keeps all user-facing strings out of engine.ts so the computation logic
 * remains language-agnostic. The English values are intentionally identical
 * to the original hardcoded strings to avoid any regression.
 *
 * Usage:
 *   import { getEngineTranslations } from "@/lib/validation/engineTranslations";
 *   const t = getEngineTranslations(locale);
 */

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface StageContent {
  /** Localised display name for the stage (shown in UI badge). */
  stageTag: string;
  verdict: string;
  nextSteps: string[];
  warning: string;
}

export interface AssetInfo {
  asset: string;
  reason: string;
}

export interface LocaleEngineData {
  stages: {
    idea: StageContent;
    firstAsset: StageContent;
    /** Stage 2, hasLiveAsset === false */
    assembly: StageContent;
    /** Stage 2, hasLiveAsset === true */
    optimization: StageContent;
    /** Stage 3, hasTraction === false */
    launchReady: StageContent;
    /** Stage 3, hasTraction === true */
    launchScale: StageContent;
  };
  assets: {
    booking: AssetInfo;
    mobileApp: AssetInfo;
    marketplace: AssetInfo;
    saas: AssetInfo;
    webApp: AssetInfo;
    leadFunnel: AssetInfo;
    ecommerce: AssetInfo;
    /** Fallback by stage index 0 */
    fallback0: AssetInfo;
    /** Fallback by stage index 1 */
    fallback1: AssetInfo;
    /** Fallback by stage index 2 */
    fallback2: AssetInfo;
    /** Fallback by stage index 3 */
    fallback3: AssetInfo;
  };
  domainLabels: {
    booking: string;
    mobileApp: string;
    marketplace: string;
    saas: string;
    webApp: string;
    leadGeneration: string;
    ecommerce: string;
  };
  ideaQualityNote: string;
}

// ─── English (canonical — do not change these strings) ───────────────────────

const en: LocaleEngineData = {
  stages: {
    idea: {
      stageTag: "Idea Stage",
      verdict: "Too early to build. You need offer clarity first.",
      nextSteps: [
        "Write one sentence: who you help, what problem you solve, and what you give them",
        "Share that sentence with 5 real people in your target audience — watch their reaction",
        "Ask one of them: 'Would you pay for this? What would stop you?' — record the answer",
        "Only build after at least 3 people say they would pay or sign up",
      ],
      warning:
        "Do not build anything yet. Every day you spend building the wrong thing is a day you could spend validating the right one. Most founders who skip this step rebuild everything within 90 days.",
    },
    firstAsset: {
      stageTag: "First Asset Stage",
      verdict: "Clear enough to launch. Build the minimum asset now.",
      nextSteps: [
        "Choose your minimum asset: one page, one CTA, one clear offer — no more",
        "Launch it this week — imperfect and live beats perfect and invisible",
        "Write 5 direct outreach messages to people you already know who fit your audience",
        "Follow up within 24 hours of every response — speed is your biggest advantage right now",
      ],
      warning:
        "Do not wait for the design to be perfect. A clear, specific page outperforms a polished but vague one every time. Ship it today and improve from real feedback — not from your imagination.",
    },
    assembly: {
      stageTag: "Assembly Stage",
      verdict: "You have the components. Now connect them into one clear path.",
      nextSteps: [
        "List every tool, page, and asset you have — then map the path a client would actually take",
        "Identify the single moment where most people drop off or get confused",
        "Fix that one point before touching anything else",
        "Consolidate to one traffic or outreach source — depth beats breadth right now",
      ],
      warning:
        "Do not add more tools, pages, or platforms before fixing what you already have. Every new addition before consolidation makes the problem harder to diagnose. Stop adding — start connecting.",
    },
    optimization: {
      stageTag: "Optimization Stage",
      verdict: "You have pieces. Connect them before building more.",
      nextSteps: [
        "List every tool, page, and asset you have — then map the path a client would actually take",
        "Identify the single moment where most people drop off or get confused",
        "Fix that one point before touching anything else",
        "Consolidate to one traffic or outreach source — depth beats breadth right now",
      ],
      warning:
        "Do not add more tools, pages, or platforms before fixing what you already have. Every new addition before consolidation makes the problem harder to diagnose. Stop adding — start connecting.",
    },
    launchReady: {
      stageTag: "Launch-Ready Stage",
      verdict: "Clear enough to launch. You need execution support, not more planning.",
      nextSteps: [
        "Lock your offer messaging and CTA today — no more adjusting, start sending",
        "Test your booking or checkout flow end to end before launch day",
        "Prepare your first 30 outreach messages and schedule them over the next 5 days",
        "Set a hard public launch date — tell someone you trust so you are accountable",
      ],
      warning:
        "Do not delay for perfection. Launching at 80% ready teaches you more than planning at 100% ready. The market will tell you what to fix — your imagination cannot.",
    },
    launchScale: {
      stageTag: "Launch + Scale Stage",
      verdict: "You have traction. Now build systems to scale what works.",
      nextSteps: [
        "Document what is working: which channel, which message, which offer converts best",
        "Systematize the outreach or acquisition that produced your best results",
        "Set up a follow-up sequence so no lead goes cold after first contact",
        "Build the next layer only after current conversion is above 10%",
      ],
      warning:
        "Do not scale what you have not confirmed converts. Scaling a broken funnel just amplifies the problem. Fix conversion first, then scale.",
    },
  },
  assets: {
    booking: {
      asset: "Booking page",
      reason:
        "Your offer requires conversations or appointments. A booking page lets people schedule directly — no complex site needed yet.",
    },
    mobileApp: {
      asset: "Mobile app",
      reason:
        "Your business depends on recurring mobile usage. A mobile app is the right primary asset — but validate the core workflow before building.",
    },
    marketplace: {
      asset: "Marketplace web app",
      reason:
        "You are building a two-sided platform. This requires a web app — but start with a hand-matched MVP before full automation.",
    },
    saas: {
      asset: "Web app (SaaS)",
      reason:
        "Your offer has user accounts, dashboards, or workflow automation. A web app is the right asset — but validate demand with a landing page first.",
    },
    webApp: {
      asset: "Web app",
      reason:
        "Your idea requires user interaction, stored data, or specific workflows that need a web app — not just a static site.",
    },
    leadFunnel: {
      asset: "Lead funnel",
      reason:
        "Your model requires nurturing leads before a sale. A funnel collects and converts — start with one clear opt-in and a short email sequence.",
    },
    ecommerce: {
      asset: "E-commerce store",
      reason:
        "You are selling a physical or digital product online. A simple store (Shopify, Gumroad, or similar) is the right starting point.",
    },
    fallback0: {
      asset: "Simple landing page (offer test)",
      reason:
        "Before you build anything complex, test whether people respond to your offer with a single clear page.",
    },
    fallback1: {
      asset: "Landing page or booking page",
      reason:
        "You have an offer — now it needs a home. One clear page with a single CTA is all you need to start getting traction.",
    },
    fallback2: {
      asset: "Unified website or funnel",
      reason:
        "You have pieces — now connect them. One clear path from awareness to conversion is more powerful than multiple disconnected assets.",
    },
    fallback3: {
      asset: "Full launch system",
      reason:
        "You are ready. Connect your asset, outreach, and follow-up into one working system and start sending.",
    },
  },
  domainLabels: {
    booking: "service / appointment",
    mobileApp: "mobile app",
    marketplace: "marketplace",
    saas: "SaaS",
    webApp: "web app",
    leadGeneration: "lead generation",
    ecommerce: "e-commerce",
  },
  ideaQualityNote:
    "Your idea description was brief. The recommendation above is based on your selected stage — a more detailed description with your target audience would unlock more precise guidance in the full analysis.",
};

// ─── French ───────────────────────────────────────────────────────────────────

const fr: LocaleEngineData = {
  stages: {
    idea: {
      stageTag: "Phase Idée",
      verdict: "Trop tôt pour construire. Vous avez besoin de clarté sur votre offre d'abord.",
      nextSteps: [
        "Rédigez une phrase : qui vous aidez, quel problème vous résolvez et ce que vous leur offrez",
        "Partagez cette phrase avec 5 vraies personnes de votre audience cible — observez leur réaction",
        "Demandez à l'une d'elles : « Paieriez-vous pour cela ? Qu'est-ce qui vous en empêcherait ? » — notez la réponse",
        "Ne construisez qu'après qu'au moins 3 personnes disent qu'elles paieraient ou s'inscriraient",
      ],
      warning:
        "Ne construisez rien encore. Chaque jour passé à construire la mauvaise chose est un jour que vous pourriez consacrer à valider la bonne. La plupart des fondateurs qui sautent cette étape reconstruisent tout en moins de 90 jours.",
    },
    firstAsset: {
      stageTag: "Phase Premier Actif",
      verdict: "Suffisamment clair pour lancer. Construisez l'actif minimum maintenant.",
      nextSteps: [
        "Choisissez votre actif minimum : une page, un CTA, une offre claire — rien de plus",
        "Lancez cette semaine — imparfait et en ligne est mieux que parfait et invisible",
        "Rédigez 5 messages de prospection directe pour des personnes que vous connaissez déjà et qui correspondent à votre audience",
        "Relancez dans les 24 heures après chaque réponse — la vitesse est votre plus grand avantage en ce moment",
      ],
      warning:
        "N'attendez pas que le design soit parfait. Une page claire et spécifique surpasse à chaque fois une page soignée mais vague. Publiez-la aujourd'hui et améliorez-la avec de vrais retours — pas avec votre imagination.",
    },
    assembly: {
      stageTag: "Phase d'Assemblage",
      verdict: "Vous avez les composants. Connectez-les maintenant en un parcours clair.",
      nextSteps: [
        "Listez chaque outil, page et actif que vous avez — puis tracez le parcours qu'un client emprunterait réellement",
        "Identifiez le moment précis où la plupart des gens abandonnent ou se perdent",
        "Corrigez ce seul point avant de toucher à autre chose",
        "Concentrez-vous sur une seule source de trafic ou de prospection — la profondeur prime sur la largeur en ce moment",
      ],
      warning:
        "N'ajoutez pas plus d'outils, de pages ou de plateformes avant d'avoir réparé ce que vous avez déjà. Chaque nouvel ajout avant consolidation rend le problème plus difficile à diagnostiquer. Arrêtez d'ajouter — commencez à connecter.",
    },
    optimization: {
      stageTag: "Phase d'Optimisation",
      verdict: "Vous avez des pièces. Connectez-les avant de construire davantage.",
      nextSteps: [
        "Listez chaque outil, page et actif que vous avez — puis tracez le parcours qu'un client emprunterait réellement",
        "Identifiez le moment précis où la plupart des gens abandonnent ou se perdent",
        "Corrigez ce seul point avant de toucher à autre chose",
        "Concentrez-vous sur une seule source de trafic ou de prospection — la profondeur prime sur la largeur en ce moment",
      ],
      warning:
        "N'ajoutez pas plus d'outils, de pages ou de plateformes avant d'avoir réparé ce que vous avez déjà. Chaque nouvel ajout avant consolidation rend le problème plus difficile à diagnostiquer. Arrêtez d'ajouter — commencez à connecter.",
    },
    launchReady: {
      stageTag: "Phase Prêt au Lancement",
      verdict: "Suffisamment clair pour lancer. Vous avez besoin de soutien à l'exécution, pas de plus de planification.",
      nextSteps: [
        "Verrouillez votre message d'offre et votre CTA aujourd'hui — plus d'ajustements, commencez à envoyer",
        "Testez votre parcours de réservation ou de paiement de bout en bout avant le jour du lancement",
        "Préparez vos 30 premiers messages de prospection et planifiez-les sur les 5 prochains jours",
        "Fixez une date de lancement publique ferme — dites-le à quelqu'un en qui vous avez confiance pour être responsable",
      ],
      warning:
        "Ne tardez pas pour atteindre la perfection. Lancer à 80% prêt vous apprend plus que planifier à 100% prêt. Le marché vous dira quoi corriger — votre imagination ne peut pas.",
    },
    launchScale: {
      stageTag: "Phase Lancement + Croissance",
      verdict: "Vous avez de la traction. Construisez maintenant des systèmes pour scaler ce qui fonctionne.",
      nextSteps: [
        "Documentez ce qui fonctionne : quel canal, quel message, quelle offre convertit le mieux",
        "Systématisez la prospection ou l'acquisition qui a produit vos meilleurs résultats",
        "Mettez en place une séquence de suivi pour qu'aucun prospect ne se refroidisse après le premier contact",
        "Construisez la couche suivante uniquement lorsque la conversion actuelle dépasse 10 %",
      ],
      warning:
        "Ne scalez pas ce que vous n'avez pas confirmé être convertissant. Scaler un entonnoir défaillant ne fait qu'amplifier le problème. Corrigez la conversion d'abord, puis scalez.",
    },
  },
  assets: {
    booking: {
      asset: "Page de réservation",
      reason:
        "Votre offre nécessite des conversations ou des rendez-vous. Une page de réservation permet aux gens de planifier directement — pas besoin d'un site complexe pour l'instant.",
    },
    mobileApp: {
      asset: "Application mobile",
      reason:
        "Votre activité dépend d'une utilisation mobile récurrente. Une application mobile est le bon actif principal — mais validez le flux de travail principal avant de construire.",
    },
    marketplace: {
      asset: "Application web marketplace",
      reason:
        "Vous construisez une plateforme biface. Cela nécessite une application web — mais commencez par un MVP avec mise en relation manuelle avant l'automatisation complète.",
    },
    saas: {
      asset: "Application web (SaaS)",
      reason:
        "Votre offre comporte des comptes utilisateurs, des tableaux de bord ou de l'automatisation de flux de travail. Une application web est le bon actif — mais validez d'abord la demande avec une page d'atterrissage.",
    },
    webApp: {
      asset: "Application web",
      reason:
        "Votre idée nécessite une interaction utilisateur, des données stockées ou des flux de travail spécifiques qui exigent une application web — pas seulement un site statique.",
    },
    leadFunnel: {
      asset: "Entonnoir de génération de leads",
      reason:
        "Votre modèle nécessite de nourrir des prospects avant une vente. Un entonnoir collecte et convertit — commencez par un opt-in clair et une courte séquence d'e-mails.",
    },
    ecommerce: {
      asset: "Boutique e-commerce",
      reason:
        "Vous vendez un produit physique ou numérique en ligne. Une boutique simple (Shopify, Gumroad ou similaire) est le bon point de départ.",
    },
    fallback0: {
      asset: "Page d'atterrissage simple (test d'offre)",
      reason:
        "Avant de construire quoi que ce soit de complexe, testez si les gens répondent à votre offre avec une seule page claire.",
    },
    fallback1: {
      asset: "Page d'atterrissage ou de réservation",
      reason:
        "Vous avez une offre — elle a maintenant besoin d'un chez-soi. Une page claire avec un seul CTA est tout ce dont vous avez besoin pour commencer à obtenir de la traction.",
    },
    fallback2: {
      asset: "Site web unifié ou entonnoir",
      reason:
        "Vous avez des pièces — connectez-les maintenant. Un parcours clair de la notoriété à la conversion est plus puissant que plusieurs actifs déconnectés.",
    },
    fallback3: {
      asset: "Système de lancement complet",
      reason:
        "Vous êtes prêt. Connectez votre actif, votre prospection et votre suivi en un seul système fonctionnel et commencez à envoyer.",
    },
  },
  domainLabels: {
    booking: "service / rendez-vous",
    mobileApp: "application mobile",
    marketplace: "marketplace",
    saas: "SaaS",
    webApp: "application web",
    leadGeneration: "génération de leads",
    ecommerce: "e-commerce",
  },
  ideaQualityNote:
    "Votre description d'idée était brève. La recommandation ci-dessus est basée sur votre étape sélectionnée — une description plus détaillée avec votre audience cible permettrait d'obtenir des conseils plus précis dans l'analyse complète.",
};

// ─── Haitian Creole ───────────────────────────────────────────────────────────

const ht: LocaleEngineData = {
  stages: {
    idea: {
      stageTag: "Etap Lide",
      verdict: "Twò bonè pou bati. Ou bezwen klarite sou òf ou an premye.",
      nextSteps: [
        "Ekri yon fraz : ki moun ou ede, ki pwoblèm ou rezoud, ak sa ou ba yo",
        "Pataje fraz sa a ak 5 moun reyèl nan odyans sib ou — gade reyaksyon yo",
        "Mande youn ladan yo : « Ou ta peye pou sa ? Sa ki ta anpeche ou ? » — anrejistre repons lan",
        "Bati sèlman apre omwen 3 moun di yo ta peye oswa enskri",
      ],
      warning:
        "Pa bati anyen pou kounye a. Chak jou ou pase ap bati move bagay la se yon jou ou ta kapab pase ap valide bon bagay la. Pifò fondatè ki sote etap sa a rebati tout bagay nan 90 jou.",
    },
    firstAsset: {
      stageTag: "Etap Premye Aktif",
      verdict: "Ase klè pou lanse. Bati aktif minimòm ou kounye a.",
      nextSteps: [
        "Chwazi aktif minimòm ou : yon paj, yon CTA, yon òf klè — pa plis",
        "Lanse li semèn sa a — enpafè epi an liy pi bon pase pafè epi envizib",
        "Ekri 5 mesaj pwospeksyon dirèk pou moun ou konnen deja ki kòrèspond ak odyans ou",
        "Fè swivi nan 24 èdtan apre chak repons — vitès se pi gwo avantaj ou kounye a",
      ],
      warning:
        "Pa tann pou desing lan vin pafè. Yon paj klè ak espesifik depase yon paj poli men vag chak fwa. Pibliye li jodi a epi amelyore li ak vrè kòmantè — pa ak imajinasyon ou.",
    },
    assembly: {
      stageTag: "Etap Asanblaj",
      verdict: "Ou gen konpozan yo. Konekte yo kounye a nan yon chemen klè.",
      nextSteps: [
        "Liste chak zouti, paj ak aktif ou gen — epi kat chemen yon kliyan ta vrèman pran",
        "Idantifye moman presi kote pifò moun abandone oswa pèdi",
        "Korije sèl pwen sa a anvan ou touche nenpòt lòt bagay",
        "Konsolide nan yon sèl sous trafik oswa pwospeksyon — pwofondè depase lajè kounye a",
      ],
      warning:
        "Pa ajoute plis zouti, paj oswa platfòm anvan ou repare sa ou genyen deja. Chak nouvo adisyon anvan konsolidasyon rann pwoblèm nan pi difisil pou dyagnostike. Sispann ajoute — kòmanse konekte.",
    },
    optimization: {
      stageTag: "Etap Optimizasyon",
      verdict: "Ou gen moso yo. Konekte yo anvan ou bati plis.",
      nextSteps: [
        "Liste chak zouti, paj ak aktif ou gen — epi kat chemen yon kliyan ta vrèman pran",
        "Idantifye moman presi kote pifò moun abandone oswa pèdi",
        "Korije sèl pwen sa a anvan ou touche nenpòt lòt bagay",
        "Konsolide nan yon sèl sous trafik oswa pwospeksyon — pwofondè depase lajè kounye a",
      ],
      warning:
        "Pa ajoute plis zouti, paj oswa platfòm anvan ou repare sa ou genyen deja. Chak nouvo adisyon anvan konsolidasyon rann pwoblèm nan pi difisil pou dyagnostike. Sispann ajoute — kòmanse konekte.",
    },
    launchReady: {
      stageTag: "Etap Prè pou Lanse",
      verdict: "Ase klè pou lanse. Ou bezwen sipò ekzekisyon, pa plis planifikasyon.",
      nextSteps: [
        "Vèrouye mesaj òf ou ak CTA ou jodi a — pa plis ajisteman, kòmanse voye",
        "Teste pwosesis rezèvasyon oswa peman ou de bout an bout anvan jou lanse a",
        "Prepare 30 premye mesaj pwospeksyon ou ak pwograme yo sou 5 jou pwochen yo",
        "Fikse yon dat lanse piblik fèm — di yon moun ou fè konfyans pou ou reyèl responsab",
      ],
      warning:
        "Pa retade pou pèfeksyon. Lanse à 80% prè anseye ou plis pase planifye à 100% prè. Mache a pral di ou sa pou korije — imajinasyon ou pa kapab.",
    },
    launchScale: {
      stageTag: "Etap Lanse + Kwasans",
      verdict: "Ou gen traction. Kounye a bati sistèm pou eskale sa ki mache.",
      nextSteps: [
        "Dokimante sa ki ap travay : ki kanal, ki mesaj, ki òf konvèti pi plis",
        "Sistematize pwospeksyon oswa akizisyon ki te pwodui pi bon rezilta ou yo",
        "Mete kanpe yon sekans swivi pou okenn lead pa refwadi apre premye kontak",
        "Bati kouch pwochen an sèlman lè konvèsyon aktyèl la depase 10%",
      ],
      warning:
        "Pa eskale sa ou pa konfime konvèti. Eskale yon fonèl kase se sèlman amplifye pwoblèm nan. Korije konvèsyon an an premye, epi eskale.",
    },
  },
  assets: {
    booking: {
      asset: "Paj rezèvasyon",
      reason:
        "Òf ou nesesite konvèsasyon oswa randevou. Yon paj rezèvasyon pèmèt moun pwograme dirèkteman — pa bezwen yon sit konplèks pou kounye a.",
    },
    mobileApp: {
      asset: "Aplikasyon mobil",
      reason:
        "Biznis ou depann sou itilizasyon mobil regilye. Yon aplikasyon mobil se bon aktif prensipal la — men valide flux travay prensipal la anvan ou bati.",
    },
    marketplace: {
      asset: "Aplikasyon web marketplace",
      reason:
        "Ou ap bati yon platfòm de bò. Sa nesesite yon aplikasyon web — men kòmanse ak yon MVP ki fèt manyèlman anvan otomatizasyon konplè.",
    },
    saas: {
      asset: "Aplikasyon web (SaaS)",
      reason:
        "Òf ou gen kont itilizatè, tablo de bò, oswa otomatizasyon flux travay. Yon aplikasyon web se bon aktif la — men valide demann ak yon paj aterisaj an premye.",
    },
    webApp: {
      asset: "Aplikasyon web",
      reason:
        "Lide ou nesesite entèraksyon itilizatè, done estoke, oswa flux travay espesifik ki nesesite yon aplikasyon web — pa sèlman yon sit estatik.",
    },
    leadFunnel: {
      asset: "Fonèl jenerasyon leads",
      reason:
        "Modèl ou nesesite nouri leads anvan yon vant. Yon fonèl kolekte epi konvèti — kòmanse ak yon sèl opt-in klè ak yon ti sekans imèl.",
    },
    ecommerce: {
      asset: "Boutik e-commerce",
      reason:
        "Ou vann yon pwodwi fizik oswa nimerik sou entènèt. Yon boutik senp (Shopify, Gumroad, oswa similè) se bon pwen depa a.",
    },
    fallback0: {
      asset: "Paj aterisaj senp (tès òf)",
      reason:
        "Anvan ou bati nenpòt bagay konplèks, teste si moun reponn à òf ou ak yon sèl paj klè.",
    },
    fallback1: {
      asset: "Paj aterisaj oswa paj rezèvasyon",
      reason:
        "Ou gen yon òf — li bezwen yon kay kounye a. Yon paj klè ak yon sèl CTA se tout sa ou bezwen pou kòmanse jwenn traction.",
    },
    fallback2: {
      asset: "Sit web inifye oswa fonèl",
      reason:
        "Ou gen moso yo — konekte yo kounye a. Yon chemen klè soti nan konsyans rive nan konvèsyon pi pwisan pase plizyè aktif ki pa konekte.",
    },
    fallback3: {
      asset: "Sistèm lanse konplè",
      reason:
        "Ou prè. Konekte aktif ou, pwospeksyon ou, ak swivi ou nan yon sèl sistèm k ap travay epi kòmanse voye.",
    },
  },
  domainLabels: {
    booking: "sèvis / randevou",
    mobileApp: "aplikasyon mobil",
    marketplace: "marketplace",
    saas: "SaaS",
    webApp: "aplikasyon web",
    leadGeneration: "jenerasyon leads",
    ecommerce: "e-commerce",
  },
  ideaQualityNote:
    "Deskripsyon lide ou te kout. Rekòmandasyon ki anwo a baze sou etap ou chwazi a — yon deskripsyon pi detaye ak odyans sib ou ta debloke konsèy pi presi nan analiz konplè a.",
};

// ─── Spanish ──────────────────────────────────────────────────────────────────

const es: LocaleEngineData = {
  stages: {
    idea: {
      stageTag: "Etapa de Idea",
      verdict: "Demasiado pronto para construir. Primero necesitas claridad en tu oferta.",
      nextSteps: [
        "Escribe una frase: a quién ayudas, qué problema resuelves y qué les das",
        "Comparte esa frase con 5 personas reales de tu audiencia objetivo — observa su reacción",
        "Pregúntale a una de ellas: '¿Pagarías por esto? ¿Qué te detendría?' — registra la respuesta",
        "Solo construye después de que al menos 3 personas digan que pagarían o se inscribirían",
      ],
      warning:
        "No construyas nada todavía. Cada día que pasas construyendo lo incorrecto es un día que podrías pasar validando lo correcto. La mayoría de los fundadores que omiten este paso reconstruyen todo en 90 días.",
    },
    firstAsset: {
      stageTag: "Etapa del Primer Activo",
      verdict: "Suficientemente claro para lanzar. Construye el activo mínimo ahora.",
      nextSteps: [
        "Elige tu activo mínimo: una página, un CTA, una oferta clara — nada más",
        "Lánzalo esta semana — imperfecto y en vivo supera perfecto e invisible",
        "Escribe 5 mensajes de prospección directa a personas que ya conoces que encajan con tu audiencia",
        "Haz seguimiento dentro de las 24 horas de cada respuesta — la velocidad es tu mayor ventaja ahora",
      ],
      warning:
        "No esperes a que el diseño sea perfecto. Una página clara y específica supera siempre a una pulida pero vaga. Publícala hoy y mejora con retroalimentación real — no con tu imaginación.",
    },
    assembly: {
      stageTag: "Etapa de Ensamblaje",
      verdict: "Tienes los componentes. Ahora conéctalos en un camino claro.",
      nextSteps: [
        "Lista cada herramienta, página y activo que tienes — luego mapea el camino que un cliente realmente tomaría",
        "Identifica el momento único donde la mayoría de las personas abandonan o se confunden",
        "Arregla ese único punto antes de tocar cualquier otra cosa",
        "Consolida a una sola fuente de tráfico o prospección — la profundidad supera la amplitud ahora",
      ],
      warning:
        "No añadas más herramientas, páginas o plataformas antes de arreglar lo que ya tienes. Cada nueva adición antes de consolidar hace el problema más difícil de diagnosticar. Deja de añadir — empieza a conectar.",
    },
    optimization: {
      stageTag: "Etapa de Optimización",
      verdict: "Tienes piezas. Conéctalas antes de construir más.",
      nextSteps: [
        "Lista cada herramienta, página y activo que tienes — luego mapea el camino que un cliente realmente tomaría",
        "Identifica el momento único donde la mayoría de las personas abandonan o se confunden",
        "Arregla ese único punto antes de tocar cualquier otra cosa",
        "Consolida a una sola fuente de tráfico o prospección — la profundidad supera la amplitud ahora",
      ],
      warning:
        "No añadas más herramientas, páginas o plataformas antes de arreglar lo que ya tienes. Cada nueva adición antes de consolidar hace el problema más difícil de diagnosticar. Deja de añadir — empieza a conectar.",
    },
    launchReady: {
      stageTag: "Etapa Listo para Lanzar",
      verdict: "Suficientemente claro para lanzar. Necesitas apoyo en ejecución, no más planificación.",
      nextSteps: [
        "Bloquea el mensaje de tu oferta y tu CTA hoy — no más ajustes, empieza a enviar",
        "Prueba tu flujo de reserva o pago de extremo a extremo antes del día de lanzamiento",
        "Prepara tus primeros 30 mensajes de prospección y prográmalos durante los próximos 5 días",
        "Fija una fecha de lanzamiento público firme — díselo a alguien de confianza para ser responsable",
      ],
      warning:
        "No te demores por perfección. Lanzar al 80% listo te enseña más que planificar al 100% listo. El mercado te dirá qué arreglar — tu imaginación no puede.",
    },
    launchScale: {
      stageTag: "Etapa Lanzamiento + Escala",
      verdict: "Tienes tracción. Ahora construye sistemas para escalar lo que funciona.",
      nextSteps: [
        "Documenta qué está funcionando: qué canal, qué mensaje, qué oferta convierte mejor",
        "Sistematiza la prospección o adquisición que produjo tus mejores resultados",
        "Configura una secuencia de seguimiento para que ningún lead se enfríe después del primer contacto",
        "Construye la siguiente capa solo después de que la conversión actual supere el 10%",
      ],
      warning:
        "No escales lo que no has confirmado que convierte. Escalar un embudo roto solo amplifica el problema. Arregla la conversión primero, luego escala.",
    },
  },
  assets: {
    booking: {
      asset: "Página de reservas",
      reason:
        "Tu oferta requiere conversaciones o citas. Una página de reservas permite que las personas programen directamente — no se necesita un sitio complejo todavía.",
    },
    mobileApp: {
      asset: "Aplicación móvil",
      reason:
        "Tu negocio depende del uso móvil recurrente. Una aplicación móvil es el activo principal correcto — pero valida el flujo de trabajo principal antes de construir.",
    },
    marketplace: {
      asset: "Aplicación web marketplace",
      reason:
        "Estás construyendo una plataforma de dos lados. Esto requiere una aplicación web — pero empieza con un MVP de emparejamiento manual antes de la automatización completa.",
    },
    saas: {
      asset: "Aplicación web (SaaS)",
      reason:
        "Tu oferta tiene cuentas de usuario, paneles de control o automatización de flujos de trabajo. Una aplicación web es el activo correcto — pero valida la demanda con una página de destino primero.",
    },
    webApp: {
      asset: "Aplicación web",
      reason:
        "Tu idea requiere interacción del usuario, datos almacenados o flujos de trabajo específicos que necesitan una aplicación web — no solo un sitio estático.",
    },
    leadFunnel: {
      asset: "Embudo de generación de leads",
      reason:
        "Tu modelo requiere nutrir prospectos antes de una venta. Un embudo recopila y convierte — empieza con un opt-in claro y una secuencia de correos corta.",
    },
    ecommerce: {
      asset: "Tienda de e-commerce",
      reason:
        "Estás vendiendo un producto físico o digital en línea. Una tienda simple (Shopify, Gumroad o similar) es el punto de partida correcto.",
    },
    fallback0: {
      asset: "Página de destino simple (prueba de oferta)",
      reason:
        "Antes de construir algo complejo, prueba si las personas responden a tu oferta con una sola página clara.",
    },
    fallback1: {
      asset: "Página de destino o de reservas",
      reason:
        "Tienes una oferta — ahora necesita un hogar. Una página clara con un solo CTA es todo lo que necesitas para empezar a ganar tracción.",
    },
    fallback2: {
      asset: "Sitio web unificado o embudo",
      reason:
        "Tienes piezas — ahora conéctalas. Un camino claro desde la conciencia hasta la conversión es más poderoso que múltiples activos desconectados.",
    },
    fallback3: {
      asset: "Sistema de lanzamiento completo",
      reason:
        "Estás listo. Conecta tu activo, prospección y seguimiento en un sistema funcional y empieza a enviar.",
    },
  },
  domainLabels: {
    booking: "servicio / citas",
    mobileApp: "aplicación móvil",
    marketplace: "marketplace",
    saas: "SaaS",
    webApp: "aplicación web",
    leadGeneration: "generación de leads",
    ecommerce: "e-commerce",
  },
  ideaQualityNote:
    "Tu descripción de la idea fue breve. La recomendación anterior se basa en tu etapa seleccionada — una descripción más detallada con tu audiencia objetivo desbloquearía orientación más precisa en el análisis completo.",
};

// ─── Portuguese ───────────────────────────────────────────────────────────────

const pt: LocaleEngineData = {
  stages: {
    idea: {
      stageTag: "Estágio de Ideia",
      verdict: "Cedo demais para construir. Você precisa de clareza na sua oferta primeiro.",
      nextSteps: [
        "Escreva uma frase: a quem você ajuda, qual problema você resolve e o que você dá a eles",
        "Compartilhe essa frase com 5 pessoas reais do seu público-alvo — observe a reação delas",
        "Pergunte a uma delas: 'Você pagaria por isso? O que te impediria?' — registre a resposta",
        "Só construa depois que pelo menos 3 pessoas disserem que pagariam ou se inscreveriam",
      ],
      warning:
        "Não construa nada ainda. Cada dia que você passa construindo a coisa errada é um dia que poderia ser gasto validando a certa. A maioria dos fundadores que pula esta etapa reconstrói tudo em 90 dias.",
    },
    firstAsset: {
      stageTag: "Estágio do Primeiro Ativo",
      verdict: "Claro o suficiente para lançar. Construa o ativo mínimo agora.",
      nextSteps: [
        "Escolha seu ativo mínimo: uma página, um CTA, uma oferta clara — nada mais",
        "Lance esta semana — imperfeito e no ar supera perfeito e invisível",
        "Escreva 5 mensagens de prospecção direta para pessoas que você já conhece que se encaixam no seu público",
        "Faça acompanhamento dentro de 24 horas de cada resposta — velocidade é sua maior vantagem agora",
      ],
      warning:
        "Não espere o design ser perfeito. Uma página clara e específica supera sempre uma polida mas vaga. Publique hoje e melhore com feedback real — não com sua imaginação.",
    },
    assembly: {
      stageTag: "Estágio de Montagem",
      verdict: "Você tem os componentes. Agora conecte-os em um caminho claro.",
      nextSteps: [
        "Liste cada ferramenta, página e ativo que você tem — depois mapeie o caminho que um cliente realmente tomaria",
        "Identifique o momento único onde a maioria das pessoas desiste ou se confunde",
        "Corrija esse único ponto antes de tocar em qualquer outra coisa",
        "Consolide em uma única fonte de tráfego ou prospecção — profundidade supera amplitude agora",
      ],
      warning:
        "Não adicione mais ferramentas, páginas ou plataformas antes de consertar o que você já tem. Cada nova adição antes da consolidação torna o problema mais difícil de diagnosticar. Pare de adicionar — comece a conectar.",
    },
    optimization: {
      stageTag: "Estágio de Otimização",
      verdict: "Você tem peças. Conecte-as antes de construir mais.",
      nextSteps: [
        "Liste cada ferramenta, página e ativo que você tem — depois mapeie o caminho que um cliente realmente tomaria",
        "Identifique o momento único onde a maioria das pessoas desiste ou se confunde",
        "Corrija esse único ponto antes de tocar em qualquer outra coisa",
        "Consolide em uma única fonte de tráfego ou prospecção — profundidade supera amplitude agora",
      ],
      warning:
        "Não adicione mais ferramentas, páginas ou plataformas antes de consertar o que você já tem. Cada nova adição antes da consolidação torna o problema mais difícil de diagnosticar. Pare de adicionar — comece a conectar.",
    },
    launchReady: {
      stageTag: "Estágio Pronto para Lançar",
      verdict: "Claro o suficiente para lançar. Você precisa de suporte na execução, não mais planejamento.",
      nextSteps: [
        "Bloqueie sua mensagem de oferta e CTA hoje — sem mais ajustes, comece a enviar",
        "Teste seu fluxo de reserva ou checkout de ponta a ponta antes do dia do lançamento",
        "Prepare suas primeiras 30 mensagens de prospecção e agende-as ao longo dos próximos 5 dias",
        "Defina uma data de lançamento público firme — diga a alguém de confiança para ser responsável",
      ],
      warning:
        "Não adie por perfeição. Lançar com 80% pronto ensina mais do que planejar com 100% pronto. O mercado vai te dizer o que consertar — sua imaginação não consegue.",
    },
    launchScale: {
      stageTag: "Estágio Lançamento + Escala",
      verdict: "Você tem tração. Agora construa sistemas para escalar o que funciona.",
      nextSteps: [
        "Documente o que está funcionando: qual canal, qual mensagem, qual oferta converte melhor",
        "Sistematize a prospecção ou aquisição que produziu seus melhores resultados",
        "Configure uma sequência de acompanhamento para que nenhum lead esfrie após o primeiro contato",
        "Construa a próxima camada somente depois que a conversão atual estiver acima de 10%",
      ],
      warning:
        "Não escale o que você não confirmou que converte. Escalar um funil quebrado apenas amplifica o problema. Conserte a conversão primeiro, depois escale.",
    },
  },
  assets: {
    booking: {
      asset: "Página de agendamento",
      reason:
        "Sua oferta requer conversas ou consultas. Uma página de agendamento permite que as pessoas marquem diretamente — nenhum site complexo é necessário ainda.",
    },
    mobileApp: {
      asset: "Aplicativo móvel",
      reason:
        "Seu negócio depende do uso móvel recorrente. Um aplicativo móvel é o ativo principal correto — mas valide o fluxo de trabalho principal antes de construir.",
    },
    marketplace: {
      asset: "Aplicativo web marketplace",
      reason:
        "Você está construindo uma plataforma de dois lados. Isso requer um aplicativo web — mas comece com um MVP de correspondência manual antes da automação completa.",
    },
    saas: {
      asset: "Aplicativo web (SaaS)",
      reason:
        "Sua oferta tem contas de usuário, painéis ou automação de fluxo de trabalho. Um aplicativo web é o ativo correto — mas valide a demanda com uma página de destino primeiro.",
    },
    webApp: {
      asset: "Aplicativo web",
      reason:
        "Sua ideia requer interação do usuário, dados armazenados ou fluxos de trabalho específicos que precisam de um aplicativo web — não apenas um site estático.",
    },
    leadFunnel: {
      asset: "Funil de geração de leads",
      reason:
        "Seu modelo requer nutrir leads antes de uma venda. Um funil coleta e converte — comece com um opt-in claro e uma sequência curta de e-mails.",
    },
    ecommerce: {
      asset: "Loja de e-commerce",
      reason:
        "Você está vendendo um produto físico ou digital online. Uma loja simples (Shopify, Gumroad ou similar) é o ponto de partida certo.",
    },
    fallback0: {
      asset: "Página de destino simples (teste de oferta)",
      reason:
        "Antes de construir qualquer coisa complexa, teste se as pessoas respondem à sua oferta com uma única página clara.",
    },
    fallback1: {
      asset: "Página de destino ou de agendamento",
      reason:
        "Você tem uma oferta — agora ela precisa de um lar. Uma página clara com um único CTA é tudo que você precisa para começar a ganhar tração.",
    },
    fallback2: {
      asset: "Site unificado ou funil",
      reason:
        "Você tem peças — agora conecte-as. Um caminho claro da conscientização até a conversão é mais poderoso do que múltiplos ativos desconectados.",
    },
    fallback3: {
      asset: "Sistema de lançamento completo",
      reason:
        "Você está pronto. Conecte seu ativo, prospecção e acompanhamento em um sistema funcional e comece a enviar.",
    },
  },
  domainLabels: {
    booking: "serviço / agendamento",
    mobileApp: "aplicativo móvel",
    marketplace: "marketplace",
    saas: "SaaS",
    webApp: "aplicativo web",
    leadGeneration: "geração de leads",
    ecommerce: "e-commerce",
  },
  ideaQualityNote:
    "Sua descrição da ideia foi breve. A recomendação acima é baseada no estágio selecionado — uma descrição mais detalhada com seu público-alvo desbloquearia orientações mais precisas na análise completa.",
};

// ─── Locale map ───────────────────────────────────────────────────────────────

const translationsMap: Record<string, LocaleEngineData> = { en, fr, ht, es, pt };

/**
 * Returns the engine translations for the given locale.
 * Falls back to English for unknown locales.
 */
export function getEngineTranslations(locale: string): LocaleEngineData {
  const lang = locale.toLowerCase().split("-")[0];
  return translationsMap[lang] ?? en;
}
