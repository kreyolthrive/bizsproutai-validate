import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function DomainsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900">{t("pages.domains.title")}</h1>
      <p className="mt-2 text-slate-600">{t("pages.domains.subtitle")}</p>
      <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-slate-700">
        <li>{t("pages.domains.steps.0")}</li>
        <li>{t("pages.domains.steps.1")}</li>
        <li>{t("pages.domains.steps.2")}</li>
      </ol>
    </main>
  );
}
