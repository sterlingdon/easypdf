'use client';

import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ToolPageLayout } from './ToolPageLayout';
import { FileItem, ProcessingStatus } from '@/types';
import { PdfPageTransformer, NUpOptions } from '@/services/PdfPageTransformer';

export default function NUpPage() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // Settings
  const [pagesPerSheet, setPagesPerSheet] = useState<2 | 4 | 6 | 8 | 9 | 16>(4);
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length === 0) return;

    // Create new file items
    const newFiles: FileItem[] = selectedFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      pages: 0,
      width: 0,
      height: 0,
    }));

    setFiles(newFiles);
    setStatus('IDLE');
    setResultUrl(null);
  }, []);

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      return prev.filter((f) => f.id !== id);
    });
    setResultUrl(null);
  };

  const handleNUp = async () => {
    if (files.length === 0) return;

    setStatus('PROCESSING');
    setResultUrl(null);

    try {
      const options: NUpOptions = {
        pagesPerSheet,
        direction,
      };

      const resultBlob = await PdfPageTransformer.createNUp(
        files.map((f) => f.file),
        options
      );

      const url = URL.createObjectURL(resultBlob);
      setResultUrl(url);
      setStatus('COMPLETED');
    } catch (error) {
      console.error('N-Up error:', error);
      setStatus('ERROR');
    }
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFiles([]);
    setStatus('IDLE');
    setResultUrl(null);
  };

  const sidebarContent = (
    <div className="space-y-6">
      {/* Pages per Sheet */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('nup.pages_per_sheet', 'Pages per Sheet')}
        </label>
        <select
          value={pagesPerSheet}
          onChange={(e) =>
            setPagesPerSheet(parseInt(e.target.value) as 2 | 4 | 6 | 8 | 9 | 16)
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800"
        >
          <option value={2}>2-up</option>
          <option value={4}>4-up</option>
          <option value={6}>6-up</option>
          <option value={8}>8-up</option>
          <option value={9}>9-up</option>
          <option value={16}>16-up</option>
        </select>
      </div>

      {/* Direction */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('nup.direction', 'Direction')}
        </label>
        <select
          value={direction}
          onChange={(e) =>
            setDirection(e.target.value as 'horizontal' | 'vertical')
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="horizontal">
            {t('nup.horizontal', 'Horizontal')}
          </option>
          <option value="vertical">
            {t('nup.vertical', 'Vertical')}
          </option>
        </select>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-2">{t('nup.how_to', 'How to Use')}</h4>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>{t('nup.step1', 'Upload one or more PDFs')}</li>
          <li>{t('nup.step2', 'Select pages per sheet')}</li>
          <li>{t('nup.step3', 'Choose layout direction')}</li>
          <li>{t('nup.step4', 'Click N-Up to combine')}</li>
        </ol>
        <p className="text-xs text-gray-500 mt-3">
          {t(
            'nup.note',
            'Tip: Best for printing or creating booklets'
          )}
        </p>
      </div>
    </div>
  );

  const successContent = resultUrl && (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-2">
        {t('nup.success', 'N-Up Completed!')}
      </h3>
      <a
        href={resultUrl}
        download={`nup_${Date.now()}.pdf`}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {t('common.download', 'Download File')}
      </a>
      <button
        onClick={handleReset}
        className="block mt-4 text-sm text-blue-600 hover:underline mx-auto"
      >
        {t('nup.reset', 'N-Up Another')}
      </button>
    </div>
  );

  return (
    <ToolPageLayout
      title={t('tool.n_up.title', 'PDF Merge Typesetting (N-up)')}
      description={t('tool.n_up.desc', 'Put multiple PDF pages per sheet')}
      files={files}
      status={status}
      onFilesSelected={handleFileSelect}
      onRemoveFile={handleRemoveFile}
      onStart={handleNUp}
      accept=".pdf"
      sidebarContent={sidebarContent}
      successContent={successContent}
      actionLabel={t('n_up.action', 'Create N-Up')}
      maxFiles={10}
    />
  );
}
