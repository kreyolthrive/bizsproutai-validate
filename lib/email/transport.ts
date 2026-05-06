/**
 * Provider-agnostic email transport.
 *
 * Controlled by EMAIL_PROVIDER env var:
 *   "hostinger" — Hostinger SMTP (HOSTINGER_SMTP_* vars)  [active sender]
 *   "gmail"     — Gmail SMTP via App Password (GMAIL_USER + GMAIL_APP_PASSWORD)
 *   "ionos"     — IONOS SMTP (IONOS_SMTP_* vars)
 *   "resend"    — Resend API (RESEND_API_KEY + RESEND_FROM_EMAIL)
 *
 * To switch providers: update EMAIL_PROVIDER in Vercel env vars and redeploy.
 * No code changes required.
 */

import nodemailer from "nodemailer";

export type EmailProvider = "hostinger" | "gmail" | "ionos";

export interface ResolvedTransport {
  transport: nodemailer.Transporter;
  from: string;
}

export function resolveTransport(): ResolvedTransport | null {
  const provider = (process.env.EMAIL_PROVIDER ?? "hostinger") as EmailProvider;

  if (provider === "hostinger") {
    const user = process.env.HOSTINGER_SMTP_USER;
    const pass = process.env.HOSTINGER_SMTP_PASS;
    const from = process.env.HOSTINGER_FROM_EMAIL ?? user;
    if (!user || !pass) {
      console.warn("[email/transport] EMAIL_PROVIDER=hostinger but HOSTINGER_SMTP_USER or HOSTINGER_SMTP_PASS is missing");
      return null;
    }
    return {
      transport: nodemailer.createTransport({
        host: process.env.HOSTINGER_SMTP_HOST ?? "smtp.hostinger.com",
        port: parseInt(process.env.HOSTINGER_SMTP_PORT ?? "465", 10),
        secure: parseInt(process.env.HOSTINGER_SMTP_PORT ?? "465", 10) === 465,
        auth: { user, pass },
      }),
      from: from!,
    };
  }

  if (provider === "gmail") {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) {
      console.warn("[email/transport] EMAIL_PROVIDER=gmail but GMAIL_USER or GMAIL_APP_PASSWORD is missing");
      return null;
    }
    return {
      transport: nodemailer.createTransport({ service: "gmail", auth: { user, pass } }),
      from: user,
    };
  }

  // IONOS (default)
  const user = process.env.IONOS_SMTP_USER;
  const pass = process.env.IONOS_SMTP_PASS;
  const from = process.env.IONOS_FROM_EMAIL;
  if (!user || !pass || !from) {
    console.warn("[email/transport] EMAIL_PROVIDER=ionos but IONOS_SMTP_USER, IONOS_SMTP_PASS, or IONOS_FROM_EMAIL is missing");
    return null;
  }
  return {
    transport: nodemailer.createTransport({
      host: process.env.IONOS_SMTP_HOST ?? "smtp.ionos.com",
      port: parseInt(process.env.IONOS_SMTP_PORT ?? "587", 10),
      secure: false,
      auth: { user, pass },
    }),
    from,
  };
}
