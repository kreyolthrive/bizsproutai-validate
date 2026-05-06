import { setRequestLocale } from "next-intl/server";
import { FreeValidationFlow } from "@/components/FreeValidationFlow";
import { getValidateCopy } from "@/i18n/validateCopy";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ stage?: string }>;
};

export async function generateMetadata() {
  return {
    title: "Free Business Validation — BizSproutAI",
    description:
      "Validate your business idea for free. Get your current stage, recommended first asset, and clearest next 4 steps in under a minute.",
    robots: { index: false, follow: false },
  };
}

export default async function ValidatePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { stage } = await searchParams;

  setRequestLocale(locale);

  const copy = getValidateCopy(locale);

  const phoneHref =
    "https://cal.com/bizsproutai/30-min-founder-clarity-session";

  const initialStage =
    stage !== undefined && /^[0-3]$/.test(stage) ? parseInt(stage, 10) : undefined;

  return (
    <main className="min-h-screen bg-[var(--warm-white)] px-5 pb-20 pt-24 sm:pt-28 lg:px-10 lg:pt-40">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[20%] h-[400px] w-[400px] rounded-full bg-[rgba(126,200,80,0.05)] blur-3xl" />
        <div className="absolute right-[-5%] top-[60%] h-[320px] w-[320px] rounded-full bg-[rgba(74,140,92,0.05)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        {/* Trust badge */}
        <div className="mb-4 flex flex-col items-center gap-2 text-center sm:mb-8 sm:flex-row sm:justify-center sm:gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(126,200,80,0.3)] bg-[rgba(126,200,80,0.1)] px-4 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.14em] text-[var(--landing-green-mid)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--landing-sprout)]" />
            {copy.trustBadge}
          </span>
          <span className="text-[0.8rem] text-[var(--landing-muted)]">
            {copy.trustMeta}
          </span>
        </div>

        <FreeValidationFlow
          locale={locale}
          initialStage={initialStage}
          phoneHref={phoneHref}
        />

        {/* Footer note */}
        <p className="mt-12 text-center text-[0.8rem] text-[var(--landing-muted)]">
          {copy.footerNotePre}{" "}
          <a
            href={`/${locale}`}
            className="font-semibold text-[var(--landing-green-deep)] underline underline-offset-4"
          >
            {copy.footerNoteCta}
          </a>{" "}
          {copy.footerNotePost}
        </p>
      </div>
    </main>
  );
}
