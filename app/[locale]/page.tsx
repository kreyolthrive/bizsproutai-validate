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
      heroEyebrow: "Le Sprint Fondateur de 30 Jours",
      heroLead: "Votre premier client payant",
      heroEmphasis: "en 30 jours",
      heroEnd: "— ou on ne s\u2019arrête pas.",
      heroBody:
        "Nous vous aidons à transformer votre idée en une offre concrète, un site web et un système client — pour que vous puissiez lancer rapidement et travailler vers votre premier client payant en 30 jours.",
      primary: "Obtenez votre premier client payant",
      secondary: "Voir comment ça marche",
      trustTitle: "Programme basé sur les résultats",
      trustBody: "Inscription limitée, conçu pour les fondateurs prêts à avancer",
      pilotBadge: "Postuler maintenant",
      painEyebrow: "Le vrai problème",
      painTitle:
        "Vous n'êtes pas bloqué par manque de potentiel. Vous êtes bloqué par manque de chemin clair.",
      painBody:
        "La plupart des fondateurs n'ont pas besoin de plus de motivation. Ils ont besoin de structure, de soutien et d'un système qui transforme les idées en action.",
      howEyebrow: "Comment le sprint fonctionne",
      howTitle: "Quatre semaines. Une destination claire.",
      howBody:
        "Complétez le sprint, suivez le plan, et si vous n'obtenez pas votre premier client payant en 30 jours, nous continuons à travailler avec vous sans frais supplémentaires jusqu'à ce que vous y arriviez.",
      servicesEyebrow: "Ce qui est inclus",
      servicesTitle: "Tout ce dont vous avez besoin. Rien de superflu.",
      servicesBody:
        "Ce n'est pas un cours que vous achetez et oubliez. Chaque élément essentiel est construit avec vous pendant le sprint, de sorte qu'à la fin, vous possédez un vrai système d'entreprise que vous pouvez réellement utiliser.",
      proofEyebrow: "À quoi le succès peut ressembler",
      proofTitle: "De vrais résultats de fondateurs. Un vrai élan commercial.",
      proofBody:
        "L'objectif du Sprint n'est pas de vous laisser avec plus de notes, d'idées ou de plans inachevés. C'est de vous aider à créer des résultats comme ceux-ci.",
      signalCta: "Postuler pour le prochain Sprint",
      ctaEyebrow: "Places limitées par sprint",
      ctaTitle: "Vous planifiez depuis assez longtemps.",
      ctaEmphasis: "Maintenant il est temps de construire.",
      ctaBody:
        "C'est un accompagnement concret, pas du contenu passif. Nous ne travaillons qu'avec un nombre limité de fondateurs par sprint afin que chaque participant reçoive l'attention, les retours et le soutien nécessaires pour vraiment se lancer.",
      ctaPrimary: "Postuler pour le prochain Sprint",
      ctaSecondary: "Voir comment ça marche",
      emailPrefix: "Vous préférez écrire ?",
    };
  }

  if (normalized === "es") {
    return {
      heroEyebrow: "El Sprint de Fundadores de 30 Días",
      heroLead: "Tu primer cliente de pago",
      heroEmphasis: "en 30 días",
      heroEnd: "— o no paramos.",
      heroBody:
        "Te ayudamos a convertir tu idea en una oferta real, un sitio web y un sistema de clientes — para que puedas lanzar rápido y trabajar hacia tu primer cliente de pago en 30 días.",
      primary: "Consigue tu primer cliente de pago",
      secondary: "Ver cómo funciona",
      trustTitle: "Programa basado en resultados",
      trustBody: "Inscripción limitada, diseñado para fundadores listos para actuar",
      pilotBadge: "Aplicar ahora",
      painEyebrow: "El verdadero problema",
      painTitle:
        "No estás estancado por falta de potencial. Estás estancado por falta de un camino claro.",
      painBody:
        "La mayoría de los fundadores no necesitan más motivación. Necesitan estructura, apoyo y un sistema que convierta ideas en acción.",
      howEyebrow: "Cómo funciona el sprint",
      howTitle: "Cuatro semanas. Un destino claro.",
      howBody:
        "Completa el sprint, sigue el plan, y si no consigues tu primer cliente de pago en 30 días, seguimos trabajando contigo sin costo adicional hasta que lo logres.",
      servicesEyebrow: "Qué está incluido",
      servicesTitle: "Todo lo que necesitas. Nada que no.",
      servicesBody:
        "Esto no es un curso que compras y olvidas. Cada pieza esencial se construye contigo durante el sprint, así que cuando termine, tendrás un sistema de negocio real que realmente puedes usar.",
      proofEyebrow: "Cómo puede verse el éxito",
      proofTitle: "Resultados reales de fundadores. Impulso real de negocio.",
      proofBody:
        "El objetivo del Sprint no es dejarte con más notas, ideas o planes sin terminar. Es ayudarte a crear resultados como estos.",
      signalCta: "Aplicar al próximo Sprint",
      ctaEyebrow: "Lugares limitados por sprint",
      ctaTitle: "Has estado planificando suficiente tiempo.",
      ctaEmphasis: "Ahora es momento de construir.",
      ctaBody:
        "Este es apoyo práctico, no contenido pasivo. Solo trabajamos con un número limitado de fundadores por sprint para que cada participante reciba el enfoque, la retroalimentación y el apoyo que necesita para realmente lanzar.",
      ctaPrimary: "Aplicar al próximo Sprint",
      ctaSecondary: "Ver cómo funciona",
      emailPrefix: "¿Prefieres escribir?",
    };
  }

  if (normalized === "ht") {
    return {
      heroEyebrow: "Sprint Fondatè 30 Jou a",
      heroLead: "Premye kliyan peyan ou",
      heroEmphasis: "nan 30 jou",
      heroEnd: "— oswa nou pa kanpe.",
      heroBody:
        "Nou ede ou transfòme lide ou nan yon vrè òf, yon sit wèb, ak yon sistèm kliyan — pou ou ka lanse vit epi travay pou jwenn premye kliyan ki peye ou nan 30 jou.",
      primary: "Jwenn premye kliyan peyan ou",
      secondary: "Gade kijan li mache",
      trustTitle: "Pwogram ki baze sou rezilta",
      trustBody: "Enskripsyon limite, fèt pou fondatè ki pare pou avanse",
      pilotBadge: "Aplike kounye a",
      painEyebrow: "Vrè pwoblèm nan",
      painTitle:
        "Ou pa bloke paske ou manke potansyèl. Ou bloke paske ou manke yon chemen klè.",
      painBody:
        "Pifò fondatè pa bezwen plis motivasyon. Yo bezwen estrikti, sipò, ak yon sistèm ki transfòme lide yo an aksyon.",
      howEyebrow: "Kijan sprint la mache",
      howTitle: "Kat semèn. Yon sèl destinasyon klè.",
      howBody:
        "Fini sprint la, swiv plan an, epi si ou pa jwenn premye kliyan ki peye ou nan 30 jou, nou kontinye travay avèk ou san okenn frè anplis jiskaske ou reyisi.",
      servicesEyebrow: "Kisa ki enkli",
      servicesTitle: "Tout sa ou bezwen. Anyen ou pa bezwen.",
      servicesBody:
        "Sa a se pa yon kou ou achte epi bliye. Chak pyès esansyèl bati avèk ou pandan sprint la, konsa lè li fini, ou posede yon vrè sistèm biznis ou ka reyèlman itilize.",
      proofEyebrow: "Kisa siksè ka sanble",
      proofTitle: "Vrè rezilta fondatè. Vrè elan biznis.",
      proofBody:
        "Objektif Sprint la se pa kite ou ak plis nòt, lide, oswa plan ki pa fini. Se ede ou kreye rezilta tankou sa yo.",
      signalCta: "Aplike pou pwochen Sprint la",
      ctaEyebrow: "Plas limite pa sprint",
      ctaTitle: "Ou te planifye ase lontan.",
      ctaEmphasis: "Kounye a se lè pou bati.",
      ctaBody:
        "Sa a se sipò pratik, pa kontni pasif. Nou sèlman travay ak yon kantite limite fondatè pa sprint pou chak patisipan jwenn atansyon, fidbak, ak sipò yo bezwen pou reyèlman lanse.",
      ctaPrimary: "Aplike pou pwochen Sprint la",
      ctaSecondary: "Gade kijan li mache",
      emailPrefix: "Ou pito ekri?",
    };
  }

  if (normalized === "pt") {
    return {
      heroEyebrow: "O Sprint de Fundadores de 30 Dias",
      heroLead: "Seu primeiro cliente pagante",
      heroEmphasis: "em 30 dias",
      heroEnd: "— ou não paramos.",
      heroBody:
        "Nós ajudamos você a transformar sua ideia em uma oferta real, um site e um sistema de clientes — para que você possa lançar rápido e trabalhar para conseguir seu primeiro cliente pagante em 30 dias.",
      primary: "Conquiste seu primeiro cliente pagante",
      secondary: "Veja como funciona",
      trustTitle: "Programa baseado em resultados",
      trustBody: "Inscrição limitada, feito para fundadores prontos para agir",
      pilotBadge: "Aplicar agora",
      painEyebrow: "O verdadeiro problema",
      painTitle:
        "Você não está travado por falta de potencial. Você está travado por falta de um caminho claro.",
      painBody:
        "A maioria dos fundadores não precisa de mais motivação. Eles precisam de estrutura, apoio e um sistema que transforme ideias em ação.",
      howEyebrow: "Como o sprint funciona",
      howTitle: "Quatro semanas. Um destino claro.",
      howBody:
        "Complete o sprint, siga o plano, e se você não conseguir seu primeiro cliente pagante em 30 dias, continuamos trabalhando com você sem custo adicional até que consiga.",
      servicesEyebrow: "O que está incluído",
      servicesTitle: "Tudo o que você precisa. Nada que não precisa.",
      servicesBody:
        "Isso não é um curso que você compra e esquece. Cada peça essencial é construída com você durante o sprint, então quando terminar, você terá um sistema de negócio real que pode realmente usar.",
      proofEyebrow: "Como o sucesso pode parecer",
      proofTitle: "Resultados reais de fundadores. Impulso real de negócio.",
      proofBody:
        "O objetivo do Sprint não é deixar você com mais anotações, ideias ou planos inacabados. É ajudar você a criar resultados como estes.",
      signalCta: "Aplicar para o próximo Sprint",
      ctaEyebrow: "Vagas limitadas por sprint",
      ctaTitle: "Você já planejou tempo suficiente.",
      ctaEmphasis: "Agora é hora de construir.",
      ctaBody:
        "Este é um apoio prático, não conteúdo passivo. Trabalhamos apenas com um número limitado de fundadores por sprint para que cada participante receba o foco, o feedback e o apoio necessários para realmente lançar.",
      ctaPrimary: "Aplicar para o próximo Sprint",
      ctaSecondary: "Veja como funciona",
      emailPrefix: "Prefere escrever?",
    };
  }

  return {
    heroEyebrow: "The 30-Day Founder Sprint",
    heroLead: "Your First Paying Client",
    heroEmphasis: "in 30 Days",
    heroEnd: "— Or We Don\u2019t Stop.",
    heroBody:
      "We help you turn your idea into a real offer, website, and client system — so you can launch fast and work toward your first paying customer in 30 days.",
    primary: "Get Your First Paying Client",
    secondary: "See How It Works",
    trustTitle: "Results-based program",
    trustBody: "Limited enrollment, built for founders ready to move",
    pilotBadge: "Apply Now",
    painEyebrow: "The real problem",
    painTitle:
      "You are not stuck because you lack potential. You are stuck because you lack a clear path.",
    painBody:
      "Most founders do not need more motivation. They need structure, support, and a system that turns ideas into action.",
    howEyebrow: "How the sprint works",
    howTitle: "Four weeks. One clear destination.",
    howBody:
      "Complete the sprint, follow the plan, and if you do not land your first paying customer in 30 days, we keep working with you at no extra cost until you do.",
    servicesEyebrow: "What is included",
    servicesTitle: "Everything you need. Nothing you do not.",
    servicesBody:
      "This is not a course you buy and forget. Every core piece is built with you during the sprint, so when it is over, you own a real business system you can actually use.",
    proofEyebrow: "What success can look like",
    proofTitle: "Real founder outcomes. Real business momentum.",
    proofBody:
      "The goal of the Sprint is not to leave you with more notes, ideas, or unfinished plans. It is to help you create outcomes like these.",
    signalCta: "Apply for the Next Sprint",
    ctaEyebrow: "Limited spots per sprint",
    ctaTitle: "You have been planning long enough.",
    ctaEmphasis: "Now it is time to build.",
    ctaBody:
      "This is hands-on support, not passive content. We only work with a limited number of founders per sprint so every participant gets the focus, feedback, and support they need to actually launch.",
    ctaPrimary: "Apply for the Next Sprint",
    ctaSecondary: "See How It Works",
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

          <p className="landing-reveal mx-auto mt-8 max-w-2xl text-center text-[1.05rem] font-semibold leading-relaxed text-[var(--landing-green-deep)]">
            {lc.howIntro}
          </p>

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
                    <div className="mt-4">
                      <span className="inline-flex rounded-full bg-[rgba(126,200,80,0.12)] px-3.5 py-1.5 text-[0.78rem] font-semibold text-[var(--landing-green-mid)]">
                        {step.tag}
                      </span>
                      {step.checklist && (
                        <ul className="mt-3 space-y-1.5">
                          {step.checklist.map((item) => (
                            <li key={item} className="flex items-center gap-2 text-[0.88rem] text-[var(--landing-green-deep)]">
                              <span className="text-[var(--landing-sprout)]">&#10003;</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                      {step.guarantee && (
                        <p className="mt-4 rounded-xl border border-[rgba(126,200,80,0.3)] bg-[rgba(126,200,80,0.08)] px-4 py-3 text-[0.85rem] font-semibold text-[var(--landing-green-deep)]">
                          {step.guarantee}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="landing-reveal lg:sticky lg:top-28">
              <div className="relative min-h-[380px] overflow-hidden rounded-[24px] bg-[var(--landing-green-deep)] sm:min-h-[460px]">
                <Image
                  src="/Wagner.profile2-CBfCr4Al.png"
                  alt="BizSproutAI founder portrait"
                  fill
                  sizes="(max-width: 1024px) 100vw, 34vw"
                  className="object-cover object-top"
                />
                {/* Fade image bottom into the dark container background */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--landing-green-deep)] to-transparent" />
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

      {/* ── JSON-LD STRUCTURED DATA (SEO / AEO / GEO) ──── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "BizSproutAI",
              url: "https://validate.bizsproutai.com",
              logo: "https://validate.bizsproutai.com/bizsproutai-logo.png",
              description:
                "BizSproutAI helps early-stage founders launch their business and land their first paying customer through the 30-Day Founder Sprint program.",
              sameAs: [],
              contactPoint: {
                "@type": "ContactPoint",
                email: "info@bizsproutai.com",
                contactType: "customer support",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "Course",
              name: "30-Day Founder Sprint",
              description:
                "A done-with-you business launch program that helps early-stage founders turn their idea into a real offer, website, and client system — and work toward their first paying customer in 30 days.",
              provider: {
                "@type": "Organization",
                name: "BizSproutAI",
                url: "https://validate.bizsproutai.com",
              },
              hasCourseInstance: {
                "@type": "CourseInstance",
                courseMode: "online",
                duration: "P30D",
              },
              offers: {
                "@type": "Offer",
                category: "Business Launch Program",
                availability: "https://schema.org/LimitedAvailability",
                url: "https://validate.bizsproutai.com/en/action-plan",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What is the 30-Day Founder Sprint?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "A done-with-you business launch program that helps early-stage founders turn their idea into a real offer, website, and client system — and work toward their first paying customer in 30 days.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How much does the 30-Day Founder Sprint cost?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Apply for details on current pricing. The sprint is results-based — if you complete the program and do not land your first paying customer in 30 days, we keep working with you at no extra cost until you do.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What is included in the sprint?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Idea validation and market direction, offer creation, website and messaging built with you, booking and client follow-up system, AI tools configured to save time, a 30-day execution roadmap, and direct support throughout.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Who is the 30-Day Founder Sprint for?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Early-stage founders who have a business idea but need structure, support, and a system to turn it into a real business. Whether you are stuck choosing between ideas, need a website, or want to land your first client, the sprint gives you a clear path.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What happens after the 30 days?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "If you completed the sprint, followed the plan, and did the work but still have not landed your first paying customer, we continue working with you at no extra cost until you do.",
                  },
                },
              ],
            },
          ]),
        }}
      />
    </main>
  );
}
