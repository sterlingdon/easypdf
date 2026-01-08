'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ToolPageLayout } from './ToolPageLayout';
import { FileItem, ProcessingStatus } from '@/types';
import { PdfTools } from '@/services/PdfTools';
import { Lock, FileText, CheckCircle2, ArrowRight, Download, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface ProcessedFileItem extends FileItem {
  blob: Blob;
  downloadUrl: string;
}

export default function ProtectPdfPage() {
  const { t, localizedPath } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFileItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const handleStart = async () => {
    if (!password) {
      alert('Please enter a password.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
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
        
        // Emulate some delay or processing per file
        await new Promise(r => setTimeout(r, 200));

        const protectedBlob = await PdfTools.protect(fileItem.file, password);
        const downloadUrl = URL.createObjectURL(protectedBlob);
        
        results.push({
            ...fileItem,
            blob: protectedBlob,
            downloadUrl
        });
        
        setProgress(((i + 1) / totalFiles) * 100);
      }

      setProcessedFiles(results);
      setStatus('COMPLETED');

    } catch (error) {
      console.error(error);
      alert('Failed to protect PDF: ' + (error instanceof Error ? error.message : String(error)));
      setStatus('IDLE');
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const sidebarContent = (
    <>
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
        <ShieldCheck className="mr-2 text-brand-500" size={20}/>
        {t('protect.settings') || 'Security Settings'}
      </h2>
      
      <div className="space-y-4">
        <div>
           <label className="block text-sm font-medium text-slate-700 mb-1">
             {t('protect.password_label') || 'Set a Password'}
           </label>
           <input 
             type="password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             className="w-full px-4 py-2 border border-slate-200 rounded-xl text-slate-900 bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all mb-3"
             placeholder="********"
           />
           <input 
             type="password"
             value={confirmPassword}
             onChange={(e) => setConfirmPassword(e.target.value)}
             className={`w-full px-4 py-2 border rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all ${password && confirmPassword && password !== confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
             placeholder={t('protect.confirm_password') || 'Confirm Password'}
           />
           {password && confirmPassword && password !== confirmPassword && (
               <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
           )}
           <p className="text-xs text-slate-400 mt-2">
             {t('protect.desc_hint') || 'This password will be required to open the PDF.'}
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
                    {t('protect.success') || 'PDF Protected Successfully!'}
                </h2>
                <p className="text-slate-500 mb-8">
                    Your files are now encrypted.
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
                               download={`protected_${file.file.name}`}
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
                            setConfirmPassword('');
                            setStatus('IDLE');
                        }}
                        className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        {t('common.process_more') || 'Protect Another'}
                    </button>
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
      title={t('tool.protect.title') || 'Protect PDF'}
      description={t('tool.protect.desc') || 'Encrypt your PDF with a password.'}
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
