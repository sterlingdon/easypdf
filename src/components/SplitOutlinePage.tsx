'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ToolPageLayout } from './ToolPageLayout';
import { FileItem, ProcessingStatus } from '@/types';
import { PdfAdvancedSplitter, OutlineItem } from '@/services/PdfAdvancedSplitter';

export default function SplitOutlinePage() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [outlineLevel, setOutlineLevel] = useState<number>(1);
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [maxDepth, setMaxDepth] = useState<number>(1);

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
    setResultUrls([]);

    // Load outline
    try {
      const items = await PdfAdvancedSplitter.getOutline(file);
      setOutline(items);

      // Calculate max depth
      const depth = items.reduce((max, item) => {
        const itemDepth = getItemDepth(item);
        return Math.max(max, itemDepth);
      }, 1);
      setMaxDepth(depth);
    } catch (error) {
      console.error('Failed to load outline:', error);
      setOutline([]);
    }
  };

  const getItemDepth = (item: OutlineItem): number => {
    if (!item.children || item.children.length === 0) {
      return item.level + 1;
    }
    return Math.max(
      item.level + 1,
      ...item.children.map(getItemDepth)
    );
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setOutline([]);
  };

  const handleSplit = async () => {
    if (files.length === 0) return;

    setStatus('PROCESSING');
    setResultUrls([]);

    try {
      const file = files[0].file;
      const blobs = await PdfAdvancedSplitter.splitByOutline(
        file,
        outlineLevel,
        (current, total) => {
          setProgress({ current, total });
        }
      );

      const urls = blobs.map((blob, index) => {
        const filename = `${files[0].file.name.replace('.pdf', '')}_part_${index + 1}.pdf`;
        return URL.createObjectURL(new File([blob], filename, { type: 'application/pdf' }));
      });

      setResultUrls(urls);
      setStatus('COMPLETED');
    } catch (error) {
      console.error('Split error:', error);
      setStatus('IDLE');
    }
  };

  const handleReset = () => {
    setFiles([]);
    setOutline([]);
    setResultUrls([]);
    setStatus('IDLE');
    setProgress({ current: 0, total: 0 });
  };

  const sidebarContent = (
    <div className="space-y-6">
      {/* Outline Level */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('split_outline.level')}
        </label>
        <select
          value={outlineLevel}
          onChange={(e) => setOutlineLevel(parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
        >
          {Array.from({ length: maxDepth }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {t('split_outline.level_n')}
            </option>
          ))}
        </select>
      </div>

      {/* Outline Preview */}
      {outline.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">{t('split_outline.preview')}</h4>
          <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <OutlineTree items={outline} level={outlineLevel} />
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-2">{t('split_outline.how_to')}</h4>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>{t('split_outline.step1')}</li>
          <li>{t('split_outline.step2')}</li>
          <li>{t('split_outline.step3')}</li>
        </ol>
      </div>
    </div>
  );

  const successContent = resultUrls.length > 0 && (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-2">
        {t('split_outline.success')}
      </h3>
      <div className="space-y-2">
        {resultUrls.map((url, index) => (
          <a
            key={url}
            href={url}
            download={`part_${index + 1}.pdf`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors m-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t('split_outline.download_part')}
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <ToolPageLayout
      title={t('tool.split_outline.title')}
      description={t('tool.split_outline.desc')}
      files={files}
      status={status}
      onFilesSelected={handleFilesSelected}
      onRemoveFile={handleRemoveFile}
      onStart={handleSplit}
      sidebarContent={sidebarContent}
      successContent={successContent}
      progress={progress.total > 0 ? (progress.current / progress.total) * 100 : 0}
      maxFiles={1}
    />
  );
}

function OutlineTree({ items, level }: { items: OutlineItem[]; level: number }) {
  const filteredItems = items.filter(item => item.level < level);

  return (
    <ul className="space-y-1">
      {filteredItems.map((item, index) => (
        <li key={index} style={{ paddingLeft: `${item.level * 12}px` }}>
          <span className="text-sm">
            {item.title} (Page {item.pageIndex + 1})
          </span>
          {item.children && item.children.length > 0 && (
            <OutlineTree items={item.children} level={level} />
          )}
        </li>
      ))}
    </ul>
  );
}
