import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pages.terms" });

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="font-[family:var(--font-display)] text-3xl font-semibold text-slate-900">{t("title")}</h1>
      <p className="mt-4 text-slate-700">{t("p1")}</p>
      <p className="mt-4 text-slate-700">{t("p2")}</p>
    </main>
  );
}
