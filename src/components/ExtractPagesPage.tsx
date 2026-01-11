'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Copy, CheckCircle2, Download, ArrowLeft, FileOutput } from 'lucide-react';
import Link from 'next/link';
import { PdfPageManager } from '@/services/PdfPageManager';
import { ToolPageLayout } from './ToolPageLayout';
import { FileItem, ProcessingStatus } from '@/types';

export default function ExtractPagesPage() {
  const { t, localizedPath } = useLanguage();
  const [file, setFile] = useState<FileItem | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [resultPdf, setResultPdf] = useState<Blob | null>(null);
  const [extractMode, setExtractMode] = useState<'selected' | 'all'>('selected');
  const [ranges, setRanges] = useState('');
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

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
        setSelectedPages([]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleExtract = async () => {
    if (!file) return;

    setStatus('PROCESSING');
    try {
      const pdfBlob = await PdfPageManager.extractPages(file.file, {
        mode: extractMode,
        ranges: extractMode === 'selected' ? ranges : undefined,
        pageIndices: selectedPages.length > 0 ? selectedPages : undefined
      });
      setResultPdf(pdfBlob);

      await new Promise(r => setTimeout(r, 500));
      setStatus('COMPLETED');
    } catch (error) {
      console.error(error);
      alert('Extraction failed');
      setStatus('IDLE');
    }
  };

  const handleDownload = () => {
    if (!resultPdf || !file) return;
    const url = URL.createObjectURL(resultPdf);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.file.name.replace('.pdf', '')}_extracted.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const togglePageSelection = (pageIndex: number) => {
    setSelectedPages(prev =>
      prev.includes(pageIndex)
        ? prev.filter(p => p !== pageIndex)
        : [...prev, pageIndex].sort((a, b) => a - b)
    );
  };

  const selectAllPages = () => {
    if (file) {
      setSelectedPages(Array.from({ length: file.pages }, (_, i) => i));
    }
  };

  const clearSelection = () => {
    setSelectedPages([]);
  };

  const sidebarContent = (
    <>
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
        <Copy size={20} className="mr-2" />
        Extract Options
      </h2>

      <div className="space-y-4">
        <label className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${extractMode === 'selected' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-200'}`}>
          <input
            type="radio"
            name="extractMode"
            className="mt-1"
            checked={extractMode === 'selected'}
            onChange={() => setExtractMode('selected')}
          />
          <div className="ml-3 flex-1">
            <span className="font-bold text-slate-800 block">Selected Pages</span>
            <span className="text-xs text-slate-500 block mb-2">Extract specific pages or ranges.</span>
            {extractMode === 'selected' && (
              <input
                type="text"
                placeholder="e.g. 1-3, 5, 8-10"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 bg-white"
                value={ranges}
                onChange={(e) => setRanges(e.target.value)}
              />
            )}
          </div>
        </label>

        <label className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${extractMode === 'all' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-200'}`}>
          <input
            type="radio"
            name="extractMode"
            className="mt-1"
            checked={extractMode === 'all'}
            onChange={() => setExtractMode('all')}
          />
          <div className="ml-3">
            <span className="font-bold text-slate-800 block">Extract All Pages</span>
            <span className="text-xs text-slate-500 block">Create a copy with all pages.</span>
          </div>
        </label>

        {file && file.pages > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">Quick Select:</span>
              <div className="space-x-2">
                <button
                  onClick={selectAllPages}
                  className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                >
                  All
                </button>
                <button
                  onClick={clearSelection}
                  className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {Array.from({ length: file.pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => togglePageSelection(i)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    selectedPages.includes(i)
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            {selectedPages.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                {selectedPages.length} page{selectedPages.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        )}
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

        <h1 className="text-4xl font-bold text-slate-900 mb-4">Pages Extracted Successfully!</h1>
        <p className="text-slate-500 mb-12">Your selected pages have been extracted to a new PDF.</p>

        <button
          onClick={handleDownload}
          className="bg-brand-500 hover:bg-brand-600 text-white text-xl font-bold px-12 py-5 rounded-full shadow-xl shadow-brand-200 hover:scale-105 transition-all flex items-center justify-center mx-auto"
        >
          <Download size={28} className="mr-3" />
          Download PDF
        </button>

        <div className="mt-12">
          <button
            onClick={() => { setStatus('IDLE'); setFile(null); setResultPdf(null); setRanges(''); setSelectedPages([]); }}
            className="text-brand-600 hover:text-brand-700 font-medium hover:underline"
          >
            Extract more pages
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ToolPageLayout
      title="Extract PDF Pages"
      description="Extract specific pages from your PDF file."
      files={file ? [file] : []}
      status={status}
      maxFiles={1}
      onFilesSelected={handleFileSelect}
      onRemoveFile={() => setFile(null)}
      onStart={handleExtract}
      sidebarContent={sidebarContent}
      successContent={successContent}
    />
  );
}
