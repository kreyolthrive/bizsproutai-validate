"use client";

import { useState } from "react";

type Props = {
  locale: string;
  title: string;
  excerpt: string;
  url: string;
};

type ShareCopy = {
  title: string;
  subtitle: string;
  followTitle: string;
  followSubtitle: string;
  instagramHelp: string;
  instagramCopied: string;
  instagramFailed: string;
};

/* ---- SVG icons ---- */

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

/* ---- Social profile links ---- */

const PROFILE_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/bzsproutai/", Icon: FacebookIcon },
  { label: "Instagram", href: "https://www.instagram.com/bizsproutai/", Icon: InstagramIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/wagner-desir/", Icon: LinkedInIcon },
  { label: "X", href: "https://x.com/bizsproutai", Icon: XIcon },
  { label: "Threads", href: "https://www.threads.net/@bizsproutai", Icon: ThreadsIcon },
] as const;

const SHARE_COPY_BY_LOCALE: Record<string, ShareCopy> = {
  en: {
    title: "Share this post",
    subtitle: "Send it to someone who should read it, or post it on social.",
    followTitle: "Follow BizSproutAI",
    followSubtitle: "Stay connected for future posts, clips, and updates.",
    instagramHelp:
      "Instagram does not support direct website-link sharing from the web, so this copies the link for bio, story, or DM sharing.",
    instagramCopied: "Article link copied for Instagram sharing.",
    instagramFailed: "Copy failed. Use this link manually:",
  },
  fr: {
    title: "Partager cet article",
    subtitle:
      "Envoyez-le à quelqu'un qui devrait le lire, ou publiez-le sur les réseaux.",
    followTitle: "Suivre BizSproutAI",
    followSubtitle:
      "Restez connecté pour les prochains articles, extraits et mises à jour.",
    instagramHelp:
      "Instagram ne permet pas le partage direct d'un lien web depuis le navigateur. Ce bouton copie donc le lien pour bio, story ou DM.",
    instagramCopied: "Lien de l'article copié pour un partage sur Instagram.",
    instagramFailed: "La copie a échoué. Utilisez ce lien manuellement :",
  },
  es: {
    title: "Compartir este artículo",
    subtitle:
      "Envíalo a alguien que debería leerlo o publícalo en redes sociales.",
    followTitle: "Seguir a BizSproutAI",
    followSubtitle:
      "Mantente conectado para futuros posts, clips y actualizaciones.",
    instagramHelp:
      "Instagram no permite compartir directamente enlaces web desde el navegador, así que este botón copia el enlace para bio, historia o mensaje.",
    instagramCopied: "Enlace del artículo copiado para compartir en Instagram.",
    instagramFailed: "La copia falló. Usa este enlace manualmente:",
  },
  ht: {
    title: "Pataje atik sa a",
    subtitle:
      "Voye li bay yon moun ki ta dwe li li, oswa poste li sou rezo sosyal yo.",
    followTitle: "Swiv BizSproutAI",
    followSubtitle:
      "Rete konekte pou lòt atik, videyo kout, ak mizajou k ap vini yo.",
    instagramHelp:
      "Instagram pa sipòte pataj dirèk lyen sit entènèt soti nan navigatè a, kidonk bouton sa a kopye lyen an pou bio, story, oswa mesaj.",
    instagramCopied: "Lyen atik la kopye pou pataje sou Instagram.",
    instagramFailed: "Kopi a pa mache. Itilize lyen sa a manyèlman:",
  },
  pt: {
    title: "Compartilhar este post",
    subtitle:
      "Envie para alguém que deveria ler ou publique nas redes sociais.",
    followTitle: "Seguir a BizSproutAI",
    followSubtitle:
      "Fique por perto para novos posts, cortes e atualizações.",
    instagramHelp:
      "O Instagram não permite compartilhar links de sites diretamente pela web, então este botão copia o link para bio, story ou DM.",
    instagramCopied: "Link do artigo copiado para compartilhar no Instagram.",
    instagramFailed: "A cópia falhou. Use este link manualmente:",
  },
};

type ShareLink = {
  label: string;
  href?: string;
  kind: "link" | "copy";
};

function getShareCopy(locale: string): ShareCopy {
  const base = locale.toLowerCase().split("-")[0];
  return SHARE_COPY_BY_LOCALE[base] ?? SHARE_COPY_BY_LOCALE.en;
}

function openPromptFallback(message: string, url: string) {
  if (typeof window !== "undefined") {
    window.prompt(message, url);
  }
}

export default function BlogShareActions({
  locale,
  title,
  excerpt,
  url,
}: Props) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const copy = getShareCopy(locale);

  const encodedUrl = encodeURIComponent(url);
  const shareText = `${title} — ${excerpt}`;
  const encodedShareText = encodeURIComponent(shareText);

  const shareLinks: (ShareLink & { Icon: React.FC<{ className?: string }> })[] = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      kind: "link",
      Icon: FacebookIcon,
    },
    {
      label: "Instagram",
      kind: "copy",
      Icon: InstagramIcon,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedShareText}&url=${encodedUrl}`,
      kind: "link",
      Icon: XIcon,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      kind: "link",
      Icon: LinkedInIcon,
    },
    {
      label: "Threads",
      href: `https://www.threads.net/intent/post?text=${encodeURIComponent(`${shareText} ${url}`)}`,
      kind: "link",
      Icon: ThreadsIcon,
    },
  ];

  async function handleInstagramShare() {
    try {
      await navigator.clipboard.writeText(url);
      setStatusMessage(copy.instagramCopied);
    } catch {
      setStatusMessage(`${copy.instagramFailed} ${url}`);
      openPromptFallback(copy.instagramFailed, url);
    }
  }

  return (
    <section className="mt-10 rounded-[32px] border border-[rgba(26,58,42,0.08)] bg-white p-8 shadow-sm sm:p-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--landing-green-light)]">
            {copy.title}
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--landing-muted)]">
            {copy.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {shareLinks.map((shareLink) =>
            shareLink.kind === "copy" ? (
              <button
                key={shareLink.label}
                type="button"
                onClick={handleInstagramShare}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(26,58,42,0.14)] bg-[var(--landing-cream)] px-4 py-2 text-sm font-semibold text-[var(--landing-green-deep)] transition hover:border-[var(--landing-green-light)] hover:bg-white"
                aria-label={`${shareLink.label} share`}
              >
                <shareLink.Icon className="h-4 w-4" />
                {shareLink.label}
              </button>
            ) : (
              <a
                key={shareLink.label}
                href={shareLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(26,58,42,0.14)] bg-[var(--landing-cream)] px-4 py-2 text-sm font-semibold text-[var(--landing-green-deep)] transition hover:border-[var(--landing-green-light)] hover:bg-white"
                aria-label={`Share on ${shareLink.label}`}
              >
                <shareLink.Icon className="h-4 w-4" />
                {shareLink.label}
              </a>
            )
          )}
        </div>
      </div>

      <p className="mt-4 text-xs leading-6 text-[var(--landing-muted)]">
        {copy.instagramHelp}
      </p>
      {statusMessage ? (
        <p className="mt-3 text-sm font-medium text-[var(--landing-green-deep)]">
          {statusMessage}
        </p>
      ) : null}

      <div className="mt-8 border-t border-[rgba(26,58,42,0.08)] pt-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--landing-green-light)]">
              {copy.followTitle}
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--landing-muted)]">
              {copy.followSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {PROFILE_LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(26,58,42,0.14)] bg-[var(--landing-cream)] text-[var(--landing-green-deep)] transition hover:border-[var(--landing-green-light)] hover:bg-white"
                aria-label={`Follow on ${label}`}
              >
                <Icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
