"use client";

import dynamic from "next/dynamic";

type Props = {
  locale: string;
};

const PageAudioPlayer = dynamic(
  () => import("@/components/PageAudioPlayer").then((mod) => mod.PageAudioPlayer),
  { ssr: false }
);

const FloatingExitCta = dynamic(
  () => import("@/components/marketing/FloatingExitCta").then((mod) => mod.FloatingExitCta),
  { ssr: false }
);

export function ClientEnhancements({ locale }: Props) {
  return (
    <>
      <PageAudioPlayer locale={locale} />
      <FloatingExitCta locale={locale} />
    </>
  );
}
