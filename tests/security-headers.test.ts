// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

function setNodeEnv(value: string | undefined) {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

describe("security headers in next config", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    setNodeEnv(ORIGINAL_NODE_ENV);
    delete require.cache[require.resolve("../next.config.js")];
  });

  it("configures CSP and related browser hardening headers", async () => {
    setNodeEnv("development");
    delete require.cache[require.resolve("../next.config.js")];
    const nextConfig = require("../next.config.js");

    const headerSets = await nextConfig.headers();
    const rootHeaders = headerSets.find((entry: { source: string }) => entry.source === "/:path*")?.headers ?? [];
    const headerMap = Object.fromEntries(rootHeaders.map((entry: { key: string; value: string }) => [entry.key, entry.value]));

    expect(headerMap["Content-Security-Policy"]).toContain("default-src 'self'");
    expect(headerMap["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(headerMap["X-Frame-Options"]).toBe("DENY");
    expect(headerMap["X-Content-Type-Options"]).toBe("nosniff");
    expect(headerMap["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headerMap["Permissions-Policy"]).toContain("camera=()");
  });

  it("enables HSTS in production", async () => {
    setNodeEnv("production");
    delete require.cache[require.resolve("../next.config.js")];
    const nextConfig = require("../next.config.js");

    const headerSets = await nextConfig.headers();
    const rootHeaders = headerSets.find((entry: { source: string }) => entry.source === "/:path*")?.headers ?? [];
    const headerMap = Object.fromEntries(rootHeaders.map((entry: { key: string; value: string }) => [entry.key, entry.value]));

    expect(headerMap["Strict-Transport-Security"]).toContain("max-age=31536000");
  });
});
