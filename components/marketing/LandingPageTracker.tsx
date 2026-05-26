"use client";

import { useEffect } from "react";
import { trackMetaStandard } from "@/lib/analytics/metaEvents";

export function LandingPageTracker() {
  useEffect(() => {
    trackMetaStandard("ViewContent", {
      content_name: "LandingPage",
      content_type: "product",
      value: 1.0,
      currency: "USD",
    });
  }, []);
  return null;
}
