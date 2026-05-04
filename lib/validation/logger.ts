export interface LogFields {
  event: string;
  requestId: string;
  ts: string;
  email?: string;
  locale?: string;
  stage?: string;
  verdict?: string;
  firstAsset?: string;
  leadSaved?: boolean;
  ownerNotified?: boolean;
  emailSent?: boolean;
  partial?: boolean;
  durationMs?: number;
  error?: string;
  [key: string]: unknown;
}

function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at < 0) return "***";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  return `${local.slice(0, 2)}***@${domain}`;
}

function sanitize(fields: LogFields): LogFields {
  const out = { ...fields };
  if (typeof out.email === "string") out.email = maskEmail(out.email);
  return out;
}

function emit(level: "info" | "warn" | "error", fields: LogFields): void {
  const safe = sanitize(fields);
  const line = `[free-validate] ${JSON.stringify({ level, ...safe })}`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (fields: LogFields) => emit("info", fields),
  warn: (fields: LogFields) => emit("warn", fields),
  error: (fields: LogFields) => emit("error", fields),
};
