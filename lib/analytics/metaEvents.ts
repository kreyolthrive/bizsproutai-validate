// Thin wrappers around the Meta Pixel fbq() global.
// Safe to call server-side (no-ops when window is undefined).
// Window.fbq type is declared in RetargetingPixels.tsx.

function fbq(method: string, event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq) return;
  if (data) {
    window.fbq(method, event, data);
  } else {
    window.fbq(method, event);
  }
}

// Standard Meta events (e.g. Lead, ViewContent)
export function trackMetaStandard(
  event: string,
  data?: Record<string, unknown>
) {
  fbq("track", event, data);
}

// Custom Meta events (e.g. ValidationStart, ValidationComplete)
export function trackMeta(event: string, data?: Record<string, unknown>) {
  fbq("trackCustom", event, data);
}
