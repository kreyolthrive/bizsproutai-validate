import { Buffer } from "node:buffer";
import nodemailer from "nodemailer";
import type {
  DynamicValidationResult,
  FrameworkDecision,
  Locale,
} from "@/src/validation/types";
import {
  resolveFrameworkDecision,
  resolveOverallScore100,
} from "@/src/validation/decision";

type LegacyReportPdf = {
  filename: string;
  bytes: Uint8Array;
};

type RouteReportPdf = {
  filename: string;
  mimeType?: string;
  contentBase64?: string;
  sizeBytes?: number;
};

type NormalizedReport = {
  filename: string;
  text: string;
  generatedAt: string;
  pdfBuffer: Buffer | null;
  pdfFilename: string | null;
};

type ValidationEmailPayload =
  | {
      userEmail: string;
      idea: string;
      locale: string;
      result: DynamicValidationResult;
      report: {
        filename: string;
        text: string;
        generatedAt: string;
        pdf?: LegacyReportPdf;
      };
    }
  | {
      email?: string;
      to?: string;
      userEmail?: string;
      idea: string;
      locale?: string;
      result: DynamicValidationResult;
      report: {
        filename: string;
        text: string;
        generatedAt: string;
        pdf?: RouteReportPdf | null;
      };
      reportText?: string;
      reportFilename?: string;
      pdfFilename?: string;
      pdfBytes?: Uint8Array | null;
      pdfBuffer?: Buffer | Uint8Array | null;
      attachments?: Array<{
        filename: string;
        content: Buffer | string;
        contentType?: string;
        encoding?: string;
      }>;
    };

type EmailDeliveryResult = {
  attempted: boolean;
  enabled: boolean;
  sentToUser: boolean;
  sentToOwner: boolean;
  errors: string[];
};

export type SmtpTestEmailResult = {
  attempted: boolean;
  enabled: boolean;
  sent: boolean;
  to: string;
  error: string | null;
  messageId: string | null;
  response: string | null;
};

export type OwnerNotificationEmailResult = {
  attempted: boolean;
  enabled: boolean;
  sent: boolean;
  error: string | null;
  messageId: string | null;
  response: string | null;
};

type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  ownerEmail: string;
};

type MailAttachment = {
  filename: string;
  content: string | Buffer;
  contentType: string;
  encoding?: "base64";
  contentDisposition?: "attachment";
};

type UnknownRecord = Record<string, unknown>;

type EmailCopy = {
  labels: {
    decision: string;
    category: string;
    countryContext: string;
    framework: string;
    summary: string;
    breakdown: string;
    launchSprintPreview: string;
    reportGenerated: string;
    idea: string;
    email: string;
    locale: string;
    demand: string;
    competition: string;
    businessModel: string;
    fullReportInline: string;
    attachmentsDropped: string;
    noActionsGenerated: string;
    reportUnavailable: string;
    validationCompleted: string;
    questionsReplyTo: string;
    smtpCredentialsMissing: string;
    missingRecipient: string;
    smtpWorking: string;
    smtpTestIntro: string;
  };
  decisionLabels: Record<FrameworkDecision, string>;
  owner: {
    subject: (decisionLabel: string, email: string) => string;
    heading: (locale: string) => string;
  };
  user: {
    subject: (decisionLabel: string) => string;
    greeting: string;
    reportAttachedTxt: string;
    reportAttachedTxtPdf: string;
  };
  dbaLine: string;
  notAvailable: string;
};

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null =
  null;
let cachedConfigKey = "";

function sanitize(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function normalizeLocale(locale?: string): Locale {
  const normalized = sanitize(locale)?.toLowerCase();
  if (normalized === "fr") return "fr";
  if (normalized === "ht") return "ht";
  if (normalized === "es") return "es";
  if (normalized === "pt") return "pt";
  return "en";
}

function getEmailCopy(locale: Locale): EmailCopy {
  switch (locale) {
    case "fr":
      return {
        labels: {
          decision: "Décision",
          category: "Catégorie",
          countryContext: "Contexte pays",
          framework: "Cadre",
          summary: "Résumé",
          breakdown: "Décomposition simple",
          launchSprintPreview: "Aperçu du sprint de lancement de 30 jours",
          reportGenerated: "Rapport généré",
          idea: "Idée",
          email: "E-mail",
          locale: "Langue",
          demand: "Demande",
          competition: "Concurrence",
          businessModel: "Modèle économique",
          fullReportInline: "Rapport complet (version intégrée)",
          attachmentsDropped:
            "Les pièces jointes ont été supprimées en raison des restrictions du relais SMTP.",
          noActionsGenerated: "Aucune action générée",
          reportUnavailable: "Rapport de validation indisponible.",
          validationCompleted: "Validation terminée.",
          questionsReplyTo: "Des questions ? Répondez à info@bizsproutai.com",
          smtpCredentialsMissing:
            "Les identifiants SMTP ne sont pas configurés.",
          missingRecipient: "Adresse e-mail du destinataire manquante.",
          smtpWorking:
            "Si vous avez reçu ce message, l’envoi SMTP fonctionne.",
          smtpTestIntro: "Ceci est un e-mail de test SMTP BizSproutAI.",
        },
        decisionLabels: {
          GO: "Prometteur — Prêt à exécuter",
          CONDITIONAL_GO: "Prometteur — Nécessite une validation",
          NEED_WORK: "Phase précoce — Valider avant de construire",
          PIVOT_RECOMMENDED: "Risque élevé — Améliorer ou pivoter",
        },
        owner: {
          subject: (decisionLabel, email) =>
            `[BizSproutAI] Nouvelle validation - ${decisionLabel} - ${email}`,
          heading: (localeCode) => `Nouvelle soumission de validation (${localeCode})`,
        },
        user: {
          subject: (decisionLabel) =>
            `Votre résultat de validation BizSproutAI : ${decisionLabel}`,
          greeting: "Merci d’avoir utilisé BizSproutAI.",
          reportAttachedTxt: "Votre rapport est joint en TXT.",
          reportAttachedTxtPdf: "Votre rapport est joint en PDF et en TXT.",
        },
        dbaLine: "BizSproutAI est un DBA de Kreyol Thrive Biz.",
        notAvailable: "n/a",
      };

    case "ht":
      return {
        labels: {
          decision: "Desizyon",
          category: "Kategori",
          countryContext: "Kontèks peyi",
          framework: "Kad",
          summary: "Rezime",
          breakdown: "Rezime senp",
          launchSprintPreview: "Aperçu sprint lansman 30 jou a",
          reportGenerated: "Rapò te jenere",
          idea: "Lide",
          email: "Imèl",
          locale: "Lang",
          demand: "Demann",
          competition: "Konpetisyon",
          businessModel: "Modèl biznis",
          fullReportInline: "Rapò konplè (vèsyon anndan mesaj la)",
          attachmentsDropped:
            "Pyès ki tache yo te retire akòz restriksyon SMTP relay.",
          noActionsGenerated: "Pa gen aksyon ki te jenere",
          reportUnavailable: "Rapò validasyon an pa disponib.",
          validationCompleted: "Validasyon an fini.",
          questionsReplyTo: "Kesyon? Reponn sou info@bizsproutai.com",
          smtpCredentialsMissing: "Kredansyèl SMTP yo pa konfigire.",
          missingRecipient: "Adrès imèl moun k ap resevwa a manke.",
          smtpWorking: "Si ou resevwa sa, livrezon SMTP la ap mache.",
          smtpTestIntro: "Sa a se yon imèl tès SMTP BizSproutAI.",
        },
        decisionLabels: {
          GO: "Pwomèt — Pare pou egzekite",
          CONDITIONAL_GO: "Pwomèt — Bezwen validasyon",
          NEED_WORK: "Bonè toujou — Valide anvan bati",
          PIVOT_RECOMMENDED: "Gwo risk — Amelyore oswa fè pivot",
        },
        owner: {
          subject: (decisionLabel, email) =>
            `[BizSproutAI] Nouvo validasyon - ${decisionLabel} - ${email}`,
          heading: (localeCode) => `Nouvo soumisyon validasyon (${localeCode})`,
        },
        user: {
          subject: (decisionLabel) =>
            `Rezilta validasyon BizSproutAI ou a: ${decisionLabel}`,
          greeting: "Mèsi paske ou itilize BizSproutAI.",
          reportAttachedTxt: "Rapò ou a tache an TXT.",
          reportAttachedTxtPdf: "Rapò ou a tache an PDF ak TXT.",
        },
        dbaLine: "BizSproutAI se yon DBA de Kreyol Thrive Biz.",
        notAvailable: "n/a",
      };

    case "es":
      return {
        labels: {
          decision: "Decisión",
          category: "Categoría",
          countryContext: "Contexto del país",
          framework: "Marco",
          summary: "Resumen",
          breakdown: "Desglose simple",
          launchSprintPreview: "Vista previa del sprint de lanzamiento de 30 días",
          reportGenerated: "Informe generado",
          idea: "Idea",
          email: "Correo electrónico",
          locale: "Idioma",
          demand: "Demanda",
          competition: "Competencia",
          businessModel: "Modelo de negocio",
          fullReportInline: "Informe completo (versión en línea)",
          attachmentsDropped:
            "Los archivos adjuntos se eliminaron debido a restricciones del relay SMTP.",
          noActionsGenerated: "No se generaron acciones",
          reportUnavailable: "Informe de validación no disponible.",
          validationCompleted: "Validación completada.",
          questionsReplyTo: "¿Preguntas? Responde a info@bizsproutai.com",
          smtpCredentialsMissing:
            "Las credenciales SMTP no están configuradas.",
          missingRecipient:
            "Falta la dirección de correo del destinatario.",
          smtpWorking:
            "Si recibiste este mensaje, la entrega SMTP está funcionando.",
          smtpTestIntro: "Este es un correo de prueba SMTP de BizSproutAI.",
        },
        decisionLabels: {
          GO: "Prometedor — Listo para ejecutar",
          CONDITIONAL_GO: "Prometedor — Necesita validación",
          NEED_WORK: "Etapa temprana — Validar antes de construir",
          PIVOT_RECOMMENDED: "Alto riesgo — Mejorar o pivotar",
        },
        owner: {
          subject: (decisionLabel, email) =>
            `[BizSproutAI] Nueva validación - ${decisionLabel} - ${email}`,
          heading: (localeCode) => `Nueva validación enviada (${localeCode})`,
        },
        user: {
          subject: (decisionLabel) =>
            `Tu resultado de validación de BizSproutAI: ${decisionLabel}`,
          greeting: "Gracias por usar BizSproutAI.",
          reportAttachedTxt: "Tu informe está adjunto en TXT.",
          reportAttachedTxtPdf: "Tu informe está adjunto en PDF y TXT.",
        },
        dbaLine: "BizSproutAI es un DBA de Kreyol Thrive Biz.",
        notAvailable: "n/a",
      };

    case "pt":
      return {
        labels: {
          decision: "Decisão",
          category: "Categoria",
          countryContext: "Contexto do país",
          framework: "Framework",
          summary: "Resumo",
          breakdown: "Resumo simples",
          launchSprintPreview: "Prévia do sprint de lançamento de 30 dias",
          reportGenerated: "Relatório gerado",
          idea: "Ideia",
          email: "E-mail",
          locale: "Idioma",
          demand: "Demanda",
          competition: "Concorrência",
          businessModel: "Modelo de negócio",
          fullReportInline: "Relatório completo (versão inline)",
          attachmentsDropped:
            "Os anexos foram removidos devido a restrições do relay SMTP.",
          noActionsGenerated: "Nenhuma ação foi gerada",
          reportUnavailable: "Relatório de validação indisponível.",
          validationCompleted: "Validação concluída.",
          questionsReplyTo: "Dúvidas? Responda para info@bizsproutai.com",
          smtpCredentialsMissing:
            "As credenciais SMTP não estão configuradas.",
          missingRecipient: "Falta o e-mail do destinatário.",
          smtpWorking:
            "Se você recebeu esta mensagem, a entrega SMTP está funcionando.",
          smtpTestIntro: "Este é um e-mail de teste SMTP da BizSproutAI.",
        },
        decisionLabels: {
          GO: "Promissor — Pronto para executar",
          CONDITIONAL_GO: "Promissor — Precisa de validação",
          NEED_WORK: "Estágio inicial — Validar antes de construir",
          PIVOT_RECOMMENDED: "Alto risco — Melhorar ou pivotar",
        },
        owner: {
          subject: (decisionLabel, email) =>
            `[BizSproutAI] Nova validação - ${decisionLabel} - ${email}`,
          heading: (localeCode) => `Novo envio de validação (${localeCode})`,
        },
        user: {
          subject: (decisionLabel) =>
            `Seu resultado de validação da BizSproutAI: ${decisionLabel}`,
          greeting: "Obrigado por usar a BizSproutAI.",
          reportAttachedTxt: "Seu relatório está anexado em TXT.",
          reportAttachedTxtPdf: "Seu relatório está anexado em PDF e TXT.",
        },
        dbaLine: "BizSproutAI é um DBA da Kreyol Thrive Biz.",
        notAvailable: "n/a",
      };

    case "en":
    default:
      return {
        labels: {
          decision: "Decision",
          category: "Category",
          countryContext: "Country context",
          framework: "Framework",
          summary: "Summary",
          breakdown: "Simple breakdown",
          launchSprintPreview: "30-day Launch Sprint preview",
          reportGenerated: "Report generated",
          idea: "Idea",
          email: "Email",
          locale: "Locale",
          demand: "Demand",
          competition: "Competition",
          businessModel: "Business model",
          fullReportInline: "Full report (inline fallback)",
          attachmentsDropped:
            "Attachments were dropped due to SMTP relay restrictions.",
          noActionsGenerated: "No actions generated",
          reportUnavailable: "Validation report unavailable.",
          validationCompleted: "Validation completed.",
          questionsReplyTo: "Questions? Reply to info@bizsproutai.com",
          smtpCredentialsMissing:
            "SMTP credentials are not configured.",
          missingRecipient: "Missing recipient email address.",
          smtpWorking:
            "If you received this, SMTP delivery is working.",
          smtpTestIntro: "This is a BizSproutAI SMTP test email.",
        },
        decisionLabels: {
          GO: "Promising — Ready to Execute",
          CONDITIONAL_GO: "Promising — Needs Validation",
          NEED_WORK: "Early Stage — Validate Before Building",
          PIVOT_RECOMMENDED: "High Risk — Improve or Pivot",
        },
        owner: {
          subject: (decisionLabel, email) =>
            `[BizSproutAI] New validation - ${decisionLabel} - ${email}`,
          heading: (localeCode) => `New validation submission (${localeCode})`,
        },
        user: {
          subject: (decisionLabel) =>
            `Your BizSproutAI validation result: ${decisionLabel}`,
          greeting: "Thanks for using BizSproutAI.",
          reportAttachedTxt: "Your report is attached as TXT.",
          reportAttachedTxtPdf: "Your report is attached as PDF and TXT.",
        },
        dbaLine: "BizSproutAI is a DBA of Kreyol Thrive Biz.",
        notAvailable: "n/a",
      };
  }
}

function getMailConfig(): MailConfig | null {
  const user = sanitize(process.env.IONOS_SMTP_USER ?? process.env.SMTP_USER);
  const pass = sanitize(process.env.IONOS_SMTP_PASS ?? process.env.SMTP_PASS);

  if (!user || !pass) return null;

  const host =
    sanitize(process.env.IONOS_SMTP_HOST ?? process.env.SMTP_HOST) ??
    "smtp.ionos.com";

  const parsedPort = Number.parseInt(
    sanitize(process.env.IONOS_SMTP_PORT ?? process.env.SMTP_PORT) ?? "587",
    10
  );

  const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 587;
  const secure = port === 465;

  const from =
    sanitize(process.env.IONOS_FROM_EMAIL ?? process.env.SMTP_FROM_EMAIL) ??
    user;

  const ownerEmail =
    sanitize(process.env.IONOS_OWNER_EMAIL ?? process.env.LEADS_TO_EMAIL) ??
    from;

  return {
    host,
    port,
    secure,
    user,
    pass,
    from,
    ownerEmail,
  };
}

function getTransporter(config: MailConfig) {
  const key = `${config.host}:${config.port}:${config.user}:${config.from}`;

  if (cachedTransporter && cachedConfigKey === key) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    requireTLS: !config.secure,
    tls: {
      minVersion: "TLSv1.2",
      servername: config.host,
    },
  });

  cachedConfigKey = key;
  return cachedTransporter;
}

function getDecision(result: DynamicValidationResult): FrameworkDecision {
  return resolveFrameworkDecision(result);
}

function getDecisionLabel(
  decision: FrameworkDecision,
  locale: Locale
): string {
  return getEmailCopy(locale).decisionLabels[decision];
}

function resolveReportScore(result: DynamicValidationResult): number {
  return resolveOverallScore100(result);
}

function buildSummaryLines(
  result: DynamicValidationResult,
  locale: Locale
): string[] {
  const copy = getEmailCopy(locale);
  const demand = result.frameworkReport?.problemDemand?.total;
  const competition =
    result.frameworkReport?.solutionValidation?.differentiation;
  const margin = result.frameworkReport?.businessModelValidation?.margin;

  return [
    `${copy.labels.demand}: ${typeof demand === "number" ? `${demand}/20` : copy.notAvailable}`,
    `${copy.labels.competition}: ${
      typeof competition === "number"
        ? `${competition}/5`
        : copy.notAvailable
    }`,
    `${copy.labels.businessModel}: ${
      typeof margin === "number" ? `${margin}%` : copy.notAvailable
    }`,
  ];
}

function buildFromHeader(from: string): string {
  if (from.includes("<") && from.includes(">")) return from;
  return `BizSproutAI <${from}>`;
}

function formatError(error: unknown): string {
  if (!error) return "send failed";

  if (error instanceof Error) {
    const lowerMessage = error.message.toLowerCase();

    if (
      lowerMessage.includes("domain does not accept mail") ||
      lowerMessage.includes("invalid dns mx")
    ) {
      return "Recipient domain cannot receive email. Use a real inbox address.";
    }

    const maybeCode = (error as Error & { code?: string }).code;
    return maybeCode ? `${maybeCode}: ${error.message}` : error.message;
  }

  return "send failed";
}

function normalizeUserEmail(payload: ValidationEmailPayload): string | null {
  const candidate =
    ("userEmail" in payload ? payload.userEmail : undefined) ??
    ("email" in payload ? payload.email : undefined) ??
    ("to" in payload ? payload.to : undefined);

  const normalized = sanitize(candidate);
  return normalized ?? null;
}

function normalizeLocaleFromPayload(payload: ValidationEmailPayload): Locale {
  return normalizeLocale("locale" in payload ? payload.locale : undefined);
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
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

  return getEmailCopy(locale).notAvailable;
}

function normalizeReport(payload: ValidationEmailPayload): NormalizedReport {
  const locale = normalizeLocaleFromPayload(payload);
  const copy = getEmailCopy(locale);

  const reportFilename =
    ("reportFilename" in payload ? sanitize(payload.reportFilename) : undefined) ??
    sanitize(payload.report?.filename) ??
    "bizsproutai-validation-report.txt";

  const reportText =
    ("reportText" in payload ? sanitize(payload.reportText) : undefined) ??
    sanitize(payload.report?.text) ??
    copy.labels.reportUnavailable;

  const generatedAt =
    sanitize(payload.report?.generatedAt) ?? new Date().toISOString();

  let pdfBuffer: Buffer | null = null;
  let pdfFilename: string | null =
    ("pdfFilename" in payload ? sanitize(payload.pdfFilename) : undefined) ??
    sanitize(payload.report?.pdf?.filename) ??
    null;

  const reportPdf = payload.report?.pdf;

  if (reportPdf && typeof reportPdf === "object") {
    if ("bytes" in reportPdf && reportPdf.bytes instanceof Uint8Array) {
      pdfBuffer = Buffer.from(reportPdf.bytes);
    } else if (
      "contentBase64" in reportPdf &&
      typeof reportPdf.contentBase64 === "string" &&
      reportPdf.contentBase64.trim().length > 0
    ) {
      pdfBuffer = Buffer.from(reportPdf.contentBase64, "base64");
    }
  }

  if (!pdfBuffer && "pdfBuffer" in payload && payload.pdfBuffer) {
    pdfBuffer = Buffer.isBuffer(payload.pdfBuffer)
      ? payload.pdfBuffer
      : Buffer.from(payload.pdfBuffer);
  }

  if (!pdfBuffer && "pdfBytes" in payload && payload.pdfBytes) {
    pdfBuffer = Buffer.from(payload.pdfBytes);
  }

  if (
    !pdfBuffer &&
    "attachments" in payload &&
    Array.isArray(payload.attachments)
  ) {
    const pdfAttachment = payload.attachments.find(
      (attachment) =>
        attachment &&
        typeof attachment.filename === "string" &&
        attachment.filename.toLowerCase().endsWith(".pdf")
    );

    if (pdfAttachment) {
      pdfFilename = sanitize(pdfAttachment.filename) ?? pdfFilename;

      if (Buffer.isBuffer(pdfAttachment.content)) {
        pdfBuffer = pdfAttachment.content;
      } else if (typeof pdfAttachment.content === "string") {
        if (pdfAttachment.encoding === "base64") {
          pdfBuffer = Buffer.from(pdfAttachment.content, "base64");
        } else {
          pdfBuffer = Buffer.from(pdfAttachment.content, "utf-8");
        }
      }
    }
  }

  return {
    filename: reportFilename,
    text: reportText,
    generatedAt,
    pdfBuffer,
    pdfFilename,
  };
}

function buildAttachments(report: NormalizedReport): MailAttachment[] {
  const attachments: MailAttachment[] = [
    {
      filename: report.filename,
      content: Buffer.from(report.text, "utf-8").toString("base64"),
      encoding: "base64",
      contentType: "text/plain; charset=utf-8",
      contentDisposition: "attachment",
    },
  ];

  if (report.pdfBuffer && report.pdfFilename) {
    attachments.push({
      filename: report.pdfFilename,
      content: report.pdfBuffer.toString("base64"),
      encoding: "base64",
      contentType: "application/pdf",
      contentDisposition: "attachment",
    });
  }

  return attachments;
}

function resolveCategory(result: DynamicValidationResult, locale: Locale): string {
  const value =
    result.category ?? result.businessCategory ?? result.business_category;
  return value ? value.replace(/_/g, " ") : getEmailCopy(locale).notAvailable;
}

function resolveFramework(result: DynamicValidationResult, locale: Locale): string {
  return (
    result.framework?.label ??
    result.frameworkUsed ??
    result.framework_used ??
    result.selectedFramework?.frameworkLabel ??
    getEmailCopy(locale).notAvailable
  );
}

function resolveSummary(result: DynamicValidationResult, locale: Locale): string {
  return result.summary?.oneLiner ?? getEmailCopy(locale).labels.validationCompleted;
}

function resolvePreviewActions(
  result: DynamicValidationResult,
  locale: Locale
): string[] {
  const candidates = Array.isArray(result.nextActions)
    ? result.nextActions
    : Array.isArray(result.recommendedNextSteps)
      ? result.recommendedNextSteps
      : Array.isArray(result.recommended_next_steps)
        ? result.recommended_next_steps
        : [];

  return candidates.length
    ? candidates.slice(0, 3)
    : [getEmailCopy(locale).labels.noActionsGenerated];
}

async function sendMailWithAttachmentFallback(params: {
  transporter: ReturnType<typeof nodemailer.createTransport>;
  mail: {
    from: string;
    to: string;
    subject: string;
    text: string;
    replyTo?: string;
    attachments?: MailAttachment[];
  };
  fallbackText: string;
}): Promise<{ sent: boolean; error?: string; fallbackUsed: boolean }> {
  try {
    await params.transporter.sendMail(params.mail);
    return { sent: true, fallbackUsed: false };
  } catch (firstError) {
    if (!params.mail.attachments?.length) {
      return {
        sent: false,
        fallbackUsed: false,
        error: formatError(firstError),
      };
    }

    try {
      await params.transporter.sendMail({
        ...params.mail,
        text: params.fallbackText,
        attachments: [],
      });
      return { sent: true, fallbackUsed: true };
    } catch (fallbackError) {
      return {
        sent: false,
        fallbackUsed: false,
        error: `${formatError(firstError)} (fallback failed: ${formatError(
          fallbackError
        )})`,
      };
    }
  }
}

export async function sendValidationEmails(
  payload: ValidationEmailPayload
): Promise<EmailDeliveryResult> {
  const locale = normalizeLocaleFromPayload(payload);
  const copy = getEmailCopy(locale);
  const config = getMailConfig();

  if (!config) {
    console.warn("[email] SMTP credentials missing; skipping delivery.");
    return {
      attempted: false,
      enabled: false,
      sentToUser: false,
      sentToOwner: false,
      errors: [copy.labels.smtpCredentialsMissing],
    };
  }

  const userEmail = normalizeUserEmail(payload);

  if (!userEmail) {
    return {
      attempted: true,
      enabled: true,
      sentToUser: false,
      sentToOwner: false,
      errors: [copy.labels.missingRecipient],
    };
  }

  const transporter = getTransporter(config);
  const report = normalizeReport(payload);
  const attachments = buildAttachments(report);

  const decision = getDecision(payload.result);
  const decisionText = getDecisionLabel(decision, locale);
  const score = resolveReportScore(payload.result);
  const breakdown = buildSummaryLines(payload.result, locale);
  const previewActions = resolvePreviewActions(payload.result, locale);
  const fromHeader = buildFromHeader(config.from);

  const ownerText = [
    copy.owner.heading(locale),
    "",
    `${copy.labels.email}: ${userEmail}`,
    `${copy.labels.decision}: ${decisionText} (${score}/100)`,
    `${copy.labels.category}: ${resolveCategory(payload.result, locale)}`,
    `${copy.labels.countryContext}: ${resolveCountry(payload.result, locale)}`,
    `${copy.labels.framework}: ${resolveFramework(payload.result, locale)}`,
    "",
    `${copy.labels.idea}:`,
    payload.idea,
    "",
    `${copy.labels.summary}:`,
    resolveSummary(payload.result, locale),
    "",
    `${copy.labels.breakdown}:`,
    ...breakdown,
    "",
    `${copy.labels.launchSprintPreview}:`,
    ...previewActions,
    "",
    `${copy.labels.reportGenerated}: ${report.generatedAt}`,
    "",
    copy.dbaLine,
  ].join("\n");

  const userText = [
    copy.user.greeting,
    "",
    `${copy.labels.decision}: ${decisionText} (${score}/100)`,
    `${copy.labels.category}: ${resolveCategory(payload.result, locale)}`,
    `${copy.labels.countryContext}: ${resolveCountry(payload.result, locale)}`,
    `${copy.labels.framework}: ${resolveFramework(payload.result, locale)}`,
    "",
    `${copy.labels.summary}:`,
    resolveSummary(payload.result, locale),
    "",
    `${copy.labels.breakdown}:`,
    ...breakdown,
    "",
    `${copy.labels.launchSprintPreview}:`,
    ...previewActions,
    "",
    attachments.length > 1
      ? copy.user.reportAttachedTxtPdf
      : copy.user.reportAttachedTxt,
    "",
    `${copy.labels.summary}:`,
    resolveSummary(payload.result, locale),
    ...breakdown,
    copy.labels.questionsReplyTo,
    copy.dbaLine,
  ].join("\n");

  const errors: string[] = [];
  let sentToOwner = false;
  let sentToUser = false;

  const ownerSend = await sendMailWithAttachmentFallback({
    transporter,
    mail: {
      from: fromHeader,
      to: config.ownerEmail,
      replyTo: userEmail,
      subject: copy.owner.subject(decisionText, userEmail),
      text: ownerText,
      attachments,
    },
    fallbackText: [
      ownerText,
      "",
      copy.labels.attachmentsDropped,
      "",
      `${copy.labels.fullReportInline}:`,
      report.text,
    ].join("\n"),
  });

  sentToOwner = ownerSend.sent;

  if (ownerSend.error) {
    errors.push(`owner: ${ownerSend.error}`);
    console.error("[email] owner delivery failed", ownerSend.error);
  } else if (ownerSend.fallbackUsed) {
    console.warn("[email] owner delivery succeeded using no-attachment fallback");
  }

  const userSend = await sendMailWithAttachmentFallback({
    transporter,
    mail: {
      from: fromHeader,
      to: userEmail,
      subject: copy.user.subject(decisionText),
      text: userText,
      attachments,
    },
    fallbackText: [
      userText,
      "",
      copy.labels.attachmentsDropped,
      "",
      `${copy.labels.fullReportInline}:`,
      report.text,
    ].join("\n"),
  });

  sentToUser = userSend.sent;

  if (userSend.error) {
    errors.push(`user: ${userSend.error}`);
    console.error("[email] user delivery failed", userSend.error);
  } else if (userSend.fallbackUsed) {
    console.warn("[email] user delivery succeeded using no-attachment fallback");
  }

  return {
    attempted: true,
    enabled: true,
    sentToUser,
    sentToOwner,
    errors,
  };
}

export async function sendSmtpTestEmail(
  to: string
): Promise<SmtpTestEmailResult> {
  const config = getMailConfig();
  const locale: Locale = "en";
  const copy = getEmailCopy(locale);

  if (!config) {
    return {
      attempted: false,
      enabled: false,
      sent: false,
      to,
      error: copy.labels.smtpCredentialsMissing,
      messageId: null,
      response: null,
    };
  }

  const transporter = getTransporter(config);
  const fromHeader = buildFromHeader(config.from);
  const subject = `[BizSproutAI] SMTP test (${new Date().toISOString()})`;

  const text = [
    copy.labels.smtpTestIntro,
    "",
    `To: ${to}`,
    `From: ${fromHeader}`,
    `Host: ${config.host}:${config.port}`,
    "",
    copy.labels.smtpWorking,
  ].join("\n");

  try {
    const info = await transporter.sendMail({
      from: fromHeader,
      to,
      subject,
      text,
    });

    return {
      attempted: true,
      enabled: true,
      sent: true,
      to,
      error: null,
      messageId: info.messageId ?? null,
      response: typeof info.response === "string" ? info.response : null,
    };
  } catch (error) {
    return {
      attempted: true,
      enabled: true,
      sent: false,
      to,
      error: formatError(error),
      messageId: null,
      response: null,
    };
  }
}

export async function sendOwnerNotificationEmail(payload: {
  to?: string;
  replyTo?: string;
  subject: string;
  text: string;
}): Promise<OwnerNotificationEmailResult> {
  const config = getMailConfig();

  if (!config) {
    return {
      attempted: false,
      enabled: false,
      sent: false,
      error: "SMTP credentials missing.",
      messageId: null,
      response: null,
    };
  }

  const transporter = getTransporter(config);
  const fromHeader = buildFromHeader(config.from);
  const to = sanitize(payload.to) ?? config.ownerEmail;
  const replyTo = sanitize(payload.replyTo);

  try {
    const info = await transporter.sendMail({
      from: fromHeader,
      to,
      replyTo,
      subject: payload.subject,
      text: payload.text,
    });

    return {
      attempted: true,
      enabled: true,
      sent: true,
      error: null,
      messageId: info.messageId ?? null,
      response: typeof info.response === "string" ? info.response : null,
    };
  } catch (error) {
    return {
      attempted: true,
      enabled: true,
      sent: false,
      error: formatError(error),
      messageId: null,
      response: null,
    };
  }
}
