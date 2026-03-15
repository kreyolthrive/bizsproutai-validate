import fs from "node:fs";
import path from "node:path";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFPage,
  type PDFFont,
  type PDFImage,
} from "pdf-lib";
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

type ValidationPdfInput = {
  idea: string;
  email?: string;
  locale: Locale;
  result: DynamicValidationResult;
  generatedAt: string;
};

export type ValidationPdfDocument = {
  filename: string;
  bytes: Uint8Array;
};

const PAGE = {
  width: 595.28,
  height: 841.89,
  marginX: 42,
  marginTop: 48,
  marginBottom: 42,
};

type EmbeddedLogo = {
  image: PDFImage;
  sourceFile: string;
};

type UnknownRecord = Record<string, unknown>;

type PdfCopy = {
  title: string;
  generated: string;
  locale: string;
  email: string;
  notProvided: string;
  decision: string;
  overallScore: string;
  confidence: string;
  category: string;
  country: string;
  framework: string;
  summary: string;
  submittedIdea: string;
  decisionSummary: string;
  context: string;
  topOpportunities: string;
  biggestRisks: string;
  nextActions: string;
  gateAnalysis: string;
  validationPillars: string;
  pathForward: string;
  nextExperiments: string;
  generatedBy: string;
  noData: string;
  demand: string;
  competition: string;
  execution: string;
  monetization: string;
  acquisition: string;
  differentiation: string;
  risk: string;
  decisionLabels: Record<FrameworkDecision, string>;
  pillarStatuses: {
    strong: string;
    moderate: string;
    weak: string;
    unknown: string;
  };
  gates: {
    blocked: string;
    waitingForGate: (gate: number | undefined) => string;
  };
};

function getPdfCopy(locale: string): PdfCopy {
  switch (locale) {
    case "fr":
      return {
        title: "Rapport de validation BizSproutAI",
        generated: "Généré",
        locale: "Langue",
        email: "E-mail",
        notProvided: "non fourni",
        decision: "Décision",
        overallScore: "Score global",
        confidence: "Confiance",
        category: "Catégorie",
        country: "Pays",
        framework: "Cadre",
        summary: "Résumé",
        submittedIdea: "Idée soumise",
        decisionSummary: "Résumé de la décision",
        context: "Contexte",
        topOpportunities: "Meilleures opportunités",
        biggestRisks: "Principaux risques",
        nextActions: "Prochaines actions",
        gateAnalysis: "Analyse des portes",
        validationPillars: "Piliers de validation",
        pathForward: "Voie à suivre",
        nextExperiments: "Prochaines expériences",
        generatedBy: "Généré par BizSproutAI",
        noData: "n/a",
        demand: "Demande",
        competition: "Concurrence",
        execution: "Exécution",
        monetization: "Monétisation",
        acquisition: "Acquisition",
        differentiation: "Différenciation",
        risk: "Risque",
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
          waitingForGate: (gate) =>
            typeof gate === "number"
              ? `(en attente de la porte ${gate})`
              : "(en attente d’une porte précédente)",
        },
      };

    case "ht":
      return {
        title: "Rapò validasyon BizSproutAI",
        generated: "Jenere",
        locale: "Lang",
        email: "Imèl",
        notProvided: "pa bay",
        decision: "Desizyon",
        overallScore: "Nòt jeneral",
        confidence: "Konfyans",
        category: "Kategori",
        country: "Peyi",
        framework: "Kad",
        summary: "Rezime",
        submittedIdea: "Lide ki soumèt la",
        decisionSummary: "Rezime desizyon an",
        context: "Kontèks",
        topOpportunities: "Pi gwo opòtinite yo",
        biggestRisks: "Pi gwo risk yo",
        nextActions: "Pwochen aksyon yo",
        gateAnalysis: "Analiz etap yo",
        validationPillars: "Pilye validasyon yo",
        pathForward: "Chemen pou avanse",
        nextExperiments: "Pwochen eksperyans yo",
        generatedBy: "BizSproutAI te jenere sa",
        noData: "n/a",
        demand: "Demann",
        competition: "Konpetisyon",
        execution: "Egzekisyon",
        monetization: "Monetizasyon",
        acquisition: "Akwizisyon",
        differentiation: "Diferansyasyon",
        risk: "Risk",
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
          waitingForGate: (gate) =>
            typeof gate === "number"
              ? `(ap tann etap ${gate})`
              : "(ap tann yon etap anvan)",
        },
      };

    case "es":
      return {
        title: "Informe de validación BizSproutAI",
        generated: "Generado",
        locale: "Idioma",
        email: "Correo electrónico",
        notProvided: "no proporcionado",
        decision: "Decisión",
        overallScore: "Puntuación general",
        confidence: "Confianza",
        category: "Categoría",
        country: "País",
        framework: "Marco",
        summary: "Resumen",
        submittedIdea: "Idea enviada",
        decisionSummary: "Resumen de la decisión",
        context: "Contexto",
        topOpportunities: "Principales oportunidades",
        biggestRisks: "Mayores riesgos",
        nextActions: "Siguientes acciones",
        gateAnalysis: "Análisis de compuertas",
        validationPillars: "Pilares de validación",
        pathForward: "Camino a seguir",
        nextExperiments: "Siguientes experimentos",
        generatedBy: "Generado por BizSproutAI",
        noData: "n/a",
        demand: "Demanda",
        competition: "Competencia",
        execution: "Ejecución",
        monetization: "Monetización",
        acquisition: "Adquisición",
        differentiation: "Diferenciación",
        risk: "Riesgo",
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
          waitingForGate: (gate) =>
            typeof gate === "number"
              ? `(esperando la compuerta ${gate})`
              : "(esperando una compuerta previa)",
        },
      };

    case "pt":
      return {
        title: "Relatório de validação BizSproutAI",
        generated: "Gerado",
        locale: "Idioma",
        email: "E-mail",
        notProvided: "não informado",
        decision: "Decisão",
        overallScore: "Pontuação geral",
        confidence: "Confiança",
        category: "Categoria",
        country: "País",
        framework: "Framework",
        summary: "Resumo",
        submittedIdea: "Ideia enviada",
        decisionSummary: "Resumo da decisão",
        context: "Contexto",
        topOpportunities: "Principais oportunidades",
        biggestRisks: "Maiores riscos",
        nextActions: "Próximas ações",
        gateAnalysis: "Análise de gates",
        validationPillars: "Pilares de validação",
        pathForward: "Caminho a seguir",
        nextExperiments: "Próximos experimentos",
        generatedBy: "Gerado por BizSproutAI",
        noData: "n/a",
        demand: "Demanda",
        competition: "Concorrência",
        execution: "Execução",
        monetization: "Monetização",
        acquisition: "Aquisição",
        differentiation: "Diferenciação",
        risk: "Risco",
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
          waitingForGate: (gate) =>
            typeof gate === "number"
              ? `(aguardando o gate ${gate})`
              : "(aguardando um gate anterior)",
        },
      };

    case "en":
    default:
      return {
        title: "BizSproutAI Business Validation Report",
        generated: "Generated",
        locale: "Locale",
        email: "Email",
        notProvided: "not provided",
        decision: "Decision",
        overallScore: "Overall score",
        confidence: "Confidence",
        category: "Category",
        country: "Country",
        framework: "Framework",
        summary: "Summary",
        submittedIdea: "Submitted Idea",
        decisionSummary: "Decision Summary",
        context: "Context",
        topOpportunities: "Top Opportunities",
        biggestRisks: "Biggest Risks",
        nextActions: "Next Actions",
        gateAnalysis: "Gate Analysis",
        validationPillars: "Validation Pillars",
        pathForward: "Path Forward",
        nextExperiments: "Next Experiments",
        generatedBy: "Generated by BizSproutAI",
        noData: "n/a",
        demand: "Demand",
        competition: "Competition",
        execution: "Execution",
        monetization: "Monetization",
        acquisition: "Acquisition",
        differentiation: "Differentiation",
        risk: "Risk",
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
          waitingForGate: (gate) =>
            typeof gate === "number"
              ? `(waiting for Gate ${gate})`
              : "(waiting for a previous gate)",
        },
      };
  }
}

type FlowState = {
  page: PDFPage;
  y: number;
};

function resolveReportScore(result: DynamicValidationResult): number {
  return resolveOverallScore100(result);
}

function decisionLabel(decision: FrameworkDecision, locale: Locale): string {
  return getPdfCopy(locale).decisionLabels[decision];
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

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let current = words[0];

  for (let i = 1; i < words.length; i += 1) {
    const candidate = `${current} ${words[i]}`;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
    }
  }

  lines.push(current);
  return lines;
}

function fitImage(
  imageWidth: number,
  imageHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const widthRatio = maxWidth / imageWidth;
  const heightRatio = maxHeight / imageHeight;
  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: imageWidth * ratio,
    height: imageHeight * ratio,
  };
}

async function tryEmbedLogo(pdfDoc: PDFDocument): Promise<EmbeddedLogo | null> {
  const candidates = [
    "bizsproutai-logo.png",
    "bizsproutai-logo.jpg",
    "bizsproutai-logo.jpeg",
  ];

  for (const file of candidates) {
    const abs = path.join(process.cwd(), "public", file);

    if (!fs.existsSync(abs)) {
      continue;
    }

    try {
      const bytes = fs.readFileSync(abs);
      const image = file.endsWith(".png")
        ? await pdfDoc.embedPng(bytes)
        : await pdfDoc.embedJpg(bytes);

      console.log(`[pdf] Embedded logo from public/${file}`);

      return {
        image,
        sourceFile: file,
      };
    } catch (error) {
      console.error(`[pdf] Failed to embed logo file public/${file}`, error);
    }
  }

  console.warn(
    "[pdf] No logo file found in public/ matching bizsproutai-logo.(png|jpg|jpeg)."
  );
  return null;
}

function ensureSpace(
  pdfDoc: PDFDocument,
  currentPage: PDFPage,
  y: number,
  needed: number
): FlowState {
  if (y - needed >= PAGE.marginBottom) {
    return { page: currentPage, y };
  }

  const newPage = pdfDoc.addPage([PAGE.width, PAGE.height]);
  return { page: newPage, y: PAGE.height - PAGE.marginTop };
}

function drawSectionDivider(page: PDFPage, y: number): number {
  page.drawRectangle({
    x: PAGE.marginX,
    y: y - 6,
    width: PAGE.width - PAGE.marginX * 2,
    height: 1,
    color: rgb(0.89, 0.91, 0.95),
  });

  return y - 16;
}

function drawSectionTitle(
  page: PDFPage,
  y: number,
  title: string,
  fontBold: PDFFont
): number {
  page.drawText(title, {
    x: PAGE.marginX,
    y,
    size: 12,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.27),
  });

  return y - 18;
}

function drawParagraphFlow(args: {
  pdfDoc: PDFDocument;
  state: FlowState;
  text: string;
  font: PDFFont;
  size?: number;
}): FlowState {
  const size = args.size ?? 10.5;
  const maxWidth = PAGE.width - PAGE.marginX * 2;
  const lines = wrapText(args.text, args.font, size, maxWidth);

  let state = args.state;

  for (const line of lines) {
    state = ensureSpace(args.pdfDoc, state.page, state.y, size + 8);
    state.page.drawText(line, {
      x: PAGE.marginX,
      y: state.y,
      size,
      font: args.font,
      color: rgb(0.18, 0.23, 0.33),
    });
    state = { page: state.page, y: state.y - (size + 3) };
  }

  return { page: state.page, y: state.y - 6 };
}

function drawBulletsFlow(args: {
  pdfDoc: PDFDocument;
  state: FlowState;
  items: string[];
  font: PDFFont;
  size?: number;
}): FlowState {
  const size = args.size ?? 10.5;
  const width = PAGE.width - PAGE.marginX * 2 - 14;
  let state = args.state;

  for (const item of args.items) {
    const lines = wrapText(item, args.font, size, width);

    for (let i = 0; i < lines.length; i += 1) {
      state = ensureSpace(args.pdfDoc, state.page, state.y, size + 8);

      const x = PAGE.marginX + (i === 0 ? 10 : 20);

      if (i === 0) {
        state.page.drawText("•", {
          x: PAGE.marginX,
          y: state.y,
          size: 12,
          font: args.font,
          color: rgb(0.2, 0.24, 0.36),
        });
      }

      state.page.drawText(lines[i], {
        x,
        y: state.y,
        size,
        font: args.font,
        color: rgb(0.18, 0.23, 0.33),
      });

      state = { page: state.page, y: state.y - (size + 3) };
    }

    state = { page: state.page, y: state.y - 3 };
  }

  return { page: state.page, y: state.y - 4 };
}

function humanizeCategory(value: string): string {
  return value.replace(/_/g, " ");
}

function resolveCategory(result: DynamicValidationResult, locale: Locale): string {
  const value =
    result.businessCategory ?? result.business_category ?? result.category;
  return value ? humanizeCategory(value) : getPdfCopy(locale).noData;
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

  return getPdfCopy(locale).noData;
}

function resolveFramework(result: DynamicValidationResult, locale: Locale): string {
  return (
    result.selectedFramework?.frameworkLabel ??
    result.frameworkUsed ??
    result.framework_used ??
    result.framework?.label ??
    getPdfCopy(locale).noData
  );
}

function resolveSummary(result: DynamicValidationResult, locale: Locale): string {
  return result.summary?.oneLiner ?? getPdfCopy(locale).noData;
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

function resolveExperiments(result: DynamicValidationResult): string[] {
  return normalizeStringArray(
    result.pillarValidation?.nextExperiments ??
      result.recommendedTests ??
      result.recommended_tests ??
      []
  ).slice(0, 5);
}

function resolvePathForward(result: DynamicValidationResult, locale: Locale): string {
  return (
    readString(result.pillarValidation?.pathForward) ?? getPdfCopy(locale).noData
  );
}

function pillarStatusLabel(status: string, locale: Locale): string {
  const copy = getPdfCopy(locale);
  if (status === "strong") return copy.pillarStatuses.strong;
  if (status === "moderate") return copy.pillarStatuses.moderate;
  if (status === "weak") return copy.pillarStatuses.weak;
  return copy.pillarStatuses.unknown;
}

function resolvePillarLines(result: DynamicValidationResult, locale: Locale): string[] {
  const copy = getPdfCopy(locale);
  const pillars = result.pillarValidation?.pillars ?? [];

  if (!Array.isArray(pillars) || pillars.length === 0) {
    return [copy.noData];
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

function resolveGateLines(result: DynamicValidationResult, locale: Locale): string[] {
  const copy = getPdfCopy(locale);
  const gates = result.frameworkReport?.gates ?? [];

  if (!Array.isArray(gates) || gates.length === 0) {
    return [copy.noData];
  }

  return gates.map((gate) => {
    if (gate.status === "BLOCKED") {
      return `Gate ${gate.gate} ${gate.name}: ${copy.gates.blocked} ${copy.gates.waitingForGate(
        gate.blockedByGate
      )}`;
    }

    return `Gate ${gate.gate} ${gate.name}: ${gate.status} (${gate.score}/${gate.maxScore})`;
  });
}

export async function buildValidationReportPdf(
  input: ValidationPdfInput
): Promise<ValidationPdfDocument> {
  const copy = getPdfCopy(input.locale);
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  let page = pdfDoc.addPage([PAGE.width, PAGE.height]);
  let y = PAGE.height - PAGE.marginTop;

  const decision = getDecision(input.result);
  const score = resolveReportScore(input.result);
  const decisionText = decisionLabel(decision, input.locale);

  const headerHeight = 92;
  const headerY = y - headerHeight;
  const contentWidth = PAGE.width - PAGE.marginX * 2;

  page.drawRectangle({
    x: PAGE.marginX,
    y: headerY,
    width: contentWidth,
    height: headerHeight,
    color: rgb(0.06, 0.22, 0.49),
  });

  const embeddedLogo = await tryEmbedLogo(pdfDoc);
  let titleX = PAGE.marginX + 18;

  if (embeddedLogo) {
    const badgeX = PAGE.marginX + 16;
    const badgeY = headerY + 20;
    const badgeWidth = 124;
    const badgeHeight = 44;

    page.drawRectangle({
      x: badgeX,
      y: badgeY,
      width: badgeWidth,
      height: badgeHeight,
      color: rgb(1, 1, 1),
    });

    const fitted = fitImage(
      embeddedLogo.image.width,
      embeddedLogo.image.height,
      badgeWidth - 16,
      badgeHeight - 12
    );

    page.drawImage(embeddedLogo.image, {
      x: badgeX + (badgeWidth - fitted.width) / 2,
      y: badgeY + (badgeHeight - fitted.height) / 2,
      width: fitted.width,
      height: fitted.height,
    });

    titleX = badgeX + badgeWidth + 16;
  } else {
    page.drawText("BizSproutAI", {
      x: PAGE.marginX + 16,
      y: headerY + 38,
      size: 15,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    titleX = PAGE.marginX + 132;
  }

  page.drawText(copy.title, {
    x: titleX,
    y: headerY + 54,
    size: 16,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(`${copy.generated} ${input.generatedAt}`, {
    x: titleX,
    y: headerY + 32,
    size: 9.5,
    font: fontRegular,
    color: rgb(0.89, 0.94, 1),
  });

  const stripY = headerY - 20;

  page.drawRectangle({
    x: PAGE.marginX,
    y: stripY,
    width: contentWidth,
    height: 42,
    color: rgb(0.95, 0.97, 1),
    borderColor: rgb(0.83, 0.88, 0.97),
    borderWidth: 1,
  });

  page.drawText(copy.decision, {
    x: PAGE.marginX + 12,
    y: stripY + 25,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.31, 0.39, 0.52),
  });

  page.drawText(decisionText, {
    x: PAGE.marginX + 12,
    y: stripY + 10,
    size: 11,
    font: fontBold,
    color: rgb(0.09, 0.18, 0.36),
  });

  const scoreText = `${score}/100`;
  const scoreWidth = fontMono.widthOfTextAtSize(scoreText, 11);

  page.drawText(scoreText, {
    x: PAGE.width - PAGE.marginX - 12 - scoreWidth,
    y: stripY + 14,
    size: 11,
    font: fontMono,
    color: rgb(0.32, 0.36, 0.45),
  });

  y = stripY - 18;

  const metricCards: Array<{ label: string; value: string }> = [
    {
      label: copy.demand,
      value:
        typeof input.result.scores?.market_demand === "number"
          ? `${input.result.scores.market_demand}/100`
          : copy.noData,
    },
    {
      label: copy.competition,
      value:
        typeof input.result.scores?.competition === "number"
          ? `${input.result.scores.competition}/100`
          : copy.noData,
    },
    {
      label: copy.execution,
      value:
        typeof input.result.scores?.execution_feasibility === "number"
          ? `${input.result.scores.execution_feasibility}/100`
          : copy.noData,
    },
    {
      label: copy.monetization,
      value:
        typeof input.result.scores?.monetization === "number"
          ? `${input.result.scores.monetization}/100`
          : copy.noData,
    },
  ];

  const cardGap = 10;
  const cardsPerRow = 2;
  const cardWidth =
    (PAGE.width - PAGE.marginX * 2 - cardGap * (cardsPerRow - 1)) / cardsPerRow;
  const cardHeight = 46;
  const rows = Math.ceil(metricCards.length / cardsPerRow);
  const cardStartY = y - cardHeight;

  metricCards.forEach((card, idx) => {
    const row = Math.floor(idx / cardsPerRow);
    const col = idx % cardsPerRow;
    const x = PAGE.marginX + col * (cardWidth + cardGap);
    const currentY = cardStartY - row * (cardHeight + 10);

    page.drawRectangle({
      x,
      y: currentY,
      width: cardWidth,
      height: cardHeight,
      color: rgb(0.95, 0.97, 1),
      borderColor: rgb(0.83, 0.88, 0.97),
      borderWidth: 1,
    });

    page.drawText(card.label, {
      x: x + 10,
      y: currentY + 29,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.31, 0.39, 0.52),
    });

    page.drawText(card.value, {
      x: x + 10,
      y: currentY + 13,
      size: 12,
      font: fontBold,
      color: rgb(0.09, 0.18, 0.36),
    });
  });

  y = cardStartY - (rows - 1) * (cardHeight + 10) - 18;

  const breakdown = [
    `${copy.category}: ${resolveCategory(input.result, input.locale)}`,
    `${copy.country}: ${resolveCountry(input.result, input.locale)}`,
    `${copy.framework}: ${resolveFramework(input.result, input.locale)}`,
    `${copy.locale}: ${input.locale}`,
    `${copy.email}: ${input.email ?? copy.notProvided}`,
    `${copy.confidence}: ${
      typeof input.result.confidenceScore === "number"
        ? `${input.result.confidenceScore}/100`
        : typeof input.result.confidence_score === "number"
          ? `${input.result.confidence_score}/100`
          : copy.noData
    }`,
    `${copy.differentiation}: ${
      typeof input.result.scores?.differentiation === "number"
        ? `${input.result.scores.differentiation}/100`
        : copy.noData
    }`,
    `${copy.risk}: ${
      typeof input.result.scores?.risk === "number"
        ? `${input.result.scores.risk}/100`
        : copy.noData
    }`,
  ];

  const sections: Array<{ title: string; lines?: string[]; bullets?: string[] }> = [
    { title: copy.submittedIdea, lines: [input.idea] },
    { title: copy.decisionSummary, lines: [resolveSummary(input.result, input.locale)] },
    { title: copy.context, bullets: breakdown },
    {
      title: copy.topOpportunities,
      bullets: resolveTopOpportunities(input.result).length
        ? resolveTopOpportunities(input.result)
        : [copy.noData],
    },
    {
      title: copy.biggestRisks,
      bullets: resolveBiggestRisks(input.result).length
        ? resolveBiggestRisks(input.result)
        : [copy.noData],
    },
    {
      title: copy.nextActions,
      bullets: resolveNextActions(input.result).length
        ? resolveNextActions(input.result)
        : [copy.noData],
    },
    {
      title: copy.validationPillars,
      bullets: resolvePillarLines(input.result, input.locale),
    },
    {
      title: copy.pathForward,
      lines: [resolvePathForward(input.result, input.locale)],
    },
    {
      title: copy.nextExperiments,
      bullets: resolveExperiments(input.result).length
        ? resolveExperiments(input.result)
        : [copy.noData],
    },
    {
      title: copy.gateAnalysis,
      bullets: resolveGateLines(input.result, input.locale),
    },
  ];

  let state: FlowState = { page, y };

  for (const section of sections) {
    state = ensureSpace(pdfDoc, state.page, state.y, 60);
    state = { page: state.page, y: drawSectionDivider(state.page, state.y) };
    state = { page: state.page, y: drawSectionTitle(state.page, state.y, section.title, fontBold) };

    if (section.lines) {
      for (const paragraph of section.lines) {
        state = drawParagraphFlow({
          pdfDoc,
          state,
          text: paragraph,
          font: fontRegular,
        });
      }
    }

    if (section.bullets) {
      state = drawBulletsFlow({
        pdfDoc,
        state,
        items: section.bullets,
        font: fontRegular,
      });
    }
  }

  state = ensureSpace(pdfDoc, state.page, state.y, 22);

  state.page.drawText(copy.generatedBy, {
    x: PAGE.marginX,
    y: state.y - 2,
    size: 9,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.54),
  });

  const filenameIdea = input.idea.split(/\s+/).slice(0, 6).join("-");
  const filename = `bizsproutai-validation-${safeSegment(
    filenameIdea || "report"
  )}.pdf`;

  const bytes = await pdfDoc.save();

  return { filename, bytes };
}
