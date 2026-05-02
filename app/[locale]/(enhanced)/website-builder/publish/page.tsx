import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function WebsitePublishPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pages.websitePublish" });
  const base = `/${locale}`;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-[family:var(--font-display)] text-3xl font-bold text-gray-900">{t("title")}</h1>
      <p className="mt-2 text-gray-600">{t("subtitle")}</p>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">{t("checklist.title")}</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>{t("checklist.item1")}</li>
          <li>{t("checklist.item2")}</li>
          <li>{t("checklist.item3")}</li>
          <li>{t("checklist.item4")}</li>
        </ul>
      </section>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">{t("links.title")}</h2>
        <p className="mt-2 text-sm text-gray-600">{t("links.subtitle")}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <a className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50" href={`${base}/book`}>
            <p className="font-semibold text-gray-900">{t("links.booking")}</p>
            <p className="text-sm text-gray-600">{base}/book</p>
          </a>
          <a className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50" href={`${base}/request`}>
            <p className="font-semibold text-gray-900">{t("links.request")}</p>
            <p className="text-sm text-gray-600">{base}/request</p>
          </a>
          <a className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50" href={`${base}/waitlist`}>
            <p className="font-semibold text-gray-900">{t("links.waitlist")}</p>
            <p className="text-sm text-gray-600">{base}/waitlist</p>
          </a>
          <a className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50" href={`${base}/micro-apps`}>
            <p className="font-semibold text-gray-900">{t("links.crm")}</p>
            <p className="text-sm text-gray-600">{base}/micro-apps</p>
          </a>
        </div>
      </section>
    </main>
  );
}
