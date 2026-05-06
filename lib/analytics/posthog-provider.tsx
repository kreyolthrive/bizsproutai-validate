"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { setAnalyticsClient } from "./events";

// Initialize PostHog (only in browser)
if (typeof window !== "undefined") {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: "identified_only",
      capture_pageview: false, // We handle this manually
      capture_pageleave: true,
      persistence: "localStorage+cookie",
      // Privacy-respecting defaults
      respect_dnt: true,
      disable_session_recording: true, // Enable only if needed
    });

    // Connect to our events utility
    setAnalyticsClient(posthog);
  }
}

// Page view tracker component
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthogInstance = usePostHog();

  useEffect(() => {
    if (pathname && posthogInstance) {
      let url = window.origin + pathname;
      if (searchParams?.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthogInstance.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams, posthogInstance]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  // If no PostHog key, just render children without the provider
  if (!posthogKey) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
