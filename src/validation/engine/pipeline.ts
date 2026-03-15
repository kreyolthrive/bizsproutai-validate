import type {
  ConstructiveVerdict,
  DynamicValidationResult,
  Locale,
  PillarBasedValidation,
  PillarKey,
  PillarResult,
  ValidationCategoryRouting,
  ValidationInput,
} from "../types";
import {
  finalVerdictFromOverallScore,
  frameworkDecisionFromOverallScore,
  statusFromFrameworkDecision,
  verdictFromOverallScore,
} from "../decision";
import {
  getConstructiveVerdict,
  getPillarFramework,
  getPillarStatus,
  PILLAR_KEYS,
} from "../pillarFrameworks";
import { validateIdeaDynamic } from "./orchestrator";
import {
  buildValidationCtas,
  buildValidationModelRouting,
  buildValidationResearch,
  inferValidationBusinessModel,
  routeBusinessCategory,
  scoreBusinessValidation,
  selectValidationFramework,
} from "./businessValidationSystem";

type BusinessValidationPipelineOutput = DynamicValidationResult & {
  validationIdea: string;
  _meta?: {
    runId: string;
    durationMs: number;
    aiPillarsUsed: boolean;
    scoreSource: "ai" | "heuristic";
  };
};

type ValidationScoreBreakdown = {
  market_demand: number;
  monetization: number;
  competition: number;
  acquisition: number;
  execution_feasibility: number;
  differentiation: number;
  risk: number;
};

type ValidationScoring = {
  overallScore: number;
  confidenceScore: number;
  scores: ValidationScoreBreakdown;
  strengths: string[];
  weaknesses: string[];
  keyRisks: string[];
  assumptionsToTest: string[];
  missingProof: string[];
  recommendedTests: string[];
  recommendedNextSteps: string[];
};

type CopyLocale = "en" | "fr" | "ht" | "es" | "pt";

type PipelineCopy = {
  inputLabels: {
    targetCustomer: string;
    targetMarket: string;
    location: string;
    offer: string;
    problem: string;
    pricingIdea: string;
    budget: string;
    skillSummary: string;
    timeline: string;
    days: string;
  };
  pillarLabels: Record<PillarKey, string>;
  constructiveVerdictLabels: Record<ConstructiveVerdict, string>;
  fallbackExperiments: string[];
  fallbackNextActions: string[];
  invalidCategoryFallback: string;
  strongSummary: (label: string, score: number) => string;
  moderateSummary: (label: string, score: number) => string;
  weakSummary: (label: string, score: number) => string;
  pathForwardPromisingExecution: string;
  pathForwardPromisingNeedsValidationNoWeak: string;
  pathForwardHighRiskManyWeak: string;
  pathForwardHighRiskSingle: (label: string) => string;
  pathForwardPromisingNeedsValidation: (labels: string) => string;
  scoreOneLiner: (score: number, category: string) => string;
  aiRiskPrefix: (label: string, advice: string) => string;
  conjunction: string;
};

const GENERIC_FALLBACK_PATTERNS: RegExp[] = [
  /^ai analysis completed\.?$/i,
  /^analysis completed\.?$/i,
  /^validation complete\.?$/i,
  /^business idea validation complete\.?$/i,
  /^your validation is ready\.?$/i,
  /^review the results below\.?$/i,
  /^review the strongest signals, main risks, and next steps below\.?$/i,
  /^not evaluated\.?$/i,
  /^gate \d+ not evaluated yet\.?$/i,
  /^additional validation evidence is required\.?$/i,
  /^more validation is required\.?$/i,
  /^continue validating assumptions with real customers before building\.?$/i,
  /^keep validating assumptions with real customers before building\.?$/i,
  /^you have room to differentiate with sharper positioning\.?$/i,
  /^no major opportunities identified\.?$/i,
  /^no significant risks identified\.?$/i,
  /^run a focused 10-day validation sprint on failed gates\.?$/i,
  /^re-run validation after applying improvements\.?$/i,
  /^pause execution on the current version of this idea\.?$/i,
  /^review alternative business models below\.?$/i,
  /^interview customers in an adjacent niche before choosing a pivot\.?$/i,
  /^select one pivot with stronger demand signals and rerun validation\.?$/i,
];

function normalizeCopyLocale(locale?: string | null): CopyLocale {
  if (locale === "fr") return "fr";
  if (locale === "ht") return "ht";
  if (locale === "es") return "es";
  if (locale === "pt") return "pt";
  return "en";
}

function getPipelineCopy(locale?: string | null): PipelineCopy {
  const normalizedLocale = normalizeCopyLocale(locale);

  switch (normalizedLocale) {
    case "fr":
      return {
        inputLabels: {
          targetCustomer: "Client cible",
          targetMarket: "Marché cible",
          location: "Lieu / marché",
          offer: "Offre",
          problem: "Problème résolu",
          pricingIdea: "Idée de prix",
          budget: "Budget",
          skillSummary: "Compétences pertinentes",
          timeline: "Calendrier",
          days: "jours",
        },
        pillarLabels: {
          problem_demand: "Problème / demande",
          customer_context_fit: "Client / contexte",
          competition_differentiation: "Concurrence / différenciation",
          business_model_money: "Modèle économique / argent",
          acquisition_channels: "Acquisition / canaux",
          execution_founder_fit: "Exécution / adéquation fondateur",
        },
        constructiveVerdictLabels: {
          promising_execution: "Prometteur — exécution suivante",
          promising_needs_validation: "Prometteur — validation nécessaire",
          high_risk_improve_or_pivot: "Risque élevé — retravail recommandé",
        },
        fallbackExperiments: [
          "Interrogez 5 clients potentiels sur leurs solutions actuelles.",
          "Créez une landing page simple pour tester l’intérêt.",
          "Menez une enquête de prix auprès de 20 clients potentiels.",
          "Trouvez 3 premiers utilisateurs pour un pilote.",
        ],
        fallbackNextActions: [
          "Parlez à 5 à 10 clients potentiels pour valider le problème prioritaire.",
          "Testez une offre claire avec une landing page simple ou un pilote manuel.",
          "Vérifiez le prix et la volonté de payer avant d’élargir le projet.",
        ],
        invalidCategoryFallback: "concept d’entreprise",
        strongSummary: (label, score) =>
          `${label} est solide (${score}/100). Cet aspect montre une vraie préparation.`,
        moderateSummary: (label, score) =>
          `${label} montre du potentiel (${score}/100), mais nécessite davantage de validation pour réduire l’incertitude.`,
        weakSummary: (label, score) =>
          `${label} est actuellement un point faible (${score}/100). Renforcez cet aspect avant de passer à l’échelle.`,
        pathForwardPromisingExecution:
          "Votre idée montre un fort potentiel. Concentrez-vous sur l’exécution et sur la construction d’une première version tout en continuant à valider avec de vrais clients.",
        pathForwardPromisingNeedsValidationNoWeak:
          "Votre idée est prometteuse. Validez les hypothèses clés à travers des entretiens clients et de petites expérimentations avant de construire.",
        pathForwardHighRiskManyWeak:
          "Envisagez de resserrer votre client cible, de simplifier votre offre ou de tester la demande avec un service manuel d’abord. L’idée de base peut être valable avec un meilleur repositionnement.",
        pathForwardHighRiskSingle: (label) =>
          `Corrigez d’abord la faiblesse principale dans ${label.toLowerCase()} avant d’avancer. Envisagez un pivot vers une approche plus ciblée.`,
        pathForwardPromisingNeedsValidation: (labels) =>
          `Votre idée est prometteuse, mais elle doit encore être validée dans ${labels}. Lancez les expériences recommandées avant d’investir lourdement.`,
        scoreOneLiner: (score, category) =>
          `Cette idée obtient ${score}/100 comme ${category}.`,
        aiRiskPrefix: (label, advice) => `${label} : ${advice}`,
        conjunction: "et",
      };

    case "ht":
      return {
        inputLabels: {
          targetCustomer: "Kliyan sib",
          targetMarket: "Mache sib",
          location: "Kote / mache",
          offer: "Òf",
          problem: "Pwoblèm biznis la ap rezoud",
          pricingIdea: "Lide sou pri",
          budget: "Bidjè",
          skillSummary: "Konpetans ki enpòtan",
          timeline: "Delè",
          days: "jou",
        },
        pillarLabels: {
          problem_demand: "Pwoblèm / demann",
          customer_context_fit: "Kliyan / kontèks",
          competition_differentiation: "Konpetisyon / diferansyasyon",
          business_model_money: "Modèl biznis / lajan",
          acquisition_channels: "Akwizisyon / chanèl",
          execution_founder_fit: "Egzekisyon / adaptasyon fondatè a",
        },
        constructiveVerdictLabels: {
          promising_execution: "Pwomèt — pase nan egzekisyon",
          promising_needs_validation: "Pwomèt — bezwen plis validasyon",
          high_risk_improve_or_pivot: "Gwo risk — bezwen repanse oswa korije",
        },
        fallbackExperiments: [
          "Fè entèvyou ak 5 kliyan potansyèl sou solisyon yo itilize kounye a.",
          "Kreye yon landing page senp pou teste enterè.",
          "Fè yon sondaj sou pri ak 20 kliyan potansyèl.",
          "Jwenn 3 premye itilizatè pou yon pwogram pilòt.",
        ],
        fallbackNextActions: [
          "Pale ak 5 a 10 kliyan potansyèl pou valide pwoblèm ki pi enpòtan an.",
          "Teste yon òf klè ak yon landing page senp oswa yon pilòt manyèl.",
          "Verifye pri a ak volonte kliyan pou peye anvan ou elaji lide a.",
        ],
        invalidCategoryFallback: "konsèp biznis",
        strongSummary: (label, score) =>
          `${label} solid (${score}/100). Aspè sa a montre bon nivo preparasyon.`,
        moderateSummary: (label, score) =>
          `${label} montre potansyèl (${score}/100), men li bezwen plis validasyon pou diminye ensètitid.`,
        weakSummary: (label, score) =>
          `${label} se yon pwen fèb kounye a (${score}/100). Ranfòse aspè sa a anvan ou elaji.`,
        pathForwardPromisingExecution:
          "Lide ou a montre gwo potansyèl. Konsantre sou egzekisyon ak bati premye vèsyon an pandan w ap kontinye valide ak kliyan reyèl.",
        pathForwardPromisingNeedsValidationNoWeak:
          "Lide ou a gen potansyèl. Valide sipozisyon kle yo atravè entèvyou kliyan ak ti eksperyans anvan ou bati.",
        pathForwardHighRiskManyWeak:
          "Konsidere sere kliyan sib la plis, senplifye òf la, oswa teste demann lan ak yon sèvis manyèl an premye. Genyen bon baz, men li ka bezwen repozisyonman.",
        pathForwardHighRiskSingle: (label) =>
          `Ranje feblès prensipal la nan ${label.toLowerCase()} anvan ou avanse. Konsidere yon pivot sou yon apwòch ki pi konsantre.`,
        pathForwardPromisingNeedsValidation: (labels) =>
          `Lide ou a pwomèt, men li bezwen plis validasyon nan ${labels}. Fè eksperyans yo anvan ou fè gwo envestisman.`,
        scoreOneLiner: (score, category) =>
          `Lide sa a jwenn ${score}/100 kòm yon ${category}.`,
        aiRiskPrefix: (label, advice) => `${label}: ${advice}`,
        conjunction: "ak",
      };

    case "es":
      return {
        inputLabels: {
          targetCustomer: "Cliente objetivo",
          targetMarket: "Mercado objetivo",
          location: "Ubicación / mercado",
          offer: "Oferta",
          problem: "Problema que resuelve",
          pricingIdea: "Idea de precio",
          budget: "Presupuesto",
          skillSummary: "Habilidades relevantes",
          timeline: "Plazo",
          days: "días",
        },
        pillarLabels: {
          problem_demand: "Problema / demanda",
          customer_context_fit: "Cliente / contexto",
          competition_differentiation: "Competencia / diferenciación",
          business_model_money: "Modelo de negocio / dinero",
          acquisition_channels: "Adquisición / canales",
          execution_founder_fit: "Ejecución / encaje del fundador",
        },
        constructiveVerdictLabels: {
          promising_execution: "Prometedora — pasar a ejecución",
          promising_needs_validation: "Prometedora — necesita validación",
          high_risk_improve_or_pivot: "Alto riesgo — rehacer o replantear",
        },
        fallbackExperiments: [
          "Entrevista a 5 clientes potenciales sobre sus soluciones actuales.",
          "Crea una landing page simple para probar el interés.",
          "Haz una encuesta de precios con 20 clientes potenciales.",
          "Consigue 3 primeros usuarios para un piloto.",
        ],
        fallbackNextActions: [
          "Habla con 5 a 10 clientes potenciales para validar el problema principal.",
          "Prueba una oferta clara con una landing page simple o un piloto manual.",
          "Verifica el precio y la disposición a pagar antes de ampliar el alcance.",
        ],
        invalidCategoryFallback: "concepto de negocio",
        strongSummary: (label, score) =>
          `${label} puntúa bien (${score}/100). Este aspecto muestra preparación real.`,
        moderateSummary: (label, score) =>
          `${label} muestra potencial (${score}/100), pero necesita más validación para reducir la incertidumbre.`,
        weakSummary: (label, score) =>
          `${label} es actualmente un punto débil (${score}/100). Refuerza esta parte antes de escalar.`,
        pathForwardPromisingExecution:
          "Tu idea muestra un potencial fuerte. Enfócate en ejecutar y construir una primera versión mientras sigues validando con clientes reales.",
        pathForwardPromisingNeedsValidationNoWeak:
          "Tu idea tiene potencial. Valida los supuestos clave mediante entrevistas con clientes y pequeños experimentos antes de construir.",
        pathForwardHighRiskManyWeak:
          "Considera enfocar más a tu cliente objetivo, simplificar tu oferta o probar la demanda primero con un servicio manual. La idea central puede ser valiosa con un mejor posicionamiento.",
        pathForwardHighRiskSingle: (label) =>
          `Corrige primero la debilidad clave en ${label.toLowerCase()} antes de avanzar. Considera pivotar hacia un enfoque más específico.`,
        pathForwardPromisingNeedsValidation: (labels) =>
          `Tu idea es prometedora, pero necesita validación en ${labels}. Ejecuta los experimentos sugeridos antes de hacer una inversión fuerte.`,
        scoreOneLiner: (score, category) =>
          `Esta idea obtiene ${score}/100 como ${category}.`,
        aiRiskPrefix: (label, advice) => `${label}: ${advice}`,
        conjunction: "y",
      };

    case "pt":
      return {
        inputLabels: {
          targetCustomer: "Cliente-alvo",
          targetMarket: "Mercado-alvo",
          location: "Localização / mercado",
          offer: "Oferta",
          problem: "Problema que resolve",
          pricingIdea: "Ideia de preço",
          budget: "Orçamento",
          skillSummary: "Competências relevantes",
          timeline: "Prazo",
          days: "dias",
        },
        pillarLabels: {
          problem_demand: "Problema / demanda",
          customer_context_fit: "Cliente / contexto",
          competition_differentiation: "Concorrência / diferenciação",
          business_model_money: "Modelo de negócio / dinheiro",
          acquisition_channels: "Aquisição / canais",
          execution_founder_fit: "Execução / encaixe do fundador",
        },
        constructiveVerdictLabels: {
          promising_execution: "Promissora — seguir para execução",
          promising_needs_validation: "Promissora — precisa de validação",
          high_risk_improve_or_pivot: "Alto risco — refazer ou reposicionar",
        },
        fallbackExperiments: [
          "Entreviste 5 clientes potenciais sobre as soluções que usam hoje.",
          "Crie uma landing page simples para testar interesse.",
          "Faça uma pesquisa de preço com 20 clientes potenciais.",
          "Encontre 3 primeiros usuários para um piloto.",
        ],
        fallbackNextActions: [
          "Converse com 5 a 10 clientes potenciais para validar o principal problema.",
          "Teste uma oferta clara com uma landing page simples ou um piloto manual.",
          "Verifique preço e disposição para pagar antes de ampliar o escopo.",
        ],
        invalidCategoryFallback: "conceito de negócio",
        strongSummary: (label, score) =>
          `${label} está forte (${score}/100). Esse aspecto mostra boa prontidão.`,
        moderateSummary: (label, score) =>
          `${label} mostra potencial (${score}/100), mas precisa de mais validação para reduzir a incerteza.`,
        weakSummary: (label, score) =>
          `${label} é um ponto fraco no momento (${score}/100). Fortaleça essa área antes de escalar.`,
        pathForwardPromisingExecution:
          "Sua ideia mostra forte potencial. Foque na execução e na construção da primeira versão enquanto continua validando com clientes reais.",
        pathForwardPromisingNeedsValidationNoWeak:
          "Sua ideia tem potencial. Valide as principais suposições com entrevistas com clientes e pequenos experimentos antes de construir.",
        pathForwardHighRiskManyWeak:
          "Considere restringir mais o cliente-alvo, simplificar a oferta ou testar a demanda primeiro com um serviço manual. A ideia central pode ter valor com melhor posicionamento.",
        pathForwardHighRiskSingle: (label) =>
          `Resolva primeiro a principal fraqueza em ${label.toLowerCase()} antes de avançar. Considere pivotar para uma abordagem mais focada.`,
        pathForwardPromisingNeedsValidation: (labels) =>
          `Sua ideia é promissora, mas precisa de validação em ${labels}. Execute os experimentos sugeridos antes de investir pesado.`,
        scoreOneLiner: (score, category) =>
          `Esta ideia alcança ${score}/100 como ${category}.`,
        aiRiskPrefix: (label, advice) => `${label}: ${advice}`,
        conjunction: "e",
      };

    case "en":
    default:
      return {
        inputLabels: {
          targetCustomer: "Target customer",
          targetMarket: "Target market",
          location: "Location/market",
          offer: "Offer",
          problem: "Problem being solved",
          pricingIdea: "Pricing idea",
          budget: "Budget",
          skillSummary: "Relevant skills",
          timeline: "Timeline",
          days: "days",
        },
        pillarLabels: {
          problem_demand: "Problem / demand",
          customer_context_fit: "Customer / context fit",
          competition_differentiation: "Competition / differentiation",
          business_model_money: "Business model / money",
          acquisition_channels: "Acquisition / channels",
          execution_founder_fit: "Execution / founder fit",
        },
        constructiveVerdictLabels: {
          promising_execution: "Promising — execution next",
          promising_needs_validation: "Promising — needs validation",
          high_risk_improve_or_pivot: "High risk — rework recommended",
        },
        fallbackExperiments: [
          "Interview 5 potential customers about their current solutions.",
          "Create a simple landing page to test interest.",
          "Run a pricing survey with 20 potential customers.",
          "Find 3 early adopters for a pilot program.",
        ],
        fallbackNextActions: [
          "Talk to 5 to 10 potential customers to validate the core problem.",
          "Test one clear offer with a simple landing page or manual pilot.",
          "Validate pricing and willingness to pay before expanding scope.",
        ],
        invalidCategoryFallback: "business concept",
        strongSummary: (label, score) =>
          `${label} scores well (${score}/100). This aspect shows real readiness.`,
        moderateSummary: (label, score) =>
          `${label} shows potential (${score}/100) but needs more validation to reduce uncertainty.`,
        weakSummary: (label, score) =>
          `${label} is currently a weak point (${score}/100). Focus here before scaling.`,
        pathForwardPromisingExecution:
          "Your idea shows strong potential. Focus on execution and building your first version while continuing to validate with real customers.",
        pathForwardPromisingNeedsValidationNoWeak:
          "Your idea has promise. Validate key assumptions through customer interviews and small experiments before building.",
        pathForwardHighRiskManyWeak:
          "Consider narrowing your target customer, simplifying your offering, or testing demand with a manual service first. The core insight may be valuable with better positioning.",
        pathForwardHighRiskSingle: (label) =>
          `Address the key weakness in ${label.toLowerCase()} before proceeding. Consider pivoting to a more focused approach.`,
        pathForwardPromisingNeedsValidation: (labels) =>
          `Your idea is promising but needs validation in ${labels}. Run the suggested experiments before heavy investment.`,
        scoreOneLiner: (score, category) =>
          `This idea scores ${score}/100 as a ${category}.`,
        aiRiskPrefix: (label, advice) => `${label}: ${advice}`,
        conjunction: "and",
      };
  }
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatList(items: string[], conjunction: string): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} ${conjunction} ${items[items.length - 1]}`;
}

function humanizeCategory(value?: string | null): string {
  if (!value) return "";
  return value.replaceAll("_", " ");
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const results: string[] = [];

  for (const value of values) {
    const normalized = value.trim();
    if (!normalized) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    results.push(normalized);
  }

  return results;
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function isGenericFallbackText(value: string): boolean {
  const text = cleanText(value);
  if (!text) return true;
  return GENERIC_FALLBACK_PATTERNS.some((pattern) => pattern.test(text));
}

function normalizeLocalizedList(
  values: string[] | undefined,
  fallback: string[]
): string[] {
  const cleaned = Array.isArray(values)
    ? values.map((value) => cleanText(value)).filter((value) => value.length > 0)
    : [];

  if (cleaned.length === 0) return fallback;

  const allGeneric = cleaned.every((value) => isGenericFallbackText(value));
  if (allGeneric) return fallback;

  return uniqueStrings(cleaned);
}

function getLocalizedConstructiveVerdictLabel(
  verdict: ConstructiveVerdict,
  locale: string
): string {
  return getPipelineCopy(locale).constructiveVerdictLabels[verdict];
}

function buildValidationIdea(input: ValidationInput, locale: string): string {
  const copy = getPipelineCopy(locale);

  const parts = [
    input.idea.trim(),
    input.targetCustomer
      ? `${copy.inputLabels.targetCustomer}: ${input.targetCustomer.trim()}`
      : null,
    input.targetMarket
      ? `${copy.inputLabels.targetMarket}: ${input.targetMarket.trim()}`
      : null,
    input.location ? `${copy.inputLabels.location}: ${input.location.trim()}` : null,
    input.offer ? `${copy.inputLabels.offer}: ${input.offer.trim()}` : null,
    input.problem ? `${copy.inputLabels.problem}: ${input.problem.trim()}` : null,
    input.pricingIdea
      ? `${copy.inputLabels.pricingIdea}: ${input.pricingIdea.trim()}`
      : null,
    typeof input.budgetUsd === "number"
      ? `${copy.inputLabels.budget}: $${Math.round(input.budgetUsd)}`
      : null,
    input.skillSummary
      ? `${copy.inputLabels.skillSummary}: ${input.skillSummary.trim()}`
      : null,
    typeof input.timelineDays === "number"
      ? `${copy.inputLabels.timeline}: ${Math.round(input.timelineDays)} ${copy.inputLabels.days}`
      : null,
  ];

  return parts.filter((part): part is string => Boolean(part)).join("\n");
}

function getLocalizedPillarLabel(key: PillarKey, locale: string): string {
  return getPipelineCopy(locale).pillarLabels[key];
}

function getFallbackAdvice(
  pillarFramework: ReturnType<typeof getPillarFramework>["pillars"][number] | undefined,
  status: string
): string[] {
  if (!pillarFramework) return [];
  if (status === "weak") {
    return pillarFramework.weakAdvice.slice(0, 3).map((item) => item.advice);
  }
  if (status === "moderate") {
    return pillarFramework.moderateAdvice.slice(0, 3).map((item) => item.advice);
  }
  return pillarFramework.strongAdvice.slice(0, 3).map((item) => item.advice);
}

function buildFallbackSummary(
  key: PillarKey,
  score: number,
  status: string,
  scoring: Pick<ValidationScoring, "strengths" | "weaknesses" | "keyRisks">,
  locale: string
): string {
  const pillarLabel = getLocalizedPillarLabel(key, locale);
  const copy = getPipelineCopy(locale);
  const keyWords = key.replace(/_/g, " ").split(" ");

  const relevantStrengths = scoring.strengths.filter((item) =>
    keyWords.some((word) => item.toLowerCase().includes(word))
  );
  const relevantWeaknesses = scoring.weaknesses.filter((item) =>
    keyWords.some((word) => item.toLowerCase().includes(word))
  );
  const relevantRisks = scoring.keyRisks.filter((item) =>
    keyWords.some((word) => item.toLowerCase().includes(word))
  );

  if (status === "strong" && relevantStrengths.length > 0) return relevantStrengths[0];
  if (status === "weak" && relevantWeaknesses.length > 0) return relevantWeaknesses[0];
  if (status === "weak" && relevantRisks.length > 0) return relevantRisks[0];
  if (relevantStrengths.length > 0) return relevantStrengths[0];
  if (relevantWeaknesses.length > 0) return relevantWeaknesses[0];

  if (status === "strong") return copy.strongSummary(pillarLabel, score);
  if (status === "moderate") return copy.moderateSummary(pillarLabel, score);
  return copy.weakSummary(pillarLabel, score);
}

function buildFallbackPillar(
  key: PillarKey,
  scoring: Pick<
    ValidationScoring,
    "overallScore" | "scores" | "strengths" | "weaknesses" | "keyRisks"
  >,
  framework: ReturnType<typeof getPillarFramework>,
  pillarFramework: ReturnType<typeof getPillarFramework>["pillars"][number] | undefined,
  locale: string
): PillarResult {
  const pillarScoreMapping: Record<PillarKey, number> = {
    problem_demand: clampScore(scoring.scores.market_demand),
    customer_context_fit: clampScore(
      (scoring.scores.market_demand + scoring.scores.acquisition) / 2
    ),
    competition_differentiation: clampScore(
      (scoring.scores.competition + scoring.scores.differentiation) / 2
    ),
    business_model_money: clampScore(scoring.scores.monetization),
    acquisition_channels: clampScore(scoring.scores.acquisition),
    execution_founder_fit: clampScore(scoring.scores.execution_feasibility),
  };

  const score = pillarScoreMapping[key] ?? 50;
  const status = getPillarStatus(score);

  return {
    key,
    label: getLocalizedPillarLabel(key, locale),
    score,
    status,
    summary: buildFallbackSummary(key, score, status, scoring, locale),
    advice: getFallbackAdvice(pillarFramework, status),
    questions: pillarFramework?.questions.map((question) => question.question) ?? [],
    evidence: [],
  };
}

function buildFallbackPathForward(
  verdict: ConstructiveVerdict,
  pillars: PillarResult[],
  locale: string
): string {
  const copy = getPipelineCopy(locale);
  const weakPillars = pillars.filter((pillar) => pillar.status === "weak");

  if (verdict === "promising_execution") {
    return copy.pathForwardPromisingExecution;
  }

  if (verdict === "promising_needs_validation") {
    if (weakPillars.length > 0) {
      const labels = formatList(
        weakPillars.map((pillar) => pillar.label.toLowerCase()),
        copy.conjunction
      );
      return copy.pathForwardPromisingNeedsValidation(labels);
    }
    return copy.pathForwardPromisingNeedsValidationNoWeak;
  }

  if (weakPillars.length >= 3) {
    return copy.pathForwardHighRiskManyWeak;
  }

  return copy.pathForwardHighRiskSingle(
    weakPillars[0]?.label ?? getPipelineCopy(locale).invalidCategoryFallback
  );
}

function generatePillarValidation(
  input: ValidationInput,
  scoring: ValidationScoring,
  category: string,
  baseResult: DynamicValidationResult,
  locale: string
): PillarBasedValidation {
  const framework = getPillarFramework(category);
  const aiPillarData = baseResult.aiPillarData;
  const finalOverallScore = scoring.overallScore;
  const copy = getPipelineCopy(locale);

  if (aiPillarData && aiPillarData.pillars.length >= 3) {
    const aiPillarMap = new Map(aiPillarData.pillars.map((pillar) => [pillar.key, pillar]));

    const pillars: PillarResult[] = PILLAR_KEYS.map((key) => {
      const aiPillar = aiPillarMap.get(key);
      const pillarFramework = framework.pillars.find((pillar) => pillar.key === key);

      if (aiPillar && aiPillar.summary) {
        return {
          key,
          label: getLocalizedPillarLabel(key, locale),
          score: aiPillar.score,
          status: aiPillar.status as PillarResult["status"],
          summary: aiPillar.summary,
          advice:
            aiPillar.advice.length > 0
              ? aiPillar.advice
              : getFallbackAdvice(pillarFramework, aiPillar.status),
          questions: pillarFramework?.questions.map((question) => question.question) ?? [],
          evidence: aiPillar.evidence,
        };
      }

      return buildFallbackPillar(key, scoring, framework, pillarFramework, locale);
    });

    const overallScore = finalOverallScore;
    const verdict = getConstructiveVerdict(overallScore);
    const verdictLabel = getLocalizedConstructiveVerdictLabel(verdict, locale);

    const nextExperiments = normalizeLocalizedList(
      uniqueStrings([
        ...(aiPillarData.nextExperiments.length >= 3
          ? aiPillarData.nextExperiments.slice(0, 5)
          : []),
        ...(scoring.recommendedTests.length >= 3 ? scoring.recommendedTests.slice(0, 5) : []),
        ...aiPillarData.nextExperiments,
        ...scoring.recommendedTests,
      ]),
      copy.fallbackExperiments
    ).slice(0, 5);

    const aiPathForward = cleanText(aiPillarData.pathForward);
    const pathForward =
      aiPathForward && !isGenericFallbackText(aiPathForward)
        ? aiPathForward
        : buildFallbackPathForward(verdict, pillars, locale);

    return {
      pillars,
      overallScore,
      verdict,
      verdictLabel,
      nextExperiments,
      pathForward,
    };
  }

  const pillarScoreMapping: Record<PillarKey, number> = {
    problem_demand: clampScore(scoring.scores.market_demand),
    customer_context_fit: clampScore(
      (scoring.scores.market_demand + scoring.scores.acquisition) / 2
    ),
    competition_differentiation: clampScore(
      (scoring.scores.competition + scoring.scores.differentiation) / 2
    ),
    business_model_money: clampScore(scoring.scores.monetization),
    acquisition_channels: clampScore(scoring.scores.acquisition),
    execution_founder_fit: clampScore(scoring.scores.execution_feasibility),
  };

  const pillars: PillarResult[] = PILLAR_KEYS.map((key) => {
    const pillarFramework = framework.pillars.find((pillar) => pillar.key === key);
    const score = pillarScoreMapping[key] ?? 50;
    const status = getPillarStatus(score);

    return {
      key,
      label: getLocalizedPillarLabel(key, locale),
      score,
      status,
      summary: buildFallbackSummary(key, score, status, scoring, locale),
      advice: getFallbackAdvice(pillarFramework, status),
      questions: pillarFramework?.questions.map((question) => question.question) ?? [],
      evidence: [],
    };
  });

  const overallScore = finalOverallScore;
  const verdict = getConstructiveVerdict(overallScore);
  const verdictLabel = getLocalizedConstructiveVerdictLabel(verdict, locale);

  const nextExperiments = normalizeLocalizedList(
    uniqueStrings(scoring.recommendedTests),
    copy.fallbackExperiments
  ).slice(0, 5);

  const pathForward = buildFallbackPathForward(verdict, pillars, locale);

  return {
    pillars,
    overallScore,
    verdict,
    verdictLabel,
    nextExperiments,
    pathForward,
  };
}

export async function runBusinessValidationPipeline(
  input: ValidationInput
): Promise<BusinessValidationPipelineOutput> {
  const startTime = Date.now();
  const runId = `run_${startTime}_${Math.random().toString(36).slice(2, 8)}`;
  const DEBUG = process.env.VALIDATION_DEBUG === "true";
  const locale: Locale = input.locale ?? "en";
  const copy = getPipelineCopy(locale);
  const validationIdea = buildValidationIdea(input, locale);

  if (DEBUG) {
    console.log(`[VALIDATION_DEBUG][${runId}] === NEW VALIDATION RUN ===`);
    console.log(
      `[VALIDATION_DEBUG][${runId}] Input idea: "${input.idea?.slice(0, 100)}..."`
    );
  }

  const baseResult = await validateIdeaDynamic({
    ...input,
    idea: validationIdea,
    locale,
  });

  if (DEBUG) {
    console.log(`[VALIDATION_DEBUG][${runId}] AI Category: ${baseResult.category}`);
    console.log(
      `[VALIDATION_DEBUG][${runId}] AI Framework: ${
        baseResult.frameworkUsed ?? baseResult.framework_used
      }`
    );
    console.log(
      `[VALIDATION_DEBUG][${runId}] AI Score: ${baseResult.frameworkReport?.weightedScore}`
    );
  }

  const categoryRouting = routeBusinessCategory(input, validationIdea, baseResult);
  const selectedFramework = selectValidationFramework(
    input,
    baseResult.category,
    baseResult
  );
  const research = await buildValidationResearch(input, baseResult);

  if (DEBUG) {
    console.log(
      `[VALIDATION_DEBUG][${runId}] Routed Category: ${categoryRouting.businessCategory}`
    );
    console.log(
      `[VALIDATION_DEBUG][${runId}] Selected Framework: ${selectedFramework.frameworkName}`
    );
    console.log(
      `[VALIDATION_DEBUG][${runId}] Specialization: ${
        selectedFramework.specialization ?? "none"
      }`
    );
    console.log(
      `[VALIDATION_DEBUG][${runId}] Specialization Segment: ${
        selectedFramework.resolvedSpecialization?.segment ?? "none"
      }`
    );
    console.log(
      `[VALIDATION_DEBUG][${runId}] Specialization BusinessModelType: ${
        selectedFramework.resolvedSpecialization?.businessModelType ?? "none"
      }`
    );
    console.log(
      `[VALIDATION_DEBUG][${runId}] Research Sources: ${
        research.summary?.sources?.length ?? 0
      }`
    );
  }

  const heuristicScoring = scoreBusinessValidation({
    input,
    result: baseResult,
    routing: categoryRouting,
    framework: selectedFramework.profile,
    research,
    specialization: selectedFramework.resolvedSpecialization,
  }) as ValidationScoring;

  const aiPillarData = baseResult.aiPillarData;
  const hasAIPillars = Boolean(aiPillarData && aiPillarData.pillars.length >= 3);

  let scoring: ValidationScoring = heuristicScoring;

  if (hasAIPillars && aiPillarData) {
    const aiPillarMap = new Map(aiPillarData.pillars.map((pillar) => [pillar.key, pillar]));

    const aiDerivedScores: ValidationScoreBreakdown = {
      market_demand: clampScore(
        aiPillarMap.get("problem_demand")?.score ?? heuristicScoring.scores.market_demand
      ),
      monetization: clampScore(
        aiPillarMap.get("business_model_money")?.score ??
          heuristicScoring.scores.monetization
      ),
      competition: clampScore(
        aiPillarMap.get("competition_differentiation")?.score ??
          heuristicScoring.scores.competition
      ),
      acquisition: clampScore(
        aiPillarMap.get("acquisition_channels")?.score ??
          heuristicScoring.scores.acquisition
      ),
      execution_feasibility: clampScore(
        aiPillarMap.get("execution_founder_fit")?.score ??
          heuristicScoring.scores.execution_feasibility
      ),
      differentiation: clampScore(
        aiPillarMap.get("competition_differentiation")?.score ??
          heuristicScoring.scores.differentiation
      ),
      risk: clampScore(
        100 -
          aiPillarData.pillars.reduce((sum, pillar) => sum + pillar.score, 0) /
            aiPillarData.pillars.length
      ),
    };

    const pillarWeights: Record<string, number> = {
      problem_demand: 0.2,
      customer_context_fit: 0.15,
      competition_differentiation: 0.2,
      business_model_money: 0.2,
      acquisition_channels: 0.15,
      execution_founder_fit: 0.1,
    };

    const aiOverallScore = clampScore(
      aiPillarData.pillars.reduce((total, pillar) => {
        return total + pillar.score * (pillarWeights[pillar.key] ?? 0.15);
      }, 0)
    );

    const aiStrengths = aiPillarData.pillars
      .filter((pillar) => pillar.status === "strong" && pillar.summary)
      .map((pillar) => pillar.summary);

    const aiWeaknesses = aiPillarData.pillars
      .filter((pillar) => pillar.status === "weak" && pillar.summary)
      .map((pillar) => pillar.summary);

    const aiKeyRisks = aiPillarData.pillars
      .filter((pillar) => pillar.status === "weak")
      .flatMap((pillar) =>
        pillar.advice.slice(0, 1).map((advice) =>
          copy.aiRiskPrefix(getLocalizedPillarLabel(pillar.key as PillarKey, locale), advice)
        )
      );

    const aiAssumptions = aiPillarData.pillars
      .filter((pillar) => pillar.status === "weak" || pillar.status === "moderate")
      .flatMap((pillar) => pillar.advice.slice(0, 1));

    const aiMissingProof = aiPillarData.pillars
      .filter((pillar) => pillar.status === "weak")
      .map((pillar) =>
        copy.aiRiskPrefix(getLocalizedPillarLabel(pillar.key as PillarKey, locale), pillar.summary)
      );

    scoring = {
      ...heuristicScoring,
      overallScore: aiOverallScore,
      scores: aiDerivedScores,
      strengths: uniqueStrings([...aiStrengths, ...heuristicScoring.strengths]).slice(0, 5),
      weaknesses: uniqueStrings([...aiWeaknesses, ...heuristicScoring.weaknesses]).slice(0, 5),
      keyRisks: uniqueStrings([...aiKeyRisks, ...heuristicScoring.keyRisks]).slice(0, 5),
      recommendedTests:
        aiPillarData.nextExperiments.length > 0
          ? uniqueStrings([
              ...aiPillarData.nextExperiments,
              ...heuristicScoring.recommendedTests,
            ]).slice(0, 5)
          : heuristicScoring.recommendedTests,
      recommendedNextSteps:
        aiPillarData.nextExperiments.length > 0
          ? uniqueStrings([
              ...aiPillarData.nextExperiments,
              ...heuristicScoring.recommendedNextSteps,
            ]).slice(0, 5)
          : heuristicScoring.recommendedNextSteps,
      assumptionsToTest: uniqueStrings([
        ...aiAssumptions,
        ...heuristicScoring.assumptionsToTest,
      ]).slice(0, 5),
      missingProof: uniqueStrings([...aiMissingProof, ...heuristicScoring.missingProof]).slice(
        0,
        5
      ),
    };

    if (DEBUG) {
      console.log(
        `[VALIDATION_DEBUG][${runId}] Using AI-derived scores (AI pillar data available)`
      );
      console.log(
        `[VALIDATION_DEBUG][${runId}] AI Overall Score: ${aiOverallScore} (heuristic was: ${heuristicScoring.overallScore})`
      );
    }
  }

  const stabilizedOverallScore = scoring.overallScore;
  const stabilizedFinalVerdict = finalVerdictFromOverallScore(stabilizedOverallScore);
  const stabilizedDecision = frameworkDecisionFromOverallScore(stabilizedOverallScore);

  if (DEBUG) {
    console.log(`[VALIDATION_DEBUG][${runId}] Final Score: ${stabilizedOverallScore}`);
    console.log(
      `[VALIDATION_DEBUG][${runId}] Final Verdict: ${stabilizedFinalVerdict}`
    );
    console.log(`[VALIDATION_DEBUG][${runId}] Final Decision: ${stabilizedDecision}`);
    console.log(
      `[VALIDATION_DEBUG][${runId}] Score Breakdown: ${JSON.stringify(scoring.scores)}`
    );
    console.log(
      `[VALIDATION_DEBUG][${runId}] Strengths count: ${scoring.strengths.length}`
    );
    console.log(
      `[VALIDATION_DEBUG][${runId}] Weaknesses count: ${scoring.weaknesses.length}`
    );
    console.log(`[VALIDATION_DEBUG][${runId}] === END RUN ${runId} ===`);
  }

  const publicCategory = categoryRouting.businessCategory;
  const inferredBusinessModel = inferValidationBusinessModel(input, baseResult);
  const modelRouting = buildValidationModelRouting();

  const frameworkReport = baseResult.frameworkReport
    ? {
        ...baseResult.frameworkReport,
        decision: stabilizedDecision,
        weightedScore: stabilizedOverallScore,
      }
    : undefined;

  const normalizedRecommendedNextSteps = normalizeLocalizedList(
    scoring.recommendedNextSteps,
    copy.fallbackNextActions
  ).slice(0, 5);

  const normalizedBaseNextActions = normalizeLocalizedList(
    baseResult.nextActions,
    copy.fallbackNextActions
  ).slice(0, 5);

  const nextActions = normalizedRecommendedNextSteps.length
    ? normalizedRecommendedNextSteps
    : normalizedBaseNextActions;

  const pillarValidation = generatePillarValidation(
    input,
    scoring,
    publicCategory,
    baseResult,
    locale
  );

  const baseOneLiner = cleanText(baseResult.summary?.oneLiner);
  const summaryOneLiner =
    baseOneLiner && !isGenericFallbackText(baseOneLiner)
      ? baseOneLiner
      : copy.scoreOneLiner(
          stabilizedOverallScore,
          humanizeCategory(publicCategory) || copy.invalidCategoryFallback
        );

  return {
    ...baseResult,
    status: statusFromFrameworkDecision(stabilizedDecision),
    buildTriggered: true,
    buildJobs:
      baseResult.buildJobs?.length
        ? baseResult.buildJobs
        : [{ type: "website", status: "queued" }],
    verdict: verdictFromOverallScore(stabilizedOverallScore),
    validationIdea,
    frameworkReport,
    summary: {
      ...(baseResult.summary ?? {}),
      oneLiner: summaryOneLiner,
    },
    nextActions,
    submittedContext: {
      idea: input.idea,
      targetCustomer: input.targetCustomer,
      targetMarket: input.targetMarket,
      location: input.location,
      offer: input.offer,
      problem: input.problem,
      pricingIdea: input.pricingIdea,
      budgetUsd: input.budgetUsd,
      skillSummary: input.skillSummary,
      channels: input.channels,
      timelineDays: input.timelineDays,
      experienceLevel: input.experienceLevel,
    },
    businessCategory: publicCategory,
    frameworkUsed: selectedFramework.frameworkName,
    confidenceScore: scoring.confidenceScore,
    scores: scoring.scores,
    strengths: scoring.strengths,
    weaknesses: scoring.weaknesses,
    keyRisks: scoring.keyRisks,
    assumptionsToTest: scoring.assumptionsToTest,
    missingProof: scoring.missingProof,
    recommendedTests: normalizeLocalizedList(
      scoring.recommendedTests,
      copy.fallbackExperiments
    ).slice(0, 5),
    recommendedNextSteps: normalizedRecommendedNextSteps,
    finalVerdict: stabilizedFinalVerdict,
    inferredBusinessModel,
    categoryRouting: categoryRouting as ValidationCategoryRouting,
    selectedFramework: {
      frameworkName: selectedFramework.frameworkName,
      frameworkLabel: selectedFramework.frameworkLabel,
      version: selectedFramework.version,
      criteria: selectedFramework.criteria,
      specialization: selectedFramework.specialization,
      reason: selectedFramework.reason,
    },
    researchSummary: research.summary,
    modelRouting,
    nextActionCtas: buildValidationCtas(locale),
    business_category: publicCategory,
    framework_used: selectedFramework.frameworkName,
    overall_score: stabilizedOverallScore,
    confidence_score: scoring.confidenceScore,
    key_risks: scoring.keyRisks,
    assumptions_to_test: scoring.assumptionsToTest,
    missing_proof: scoring.missingProof,
    recommended_tests: normalizeLocalizedList(
      scoring.recommendedTests,
      copy.fallbackExperiments
    ).slice(0, 5),
    recommended_next_steps: normalizedRecommendedNextSteps,
    final_verdict: stabilizedFinalVerdict,
    pillarValidation: {
      ...pillarValidation,
      verdictLabel: getLocalizedConstructiveVerdictLabel(pillarValidation.verdict, locale),
    },
    constructiveVerdict: pillarValidation.verdict,
    constructiveVerdictLabel: getLocalizedConstructiveVerdictLabel(
      pillarValidation.verdict,
      locale
    ),
    _meta: {
      runId,
      durationMs: Date.now() - startTime,
      aiPillarsUsed: hasAIPillars,
      scoreSource: hasAIPillars ? "ai" : "heuristic",
    },
  };
}