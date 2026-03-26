import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import { NextRequest, NextResponse } from "next/server";

import type {
  DynamicValidationResult,
  Locale,
  ValidationInput,
} from "@/src/validation/types";

import { guardPayloadSize, validateFieldLengths } from "@/src/security/payloadGuard";
import { runBotChecks } from "@/src/security/botDetection";
import { isStrictlyValidEmail, checkEmailSendLimit } from "@/src/security/emailGuard";
import { checkAiCostLimit } from "@/src/security/aiCostGuard";
import { sanitizeRequestBody } from "@/src/security/inputSanitizer";
import { safeLogContext, redactSensitiveTokens } from "@/src/security/piiSanitizer";
import { checkRateLimit } from "@/src/security/rateLimit";
import { resolveClientIp, buildRateLimitIdentity } from "@/src/security/requestIdentity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_LOCALES = new Set<Locale>(["en", "fr", "ht", "es", "pt"]);

type JsonObject = Record<string, unknown>;

type ErrorResponseShape = {
  status: number;
  code: string;
  error: string;
  details?: string;
  providerFailures?: string[];
};

type ReportPayload = {
  filename: string;
  generatedAt: string;
  text: string;
  pdf?: {
    filename: string;
    mimeType: string;
    contentBase64: string;
    sizeBytes: number;
  } | null;
  pdfError?: string | null;
};

type EmailDeliveryStatus = {
  attempted: boolean;
  enabled: boolean;
  sentToUser: boolean;
  sentToOwner: boolean;
  errors: string[];
};

type PersistStatus = {
  saved: boolean;
  eventId: string | null;
  error: string | null;
};

type ValidationRunStatus = {
  saved: boolean;
  runId: string | null;
  error: string | null;
};

type ReportArtifacts = {
  report: ReportPayload;
  textDocument: {
    filename: string;
    generatedAt: string;
    text: string;
  } | null;
  pdfDocument: {
    filename: string;
    bytes: Uint8Array;
  } | null;
};

type ValidateSuccessResponse = DynamicValidationResult & {
  ok: true;
  requestId: string;
  email: string;
  report: ReportPayload;
  emailDelivery: EmailDeliveryStatus;
  leadCapture: PersistStatus;
  validationRun: ValidationRunStatus;
};

type RouteCopy = {
  errors: {
    invalidJson: string;
    invalidRequest: string;
    missingEmail: string;
    invalidEmail: string;
    missingIdea: string;
    providerNotConfigured: string;
    aiValidationFailed: string;
    providerAuthError: string;
    invalidAiResponse: string;
    internalError: string;
    unknownValidationError: string;
    reportTextFailed: string;
    reportPdfFailed: string;
    leadSaveFailed: string;
    runSaveFailed: string;
    emailDeliveryFailed: string;
    rateLimited: string;
    disposableEmail: string;
    emailSendLimit: string;
    validationLimit: string;
  };
  report: {
    filename: string;
    generatedLabel: string;
    localeLabel: string;
    emailLabel: string;
    noEmail: string;
    submittedIdeaTitle: string;
    summaryTitle: string;
    nextStepsTitle: string;
    generatedBy: string;
    reportTitle: string;
    completedFallback: string;
    noNextSteps: string;
    pdfFallbackError: string;
  };
};

function normalizeLocale(value: unknown): Locale {
  const locale = typeof value === "string" ? value.trim().toLowerCase() : "en";
  return VALID_LOCALES.has(locale as Locale) ? (locale as Locale) : "en";
}

function getRouteCopy(locale: Locale): RouteCopy {
  switch (locale) {
    case "fr":
      return {
        errors: {
          invalidJson: "Le corps de la requête doit être un JSON valide.",
          invalidRequest: "Requête invalide.",
          missingEmail:
            "L’adresse e-mail est requise pour recevoir votre rapport de validation.",
          invalidEmail: "Veuillez fournir une adresse e-mail valide.",
          missingIdea: "La requête de validation doit inclure une idée.",
          providerNotConfigured:
            "Le fournisseur d’IA pour la validation n’est pas configuré.",
          aiValidationFailed:
            "Tous les fournisseurs d’IA de validation ont échoué.",
          providerAuthError:
            "L’authentification auprès du fournisseur d’IA a échoué.",
          invalidAiResponse:
            "Le fournisseur d’IA a renvoyé une sortie de validation incomplète ou invalide.",
          internalError: "Erreur interne du serveur.",
          unknownValidationError: "Erreur de validation inconnue.",
          reportTextFailed: "Échec de la génération du rapport texte.",
          reportPdfFailed: "Échec de la génération du rapport PDF.",
          leadSaveFailed: "Échec de l’enregistrement du lead.",
          runSaveFailed: "Échec de l’enregistrement du run de validation.",
          emailDeliveryFailed: "Échec de l’envoi de l’e-mail.",
          rateLimited: "Trop de requêtes. Veuillez réessayer plus tard.",
          disposableEmail: "Veuillez utiliser une adresse e-mail non jetable.",
          emailSendLimit: "Cette adresse e-mail a atteint sa limite de validation. Veuillez réessayer plus tard.",
          validationLimit: "Limite de validation atteinte. Veuillez réessayer plus tard.",
        },
        report: {
          filename: "rapport-validation-bizsproutai.txt",
          generatedLabel: "Généré",
          localeLabel: "Langue",
          emailLabel: "E-mail",
          noEmail: "non fourni",
          submittedIdeaTitle: "Idée soumise",
          summaryTitle: "Résumé",
          nextStepsTitle: "Prochaines étapes",
          generatedBy: "Généré par BizSproutAI",
          reportTitle: "Rapport de validation BizSproutAI",
          completedFallback: "Validation terminée.",
          noNextSteps: "Aucune prochaine étape renvoyée.",
          pdfFallbackError:
            "Le générateur principal du rapport a échoué. Rapport texte de secours renvoyé.",
        },
      };
    case "ht":
      return {
        errors: {
          invalidJson: "Kò demann lan dwe yon JSON ki valab.",
          invalidRequest: "Demann pa valab.",
          missingEmail:
            "Imèl obligatwa pou resevwa rapò validasyon ou a.",
          invalidEmail: "Tanpri bay yon adrès imèl ki valab.",
          missingIdea: "Demann validasyon an dwe gen yon lide.",
          providerNotConfigured:
            "Founisè AI pou validasyon an pa konfigire.",
          aiValidationFailed:
            "Tout founisè AI pou validasyon yo echwe.",
          providerAuthError:
            "Otantifikasyon ak founisè AI a echwe.",
          invalidAiResponse:
            "Founisè AI a retounen yon rezilta validasyon ki pa konplè oswa ki pa valab.",
          internalError: "Erè entèn sèvè.",
          unknownValidationError: "Erè validasyon enkoni.",
          reportTextFailed: "Echèk pandan jenerasyon rapò tèks la.",
          reportPdfFailed: "Echèk pandan jenerasyon rapò PDF la.",
          leadSaveFailed: "Echèk pandan anrejistreman lead la.",
          runSaveFailed: "Echèk pandan anrejistreman validasyon an.",
          emailDeliveryFailed: "Echèk pandan voye imèl la.",
          rateLimited: "Twòp demann. Tanpri eseye ankò pita.",
          disposableEmail: "Tanpri itilize yon adrès imèl ki pa tanporè.",
          emailSendLimit: "Adrès imèl sa a rive nan limit validasyon li. Tanpri eseye ankò pita.",
          validationLimit: "Limit validasyon rive. Tanpri eseye ankò pita.",
        },
        report: {
          filename: "rapo-validasyon-bizsproutai.txt",
          generatedLabel: "Jenere",
          localeLabel: "Lang",
          emailLabel: "Imèl",
          noEmail: "pa bay",
          submittedIdeaTitle: "Lide ki soumèt la",
          summaryTitle: "Rezime",
          nextStepsTitle: "Pwochen etap yo",
          generatedBy: "BizSproutAI te jenere sa",
          reportTitle: "Rapò validasyon BizSproutAI",
          completedFallback: "Validasyon an fini.",
          noNextSteps: "Pa gen pwochen etap ki retounen.",
          pdfFallbackError:
            "Jeneratè prensipal rapò a echwe. Nou retounen yon rapò tèks sekou.",
        },
      };
    case "es":
      return {
        errors: {
          invalidJson: "El cuerpo de la solicitud debe ser JSON válido.",
          invalidRequest: "Solicitud no válida.",
          missingEmail:
            "El correo electrónico es obligatorio para recibir tu informe de validación.",
          invalidEmail: "Proporciona un correo electrónico válido.",
          missingIdea: "La solicitud de validación debe incluir una idea.",
          providerNotConfigured:
            "El proveedor de IA para validación no está configurado.",
          aiValidationFailed:
            "Todos los proveedores de validación con IA fallaron.",
          providerAuthError:
            "Falló la autenticación con el proveedor de IA.",
          invalidAiResponse:
            "El proveedor de IA devolvió una salida de validación incompleta o no válida.",
          internalError: "Error interno del servidor.",
          unknownValidationError: "Error de validación desconocido.",
          reportTextFailed: "No se pudo generar el informe de texto.",
          reportPdfFailed: "No se pudo generar el informe PDF.",
          leadSaveFailed: "No se pudo guardar el lead.",
          runSaveFailed: "No se pudo guardar la ejecución de validación.",
          emailDeliveryFailed: "No se pudo enviar el correo electrónico.",
          rateLimited: "Demasiadas solicitudes. Inténtalo de nuevo más tarde.",
          disposableEmail: "Usa un correo electrónico que no sea desechable.",
          emailSendLimit: "Este correo ha alcanzado su límite de validación. Inténtalo de nuevo más tarde.",
          validationLimit: "Límite de validación alcanzado. Inténtalo de nuevo más tarde.",
        },
        report: {
          filename: "reporte-validacion-bizsproutai.txt",
          generatedLabel: "Generado",
          localeLabel: "Idioma",
          emailLabel: "Correo electrónico",
          noEmail: "no proporcionado",
          submittedIdeaTitle: "Idea enviada",
          summaryTitle: "Resumen",
          nextStepsTitle: "Siguientes pasos",
          generatedBy: "Generado por BizSproutAI",
          reportTitle: "Reporte de validación BizSproutAI",
          completedFallback: "Validación completada.",
          noNextSteps: "No se devolvieron siguientes pasos.",
          pdfFallbackError:
            "Falló el generador principal del informe. Se devolvió un informe de texto de respaldo.",
        },
      };
    case "pt":
      return {
        errors: {
          invalidJson: "O corpo da requisição deve ser um JSON válido.",
          invalidRequest: "Requisição inválida.",
          missingEmail:
            "O e-mail é obrigatório para receber seu relatório de validação.",
          invalidEmail: "Informe um endereço de e-mail válido.",
          missingIdea: "A solicitação de validação deve incluir uma ideia.",
          providerNotConfigured:
            "O provedor de IA para validação não está configurado.",
          aiValidationFailed:
            "Todos os provedores de validação por IA falharam.",
          providerAuthError:
            "A autenticação com o provedor de IA falhou.",
          invalidAiResponse:
            "O provedor de IA retornou uma saída de validação incompleta ou inválida.",
          internalError: "Erro interno do servidor.",
          unknownValidationError: "Erro de validação desconhecido.",
          reportTextFailed: "Falha ao gerar o relatório em texto.",
          reportPdfFailed: "Falha ao gerar o relatório em PDF.",
          leadSaveFailed: "Falha ao salvar o lead.",
          runSaveFailed: "Falha ao salvar a execução da validação.",
          emailDeliveryFailed: "Falha ao enviar o e-mail.",
          rateLimited: "Muitas solicitações. Tente novamente mais tarde.",
          disposableEmail: "Use um endereço de e-mail não descartável.",
          emailSendLimit: "Este e-mail atingiu o limite de validação. Tente novamente mais tarde.",
          validationLimit: "Limite de validação atingido. Tente novamente mais tarde.",
        },
        report: {
          filename: "relatorio-validacao-bizsproutai.txt",
          generatedLabel: "Gerado em",
          localeLabel: "Idioma",
          emailLabel: "E-mail",
          noEmail: "não informado",
          submittedIdeaTitle: "Ideia enviada",
          summaryTitle: "Resumo",
          nextStepsTitle: "Próximos passos",
          generatedBy: "Gerado por BizSproutAI",
          reportTitle: "Relatório de validação BizSproutAI",
          completedFallback: "Validação concluída.",
          noNextSteps: "Nenhum próximo passo retornado.",
          pdfFallbackError:
            "O gerador principal do relatório falhou. Foi retornado um relatório de texto alternativo.",
        },
      };
    case "en":
    default:
      return {
        errors: {
          invalidJson: "Request body must be valid JSON.",
          invalidRequest: "Invalid request.",
          missingEmail:
            "Email is required to receive your validation report.",
          invalidEmail: "Please provide a valid email address.",
          missingIdea: "Validation request must include an idea.",
          providerNotConfigured:
            "AI validation provider is not configured.",
          aiValidationFailed:
            "All AI validation providers failed.",
          providerAuthError:
            "AI provider authentication failed.",
          invalidAiResponse:
            "AI provider returned malformed or incomplete validation output.",
          internalError: "Internal server error.",
          unknownValidationError: "Unknown validation error.",
          reportTextFailed: "Failed to generate text report.",
          reportPdfFailed: "Failed to generate PDF report.",
          leadSaveFailed: "Failed to save lead.",
          runSaveFailed: "Failed to save validation run.",
          emailDeliveryFailed: "Email delivery failed.",
          rateLimited: "Too many requests. Please try again later.",
          disposableEmail: "Please use a non-disposable email address.",
          emailSendLimit: "This email address has reached its validation limit. Please try again later.",
          validationLimit: "Validation limit reached. Please try again later.",
        },
        report: {
          filename: "bizsproutai-validation-report.txt",
          generatedLabel: "Generated",
          localeLabel: "Locale",
          emailLabel: "Email",
          noEmail: "not provided",
          submittedIdeaTitle: "Submitted Idea",
          summaryTitle: "Summary",
          nextStepsTitle: "Next Steps",
          generatedBy: "Generated by BizSproutAI",
          reportTitle: "BizSproutAI Validation Report",
          completedFallback: "Validation completed.",
          noNextSteps: "No next steps returned.",
          pdfFallbackError:
            "Primary report builder failed. Returned fallback text report.",
        },
      };
  }
}

function inferLocaleFromRequest(request: NextRequest): Locale {
  const candidates = [
    request.nextUrl.searchParams.get("locale"),
    request.headers.get("x-locale"),
    request.headers.get("x-user-locale"),
    request.headers.get("accept-language")?.split(",")[0]?.split("-")[0],
  ];

  for (const candidate of candidates) {
    const normalized = normalizeLocale(candidate);
    if (candidate && VALID_LOCALES.has(normalized)) {
      return normalized;
    }
  }

  return "en";
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asTrimmedString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function asFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized = Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );

  return normalized.length > 0 ? normalized : undefined;
}

function normalizeExperienceLevel(
  value: unknown
): ValidationInput["experienceLevel"] {
  const normalized = asTrimmedString(value);
  return normalized
    ? (normalized as ValidationInput["experienceLevel"])
    : undefined;
}

function createRequestId(): string {
  return crypto.randomUUID();
}

function buildHeaders(requestId: string): HeadersInit {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "X-Request-Id": requestId,
    "Content-Type": "application/json; charset=utf-8",
  };
}

function sendJson(payload: unknown, status: number, requestId: string) {
  return NextResponse.json(payload, {
    status,
    headers: buildHeaders(requestId),
  });
}

function parseValidationPayload(
  body: unknown,
  requestLocale: Locale
): { email?: string; input: ValidationInput } {
  const raw = isObject(body) ? body : {};

  const email = asTrimmedString(raw.email);

  const idea =
    asTrimmedString(raw.idea) ??
    asTrimmedString(raw.businessIdea) ??
    asTrimmedString(raw.description) ??
    "";

  const input: ValidationInput = {
    idea,
    locale: normalizeLocale(raw.locale ?? requestLocale),
    targetCustomer: asTrimmedString(raw.targetCustomer),
    targetMarket: asTrimmedString(raw.targetMarket),
    location: asTrimmedString(raw.location),
    offer: asTrimmedString(raw.offer),
    problem: asTrimmedString(raw.problem),
    pricingIdea: asTrimmedString(raw.pricingIdea),
    budgetUsd: asFiniteNumber(raw.budgetUsd),
    skillSummary: asTrimmedString(raw.skillSummary),
    channels: asStringArray(raw.channels),
    timelineDays: asFiniteNumber(raw.timelineDays),
    experienceLevel: normalizeExperienceLevel(raw.experienceLevel),
  };

  return { email, input };
}

function classifyValidationError(
  message: string,
  locale: Locale
): ErrorResponseShape {
  const copy = getRouteCopy(locale);
  const details = redactSensitiveTokens(message.trim());
  const lower = details.toLowerCase();

  if (lower.includes("email is required")) {
    return {
      status: 400,
      code: "missing_email",
      error: copy.errors.missingEmail,
      details,
    };
  }

  if (
    lower.includes("validation input is missing an idea") ||
    lower.includes("validation request must include an idea") ||
    lower.includes("missing an idea")
  ) {
    return {
      status: 400,
      code: "invalid_input",
      error: copy.errors.missingIdea,
      details,
    };
  }

  if (
    lower.includes("no ai validation provider is configured") ||
    lower.includes("ai validation is not configured") ||
    lower.includes("openai_api_key is missing") ||
    lower.includes("anthropic_api_key is missing") ||
    lower.includes("perplexity_api_key is missing")
  ) {
    return {
      status: 503,
      code: "provider_not_configured",
      error: copy.errors.providerNotConfigured,
      details,
    };
  }

  if (lower.includes("all ai providers failed for business validation analysis")) {
    const tail =
      details
        .split("All AI providers failed for business validation analysis.")[1]
        ?.trim() ?? "";

    const providerFailures = tail
      ? tail
          .split(" | ")
          .map((item) => item.trim())
          .filter(Boolean)
      : undefined;

    return {
      status: 502,
      code: "ai_validation_failed",
      error: copy.errors.aiValidationFailed,
      details,
      providerFailures,
    };
  }

  if (
    lower.includes("request failed with status 401") ||
    lower.includes("request failed with status 403") ||
    lower.includes("incorrect api key provided") ||
    lower.includes("invalid_api_key")
  ) {
    return {
      status: 502,
      code: "provider_auth_error",
      error: copy.errors.providerAuthError,
      details,
    };
  }

  if (
    lower.includes("provider returned malformed json") ||
    lower.includes("expected ',' or ']' after array element in json") ||
    lower.includes("missing or invalid object") ||
    lower.includes("missing or invalid string") ||
    lower.includes("missing or invalid number") ||
    lower.includes("missing or invalid array") ||
    lower.includes("missing a valid finalverdict") ||
    lower.includes("missing frameworkreport.weightedscore") ||
    lower.includes("missing frameworkreport.decision") ||
    lower.includes("missing aipillardata") ||
    lower.includes("must include at least 3 pillars")
  ) {
    return {
      status: 502,
      code: "invalid_ai_response",
      error: copy.errors.invalidAiResponse,
      details,
    };
  }

  return {
    status: 500,
    code: "internal_error",
    error: copy.errors.internalError,
    details,
  };
}

function buildFallbackReport(args: {
  idea: string;
  email?: string;
  locale: Locale;
  result: DynamicValidationResult;
}): ReportPayload {
  const copy = getRouteCopy(args.locale);
  const generatedAt = new Date().toISOString();

  const nextSteps = Array.isArray(args.result.nextActions)
    ? args.result.nextActions
    : [];

  const text = [
    copy.report.reportTitle,
    "============================",
    `${copy.report.generatedLabel}: ${generatedAt}`,
    `${copy.report.localeLabel}: ${args.locale}`,
    `${copy.report.emailLabel}: ${args.email ?? copy.report.noEmail}`,
    "",
    copy.report.submittedIdeaTitle,
    "--------------",
    args.idea,
    "",
    copy.report.summaryTitle,
    "-------",
    args.result.summary?.oneLiner ?? copy.report.completedFallback,
    "",
    copy.report.nextStepsTitle,
    "----------",
    ...(nextSteps.length ? nextSteps : [copy.report.noNextSteps]).map(
      (item) => `- ${item}`
    ),
    "",
    copy.report.generatedBy,
  ].join("\n");

  return {
    filename: copy.report.filename,
    generatedAt,
    text,
    pdf: null,
    pdfError: copy.report.pdfFallbackError,
  };
}

async function buildReportArtifacts(args: {
  idea: string;
  email?: string;
  locale: Locale;
  result: DynamicValidationResult;
  requestId: string;
}): Promise<ReportArtifacts> {
  const copy = getRouteCopy(args.locale);

  // Sanitize inputs going into report generation
  const safeIdea = (args.idea ?? "").slice(0, 5_000);
  const safeEmail = args.email?.slice(0, 254);

  let textDocument: ReportArtifacts["textDocument"] = null;
  let pdfDocument: ReportArtifacts["pdfDocument"] = null;

  let report = buildFallbackReport({
    idea: safeIdea,
    email: safeEmail,
    locale: args.locale,
    result: args.result,
  });

  try {
    const reportModule = await import("@/lib/report/validationReport");
    const document = reportModule.buildValidationReportDocument({
      idea: safeIdea,
      email: safeEmail,
      locale: args.locale,
      result: args.result,
    });

    textDocument = document;

    report = {
      filename: document.filename,
      generatedAt: document.generatedAt,
      text: document.text,
      pdf: null,
      pdfError: null,
    };
  } catch (error) {
    console.error("[api/validate] text report generation failed", {
      requestId: args.requestId,
      error,
    });
    report.pdfError = copy.errors.reportTextFailed;
  }

  try {
    const pdfModule = await import("@/lib/report/validationReportPdf");
    const pdf = await pdfModule.buildValidationReportPdf({
      idea: safeIdea,
      email: safeEmail,
      locale: args.locale,
      result: args.result,
      generatedAt: report.generatedAt,
    });

    pdfDocument = pdf;

    // Cap PDF size at 5 MB to prevent memory abuse
    const MAX_PDF_BYTES = 5 * 1024 * 1024;
    if (pdf.bytes.byteLength > MAX_PDF_BYTES) {
      throw new Error("Generated PDF exceeds maximum allowed size.");
    }

    report.pdf = {
      filename: pdf.filename,
      mimeType: "application/pdf",
      contentBase64: Buffer.from(pdf.bytes).toString("base64"),
      sizeBytes: pdf.bytes.byteLength,
    };
    report.pdfError = null;
  } catch (error) {
    console.error("[api/validate] pdf report generation failed", {
      requestId: args.requestId,
      error,
    });

    report.pdf = null;
    report.pdfError =
      error instanceof Error && error.message.trim().length > 0
        ? error.message
        : copy.errors.reportPdfFailed;
  }

  return {
    report,
    textDocument,
    pdfDocument,
  };
}

function normalizeEmailResult(value: unknown): EmailDeliveryStatus {
  if (!isObject(value)) {
    return {
      attempted: true,
      enabled: true,
      sentToUser: true,
      sentToOwner: false,
      errors: [],
    };
  }

  const errors = Array.isArray(value.errors)
    ? value.errors.filter((item): item is string => typeof item === "string")
    : [];

  const sentToUser =
    typeof value.sentToUser === "boolean"
      ? value.sentToUser
      : typeof value.userSent === "boolean"
        ? value.userSent
        : typeof value.sent === "boolean"
          ? value.sent
          : true;

  const sentToOwner =
    typeof value.sentToOwner === "boolean"
      ? value.sentToOwner
      : typeof value.ownerSent === "boolean"
        ? value.ownerSent
        : false;

  const attempted =
    typeof value.attempted === "boolean" ? value.attempted : true;

  const enabled = typeof value.enabled === "boolean" ? value.enabled : true;

  return {
    attempted,
    enabled,
    sentToUser,
    sentToOwner,
    errors,
  };
}

async function persistLead(args: {
  requestId: string;
  email: string;
  input: ValidationInput;
  result: DynamicValidationResult;
  report: ReportPayload;
}): Promise<PersistStatus> {
  const copy = getRouteCopy(args.input.locale ?? "en");

  try {
    const mod = await import("@/src/leads/server/validationLeadsDb");
    const saveValidationLead = (mod as Record<string, unknown>).saveValidationLead;

    if (typeof saveValidationLead !== "function") {
      throw new Error("saveValidationLead export was not found.");
    }

    await (saveValidationLead as (payload: unknown) => Promise<unknown>)({
      requestId: args.requestId,
      email: args.email,
      locale: args.input.locale ?? "en",
      idea: args.input.idea,
      input: args.input,
      result: args.result,
      report: args.report,
      source: "bizsproutai-validation",
      createdAt: new Date().toISOString(),
    });

    return {
      saved: true,
      eventId: args.requestId,
      error: null,
    };
  } catch (error) {
    return {
      saved: false,
      eventId: null,
      error:
        error instanceof Error ? error.message : copy.errors.leadSaveFailed,
    };
  }
}

async function persistValidationRun(args: {
  requestId: string;
  email: string;
  input: ValidationInput;
  result: DynamicValidationResult;
  report: ReportPayload;
}): Promise<ValidationRunStatus> {
  const copy = getRouteCopy(args.input.locale ?? "en");

  try {
    const mod = await import("@/src/validation/server/validationRunsDb");
    const saveBusinessValidationRun = (mod as Record<string, unknown>)
      .saveBusinessValidationRun;

    if (typeof saveBusinessValidationRun !== "function") {
      throw new Error("saveBusinessValidationRun export was not found.");
    }

    await (saveBusinessValidationRun as (payload: unknown) => Promise<unknown>)({
      requestId: args.requestId,
      email: args.email,
      locale: args.input.locale ?? "en",
      input: args.input,
      result: args.result,
      report: args.report,
      createdAt: new Date().toISOString(),
    });

    return {
      saved: true,
      runId: args.requestId,
      error: null,
    };
  } catch (error) {
    return {
      saved: false,
      runId: null,
      error:
        error instanceof Error ? error.message : copy.errors.runSaveFailed,
    };
  }
}

async function deliverEmails(args: {
  requestId: string;
  email: string;
  input: ValidationInput;
  result: DynamicValidationResult;
  report: ReportPayload;
  textDocument: ReportArtifacts["textDocument"];
  pdfDocument: ReportArtifacts["pdfDocument"];
}): Promise<EmailDeliveryStatus> {
  const copy = getRouteCopy(args.input.locale ?? "en");

  try {
    const mod = await import("@/lib/email/ionos");
    const sendValidationEmails = (mod as Record<string, unknown>)
      .sendValidationEmails;

    if (typeof sendValidationEmails !== "function") {
      throw new Error("sendValidationEmails export was not found.");
    }

    const emailResult = await (sendValidationEmails as (
      payload: unknown
    ) => Promise<unknown>)({
      requestId: args.requestId,
      email: args.email,
      to: args.email,
      locale: args.input.locale ?? "en",
      idea: args.input.idea,
      input: args.input,
      result: args.result,
      report: args.report,
      reportText: args.textDocument?.text ?? args.report.text,
      reportFilename: args.textDocument?.filename ?? args.report.filename,
      pdfFilename: args.pdfDocument?.filename ?? args.report.pdf?.filename,
      pdfBytes: args.pdfDocument?.bytes ?? null,
      pdfBuffer: args.pdfDocument ? Buffer.from(args.pdfDocument.bytes) : null,
      attachments: args.pdfDocument
        ? [
            {
              filename: args.pdfDocument.filename,
              content: Buffer.from(args.pdfDocument.bytes),
              contentType: "application/pdf",
            },
          ]
        : [],
    });

    return normalizeEmailResult(emailResult);
  } catch (error) {
    return {
      attempted: true,
      enabled: true,
      sentToUser: false,
      sentToOwner: false,
      errors: [
        error instanceof Error ? error.message : copy.errors.emailDeliveryFailed,
      ],
    };
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
      Allow: "POST, OPTIONS",
    },
  });
}

export async function POST(request: NextRequest) {
  const requestId = createRequestId();
  const requestLocale = inferLocaleFromRequest(request);
  const clientIp = resolveClientIp(request);
  const startTime = Date.now();

  try {
    console.log("[api/validate] POST handler reached", safeLogContext({ requestId, ip: clientIp }));

    /* ── 1. Rate limiting (per IP) ─────────────────────────────── */
    const rateLimitKey = buildRateLimitIdentity("validate", request);
    const rateLimitPerHour = parseInt(
      process.env.RATE_LIMIT_PER_HOUR ?? "10",
      10
    );
    const rateCheck = await checkRateLimit(
      rateLimitKey,
      rateLimitPerHour,
      60 * 60 * 1_000
    );
    if (!rateCheck.allowed) {
      const isBackendDown = rateCheck.reason === "rate_limit_backend_unavailable";
      return sendJson(
        {
          ok: false,
          requestId,
          code: isBackendDown ? "service_unavailable" : "rate_limited",
          error: isBackendDown
            ? "Service temporarily unavailable. Please try again in a moment."
            : getRouteCopy(requestLocale).errors.rateLimited,
        },
        isBackendDown ? 503 : 429,
        requestId
      );
    }

    /* ── 2. Payload size guard (before JSON parsing) ───────────── */
    const payloadCheck = await guardPayloadSize(request);
    if (!payloadCheck.ok) {
      return sendJson(
        {
          ok: false,
          requestId,
          code: payloadCheck.code,
          error: payloadCheck.message,
        },
        payloadCheck.status,
        requestId
      );
    }

    const rawBody = payloadCheck.body;

    /* ── 3. Sanitize input ─────────────────────────────────────── */
    const body =
      typeof rawBody === "object" && rawBody !== null && !Array.isArray(rawBody)
        ? sanitizeRequestBody(rawBody as Record<string, unknown>)
        : rawBody;

    /* ── 4. Field length validation ────────────────────────────── */
    if (typeof body === "object" && body !== null && !Array.isArray(body)) {
      const fieldCheck = validateFieldLengths(body as Record<string, unknown>);
      if (!fieldCheck.ok) {
        return sendJson(
          {
            ok: false,
            requestId,
            code: fieldCheck.code,
            error: fieldCheck.message,
          },
          400,
          requestId
        );
      }
    }

    const { email, input } = parseValidationPayload(body, requestLocale);
    const copy = getRouteCopy(input.locale ?? "en");

    /* ── 5. Bot detection (honeypot + timing + fingerprint) ────── */
    const botCheck = await runBotChecks(
      request,
      (body as Record<string, unknown>) ?? {},
      input.idea ?? ""
    );
    if (botCheck.blocked) {
      console.warn("[api/validate] bot blocked", safeLogContext({ requestId, ip: clientIp }), {
        reason: botCheck.reason,
        score: botCheck.botScore?.score,
      });
      // Return generic 400 to not reveal detection
      return sendJson(
        {
          ok: false,
          requestId,
          code: "invalid_request",
          error: copy.errors.invalidRequest,
        },
        400,
        requestId
      );
    }

    console.log(
      "[api/validate] normalized input",
      safeLogContext({
        requestId,
        email,
        ip: clientIp,
        locale: input.locale,
        ideaPreview: input.idea?.slice(0, 80),
      })
    );

    /* ── 6. Email validation (strict + disposable check) ───────── */
    if (!email) {
      return sendJson(
        {
          ok: false,
          requestId,
          code: "missing_email",
          error: copy.errors.missingEmail,
        },
        400,
        requestId
      );
    }

    const emailValidation = isStrictlyValidEmail(email);
    if (!emailValidation.valid) {
      return sendJson(
        {
          ok: false,
          requestId,
          code: "invalid_email",
          error:
            emailValidation.reason === "disposable_email"
              ? copy.errors.disposableEmail
              : copy.errors.invalidEmail,
        },
        400,
        requestId
      );
    }

    /* ── 7. Email send rate limit ──────────────────────────────── */
    const emailSendCheck = await checkEmailSendLimit(email);
    if (!emailSendCheck.allowed) {
      return sendJson(
        {
          ok: false,
          requestId,
          code: "rate_limited",
          error: copy.errors.emailSendLimit,
        },
        429,
        requestId
      );
    }

    /* ── 8. Idea validation ────────────────────────────────────── */
    if (!input.idea?.trim()) {
      return sendJson(
        {
          ok: false,
          requestId,
          code: "invalid_input",
          error: copy.errors.missingIdea,
        },
        400,
        requestId
      );
    }

    /* ── 9. AI cost guard ──────────────────────────────────────── */
    const costCheck = await checkAiCostLimit(clientIp);
    if (!costCheck.allowed) {
      console.warn("[api/validate] AI cost limit hit", safeLogContext({ requestId, ip: clientIp }), {
        reason: costCheck.reason,
      });
      return sendJson(
        {
          ok: false,
          requestId,
          code: "rate_limited",
          error: copy.errors.validationLimit,
        },
        429,
        requestId
      );
    }

    /* ── 10. Run validation pipeline ───────────────────────────── */
    const pipelineModule = await import("@/src/validation/engine/pipeline");
    const runBusinessValidationPipeline =
      pipelineModule.runBusinessValidationPipeline;

    if (typeof runBusinessValidationPipeline !== "function") {
      throw new Error("runBusinessValidationPipeline export was not found.");
    }

    const result = (await runBusinessValidationPipeline(
      input
    )) as DynamicValidationResult;

    const artifacts = await buildReportArtifacts({
      idea: input.idea,
      email,
      locale: input.locale ?? "en",
      result,
      requestId,
    });

    const [leadCapture, validationRun, emailDelivery] = await Promise.all([
      persistLead({
        requestId,
        email,
        input,
        result,
        report: artifacts.report,
      }),
      persistValidationRun({
        requestId,
        email,
        input,
        result,
        report: artifacts.report,
      }),
      deliverEmails({
        requestId,
        email,
        input,
        result,
        report: artifacts.report,
        textDocument: artifacts.textDocument,
        pdfDocument: artifacts.pdfDocument,
      }),
    ]);

    const response: ValidateSuccessResponse = {
      ok: true,
      requestId,
      email,
      report: artifacts.report,
      emailDelivery,
      leadCapture,
      validationRun,
      ...result,
    };

    // Structured observability log for dashboards and alerting
    console.log(
      JSON.stringify({
        event: "validation_completed",
        requestId,
        locale: input.locale,
        durationMs: Date.now() - startTime,
        verdict: result.finalVerdict ?? null,
        score: result.overallScore ?? null,
        reportGenerated: !!artifacts.pdfDocument,
        emailSentToUser: emailDelivery.sentToUser,
        emailSentToOwner: emailDelivery.sentToOwner,
        leadSaved: leadCapture.saved,
        runSaved: validationRun.saved,
        aiCostRemaining: costCheck.remainingCalls,
      })
    );

    return sendJson(response, 200, requestId);
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "Unknown error";
    const safeMessage = redactSensitiveTokens(rawMessage);
    console.error(
      "[api/validate] caught error",
      safeLogContext({ requestId, ip: clientIp }),
      safeMessage
    );

    const message =
      error instanceof Error
        ? error.message
        : getRouteCopy(requestLocale).errors.unknownValidationError;

    const classified = classifyValidationError(message, requestLocale);

    return sendJson(
      {
        ok: false,
        requestId,
        code: classified.code,
        error: classified.error,
        details: classified.details,
        providerFailures: classified.providerFailures,
      },
      classified.status,
      requestId
    );
  }
}
