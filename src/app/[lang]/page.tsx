import { supportedLanguages } from '@/i18n';
import HomePage from '@/components/HomePage';
import { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo-config';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const seo = getSeoMetadata(lang, 'home');
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
  };
}

export async function generateStaticParams() {
  return supportedLanguages.map((lang) => ({
    lang: lang.code,
  }));
}

export default function Page() {
  return <HomePage />;
}
