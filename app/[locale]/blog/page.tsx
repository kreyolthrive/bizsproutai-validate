import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getBlogIndexPosts } from "@/src/content/blog";

type Props = {
  params: Promise<{ locale: string }>;
};

function getBlogCopy(locale: string) {
  const lang = locale.toLowerCase().split("-")[0];
  if (lang === "fr") return { readNow: "Lire maintenant →", comingSoon: "Bientôt" };
  if (lang === "es") return { readNow: "Leer ahora →", comingSoon: "Próximamente" };
  if (lang === "ht") return { readNow: "Li kounye a →", comingSoon: "Byento" };
  if (lang === "pt") return { readNow: "Ler agora →", comingSoon: "Em breve" };
  return { readNow: "Read now →", comingSoon: "Coming Soon" };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const blogCopy = getBlogCopy(locale);

  const { featured, recent, upcoming } = getBlogIndexPosts(locale);

  const livePosts = [featured, ...recent].filter(Boolean) as NonNullable<typeof featured>[];

  return (
    <main className="mx-auto max-w-6xl px-6 pb-16 pt-28 sm:pt-32">
      <div className="max-w-3xl">
        <h1 className="font-[family:var(--font-serif)] text-5xl leading-tight text-[var(--landing-green-deep)]">
          {t("pages.blog.title")}
        </h1>
        <p className="mt-4 text-lg text-slate-600">{t("pages.blog.subtitle")}</p>
      </div>

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {/* Live published posts */}
        {livePosts.map((post) => (
          <Link
            key={post.slug}
            href={`/${locale}/blog/${post.slug}`}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[var(--landing-green-deep)] hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{post.category}</p>
            <h2 className="mt-3 text-xl font-semibold text-slate-900 group-hover:text-[var(--landing-green-deep)]">
              {post.title}
            </h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-slate-700">{post.excerpt}</p>
            <p className="mt-5 text-xs font-semibold text-[var(--landing-green-deep)]">{blogCopy.readNow}</p>
          </Link>
        ))}

        {/* Scheduled / upcoming posts */}
        {upcoming.slice(0, Math.max(0, 3 - livePosts.length)).map((post) => (
          <article
            key={post.title}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm opacity-60"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{post.category}</p>
              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {blogCopy.comingSoon}
              </span>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">{post.title}</h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-slate-700">{post.excerpt}</p>
            <p className="mt-5 text-xs font-medium text-slate-400">{post.date}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
