"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { analytics } from "@/lib/analytics";

export function LanguageSwitcher() {
  const params = useParams();
  const currentLocale = (params?.locale as Locale) ?? "en";
  const pathname = usePathname(); // e.g. "/en/validate" or "/fr"
  const router = useRouter();

  // Strip the current locale prefix so we can prepend the new one.
  // "/en/validate" → "/validate"   "/en" → "/"
  const pathWithoutLocale =
    pathname.replace(new RegExp(`^/${currentLocale}(/|$)`), "/") || "/";

  function handleLocaleChange(newLocale: Locale) {
    if (newLocale === currentLocale) return;
    analytics.languageChanged(currentLocale, newLocale);
    const target =
      pathWithoutLocale === "/"
        ? `/${newLocale}`
        : `/${newLocale}${pathWithoutLocale}`;
    router.push(target);
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
      {locales.map((locale) => {
        const active = locale === currentLocale;

        return (
          <button
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={
              active
                ? "rounded-full min-h-11 bg-emerald-300 px-3 py-2 text-sm font-semibold text-slate-950"
                : "rounded-full min-h-11 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
            }
            aria-current={active ? "page" : undefined}
            aria-label={localeNames[locale]}
          >
            {locale.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
