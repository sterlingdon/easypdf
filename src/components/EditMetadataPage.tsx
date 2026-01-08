'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ToolPageLayout } from './ToolPageLayout';
import { FileItem, ProcessingStatus } from '@/types';
import { PdfTools, PdfMetadata } from '@/services/PdfTools';
import { Edit3, CheckCircle2, ArrowRight, Download, FileText } from 'lucide-react';
import Link from 'next/link';

interface ProcessedFileItem extends FileItem {
  blob: Blob;
  downloadUrl: string;
}

export default function EditMetadataPage() {
  const { t, localizedPath } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFileItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  
  // Metadata Form State
  const [metaForm, setMetaForm] = useState<PdfMetadata>({
      title: '',
      author: '',
      subject: '',
      keywords: '',
      producer: '',
      creator: ''
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles([{
          id: Math.random().toString(36).substr(2, 9),
          file: file,
          pages: 0, width: 0, height: 0
      }]);
      
      // Pre-fill existing metadata
      try {
          const data = await PdfTools.getMetadata(file);
          setMetaForm({
              title: data.title || '',
              author: data.author || '',
              subject: data.subject || '',
              keywords: data.keywords || '',
              producer: data.producer || '',
              creator: data.creator || ''
          });
      } catch (e) {
          console.error("Failed to load metadata", e);
      }
    }
  };

  const handleStart = async () => {
    setStatus('PROCESSING');
    setProcessedFiles([]);
    
    try {
      if (files.length === 0) return;
      const fileItem = files[0];

      const blob = await PdfTools.setMetadata(fileItem.file, {
          ...metaForm,
          modificationDate: new Date()
      });
      
      const downloadUrl = URL.createObjectURL(blob);
      setProcessedFiles([{
          ...fileItem,
          blob,
          downloadUrl
      }]);
      
      setStatus('COMPLETED');
    } catch (error) {
      console.error(error);
      alert('Failed to update metadata.');
      setStatus('IDLE');
    }
  };

  const removeFile = (id: string) => {
    setFiles([]);
    setProcessedFiles([]);
    setMetaForm({
        title: '',
        author: '',
        subject: '',
        keywords: '',
        producer: '',
        creator: ''
    });
    setStatus('IDLE');
  };

  const sidebarContent = (
    <>
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
        <Edit3 className="mr-2 text-brand-500" size={20}/>
        {t('metadata.edit_fields') || 'Edit Metadata'}
      </h2>
      
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <div>
           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
           <input 
             type="text"
             value={metaForm.title || ''}
             onChange={(e) => setMetaForm(p => ({...p, title: e.target.value}))}
             className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
           />
        </div>
        <div>
           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Author</label>
           <input 
             type="text"
             value={metaForm.author || ''}
             onChange={(e) => setMetaForm(p => ({...p, author: e.target.value}))}
             className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
           />
        </div>
        <div>
           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
           <input 
             type="text"
             value={metaForm.subject || ''}
             onChange={(e) => setMetaForm(p => ({...p, subject: e.target.value}))}
             className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
           />
        </div>
        <div>
           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Keywords</label>
           <textarea 
             value={metaForm.keywords || ''}
             onChange={(e) => setMetaForm(p => ({...p, keywords: e.target.value}))}
             className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-brand-500 outline-none h-20 resize-none"
           />
        </div>
        <div>
           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Creator Application</label>
           <input 
             type="text"
             value={metaForm.creator || ''}
             onChange={(e) => setMetaForm(p => ({...p, creator: e.target.value}))}
             className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
           />
        </div>
        <div>
           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Producer</label>
           <input 
             type="text"
             value={metaForm.producer || ''}
             onChange={(e) => setMetaForm(p => ({...p, producer: e.target.value}))}
             className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-brand-500 outline-none"
           />
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
                    {t('metadata.success') || 'Metadata Updated Successfully!'}
                </h2>
                
                <div className="flex justify-center mt-8">
                     <a 
                       href={processedFiles[0]?.downloadUrl} 
                       download={`metadata_${processedFiles[0]?.file.name}`}
                       className="bg-brand-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-600 transition-all flex items-center"
                     >
                        <Download size={20} className="mr-2"/>
                        {t('common.download') || 'Download File'}
                     </a>
                </div>

                <div className="flex justify-center mt-6">
                    <button 
                        onClick={() => removeFile("")}
                        className="text-slate-500 hover:text-slate-700 font-medium"
                    >
                        {t('common.edit_another') || 'Edit Another PDF'}
                    </button>
                </div>
            </div>
         </div>
      </div>
  );

  return (
    <ToolPageLayout
      title={t('tool.edit_metadata.title') || 'Edit Metadata'}
      description={t('tool.edit_metadata.desc') || 'Modify Title, Author, Keywords and more.'}
      files={files}
      status={status}
      maxFiles={1}
      onFilesSelected={handleFileSelect}
      onRemoveFile={removeFile}
      onStart={handleStart}
      sidebarContent={sidebarContent}
      successContent={successContent}
    />
  );
}
