'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, CheckCircle2, Download, ArrowLeft, ArrowRight, X, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { PdfToImage } from '@/services/PdfToImage';

export default function PdfToImagePage() {
  const { t, localizedPath } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'COMPLETED'>('IDLE');
  const [resultZip, setResultZip] = useState<Blob | null>(null);
  const [format, setFormat] = useState<'jpg' | 'png' | 'webp'>('jpg');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConvert = async () => {
    if (!file) return;

    setStatus('PROCESSING');
    try {
        const zipBlob = await PdfToImage.convert(file, format);
        setResultZip(zipBlob);
        setStatus('COMPLETED');
    } catch (error) {
        console.error(error);
        alert('Conversion failed: ' + error);
        setStatus('IDLE');
    }
  };

  const handleDownload = () => {
    if (!resultZip) return;
    const url = URL.createObjectURL(resultZip);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted_${format}_images.zip`;
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
            
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Converted Successfully!</h1>
            <p className="text-slate-500 mb-12">Your PDF pages have been converted to {format.toUpperCase()} images.</p>

            <button 
                onClick={handleDownload}
                className="bg-brand-500 hover:bg-brand-600 text-white text-xl font-bold px-12 py-5 rounded-full shadow-xl shadow-brand-200 hover:scale-105 transition-all flex items-center justify-center mx-auto"
            >
                <Download size={28} className="mr-3" />
                Download Zip
            </button>

            <div className="mt-12">
               <button 
                  onClick={() => { setStatus('IDLE'); setFile(null); setResultZip(null); }}
                  className="text-brand-600 hover:text-brand-700 font-medium hover:underline"
               >
                  Convert another file
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
            <p className="text-xl font-semibold text-slate-700">Converting to Images...</p>
        </div>
    );
  }

  // Dashboard
  if (file) {
      return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            <div className="bg-white px-6 py-3 flex items-center justify-between border-b border-slate-200 sticky top-0 z-30">
                <div className="flex items-center">
                    <Link href={localizedPath('/')} className="p-2 hover:bg-slate-100 rounded-full mr-4 text-slate-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-bold text-slate-800">{t('tool.pdf_to_image.title')}</h1>
                </div>
            </div>

            <div className="flex-grow flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
                {/* Main Canvas */}
                <div className="flex-grow p-8 bg-slate-200/50 flex flex-col items-center justify-center" style={gridStyle}>
                    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <div className="w-32 h-40 bg-slate-50 border-2 border-slate-100 rounded-lg flex items-center justify-center mb-6 relative">
                            <CheckCircle2 size={64} className="text-brand-200" />
                            <div className="absolute -top-3 -right-3">
                                <button onClick={() => setFile(null)} className="bg-white text-slate-400 hover:text-red-500 rounded-full p-1 shadow border border-slate-200">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg mb-1">{file.name}</h3>
                        <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full md:w-[320px] bg-white border-l border-slate-200 flex flex-col shadow-xl z-20">
                    <div className="p-6 flex-grow">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                            <ImageIcon size={20} className="mr-2" />
                            Settings
                        </h2>

                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl">
                                <label className="text-sm font-bold text-slate-700 block mb-3">Output Format</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['jpg', 'png', 'webp'].map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFormat(f as any)}
                                            className={`py-2 rounded-lg text-sm font-medium transition-all ${format === f ? 'bg-brand-500 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                                        >
                                            {f.toUpperCase()}
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
                            Convert to Images <ArrowRight size={20} className="ml-2" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-20" style={gridStyle}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-5xl font-extrabold text-slate-900 mb-4">{t('tool.pdf_to_image.title')}</h1>
            <p className="text-xl text-slate-500 mb-12">{t('tool.pdf_to_image.desc')}</p>

            <div 
                className="bg-white rounded-[2.5rem] p-16 shadow-2xl shadow-slate-200/50 border border-white hover:border-brand-200 transition-all cursor-pointer group relative overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="absolute inset-0 bg-brand-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                
                <button className="relative z-10 bg-brand-500 text-white text-lg font-bold px-10 py-4 rounded-full shadow-lg shadow-brand-200 group-hover:scale-105 transition-transform flex items-center justify-center mx-auto mb-8">
                    <Plus size={24} className="mr-2" /> Select PDF File
                </button>
                
                <p className="relative z-10 text-slate-400 font-medium">
                    or drop PDF here
                </p>

                <input 
                    type="file" 
                    accept=".pdf" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileSelect}
                />
            </div>
        </div>
    </div>
  );
}
