import { supportedLanguages } from '@/i18n';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import MergePdfPage from '@/components/MergePdfPage';
import SplitPdfPage from '@/components/SplitPdfPage';
import PdfToImagePage from '@/components/PdfToImagePage';
import ImagesToPdfPage from '@/components/ImagesToPdfPage';
import { Metadata } from 'next';
import { getSeoMetadata } from '@/lib/seo-config';

export async function generateMetadata({ params }: { params: Promise<{ lang: string; tool: string }> }): Promise<Metadata> {
  const { lang, tool } = await params;
  const seo = getSeoMetadata(lang, tool);
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
  };
}

// List of all tools to generate pages for (excluding existing ones like compress-pdf)
const TOOLS = [
  'merge-pdf',
  'split-pdf', 
  'pdf-to-image', 
  'images-to-pdf', 
  'chat-pdf', 
  'analyze-pdf',
  'remove-pages', 
  'organize-pages', 
  'split-outline', 
  'split-size', 
  'remove-blank', 
  'n-up', 
  'crop', 
  'adjust-size',
  'pdf-to-jpg', 
  'pdf-to-png', 
  'pdf-to-webp', 
  'pdf-to-avif', 
  'pdf-to-svg',
  'extract-pages', 
  'extract-images', 
  'extract-paths', 
  'extract-text',
  'remove-text', 
  'remove-image', 
  'remove-vector',
  'pdf-to-html', 
  'pdf-to-txt', 
  'long-image',
  'unlock', 
  'protect', 
  'grayscale', 
  'rotate', 
  'view-metadata', 
  'edit-metadata'
];

export async function generateStaticParams() {
  const params: { lang: string; tool: string }[] = [];

  for (const lang of supportedLanguages) {
    for (const tool of TOOLS) {
      params.push({ lang: lang.code, tool });
    }
  }

  return params;
}

export default async function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;

  if (tool === 'merge-pdf') {
    return <MergePdfPage />;
  }
  if (tool === 'split-pdf') {
    return <SplitPdfPage />;
  }
  if (tool === 'pdf-to-image') {
    return <PdfToImagePage />;
  }
  if (tool === 'images-to-pdf') {
    return <ImagesToPdfPage />;
  }

  return <PlaceholderPage />;
}
