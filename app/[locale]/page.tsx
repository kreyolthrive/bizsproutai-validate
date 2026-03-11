import { getTranslations, setRequestLocale } from "next-intl/server";
import { IdeaEvaluationHero } from "@/components/IdeaEvaluationHero";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "homepage" });

  return (
    <main>
      <section className="relative overflow-hidden pb-4">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-emerald-300/40 blur-3xl" />
          <div className="absolute -right-16 top-6 h-80 w-80 rounded-full bg-blue-300/40 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-14 sm:pb-16 sm:pt-16">
          <div className="brand-panel mx-auto max-w-5xl rounded-[2rem] px-6 py-12 text-center sm:px-12">
            <span className="inline-flex rounded-full border border-[#0fb085]/35 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
              {t("hero.badge")}
            </span>
            <h1 className="mt-5 font-[family:var(--font-display)] text-4xl font-semibold tracking-tight text-[#0b1f4d] sm:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg text-[#1b3e74] sm:text-xl">
              {t("hero.subtitle")}
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-base text-[#30558d]">{t("hero.supporting")}</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`/${locale}#validation`}
                className="brand-cta rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/35 transition hover:brightness-110"
              >
                Validate My Idea Free
              </a>
              <a
                href={`/${locale}#features`}
                className="rounded-full border border-[#0b1f4d]/20 bg-white/90 px-6 py-3 text-sm font-semibold text-[#0b1f4d] transition hover:border-[#0b1f4d]/50"
              >
                See How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      <IdeaEvaluationHero locale={locale} />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="brand-panel rounded-3xl p-8">
          <h2 className="font-[family:var(--font-display)] text-2xl font-semibold text-[#0b1f4d]">{t("whatYouGet.title")}</h2>
          <p className="mt-3 text-[#244a82]">{t("whatYouGet.intro")}</p>
          <ul className="mt-5 space-y-3 text-[#173c73]">
            <li>• {t("whatYouGet.item1")}</li>
            <li>• {t("whatYouGet.item2")}</li>
            <li>• {t("whatYouGet.item3")}</li>
          </ul>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-10">
        <div className="brand-panel rounded-3xl p-8">
          <h2 className="font-[family:var(--font-display)] text-2xl font-semibold text-[#0b1f4d]">{t("examples.title")}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50 to-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#0b1f4d]">{t("examples.card1.idea")}</p>
              <p className="mt-2 text-sm text-[#2a4f82]">{t("examples.card1.demand")}</p>
              <p className="mt-1 text-sm text-[#2a4f82]">{t("examples.card1.competition")}</p>
              <p className="mt-1 text-sm text-[#2a4f82]">{t("examples.card1.model")}</p>
              <p className="mt-3 text-sm font-semibold text-emerald-700">{t("examples.card1.decision")}</p>
            </article>
            <article className="rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#0b1f4d]">{t("examples.card2.idea")}</p>
              <p className="mt-2 text-sm text-[#2a4f82]">{t("examples.card2.demand")}</p>
              <p className="mt-1 text-sm text-[#2a4f82]">{t("examples.card2.competition")}</p>
              <p className="mt-1 text-sm text-[#2a4f82]">{t("examples.card2.model")}</p>
              <p className="mt-3 text-sm font-semibold text-emerald-700">{t("examples.card2.decision")}</p>
            </article>
            <article className="rounded-2xl border border-amber-100 bg-gradient-to-b from-amber-50 to-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#0b1f4d]">{t("examples.card3.idea")}</p>
              <p className="mt-2 text-sm text-[#2a4f82]">{t("examples.card3.demand")}</p>
              <p className="mt-1 text-sm text-[#2a4f82]">{t("examples.card3.competition")}</p>
              <p className="mt-1 text-sm text-[#2a4f82]">{t("examples.card3.model")}</p>
              <p className="mt-3 text-sm font-semibold text-rose-700">{t("examples.card3.decision")}</p>
            </article>
          </div>
          <p className="mt-6 text-sm font-medium text-[#20477f]">{t("examples.cta")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="brand-panel rounded-3xl p-8 lg:col-span-3">
            <h2 className="font-[family:var(--font-display)] text-2xl font-semibold text-[#0b1f4d]">{t("why.title")}</h2>
            <p className="mt-4 text-[#244a82]">{t("why.body")}</p>
            <ul className="mt-4 space-y-2 text-[#173c73]">
              <li>• {t("why.item1")}</li>
              <li>• {t("why.item2")}</li>
              <li>• {t("why.item3")}</li>
            </ul>
            <a
              href={`/${locale}#validation`}
              className="brand-cta mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/35 transition hover:brightness-110"
            >
              {t("why.cta")}
            </a>
          </div>
          <div className="rounded-3xl border border-[#0fb085]/30 bg-gradient-to-br from-[#e9fbf6] to-[#eff6ff] p-8 shadow-xl shadow-emerald-100/70 lg:col-span-2">
            <h3 className="font-[family:var(--font-display)] text-xl font-semibold text-[#0b1f4d]">{t("afterValidation.title")}</h3>
            <p className="mt-4 text-[#20477f]">{t("afterValidation.body")}</p>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-6xl px-6 pb-16 pt-10">
        <div className="brand-panel rounded-3xl p-8 text-center">
          <p className="font-[family:var(--font-display)] text-xl font-semibold text-[#0b1f4d]">{t("contact.title")}</p>
          <p className="mt-2 text-[#1f467f]">
            {t("contact.prefix")} {" "}
            <a className="font-semibold text-[#0fb085] hover:text-[#0b1f4d]" href="mailto:info@bizsproutai.com">
              info@bizsproutai.com
            </a>
            .
          </p>
          <p className="mt-2 text-xs text-[#355889]">BizSproutAI is a DBA of Kreyol Thrive Biz.</p>
        </div>
      </section>
    </main>
  );
}
