import { supportedLanguages } from '@/i18n';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import MergePdfPage from '@/components/MergePdfPage';
import SplitPdfPage from '@/components/SplitPdfPage';
import PdfToImagePage from '@/components/PdfToImagePage';
import ImagesToPdfPage from '@/components/ImagesToPdfPage';
import UnlockPdfPage from '@/components/UnlockPdfPage';
import ProtectPdfPage from '@/components/ProtectPdfPage';
import RotatePdfPage from '@/components/RotatePdfPage';
import GrayscalePdfPage from '@/components/GrayscalePdfPage';
import ViewMetadataPage from '@/components/ViewMetadataPage';
import EditMetadataPage from '@/components/EditMetadataPage';

// New components - Page Management
import RemovePagesPage from '@/components/RemovePagesPage';
import ExtractPagesPage from '@/components/ExtractPagesPage';
import OrganizePagesPage from '@/components/OrganizePagesPage';
import SplitOutlinePage from '@/components/SplitOutlinePage';
import SplitSizePage from '@/components/SplitSizePage';
import RemoveBlankPage from '@/components/RemoveBlankPage';

// New components - Image Format Converters
import PdfToJpgPage from '@/components/PdfToJpgPage';
import PdfToPngPage from '@/components/PdfToPngPage';
import PdfToWebpPage from '@/components/PdfToWebpPage';
import PdfToAvifPage from '@/components/PdfToAvifPage';
import PdfToLongImagePage from '@/components/PdfToLongImagePage';
import ExtractImagesPage from '@/components/ExtractImagesPage';

// New components - Text Extraction
import ExtractTextPage from '@/components/ExtractTextPage';
import PdfToTxtPage from '@/components/PdfToTxtPage';

// New components - Transformers
import AdjustSizePage from '@/components/AdjustSizePage';
import CropPage from '@/components/CropPage';
import NUpPage from '@/components/NUpPage';

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

  // Original tools
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
  if (tool === 'unlock') {
    return <UnlockPdfPage />;
  }
  if (tool === 'protect') {
    return <ProtectPdfPage />;
  }
  if (tool === 'rotate') {
    return <RotatePdfPage />;
  }
  if (tool === 'grayscale') {
    return <GrayscalePdfPage />;
  }
  if (tool === 'view-metadata') {
    return <ViewMetadataPage />;
  }
  if (tool === 'edit-metadata') {
    return <EditMetadataPage />;
  }

  // Page Management
  if (tool === 'remove-pages') {
    return <RemovePagesPage />;
  }
  if (tool === 'extract-pages') {
    return <ExtractPagesPage />;
  }
  if (tool === 'organize-pages') {
    return <OrganizePagesPage />;
  }
  if (tool === 'split-outline') {
    return <SplitOutlinePage />;
  }
  if (tool === 'split-size') {
    return <SplitSizePage />;
  }
  if (tool === 'remove-blank') {
    return <RemoveBlankPage />;
  }
  if (tool === 'n-up') {
    return <NUpPage />;
  }
  if (tool === 'crop') {
    return <CropPage />;
  }
  if (tool === 'adjust-size') {
    return <AdjustSizePage />;
  }

  // Image Format Converters
  if (tool === 'pdf-to-jpg') {
    return <PdfToJpgPage />;
  }
  if (tool === 'pdf-to-png') {
    return <PdfToPngPage />;
  }
  if (tool === 'pdf-to-webp') {
    return <PdfToWebpPage />;
  }
  if (tool === 'pdf-to-avif') {
    return <PdfToAvifPage />;
  }
  if (tool === 'long-image') {
    return <PdfToLongImagePage />;
  }
  if (tool === 'extract-images') {
    return <ExtractImagesPage />;
  }

  // Text Extraction
  if (tool === 'extract-text') {
    return <ExtractTextPage />;
  }
  if (tool === 'pdf-to-txt') {
    return <PdfToTxtPage />;
  }

  return <PlaceholderPage />;
}
