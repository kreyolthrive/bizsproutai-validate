"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackMeta } from "@/lib/analytics/metaEvents";

interface Props {
  locale: string;
  placeholder: string;
  cta: string;
  /** Unique DOM id suffix — this component can render more than once per page. */
  id: string;
  /** Tag to distinguish which placement fired the event (e.g. "hero", "final_cta"). */
  source: string;
}

export function HeroIdeaInput({ locale, placeholder, cta, id, source }: Props) {
  const router = useRouter();
  const [idea, setIdea] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = idea.trim();
    trackMeta("ValidationStart", { source });
    const query = trimmed ? `?idea=${encodeURIComponent(trimmed)}` : "";
    router.push(`/${locale}/validate${query}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label htmlFor={id} className="sr-only">
        Your business idea
      </label>
      <input
        id={id}
        type="text"
        value={idea}
        onChange={(event) => setIdea(event.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-full border border-[rgba(26,58,42,0.15)] bg-white px-6 text-[0.95rem] text-[var(--landing-ink)] outline-none transition placeholder:text-[var(--landing-muted)]/70 focus:border-[var(--landing-green-mid)] focus:ring-2 focus:ring-[rgba(126,200,80,0.25)] sm:max-w-sm"
      />
      <button
        type="submit"
        className="inline-flex h-14 flex-shrink-0 items-center justify-center rounded-full bg-[var(--landing-green-deep)] px-7 text-[1rem] font-bold text-white shadow-[0_4px_24px_rgba(26,58,42,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--landing-green-mid)] hover:shadow-[0_10px_36px_rgba(26,58,42,0.28)]"
      >
        {cta}
      </button>
    </form>
  );
}
