import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function CoursesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900">{t("pages.courses.title")}</h1>
      <p className="mt-2 text-slate-600">{t("pages.courses.subtitle")}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((idx) => (
          <article key={idx} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{t(`pages.courses.items.${idx}.title`)}</h2>
            <p className="mt-2 text-sm text-slate-600">{t(`pages.courses.items.${idx}.description`)}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
