import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import localFont from "next/font/local";
import Script from "next/script";
import { WebVitalsDebug } from "@/components/WebVitalsDebug";
import { PostHogProvider } from "@/lib/analytics";
import { META_PIXEL_IDS } from "@/lib/analytics/metaPixelConfig";
import "./globals.css";

const dmSans = localFont({
  src: [
    {
      path: "../node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/dm-sans/files/dm-sans-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-body",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});

const syne = localFont({
  src: [
    {
      path: "../node_modules/@fontsource/syne/files/syne-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/syne/files/syne-latin-800-normal.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});

const instrumentSerif = localFont({
  src: "../node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2",
  variable: "--font-serif",
  display: "swap",
  fallback: ["Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={`${dmSans.variable} ${syne.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Meta Pixel — BizSproutAI Launch
            Guard: only initialise on the production domain so localhost and
            preview deployments never send events to the live pixel. */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
          if (window.location.hostname === 'validate.bizsproutai.com') {
            var metaPixelIds = ${JSON.stringify(META_PIXEL_IDS)};
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            metaPixelIds.forEach(function(pixelId) {
              fbq('init', pixelId);
            });
            fbq('track', 'PageView');
          }
        `}
        </Script>
        {META_PIXEL_IDS.map((pixelId) => (
          <noscript key={pixelId}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img height="1" width="1" style={{display:"none"}} alt=""
              src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        ))}
      </head>
      <body className="font-[family:var(--font-body)] text-[var(--ink)] antialiased">
        <PostHogProvider>
          {children}
          <WebVitalsDebug />
          <Analytics />
          <SpeedInsights />
        </PostHogProvider>
      </body>
    </html>
  );
}
