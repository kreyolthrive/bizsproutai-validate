import { setRequestLocale } from "next-intl/server";
import MicroAppsAdmin from "@/components/micro-apps/MicroAppsAdmin";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MicroAppsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MicroAppsAdmin />;
}
