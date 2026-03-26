/**
 * Lightweight admin audit logger.
 *
 * Logs admin actions with sanitized context. In production these go to
 * stdout where Vercel / your log drain captures them. Extend to a
 * persistent store (Supabase, Datadog, etc.) if needed.
 */

import { maskEmail, maskIp } from "@/src/security/piiSanitizer";

export type AuditEvent =
  | "admin.session.created"
  | "admin.session.deleted"
  | "admin.leads.exported"
  | "admin.leads.viewed"
  | "gdpr.data.deleted";

type AuditContext = {
  event: AuditEvent;
  ip?: string | null;
  email?: string | null;
  sessionId?: string | null;
  detail?: string | null;
};

export function logAuditEvent(ctx: AuditContext): void {
  const entry = {
    audit: true,
    event: ctx.event,
    ip: ctx.ip ? maskIp(ctx.ip) : undefined,
    email: ctx.email ? maskEmail(ctx.email) : undefined,
    sessionId: ctx.sessionId ?? undefined,
    detail: ctx.detail ?? undefined,
    ts: new Date().toISOString(),
  };

  console.log(`[AUDIT] ${JSON.stringify(entry)}`);
}
