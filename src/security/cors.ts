const PROD_DEFAULT_ORIGINS = [
  "https://validate.bizsproutai.com",
  "https://bizsproutai.com",
];

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, "");
}

function getAllowedOrigins(): string[] {
  const fromEnv = (process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(normalizeOrigin);

  if (fromEnv.length > 0) return fromEnv;

  if (process.env.NODE_ENV !== "production") {
    return [...PROD_DEFAULT_ORIGINS, "http://localhost:3000", "http://127.0.0.1:3000"];
  }

  return PROD_DEFAULT_ORIGINS;
}

export function resolveCorsOrigin(origin: string | null): string | null {
  if (!origin) return null;
  const normalized = normalizeOrigin(origin);
  return getAllowedOrigins().includes(normalized) ? normalized : null;
}

export function buildCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = resolveCorsOrigin(origin);
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Token",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (allowed) {
    headers["Access-Control-Allow-Origin"] = allowed;
  }

  return headers;
}

