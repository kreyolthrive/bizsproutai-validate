import { beforeEach, describe, expect, it } from "vitest";
import {
  appendSubmission,
  getMicroAppConfigByType,
  loadContacts,
  loadSubmissions,
  loadMicroAppConfigs,
  saveMicroAppConfigs,
} from "../src/microapps/storage";

describe("micro-app storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates a submission and a linked contact", () => {
    appendSubmission({
      microAppType: "service_request",
      microAppTitle: "Request a service",
      name: "Jamie Rivera",
      phone: "555-0100",
      serviceType: "House cleaning",
      requestDescription: "Need help with a move-out clean.",
    });

    const submissions = loadSubmissions();
    const contacts = loadContacts();

    expect(submissions).toHaveLength(1);
    expect(contacts).toHaveLength(1);
    expect(submissions[0]?.status).toBe("lead");
    expect(contacts[0]?.channel).toBe("micro_app_service_request");
    expect(contacts[0]?.notes).toContain("Service type: House cleaning");
  });

  it("updates an existing contact instead of duplicating it", () => {
    appendSubmission({
      microAppType: "waitlist",
      microAppTitle: "Join the waitlist",
      name: "Alex Morgan",
      email: "alex@example.com",
      profile: "Freelancer",
      qualificationAnswers: ["Need launch support"],
    });

    appendSubmission({
      microAppType: "consultation_booking",
      microAppTitle: "Book a free consultation",
      name: "Alex Morgan",
      email: "alex@example.com",
      preferredDateTime: "Friday afternoon",
      helpRequest: "Need help pricing the offer",
    });

    const submissions = loadSubmissions();
    const contacts = loadContacts();

    expect(submissions).toHaveLength(2);
    expect(contacts).toHaveLength(1);
    expect(contacts[0]?.channel).toBe("micro_app_booking");
    expect(contacts[0]?.status).toBe("interested");
    expect(contacts[0]?.notes).toContain("Profile: Freelancer");
    expect(contacts[0]?.notes).toContain("Preferred date/time: Friday afternoon");
  });

  it("preserves fixed routing fields when configs are customized", () => {
    const configs = loadMicroAppConfigs().map((config) =>
      config.type === "waitlist"
        ? {
            ...config,
            title: "VIP waitlist",
            enabled: false,
            urlPath: "/book" as const,
          }
        : config
    );

    saveMicroAppConfigs(configs);

    const waitlist = getMicroAppConfigByType("waitlist");

    expect(waitlist.title).toBe("VIP waitlist");
    expect(waitlist.enabled).toBe(false);
    expect(waitlist.urlPath).toBe("/waitlist");
  });
});
