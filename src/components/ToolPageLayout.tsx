import React, { useRef } from 'react';
import { ArrowLeft, ArrowRight, Plus, FileText, X, CheckCircle2, Clock, Share2, Download, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileItem, ProcessingStatus } from '@/types';

interface ToolPageLayoutProps {
  title: string;
  description: string;
  files: FileItem[];
  status: ProcessingStatus;
  
  // State
  progress?: number;
  elapsedTime?: number;
  
  // Actions
  onFilesSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (id: string) => void;
  onStart: () => void;
  
  // Slots
  sidebarContent: React.ReactNode;
  successContent?: React.ReactNode;
  
  // Customization
  accept?: string; // e.g. ".pdf"
  maxFiles?: number;
}

export const ToolPageLayout: React.FC<ToolPageLayoutProps> = ({
  title,
  description,
  files,
  status,
  progress = 0,
  elapsedTime = 0,
  onFilesSelected,
  onRemoveFile,
  onStart,
  sidebarContent,
  successContent,
  accept = ".pdf",
  maxFiles
}) => {
  const { t, localizedPath } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Background Grid Style
  const gridStyle = {
    backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
    backgroundPosition: 'center center'
  };

  const handleAddMore = () => {
    fileInputRef.current?.click();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // 1. Success State
  if (status === 'COMPLETED') {
    if (successContent) return <>{successContent}</>;
    
    // Default success view if none provided (basic fallback)
    return (
       <div className="min-h-screen bg-[#f7f7f7] pb-20" style={gridStyle}>
         <div className="bg-transparent px-6 py-4">
           <Link href={localizedPath('/')} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors">
              <ArrowLeft size={20} />
           </Link>
         </div>
         <div className="max-w-4xl mx-auto px-4 mt-10 text-center">
            <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('common.completed') || 'Processing Completed!'}</h2>
            <div className="flex justify-center space-x-4">
                <Link href={localizedPath('/')} className="bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold">
                    {t('common.home') || 'Go Home'}
                </Link>
            </div>
         </div>
       </div>
    );
  }

  // 2. Processing State
  if (status === 'PROCESSING') {
    return (
      <div className="fixed inset-0 z-50 bg-[#f3e6e8] flex flex-col items-center justify-center font-sans">
        <div className="bg-white rounded-[32px] p-16 shadow-xl w-full max-w-2xl text-center relative overflow-hidden">
           {/* Progress Content */}
           <div className="relative z-10">
             <div className="text-8xl font-bold text-slate-900 mb-6 tracking-tighter">
               {Math.round(progress)}%
             </div>
             
             <div className="flex items-center justify-center text-xl text-slate-500 mb-8 font-medium">
               <span className="mr-2">🏔️</span> {t('compress.working') || 'Processing...'}
             </div>

             <div className="flex items-center justify-center space-x-12 text-sm font-medium text-slate-400">
                <div className="flex flex-col items-center">
                   <span className="text-slate-900 mb-1">{t('compress.time') || 'Time'}: <span className="font-bold">{formatTime(elapsedTime)}</span></span>
                </div>
                <div className="flex flex-col items-center">
                   <span className="text-slate-900 mb-1">{t('compress.completed') || 'Files'}: <span className="font-bold">{Math.floor((progress / 100) * files.length)}/{files.length}</span></span>
                </div>
             </div>

             {/* Pacman Loader Simulation */}
             <div className="mt-12 flex justify-center">
               <div className="relative w-12 h-12 animate-bounce">
                  <div className="absolute inset-0 bg-slate-900 rounded-full" style={{clipPath: 'polygon(100% 74%, 44% 48%, 100% 21%, 100% 0, 0 0, 0 100%, 100% 100%)'}}></div>
                  <div className="absolute top-2 left-4 w-1.5 h-1.5 bg-white rounded-full"></div>
               </div>
               <div className="ml-4 flex items-center space-x-3">
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-ping"></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-ping delay-75"></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-ping delay-150"></div>
               </div>
             </div>
           </div>
        </div>
      </div>
    );
  }

  // 3. Dashboard / Workspace View (Files selected)
  if (files.length > 0) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        {/* Toolbar Header */}
        <div className="bg-white px-6 py-3 flex items-center justify-between border-b border-slate-200 sticky top-0 z-30">
           <div className="flex items-center">
              <Link href={localizedPath('/')} className="p-2 hover:bg-slate-100 rounded-full mr-4 text-slate-500">
                 <ArrowLeft size={20} />
              </Link>
              <h1 className="text-lg font-bold text-slate-800">{title}</h1>
           </div>
           
           {(!maxFiles || files.length < maxFiles) && (
             <button 
               onClick={handleAddMore}
               className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-full font-medium text-sm flex items-center transition-colors shadow-sm"
             >
               <Plus size={16} className="mr-1" />
               {t('compress.add_pdfs') || 'Add Files'}
               <span className="bg-white/20 text-white ml-2 px-1.5 py-0.5 rounded text-xs">{files.length}</span>
             </button>
           )}
           <input type="file" multiple={!maxFiles || maxFiles > 1} accept={accept} ref={fileInputRef} className="hidden" onChange={onFilesSelected} />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8 items-start w-full">
           {/* Left: Canvas / File Grid */}
           <div className="flex-grow w-full">
              <div className="flex items-center justify-between mb-6">
                 <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                 {(!maxFiles || files.length < maxFiles) && (
                   <button 
                     onClick={handleAddMore}
                     className="bg-brand-50 hover:bg-brand-100 text-brand-600 px-4 py-2 rounded-xl font-medium text-sm flex items-center transition-colors"
                   >
                     <Plus size={18} className="mr-2" />
                     {t('compress.add_pdfs') || 'Add Files'}
                   </button>
                 )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                 {files.map((item, idx) => (
                    <div key={item.id} className="group relative bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-brand-100 transition-all aspect-[3/4] flex flex-col p-4 animate-in fade-in zoom-in duration-300">
                       <div className="absolute top-3 left-3 bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-mono z-10 font-medium">
                          #{idx + 1}
                       </div>
                       
                       <div className="flex-grow flex items-center justify-center bg-slate-50 rounded-xl mb-4 border border-slate-50 overflow-hidden relative">
                          {item.thumbnailUrl ? (
                              <img src={item.thumbnailUrl} alt="Preview" className="w-full h-full object-contain" />
                          ) : (
                              <FileText size={48} className="text-slate-300" />
                          )}
                       </div>
                       <div className="text-sm font-bold text-slate-800 truncate mb-1">{item.file.name}</div>
                       <div className="flex justify-between items-end">
                         <div className="text-xs text-slate-400 font-medium">
                            {item.pages} Pages • {(item.file.size / 1024 / 1024).toFixed(1)} MB
                         </div>
                       </div>
                       
                       <button 
                          onClick={(e) => {
                             e.stopPropagation();
                             onRemoveFile(item.id);
                          }}
                          className="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 rounded-full p-1.5 shadow-sm opacity-100 transition-all z-20 cursor-pointer"
                       >
                          <X size={16} />
                       </button>
                    </div>
                 ))}
                 
                 {/* Add More Placehoder */}
                 {(!maxFiles || files.length < maxFiles) && (
                   <button 
                      onClick={handleAddMore}
                      className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-brand-400 hover:text-brand-500 hover:bg-brand-50/30 transition-all aspect-[3/4] group"
                   >
                      <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-brand-100 flex items-center justify-center mb-3 transition-colors">
                          <Plus size={24} className="group-hover:text-brand-600" />
                      </div>
                      <span className="font-medium text-sm">Add PDF</span>
                   </button>
                 )}
              </div>
           </div>

           {/* Right: Settings Panel (Floating) */}
           <div className="w-full lg:w-[420px] flex-shrink-0 sticky top-8">
               <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100 overflow-hidden">
                  <div className="p-6">
                     {sidebarContent}
                  </div>

                  {/* Start Button Area */}
                  <div className="p-6 bg-slate-50 border-t border-slate-100">
                     <button 
                        onClick={onStart}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xl py-4 rounded-2xl shadow-xl shadow-brand-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center group"
                     >
                        {t('compress.start') || 'Start Processing'} 
                        <div className="bg-white/20 p-1 rounded-full ml-3 group-hover:translate-x-1 transition-transform">
                             <ArrowRight size={20} />
                        </div>
                     </button>
                  </div>
               </div>
           </div>
        </div>
      </div>
    );
  }

  // 4. Initial Upload View
  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-20" style={gridStyle}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
         <h1 className="text-5xl font-extrabold text-slate-900 mb-4">{title}</h1>
         <p className="text-xl text-slate-500 mb-12">{description}</p>

         <div 
           className="bg-white rounded-[2.5rem] p-16 shadow-2xl shadow-slate-200/50 border border-white hover:border-brand-200 transition-all cursor-pointer group relative overflow-hidden"
           onClick={() => fileInputRef.current?.click()}
         >
            <div className="absolute inset-0 bg-brand-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            
            <button className="relative z-10 bg-brand-500 text-white text-lg font-bold px-10 py-4 rounded-full shadow-lg shadow-brand-200 group-hover:scale-105 transition-transform flex items-center justify-center mx-auto mb-8">
               <Plus size={24} className="mr-2" /> {t('compress.import') || 'Select PDFs'}
            </button>
            
            <p className="relative z-10 text-slate-400 font-medium">
               {t('compress.drop_hint') || 'or Drop PDF files here'} <span className="bg-slate-100 px-2 py-1 rounded text-slate-500 text-sm border border-slate-200 mx-1">folder</span>
            </p>

            <input 
               type="file" 
               multiple 
               accept={accept}
               ref={fileInputRef} 
               className="hidden" 
               onChange={onFilesSelected}
            />
         </div>

         {/* Try these Examples */}
         <div className="mt-16">
            <p className="text-slate-500 font-medium mb-6">{t('compress.try_these') || 'Try these examples'}</p>
            <div className="flex justify-center space-x-6">
               {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-20 h-28 bg-white shadow-md rounded-lg border border-slate-100 flex items-center justify-center cursor-pointer hover:-translate-y-2 transition-transform">
                     <FileText size={32} className="text-slate-200" />
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};
