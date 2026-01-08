'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Image as ImageIcon, X, ArrowLeft, ArrowRight, CheckCircle2, Download, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import Link from 'next/link';
import { ImagesToPdf, ImagesToPdfOptions } from '@/services/ImagesToPdf';

import { ToolPageLayout } from './ToolPageLayout';
import { FileItem, ProcessingStatus } from '@/types';

export default function ImagesToPdfPage() {
  const { t, localizedPath } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [resultPdf, setResultPdf] = useState<Blob | null>(null);
  
  // Options
  const [pageSize, setPageSize] = useState<'A4' | 'fit'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<'none' | 'small' | 'big'>('small');
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: FileItem[] = Array.from(e.target.files).map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f,
        thumbnailUrl: URL.createObjectURL(f),
        pages: 1,
        width: 0,
        height: 0
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
        const target = prev.find(f => f.id === id);
        if (target && target.thumbnailUrl) URL.revokeObjectURL(target.thumbnailUrl);
        return prev.filter(f => f.id !== id);
    });
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setStatus('PROCESSING');
    try {
        const blob = await ImagesToPdf.convert(files.map(f => f.file), { pageSize, orientation, margin });
        setResultPdf(blob);
        
        // Simulate progress for UX consistency
        await new Promise(r => setTimeout(r, 1000));
        
        setStatus('COMPLETED');
    } catch (error) {
        console.error(error);
        alert('Conversion failed: ' + error);
        setStatus('IDLE');
    }
  };

  const handleDownload = () => {
    if (!resultPdf) return;
    const url = URL.createObjectURL(resultPdf);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'images_merged.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sidebarContent = (
      <>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
             <Settings size={20} className="mr-2" />
             PDF Settings
        </h2>
        
        <div className="space-y-6">
             {/* Page Size */}
             <div>
                 <label className="text-sm font-bold text-slate-700 block mb-2">Page Size</label>
                 <div className="flex gap-2">
                     <button
                         onClick={() => setPageSize('A4')}
                         className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${pageSize === 'A4' ? 'bg-brand-500 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                     >
                         A4
                     </button>
                     <button
                         onClick={() => setPageSize('fit')}
                         className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${pageSize === 'fit' ? 'bg-brand-500 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                     >
                         Fit to Image
                     </button>
                 </div>
             </div>

             {/* Orientation */}
             <div>
                 <label className="text-sm font-bold text-slate-700 block mb-2">Orientation</label>
                 <div className="flex gap-2">
                     <button
                         onClick={() => setOrientation('portrait')}
                         className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${orientation === 'portrait' ? 'bg-brand-500 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                     >
                         Portrait
                     </button>
                     <button
                         onClick={() => setOrientation('landscape')}
                         className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${orientation === 'landscape' ? 'bg-brand-500 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                     >
                         Landscape
                     </button>
                 </div>
             </div>

             {/* Margin */}
             <div>
                 <label className="text-sm font-bold text-slate-700 block mb-2">Margin</label>
                 <div className="grid grid-cols-3 gap-2">
                     {['none', 'small', 'big'].map((m) => (
                         <button
                             key={m}
                             onClick={() => setMargin(m as any)}
                             className={`py-2 rounded-lg text-sm font-medium capitalize transition-all ${margin === m ? 'bg-brand-500 text-white shadow' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                         >
                             {m}
                         </button>
                     ))}
                 </div>
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
            
            <h1 className="text-4xl font-bold text-slate-900 mb-4">PDF Created Successfully!</h1>
            <p className="text-slate-500 mb-12">Your images have been combined into a PDF.</p>

            <button 
                onClick={handleDownload}
                className="bg-brand-500 hover:bg-brand-600 text-white text-xl font-bold px-12 py-5 rounded-full shadow-xl shadow-brand-200 hover:scale-105 transition-all flex items-center justify-center mx-auto"
            >
                <Download size={28} className="mr-3" />
                Download PDF
            </button>

            <div className="mt-12">
               <button 
                  onClick={() => { setStatus('IDLE'); setFiles([]); setResultPdf(null); }}
                  className="text-brand-600 hover:text-brand-700 font-medium hover:underline"
               >
                  Convert more images
               </button>
            </div>
         </div>
      </div>
  );

  return (
    <ToolPageLayout
      title={t('tool.img2pdf.title')}
      description={t('tool.img2pdf.desc')}
      files={files}
      status={status}
      onFilesSelected={handleFileSelect}
      onRemoveFile={removeFile}
      onStart={handleConvert}
      sidebarContent={sidebarContent}
      successContent={successContent}
      accept="image/jpeg,image/png"
    />
  );
}
