"use client";

import { useEffect } from "react";

type ClsAttributionMetric = {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  attribution?: {
    largestShiftTarget?: string;
    largestShiftTime?: number;
    largestShiftValue?: number;
    loadState?: string;
  };
};

export function WebVitalsDebug() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let active = true;

    import("web-vitals/attribution")
      .then(({ onCLS }) => {
        if (!active) return;

        onCLS(
          (metric: ClsAttributionMetric) => {
            if (metric.value === 0) return;
            console.debug("[web-vitals:CLS]", {
              value: metric.value,
              rating: metric.rating,
              target: metric.attribution?.largestShiftTarget,
              shiftValue: metric.attribution?.largestShiftValue,
              shiftTime: metric.attribution?.largestShiftTime,
              loadState: metric.attribution?.loadState,
            });
          },
          { reportAllChanges: true },
        );
      })
      .catch(() => {
        // Keep development diagnostics non-blocking.
      });

    return () => {
      active = false;
    };
  }, []);

  return null;
}
