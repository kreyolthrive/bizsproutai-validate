"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackMeta } from "@/lib/analytics/metaEvents";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  choices: string[];
  clarityLabel: string;
  clarityQuestion: string;
  validationCta: string;
  widgetNote: string;
  locale: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ValidationWidget({
  choices,
  clarityLabel,
  clarityQuestion,
  validationCta,
  widgetNote,
  locale,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);

  function handleSubmit() {
    if (selected === null) return;
    trackMeta("ValidationStart", { stage: selected });
    router.push(`/${locale}/validate?stage=${selected}`);
  }

  return (
    <div className="rounded-[24px] bg-[var(--landing-green-deep)] p-6 text-white shadow-[0_20px_50px_rgba(26,58,42,0.16)] sm:p-7">
      <div className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--landing-sprout)]">
        {clarityLabel}
      </div>
      <p className="max-w-md font-[family:var(--font-serif)] text-[1.3rem] leading-[1.22] sm:text-[1.45rem]">
        {clarityQuestion}
      </p>

      <div className="mt-5 space-y-2.5">
        {choices.map((label, index) => (
          <button
            key={label}
            onClick={() => setSelected(index)}
            className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3.5 text-left text-[0.9rem] transition ${
              selected === index
                ? "border-[rgba(126,200,80,0.65)] bg-[rgba(126,200,80,0.22)]"
                : "border-white/10 bg-white/[0.06] hover:border-white/20 hover:bg-white/[0.1]"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 flex-shrink-0 rounded-full transition ${
                selected === index ? "bg-[var(--landing-sprout)]" : "bg-white/25"
              }`}
            />
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={selected === null}
        className="mt-6 w-full rounded-full bg-[var(--landing-sprout)] px-6 py-4 text-[1rem] font-bold text-[var(--landing-ink)] shadow-[0_4px_20px_rgba(126,200,80,0.35)] transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_8px_30px_rgba(126,200,80,0.45)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        {validationCta} →
      </button>

      <p className="mt-3 text-center text-[0.75rem] text-white/40">
        {widgetNote}
      </p>
    </div>
  );
}
