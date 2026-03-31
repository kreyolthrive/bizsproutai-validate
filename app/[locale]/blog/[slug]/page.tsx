import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  buildBlogPostMetadata,
  getAllBlogRouteParams,
  getBlogIndexCopy,
  getBlogPost,
  getRelatedBlogPosts,
} from "@/src/content/blog";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  return getAllBlogRouteParams({ includeScheduled: true });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return buildBlogPostMetadata(locale, slug) ?? {};
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getBlogPost(locale, slug);
  if (!post) {
    notFound();
  }
  const copy = getBlogIndexCopy(locale);
  const relatedPosts = getRelatedBlogPosts(locale, post.relatedSlugs);
  const baseUrl = "https://validate.bizsproutai.com";

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    articleSection: post.category,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    inLanguage: locale,
    image: post.imageSrc
      ? `${baseUrl}${post.imageSrc}`
      : `${baseUrl}/og-image.png`,
    author: {
      "@type": "Organization",
      name: "BizSproutAI",
    },
    publisher: {
      "@type": "Organization",
      name: "BizSproutAI",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/og-image.png`,
      },
    },
    mainEntityOfPage: `${baseUrl}/${locale}/blog/${post.slug}`,
    keywords: post.keywords.join(", "),
  };
  const articleJsonLdText = JSON.stringify(articleJsonLd).replace(
    /[<>&\u2028\u2029]/g,
    (char) => {
      switch (char) {
        case "<":
          return "\\u003c";
        case ">":
          return "\\u003e";
        case "&":
          return "\\u0026";
        case "\u2028":
          return "\\u2028";
        case "\u2029":
          return "\\u2029";
        default:
          return char;
      }
    }
  );

  return (
    <main className="bg-[var(--warm-white)]">
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-28 sm:pt-32">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--landing-green-light)]">
            {post.category}
          </p>
          <h1 className="mt-4 font-[family:var(--font-serif)] text-5xl leading-tight text-[var(--landing-green-deep)] sm:text-6xl">
            {post.title}
          </h1>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium text-[var(--landing-muted)]">
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
          <p className="mt-6 text-lg leading-8 text-[var(--landing-muted)]">
            {post.recommendedCta}
          </p>
        </div>

        <article className="mt-12">
          <div className="rounded-[32px] border border-[rgba(26,58,42,0.08)] bg-white p-8 shadow-sm sm:p-10">
            <h2 className="font-[family:var(--font-serif)] text-3xl leading-tight text-[var(--landing-green-deep)]">
              {post.heroTitle}
            </h2>
            {post.imageSrc ? (
              <div className="mt-6 overflow-hidden rounded-[24px] border border-[rgba(26,58,42,0.08)] bg-[var(--landing-cream)]">
                <Image
                  src={post.imageSrc}
                  alt={post.imageAlt ?? post.title}
                  width={1200}
                  height={900}
                  className="h-auto w-full"
                  priority
                />
              </div>
            ) : null}
            <div className="mt-6 space-y-5 text-base leading-8 text-[var(--landing-ink)]">
              {post.heroIntro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="mt-10 space-y-10">
            {post.sections.map((section) => (
              <section
                key={section.heading}
                className="rounded-[32px] border border-[rgba(26,58,42,0.08)] bg-[var(--landing-cream)] p-8 sm:p-10"
              >
                <h2 className="font-[family:var(--font-serif)] text-3xl leading-tight text-[var(--landing-green-deep)]">
                  {section.heading}
                </h2>
                <div className="mt-5 space-y-5 text-base leading-8 text-[var(--landing-ink)]">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets?.length ? (
                  <ul className="mt-6 space-y-3 text-base leading-8 text-[var(--landing-ink)]">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--landing-sprout)]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[32px] border border-[rgba(26,58,42,0.08)] bg-white p-8 shadow-sm sm:p-10">
              <h2 className="font-[family:var(--font-serif)] text-3xl leading-tight text-[var(--landing-green-deep)]">
                {post.keyTakeawaysTitle}
              </h2>
              <ul className="mt-6 space-y-3 text-base leading-8 text-[var(--landing-ink)]">
                {post.keyTakeaways.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--landing-green-light)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[32px] border border-[rgba(26,58,42,0.08)] bg-white p-8 shadow-sm sm:p-10">
              <h2 className="font-[family:var(--font-serif)] text-3xl leading-tight text-[var(--landing-green-deep)]">
                {post.reflectionTitle}
              </h2>
              <ol className="mt-6 space-y-4 text-base leading-8 text-[var(--landing-ink)]">
                {post.reflectionQuestions.map((item) => (
                  <li key={item} className="flex gap-4">
                    <span className="font-semibold text-[var(--landing-green-mid)]">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="mt-10 rounded-[32px] bg-[var(--landing-green-deep)] p-8 text-white shadow-[0_30px_90px_rgba(26,58,42,0.18)] sm:p-10">
            <h2 className="mt-4 font-[family:var(--font-serif)] text-4xl leading-tight">
              {post.ctaTitle}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/78">
              {post.ctaBody}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--landing-green-deep)] transition hover:bg-[var(--landing-cream)]"
              >
                {post.ctaLabel} →
              </Link>
              <Link
                href="/blog"
                className="inline-flex rounded-full border border-white/18 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {copy.backToBlogLabel} →
              </Link>
            </div>
          </section>

          {relatedPosts.length ? (
            <section className="mt-10 rounded-[32px] border border-[rgba(26,58,42,0.08)] bg-white p-8 shadow-sm sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--landing-green-light)]">
                {copy.relatedPostsLabel}
              </p>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {relatedPosts.map((relatedPost) => (
                  <article
                    key={relatedPost.slug}
                    className="rounded-[24px] border border-[rgba(26,58,42,0.08)] bg-[var(--landing-cream)] p-6"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--landing-green-light)]">
                      {relatedPost.category}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold leading-tight text-[var(--landing-green-deep)]">
                      {relatedPost.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-[var(--landing-muted)]">
                      {relatedPost.excerpt}
                    </p>
                    <Link
                      href={`/blog/${relatedPost.slug}`}
                      className="mt-5 inline-flex text-sm font-semibold text-[var(--landing-green-deep)] transition hover:text-[var(--landing-green-light)]"
                    >
                      {copy.readArticle} →
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <p className="mt-8 text-sm font-medium text-[var(--landing-muted)]">
            {post.upcomingLabel}
          </p>
        </article>
      </section>

      <script type="application/ld+json">{articleJsonLdText}</script>
    </main>
  );
}
