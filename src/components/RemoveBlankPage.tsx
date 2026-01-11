'use client';

import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ToolPageLayout } from './ToolPageLayout';
import { FileItem, ProcessingStatus } from '@/types';
import { PdfPageManager } from '@/services/PdfPageManager';

export default function RemoveBlankPage() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [blankThreshold, setBlankThreshold] = useState<number>(0.01);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const pdfjsLib = await import('pdfjs-dist');
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const tempId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newFile: FileItem = {
      id: tempId,
      file: file,
      pages: pdf.numPages,
      width: 0,
      height: 0
    };

    setFiles([newFile]);
    setStatus('IDLE');
    setResultUrl(null);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setResultUrl(null);
  };

  const handleRemoveBlankPages = async () => {
    if (files.length === 0) return;

    setStatus('PROCESSING');
    setResultUrl(null);

    try {
      const file = files[0].file;
      const blob = await PdfPageManager.removeBlank(file, blankThreshold);

      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setStatus('COMPLETED');
    } catch (error) {
      console.error('Remove blank pages error:', error);
      setStatus('IDLE');
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStatus('IDLE');
    setResultUrl(null);
  };

  const sidebarContent = (
    <div className="space-y-6">
      {/* Blank Threshold */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('remove_blank.threshold')}
        </label>
        <input
          type="range"
          min="0.001"
          max="0.1"
          step="0.001"
          value={blankThreshold}
          onChange={(e) => setBlankThreshold(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{t('remove_blank.strict')}</span>
          <span>{blankThreshold.toFixed(3)}</span>
          <span>{t('remove_blank.lenient')}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {t('remove_blank.threshold_hint')}
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-2">{t('remove_blank.how_to')}</h4>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>{t('remove_blank.step1')}</li>
          <li>{t('remove_blank.step2')}</li>
          <li>{t('remove_blank.step3')}</li>
        </ol>
        <p className="text-xs text-gray-500 mt-3">
          {t('remove_blank.note')}
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
        {t('remove_blank.success')}
      </h3>
      <a
        href={resultUrl}
        download={`${files[0]?.file.name.replace('.pdf', '')}_clean.pdf`}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {t('common.download')}
      </a>
    </div>
  );

  return (
    <ToolPageLayout
      title={t('tool.remove_blank.title')}
      description={t('tool.remove_blank.desc')}
      files={files}
      status={status}
      onFilesSelected={handleFilesSelected}
      onRemoveFile={handleRemoveFile}
      onStart={handleRemoveBlankPages}
      sidebarContent={sidebarContent}
      successContent={successContent}
      maxFiles={1}
    />
  );
}
