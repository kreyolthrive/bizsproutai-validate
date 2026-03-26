"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";

const DISMISS_KEY = "bizsprout-exit-cta-dismissed";
const SHOWN_KEY = "bizsprout-exit-cta-shown";
const EXCLUDED_PATHS = ["/action-plan", "/contact", "/book"];

type Props = {
  locale: string;
};

function getCopy(locale: string) {
  const normalized = locale.toLowerCase().split("-")[0];

  if (normalized === "fr") {
    return {
      kicker: "Avant de partir",
      title: "Vous voulez de la clarté sur votre prochaine étape ?",
      body:
        "Recevez un plan d'action rapide selon votre activité, vos priorités et votre goulot d'étranglement actuel.",
      primary: "Parler à l'équipe",
      secondary: "Appeler maintenant",
      dismiss: "Fermer",
    };
  }

  if (normalized === "es") {
    return {
      kicker: "Antes de irte",
      title: "¿Quieres claridad sobre tu próximo paso?",
      body:
        "Recibe un plan de acción rápido según tu negocio, tus prioridades y tu cuello de botella actual.",
      primary: "Hablar con el equipo",
      secondary: "Llamar ahora",
      dismiss: "Cerrar",
    };
  }

  if (normalized === "ht") {
    return {
      kicker: "Anvan ou ale",
      title: "Ou vle plis klète sou pwochen etap ou a?",
      body:
        "Jwenn yon plan aksyon rapid ki baze sou biznis ou, priyorite ou, ak blokaj ou genyen kounye a.",
      primary: "Pale ak ekip la",
      secondary: "Rele kounye a",
      dismiss: "Fèmen",
    };
  }

  if (normalized === "pt") {
    return {
      kicker: "Antes de sair",
      title: "Quer clareza sobre o seu próximo passo?",
      body:
        "Receba um plano de ação rápido com base no seu negócio, prioridades e gargalo atual.",
      primary: "Falar com a equipe",
      secondary: "Ligar agora",
      dismiss: "Fechar",
    };
  }

  return {
    kicker: "Before you go",
    title: "Want clarity on your next move?",
    body:
      "Get a quick action plan based on your business, your priorities, and your current bottleneck.",
    primary: "Talk to the team",
    secondary: "Call now",
    dismiss: "Close",
  };
}

function trackRetargetingIntent() {
  if (typeof window === "undefined") return;

  (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq?.(
    "trackCustom",
    "ExitIntentShown"
  );
  (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag?.("event", "exit_intent_shown", {
    event_category: "engagement",
    event_label: "floating_cta",
  });
}

function trackRetargetingClick() {
  if (typeof window === "undefined") return;

  (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq?.(
    "track",
    "Lead"
  );
  (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag?.("event", "generate_lead", {
    event_category: "conversion",
    event_label: "floating_cta",
  });
}

export function FloatingExitCta({ locale }: Props) {
  const pathname = usePathname();
  const copy = useMemo(() => getCopy(locale), [locale]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentPath = pathname || `/${locale}`;
    if (EXCLUDED_PATHS.some((segment) => currentPath.includes(segment))) {
      setOpen(false);
      return;
    }

    if (window.sessionStorage.getItem(DISMISS_KEY) === "1") {
      return;
    }

    let shown = window.sessionStorage.getItem(SHOWN_KEY) === "1";
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

    const reveal = () => {
      if (shown) return;
      shown = true;
      window.sessionStorage.setItem(SHOWN_KEY, "1");
      setOpen(true);
      trackRetargetingIntent();
    };

    const handleMouseOut = (event: MouseEvent) => {
      if (isCoarsePointer) return;
      if (event.clientY > 16) return;
      if (event.relatedTarget instanceof Node) return;
      reveal();
    };

    const mobileTimer = window.setTimeout(() => {
      if (isCoarsePointer && window.scrollY > 220) {
        reveal();
      }
    }, 18000);

    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mouseout", handleMouseOut);
      window.clearTimeout(mobileTimer);
    };
  }, [locale, pathname]);

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    }
    setOpen(false);
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-[120] w-[min(360px,calc(100vw-24px))] rounded-[28px] border border-[rgba(26,58,42,0.1)] bg-[rgba(253,250,245,0.96)] p-5 shadow-[0_28px_90px_rgba(26,58,42,0.18)] backdrop-blur-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--landing-green-light)]">
            {copy.kicker}
          </p>
          <h3 className="mt-3 text-2xl font-semibold leading-tight text-[var(--landing-green-deep)]">
            {copy.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-full border border-[rgba(26,58,42,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--landing-muted)] transition hover:border-[var(--landing-green-deep)] hover:text-[var(--landing-green-deep)]"
          aria-label={copy.dismiss}
        >
          ×
        </button>
      </div>

      <p className="mt-4 text-sm leading-7 text-[var(--landing-muted)]">{copy.body}</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/contact"
          onClick={trackRetargetingClick}
          className="inline-flex rounded-full bg-[var(--landing-green-deep)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--landing-green-mid)]"
        >
          {copy.primary} →
        </Link>
        <a
          href="tel:+18776007007"
          onClick={trackRetargetingClick}
          className="inline-flex rounded-full border border-[rgba(26,58,42,0.18)] px-5 py-3 text-sm font-semibold text-[var(--landing-green-deep)] transition hover:border-[var(--landing-green-deep)] hover:bg-[rgba(26,58,42,0.04)]"
        >
          {copy.secondary} →
        </a>
      </div>
    </div>
  );
}
