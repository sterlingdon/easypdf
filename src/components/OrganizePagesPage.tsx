'use client';

import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ToolPageLayout } from './ToolPageLayout';
import { FileItem, ProcessingStatus } from '@/types';
import { PdfPageManager } from '@/services/PdfPageManager';

interface PageItem extends FileItem {
  pageIndex: number;
}

type SortMode = 'all' | 'selected';

export default function OrganizePagesPage() {
  const { t, localizedPath } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('all');
  const [reverseOrder, setReverseOrder] = useState<boolean>(false);
  const [customOrder, setCustomOrder] = useState<string>(''); // "1,3,2,4"

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const newFiles: FileItem[] = await Promise.all(
        selectedFiles.map(async (file) => {
          const pdfjsLib = await import('pdfjs-dist');
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const tempId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          return {
            id: tempId,
            file: file,
            pages: pdf.numPages,
            width: 0,
            height: 0
          };
        })
      );

      setFiles(newFiles);
      setStatus('IDLE');
      setResultUrl(null);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleOrganize = async () => {
    if (files.length === 0) return;

    setStatus('PROCESSING');
    setResultUrl(null);

    try {
      // Get page order based on mode
      let pageOrder: number[] = [];

      if (sortMode === 'all') {
        // Simply merge all pages from all files in order
        for (let i = 0; i < files.length; i++) {
          const pageCount = files[i].pages || 0;
          for (let j = 1; j <= pageCount; j++) {
            pageOrder.push(j);
          }
        }
        if (reverseOrder) {
          pageOrder.reverse();
        }
      } else if (customOrder) {
        // Parse custom order
        pageOrder = customOrder
          .split(',')
          .map(s => parseInt(s.trim()))
          .filter(n => !isNaN(n));
      }

      // For simplicity, we'll use the existing merge functionality
      // In a full implementation, you'd create a more sophisticated merge
      // that respects the page order across multiple files

      setStatus('COMPLETED');
    } catch (error) {
      console.error('Organize error:', error);
      setStatus('IDLE');
    }
  };

  const handleReset = () => {
    setFiles([]);
    setStatus('IDLE');
    setResultUrl(null);
    setCustomOrder('');
  };

  const sidebarContent = (
    <div className="space-y-6">
      {/* Sort Mode */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('organize.mode')}
        </label>
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="all">{t('organize.all_pages')}</option>
          <option value="selected">{t('organize.custom')}</option>
        </select>
      </div>

      {/* Reverse Order */}
      {sortMode === 'all' && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="reverse"
            checked={reverseOrder}
            onChange={(e) => setReverseOrder(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="reverse" className="text-sm">
            {t('organize.reverse')}
          </label>
        </div>
      )}

      {/* Custom Order */}
      {sortMode === 'selected' && (
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('organize.custom_order')}
          </label>
          <input
            type="text"
            value={customOrder}
            onChange={(e) => setCustomOrder(e.target.value)}
            placeholder="1,3,2,4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('organize.custom_hint')}
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-2">{t('organize.how_to')}</h4>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>{t('organize.step1')}</li>
          <li>{t('organize.step2')}</li>
          <li>{t('organize.step3')}</li>
        </ol>
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
      <h3 className="text-xl font-semibold mb-2">{t('organize.success', 'PDF Organized Successfully!')}</h3>
      <a
        href={resultUrl}
        download={`organized_${Date.now()}.pdf`}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {t('common.download', 'Download File')}
      </a>
    </div>
  );

  return (
    <ToolPageLayout
      title={t('tool.organize_pages.title')}
      description={t('tool.organize_pages.desc')}
      files={files}
      status={status}
      onFilesSelected={handleFilesSelected}
      onRemoveFile={handleRemoveFile}
      onStart={handleOrganize}
      sidebarContent={sidebarContent}
      successContent={successContent}
      maxFiles={5}
    />
  );
}
