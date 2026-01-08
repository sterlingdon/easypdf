'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, FileText, X, ArrowLeft, ArrowRight, CheckCircle2, Download, Share2, ChevronDown, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { PdfMerger } from '@/services/PdfMerger';



import { ToolPageLayout } from './ToolPageLayout';
import { FileItem, ProcessingStatus } from '@/types';

export default function MergePdfPage() {
  const { t, localizedPath } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  
  // Note: We don't need fileInputRef here as it is handled in ToolPageLayout, unless we have custom buttons that need it.
  // actually ToolPageLayout calls onFilesSelected with the event.
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const pdfjsLib = await import('pdfjs-dist');
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;
      }

      const newFilesPromises = Array.from(e.target.files).map(async (f) => {
         const id = Math.random().toString(36).substr(2, 9);
         let pages = 0;
         let thumbnailUrl = undefined;
         
         try {
             const arrayBuffer = await f.arrayBuffer();
             const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
             const pdf = await loadingTask.promise;
             pages = pdf.numPages;

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
             } catch(e) { console.error(e); }
         } catch(e) { console.error("PDF Load Error", e); }

         return {
            id,
            file: f,
            pages,
            width: 0,
            height: 0,
            thumbnailUrl
         };
      });

      const newFiles = await Promise.all(newFilesPromises);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  // const moveFile = (index: number, direction: 'up' | 'down') => {
  //   if ((direction === 'up' && index === 0) || (direction === 'down' && index === files.length - 1)) return;
  //   const newFiles = [...files];
  //   const targetIndex = direction === 'up' ? index - 1 : index + 1;
  //   [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
  //   setFiles(newFiles);
  // };

  const handleMerge = async () => {
    if (files.length < 2) {
      alert("Please select at least 2 PDF files to merge.");
      return;
    }

    setStatus('PROCESSING');
    try {
      const mergedBlob = await PdfMerger.merge(files.map(f => f.file));
      setResultBlob(mergedBlob);
      // Simulate progress for UX consistency
      await new Promise(r => setTimeout(r, 1000)); 
      setStatus('COMPLETED');
    } catch (error) {
      console.error(error);
      alert('Merge failed');
      setStatus('IDLE');
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'merged_document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sidebarContent = (
      <>
         <h2 className="text-xl font-bold text-slate-900 mb-4">{t('tool.merge.title')}</h2>
         <p className="text-sm text-slate-500 leading-relaxed mb-6">
            Drag files to reorder them (coming soon) or use the arrows. Click merge when ready.
         </p>
         
         <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
            <div className="flex items-center text-blue-800 font-bold mb-1">
               <FileText size={16} className="mr-2" />
               {files.length} Files Selected
            </div>
            <div className="text-xs text-blue-600">
               {files.length >= 2 ? "Ready to combine into one document." : "Please select at least 2 files."}
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
            
            <h1 className="text-4xl font-bold text-slate-900 mb-4">PDFs Merged Successfully!</h1>
            <p className="text-slate-500 mb-12">Your files have been combined into a single document.</p>

            <button 
                onClick={handleDownload}
                className="bg-brand-500 hover:bg-brand-600 text-white text-xl font-bold px-12 py-5 rounded-full shadow-xl shadow-brand-200 hover:scale-105 transition-all flex items-center justify-center mx-auto"
            >
                <Download size={28} className="mr-3" />
                Download Merged PDF
            </button>

            <div className="mt-12">
               <button 
                  onClick={() => { setStatus('IDLE'); setFiles([]); setResultBlob(null); }}
                  className="text-brand-600 hover:text-brand-700 font-medium hover:underline"
               >
                  Merge more files
               </button>
            </div>
         </div>
      </div>
  );

  return (
    <ToolPageLayout
      title={t('tool.merge.title')}
      description={t('tool.merge.desc')}
      files={files}
      status={status}
      onFilesSelected={handleFileSelect}
      onRemoveFile={removeFile}
      onStart={handleMerge}
      sidebarContent={sidebarContent}
      successContent={successContent}
    />
  );
}
