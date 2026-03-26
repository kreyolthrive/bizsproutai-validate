"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { analytics } from "@/lib/analytics";

export function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale;
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale !== currentLocale) {
      analytics.languageChanged(currentLocale, newLocale);
    }
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[rgba(26,58,42,0.06)] bg-[rgba(248,244,237,0.92)] p-1">
      {locales.map((locale) => {
        const active = locale === currentLocale;

        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            onClick={() => handleLanguageChange(locale)}
            className={
              active
                ? "rounded-full bg-[var(--landing-green-deep)] px-4 py-2 text-sm font-semibold text-white"
                : "rounded-full px-4 py-2 text-sm font-semibold text-[var(--landing-muted)] transition hover:bg-[rgba(26,58,42,0.06)] hover:text-[var(--landing-green-deep)]"
            }
            aria-current={active ? "page" : undefined}
          >
            <span className="sr-only">{localeNames[locale]}</span>
            {locale.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
