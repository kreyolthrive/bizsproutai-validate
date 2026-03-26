import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { LandingPageReveal } from "@/components/marketing/LandingPageReveal";
import { BookingCalendar } from "@/components/marketing/BookingCalendar";
import { getLandingCopy } from "@/i18n/landingCopy";

type Props = {
  params: Promise<{ locale: string }>;
};

function getCopy(locale: string) {
  const normalized = locale.toLowerCase().split("-")[0];

  if (normalized === "fr") {
    return {
      heroEyebrow: "Pour les fondateurs en phase de départ",
      heroLead: "Arrêtez de deviner.",
      heroEmphasis: "Trouvez votre",
      heroEnd: "prochain bon mouvement.",
      heroBody:
        "Vous avez une vraie idée de business, parfois plus d'une. BizSproutAI vous aide à couper le bruit, valider vite, et construire la bonne base dès le départ.",
      primary: "Obtenir mon plan d'action",
      secondary: "Voir le fonctionnement",
      trustTitle: "Des fondateurs déjà en pilote",
      trustBody: "Cohorte précoce ouverte, places limitées",
      pilotBadge: "Offre pilote active",
      painEyebrow: "Vous n'êtes pas seul",
      painTitle:
        "La plupart des fondateurs n'échouent pas à cause d'une mauvaise idée, mais par manque de système",
      painBody:
        "Nous voyons les mêmes schémas chez les fondateurs en phase de départ. Cela vous ressemble ?",
      howEyebrow: "Le processus",
      howTitle: "Des étapes simples, un vrai élan",
      howBody:
        "Pas d'engagement de six mois. Pas de jargon. Juste un chemin clair pour avancer.",
      servicesEyebrow: "Ce que nous construisons",
      servicesTitle: "Pas un simple logiciel. Un partenaire de résultats.",
      servicesBody:
        "Choisissez ce dont votre business a le plus besoin maintenant. Chaque offre est rapide, cadrée, et pensée pour les fondateurs.",
      proofEyebrow: "Premiers signaux",
      proofTitle: "Les fondateurs posent déjà les bonnes questions",
      proofBody:
        "Voici les vraies conversations qui alimentent notre cohorte pilote.",
      signalCta: "Rejoindre la cohorte fondatrice",
      ctaEyebrow: "Prêt quand vous l'êtes",
      ctaTitle: "Vous n'avez pas besoin de plus de conseils.",
      ctaEmphasis: "Vous avez besoin d'un prochain mouvement.",
      ctaBody:
        "Réservez un appel découverte gratuit de 30 minutes. Pas de pitch, pas d'engagement, juste de la clarté sur ce qu'il faut faire d'abord.",
      ctaPrimary: "Réserver mon appel gratuit",
      ctaSecondary: "Explorer les services",
      emailPrefix: "Vous préférez écrire ?",
    };
  }

  if (normalized === "es") {
    return {
      heroEyebrow: "Para fundadores en etapa inicial",
      heroLead: "Deja de adivinar.",
      heroEmphasis: "Descubre tu",
      heroEnd: "próximo movimiento correcto.",
      heroBody:
        "Tienes una idea de negocio real, quizá más de una. BizSproutAI te ayuda a cortar el ruido, validar rápido y construir la base correcta desde el día uno.",
      primary: "Obtener mi plan de acción",
      secondary: "Ver cómo funciona",
      trustTitle: "Fundadores ya en piloto",
      trustBody: "Cohorte inicial abierta, cupos limitados",
      pilotBadge: "Oferta piloto activa",
      painEyebrow: "No estás solo",
      painTitle:
        "La mayoría de los fundadores no fracasan por malas ideas, fracasan por falta de sistema",
      painBody:
        "Vemos los mismos patrones en fundadores en etapa temprana. ¿Te suena?",
      howEyebrow: "El proceso",
      howTitle: "Pasos simples, impulso real",
      howBody:
        "Sin contratos de seis meses. Sin jerga. Solo un camino claro para avanzar.",
      servicesEyebrow: "Lo que construimos",
      servicesTitle: "No es solo software. Es un socio de resultados.",
      servicesBody: "Elige lo que tu negocio necesita más ahora mismo.",
      proofEyebrow: "Señales tempranas",
      proofTitle: "Los fundadores ya hacen las preguntas correctas",
      proofBody:
        "Estas son conversaciones reales dentro de nuestra comunidad piloto.",
      signalCta: "Unirme a la cohorte fundadora",
      ctaEyebrow: "Listo cuando tú lo estés",
      ctaTitle: "No necesitas más consejos.",
      ctaEmphasis: "Necesitas un siguiente paso.",
      ctaBody:
        "Reserva una llamada de descubrimiento gratuita de 30 minutos. Sin presión, solo claridad sobre qué hacer primero.",
      ctaPrimary: "Reservar mi llamada gratuita",
      ctaSecondary: "Explorar servicios",
      emailPrefix: "¿Prefieres escribir?",
    };
  }

  if (normalized === "ht") {
    return {
      heroEyebrow: "Pou fondatè ki nan kòmansman",
      heroLead: "Sispann devinen.",
      heroEmphasis: "Jwenn",
      heroEnd: "pwochen bon mouvman ou a.",
      heroBody:
        "Ou gen yon vrè lide biznis, petèt plis pase youn. BizSproutAI ede ou retire bri a, valide vit, epi bati bon baz la depi premye jou a.",
      primary: "Jwenn plan aksyon mwen",
      secondary: "Gade kijan li mache",
      trustTitle: "Fondatè deja nan pilot",
      trustBody: "Premye gwoup la ouvè, plas yo limite",
      pilotBadge: "Òf pilot la aktif",
      painEyebrow: "Ou pa poukont ou",
      painTitle:
        "Pifò fondatè pa echwe akoz move lide, yo echwe paske pa gen sistèm",
      painBody: "Nou wè menm modèl yo souvan nan fondatè k ap kòmanse yo.",
      howEyebrow: "Pwosesis la",
      howTitle: "Etap senp, vrè elan",
      howBody:
        "Pa gen kontra sis mwa. Pa gen jargon. Jis yon chemen klè pou avanse.",
      servicesEyebrow: "Sa nou bati",
      servicesTitle: "Se pa sèlman yon lojisyèl. Se yon patnè rezilta.",
      servicesBody: "Chwazi sa biznis ou bezwen plis kounye a.",
      proofEyebrow: "Premye siyal yo",
      proofTitle: "Fondatè yo deja ap poze bon kestyon yo",
      proofBody:
        "Sa yo se vrè konvèsasyon ki deja ap fèt nan kominote pilot la.",
      signalCta: "Antre nan gwoup fondatè a",
      ctaEyebrow: "Pare lè ou pare",
      ctaTitle: "Ou pa bezwen plis konsèy.",
      ctaEmphasis: "Ou bezwen pwochen mouvman ou.",
      ctaBody:
        "Pran yon apèl dekouvèt gratis 30 minit. Pa gen pitch, pa gen obligasyon, jis klète sou sa pou fè an premye.",
      ctaPrimary: "Rezève apèl gratis mwen",
      ctaSecondary: "Gade sèvis yo",
      emailPrefix: "Ou pito ekri?",
    };
  }

  if (normalized === "pt") {
    return {
      heroEyebrow: "Para fundadores em estágio inicial",
      heroLead: "Pare de adivinhar.",
      heroEmphasis: "Descubra seu",
      heroEnd: "próximo movimento certo.",
      heroBody:
        "Você tem uma ideia de negócio real, talvez mais de uma. A BizSproutAI ajuda você a cortar o ruído, validar rápido e construir a base certa desde o começo.",
      primary: "Receber meu plano de ação",
      secondary: "Ver como funciona",
      trustTitle: "Fundadores já no piloto",
      trustBody: "Cohort inicial aberto, vagas limitadas",
      pilotBadge: "Oferta piloto ativa",
      painEyebrow: "Você não está sozinho",
      painTitle:
        "A maioria dos fundadores não falha por ideia ruim, falha por falta de sistema",
      painBody: "Vemos os mesmos padrões em fundadores em estágio inicial.",
      howEyebrow: "O processo",
      howTitle: "Passos simples, impulso real",
      howBody:
        "Sem contratos longos. Sem jargão. Apenas um caminho claro para avançar.",
      servicesEyebrow: "O que construímos",
      servicesTitle: "Não é só software. É parceria para gerar resultado.",
      servicesBody: "Escolha o que o seu negócio mais precisa agora.",
      proofEyebrow: "Sinais iniciais",
      proofTitle: "Fundadores já estão fazendo as perguntas certas",
      proofBody:
        "Estas são conversas reais que orientam nossa cohort piloto.",
      signalCta: "Entrar na cohort fundadora",
      ctaEyebrow: "Pronto quando você estiver",
      ctaTitle: "Você não precisa de mais conselhos.",
      ctaEmphasis: "Você precisa de um próximo passo.",
      ctaBody:
        "Agende uma chamada gratuita de 30 minutos. Sem pressão, apenas clareza sobre o que fazer primeiro.",
      ctaPrimary: "Agendar minha chamada gratuita",
      ctaSecondary: "Explorar serviços",
      emailPrefix: "Prefere escrever?",
    };
  }

  return {
    heroEyebrow: "For Early-Stage Founders",
    heroLead: "Stop guessing.",
    heroEmphasis: "Figure out your",
    heroEnd: "next right move.",
    heroBody:
      "You have a real business idea, maybe more than one. BizSproutAI helps you cut through the noise, validate fast, and build the right foundation from day one.",
    primary: "Get My Action Plan",
    secondary: "See How It Works",
    trustTitle: "Founders already in pilot",
    trustBody: "Early cohort open, limited spots",
    pilotBadge: "Pilot Offer Live",
    painEyebrow: "You are not alone",
    painTitle:
      "Most founders do not fail from bad ideas, they fail from no system",
    painBody:
      "We see the same patterns in early-stage founders over and over again. Sound familiar?",
    howEyebrow: "The Process",
    howTitle: "Simple steps, real momentum",
    howBody:
      "No six-month engagements. No jargon. Just a clear path from confused to moving.",
    servicesEyebrow: "What We Build",
    servicesTitle: "Not a software product. A results partner.",
    servicesBody:
      "Choose what your business needs most right now. Each offer is scoped, fast, and founder-first.",
    proofEyebrow: "Early Signals",
    proofTitle: "Founders are already asking the right questions",
    proofBody:
      "These are real conversations happening in our pilot community. We built our offers around them.",
    signalCta: "Join the founding cohort",
    ctaEyebrow: "Ready when you are",
    ctaTitle: "You do not need more advice.",
    ctaEmphasis: "You need a next move.",
    ctaBody:
      "Book a free 30-minute discovery call. No pitch, no commitment, just clarity on what to do first.",
    ctaPrimary: "Book My Free Call",
    ctaSecondary: "Explore Services",
    emailPrefix: "Prefer email?",
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const copy = getCopy(locale);
  const lc = getLandingCopy(locale);
  const actionPlanHref = `/${locale}/action-plan`;
  const contactHref = `/${locale}/contact`;
  const phoneHref = "https://cal.com/bizsproutai/30-min-founder-clarity-session";
  const serviceHref = (service: string) =>
    `/${locale}/action-plan?service=${encodeURIComponent(service)}`;

  return (
    <main className="overflow-x-hidden bg-[var(--warm-white)] text-[var(--ink)]">
      <LandingPageReveal />

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-5 pb-16 pt-28 lg:px-10 lg:pt-36">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8%] top-[62%] h-[320px] w-[320px] rounded-full bg-[rgba(74,140,92,0.06)] blur-3xl" />
          <div className="absolute right-[6%] top-[8%] h-[360px] w-[360px] rounded-full bg-[rgba(126,200,80,0.06)] blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.82fr]">
          <div>
            <div className="landing-reveal inline-flex items-center gap-2 rounded-full border border-[rgba(126,200,80,0.3)] bg-[rgba(126,200,80,0.14)] px-3.5 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[var(--landing-green-mid)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--landing-sprout)]" />
              {copy.heroEyebrow}
            </div>

            <h1 className="landing-reveal mt-6 font-[family:var(--font-serif)] text-[clamp(2.2rem,4.2vw,3.8rem)] leading-[1.06] tracking-[-0.02em] text-[var(--landing-green-deep)]">
              {copy.heroLead}
              <br />
              <em className="text-[var(--landing-green-light)]">
                {copy.heroEmphasis}
              </em>
              <br />
              {copy.heroEnd}
            </h1>

            <p className="landing-reveal mt-5 max-w-[26rem] text-[1.02rem] leading-[1.65] text-[var(--landing-muted)]">
              {copy.heroBody}
            </p>

            <div className="landing-reveal mt-7 flex flex-wrap gap-3">
              <a
                href={actionPlanHref}
                className="inline-flex items-center rounded-full bg-[var(--landing-green-deep)] px-6 py-3 text-[0.92rem] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--landing-green-mid)] hover:shadow-[0_10px_30px_rgba(26,58,42,0.2)]"
              >
                {copy.primary} →
              </a>
              <a
                href={`/${locale}#how`}
                className="inline-flex items-center rounded-full border border-[rgba(26,58,42,0.2)] px-6 py-3 text-[0.92rem] font-semibold text-[var(--landing-green-deep)] transition hover:border-[var(--landing-green-deep)] hover:bg-[rgba(26,58,42,0.04)]"
              >
                {copy.secondary}
              </a>
            </div>

            <div className="landing-reveal mt-10 flex items-center gap-4">
              <div className="flex items-center">
                {["JA", "M", "RL", "DS"].map((item, index) => (
                  <span
                    key={item}
                    className={`${
                      index === 0
                        ? "bg-[var(--landing-green-mid)]"
                        : index === 1
                          ? "bg-[#3d7a55]"
                          : index === 2
                            ? "bg-[var(--landing-green-light)]"
                            : "bg-[var(--landing-amber)] text-[var(--landing-ink)]"
                    } -ml-2.5 flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] border-[var(--warm-white)] text-xs font-bold text-white first:ml-0`}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="text-[0.82rem] leading-snug text-[var(--landing-muted)]">
                <strong className="block text-sm text-[var(--landing-green-deep)]">
                  {copy.trustTitle}
                </strong>
                {copy.trustBody}
              </div>
            </div>
          </div>

          {/* Hero visual card */}
          <div className="landing-reveal">
            <div className="relative rounded-[20px] bg-[var(--landing-green-deep)] p-5 text-white shadow-[0_20px_50px_rgba(26,58,42,0.16)] sm:p-7">
              <div className="absolute right-4 top-4 z-[1] rounded-full bg-[var(--landing-amber)] px-3 py-1 text-[0.72rem] font-bold text-[var(--landing-ink)] shadow-[0_4px_16px_rgba(245,166,35,0.35)]">
                {copy.pilotBadge}
              </div>
              <div className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--landing-sprout)]">
                {lc.clarityLabel}
              </div>
              <p className="max-w-md pr-20 font-[family:var(--font-serif)] text-[1.3rem] leading-[1.22] sm:text-[1.45rem]">
                {lc.clarityQuestion}
              </p>

              <div className="mt-5 space-y-2.5">
                {lc.clarityChoices.map((label, index) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-[0.82rem] ${
                      index === 0
                        ? "border-[rgba(126,200,80,0.45)] bg-[rgba(126,200,80,0.18)]"
                        : "border-white/10 bg-white/[0.06]"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                        index === 0 ? "bg-[var(--landing-sprout)]" : "bg-white/25"
                      }`}
                    />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {lc.miniCards.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[rgba(26,58,42,0.08)] bg-[var(--landing-cream)] p-3.5 shadow-sm"
                >
                  <div className="text-[1.15rem]">{item.icon}</div>
                  <div className="mt-2 text-[0.8rem] font-semibold text-[var(--landing-green-deep)]">
                    {item.title}
                  </div>
                  <div className="mt-0.5 text-[0.72rem] text-[var(--landing-muted)]">
                    {item.subtitle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PAIN SECTION ──────────────────────────────────── */}
      <section id="pain" className="bg-[var(--landing-cream)] px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="landing-reveal mx-auto max-w-[38rem] text-center">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
              {copy.painEyebrow}
            </p>
            <h2 className="mt-4 font-[family:var(--font-serif)] text-[clamp(1.8rem,3.2vw,2.8rem)] leading-[1.1] text-[var(--landing-green-deep)]">
              {copy.painTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--landing-muted)]">
              {copy.painBody}
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {lc.painItems.map((item) => (
              <article
                key={item.title}
                className="landing-reveal group relative overflow-hidden rounded-[20px] border border-[rgba(26,58,42,0.07)] bg-white p-7 transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(26,58,42,0.1)]"
              >
                <div className="absolute bottom-0 left-0 right-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[var(--landing-green-mid)] to-[var(--landing-sprout)] transition-transform group-hover:scale-x-100" />
                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[rgba(126,200,80,0.12)] text-xl">
                  {item.icon}
                </div>
                <h3 className="mt-5 font-[family:var(--font-serif)] text-[1.25rem] text-[var(--landing-green-deep)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-[0.88rem] leading-[1.6] text-[var(--landing-muted)]">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section id="how" className="px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="landing-reveal mx-auto max-w-[38rem] text-center">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
              {copy.howEyebrow}
            </p>
            <h2 className="mt-4 font-[family:var(--font-serif)] text-[clamp(1.8rem,3.2vw,2.8rem)] leading-[1.1] text-[var(--landing-green-deep)]">
              {copy.howTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--landing-muted)]">
              {copy.howBody}
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-[1.06fr_0.72fr]">
            <div className="space-y-0">
              {lc.howSteps.map((step) => (
                <div
                  key={step.number}
                  className="landing-reveal group grid gap-5 border-b border-dashed border-[rgba(26,58,42,0.12)] py-8 sm:grid-cols-[68px_1fr]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[rgba(26,58,42,0.14)] font-[family:var(--font-display)] text-base font-bold text-[var(--landing-green-deep)] transition group-hover:scale-105 group-hover:border-[var(--landing-green-deep)] group-hover:bg-[var(--landing-green-deep)] group-hover:text-white">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="font-[family:var(--font-serif)] text-[1.4rem] leading-tight text-[var(--landing-green-deep)]">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-[0.92rem] leading-7 text-[var(--landing-muted)]">
                      {step.body}
                    </p>
                    <span className="mt-4 inline-flex rounded-full bg-[rgba(126,200,80,0.12)] px-3.5 py-1.5 text-[0.78rem] font-semibold text-[var(--landing-green-mid)]">
                      {step.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <aside className="landing-reveal lg:sticky lg:top-28">
              <div className="relative min-h-[380px] overflow-hidden rounded-[24px] sm:min-h-[460px]">
                <Image
                  src="/Wagner.profile2-CBfCr4Al.png"
                  alt="BizSproutAI founder portrait"
                  fill
                  sizes="(max-width: 1024px) 100vw, 34vw"
                  className="object-cover object-top"
                />
                {/* Fade out the white bottom of the photo into the page background */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#fdfaf5] to-transparent" />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────── */}
      <section
        id="services"
        className="overflow-hidden bg-[var(--landing-green-deep)] px-5 py-20 text-white lg:px-10"
      >
        <div className="pointer-events-none absolute right-[-120px] top-[-80px] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(126,200,80,0.1),transparent_70%)]" />
        <div className="mx-auto max-w-7xl">
          <div className="landing-reveal mx-auto max-w-[38rem] text-center">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-sprout)]">
              {copy.servicesEyebrow}
            </p>
            <h2 className="mt-4 font-[family:var(--font-serif)] text-[clamp(1.8rem,3.2vw,2.8rem)] leading-[1.1]">
              {copy.servicesTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-white/60">
              {copy.servicesBody}
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {/* Featured service */}
            <article className="landing-reveal grid gap-8 rounded-[24px] border border-[rgba(126,200,80,0.22)] bg-[rgba(126,200,80,0.08)] p-7 lg:col-span-2 lg:grid-cols-2">
              <div>
                <div className="inline-flex rounded-full bg-[var(--landing-amber)] px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[var(--landing-ink)]">
                  {lc.featuredBadge}
                </div>
                <h3 className="mt-4 font-[family:var(--font-serif)] text-[1.5rem] leading-tight sm:text-[1.7rem]">
                  {lc.featuredTitle}
                </h3>
                <p className="mt-4 text-[0.88rem] leading-7 text-white/70">
                  {lc.featuredBody}
                </p>
                <a
                  href={serviceHref("idea_validation_sprint")}
                  className="mt-6 inline-flex text-[0.88rem] font-semibold text-[var(--landing-sprout)] transition hover:gap-2"
                >
                  {lc.featuredCta} →
                </a>
              </div>
              <div className="rounded-[18px] bg-white/[0.05] p-5">
                <div className="space-y-3 text-[0.88rem] text-white/80">
                  {lc.featuredChecklist.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[rgba(126,200,80,0.18)] text-[0.65rem] text-[var(--landing-sprout)]">
                        ✓
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </article>

            {lc.services.map((service) => (
              <article
                key={service.id}
                className="landing-reveal rounded-[20px] border border-white/10 bg-white/[0.05] p-7 transition hover:-translate-y-1 hover:border-[rgba(126,200,80,0.35)] hover:bg-white/[0.08]"
              >
                <h3 className="font-[family:var(--font-serif)] text-[1.5rem] leading-tight">
                  {service.title}
                </h3>
                <p className="mt-3 text-[0.88rem] leading-7 text-white/65">
                  {service.body}
                </p>
                <a
                  href={serviceHref(service.id)}
                  className="mt-5 inline-flex text-[0.88rem] font-semibold text-[var(--landing-sprout)] transition hover:gap-2"
                >
                  {service.cta} →
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROOF ─────────────────────────────────────────── */}
      <section id="proof" className="bg-[var(--landing-cream)] px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="landing-reveal mx-auto max-w-[38rem] text-center">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
              {copy.proofEyebrow}
            </p>
            <h2 className="mt-4 font-[family:var(--font-serif)] text-[clamp(1.8rem,3.2vw,2.8rem)] leading-[1.1] text-[var(--landing-green-deep)]">
              {copy.proofTitle}
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--landing-muted)]">
              {copy.proofBody}
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {lc.testimonials.map((item) => (
              <article
                key={item.name}
                className="landing-reveal rounded-[20px] border border-[rgba(26,58,42,0.07)] bg-white p-7 shadow-sm transition hover:-translate-y-1"
              >
                <div className="text-base tracking-[0.2em] text-[var(--landing-amber)]">
                  ★★★★★
                </div>
                <p className="mt-4 font-[family:var(--font-serif)] text-[1.05rem] leading-[1.55] text-[var(--landing-green-deep)]">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${item.color}`}
                  >
                    {item.initial}
                  </div>
                  <div>
                    <div className="text-[0.85rem] font-semibold text-[var(--landing-ink)]">
                      {item.name}
                    </div>
                    <div className="text-[0.75rem] text-[var(--landing-muted)]">
                      {item.role}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIGNAL STRIP ──────────────────────────────────── */}
      <div className="landing-reveal border-y border-[rgba(26,58,42,0.08)] bg-[var(--warm-white)] px-5 py-10 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8">
          <div className="flex flex-wrap gap-10">
            {lc.signalStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-[family:var(--font-display)] text-[2rem] font-extrabold text-[var(--landing-green-deep)]">
                  {stat.value}
                </div>
                <div className="mt-1 text-[0.8rem] text-[var(--landing-muted)]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <a
            href={actionPlanHref}
            className="inline-flex rounded-full bg-[var(--landing-green-deep)] px-6 py-3.5 text-base font-semibold text-white transition hover:bg-[var(--landing-green-mid)]"
          >
            {copy.signalCta} →
          </a>
        </div>
      </div>

      {/* ── CTA + BOOKING ─────────────────────────────────── */}
      <section id="cta" className="relative overflow-hidden px-5 py-20 lg:px-10">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(126,200,80,0.07),_transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="landing-reveal text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
            {copy.ctaEyebrow}
          </p>
          <h2 className="landing-reveal mt-4 font-[family:var(--font-serif)] text-[clamp(1.8rem,3.5vw,3.2rem)] leading-[1.08] text-[var(--landing-green-deep)]">
            {copy.ctaTitle}
            <br />
            <em className="text-[var(--landing-green-light)]">
              {copy.ctaEmphasis}
            </em>
          </h2>
          <p className="landing-reveal mx-auto mt-4 max-w-xl text-base leading-7 text-[var(--landing-muted)]">
            {copy.ctaBody}
          </p>
          <div className="landing-reveal mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={phoneHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-full bg-[var(--landing-green-deep)] px-7 py-3.5 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--landing-green-mid)] hover:shadow-[0_10px_30px_rgba(26,58,42,0.2)]"
            >
              {copy.ctaPrimary} →
            </a>
            <a
              href={`/${locale}#services`}
              className="inline-flex rounded-full border border-[rgba(26,58,42,0.2)] px-7 py-3.5 text-base font-semibold text-[var(--landing-green-deep)] transition hover:border-[var(--landing-green-deep)] hover:bg-[rgba(26,58,42,0.04)]"
            >
              {copy.ctaSecondary}
            </a>
          </div>
          <p className="landing-reveal mt-6 text-sm text-[var(--landing-muted)]">
            {copy.emailPrefix}{" "}
            <a
              href={contactHref}
              className="font-semibold text-[var(--landing-green-deep)] underline underline-offset-4"
            >
              info@bizsproutai.com
            </a>
          </p>

          {/* Booking Calendar */}
          <BookingCalendar
            title={lc.bookingTitle}
          />
        </div>
      </section>
    </main>
  );
}
