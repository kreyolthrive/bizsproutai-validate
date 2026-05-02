import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BrandKitPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900">{t("pages.brandKit.title")}</h1>
      <p className="mt-2 text-gray-600">
        {t("pages.brandKit.subtitle")}
      </p>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">{t("pages.brandKit.essentialsTitle")}</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>{t("pages.brandKit.items.0")}</li>
          <li>{t("pages.brandKit.items.1")}</li>
          <li>{t("pages.brandKit.items.2")}</li>
          <li>{t("pages.brandKit.items.3")}</li>
        </ul>
      </section>
    </main>
  );
}
