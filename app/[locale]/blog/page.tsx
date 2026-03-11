import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const posts = [0, 1, 2].map((index) => ({
    title: t(`pages.blog.posts.${index}.title`),
    excerpt: t(`pages.blog.posts.${index}.excerpt`),
    date: t(`pages.blog.posts.${index}.date`),
    category: t(`pages.blog.posts.${index}.category`),
  }));

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          {t("pages.blog.title")}
        </h1>
        <p className="mt-3 text-lg text-slate-600">{t("pages.blog.subtitle")}</p>
      </div>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <article key={post.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{post.category}</p>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">{post.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">{post.excerpt}</p>
            <p className="mt-4 text-xs font-medium text-slate-500">{post.date}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
