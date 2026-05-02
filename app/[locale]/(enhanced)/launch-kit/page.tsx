import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function LaunchKitPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { tab } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();

  const activeTab = tab === "offers" ? "offers" : "plan";

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900">{t("pages.launchKit.title")}</h1>
      <p className="mt-2 text-gray-600">
        {t("pages.launchKit.subtitle")}
      </p>

      <div className="mt-6 inline-flex rounded-lg border border-gray-200 bg-white p-1">
        <Link
          href={`/${locale}/launch-kit?tab=plan`}
          className={`rounded-md px-4 py-2 text-sm font-semibold ${
            activeTab === "plan" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {t("pages.launchKit.tabs.plan")}
        </Link>
        <Link
          href={`/${locale}/launch-kit?tab=offers`}
          className={`rounded-md px-4 py-2 text-sm font-semibold ${
            activeTab === "offers" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {t("pages.launchKit.tabs.offers")}
        </Link>
      </div>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          {activeTab === "offers"
            ? t("pages.launchKit.offersTitle")
            : t("pages.launchKit.planTitle")}
        </h2>
        <p className="mt-2 text-sm text-gray-700">
          {activeTab === "offers"
            ? t("pages.launchKit.offersDescription")
            : t("pages.launchKit.planDescription")}
        </p>
      </section>
    </main>
  );
}
