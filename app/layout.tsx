import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PostHogProvider } from "@/lib/analytics";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        {/* Meta Pixel — BizSproutAI Launch (ID: 1089915446436683)
            Guard: only initialise on the production domain so localhost and
            preview deployments never send events to the live pixel. */}
        <script dangerouslySetInnerHTML={{ __html: `
          if (window.location.hostname === 'validate.bizsproutai.com') {
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1089915446436683');
            fbq('track', 'PageView');
          }
        ` }} />
        <noscript>
          <img height="1" width="1" style={{display:"none"}} alt=""
            src="https://www.facebook.com/tr?id=1089915446436683&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      <body className="font-[family:var(--font-body)] text-[var(--ink)] antialiased">
        <PostHogProvider>
          {children}
          <Analytics />
          <SpeedInsights />
        </PostHogProvider>
      </body>
    </html>
  );
}
