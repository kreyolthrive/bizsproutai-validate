import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const generateRoadmapMock = vi.fn();

vi.mock("@/src/roadmap", () => ({
  generateRoadmap: generateRoadmapMock,
}));

describe("roadmap route", () => {
  beforeEach(() => {
    generateRoadmapMock.mockReset();
    delete (globalThis as typeof globalThis & { __bizsprRateLimitBuckets?: Map<string, unknown> }).__bizsprRateLimitBuckets;
  });

  it("returns metadata on GET", async () => {
    const { GET } = await import("../app/api/roadmap/route");
    const response = await GET(new NextRequest("http://localhost/api/roadmap"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.required_fields).toContain("idea");
  });

  it("rejects malformed JSON", async () => {
    const { POST } = await import("../app/api/roadmap/route");
    const response = await POST(
      new NextRequest("http://localhost/api/roadmap", {
        method: "POST",
        body: "{",
        headers: {
          "content-type": "application/json",
        },
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid JSON body" });
  });

  it("rejects missing required fields", async () => {
    const { POST } = await import("../app/api/roadmap/route");
    const response = await POST(
      new NextRequest("http://localhost/api/roadmap", {
        method: "POST",
        body: JSON.stringify({ idea: "hello" }),
        headers: {
          "content-type": "application/json",
        },
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Missing required fields: idea, country, businessType",
    });
  });

  it("returns a safe generic error if generation fails", async () => {
    generateRoadmapMock.mockRejectedValue(new Error("internal stack trace"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { POST } = await import("../app/api/roadmap/route");

    const response = await POST(
      new NextRequest("http://localhost/api/roadmap", {
        method: "POST",
        body: JSON.stringify({
          idea: "A mobile service for busy professionals",
          country: "USA",
          businessType: "local_service",
        }),
        headers: {
          "content-type": "application/json",
        },
      })
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Failed to generate roadmap" });
    errorSpy.mockRestore();
  });
});
