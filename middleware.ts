import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed", // /fr, /ht, /es — but / stays English
});

export const config = {
  // Match all pathnames except:
  // - API routes (/api/*)
  // - Next.js internals (/_next/*)
  // - Static files (*.ico, *.png, etc.)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
