import { afterEach, describe, expect, it } from "vitest";
import { buildCorsHeaders, resolveCorsOrigin } from "../src/security/cors";

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;
const ORIGINAL_ALLOWED_ORIGINS = process.env.CORS_ALLOWED_ORIGINS;

function setNodeEnv(value: string | undefined) {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

describe("CORS security", () => {
  afterEach(() => {
    setNodeEnv(ORIGINAL_NODE_ENV);
    process.env.CORS_ALLOWED_ORIGINS = ORIGINAL_ALLOWED_ORIGINS;
  });

  it("allows only configured origins", () => {
    process.env.CORS_ALLOWED_ORIGINS = "https://bizsproutai.com, https://admin.bizsproutai.com";

    expect(resolveCorsOrigin("https://bizsproutai.com")).toBe("https://bizsproutai.com");
    expect(resolveCorsOrigin("https://evil.example")).toBeNull();
  });

  it("does not emit allow-origin for untrusted origins", () => {
    process.env.CORS_ALLOWED_ORIGINS = "https://bizsproutai.com";

    const headers = buildCorsHeaders("https://evil.example");

    expect(headers["Access-Control-Allow-Origin"]).toBeUndefined();
    expect(headers["Access-Control-Allow-Methods"]).toBe("GET,POST,DELETE,OPTIONS");
    expect(headers.Vary).toBe("Origin");
  });
});
