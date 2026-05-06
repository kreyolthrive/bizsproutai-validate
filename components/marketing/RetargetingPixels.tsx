"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

// Meta Pixel is initialized directly in [locale]/layout.tsx with hardcoded ID.
// This component handles SPA route-change PageViews + LinkedIn/Google Ads init.

const META_PIXEL_ID = "1089915446436683";

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
    };
    _fbq?: typeof window.fbq;
    lintrk?: (event: string, data?: Record<string, unknown>) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    _linkedin_partner_id?: string;
    _linkedin_data_partner_ids?: string[];
  }
}

function cleanEnv(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

const linkedInPartnerId = cleanEnv(process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID);
const googleAdsId = cleanEnv(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID);

export function RetargetingPixels() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const linkedInInitialTracked = useRef(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip initial render — the inline init script in layout.tsx fires
    // fbq('init') + fbq('track', 'PageView') synchronously on first load.
    // This component only fires PageView on SPA route changes after that.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const path = pathname || "/";
    const query = searchParams?.toString();
    const pagePath = query ? `${path}?${query}` : path;
    const pageLocation = typeof window !== "undefined"
      ? `${window.location.origin}${pagePath}`
      : pagePath;

    if (window.fbq) {
      window.fbq("track", "PageView");
    }

    if (linkedInPartnerId && window.lintrk) {
      if (linkedInInitialTracked.current) {
        window.lintrk("track", {});
      } else {
        linkedInInitialTracked.current = true;
      }
    }

    if (googleAdsId && window.gtag) {
      window.gtag("event", "page_view", {
        send_to: googleAdsId,
        page_path: pagePath,
        page_location: pageLocation,
      });
    }
  }, [pathname, searchParams]);

  return (
    <>
      {linkedInPartnerId ? (
        <>
          <Script id="linkedin-insight-base" strategy="afterInteractive">
            {`
              _linkedin_partner_id = "${linkedInPartnerId}";
              window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
              window._linkedin_data_partner_ids.push(_linkedin_partner_id);
            `}
          </Script>
          <Script
            id="linkedin-insight-loader"
            strategy="afterInteractive"
            src="https://snap.licdn.com/li.lms-analytics/insight.min.js"
          />
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://px.ads.linkedin.com/collect/?pid=${linkedInPartnerId}&fmt=gif`}
            />
          </noscript>
        </>
      ) : null}

      {googleAdsId ? (
        <>
          <Script
            id="google-ads-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
          />
          <Script id="google-ads-base" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = window.gtag || gtag;
              gtag('js', new Date());
              gtag('config', '${googleAdsId}', { send_page_view: false });
            `}
          </Script>
        </>
      ) : null}
    </>
  );
}

export { META_PIXEL_ID };
