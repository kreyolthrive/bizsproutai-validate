import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

function getPodcastCopy(locale: string) {
  const normalized = locale.toLowerCase().split("-")[0];

  if (normalized === "fr") {
    return {
      kicker: "Bientôt disponible",
      title: "Le podcast BizSproutAI",
      subtitle:
        "Une série à venir pour les fondateurs qui veulent de vraies conversations sur le positionnement, la traction, les systèmes et l'exécution.",
      imageLabel: "Visuel du podcast",
      imageAlt: "Placeholder visuel du podcast BizSproutAI",
      expectTitle: "Ce que vous pouvez attendre",
      expectItems: [
        "Épisodes courts avec apprentissages directement applicables",
        "Conversations avec des fondateurs, opérateurs et créateurs de systèmes",
        "Angles concrets sur la validation, les offres et l'utilisation utile de l'IA",
      ],
      guestsTitle: "Nous préparons des échanges sur",
      guestsBody:
        "Le passage de l'idée à l'offre, la refonte d'un site qui ne convertit pas, l'organisation des suivis, et l'intégration de workflows IA sans surcharge technique.",
      primaryCta: "Parler à l'équipe",
      secondaryCta: "Lire le blog",
    };
  }

  if (normalized === "es") {
    return {
      kicker: "Próximamente",
      title: "El podcast de BizSproutAI",
      subtitle:
        "Una serie próxima para fundadores que quieren conversaciones reales sobre posicionamiento, tracción, sistemas y ejecución.",
      imageLabel: "Arte del podcast",
      imageAlt: "Placeholder del arte del podcast de BizSproutAI",
      expectTitle: "Qué puedes esperar",
      expectItems: [
        "Episodios cortos con aprendizajes accionables",
        "Conversaciones con fundadores, operadores y creadores de sistemas",
        "Enfoques prácticos sobre validación, ofertas y uso útil de IA",
      ],
      guestsTitle: "Estamos preparando conversaciones sobre",
      guestsBody:
        "Pasar de la idea a la oferta, rehacer un sitio que no convierte, organizar el seguimiento y sumar flujos con IA sin sobrecarga técnica.",
      primaryCta: "Hablar con el equipo",
      secondaryCta: "Leer el blog",
    };
  }

  if (normalized === "ht") {
    return {
      kicker: "Byento",
      title: "Podcast BizSproutAI",
      subtitle:
        "Yon seri k ap vini pou fondatè ki vle reyèl konvèsasyon sou pozisyonman, traksyon, sistèm, ak ekzekisyon.",
      imageLabel: "Imaj podcast la",
      imageAlt: "Imaj placeholder podcast BizSproutAI a",
      expectTitle: "Sa ou ka atann",
      expectItems: [
        "Epizòd kout ak leson ou ka itilize touswit",
        "Konvèsasyon ak fondatè, operatè, ak moun k ap bati sistèm",
        "Pwendvi pratik sou validasyon, òf, ak itilizasyon AI ki itil toutbon",
      ],
      guestsTitle: "Nou ap prepare konvèsasyon sou",
      guestsBody:
        "Kijan pou soti nan lide rive nan òf, rebati yon sit ki pa konvèti, òganize follow-up, epi ajoute workflows AI san twòp chay teknik.",
      primaryCta: "Pale ak ekip la",
      secondaryCta: "Li blog la",
    };
  }

  if (normalized === "pt") {
    return {
      kicker: "Em breve",
      title: "O podcast BizSproutAI",
      subtitle:
        "Uma série que está chegando para fundadores que querem conversas reais sobre posicionamento, tração, sistemas e execução.",
      imageLabel: "Arte do podcast",
      imageAlt: "Placeholder da arte do podcast BizSproutAI",
      expectTitle: "O que esperar",
      expectItems: [
        "Episódios curtos com aprendizados acionáveis",
        "Conversas com fundadores, operadores e construtores de sistemas",
        "Ângulos práticos sobre validação, ofertas e uso útil de IA",
      ],
      guestsTitle: "Estamos preparando conversas sobre",
      guestsBody:
        "Como sair da ideia para a oferta, refazer um site que não converte, organizar follow-up e adicionar fluxos com IA sem sobrecarga técnica.",
      primaryCta: "Falar com a equipe",
      secondaryCta: "Ler o blog",
    };
  }

  return {
    kicker: "Coming up",
    title: "The BizSproutAI podcast",
    subtitle:
      "A new series for founders who want real conversations about positioning, traction, systems, and execution.",
    imageLabel: "Podcast artwork",
    imageAlt: "BizSproutAI podcast artwork placeholder",
    expectTitle: "What to expect",
    expectItems: [
      "Short episodes with immediately useful lessons",
      "Conversations with founders, operators, and system builders",
      "Practical angles on validation, offers, and useful AI adoption",
    ],
    guestsTitle: "We are lining up conversations on",
    guestsBody:
      "Moving from idea to offer, rebuilding a site that does not convert, tightening follow-up systems, and using AI workflows without adding technical drag.",
    primaryCta: "Talk to the team",
    secondaryCta: "Read the blog",
  };
}

export default async function PodcastPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const copy = getPodcastCopy(locale);

  return (
    <main className="bg-[var(--warm-white)]">
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-28 sm:pt-32">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--green-light)]">
              {copy.kicker}
            </p>
            <h1 className="mt-4 font-[family:var(--font-serif)] text-5xl leading-tight text-[var(--green-deep)] sm:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">{copy.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex rounded-full bg-[var(--green-deep)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--green-mid)]"
              >
                {copy.primaryCta} →
              </Link>
              <Link
                href="/blog"
                className="inline-flex rounded-full border border-[rgba(26,58,42,0.18)] px-6 py-3 text-sm font-semibold text-[var(--green-deep)] transition hover:border-[var(--green-deep)] hover:bg-[rgba(26,58,42,0.04)]"
              >
                {copy.secondaryCta} →
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] bg-[var(--green-deep)] p-8 text-white shadow-[0_28px_90px_rgba(26,58,42,0.16)] sm:p-10">
            <div className="mb-6 rounded-[24px] border border-dashed border-white/20 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
                {copy.imageLabel}
              </p>
              <div className="mt-4 overflow-hidden rounded-[20px] border border-dashed border-white/20 bg-[radial-gradient(circle_at_top,_rgba(126,200,80,0.28),_rgba(255,255,255,0.04)_58%,_rgba(255,255,255,0.02)_100%)]">
                <Image
                  src="/podcast-placeholder.svg"
                  alt={copy.imageAlt}
                  width={1200}
                  height={1200}
                  className="h-auto w-full"
                  priority
                />
              </div>
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--sprout)]">
              {copy.expectTitle}
            </p>
            <div className="mt-6 grid gap-4">
              {copy.expectItems.map((item) => (
                <div
                  key={item}
                  className="rounded-[20px] border border-white/10 bg-white/6 px-5 py-4 text-sm leading-7 text-white/82"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--cream)] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-[32px] border border-[rgba(26,58,42,0.08)] bg-white p-8 shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--green-light)]">
              {copy.guestsTitle}
            </p>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">{copy.guestsBody}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
