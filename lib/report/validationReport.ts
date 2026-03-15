import type {
  DynamicValidationResult,
  FrameworkDecision,
  Locale,
  PillarResult,
} from "@/src/validation/types";
import {
  resolveFrameworkDecision,
  resolveOverallScore100,
} from "@/src/validation/decision";

type ValidationReportInput = {
  idea: string;
  email?: string;
  locale: Locale;
  result: DynamicValidationResult;
  generatedAt?: string;
};

export type ValidationReportDocument = {
  filename: string;
  text: string;
  generatedAt: string;
};

type UnknownRecord = Record<string, unknown>;

type ReportCopy = {
  title: string;
  generatedAt: string;
  locale: string;
  email: string;
  notProvided: string;
  decision: string;
  overallScore: string;
  confidence: string;
  marketDemand: string;
  competition: string;
  executionFeasibility: string;
  monetization: string;
  acquisition: string;
  differentiation: string;
  risk: string;
  submittedIdea: string;
  summary: string;
  context: string;
  category: string;
  country: string;
  framework: string;
  topOpportunities: string;
  biggestRisks: string;
  nextActions: string;
  gateAnalysis: string;
  validationPillars: string;
  pathForward: string;
  nextExperiments: string;
  generatedBy: string;
  dbaLine: string;
  notAvailable: string;
  validationCompleted: string;
  decisionLabels: Record<FrameworkDecision, string>;
  pillarStatuses: {
    strong: string;
    moderate: string;
    weak: string;
    unknown: string;
  };
  gates: {
    blocked: string;
    waitingForGate: (gate: number) => string;
  };
};

function getReportCopy(locale: Locale): ReportCopy {
  switch (locale) {
    case "fr":
      return {
        title: "Rapport de validation BizSproutAI",
        generatedAt: "Généré le",
        locale: "Langue",
        email: "E-mail",
        notProvided: "non fourni",
        decision: "Décision",
        overallScore: "Score global",
        confidence: "Confiance",
        marketDemand: "Demande du marché",
        competition: "Concurrence",
        executionFeasibility: "Faisabilité d’exécution",
        monetization: "Monétisation",
        acquisition: "Acquisition",
        differentiation: "Différenciation",
        risk: "Risque",
        submittedIdea: "Idée soumise",
        summary: "Résumé",
        context: "Contexte",
        category: "Catégorie",
        country: "Pays",
        framework: "Cadre",
        topOpportunities: "Meilleures opportunités",
        biggestRisks: "Principaux risques",
        nextActions: "Prochaines actions",
        gateAnalysis: "Analyse des portes",
        validationPillars: "Piliers de validation",
        pathForward: "Voie à suivre",
        nextExperiments: "Prochaines expériences",
        generatedBy: "Généré par BizSproutAI",
        dbaLine: "BizSproutAI est un DBA de Kreyol Thrive Biz.",
        notAvailable: "n/a",
        validationCompleted: "Validation terminée.",
        decisionLabels: {
          GO: "Prometteur — Prêt à exécuter",
          CONDITIONAL_GO: "Prometteur — Nécessite une validation",
          NEED_WORK: "Phase précoce — Valider avant de construire",
          PIVOT_RECOMMENDED: "Risque élevé — Améliorer ou pivoter",
        },
        pillarStatuses: {
          strong: "Fort",
          moderate: "Moyen",
          weak: "Faible",
          unknown: "Inconnu",
        },
        gates: {
          blocked: "BLOQUÉ",
          waitingForGate: (gate) => `(en attente de la porte ${gate})`,
        },
      };

    case "ht":
      return {
        title: "Rapò validasyon BizSproutAI",
        generatedAt: "Jenere nan",
        locale: "Lang",
        email: "Imèl",
        notProvided: "pa bay",
        decision: "Desizyon",
        overallScore: "Nòt jeneral",
        confidence: "Konfyans",
        marketDemand: "Demann mache",
        competition: "Konpetisyon",
        executionFeasibility: "Fasilite egzekisyon",
        monetization: "Monetizasyon",
        acquisition: "Akwizisyon",
        differentiation: "Diferansyasyon",
        risk: "Risk",
        submittedIdea: "Lide ki soumèt la",
        summary: "Rezime",
        context: "Kontèks",
        category: "Kategori",
        country: "Peyi",
        framework: "Kad",
        topOpportunities: "Pi gwo opòtinite yo",
        biggestRisks: "Pi gwo risk yo",
        nextActions: "Pwochen aksyon yo",
        gateAnalysis: "Analiz etap yo",
        validationPillars: "Pilye validasyon yo",
        pathForward: "Chemen pou avanse",
        nextExperiments: "Pwochen eksperyans yo",
        generatedBy: "BizSproutAI te jenere sa",
        dbaLine: "BizSproutAI se yon DBA de Kreyol Thrive Biz.",
        notAvailable: "n/a",
        validationCompleted: "Validasyon an fini.",
        decisionLabels: {
          GO: "Pwomèt — Pare pou egzekite",
          CONDITIONAL_GO: "Pwomèt — Bezwen validasyon",
          NEED_WORK: "Bonè toujou — Valide anvan bati",
          PIVOT_RECOMMENDED: "Gwo risk — Amelyore oswa fè pivot",
        },
        pillarStatuses: {
          strong: "Fò",
          moderate: "Mwayen",
          weak: "Fèb",
          unknown: "Enkoni",
        },
        gates: {
          blocked: "BLOKE",
          waitingForGate: (gate) => `(ap tann etap ${gate})`,
        },
      };

    case "es":
      return {
        title: "Informe de validación BizSproutAI",
        generatedAt: "Generado el",
        locale: "Idioma",
        email: "Correo electrónico",
        notProvided: "no proporcionado",
        decision: "Decisión",
        overallScore: "Puntuación general",
        confidence: "Confianza",
        marketDemand: "Demanda del mercado",
        competition: "Competencia",
        executionFeasibility: "Viabilidad de ejecución",
        monetization: "Monetización",
        acquisition: "Adquisición",
        differentiation: "Diferenciación",
        risk: "Riesgo",
        submittedIdea: "Idea enviada",
        summary: "Resumen",
        context: "Contexto",
        category: "Categoría",
        country: "País",
        framework: "Marco",
        topOpportunities: "Principales oportunidades",
        biggestRisks: "Mayores riesgos",
        nextActions: "Siguientes acciones",
        gateAnalysis: "Análisis de compuertas",
        validationPillars: "Pilares de validación",
        pathForward: "Camino a seguir",
        nextExperiments: "Siguientes experimentos",
        generatedBy: "Generado por BizSproutAI",
        dbaLine: "BizSproutAI es un DBA de Kreyol Thrive Biz.",
        notAvailable: "n/a",
        validationCompleted: "Validación completada.",
        decisionLabels: {
          GO: "Prometedor — Listo para ejecutar",
          CONDITIONAL_GO: "Prometedor — Necesita validación",
          NEED_WORK: "Etapa temprana — Validar antes de construir",
          PIVOT_RECOMMENDED: "Alto riesgo — Mejorar o pivotar",
        },
        pillarStatuses: {
          strong: "Fuerte",
          moderate: "Moderado",
          weak: "Débil",
          unknown: "Desconocido",
        },
        gates: {
          blocked: "BLOQUEADO",
          waitingForGate: (gate) => `(esperando la compuerta ${gate})`,
        },
      };

    case "pt":
      return {
        title: "Relatório de validação BizSproutAI",
        generatedAt: "Gerado em",
        locale: "Idioma",
        email: "E-mail",
        notProvided: "não informado",
        decision: "Decisão",
        overallScore: "Pontuação geral",
        confidence: "Confiança",
        marketDemand: "Demanda de mercado",
        competition: "Concorrência",
        executionFeasibility: "Viabilidade de execução",
        monetization: "Monetização",
        acquisition: "Aquisição",
        differentiation: "Diferenciação",
        risk: "Risco",
        submittedIdea: "Ideia enviada",
        summary: "Resumo",
        context: "Contexto",
        category: "Categoria",
        country: "País",
        framework: "Framework",
        topOpportunities: "Principais oportunidades",
        biggestRisks: "Maiores riscos",
        nextActions: "Próximas ações",
        gateAnalysis: "Análise de gates",
        validationPillars: "Pilares de validação",
        pathForward: "Caminho a seguir",
        nextExperiments: "Próximos experimentos",
        generatedBy: "Gerado por BizSproutAI",
        dbaLine: "BizSproutAI é um DBA da Kreyol Thrive Biz.",
        notAvailable: "n/a",
        validationCompleted: "Validação concluída.",
        decisionLabels: {
          GO: "Promissor — Pronto para executar",
          CONDITIONAL_GO: "Promissor — Precisa de validação",
          NEED_WORK: "Estágio inicial — Validar antes de construir",
          PIVOT_RECOMMENDED: "Alto risco — Melhorar ou pivotar",
        },
        pillarStatuses: {
          strong: "Forte",
          moderate: "Moderado",
          weak: "Fraco",
          unknown: "Desconhecido",
        },
        gates: {
          blocked: "BLOQUEADO",
          waitingForGate: (gate) => `(aguardando o gate ${gate})`,
        },
      };

    case "en":
    default:
      return {
        title: "BizSproutAI Business Validation Report",
        generatedAt: "Generated at",
        locale: "Locale",
        email: "Email",
        notProvided: "not provided",
        decision: "Decision",
        overallScore: "Overall score",
        confidence: "Confidence",
        marketDemand: "Market demand",
        competition: "Competition",
        executionFeasibility: "Execution feasibility",
        monetization: "Monetization",
        acquisition: "Acquisition",
        differentiation: "Differentiation",
        risk: "Risk",
        submittedIdea: "Submitted Idea",
        summary: "Summary",
        context: "Context",
        category: "Category",
        country: "Country",
        framework: "Framework",
        topOpportunities: "Top Opportunities",
        biggestRisks: "Biggest Risks",
        nextActions: "Next Actions",
        gateAnalysis: "Gate Analysis",
        validationPillars: "Validation Pillars",
        pathForward: "Path Forward",
        nextExperiments: "Next Experiments",
        generatedBy: "Generated by BizSproutAI",
        dbaLine: "BizSproutAI is a DBA of Kreyol Thrive Biz.",
        notAvailable: "n/a",
        validationCompleted: "Validation completed.",
        decisionLabels: {
          GO: "Promising — Ready to Execute",
          CONDITIONAL_GO: "Promising — Needs Validation",
          NEED_WORK: "Early Stage — Validate Before Building",
          PIVOT_RECOMMENDED: "High Risk — Improve or Pivot",
        },
        pillarStatuses: {
          strong: "Strong",
          moderate: "Moderate",
          weak: "Weak",
          unknown: "Unknown",
        },
        gates: {
          blocked: "BLOCKED",
          waitingForGate: (gate) => `(waiting for Gate ${gate})`,
        },
      };
  }
}

function resolveReportScore(result: DynamicValidationResult): number {
  return resolveOverallScore100(result);
}

function decisionLabel(decision: FrameworkDecision, locale: Locale): string {
  return getReportCopy(locale).decisionLabels[decision];
}

function getDecision(result: DynamicValidationResult): FrameworkDecision {
  return resolveFrameworkDecision(result);
}

function safeSegment(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0
  );
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function humanizeCategory(value: string): string {
  return value.replace(/_/g, " ");
}

function resolveCategory(result: DynamicValidationResult, locale: Locale): string {
  const value =
    result.businessCategory ?? result.business_category ?? result.category;
  return value ? humanizeCategory(value) : getReportCopy(locale).notAvailable;
}

function resolveCountry(result: DynamicValidationResult, locale: Locale): string {
  const code = readString(result.country?.code);
  if (code) return code;

  const countryUnknown = result.country as unknown;
  if (isRecord(countryUnknown)) {
    const runtimeName =
      readString(countryUnknown["name"]) ??
      readString(countryUnknown["label"]) ??
      readString(countryUnknown["country"]);

    if (runtimeName) return runtimeName;
  }

  return getReportCopy(locale).notAvailable;
}

function resolveFramework(result: DynamicValidationResult, locale: Locale): string {
  return (
    result.selectedFramework?.frameworkLabel ??
    result.frameworkUsed ??
    result.framework_used ??
    result.framework?.label ??
    getReportCopy(locale).notAvailable
  );
}

function resolveSummary(result: DynamicValidationResult, locale: Locale): string {
  return result.summary?.oneLiner ?? getReportCopy(locale).validationCompleted;
}

function resolveConfidence(result: DynamicValidationResult, locale: Locale): string {
  const summaryRecord = isRecord(result.summary)
    ? (result.summary as UnknownRecord)
    : undefined;

  const candidates: unknown[] = [
    (result as UnknownRecord)["confidence"],
    (result as UnknownRecord)["confidenceScore"],
    (result as UnknownRecord)["confidence_score"],
    summaryRecord?.["confidence"],
  ];

  for (const value of candidates) {
    const numeric = readNumber(value);
    if (typeof numeric === "number") {
      return `${numeric}/100`;
    }

    const text = readString(value);
    if (text) return text;
  }

  return getReportCopy(locale).notAvailable;
}

function resolveTopOpportunities(result: DynamicValidationResult): string[] {
  return normalizeStringArray(
    result.strengths ?? result.summary?.topOpportunities ?? []
  ).slice(0, 4);
}

function resolveBiggestRisks(result: DynamicValidationResult): string[] {
  return normalizeStringArray(
    result.keyRisks ?? result.key_risks ?? result.summary?.biggestRisks ?? []
  ).slice(0, 4);
}

function resolveNextActions(result: DynamicValidationResult): string[] {
  return normalizeStringArray(
    result.recommendedNextSteps ??
      result.recommended_next_steps ??
      result.nextActions ??
      []
  ).slice(0, 6);
}

function resolveScoreLines(
  result: DynamicValidationResult,
  locale: Locale
): string[] {
  const copy = getReportCopy(locale);
  const scores = result.scores;

  return [
    `${copy.overallScore}: ${resolveReportScore(result)}/100`,
    `${copy.confidence}: ${resolveConfidence(result, locale)}`,
    `${copy.marketDemand}: ${
      typeof scores?.market_demand === "number"
        ? `${scores.market_demand}/100`
        : copy.notAvailable
    }`,
    `${copy.competition}: ${
      typeof scores?.competition === "number"
        ? `${scores.competition}/100`
        : copy.notAvailable
    }`,
    `${copy.executionFeasibility}: ${
      typeof scores?.execution_feasibility === "number"
        ? `${scores.execution_feasibility}/100`
        : copy.notAvailable
    }`,
    `${copy.monetization}: ${
      typeof scores?.monetization === "number"
        ? `${scores.monetization}/100`
        : copy.notAvailable
    }`,
    `${copy.acquisition}: ${
      typeof scores?.acquisition === "number"
        ? `${scores.acquisition}/100`
        : copy.notAvailable
    }`,
    `${copy.differentiation}: ${
      typeof scores?.differentiation === "number"
        ? `${scores.differentiation}/100`
        : copy.notAvailable
    }`,
    `${copy.risk}: ${
      typeof scores?.risk === "number"
        ? `${scores.risk}/100`
        : copy.notAvailable
    }`,
  ];
}

function resolveGateLines(
  result: DynamicValidationResult,
  locale: Locale
): string[] {
  const copy = getReportCopy(locale);
  const gates = result.frameworkReport?.gates ?? [];

  if (!Array.isArray(gates) || gates.length === 0) {
    return [copy.notAvailable];
  }

  return gates.map((gate) => {
    if (gate.status === "BLOCKED") {
      return `Gate ${gate.gate} ${gate.name}: ${copy.gates.blocked} ${copy.gates.waitingForGate(
        gate.blockedByGate ?? 0
      )}`;
    }

    return `Gate ${gate.gate} ${gate.name}: ${gate.status} (${gate.score}/${gate.maxScore})`;
  });
}

function pillarStatusLabel(status: string, locale: Locale): string {
  const copy = getReportCopy(locale);

  if (status === "strong") return copy.pillarStatuses.strong;
  if (status === "moderate") return copy.pillarStatuses.moderate;
  if (status === "weak") return copy.pillarStatuses.weak;
  return copy.pillarStatuses.unknown;
}

function resolvePillarLines(
  result: DynamicValidationResult,
  locale: Locale
): string[] {
  const copy = getReportCopy(locale);
  const pillars = result.pillarValidation?.pillars ?? [];

  if (!Array.isArray(pillars) || pillars.length === 0) {
    return [copy.notAvailable];
  }

  return pillars.map((pillar: PillarResult) => {
    const advice =
      Array.isArray(pillar.advice) && pillar.advice.length > 0
        ? ` — ${pillar.advice.slice(0, 1).join(" ")}`
        : "";

    return `${pillar.label}: ${pillar.score}/100 — ${pillarStatusLabel(
      pillar.status,
      locale
    )} — ${pillar.summary}${advice}`;
  });
}

function resolvePathForwardLines(
  result: DynamicValidationResult,
  locale: Locale
): string[] {
  const copy = getReportCopy(locale);
  const pathForward = readString(result.pillarValidation?.pathForward);
  return [pathForward ?? copy.notAvailable];
}

function resolveExperimentLines(
  result: DynamicValidationResult,
  locale: Locale
): string[] {
  const copy = getReportCopy(locale);
  const experiments = normalizeStringArray(
    result.pillarValidation?.nextExperiments ?? result.recommendedTests ?? result.recommended_tests ?? []
  ).slice(0, 5);

  return experiments.length ? experiments : [copy.notAvailable];
}

function buildSection(title: string, lines: string[]): string {
  return [title, ...lines.map((line) => `- ${line}`), ""].join("\n");
}

export function buildValidationReportDocument(
  input: ValidationReportInput
): ValidationReportDocument {
  const copy = getReportCopy(input.locale);
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const decision = getDecision(input.result);
  const decisionText = decisionLabel(decision, input.locale);
  const filenameIdea = input.idea.split(/\s+/).slice(0, 6).join("-");
  const filename = `bizsproutai-validation-${safeSegment(
    filenameIdea || "report"
  )}.txt`;

  const top = resolveTopOpportunities(input.result);
  const risks = resolveBiggestRisks(input.result);
  const actions = resolveNextActions(input.result);
  const pillarLines = resolvePillarLines(input.result, input.locale);
  const pathForwardLines = resolvePathForwardLines(input.result, input.locale);
  const experimentLines = resolveExperimentLines(input.result, input.locale);

  const text = [
    copy.title,
    "=".repeat(copy.title.length),
    "",
    `${copy.generatedAt}: ${generatedAt}`,
    `${copy.locale}: ${input.locale}`,
    `${copy.email}: ${input.email ?? copy.notProvided}`,
    "",
    `${copy.decision}: ${decisionText}`,
    ...resolveScoreLines(input.result, input.locale),
    "",
    buildSection(copy.submittedIdea, [input.idea]),
    buildSection(copy.summary, [resolveSummary(input.result, input.locale)]),
    buildSection(copy.context, [
      `${copy.category}: ${resolveCategory(input.result, input.locale)}`,
      `${copy.country}: ${resolveCountry(input.result, input.locale)}`,
      `${copy.framework}: ${resolveFramework(input.result, input.locale)}`,
    ]),
    buildSection(copy.topOpportunities, top.length ? top : [copy.notAvailable]),
    buildSection(copy.biggestRisks, risks.length ? risks : [copy.notAvailable]),
    buildSection(copy.nextActions, actions.length ? actions : [copy.notAvailable]),
    buildSection(copy.validationPillars, pillarLines),
    buildSection(copy.pathForward, pathForwardLines),
    buildSection(copy.nextExperiments, experimentLines),
    buildSection(copy.gateAnalysis, resolveGateLines(input.result, input.locale)),
    copy.generatedBy,
    copy.dbaLine,
    "",
  ].join("\n");

  return {
    filename,
    text,
    generatedAt,
  };
}
