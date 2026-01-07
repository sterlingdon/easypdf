'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Image as ImageIcon, X, ArrowLeft, ArrowRight, CheckCircle2, Download, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import Link from 'next/link';
import { ImagesToPdf, ImagesToPdfOptions } from '@/services/ImagesToPdf';

interface ImageFileItem {
  id: string;
  file: File;
  previewUrl: string;
}

export default function ImagesToPdfPage() {
  const { t, localizedPath } = useLanguage();
  const [files, setFiles] = useState<ImageFileItem[]>([]);
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'COMPLETED'>('IDLE');
  const [resultPdf, setResultPdf] = useState<Blob | null>(null);
  
  // Options
  const [pageSize, setPageSize] = useState<'A4' | 'fit'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<'none' | 'small' | 'big'>('small');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: ImageFileItem[] = Array.from(e.target.files).map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f,
        previewUrl: URL.createObjectURL(f)
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
        const target = prev.find(f => f.id === id);
        if (target) URL.revokeObjectURL(target.previewUrl);
        return prev.filter(f => f.id !== id);
    });
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === files.length - 1)) return;
    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    setFiles(newFiles);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setStatus('PROCESSING');
    try {
        const blob = await ImagesToPdf.convert(files.map(f => f.file), { pageSize, orientation, margin });
        setResultPdf(blob);
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

  const gridStyle = {
    backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
    backgroundPosition: 'center center'
  };

  if (status === 'COMPLETED') {
    return (
      <div className="min-h-screen bg-[#f7f7f7] pb-20" style={gridStyle}>
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
  }

  if (status === 'PROCESSING') {
    return (
        <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-semibold text-slate-700">Creating PDF...</p>
        </div>
    );
  }

  // Dashboard
  if (files.length > 0) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white px-6 py-3 flex items-center justify-between border-b border-slate-200 sticky top-0 z-30">
           <div className="flex items-center">
              <Link href={localizedPath('/')} className="p-2 hover:bg-slate-100 rounded-full mr-4 text-slate-500">
                 <ArrowLeft size={20} />
              </Link>
              <h1 className="text-lg font-bold text-slate-800">{t('tool.img2pdf.title')}</h1>
           </div>
           
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-full font-medium text-sm flex items-center transition-colors shadow-sm"
           >
             <Plus size={16} className="mr-1" />
             Add Images
           </button>
           <input type="file" multiple accept="image/jpeg,image/png" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
        </div>

        <div className="flex-grow flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
           {/* Main Canvas */}
           <div className="flex-grow p-8 overflow-y-auto bg-slate-200/50 flex flex-col items-center" style={gridStyle}>
              <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                 {files.map((item, idx) => (
                    <div key={item.id} className="group relative bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all p-3 flex flex-col animate-in fade-in slide-in-from-bottom-4">
                       <span className="absolute top-2 left-2 w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-500 text-xs font-mono rounded-full z-10">
                          {idx + 1}
                       </span>
                       
                       <div className="flex-grow flex items-center justify-center bg-slate-50 rounded-lg mb-3 border border-slate-100 overflow-hidden min-h-[160px] relative">
                          <img src={item.previewUrl} alt="preview" className="absolute inset-0 w-full h-full object-contain" />
                       </div>
                       
                       <div className="text-xs font-medium text-slate-700 truncate mb-1">{item.file.name}</div>

                       {/* Actions */}
                       <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                          <button 
                             onClick={() => moveFile(idx, 'up')} 
                             disabled={idx === 0}
                             className="p-1.5 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30"
                          >
                             <ChevronLeft size={16} />
                          </button>
                          
                          <button 
                             onClick={() => removeFile(item.id)}
                             className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors"
                          >
                             <X size={16} />
                          </button>

                          <button 
                             onClick={() => moveFile(idx, 'down')} 
                             disabled={idx === files.length - 1}
                             className="p-1.5 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30"
                          >
                             <ChevronRight size={16} />
                          </button>
                       </div>
                    </div>
                 ))}
                 
                 {/* Add Card */}
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-brand-400 hover:text-brand-500 hover:bg-brand-50/50 transition-all min-h-[220px]"
                 >
                    <Plus size={32} className="mb-2" />
                    <span className="font-medium text-sm">Add Image</span>
                 </button>
              </div>
           </div>

           {/* Sidebar Action */}
           <div className="w-full md:w-[320px] bg-white border-l border-slate-200 flex flex-col shadow-xl z-20">
               <div className="p-6 flex-grow overflow-y-auto">
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
               </div>

               <div className="p-6 border-t border-slate-100 bg-slate-50">
                  <button 
                     onClick={handleConvert}
                     className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-brand-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center"
                  >
                     Convert to PDF <ArrowRight size={20} className="ml-2" />
                  </button>
               </div>
           </div>
        </div>
      </div>
    );
  }

  // Initial Landing
  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-20" style={gridStyle}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
         <h1 className="text-5xl font-extrabold text-slate-900 mb-4">{t('tool.img2pdf.title')}</h1>
         <p className="text-xl text-slate-500 mb-12">{t('tool.img2pdf.desc')}</p>

         <div 
           className="bg-white rounded-[2.5rem] p-16 shadow-2xl shadow-slate-200/50 border border-white hover:border-brand-200 transition-all cursor-pointer group relative overflow-hidden"
           onClick={() => fileInputRef.current?.click()}
         >
            <div className="absolute inset-0 bg-brand-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            
            <button className="relative z-10 bg-brand-500 text-white text-lg font-bold px-10 py-4 rounded-full shadow-lg shadow-brand-200 group-hover:scale-105 transition-transform flex items-center justify-center mx-auto mb-8">
               <Plus size={24} className="mr-2" /> Select Images
            </button>
            
            <p className="relative z-10 text-slate-400 font-medium">
               Supports JPG, PNG
            </p>

            <input 
               type="file" 
               multiple 
               accept="image/jpeg,image/png" 
               ref={fileInputRef} 
               className="hidden" 
               onChange={handleFileSelect}
            />
         </div>
      </div>
    </div>
  );
}
