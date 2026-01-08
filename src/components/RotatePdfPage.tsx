'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ToolPageLayout } from './ToolPageLayout';
import { FileItem, ProcessingStatus } from '@/types';
import { PdfTools } from '@/services/PdfTools';
import { RefreshCw, RotateCw, RotateCcw, FileText, CheckCircle2, ArrowRight, Download } from 'lucide-react';
import Link from 'next/link';

interface ProcessedFileItem extends FileItem {
  blob: Blob;
  downloadUrl: string;
}

export default function RotatePdfPage() {
  const { t, localizedPath } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFileItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270 (visual preview only, actually send delta or absolute?)
  // For batch processing, we usually apply the SAME rotation to all. 
  // Let's mimic "Rotate PDF" where we choose a rotation.
  
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFilesPromises = Array.from(e.target.files).map(async (f) => {
        return {
          id: Math.random().toString(36).substr(2, 9),
          file: f,
          pages: 0,
          width: 0,
          height: 0
        };
      });
      const newFiles = await Promise.all(newFilesPromises);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const rotateLeft = () => setRotation(prev => (prev - 90) % 360);
  const rotateRight = () => setRotation(prev => (prev + 90) % 360);

  const handleStart = async () => {
    setStatus('PROCESSING');
    setProgress(0);
    setProcessedFiles([]);
    
    try {
      const results: ProcessedFileItem[] = [];
      const totalFiles = files.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const fileItem = files[i];
        
        // Apply the visual rotation as the delta
        // If user says "Right (90)", we rotate 90 degrees.
        // We use the 'rotation' state which tracks the cumulative visual rotation.
        // Note: PdfTools.rotate takes degrees to ADD to current.
        const blob = await PdfTools.rotate(fileItem.file, rotation);
        const downloadUrl = URL.createObjectURL(blob);
        
        results.push({
            ...fileItem,
            blob,
            downloadUrl
        });
        
        setProgress(((i + 1) / totalFiles) * 100);
      }

      setProcessedFiles(results);
      setStatus('COMPLETED');

    } catch (error) {
      console.error(error);
      alert('Failed to rotate PDF.');
      setStatus('IDLE');
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const sidebarContent = (
    <>
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
        <RefreshCw className="mr-2 text-brand-500" size={20}/>
        {t('rotate.settings') || 'Rotation Settings'}
      </h2>
      
      <div className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center">
            <div className="flex space-x-6 mb-4">
                <button 
                  onClick={rotateLeft}
                  className="w-14 h-14 bg-white rounded-full shadow-sm border border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-200 flex items-center justify-center transition-all"
                  title="Rotate Left"
                >
                    <RotateCcw size={24} />
                </button>
                <button 
                  onClick={rotateRight}
                  className="w-14 h-14 bg-white rounded-full shadow-sm border border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-200 flex items-center justify-center transition-all"
                  title="Rotate Right"
                >
                    <RotateCw size={24} />
                </button>
            </div>
            <div className={`text-xl font-bold transition-all ${rotation === 0 ? 'text-slate-300' : 'text-brand-600'}`}>
                {rotation}°
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
                {t('rotate.hint') || 'Pages will be rotated by this angle.'}
            </p>
        </div>
      </div>
    </>
  );

  const successContent = (
      <div className="min-h-screen bg-[#f7f7f7] pb-20">
         <div className="bg-transparent px-6 py-4">
           <Link href={localizedPath('/')} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors">
              <ArrowRight size={20} className="rotate-180" />
           </Link>
         </div>

         <div className="max-w-4xl mx-auto px-4 mt-8 text-center">
            <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100">
                <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    {t('rotate.success') || 'PDF Rotated Successfully!'}
                </h2>
                
                <div className="grid grid-cols-1 gap-4 max-w-lg mx-auto mt-8">
                    {processedFiles.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                             <div className="flex items-center truncate mr-4">
                                <FileText className="text-brand-500 mr-3 flex-shrink-0" size={24} />
                                <span className="font-medium text-slate-700 truncate">{file.file.name}</span>
                             </div>
                             <a 
                               href={file.downloadUrl} 
                               download={`rotated_${file.file.name}`}
                               className="p-2 bg-brand-100 text-brand-600 rounded-full hover:bg-brand-200 transition-colors"
                             >
                                <Download size={20} />
                             </a>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center space-x-4 mt-10">
                    <button 
                        onClick={() => {
                            setFiles([]);
                            setProcessedFiles([]);
                            setRotation(0);
                            setStatus('IDLE');
                        }}
                        className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        {t('common.process_more') || 'Rotate Another'}
                    </button>
                </div>
            </div>
         </div>
      </div>
  );

  return (
    <ToolPageLayout
      title={t('tool.rotate.title') || 'Rotate PDF'}
      description={t('tool.rotate.desc') || 'Rotate pages in your PDF files.'}
      files={files}
      status={status}
      progress={progress}
      elapsedTime={elapsedTime}
      onFilesSelected={handleFileSelect}
      onRemoveFile={removeFile}
      onStart={handleStart}
      sidebarContent={sidebarContent}
      successContent={successContent}
    />
  );
}
