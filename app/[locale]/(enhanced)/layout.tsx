import { ClientEnhancements } from "@/components/ClientEnhancements";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function EnhancedLocaleLayout({
  children,
  params,
}: Props) {
  const { locale } = await params;

  return (
    <>
      <ClientEnhancements locale={locale} />
      {children}
    </>
  );
}
