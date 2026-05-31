// Thin wrappers around the Meta Pixel fbq() global.
// Safe to call server-side (no-ops when window is undefined).
// Window.fbq type is declared in RetargetingPixels.tsx.

// Only fire pixel events on the production domain — never from localhost,
// preview branches, or any other non-production origin.
const isProductionTrackingDomain =
  typeof window !== "undefined" &&
  window.location.hostname === "validate.bizsproutai.com";

function fbq(method: string, event: string, data?: Record<string, unknown>, eventID?: string) {
  if (typeof window === "undefined" || !window.fbq) return;
  if (!isProductionTrackingDomain) return;
  if (eventID) {
    window.fbq(method, event, data ?? {}, { eventID });
  } else if (data) {
    window.fbq(method, event, data);
  } else {
    window.fbq(method, event);
  }
}

// Standard Meta events (e.g. Lead, ViewContent)
export function trackMetaStandard(
  event: string,
  data?: Record<string, unknown>,
  eventID?: string
) {
  fbq("track", event, data, eventID);
}

// Custom Meta events (e.g. ValidationStart, ValidationComplete)
export function trackMeta(event: string, data?: Record<string, unknown>, eventID?: string) {
  fbq("trackCustom", event, data, eventID);
}
