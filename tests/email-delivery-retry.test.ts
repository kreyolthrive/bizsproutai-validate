// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendMailMock = vi.fn();
const createTransportMock = vi.fn(() => ({
  sendMail: sendMailMock,
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: createTransportMock,
  },
}));

const ORIGINAL_SMTP_USER = process.env.IONOS_SMTP_USER;
const ORIGINAL_SMTP_PASS = process.env.IONOS_SMTP_PASS;
const ORIGINAL_FROM = process.env.IONOS_FROM_EMAIL;
const ORIGINAL_OWNER = process.env.IONOS_OWNER_EMAIL;

describe("email delivery fallback retry", () => {
  beforeEach(() => {
    process.env.IONOS_SMTP_USER = "smtp@example.com";
    process.env.IONOS_SMTP_PASS = "secret";
    process.env.IONOS_FROM_EMAIL = "info@example.com";
    process.env.IONOS_OWNER_EMAIL = "owner@example.com";
    sendMailMock.mockReset();
    createTransportMock.mockClear();
  });

  afterEach(() => {
    process.env.IONOS_SMTP_USER = ORIGINAL_SMTP_USER;
    process.env.IONOS_SMTP_PASS = ORIGINAL_SMTP_PASS;
    process.env.IONOS_FROM_EMAIL = ORIGINAL_FROM;
    process.env.IONOS_OWNER_EMAIL = ORIGINAL_OWNER;
    vi.resetModules();
  });

  it("falls back to attachment-free retry when SMTP rejects attachments", async () => {
    sendMailMock.mockImplementation(async (mail: { attachments?: unknown[] }) => {
      if (mail.attachments?.length) {
        throw new Error("attachments blocked");
      }

      return { messageId: "ok-1", response: "250 accepted" };
    });

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { sendValidationEmails } = await import("../lib/email/ionos");

    const result = await sendValidationEmails({
      userEmail: "founder@example.com",
      idea: "A mobile cleaning service for busy households",
      locale: "en",
      result: {
        status: "GO",
        overallScore: 4.2,
        country: { code: "US", name: "United States" },
        category: "local_service",
        summary: { oneLiner: "Promising local-service opportunity" },
        nextActions: ["Call five prospects"],
        framework: { label: "General" },
        meta: { generatedAt: "2026-03-13T00:00:00.000Z" },
      } as any,
      report: {
        filename: "report.txt",
        text: "report body",
        generatedAt: "2026-03-13T00:00:00.000Z",
        pdf: {
          filename: "report.pdf",
          bytes: new Uint8Array([1, 2, 3]),
        },
      },
    });

    expect(result.attempted).toBe(true);
    expect(result.sentToOwner).toBe(true);
    expect(result.sentToUser).toBe(true);
    expect(sendMailMock).toHaveBeenCalledTimes(4);
    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
