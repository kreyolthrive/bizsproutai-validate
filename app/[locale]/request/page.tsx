import { setRequestLocale } from "next-intl/server";
import MicroAppForm from "@/components/micro-apps/MicroAppForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RequestServicePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MicroAppForm locale={locale} microAppType="service_request" />;
}
