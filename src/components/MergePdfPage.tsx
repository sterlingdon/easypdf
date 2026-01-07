'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, FileText, X, ArrowLeft, ArrowRight, CheckCircle2, Download, Share2, ChevronDown, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { PdfMerger } from '@/services/PdfMerger';

type ProcessingStatus = 'IDLE' | 'PROCESSING' | 'COMPLETED';

interface FileItem {
  id: string;
  file: File;
  pages: number; // We might not know pages immediately without loading, can default to ?
  sizeStr: string;
}

export default function MergePdfPage() {
  const { t, localizedPath } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: FileItem[] = Array.from(e.target.files).map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f,
        pages: 0, // Placeholder
        sizeStr: (f.size / 1024 / 1024).toFixed(2) + ' MB'
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
    // Reset value to allow selecting same files again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === files.length - 1)) return;
    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    setFiles(newFiles);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      alert("Please select at least 2 PDF files to merge.");
      return;
    }

    setStatus('PROCESSING');
    try {
      const mergedBlob = await PdfMerger.merge(files.map(f => f.file));
      setResultBlob(mergedBlob);
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
  }

  if (status === 'PROCESSING') {
    return (
        <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-semibold text-slate-700">Merging PDFs...</p>
        </div>
    );
  }

  // Dashboard / File List
  if (files.length > 0) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white px-6 py-3 flex items-center justify-between border-b border-slate-200 sticky top-0 z-30">
           <div className="flex items-center">
              <Link href={localizedPath('/')} className="p-2 hover:bg-slate-100 rounded-full mr-4 text-slate-500">
                 <ArrowLeft size={20} />
              </Link>
              <h1 className="text-lg font-bold text-slate-800">{t('tool.merge.title')}</h1>
           </div>
           
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-full font-medium text-sm flex items-center transition-colors shadow-sm"
           >
             <Plus size={16} className="mr-1" />
             Add More
           </button>
           <input type="file" multiple accept=".pdf" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
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
                       
                       <div className="flex-grow flex items-center justify-center bg-slate-50 rounded-lg mb-3 border border-slate-100 overflow-hidden min-h-[160px]">
                          <FileText size={48} className="text-slate-300" />
                       </div>
                       
                       <div className="text-xs font-medium text-slate-700 truncate mb-1">{item.file.name}</div>
                       <div className="text-[10px] text-slate-400 mb-2">{item.sizeStr}</div>

                       {/* Actions */}
                       <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                          <button 
                             onClick={() => moveFile(idx, 'up')} 
                             disabled={idx === 0}
                             className="p-1.5 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30"
                             title="Move Left/Up"
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
                             title="Move Right/Down"
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
                    <span className="font-medium text-sm">Add PDF</span>
                 </button>
              </div>
           </div>

           {/* Sidebar Action */}
           <div className="w-full md:w-[320px] bg-white border-l border-slate-200 flex flex-col shadow-xl z-20">
               <div className="p-6 flex-grow">
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
                         Ready to combine into one document.
                      </div>
                   </div>
               </div>

               <div className="p-6 border-t border-slate-100 bg-slate-50">
                  <button 
                     onClick={handleMerge}
                     className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-brand-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center"
                  >
                     {t('tool.merge.title')} <ArrowRight size={20} className="ml-2" />
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
         <h1 className="text-5xl font-extrabold text-slate-900 mb-4">{t('tool.merge.title')}</h1>
         <p className="text-xl text-slate-500 mb-12">{t('tool.merge.desc')}</p>

         <div 
           className="bg-white rounded-[2.5rem] p-16 shadow-2xl shadow-slate-200/50 border border-white hover:border-brand-200 transition-all cursor-pointer group relative overflow-hidden"
           onClick={() => fileInputRef.current?.click()}
         >
            <div className="absolute inset-0 bg-brand-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            
            <button className="relative z-10 bg-brand-500 text-white text-lg font-bold px-10 py-4 rounded-full shadow-lg shadow-brand-200 group-hover:scale-105 transition-transform flex items-center justify-center mx-auto mb-8">
               <Plus size={24} className="mr-2" /> Select PDF Files
            </button>
            
            <p className="relative z-10 text-slate-400 font-medium">
               or drop PDFs here
            </p>

            <input 
               type="file" 
               multiple 
               accept=".pdf" 
               ref={fileInputRef} 
               className="hidden" 
               onChange={handleFileSelect}
            />
         </div>
         
         <div className="mt-16 text-left max-w-2xl mx-auto">
             <h3 className="text-lg font-bold text-slate-900 mb-4">How to merge PDF files?</h3>
             <ol className="list-decimal pl-5 space-y-2 text-slate-600">
                <li>Select the PDF files you want to merge.</li>
                <li>Rearrange the files in the desired order.</li>
                <li>Click the "Merge PDF" button to combine them.</li>
                <li>Download your single merged PDF file.</li>
             </ol>
         </div>
      </div>
    </div>
  );
}
