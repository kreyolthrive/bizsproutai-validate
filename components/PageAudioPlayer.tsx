"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "@/i18n/navigation";

type Props = {
  locale: string;
  contentSelector?: string;
};

type PlaybackStatus = "idle" | "playing" | "paused" | "unsupported" | "error";

type AudioPlayerCopy = {
  title: string;
  body: string;
  disclosure: string;
  listenLabel: string;
  pauseLabel: string;
  resumeLabel: string;
  restartLabel: string;
  stopLabel: string;
  speedLabel: string;
  idleStatus: string;
  playingStatus: string;
  pausedStatus: string;
  unsupportedStatus: string;
  errorStatus: string;
};

const MAX_CHUNK_LENGTH = 1400;
const MIN_NARRATION_LENGTH = 120;
const SPEED_OPTIONS = [0.9, 1, 1.15, 1.3];

function normalizeLocale(locale: string): string {
  return locale.toLowerCase().split("-")[0] ?? "en";
}

function getCopy(locale: string): AudioPlayerCopy {
  const normalized = normalizeLocale(locale);

  if (normalized === "fr") {
    return {
      title: "Ecouter cette page",
      body: "La lecture audio apparait automatiquement pour les pages avec un vrai contenu.",
      disclosure:
        "La voix vient de votre navigateur ou appareil. Le texte lu suit toujours la version actuellement affichee de la page.",
      listenLabel: "Ecouter",
      pauseLabel: "Pause",
      resumeLabel: "Reprendre",
      restartLabel: "Recommencer",
      stopLabel: "Arreter",
      speedLabel: "Vitesse",
      idleStatus: "Audio pret.",
      playingStatus: "Lecture audio en cours.",
      pausedStatus: "Audio en pause.",
      unsupportedStatus: "La lecture audio n'est pas disponible dans ce navigateur.",
      errorStatus: "La lecture audio n'a pas pu demarrer. Reessayez.",
    };
  }

  if (normalized === "es") {
    return {
      title: "Escuchar esta pagina",
      body: "La barra de audio aparece automaticamente en paginas con contenido real.",
      disclosure:
        "La voz viene de tu navegador o dispositivo. El audio siempre sigue la version actual visible de la pagina.",
      listenLabel: "Escuchar",
      pauseLabel: "Pausar",
      resumeLabel: "Continuar",
      restartLabel: "Reiniciar",
      stopLabel: "Detener",
      speedLabel: "Velocidad",
      idleStatus: "Audio listo.",
      playingStatus: "Reproduciendo audio.",
      pausedStatus: "Audio en pausa.",
      unsupportedStatus: "La reproduccion de audio no esta disponible en este navegador.",
      errorStatus: "No se pudo iniciar el audio. Intentalo de nuevo.",
    };
  }

  if (normalized === "ht") {
    return {
      title: "Koute paj sa a",
      body: "Ba odyo a ap parèt otomatikman sou paj ki gen bon kontni ladan yo.",
      disclosure:
        "Vwa a soti nan navigatè oswa aparèy ou. Odyo a toujou suiv vèsyon paj la ki parèt kounye a.",
      listenLabel: "Koute",
      pauseLabel: "Poze",
      resumeLabel: "Kontinye",
      restartLabel: "Rekòmanse",
      stopLabel: "Kanpe",
      speedLabel: "Vitès",
      idleStatus: "Odyo a pare.",
      playingStatus: "Odyo a ap jwe.",
      pausedStatus: "Odyo a an poz.",
      unsupportedStatus: "Lektè odyo pa disponib nan navigatè sa a.",
      errorStatus: "Odyo a pa t ka kòmanse. Eseye ankò.",
    };
  }

  if (normalized === "pt") {
    return {
      title: "Ouvir esta pagina",
      body: "A barra de audio aparece automaticamente em paginas com conteudo real.",
      disclosure:
        "A voz vem do seu navegador ou dispositivo. O audio sempre acompanha a versao visivel atual da pagina.",
      listenLabel: "Ouvir",
      pauseLabel: "Pausar",
      resumeLabel: "Continuar",
      restartLabel: "Reiniciar",
      stopLabel: "Parar",
      speedLabel: "Velocidade",
      idleStatus: "Audio pronto.",
      playingStatus: "Reproduzindo audio.",
      pausedStatus: "Audio pausado.",
      unsupportedStatus: "A reproducao de audio nao esta disponivel neste navegador.",
      errorStatus: "Nao foi possivel iniciar o audio. Tente novamente.",
    };
  }

  return {
    title: "Listen to this page",
    body: "The audio bar appears automatically on pages with enough content to read aloud.",
    disclosure:
      "Playback uses your browser or device voice and always follows the page text currently on screen.",
    listenLabel: "Listen",
    pauseLabel: "Pause",
    resumeLabel: "Resume",
    restartLabel: "Restart",
    stopLabel: "Stop",
    speedLabel: "Speed",
    idleStatus: "Audio ready.",
    playingStatus: "Playing audio.",
    pausedStatus: "Audio paused.",
    unsupportedStatus: "Audio playback is not available in this browser.",
    errorStatus: "Audio playback could not start. Try again.",
  };
}

function getSpeechLanguage(locale: string): string {
  const normalized = normalizeLocale(locale);

  if (normalized === "fr") return "fr-FR";
  if (normalized === "es") return "es-ES";
  if (normalized === "ht") return "fr-HT";
  if (normalized === "pt") return "pt-BR";
  return "en-US";
}

function splitLongSegment(segment: string): string[] {
  if (segment.length <= MAX_CHUNK_LENGTH) {
    return [segment];
  }

  const sentenceParts = segment.match(/[^.!?]+[.!?]?/g) ?? [segment];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentenceParts) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) {
      continue;
    }

    const candidate = currentChunk
      ? `${currentChunk} ${trimmedSentence}`
      : trimmedSentence;

    if (candidate.length > MAX_CHUNK_LENGTH) {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = trimmedSentence;
      continue;
    }

    currentChunk = candidate;
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.length ? chunks : [segment];
}

function buildNarrationChunks(narration: string): string[] {
  return narration
    .split(/\n{2,}/)
    .flatMap((segment) => splitLongSegment(segment.trim()))
    .filter((segment) => segment.length > 0);
}

export function extractNarrationText(root: ParentNode): string {
  const nodes = root.querySelectorAll(
    "h1, h2, h3, h4, h5, h6, p, li, blockquote"
  );
  const parts: string[] = [];

  nodes.forEach((node) => {
    if (node.closest("[data-audio-ignore='true']")) {
      return;
    }

    const text = node.textContent?.replace(/\s+/g, " ").trim() ?? "";
    if (!text) {
      return;
    }

    if (parts[parts.length - 1] === text) {
      return;
    }

    parts.push(text);
  });

  return parts.join("\n\n");
}

function isSpeechSynthesisSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined"
  );
}

function getSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.speechSynthesis ?? null;
}

export function PageAudioPlayer({
  locale,
  contentSelector = "#page-content",
}: Props) {
  const pathname = usePathname();
  const copy = getCopy(locale);
  const [narration, setNarration] = useState("");
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<PlaybackStatus>("idle");
  const [speed, setSpeed] = useState(1);
  const playbackTokenRef = useRef(0);
  const chunksRef = useRef<string[]>([]);

  useEffect(() => {
    const available = isSpeechSynthesisSupported();
    setSupported(available);
    setStatus(available ? "idle" : "unsupported");

    return () => {
      getSpeechSynthesis()?.cancel();
    };
  }, []);

  useEffect(() => {
    const target = document.querySelector(contentSelector);
    if (!(target instanceof HTMLElement)) {
      setNarration("");
      return;
    }

    const updateNarration = () => {
      setNarration(extractNarrationText(target));
    };

    updateNarration();

    const observer = new MutationObserver(updateNarration);
    observer.observe(target, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [contentSelector, locale, pathname]);

  useEffect(() => {
    chunksRef.current = buildNarrationChunks(narration);
    playbackTokenRef.current += 1;
    getSpeechSynthesis()?.cancel();
    setStatus(supported ? "idle" : "unsupported");
  }, [narration, supported]);

  const speakChunk = (index: number, token: number) => {
    const synthesis = getSpeechSynthesis();
    if (!synthesis) {
      setStatus("unsupported");
      return;
    }

    const chunk = chunksRef.current[index];
    if (!chunk) {
      if (playbackTokenRef.current === token) {
        setStatus("idle");
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.lang = getSpeechLanguage(locale);
    utterance.rate = speed;

    utterance.onend = () => {
      if (playbackTokenRef.current !== token) {
        return;
      }

      if (index >= chunksRef.current.length - 1) {
        setStatus("idle");
        return;
      }

      speakChunk(index + 1, token);
    };

    utterance.onerror = () => {
      if (playbackTokenRef.current !== token) {
        return;
      }

      setStatus("error");
    };

    synthesis.speak(utterance);
  };

  const startPlayback = () => {
    const synthesis = getSpeechSynthesis();
    if (!synthesis) {
      setStatus("unsupported");
      return;
    }

    if (!chunksRef.current.length) {
      setStatus("error");
      return;
    }

    playbackTokenRef.current += 1;
    const token = playbackTokenRef.current;
    synthesis.cancel();
    setStatus("playing");
    speakChunk(0, token);
  };

  const pausePlayback = () => {
    const synthesis = getSpeechSynthesis();
    if (!synthesis) {
      setStatus("unsupported");
      return;
    }

    synthesis.pause();
    setStatus("paused");
  };

  const resumePlayback = () => {
    const synthesis = getSpeechSynthesis();
    if (!synthesis) {
      setStatus("unsupported");
      return;
    }

    synthesis.resume();
    setStatus("playing");
  };

  const stopPlayback = () => {
    const synthesis = getSpeechSynthesis();
    if (!synthesis) {
      setStatus("unsupported");
      return;
    }

    playbackTokenRef.current += 1;
    synthesis.cancel();
    setStatus("idle");
  };

  if (narration.trim().length < MIN_NARRATION_LENGTH) {
    return null;
  }

  const nextSpeed = () => {
    const currentIndex = SPEED_OPTIONS.indexOf(speed);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % SPEED_OPTIONS.length;
    setSpeed(SPEED_OPTIONS[nextIndex]);
  };

  const statusMessage =
    status === "playing"
      ? copy.playingStatus
      : status === "paused"
        ? copy.pausedStatus
        : status === "unsupported"
          ? copy.unsupportedStatus
          : status === "error"
            ? copy.errorStatus
            : copy.idleStatus;

  return (
    <section
      data-audio-ignore="true"
      className="pointer-events-none fixed bottom-20 right-3 z-40 sm:bottom-24 sm:right-4"
    >
      <div className="pointer-events-auto flex w-[64px] flex-col items-center gap-2 rounded-[24px] border border-[rgba(26,58,42,0.12)] bg-[rgba(18,26,22,0.94)] px-2.5 py-3 text-white shadow-[0_18px_50px_rgba(26,58,42,0.24)] backdrop-blur">
        <div className="sr-only">
          <p>{copy.title}</p>
          <p>{copy.body}</p>
          <p>{copy.disclosure}</p>
        </div>

        <div className="text-xs font-semibold tabular-nums opacity-90">{speed}x</div>

        <button
          type="button"
          aria-label={
            status === "idle" || status === "unsupported" || status === "error"
              ? copy.listenLabel
              : copy.restartLabel
          }
          onClick={startPlayback}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--landing-green-light)] text-[11px] font-semibold text-[var(--landing-green-deep)] transition hover:bg-[var(--landing-sprout)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!supported}
        >
          {status === "idle" || status === "unsupported" || status === "error"
            ? "Play"
            : "Re"}
        </button>
        <button
          type="button"
          aria-label={copy.pauseLabel}
          onClick={pausePlayback}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 text-[9px] font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!supported || status !== "playing"}
        >
          Pa
        </button>
        <button
          type="button"
          aria-label={copy.resumeLabel}
          onClick={resumePlayback}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 text-[9px] font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!supported || status !== "paused"}
        >
          Re
        </button>
        <button
          type="button"
          aria-label={copy.stopLabel}
          onClick={stopPlayback}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 text-[9px] font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!supported || (status !== "playing" && status !== "paused")}
        >
          St
        </button>
        <button
          type="button"
          aria-label={`${copy.speedLabel}: ${speed}x`}
          onClick={nextSpeed}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 text-[9px] font-semibold transition hover:bg-white/10"
        >
          {speed}x
        </button>

        <p className="sr-only" aria-live="polite">
          {statusMessage}
        </p>
      </div>
    </section>
  );
}
