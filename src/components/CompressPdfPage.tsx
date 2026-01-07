'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Check, FileText, X, ArrowLeft, ArrowRight, CheckCircle2, Clock, Download, Share, Share2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { PdfCompressor } from '@/services/PdfCompressor';
import JSZip from 'jszip';

type ProcessingStatus = 'IDLE' | 'PROCESSING' | 'COMPLETED';
type QualityOption = 'QUALITY' | 'EXTREME';
type PdfType = 'NATIVE' | 'BITMAP';

interface FileItem {
  id: string;
  file: File;
  pages: number; 
  width: number; 
  height: number;
  thumbnailUrl?: string; // Preview image
}

interface ProcessedFileItem extends FileItem {
  originalSize: number;
  compressedSize: number;
  percentSaved: number;
  blob: Blob;
  downloadUrl: string;
}

export default function CompressPdf() {
  const { t, localizedPath } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFileItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [quality, setQuality] = useState<QualityOption>('QUALITY');
  const [pdfType, setPdfType] = useState<PdfType>('BITMAP');
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const removeFile = (id: string) => {
    setFiles(prev => {
        const target = prev.find(f => f.id === id);
        if (target && target.thumbnailUrl) URL.revokeObjectURL(target.thumbnailUrl);
        return prev.filter(f => f.id !== id);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const pdfjsLib = await import('pdfjs-dist');
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        const workerUrl = new URL(
          'pdfjs-dist/build/pdf.worker.mjs',
          import.meta.url
        ).href;
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
      }

      const newFilesPromises = Array.from(e.target.files).map(async (f) => {
        const arrayBuffer = await f.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        
        // Generate Thumbnail from Page 1
        let thumbnailUrl = undefined;
        try {
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 0.5 }); // Thumbnail scale
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            if (context) {
                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                    canvas: canvas as any // Satisfy strict types if needed
                }).promise;
                thumbnailUrl = canvas.toDataURL();
            }
        } catch (err) {
            console.error("Error generating thumbnail", err);
        }

        return {
          id: Math.random().toString(36).substr(2, 9),
          file: f,
          pages: numPages, 
          width: 210, 
          height: 297,
          thumbnailUrl
        };
      });

      const newFiles = await Promise.all(newFilesPromises);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleStart = async () => {
    setStatus('PROCESSING');
    setProgress(0);
    setElapsedTime(0);
    setProcessedFiles([]);

    // Timer for elapsed time
    timerRef.current = window.setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    const results: ProcessedFileItem[] = [];
    const totalFiles = files.length;
    
    try {
        for (let i = 0; i < totalFiles; i++) {
            const fileItem = files[i];
            
            // Calculate progress chunk for this file
            const startProgress = (i / totalFiles) * 100;
            const endProgress = ((i + 1) / totalFiles) * 100;

            const compressedBlob = await PdfCompressor.compress(fileItem.file, {
                quality,
                type: pdfType,
                onProgress: (p) => {
                     // Map file progress (0-100) to global progress range
                     const globalP = startProgress + (p / 100) * (endProgress - startProgress);
                     setProgress(globalP);
                }
            });

            const originalSize = fileItem.file.size;
            const compressedSize = compressedBlob.size;
            // Ensure we don't show negative savings if it got bigger (unlikely with bitmap, possible with native)
            const percentSaved = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));
            const downloadUrl = URL.createObjectURL(compressedBlob);

            results.push({
                ...fileItem,
                originalSize,
                compressedSize,
                percentSaved,
                blob: compressedBlob,
                downloadUrl
            });
        }

        setProcessedFiles(results);
        setProgress(100);
        
        if (timerRef.current) window.clearInterval(timerRef.current);
        
        // Small delay to show 100%
        setTimeout(() => setStatus('COMPLETED'), 500);

    } catch (error) {
        console.error("Compression failed", error);
        alert("Compression failed: " + (error instanceof Error ? error.message : String(error)));
        setStatus('IDLE');
        if (timerRef.current) window.clearInterval(timerRef.current);
    }
  };

  const handleDownload = (item: ProcessedFileItem) => {
    const link = document.createElement('a');
    link.href = item.downloadUrl;
    link.download = `compressed_${item.file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadZip = async () => {
    if (processedFiles.length === 0) return;
    
    const zip = new JSZip();
    processedFiles.forEach(item => {
        zip.file(`compressed_${item.file.name}`, item.blob);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'compressed_pdfs.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
           <Link href={localizedPath('/')} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors">
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
               <button 
                  onClick={handleDownloadZip}
                  className="bg-brand-500 hover:bg-brand-600 text-white text-lg font-bold px-10 py-4 rounded-full shadow-lg shadow-brand-200 hover:shadow-xl hover:scale-105 transition-all flex items-center"
               >
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
               <Link href="#" className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium flex items-center hover:bg-red-100 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div> {t('menu.merge_pdfs')}
               </Link>
               <Link href="#" className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 text-xs font-medium flex items-center hover:bg-orange-100 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-orange-400 mr-2"></div> {t('menu.split_pdf')}
               </Link>
               <Link href="#" className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium flex items-center hover:bg-blue-100 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div> {t('menu.remove_pages')}
               </Link>
               <Link href="#" className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 text-xs font-medium flex items-center hover:bg-purple-100 transition-colors">
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
                           <button 
                              onClick={() => handleDownload(file)}
                              className="flex-grow bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-medium py-2 rounded-xl text-sm flex items-center justify-center transition-all"
                           >
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
              <Link href={localizedPath('/')} className="p-2 hover:bg-slate-100 rounded-full mr-4 text-slate-500">
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

        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8 items-start">
           {/* Left: Canvas / File Grid */}
           <div className="flex-grow w-full">
              <div className="flex items-center justify-between mb-6">
                 <h1 className="text-2xl font-bold text-slate-900">{t('tool.compress.title')}</h1>
                 <button 
                   onClick={handleAddMore}
                   className="bg-brand-50 hover:bg-brand-100 text-brand-600 px-4 py-2 rounded-xl font-medium text-sm flex items-center transition-colors"
                 >
                   <Plus size={18} className="mr-2" />
                   {t('compress.add_pdfs')}
                 </button>
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
                             removeFile(item.id);
                          }}
                          className="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 rounded-full p-1.5 shadow-sm opacity-100 transition-all z-20 cursor-pointer"
                       >
                          <X size={16} />
                       </button>
                    </div>
                 ))}
                 
                 {/* Add More Placehoder */}
                 <button 
                    onClick={handleAddMore}
                    className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-brand-400 hover:text-brand-500 hover:bg-brand-50/30 transition-all aspect-[3/4] group"
                 >
                    <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-brand-100 flex items-center justify-center mb-3 transition-colors">
                        <Plus size={24} className="group-hover:text-brand-600" />
                    </div>
                    <span className="font-medium text-sm">Add PDF</span>
                 </button>
              </div>
           </div>

           {/* Right: Settings Panel (Floating) */}
           <div className="w-full lg:w-[420px] flex-shrink-0 sticky top-8">
               <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-white ring-1 ring-slate-100 overflow-hidden">
                  <div className="p-6">
                     <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                        <CheckCircle2 className="mr-2 text-brand-500" size={20}/>
                        Compression Options
                     </h2>
                     
                     <div className="space-y-4">
                        {/* Quality Option 1 */}
                        <div 
                          onClick={() => setQuality('QUALITY')}
                          className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative overflow-hidden ${quality === 'QUALITY' ? 'border-brand-500 bg-brand-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                        >
                           <div className="flex items-start justify-between mb-2 relative z-10">
                              <div className="font-bold text-slate-900 text-base">
                                 {t('compress.quality_first')}
                              </div>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${quality === 'QUALITY' ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                                 {quality === 'QUALITY' && <Check size={14} strokeWidth={3} />}
                              </div>
                           </div>
                           <p className="text-sm text-slate-500 leading-relaxed relative z-10 pr-8">
                              {t('compress.quality_first_desc')}
                           </p>
                        </div>

                        {/* Quality Option 2 */}
                        <div 
                          onClick={() => setQuality('EXTREME')}
                          className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative overflow-hidden ${quality === 'EXTREME' ? 'border-brand-500 bg-brand-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                        >
                           <div className="flex items-start justify-between mb-2 relative z-10">
                              <div className="font-bold text-slate-900 text-base">
                                 {t('compress.high_strength')}
                              </div>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${quality === 'EXTREME' ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                                 {quality === 'EXTREME' && <Check size={14} strokeWidth={3} />}
                              </div>
                           </div>
                           <p className="text-sm text-slate-500 leading-relaxed relative z-10 pr-8">
                              {t('compress.high_strength_desc')}
                           </p>
                        </div>
                     </div>

                     {/* Mode Switcher */}
                     <div className="mt-8">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">PDF Handling Mode</label>
                        <div className="bg-slate-100 p-1.5 rounded-2xl flex relative">
                           {/* Animated Background could go here but simple state is fine */}
                           <button 
                             onClick={() => setPdfType('NATIVE')}
                             className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${pdfType === 'NATIVE' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700'}`}
                           >
                              Text (Vector)
                           </button>
                           <button 
                             onClick={() => setPdfType('BITMAP')}
                             className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${pdfType === 'BITMAP' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700'}`}
                           >
                              Image (Raster)
                           </button>
                        </div>
                        <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                            {pdfType === 'NATIVE' 
                                ? "Keeps text selectable. Minimal size reduction for already optimized files." 
                                : "Converts pages to images. Best size reduction but text won't be selectable."}
                        </p>
                     </div>
                  </div>

                  {/* Start Button Area */}
                  <div className="p-6 bg-slate-50 border-t border-slate-100">
                     <button 
                        onClick={handleStart}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xl py-4 rounded-2xl shadow-xl shadow-brand-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center group"
                     >
                        {t('compress.start')} 
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