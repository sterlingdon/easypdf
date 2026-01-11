'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle2, Download, ArrowLeft, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { PdfToImage } from '@/services/PdfToImage';
import { ToolPageLayout } from './ToolPageLayout';
import { FileItem, ProcessingStatus } from '@/types';

export default function PdfToAvifPage() {
  const { t, localizedPath } = useLanguage();
  const [file, setFile] = useState<FileItem | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [resultZip, setResultZip] = useState<Blob | null>(null);
  const [quality, setQuality] = useState(90);
  const [error, setError] = useState<string | null>(null);

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
        setError(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setStatus('PROCESSING');
    setError(null);
    try {
      const zipBlob = await PdfToImage.convert(file.file, 'avif', quality / 100);
      setResultZip(zipBlob);

      await new Promise(r => setTimeout(r, 500));
      setStatus('COMPLETED');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Conversion failed';
      setError(errorMsg);
      setStatus('IDLE');
    }
  };

  const handleDownload = () => {
    if (!resultZip) return;
    const url = URL.createObjectURL(resultZip);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'converted_avif_images.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sidebarContent = (
    <>
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
        <ImageIcon size={20} className="mr-2" />
        AVIF Settings
      </h2>

      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start">
          <AlertCircle size={16} className="text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-slate-700">
            <span className="font-bold">Browser Support:</span> AVIF is supported in Chrome 85+, Firefox 93+, and Safari 16+. Other browsers may not support this format.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl">
          <label className="text-sm font-bold text-slate-700 block mb-2">
            Image Quality: {quality}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full accent-brand-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Smaller file</span>
            <span>Better quality</span>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
          <p className="text-sm text-slate-700">
            <span className="font-bold">AVIF Format</span> - Next-generation format with superior compression. 50% smaller than JPEG at similar quality.
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

        <h1 className="text-4xl font-bold text-slate-900 mb-4">Converted to AVIF!</h1>
        <p className="text-slate-500 mb-12">Your PDF pages have been converted to AVIF images.</p>

        <button
          onClick={handleDownload}
          className="bg-brand-500 hover:bg-brand-600 text-white text-xl font-bold px-12 py-5 rounded-full shadow-xl shadow-brand-200 hover:scale-105 transition-all flex items-center justify-center mx-auto"
        >
          <Download size={28} className="mr-3" />
          Download Zip
        </button>

        <div className="mt-12">
          <button
            onClick={() => { setStatus('IDLE'); setFile(null); setResultZip(null); setError(null); }}
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
      title="PDF to AVIF"
      description="Convert PDF pages to next-generation AVIF format with superior compression."
      files={file ? [file] : []}
      status={status}
      maxFiles={1}
      onFilesSelected={handleFileSelect}
      onRemoveFile={() => { setFile(null); setError(null); }}
      onStart={handleConvert}
      sidebarContent={sidebarContent}
      successContent={successContent}
    />
  );
}
