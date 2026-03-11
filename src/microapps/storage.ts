"use client";

import type {
  ContactChannel,
  ContactRecord,
  ContactStatus,
  MicroAppConfig,
  MicroAppSubmission,
  MicroAppType,
} from "@/src/microapps/types";

export const MICRO_APPS_STORAGE_KEY = "bizspr.microapps.v1";
export const MICRO_APP_SUBMISSIONS_STORAGE_KEY = "bizspr.microapps.submissions.v1";
export const CONTACTS_STORAGE_KEY = "bizspr.crm.contacts.v1";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function safeReadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getDefaultMicroAppConfigs(): MicroAppConfig[] {
  return [
    {
      id: "micro-consultation-booking",
      type: "consultation_booking",
      title: "Book a free consultation",
      description:
        "Tell us what you need. We'll confirm the best time by WhatsApp or email.",
      mainOffer: "Consultation call",
      contactMethods: ["whatsapp", "email"],
      serviceOptions: ["Discovery call", "Strategy session", "Consultation"],
      buttonLabel: "Request a consultation",
      thankYouMessage:
        "Thanks! We'll confirm your consultation time by WhatsApp/email.",
      nextStepNote: "You'll hear from us within 24 hours.",
      urlPath: "/book",
      enabled: true,
    },
    {
      id: "micro-service-request",
      type: "service_request",
      title: "Request a service",
      description:
        "Share your location and service need. We'll contact you on WhatsApp/phone with details and pricing.",
      mainOffer: "Local services",
      contactMethods: ["whatsapp", "phone"],
      serviceOptions: ["House cleaning", "Repair", "Installation"],
      buttonLabel: "Send request",
      thankYouMessage:
        "We received your request. We'll contact you on WhatsApp/phone to confirm details and price.",
      nextStepNote: "Fast response during business hours.",
      urlPath: "/request",
      enabled: true,
    },
    {
      id: "micro-waitlist",
      type: "waitlist",
      title: "Join the waitlist",
      description:
        "Join early to get priority access, launch updates, and early-bird benefits.",
      mainOffer: "Early access",
      contactMethods: ["email", "whatsapp"],
      serviceOptions: [],
      buttonLabel: "Join the waitlist",
      thankYouMessage:
        "You're on the list. We'll email/WhatsApp you when we're ready.",
      nextStepNote: "Watch your inbox for early access updates.",
      urlPath: "/waitlist",
      enabled: true,
    },
  ];
}

export function loadMicroAppConfigs(): MicroAppConfig[] {
  const defaults = getDefaultMicroAppConfigs();
  const saved = safeReadJson<MicroAppConfig[]>(MICRO_APPS_STORAGE_KEY, []);
  if (!saved.length) return defaults;

  return defaults.map((item) => {
    const override = saved.find((entry) => entry.type === item.type);
    return override ? { ...item, ...override, type: item.type, urlPath: item.urlPath } : item;
  });
}

export function saveMicroAppConfigs(configs: MicroAppConfig[]) {
  safeWriteJson(MICRO_APPS_STORAGE_KEY, configs);
}

export function getMicroAppConfigByType(type: MicroAppType): MicroAppConfig {
  const configs = loadMicroAppConfigs();
  return configs.find((config) => config.type === type) || getDefaultMicroAppConfigs().find((config) => config.type === type)!;
}

export function loadSubmissions(): MicroAppSubmission[] {
  return safeReadJson<MicroAppSubmission[]>(MICRO_APP_SUBMISSIONS_STORAGE_KEY, []);
}

export function saveSubmissions(submissions: MicroAppSubmission[]) {
  safeWriteJson(MICRO_APP_SUBMISSIONS_STORAGE_KEY, submissions);
}

export function loadContacts(): ContactRecord[] {
  return safeReadJson<ContactRecord[]>(CONTACTS_STORAGE_KEY, []);
}

export function saveContacts(contacts: ContactRecord[]) {
  safeWriteJson(CONTACTS_STORAGE_KEY, contacts);
}

function channelForType(type: MicroAppType): ContactChannel {
  if (type === "consultation_booking") return "micro_app_booking";
  if (type === "service_request") return "micro_app_service_request";
  return "micro_app_waitlist";
}

function statusForType(type: MicroAppType): ContactStatus {
  if (type === "consultation_booking") return "interested";
  if (type === "service_request") return "lead";
  return "lead";
}

export type SubmissionInput = Omit<MicroAppSubmission, "id" | "submittedAt" | "channel" | "status">;

export function appendSubmission(input: SubmissionInput): MicroAppSubmission {
  const submission: MicroAppSubmission = {
    ...input,
    id: uid("submission"),
    submittedAt: nowIso(),
    channel: channelForType(input.microAppType),
    status: statusForType(input.microAppType),
  };

  const submissions = loadSubmissions();
  submissions.unshift(submission);
  saveSubmissions(submissions);

  upsertContactFromSubmission(submission);

  return submission;
}

function composeNotesFromSubmission(submission: MicroAppSubmission): string[] {
  const lines: string[] = [];
  if (submission.microAppType === "consultation_booking") {
    lines.push(`Preferred date/time: ${submission.preferredDateTime || "Not provided"}`);
    lines.push(`Message: ${submission.helpRequest || "Not provided"}`);
  }

  if (submission.microAppType === "service_request") {
    lines.push(`Service type: ${submission.serviceType || "Not provided"}`);
    lines.push(`Preferred time: ${submission.preferredDateTime || "Not provided"}`);
    lines.push(`Description: ${submission.requestDescription || "Not provided"}`);
    if (submission.addressOrNeighborhood) {
      lines.push(`Address/neighborhood: ${submission.addressOrNeighborhood}`);
    }
  }

  if (submission.microAppType === "waitlist") {
    lines.push(`Profile: ${submission.profile || "Not provided"}`);
    lines.push(
      `Answers: ${(submission.qualificationAnswers || []).filter(Boolean).join(" | ") || "Not provided"}`,
    );
  }

  return lines;
}

export function upsertContactFromSubmission(submission: MicroAppSubmission): ContactRecord {
  const contacts = loadContacts();
  const keyEmail = submission.email?.trim().toLowerCase();
  const keyPhone = submission.phone?.trim();

  const existingIndex = contacts.findIndex((contact) => {
    if (keyEmail && contact.email?.toLowerCase() === keyEmail) return true;
    if (keyPhone && contact.phone === keyPhone) return true;
    return false;
  });

  const noteBlock = composeNotesFromSubmission(submission).join("\n");
  const stampedNotes = `[${new Date(submission.submittedAt).toLocaleString()}] ${noteBlock}`;

  if (existingIndex >= 0) {
    const existing = contacts[existingIndex];
    const merged: ContactRecord = {
      ...existing,
      name: submission.name || existing.name,
      email: submission.email || existing.email,
      phone: submission.phone || existing.phone,
      channel: submission.channel,
      status: submission.status,
      sourceMicroAppType: submission.microAppType,
      notes: existing.notes ? `${existing.notes}\n\n${stampedNotes}` : stampedNotes,
      updatedAt: nowIso(),
    };

    contacts[existingIndex] = merged;
    saveContacts(contacts);
    return merged;
  }

  const created: ContactRecord = {
    id: uid("contact"),
    name: submission.name,
    email: submission.email,
    phone: submission.phone,
    channel: submission.channel,
    status: submission.status,
    sourceMicroAppType: submission.microAppType,
    notes: stampedNotes,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  contacts.unshift(created);
  saveContacts(contacts);
  return created;
}
