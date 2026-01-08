'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ToolPageLayout } from './ToolPageLayout';
import { FileItem, ProcessingStatus } from '@/types';
import { PdfTools, PdfMetadata } from '@/services/PdfTools';
import { FileText, ArrowRight, Search, Info } from 'lucide-react';
import Link from 'next/link';

export default function ViewMetadataPage() {
  const { t, localizedPath } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [metadata, setMetadata] = useState<PdfMetadata | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Only allow 1 file for simplicity in view/edit metadata
      const file = e.target.files[0];
      setFiles([{
          id: Math.random().toString(36).substr(2, 9),
          file: file,
          pages: 0, width: 0, height: 0
      }]);
      
      // Auto-fetch data
      fetchMetadata(file);
    }
  };

  const fetchMetadata = async (file: File) => {
      setStatus('PROCESSING');
      try {
          const data = await PdfTools.getMetadata(file);
          setMetadata(data);
          setStatus('COMPLETED'); // "Processing" is just reading
      } catch (e) {
          console.error(e);
          alert('Failed to read metadata');
          setStatus('IDLE');
      }
  };
  
  const removeFile = (id: string) => {
    setFiles([]);
    setMetadata(null);
    setStatus('IDLE');
  };

  const renderMetadataRow = (label: string, value: string | undefined | number | Date) => {
      let displayValue = value ? String(value) : '-';
      if (value instanceof Date) {
          displayValue = value.toLocaleString();
      }
      return (
          <div className="flex border-b border-slate-100 py-3 last:border-0">
             <div className="w-1/3 text-slate-500 font-medium text-sm">{label}</div>
             <div className="w-2/3 text-slate-900 font-semibold text-sm break-words">{displayValue}</div>
          </div>
      );
  };

  // We don't really use "Start" button for View, it happens on upload
  const handleStart = () => {
     // no-op if already done
  };

  const sidebarContent = (
    <>
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
        <Info className="mr-2 text-brand-500" size={20}/>
        {t('metadata.info') || 'About Metadata'}
      </h2>
      <p className="text-sm text-slate-500">
         Metadata contains information about the document that stays with the file but isn't part of the document body.
      </p>
    </>
  );

  const successContent = (
      <div className="min-h-screen bg-[#f7f7f7] pb-20">
         <div className="bg-transparent px-6 py-4">
           <Link href={localizedPath('/')} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors">
              <ArrowRight size={20} className="rotate-180" />
           </Link>
         </div>

         <div className="max-w-4xl mx-auto px-4 mt-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="p-3 bg-brand-50 rounded-2xl">
                        <Search className="text-brand-500" size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{t('metadata.results') || 'PDF Metadata'}</h2>
                        <p className="text-slate-500 text-sm mt-1">{files[0]?.file.name}</p>
                    </div>
                </div>

                {metadata && (
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        {renderMetadataRow("Title", metadata.title)}
                        {renderMetadataRow("Author", metadata.author)}
                        {renderMetadataRow("Subject", metadata.subject)}
                        {renderMetadataRow("Keywords", metadata.keywords)}
                        {renderMetadataRow("Creator", metadata.creator)}
                        {renderMetadataRow("Producer", metadata.producer)}
                        {renderMetadataRow("Created", metadata.creationDate)}
                        {renderMetadataRow("Modified", metadata.modificationDate)}
                        {renderMetadataRow("Page Count", metadata.pageCount)}
                    </div>
                )}

                <div className="flex justify-center mt-10">
                    <button 
                        onClick={() => removeFile(files[0].id)}
                        className="px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                        {t('common.view_another') || 'View Another PDF'}
                    </button>
                </div>
            </div>
         </div>
      </div>
  );

  return (
    <ToolPageLayout
      title={t('tool.view_metadata.title') || 'View PDF Metadata'}
      description={t('tool.view_metadata.desc') || 'See hidden information stored in your PDF files.'}
      files={files}
      status={status}
      maxFiles={1}
      onFilesSelected={handleFileSelect}
      onRemoveFile={removeFile}
      onStart={handleStart}
      sidebarContent={sidebarContent}
      successContent={successContent} // We hijack success content to show result
    />
  );
}
