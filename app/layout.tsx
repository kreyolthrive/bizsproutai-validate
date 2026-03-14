import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PostHogProvider } from "@/lib/analytics";
import { RetargetingPixels } from "@/components/marketing/RetargetingPixels";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PostHogProvider>
      {children}
      <Suspense fallback={null}>
        <RetargetingPixels />
      </Suspense>
      {/* Vercel Analytics - privacy-respecting, production-grade */}
      <Analytics />
      {/* Vercel Speed Insights - Core Web Vitals monitoring */}
      <SpeedInsights />
    </PostHogProvider>
  );
}
