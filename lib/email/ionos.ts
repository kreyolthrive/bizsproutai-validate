import nodemailer from "nodemailer";
import type { DynamicValidationResult, FrameworkDecision } from "@/src/validation/types";

type ValidationEmailPayload = {
  userEmail: string;
  idea: string;
  locale: string;
  result: DynamicValidationResult;
  report: {
    filename: string;
    text: string;
    generatedAt: string;
    pdf?: {
      filename: string;
      bytes: Uint8Array;
    };
  };
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

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;
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

  const host = sanitize(process.env.IONOS_SMTP_HOST ?? process.env.SMTP_HOST) ?? "smtp.ionos.com";
  const parsedPort = Number.parseInt(
    sanitize(process.env.IONOS_SMTP_PORT ?? process.env.SMTP_PORT) ?? "587",
    10
  );
  const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 587;
  const secure = port === 465;
  const from = sanitize(process.env.IONOS_FROM_EMAIL ?? process.env.SMTP_FROM_EMAIL) ?? user;
  const ownerEmail = sanitize(process.env.IONOS_OWNER_EMAIL ?? process.env.LEADS_TO_EMAIL) ?? from;

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
  if (cachedTransporter && cachedConfigKey === key) return cachedTransporter;

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
  if (result.frameworkReport?.decision) return result.frameworkReport.decision;
  if (result.status === "GO") return "GO";
  if (result.status === "STOP") return "NO_GO";
  return "NEED_WORK";
}

function getDecisionLabel(decision: FrameworkDecision): string {
  if (decision === "CONDITIONAL_GO") return "CONDITIONAL GO";
  if (decision === "NEED_WORK") return "NEEDS WORK";
  if (decision === "NO_GO") return "NO GO";
  return "GO";
}

function resolveReportScore(result: DynamicValidationResult): number {
  if (typeof result.frameworkReport?.weightedScore === "number") {
    return Math.max(0, Math.min(100, Math.round(result.frameworkReport.weightedScore)));
  }
  return Math.round(Math.max(0, Math.min(100, result.overallScore * 20)));
}

function buildSummaryLines(result: DynamicValidationResult): string[] {
  const demand = result.frameworkReport?.problemDemand.total;
  const competition = result.frameworkReport?.solutionValidation.differentiation;
  const margin = result.frameworkReport?.businessModelValidation.margin;

  return [
    `Demand: ${typeof demand === "number" ? `${demand}/20` : "n/a"}`,
    `Competition: ${typeof competition === "number" ? `${competition}/5 (differentiation)` : "n/a"}`,
    `Business model: ${typeof margin === "number" ? `${margin}% estimated margin` : "n/a"}`,
  ];
}

type MailAttachment = {
  filename: string;
  content: string | Buffer;
  contentType: string;
  encoding?: "base64";
  contentDisposition?: "attachment";
};

function buildAttachments(payload: ValidationEmailPayload): MailAttachment[] {
  const attachments: MailAttachment[] = [
    {
      filename: payload.report.filename,
      // Base64 payload avoids client-side corruption on stricter SMTP relays.
      content: Buffer.from(payload.report.text, "utf-8").toString("base64"),
      encoding: "base64",
      contentType: "text/plain; charset=utf-8",
      contentDisposition: "attachment",
    },
  ];

  if (payload.report.pdf) {
    attachments.push({
      filename: payload.report.pdf.filename,
      content: Buffer.from(payload.report.pdf.bytes).toString("base64"),
      encoding: "base64",
      contentType: "application/pdf",
      contentDisposition: "attachment",
    });
  }

  return attachments;
}

function buildFromHeader(from: string): string {
  // Allow either plain email or preformatted `Name <email@domain>` in env config.
  if (from.includes("<") && from.includes(">")) return from;
  return `BizSproutAI <${from}>`;
}

function formatError(error: unknown): string {
  if (!error) return "send failed";
  if (error instanceof Error) {
    const lowerMessage = error.message.toLowerCase();
    if (lowerMessage.includes("domain does not accept mail") || lowerMessage.includes("invalid dns mx")) {
      return "Recipient domain cannot receive email. Use a real inbox address.";
    }
    const maybeCode = (error as Error & { code?: string }).code;
    return maybeCode ? `${maybeCode}: ${error.message}` : error.message;
  }
  return "send failed";
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
      return { sent: false, fallbackUsed: false, error: formatError(firstError) };
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
        error: `${formatError(firstError)} (fallback failed: ${formatError(fallbackError)})`,
      };
    }
  }
}

export async function sendValidationEmails(payload: ValidationEmailPayload): Promise<EmailDeliveryResult> {
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

  const transporter = getTransporter(config);
  const decision = getDecision(payload.result);
  const decisionLabel = getDecisionLabel(decision);
  const score = resolveReportScore(payload.result);
  const breakdown = buildSummaryLines(payload.result);
  const previewActions = payload.result.nextActions.slice(0, 3);
  const attachments = buildAttachments(payload);
  const fromHeader = buildFromHeader(config.from);

  const ownerText = [
    `New validation submission (${payload.locale})`,
    "",
    `Email: ${payload.userEmail}`,
    `Decision: ${decisionLabel} (${score}/100)`,
    `Category: ${payload.result.category}`,
    `Country: ${payload.result.country.code}`,
    `Framework: ${payload.result.framework?.label ?? "General"}`,
    "",
    "Idea:",
    payload.idea,
    "",
    "Summary:",
    payload.result.summary.oneLiner,
    "",
    "Breakdown:",
    ...breakdown,
    "",
    "30-day Launch Sprint preview:",
    ...(previewActions.length ? previewActions : ["No actions generated"]),
    "",
    `Report generated: ${payload.report.generatedAt}`,
    "",
    "BizSproutAI is a DBA of Kreyol Thrive Biz.",
  ].join("\n");

  const userText = [
    `Thanks for using BizSproutAI.`,
    "",
    `Decision: ${decisionLabel} (${score}/100)`,
    `Category: ${payload.result.category}`,
    `Country context: ${payload.result.country.code}`,
    `Framework: ${payload.result.framework?.label ?? "General"}`,
    "",
    "Summary:",
    payload.result.summary.oneLiner,
    "",
    "Simple breakdown:",
    ...breakdown,
    "",
    "30-day Launch Sprint preview:",
    ...(previewActions.length ? previewActions : ["No actions generated"]),
    "",
    "Your report is attached as PDF and TXT.",
    "",
    "Attachment issue fallback (same summary inline):",
    payload.result.summary.oneLiner,
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
      replyTo: payload.userEmail,
      subject: `[BizSproutAI] New validation - ${decisionLabel} - ${payload.userEmail}`,
      text: ownerText,
      attachments,
    },
    fallbackText: [
      ownerText,
      "",
      "Attachments were dropped due to SMTP relay restrictions.",
      "",
      "Full report (inline fallback):",
      payload.report.text,
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
      to: payload.userEmail,
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
      payload.report.text,
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

export async function sendSmtpTestEmail(to: string): Promise<SmtpTestEmailResult> {
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
