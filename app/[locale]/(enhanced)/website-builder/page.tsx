import { setRequestLocale } from "next-intl/server";
import SimpleWebsiteEditor from "@/components/website-builder/SimpleWebsiteEditor";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function WebsiteBuilderPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SimpleWebsiteEditor />;
}
