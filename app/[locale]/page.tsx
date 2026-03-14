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
      <section className="relative overflow-hidden pb-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-emerald-300/40 blur-3xl" />
          <div className="absolute -right-16 top-6 h-80 w-80 rounded-full bg-blue-300/40 blur-3xl" />
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-8 pt-14 sm:pt-16">
          <div className="brand-panel mx-auto max-w-4xl rounded-[2rem] px-6 py-12 text-center sm:px-10">
            <h1 className="font-[family:var(--font-display)] text-4xl font-semibold tracking-tight text-[#0b1f4d] sm:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg text-[#1b3e74] sm:text-xl">
              {t("hero.subtitle")}
            </p>
            <div className="mt-8 flex items-center justify-center">
              <a
                href={`/${locale}#validation`}
                className="brand-cta rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/35 transition hover:brightness-110"
              >
                {t("hero.cta")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <IdeaEvaluationHero locale={locale} />

      <section id="features" className="mx-auto max-w-6xl px-6 py-8">
        <div className="brand-panel rounded-[2rem] p-7 sm:p-8">
          <h2 className="font-[family:var(--font-display)] text-3xl font-semibold text-[#0b1f4d]">
            {t("examples.title")}
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <article className="rounded-[1.5rem] border border-emerald-100 bg-gradient-to-b from-emerald-50 to-white p-5">
              <p className="text-lg font-semibold text-[#0b1f4d]">{t("examples.card1.idea")}</p>
              <p className="mt-4 text-sm leading-7 text-[#2a4f82]">{t("examples.card1.demand")}</p>
              <p className="mt-1 text-sm leading-7 text-[#2a4f82]">{t("examples.card1.competition")}</p>
              <p className="mt-1 text-sm leading-7 text-[#2a4f82]">{t("examples.card1.model")}</p>
              <p className="mt-5 text-sm font-semibold text-emerald-700">{t("examples.card1.decision")}</p>
            </article>
            <article className="rounded-[1.5rem] border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-5">
              <p className="text-lg font-semibold text-[#0b1f4d]">{t("examples.card2.idea")}</p>
              <p className="mt-4 text-sm leading-7 text-[#2a4f82]">{t("examples.card2.demand")}</p>
              <p className="mt-1 text-sm leading-7 text-[#2a4f82]">{t("examples.card2.competition")}</p>
              <p className="mt-1 text-sm leading-7 text-[#2a4f82]">{t("examples.card2.model")}</p>
              <p className="mt-5 text-sm font-semibold text-emerald-700">{t("examples.card2.decision")}</p>
            </article>
            <article className="rounded-[1.5rem] border border-amber-100 bg-gradient-to-b from-amber-50 to-white p-5">
              <p className="text-lg font-semibold text-[#0b1f4d]">{t("examples.card3.idea")}</p>
              <p className="mt-4 text-sm leading-7 text-[#2a4f82]">{t("examples.card3.demand")}</p>
              <p className="mt-1 text-sm leading-7 text-[#2a4f82]">{t("examples.card3.competition")}</p>
              <p className="mt-1 text-sm leading-7 text-[#2a4f82]">{t("examples.card3.model")}</p>
              <p className="mt-5 text-sm font-semibold text-rose-700">{t("examples.card3.decision")}</p>
            </article>
          </div>
          <p className="mt-6 text-sm text-[#234875]">{t("examples.cta")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-4">
        <div className="border-t border-[#d6e3f7] pt-6 text-center">
          <p className="text-sm text-[#1f467f]">
            {t("footer.prefix")}{" "}
            <a className="font-semibold text-[#0fb085] hover:text-[#0b1f4d]" href="mailto:info@bizsproutai.com">
              info@bizsproutai.com
            </a>
            .
          </p>
          <p className="mt-2 text-xs text-[#355889]">{t("footer.note")}</p>
        </div>
      </section>
    </main>
  );
}
