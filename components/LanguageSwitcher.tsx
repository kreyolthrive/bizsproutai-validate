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
    <div className="flex items-center justify-center gap-1 py-1 text-sm">
      {locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          onClick={() => handleLanguageChange(locale)}
          className={
            locale === currentLocale
              ? "rounded-md bg-white/20 px-2.5 py-1 font-semibold text-white"
              : "rounded-md px-2.5 py-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
          }
          aria-current={locale === currentLocale ? "page" : undefined}
        >
          <span className="sr-only">{localeNames[locale]}</span>
          {locale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
