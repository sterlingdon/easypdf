import type { Metadata } from "next";
import { getSeoMetadata } from "@/lib/seo-config";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params;
  const seo = getSeoMetadata(lang, 'default');
  
  // Extract brand name for template if possible, or just use a standard one
  // For now, we'll use "Easy PDF" as the brand constant across languages
  const brandName = "Easy PDF";

  return {
    title: {
      template: `%s | ${brandName}`,
      default: seo.title,
    },
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: `/${lang}`,
      languages: {
        'en': '/en',
        'zh': '/zh',
        // Add others if we had full URL support
      },
    },
  };
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
