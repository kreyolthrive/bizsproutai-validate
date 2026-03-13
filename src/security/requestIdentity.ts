import crypto from "node:crypto";
import type { NextRequest } from "next/server";

const IP_HEADERS = [
  "x-vercel-forwarded-for",
  "cf-connecting-ip",
  "x-real-ip",
  "fastly-client-ip",
  "fly-client-ip",
];

function normalizeIpCandidate(value: string | null): string | null {
  if (!value) return null;
  const first = value.split(",")[0]?.trim();
  if (!first) return null;
  if (first.length > 64) return null;
  return first;
}

function hashUserAgent(userAgent: string | null): string {
  if (!userAgent) return "ua:none";
  const hash = crypto.createHash("sha256").update(userAgent).digest("hex").slice(0, 16);
  return `ua:${hash}`;
}

export function resolveClientIp(request: NextRequest): string {
  for (const header of IP_HEADERS) {
    const candidate = normalizeIpCandidate(request.headers.get(header));
    if (candidate) return candidate;
  }

  const forwarded = normalizeIpCandidate(request.headers.get("x-forwarded-for"));
  if (forwarded) return forwarded;

  return "ip:unknown";
}

export function buildRateLimitIdentity(scope: string, request: NextRequest): string {
  const ip = resolveClientIp(request);
  const userAgentHash = hashUserAgent(request.headers.get("user-agent"));
  return `${scope}:${ip}:${userAgentHash}`;
}
