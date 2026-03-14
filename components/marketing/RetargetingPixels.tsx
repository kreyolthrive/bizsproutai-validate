"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

type FbqFn = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: (...args: unknown[]) => void;
};

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
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

const metaPixelId = cleanEnv(process.env.NEXT_PUBLIC_META_PIXEL_ID);
const linkedInPartnerId = cleanEnv(process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID);
const googleAdsId = cleanEnv(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID);

export function RetargetingPixels() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const metaInitialTracked = useRef(false);
  const linkedInInitialTracked = useRef(false);

  useEffect(() => {
    const path = pathname || "/";
    const query = searchParams?.toString();
    const pagePath = query ? `${path}?${query}` : path;
    const pageLocation = typeof window !== "undefined"
      ? `${window.location.origin}${pagePath}`
      : pagePath;

    if (metaPixelId && window.fbq) {
      if (metaInitialTracked.current) {
        window.fbq("track", "PageView");
      } else {
        metaInitialTracked.current = true;
      }
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

  if (!metaPixelId && !linkedInPartnerId && !googleAdsId) {
    return null;
  }

  return (
    <>
      {metaPixelId ? (
        <>
          <Script id="meta-pixel-base" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s){
                if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)
              }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      ) : null}

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
