import Image from "next/image";
import { Link } from "@/i18n/navigation";

/* ------------------------------------------------------------------ */
/*  SVG social-media icons (inline to avoid extra dependencies)       */
/* ------------------------------------------------------------------ */

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.26 1.33-3.022.88-.727 2.1-1.138 3.446-1.16.95-.016 1.834.1 2.636.345.015-.627-.003-1.236-.055-1.82-.168-1.887-.692-2.672-2.553-2.796-1.157-.034-2.2.286-2.986.915l-1.29-1.612c1.097-.88 2.576-1.369 4.16-1.378h.138c1.424.025 2.574.48 3.42 1.353.912.943 1.397 2.324 1.582 4.263l.005.066c.048.602.066 1.236.051 1.889.605.357 1.132.79 1.564 1.303.869 1.03 1.337 2.333 1.337 3.604 0 .046 0 .093-.002.14-.08 2.578-1.154 4.628-3.107 5.932C17.591 23.365 15.164 23.985 12.186 24zm-1.638-8.422c-.975.02-1.733.266-2.265.665-.529.398-.788.89-.761 1.432.038.733.576 1.66 2.338 1.806.126.01.252.014.378.014.988 0 1.816-.312 2.412-.92.519-.53.871-1.282 1.057-2.26-.78-.285-1.667-.452-2.643-.466-.172-.002-.344 0-.516.003v.726z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface FooterCopy {
  description: string;
  note: string;
  explore: string;
  connect: string;
  privacy: string;
  terms: string;
  contact: string;
  followUs: string;
}

interface NavCopy {
  blog: string;
}

interface FooterProps {
  locale: string;
  logoSrc: string;
  footerCopy: FooterCopy;
  navCopy: NavCopy;
  homeHref: string;
}

/* ------------------------------------------------------------------ */
/*  Social links config                                               */
/* ------------------------------------------------------------------ */

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/bzsproutai/",
    Icon: FacebookIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/bizsproutai/",
    Icon: InstagramIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/wagner-desir/",
    Icon: LinkedInIcon,
  },
  {
    label: "X",
    href: "https://x.com/bizsproutai",
    Icon: XIcon,
  },
  {
    label: "Threads",
    href: "https://www.threads.net/@bizsproutai",
    Icon: ThreadsIcon,
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function Footer({ locale, logoSrc, footerCopy, navCopy, homeHref }: FooterProps) {
  return (
    <footer
      role="contentinfo"
      className="bg-[var(--landing-green-deep)] px-5 py-16 text-white lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        {/* ---- top section ---- */}
        <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-[1.4fr_0.6fr_0.6fr_0.8fr]">
          {/* brand column */}
          <div className="max-w-sm">
            <Image
              src={logoSrc}
              alt="BizSproutAI logo"
              width={200}
              height={48}
              className="h-9 w-auto max-w-[200px] object-contain brightness-[1.08]"
            />
            <p className="mt-5 text-sm leading-relaxed text-white/65">
              {footerCopy.description}
            </p>
          </div>

          {/* explore column */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              {footerCopy.explore}
            </p>
            <nav aria-label="Footer navigation" className="mt-5 flex flex-col gap-3 text-sm">
              <a
                href={`${homeHref}#pain`}
                className="text-white/75 transition hover:text-[var(--landing-sprout)]"
              >
                {locale === "fr" ? "Pour qui" : locale === "es" ? "Para quién" : locale === "ht" ? "Pou kiyès" : locale === "pt" ? "Para quem" : "Who It's For"}
              </a>
              <a
                href={`${homeHref}#how`}
                className="text-white/75 transition hover:text-[var(--landing-sprout)]"
              >
                {locale === "fr" ? "Comment ça marche" : locale === "es" ? "Cómo funciona" : locale === "ht" ? "Kijan li mache" : locale === "pt" ? "Como funciona" : "How It Works"}
              </a>
              <a
                href={`${homeHref}#services`}
                className="text-white/75 transition hover:text-[var(--landing-sprout)]"
              >
                {locale === "fr" ? "Services" : locale === "es" ? "Servicios" : locale === "ht" ? "Sèvis" : locale === "pt" ? "Serviços" : "Services"}
              </a>
              <Link
                href="/blog"
                className="text-white/75 transition hover:text-[var(--landing-sprout)]"
              >
                {navCopy.blog}
              </Link>
            </nav>
          </div>

          {/* legal column */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              {locale === "fr" ? "Juridique" : locale === "es" ? "Legal" : locale === "ht" ? "Legal" : locale === "pt" ? "Legal" : "Legal"}
            </p>
            <nav aria-label="Legal links" className="mt-5 flex flex-col gap-3 text-sm">
              <Link
                href="/privacy"
                className="text-white/75 transition hover:text-[var(--landing-sprout)]"
              >
                {footerCopy.privacy}
              </Link>
              <Link
                href="/terms"
                className="text-white/75 transition hover:text-[var(--landing-sprout)]"
              >
                {footerCopy.terms}
              </Link>
              <Link
                href="/contact"
                className="text-white/75 transition hover:text-[var(--landing-sprout)]"
              >
                {footerCopy.contact}
              </Link>
            </nav>
          </div>

          {/* social column */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              {footerCopy.followUs}
            </p>
            <div className="mt-5 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/70 transition hover:border-[var(--landing-sprout)] hover:bg-white/10 hover:text-[var(--landing-sprout)]"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
            <a
              href="https://cal.com/bizsproutai/30-min-founder-clarity-session"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center rounded-full bg-[var(--landing-sprout)] px-5 py-2.5 text-sm font-semibold text-[var(--landing-green-deep)] transition hover:brightness-110"
            >
              {locale === "fr"
                ? "Réserver un appel"
                : locale === "es"
                  ? "Reservar llamada"
                  : locale === "ht"
                    ? "Pran yon apèl"
                    : locale === "pt"
                      ? "Agendar ligação"
                      : "Book a Free Call"}{" "}
              &rarr;
            </a>
          </div>
        </div>

        {/* ---- bottom bar ---- */}
        <div className="flex flex-col items-center gap-4 pt-8 text-xs text-white/45 md:flex-row md:justify-between">
          <p>&copy; {new Date().getFullYear()} BizSproutAI. {footerCopy.note}</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition hover:text-white/70">
              {footerCopy.privacy}
            </Link>
            <Link href="/terms" className="transition hover:text-white/70">
              {footerCopy.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
