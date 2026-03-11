"use client";

import { useLocale } from "next-intl";
import { analytics } from "@/lib/analytics";
import type { Locale } from "@/i18n/config";

interface ValidateButtonProps {
  children: React.ReactNode;
  className?: string;
}

export function ValidateButton({ children, className }: ValidateButtonProps) {
  const locale = useLocale() as Locale;

  const handleClick = () => {
    analytics.ctaValidateClicked({ locale });
  };

  return (
    <a href="#waitlist" onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
