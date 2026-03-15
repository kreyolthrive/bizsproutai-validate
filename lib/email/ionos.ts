import { Buffer } from "node:buffer";
import nodemailer from "nodemailer";
import type {
  DynamicValidationResult,
  FrameworkDecision,
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

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null =
  null;
let cachedConfigKey = "";

function sanitize(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
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

function getDecisionLabel(decision: FrameworkDecision): string {
  if (decision === "GO") return "Promising — Ready to Execute";
  if (decision === "CONDITIONAL_GO") return "Promising — Needs Validation";
  if (decision === "NEED_WORK") return "Early Stage — Validate Before Building";
  return "High Risk — Improve or Pivot";
}

function resolveReportScore(result: DynamicValidationResult): number {
  return resolveOverallScore100(result);
}

function buildSummaryLines(result: DynamicValidationResult): string[] {
  const demand = result.frameworkReport?.problemDemand?.total;
  const competition =
    result.frameworkReport?.solutionValidation?.differentiation;
  const margin = result.frameworkReport?.businessModelValidation?.margin;

  return [
    `Demand: ${typeof demand === "number" ? `${demand}/20` : "n/a"}`,
    `Competition: ${
      typeof competition === "number"
        ? `${competition}/5 (differentiation)`
        : "n/a"
    }`,
    `Business model: ${
      typeof margin === "number" ? `${margin}% estimated margin` : "n/a"
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

function normalizeLocale(payload: ValidationEmailPayload): string {
  return (
    sanitize(("locale" in payload ? payload.locale : undefined) ?? "en") ?? "en"
  );
}

function normalizeReport(payload: ValidationEmailPayload): NormalizedReport {
  const reportFilename =
    ("reportFilename" in payload ? sanitize(payload.reportFilename) : undefined) ??
    sanitize(payload.report?.filename) ??
    "bizsproutai-validation-report.txt";

  const reportText =
    ("reportText" in payload ? sanitize(payload.reportText) : undefined) ??
    sanitize(payload.report?.text) ??
    "Validation report unavailable.";

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

function resolveCategory(result: DynamicValidationResult): string {
  return (
    result.category ?? result.businessCategory ?? result.business_category ?? "n/a"
  );
}

function resolveCountry(result: DynamicValidationResult): string {
  return result.country?.code ?? "n/a";
}

function resolveFramework(result: DynamicValidationResult): string {
  return (
    result.framework?.label ??
    result.frameworkUsed ??
    result.framework_used ??
    result.selectedFramework?.frameworkLabel ??
    "General"
  );
}

function resolveSummary(result: DynamicValidationResult): string {
  return result.summary?.oneLiner ?? "Validation completed.";
}

function resolvePreviewActions(result: DynamicValidationResult): string[] {
  return Array.isArray(result.nextActions)
    ? result.nextActions.slice(0, 3)
    : [];
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
  const config = getMailConfig();

  if (!config) {
    console.warn("[email] SMTP credentials missing; skipping delivery.");
    return {
      attempted: false,
      enabled: false,
      sentToUser: false,
      sentToOwner: false,
      errors: ["SMTP credentials are not configured."],
    };
  }

  const userEmail = normalizeUserEmail(payload);

  if (!userEmail) {
    return {
      attempted: true,
      enabled: true,
      sentToUser: false,
      sentToOwner: false,
      errors: ["Missing recipient email address."],
    };
  }

  const transporter = getTransporter(config);
  const locale = normalizeLocale(payload);
  const report = normalizeReport(payload);
  const attachments = buildAttachments(report);

  const decision = getDecision(payload.result);
  const decisionLabel = getDecisionLabel(decision);
  const score = resolveReportScore(payload.result);
  const breakdown = buildSummaryLines(payload.result);
  const previewActions = resolvePreviewActions(payload.result);
  const fromHeader = buildFromHeader(config.from);

  const ownerText = [
    `New validation submission (${locale})`,
    "",
    `Email: ${userEmail}`,
    `Decision: ${decisionLabel} (${score}/100)`,
    `Category: ${resolveCategory(payload.result)}`,
    `Country: ${resolveCountry(payload.result)}`,
    `Framework: ${resolveFramework(payload.result)}`,
    "",
    "Idea:",
    payload.idea,
    "",
    "Summary:",
    resolveSummary(payload.result),
    "",
    "Breakdown:",
    ...breakdown,
    "",
    "30-day Launch Sprint preview:",
    ...(previewActions.length ? previewActions : ["No actions generated"]),
    "",
    `Report generated: ${report.generatedAt}`,
    "",
    "BizSproutAI is a DBA of Kreyol Thrive Biz.",
  ].join("\n");

  const userText = [
    "Thanks for using BizSproutAI.",
    "",
    `Decision: ${decisionLabel} (${score}/100)`,
    `Category: ${resolveCategory(payload.result)}`,
    `Country context: ${resolveCountry(payload.result)}`,
    `Framework: ${resolveFramework(payload.result)}`,
    "",
    "Summary:",
    resolveSummary(payload.result),
    "",
    "Simple breakdown:",
    ...breakdown,
    "",
    "30-day Launch Sprint preview:",
    ...(previewActions.length ? previewActions : ["No actions generated"]),
    "",
    attachments.length > 1
      ? "Your report is attached as PDF and TXT."
      : "Your report is attached as TXT.",
    "",
    "Attachment issue fallback (same summary inline):",
    resolveSummary(payload.result),
    ...breakdown,
    "Questions? Reply to info@bizsproutai.com",
    "BizSproutAI is a DBA of Kreyol Thrive Biz.",
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
      subject: `[BizSproutAI] New validation - ${decisionLabel} - ${userEmail}`,
      text: ownerText,
      attachments,
    },
    fallbackText: [
      ownerText,
      "",
      "Attachments were dropped due to SMTP relay restrictions.",
      "",
      "Full report (inline fallback):",
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
      subject: `Your BizSproutAI validation result: ${decisionLabel}`,
      text: userText,
      attachments,
    },
    fallbackText: [
      userText,
      "",
      "Attachments were dropped due to SMTP relay restrictions.",
      "",
      "Full report (inline fallback):",
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

  if (!config) {
    return {
      attempted: false,
      enabled: false,
      sent: false,
      to,
      error: "SMTP credentials are not configured.",
      messageId: null,
      response: null,
    };
  }

  const transporter = getTransporter(config);
  const fromHeader = buildFromHeader(config.from);
  const subject = `[BizSproutAI] SMTP test (${new Date().toISOString()})`;

  const text = [
    "This is a BizSproutAI SMTP test email.",
    "",
    `To: ${to}`,
    `From: ${fromHeader}`,
    `Host: ${config.host}:${config.port}`,
    "",
    "If you received this, SMTP delivery is working.",
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
