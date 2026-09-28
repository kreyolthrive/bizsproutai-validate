"use client";

import { useState, useEffect, useRef, useId } from "react";

type MobileNavProps = {
  links: Array<{ href: string; label: string }>;
  ctaHref: string;
  ctaLabel: string;
  openLabel: string;
  closeLabel: string;
};

export function MobileNav({
  links,
  ctaHref,
  ctaLabel,
  openLabel,
  closeLabel,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
    };
  }, [open]);

  return (
    <div ref={root} className="xl:hidden">
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? closeLabel : openLabel}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-white hover:bg-white/10"
      >
        <span aria-hidden="true" className="text-2xl">
          {open ? "×" : "☰"}
        </span>
      </button>
      {open && (
        <nav
          id={panelId}
          aria-label={openLabel}
          className="absolute inset-x-4 top-full max-h-[65vh] overflow-y-auto rounded-2xl border border-white/15 bg-[#111a2e] p-4 text-white shadow-xl"
        >
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 hover:bg-white/10"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={ctaHref}
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-xl bg-emerald-300 px-4 py-3 text-center font-semibold text-slate-950"
          >
            {ctaLabel} <span aria-hidden="true">→</span>
          </a>
        </nav>
      )}
    </div>
  );
}
