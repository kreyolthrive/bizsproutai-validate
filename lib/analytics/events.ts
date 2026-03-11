import type { Locale } from "@/i18n/config";

// Event types for tracking
export type AnalyticsEvent =
  // Page & Navigation
  | { name: "page_view"; properties: PageViewProperties }
  | { name: "language_changed"; properties: LanguageChangedProperties }
  // Validation Funnel
  | { name: "idea_submitted"; properties: IdeaSubmittedProperties }
  | { name: "validation_completed"; properties: ValidationCompletedProperties }
  | { name: "fix_iteration_triggered"; properties: FixIterationProperties }
  // Conversion Actions
  | { name: "cta_validate_clicked"; properties: BaseProperties }
  | { name: "cta_download_report_clicked"; properties: BaseProperties }
  | { name: "cta_start_launch_clicked"; properties: BaseProperties }
  | { name: "build_flow_triggered"; properties: BuildFlowProperties };

// Property types
interface BaseProperties {
  locale: Locale;
  country?: string;
  category?: string;
}

interface PageViewProperties extends BaseProperties {
  path: string;
  referrer?: string;
}

interface LanguageChangedProperties {
  from: Locale;
  to: Locale;
}

interface IdeaSubmittedProperties extends BaseProperties {
  category_detected?: string;
  country_detected?: string;
}

interface ValidationCompletedProperties extends BaseProperties {
  status: "GO" | "FIX" | "STOP";
}

interface FixIterationProperties extends BaseProperties {
  iteration: number;
}

interface BuildFlowProperties extends BaseProperties {
  category: string;
}

// Analytics client interface
interface AnalyticsClient {
  capture: (eventName: string, properties?: Record<string, unknown>) => void;
}

// Global PostHog client (set by provider)
let posthogClient: AnalyticsClient | null = null;

export function setAnalyticsClient(client: AnalyticsClient | null) {
  posthogClient = client;
}

// Track any analytics event
export function trackEvent(event: AnalyticsEvent) {
  const properties = event.properties as unknown as Record<string, unknown>;

  // PostHog tracking
  if (posthogClient) {
    posthogClient.capture(event.name, properties);
  }

  // Vercel Analytics (if available)
  if (typeof window !== "undefined" && (window as any).va) {
    (window as any).va("event", {
      name: event.name,
      ...properties,
    });
  }

  // Development logging
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", event.name, event.properties);
  }
}

// Convenience functions for common events
export const analytics = {
  pageView(props: Omit<PageViewProperties, "name">) {
    trackEvent({ name: "page_view", properties: props });
  },

  languageChanged(from: Locale, to: Locale) {
    trackEvent({ name: "language_changed", properties: { from, to } });
  },

  ideaSubmitted(props: Omit<IdeaSubmittedProperties, "name">) {
    trackEvent({ name: "idea_submitted", properties: props });
  },

  validationCompleted(props: Omit<ValidationCompletedProperties, "name">) {
    trackEvent({ name: "validation_completed", properties: props });
  },

  fixIterationTriggered(props: Omit<FixIterationProperties, "name">) {
    trackEvent({ name: "fix_iteration_triggered", properties: props });
  },

  ctaValidateClicked(props: BaseProperties) {
    trackEvent({ name: "cta_validate_clicked", properties: props });
  },

  ctaDownloadReportClicked(props: BaseProperties) {
    trackEvent({ name: "cta_download_report_clicked", properties: props });
  },

  ctaStartLaunchClicked(props: BaseProperties) {
    trackEvent({ name: "cta_start_launch_clicked", properties: props });
  },

  buildFlowTriggered(props: BuildFlowProperties) {
    trackEvent({ name: "build_flow_triggered", properties: props });
  },
};
