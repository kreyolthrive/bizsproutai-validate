import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function BillingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900">{t("pages.billing.title")}</h1>
      <p className="mt-2 text-slate-600">{t("pages.billing.subtitle")}</p>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">{t("pages.billing.currentPlanTitle")}</h2>
        <p className="mt-2 text-sm text-slate-700">{t("pages.billing.currentPlanBody")}</p>
      </section>
    </main>
  );
}
