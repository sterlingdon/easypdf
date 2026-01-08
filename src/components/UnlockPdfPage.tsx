'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ToolPageLayout } from './ToolPageLayout';
import { FileItem, ProcessingStatus } from '@/types';
import { PdfTools } from '@/services/PdfTools';
import { Unlock, Lock, Download, Share2, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ProcessedFileItem extends FileItem {
  blob: Blob;
  downloadUrl: string;
}

export default function UnlockPdfPage() {
  const { t, localizedPath } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFileItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [password, setPassword] = useState('');
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFilesPromises = Array.from(e.target.files).map(async (f) => {
        return {
          id: Math.random().toString(36).substr(2, 9),
          file: f,
          pages: 0, // We could load pages if needed, skipping for speed
          width: 0,
          height: 0
        };
      });
      const newFiles = await Promise.all(newFilesPromises);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleStart = async () => {
    if (!password) {
      alert(t('unlock.enter_password') || 'Please enter the password');
      return;
    }

    setStatus('PROCESSING');
    setProgress(0);
    setProcessedFiles([]);
    
    try {
      const results: ProcessedFileItem[] = [];
      const totalFiles = files.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const fileItem = files[i];
        
        try {
            const unlockedBlob = await PdfTools.unlock(fileItem.file, password);
            const downloadUrl = URL.createObjectURL(unlockedBlob);
            
            results.push({
                ...fileItem,
                blob: unlockedBlob,
                downloadUrl
            });
        } catch (err) {
            console.error("Failed to unlock", err);
            // alert(`Failed to unlock ${fileItem.file.name}. Wrong password?`);
            // Continue with others or stop? tailored for single password usually.
            // If they have different passwords, batch doesn't make sense with one input.
            throw err; // For now fail everything
        }
        
        setProgress(((i + 1) / totalFiles) * 100);
      }

      setProcessedFiles(results);
      setStatus('COMPLETED');

    } catch (error) {
      console.error(error);
      alert('Failed to unlock PDF. Please check the password.');
      setStatus('IDLE');
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const sidebarContent = (
    <>
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
        <Unlock className="mr-2 text-brand-500" size={20}/>
        {t('unlock.settings') || 'Unlock Settings'}
      </h2>
      
      <div className="space-y-4">
        <div>
           <label className="block text-sm font-medium text-slate-700 mb-1">
             {t('unlock.password_label') || 'Enter PDF Password'}
           </label>
           <div className="relative">
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                placeholder="********"
              />
              <Lock className="absolute right-3 top-2.5 text-slate-400" size={16} />
           </div>
           <p className="text-xs text-slate-400 mt-2">
             {t('unlock.desc_hint') || 'Enter the owner password to remove restrictions.'}
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
                    {t('unlock.success') || 'PDF Unlocked Successfully!'}
                </h2>
                <p className="text-slate-500 mb-8">
                    {processedFiles.length} file(s) have been unlocked and are ready for download.
                </p>

                <div className="grid grid-cols-1 gap-4 max-w-lg mx-auto">
                    {processedFiles.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                             <div className="flex items-center truncate mr-4">
                                <FileText className="text-brand-500 mr-3 flex-shrink-0" size={24} />
                                <span className="font-medium text-slate-700 truncate">{file.file.name}</span>
                             </div>
                             <a 
                               href={file.downloadUrl} 
                               download={`unlocked_${file.file.name}`}
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
                            setPassword('');
                            setStatus('IDLE');
                        }}
                        className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        {t('common.process_more') || 'Unlock Another'}
                    </button>
                    {/* Bulk Download if multiple */}
                    {processedFiles.length > 1 && (
                        <button className="bg-brand-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-600 transition-transform hover:-translate-y-0.5">
                            {t('common.download_all') || 'Download All'}
                        </button>
                    )}
                </div>
            </div>
         </div>
      </div>
  );

  return (
    <ToolPageLayout
      title={t('tool.unlock.title') || 'Unlock PDF'}
      description={t('tool.unlock.desc') || 'Remove passwords and restrictions from PDF files.'}
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
