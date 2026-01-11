'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle2, Download, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { PdfToImage } from '@/services/PdfToImage';
import { ToolPageLayout } from './ToolPageLayout';
import { FileItem, ProcessingStatus } from '@/types';

export default function PdfToPngPage() {
  const { t, localizedPath } = useLanguage();
  const [file, setFile] = useState<FileItem | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [resultZip, setResultZip] = useState<Blob | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const f = e.target.files[0];
      const tempId = Math.random().toString(36).substr(2, 9);
      setFile({
        id: tempId,
        file: f,
        pages: 0,
        width: 0,
        height: 0
      });

      try {
        const pdfjsLib = await import('pdfjs-dist');
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;
        }

        const arrayBuffer = await f.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let thumbnailUrl = undefined;
        try {
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          if (context) {
            await page.render({ canvasContext: context, viewport, canvas: canvas as any }).promise;
            thumbnailUrl = canvas.toDataURL();
          }
        } catch (e) { console.error(e); }

        setFile(prev => (prev && prev.id === tempId) ? { ...prev, pages: pdf.numPages, thumbnailUrl } : prev);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setStatus('PROCESSING');
    try {
      const zipBlob = await PdfToImage.convert(file.file, 'png');
      setResultZip(zipBlob);

      await new Promise(r => setTimeout(r, 500));
      setStatus('COMPLETED');
    } catch (error) {
      console.error(error);
      alert('Conversion failed: ' + error);
      setStatus('IDLE');
    }
  };

  const handleDownload = () => {
    if (!resultZip) return;
    const url = URL.createObjectURL(resultZip);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'converted_png_images.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sidebarContent = (
    <>
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
        <ImageIcon size={20} className="mr-2" />
        PNG Settings
      </h2>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
          <p className="text-sm text-slate-700">
            <span className="font-bold">PNG Format</span> - Lossless compression with transparency support. Best for graphics and images with text.
          </p>
        </div>
      </div>
    </>
  );

  const successContent = (
    <div className="min-h-screen bg-[#f7f7f7] pb-20" style={{
      backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,
      backgroundSize: '40px 40px',
      backgroundPosition: 'center center'
    }}>
      <div className="bg-transparent px-6 py-4">
        <Link href={localizedPath('/')} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-center">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-in fade-in zoom-in duration-500">
          <CheckCircle2 size={48} />
        </div>

        <h1 className="text-4xl font-bold text-slate-900 mb-4">Converted to PNG!</h1>
        <p className="text-slate-500 mb-12">Your PDF pages have been converted to PNG images.</p>

        <button
          onClick={handleDownload}
          className="bg-brand-500 hover:bg-brand-600 text-white text-xl font-bold px-12 py-5 rounded-full shadow-xl shadow-brand-200 hover:scale-105 transition-all flex items-center justify-center mx-auto"
        >
          <Download size={28} className="mr-3" />
          Download Zip
        </button>

        <div className="mt-12">
          <button
            onClick={() => { setStatus('IDLE'); setFile(null); setResultZip(null); }}
            className="text-brand-600 hover:text-brand-700 font-medium hover:underline"
          >
            Convert another file
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ToolPageLayout
      title="PDF to PNG"
      description="Convert PDF pages to lossless PNG images with transparency support."
      files={file ? [file] : []}
      status={status}
      maxFiles={1}
      onFilesSelected={handleFileSelect}
      onRemoveFile={() => setFile(null)}
      onStart={handleConvert}
      sidebarContent={sidebarContent}
      successContent={successContent}
    />
  );
}
