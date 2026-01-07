import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, Check, FileText, X, ArrowLeft, ArrowRight, CheckCircle2, Clock, Download, Share, Share2, ChevronDown, Lock, Scissors, Copy, Image } from 'lucide-react';
import { Link } from 'react-router-dom';

type ProcessingStatus = 'IDLE' | 'PROCESSING' | 'COMPLETED';
type QualityOption = 'QUALITY' | 'EXTREME';
type PdfType = 'NATIVE' | 'BITMAP';

interface FileItem {
  id: string;
  file: File;
  pages: number; 
  width: number; 
  height: number;
}

interface ProcessedFileItem extends FileItem {
  originalSize: number;
  compressedSize: number;
  percentSaved: number;
}

export const CompressPdf: React.FC = () => {
  const { t, localizedPath } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFileItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [quality, setQuality] = useState<QualityOption>('QUALITY');
  const [pdfType, setPdfType] = useState<PdfType>('NATIVE');
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: FileItem[] = Array.from(e.target.files).map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f,
        pages: Math.floor(Math.random() * 50) + 1, 
        width: 210, 
        height: 297 
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleStart = () => {
    setStatus('PROCESSING');
    setProgress(0);
    setElapsedTime(0);

    // Timer for elapsed time
    timerRef.current = window.setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // Mock progress animation
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        if (timerRef.current) clearInterval(timerRef.current);
        
        // Generate mock results
        const results = files.map(f => {
          const reduction = 0.3 + Math.random() * 0.4; // 30-70% reduction
          return {
            ...f,
            originalSize: f.file.size,
            compressedSize: Math.floor(f.file.size * (1 - reduction)),
            percentSaved: Math.round(reduction * 100)
          };
        });
        setProcessedFiles(results);
        
        setTimeout(() => setStatus('COMPLETED'), 500);
      }
      setProgress(Math.min(currentProgress, 100));
    }, 200);
  };

  const handleAddMore = () => {
    fileInputRef.current?.click();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(1) + 'MB';
  };

  // Background Grid Style
  const gridStyle = {
    backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
    backgroundPosition: 'center center'
  };

  if (status === 'COMPLETED') {
    const totalOriginal = processedFiles.reduce((acc, curr) => acc + curr.originalSize, 0);
    const totalCompressed = processedFiles.reduce((acc, curr) => acc + curr.compressedSize, 0);
    const totalSavedPercent = Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100);

    return (
      <div className="min-h-screen bg-[#f7f7f7] pb-20" style={gridStyle}>
        {/* Navigation Bar (Simulated overlay header or use standard header, we will use a back button bar here for context) */}
         <div className="bg-transparent px-6 py-4">
           <Link to={localizedPath('/')} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors">
              <ArrowLeft size={20} />
           </Link>
         </div>

         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            
            {/* Success Status */}
            <div className="text-center mb-10">
               <div className="flex items-center justify-center space-x-3 mb-6">
                  <CheckCircle2 size={32} className="text-green-500 fill-current" />
                  <h2 className="text-3xl font-bold text-slate-900">
                    {t('compress.files_processed').replace('{count}', processedFiles.length.toString())}
                  </h2>
               </div>

               <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 font-medium">
                  <div className="flex items-center">
                     <FileText size={16} className="mr-2" />
                     <span>{formatSize(totalOriginal)}</span>
                     <ArrowRight size={14} className="mx-2 text-slate-400" />
                     <span className="text-slate-900 font-bold">{formatSize(totalCompressed)}</span>
                     <span className="ml-2 text-green-600">(-{totalSavedPercent}%)</span>
                  </div>
                  <div className="flex items-center">
                     <Clock size={16} className="mr-2" />
                     <span>{formatTime(elapsedTime)}</span>
                  </div>
                  <button className="border-b border-dashed border-slate-400 hover:border-slate-800 hover:text-slate-900 transition-colors">
                     {t('compress.save_as')}
                  </button>
                  <button className="border-b border-dashed border-slate-400 hover:border-slate-800 hover:text-slate-900 transition-colors">
                     {t('compress.download_one')}
                  </button>
               </div>
            </div>

            {/* Main Actions */}
            <div className="flex justify-center items-center space-x-4 mb-12">
               <button className="bg-brand-500 hover:bg-brand-600 text-white text-lg font-bold px-10 py-4 rounded-full shadow-lg shadow-brand-200 hover:shadow-xl hover:scale-105 transition-all flex items-center">
                  <Download size={24} className="mr-2" />
                  {t('compress.download_zip')}
               </button>
               <button className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-4 rounded-full transition-colors">
                  <Share2 size={24} />
               </button>
            </div>

            {/* Continue Processing Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 flex items-center justify-center flex-wrap gap-2 mb-12 max-w-4xl mx-auto">
               <span className="text-sm text-slate-500 mr-2">{t('compress.continue')}</span>
               <Link to="#" className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium flex items-center hover:bg-red-100 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div> {t('menu.merge_pdfs')}
               </Link>
               <Link to="#" className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 text-xs font-medium flex items-center hover:bg-orange-100 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-orange-400 mr-2"></div> {t('menu.split_pdf')}
               </Link>
               <Link to="#" className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium flex items-center hover:bg-blue-100 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div> {t('menu.remove_pages')}
               </Link>
               <Link to="#" className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 text-xs font-medium flex items-center hover:bg-purple-100 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mr-2"></div> {t('menu.pdf_to_image')}
               </Link>
               <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium flex items-center hover:bg-slate-200 transition-colors">
                  {t('nav.more')} <ChevronDown size={12} className="ml-1" />
               </button>
            </div>

            {/* Processed Files Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
               {processedFiles.map((file, idx) => (
                  <div key={file.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-stretch hover:shadow-md transition-shadow">
                     {/* Preview Area */}
                     <div className="w-1/3 bg-slate-50 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-100">
                        <FileText size={48} className="text-slate-200" />
                        
                        {/* Discount Badge */}
                        <div className="absolute bottom-0 right-0 bg-slate-900/80 text-white text-xl font-bold px-3 py-1 rounded-tl-xl backdrop-blur-sm">
                           -{file.percentSaved}%
                        </div>
                        <div className="absolute top-2 left-2 text-[10px] text-slate-400 font-mono">#{idx + 1}</div>
                     </div>

                     {/* Info Area */}
                     <div className="w-2/3 pl-5 flex flex-col justify-between py-1">
                        <div>
                           <div className="flex items-center text-xs text-slate-500 font-medium mb-1">
                              <span>{formatSize(file.originalSize)}</span>
                              <ArrowRight size={12} className="mx-1" />
                              <span className="text-slate-900 font-bold">{formatSize(file.compressedSize)}</span>
                           </div>
                           <div className="flex items-center text-[10px] font-bold tracking-wider mb-2">
                              <span className="text-slate-400">PDF</span>
                              <ArrowRight size={10} className="mx-1 text-slate-300" />
                              <span className="text-brand-500">PDF</span>
                           </div>
                           <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug" title={file.file.name}>
                              {file.file.name}
                           </h3>
                           <p className="text-xs text-slate-400 mt-1">{t('compress.completed')}</p>
                        </div>

                        <div className="flex items-center space-x-2 mt-4">
                           <button className="flex-grow bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-medium py-2 rounded-xl text-sm flex items-center justify-center transition-all">
                              <Download size={16} className="mr-2" />
                              {t('compress.download')}
                           </button>
                           <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors">
                              <Share size={16} />
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    );
  }

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
               <span className="mr-2">🏔️</span> {t('compress.working')}
             </div>

             <div className="flex items-center justify-center space-x-12 text-sm font-medium text-slate-400">
                <div className="flex flex-col items-center">
                   <span className="text-slate-900 mb-1">{t('compress.time')}: <span className="font-bold">{formatTime(elapsedTime)}</span></span>
                </div>
                <div className="flex flex-col items-center">
                   <span className="text-slate-900 mb-1">{t('compress.completed')}: <span className="font-bold">{Math.floor((progress / 100) * files.length)}/{files.length}</span></span>
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

  // File List View (Dashboard)
  if (files.length > 0) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        {/* Toolbar Header */}
        <div className="bg-white px-6 py-3 flex items-center justify-between border-b border-slate-200 sticky top-0 z-30">
           <div className="flex items-center">
              <Link to={localizedPath('/')} className="p-2 hover:bg-slate-100 rounded-full mr-4 text-slate-500">
                 <ArrowLeft size={20} />
              </Link>
              <h1 className="text-lg font-bold text-slate-800">{t('tool.compress.title')}</h1>
           </div>
           
           <button 
             onClick={handleAddMore}
             className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-full font-medium text-sm flex items-center transition-colors shadow-sm"
           >
             <Plus size={16} className="mr-1" />
             {t('compress.add_pdfs')}
             <span className="bg-white/20 text-white ml-2 px-1.5 py-0.5 rounded text-xs">{files.length}</span>
           </button>
           <input type="file" multiple accept=".pdf" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
        </div>

        <div className="flex-grow flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
           {/* Left: Canvas / File Grid */}
           <div className="flex-grow p-6 overflow-y-auto bg-slate-200/50" style={gridStyle}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                 {files.map((item, idx) => (
                    <div key={item.id} className="group relative bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow aspect-[3/4] flex flex-col p-3">
                       <div className="absolute top-2 left-2 bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded font-mono">
                          #{idx + 1}
                       </div>
                       <div className="flex-grow flex items-center justify-center bg-slate-50 rounded-lg mb-3 border border-slate-100 overflow-hidden relative">
                          <FileText size={48} className="text-slate-300" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/5 transition-opacity">
                          </div>
                       </div>
                       <div className="text-xs font-medium text-slate-700 truncate mb-0.5">{item.file.name}</div>
                       <div className="flex justify-between items-end">
                         <div className="text-[10px] text-slate-400">
                            {item.pages} Pages <br/>
                            {(item.file.size / 1024 / 1024).toFixed(2)} MB
                         </div>
                         <div className="text-[10px] bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded font-bold">PDF</div>
                       </div>
                       <button className="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-red-500 rounded-full p-1 shadow border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={14} />
                       </button>
                    </div>
                 ))}
              </div>
           </div>

           {/* Right: Settings Sidebar */}
           <div className="w-full md:w-[360px] bg-white border-l border-slate-200 flex flex-col shadow-xl z-20">
              <div className="p-6 flex-grow overflow-y-auto">
                 <h2 className="text-xl font-bold text-slate-900 mb-6">{t('tool.compress.title')}</h2>
                 
                 <div className="space-y-4">
                    {/* Quality Option 1 */}
                    <div 
                      onClick={() => setQuality('QUALITY')}
                      className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${quality === 'QUALITY' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-200'}`}
                    >
                       <div className="flex items-start justify-between mb-2">
                          <div className="font-bold text-slate-800 flex items-center">
                             {t('compress.quality_first')}
                          </div>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${quality === 'QUALITY' ? 'bg-brand-500 text-white' : 'border-2 border-slate-300'}`}>
                             {quality === 'QUALITY' && <Check size={12} />}
                          </div>
                       </div>
                       <p className="text-xs text-slate-500 leading-relaxed">
                          {t('compress.quality_first_desc')}
                       </p>
                    </div>

                    {/* Quality Option 2 */}
                    <div 
                      onClick={() => setQuality('EXTREME')}
                      className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${quality === 'EXTREME' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-200'}`}
                    >
                       <div className="flex items-start justify-between mb-2">
                          <div className="font-bold text-slate-800 flex items-center">
                             {t('compress.high_strength')}
                          </div>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${quality === 'EXTREME' ? 'bg-brand-500 text-white' : 'border-2 border-slate-300'}`}>
                             {quality === 'EXTREME' && <Check size={12} />}
                          </div>
                       </div>
                       <p className="text-xs text-slate-500 leading-relaxed">
                          {t('compress.high_strength_desc')}
                       </p>
                    </div>
                 </div>

                 {/* Native/Bitmap Tabs */}
                 <div className="mt-8 bg-slate-100 p-1 rounded-xl flex">
                    <button 
                      onClick={() => setPdfType('NATIVE')}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${pdfType === 'NATIVE' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                       {t('compress.native_pdf')}
                    </button>
                    <button 
                      onClick={() => setPdfType('BITMAP')}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${pdfType === 'BITMAP' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                       {t('compress.bitmap_pdf')}
                    </button>
                 </div>
                 
                 <div className="mt-4 text-[10px] text-slate-400 leading-normal">
                    * The PDF text remains vector, and only the images within the PDF are compressed.<br/>
                    * Retain all the original information such as the document outline, title information, and so on.
                 </div>
              </div>

              {/* Start Button */}
              <div className="p-6 border-t border-slate-100 bg-white">
                 <button 
                    onClick={handleStart}
                    className="w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-xl py-4 rounded-3xl shadow-lg shadow-brand-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center"
                 >
                    {t('compress.start')} <ArrowRight size={24} className="ml-2" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // Initial Upload View
  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-20" style={gridStyle}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
         <h1 className="text-5xl font-extrabold text-slate-900 mb-4">{t('tool.compress.title')}</h1>
         <p className="text-xl text-slate-500 mb-12">{t('tool.compress.desc')}</p>

         <div 
           className="bg-white rounded-[2.5rem] p-16 shadow-2xl shadow-slate-200/50 border border-white hover:border-brand-200 transition-all cursor-pointer group relative overflow-hidden"
           onClick={() => fileInputRef.current?.click()}
         >
            <div className="absolute inset-0 bg-brand-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            
            <button className="relative z-10 bg-brand-500 text-white text-lg font-bold px-10 py-4 rounded-full shadow-lg shadow-brand-200 group-hover:scale-105 transition-transform flex items-center justify-center mx-auto mb-8">
               <Plus size={24} className="mr-2" /> {t('compress.import')}
            </button>
            
            <p className="relative z-10 text-slate-400 font-medium">
               {t('compress.drop_hint')} <span className="bg-slate-100 px-2 py-1 rounded text-slate-500 text-sm border border-slate-200 mx-1">folder</span> <span className="bg-slate-100 px-2 py-1 rounded text-slate-500 text-sm border border-slate-200">⌘ + V</span>
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

         {/* Try these Examples */}
         <div className="mt-16">
            <p className="text-slate-500 font-medium mb-6">{t('compress.try_these')}</p>
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