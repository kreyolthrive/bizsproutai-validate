import { createHash } from "node:crypto";

const CAPI_URL = "https://graph.facebook.com/v21.0";

function sha256hex(value: string): string {
  return createHash("sha256").update(value.toLowerCase().trim()).digest("hex");
}

interface CapiUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string | null;
  fbp?: string | null;
}

export interface CapiEventPayload {
  eventName: string;
  eventTime: number;
  eventId: string;
  eventSourceUrl?: string | null;
  userData: CapiUserData;
  customData?: Record<string, unknown>;
}

function buildUserData(u: CapiUserData): Record<string, unknown> {
  const d: Record<string, unknown> = {};
  if (u.email) d.em = sha256hex(u.email);
  if (u.firstName) d.fn = sha256hex(u.firstName);
  if (u.lastName) d.ln = sha256hex(u.lastName);
  if (u.phone) d.ph = sha256hex(u.phone.replace(/\D/g, ""));
  if (u.city) d.ct = sha256hex(u.city);
  if (u.state) d.st = sha256hex(u.state);
  if (u.zip) d.zp = sha256hex(u.zip);
  if (u.country) d.country = sha256hex(u.country);
  if (u.clientIpAddress) d.client_ip_address = u.clientIpAddress;
  if (u.clientUserAgent) d.client_user_agent = u.clientUserAgent;
  if (u.fbc) d.fbc = u.fbc;
  if (u.fbp) d.fbp = u.fbp;
  return d;
}

export function makeCapiEventId(requestId: string, suffix: string): string {
  return `${requestId}-${suffix}`;
}

export async function sendCapiEvent(payload: CapiEventPayload): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) {
    console.warn(
      JSON.stringify({
        event: "capi_disabled",
        reason: !pixelId ? "META_PIXEL_ID not set" : "META_CAPI_ACCESS_TOKEN not set",
        event_name: payload.eventName,
      })
    );
    return;
  }

  const event: Record<string, unknown> = {
    event_name: payload.eventName,
    event_time: payload.eventTime,
    event_id: payload.eventId,
    action_source: "website",
    user_data: buildUserData(payload.userData),
  };
  if (payload.eventSourceUrl) event.event_source_url = payload.eventSourceUrl;
  if (payload.customData) event.custom_data = payload.customData;

  const requestBody: Record<string, unknown> = { data: [event] };
  const testCode = process.env.META_CAPI_TEST_CODE;
  if (testCode) requestBody.test_event_code = testCode;

  const url = `${CAPI_URL}/${pixelId}/events?access_token=${accessToken}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    let body = "";
    try { body = await res.text(); } catch { /* ignore read error */ }
    throw new Error(`Meta CAPI ${res.status} ${res.statusText}: ${body}`);
  }
}
