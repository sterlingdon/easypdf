'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, FileText, CheckCircle2, Download, ArrowLeft, ArrowRight, X, Settings2, Scissors } from 'lucide-react';
import Link from 'next/link';
import { PdfSplitter } from '@/services/PdfSplitter';

import { ToolPageLayout } from './ToolPageLayout';
import { FileItem, ProcessingStatus } from '@/types';

export default function SplitPdfPage() {
  const { t, localizedPath } = useLanguage();
  const [file, setFile] = useState<FileItem | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [resultZip, setResultZip] = useState<Blob | null>(null);
  const [splitMode, setSplitMode] = useState<'all' | 'ranges'>('ranges');
  const [ranges, setRanges] = useState('');
  
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

  const handleSplit = async () => {
    if (!file) return;
    if (splitMode === 'ranges' && !ranges.trim()) {
        alert("Please enter page ranges.");
        return;
    }

    setStatus('PROCESSING');
    try {
        const zipBlob = await PdfSplitter.split(file.file, { mode: splitMode, ranges });
        setResultZip(zipBlob);
        
        // Simulate progress for UX consistency
        await new Promise(r => setTimeout(r, 1000));
        
        setStatus('COMPLETED');
    } catch (error) {
        console.error(error);
        alert('Split failed');
        setStatus('IDLE');
    }
  };

  const handleDownload = () => {
    if (!resultZip) return;
    const url = URL.createObjectURL(resultZip);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'split_files.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sidebarContent = (
      <>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <Scissors size={20} className="mr-2" />
            Split Options
        </h2>

        <div className="space-y-4">
            <label className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${splitMode === 'ranges' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-200'}`}>
                <input 
                    type="radio" 
                    name="mode" 
                    className="mt-1"
                    checked={splitMode === 'ranges'} 
                    onChange={() => setSplitMode('ranges')}
                />
                <div className="ml-3">
                    <span className="font-bold text-slate-800 block">Custom Ranges</span>
                    <span className="text-xs text-slate-500 block mb-2">Extract specific pages or ranges.</span>
                    {splitMode === 'ranges' && (
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

            <label className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${splitMode === 'all' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-200'}`}>
                <input 
                    type="radio" 
                    name="mode" 
                    className="mt-1"
                    checked={splitMode === 'all'} 
                    onChange={() => setSplitMode('all')}
                />
                <div className="ml-3">
                    <span className="font-bold text-slate-800 block">Extract All Pages</span>
                    <span className="text-xs text-slate-500 block">Save every page as a separate PDF file.</span>
                </div>
            </label>
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
            
            <h1 className="text-4xl font-bold text-slate-900 mb-4">PDF Splitted Successfully!</h1>
            <p className="text-slate-500 mb-12">Your pages have been extracted and zipped.</p>

            <button 
                onClick={handleDownload}
                className="bg-brand-500 hover:bg-brand-600 text-white text-xl font-bold px-12 py-5 rounded-full shadow-xl shadow-brand-200 hover:scale-105 transition-all flex items-center justify-center mx-auto"
            >
                <Download size={28} className="mr-3" />
                Download Zip
            </button>

            <div className="mt-12">
               <button 
                  onClick={() => { setStatus('IDLE'); setFile(null); setResultZip(null); setRanges(''); }}
                  className="text-brand-600 hover:text-brand-700 font-medium hover:underline"
               >
                  Split another PDF
               </button>
            </div>
         </div>
      </div>
  );

  return (
    <ToolPageLayout
      title={t('tool.split.title')}
      description={t('tool.split.desc')}
      files={file ? [file] : []}
      status={status}
      maxFiles={1}
      onFilesSelected={handleFileSelect}
      onRemoveFile={() => setFile(null)}
      onStart={handleSplit}
      sidebarContent={sidebarContent}
      successContent={successContent}
    />
  );
}
