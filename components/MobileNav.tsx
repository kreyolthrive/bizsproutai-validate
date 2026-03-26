"use client";

import { useState, useEffect, useCallback } from "react";

type MobileNavProps = {
  links: Array<{ href: string; label: string }>;
  ctaHref: string;
  ctaLabel: string;
};

export function MobileNav({ links, ctaHref, ctaLabel }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--landing-green-deep)] transition hover:bg-[rgba(26,58,42,0.06)]"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />
          <nav
            role="navigation"
            aria-label="Mobile navigation"
            className="fixed inset-x-0 top-[72px] z-50 mx-4 rounded-2xl border border-[rgba(26,58,42,0.1)] bg-[var(--warm-white)] p-6 shadow-xl"
          >
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={close}
                    className="block rounded-xl px-4 py-3 text-base font-medium text-[var(--landing-muted)] transition hover:bg-[rgba(26,58,42,0.04)] hover:text-[var(--landing-green-deep)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-[rgba(26,58,42,0.08)] pt-4">
              <a
                href={ctaHref}
                onClick={close}
                className="block w-full rounded-full bg-[var(--landing-green-deep)] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--landing-green-mid)]"
              >
                {ctaLabel} →
              </a>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
