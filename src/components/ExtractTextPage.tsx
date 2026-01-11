'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, CheckCircle2, Download, ArrowLeft, Copy } from 'lucide-react';
import Link from 'next/link';
import { PdfContentExtractor } from '@/services/PdfContentExtractor';
import { ToolPageLayout } from './ToolPageLayout';
import { FileItem, ProcessingStatus } from '@/types';

export default function ExtractTextPage() {
  const { t, localizedPath } = useLanguage();
  const [file, setFile] = useState<FileItem | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [extractedText, setExtractedText] = useState<string>('');
  const [textStats, setTextStats] = useState<any>(null);
  const [copied, setCopied] = useState(false);

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

  const handleExtract = async () => {
    if (!file) return;

    setStatus('PROCESSING');
    try {
      const [text, stats] = await Promise.all([
        PdfContentExtractor.extractText(file.file),
        PdfContentExtractor.getTextStats(file.file)
      ]);
      setExtractedText(text);
      setTextStats(stats);

      await new Promise(r => setTimeout(r, 300));
      setStatus('COMPLETED');
    } catch (error) {
      console.error(error);
      alert('Extraction failed: ' + error);
      setStatus('IDLE');
    }
  };

  const handleDownload = () => {
    if (!extractedText || !file) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.file.name.replace('.pdf', '')}_text.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sidebarContent = (
    <>
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
        <FileText size={20} className="mr-2" />
        Text Extraction
      </h2>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
          <p className="text-sm text-slate-700">
            Extract all text content from your PDF file. The text will be displayed page by page with page separators.
          </p>
        </div>

        {textStats && (
          <div className="bg-slate-50 p-4 rounded-xl">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Statistics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Pages:</span>
                <span className="font-medium">{textStats.totalPages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Words:</span>
                <span className="font-medium">{textStats.totalWords.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Characters:</span>
                <span className="font-medium">{textStats.totalCharacters.toLocaleString()}</span>
              </div>
            </div>
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
      <div className="bg-transparent px-6 py-4 flex justify-between items-center">
        <Link href={localizedPath('/')} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <Copy size={16} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-full hover:bg-brand-600 transition-colors text-sm font-medium"
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
            <FileText size={24} className="mr-3 text-brand-500" />
            Extracted Text
          </h1>

          <div className="bg-slate-50 rounded-xl p-6 max-h-[60vh] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono leading-relaxed">
              {extractedText}
            </pre>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              setStatus('IDLE');
              setFile(null);
              setExtractedText('');
              setTextStats(null);
            }}
            className="text-brand-600 hover:text-brand-700 font-medium hover:underline"
          >
            Extract another PDF
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ToolPageLayout
      title="Extract Text from PDF"
      description="Extract all text content from your PDF file."
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
