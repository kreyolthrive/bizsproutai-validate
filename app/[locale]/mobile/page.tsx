import { setRequestLocale } from "next-intl/server";
import MobileCompanion from "@/components/mobile/MobileCompanion";

type Props = { params: Promise<{ locale: string }> };

export default async function MobilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MobileCompanion />;
}
