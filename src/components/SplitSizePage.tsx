'use client';

import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ToolPageLayout } from './ToolPageLayout';
import { FileItem, ProcessingStatus } from '@/types';
import { PdfAdvancedSplitter } from '@/services/PdfAdvancedSplitter';

export default function SplitSizePage() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [targetSizeMB, setTargetSizeMB] = useState<number>(1);
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

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
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setResultUrls([]);
  };

  const handleSplit = async () => {
    if (files.length === 0 || targetSizeMB <= 0) return;

    setStatus('PROCESSING');
    setResultUrls([]);

    try {
      const file = files[0].file;
      const blobs = await PdfAdvancedSplitter.splitBySize(
        file,
        targetSizeMB,
        (current, total) => {
          setProgress({ current, total });
        }
      );

      const urls = blobs.map((blob, index) =>
        URL.createObjectURL(
          new File([blob], `part_${index + 1}.pdf`, { type: 'application/pdf' })
        )
      );

      setResultUrls(urls);
      setStatus('COMPLETED');
    } catch (error) {
      console.error('Split error:', error);
      setStatus('IDLE');
    }
  };

  const handleReset = () => {
    setFiles([]);
    setResultUrls([]);
    setStatus('IDLE');
    setProgress({ current: 0, total: 0 });
  };

  const totalFileSize = files.length > 0 ? files[0].file.size : 0;
  const estimatedParts = Math.ceil(totalFileSize / (targetSizeMB * 1024 * 1024));

  const sidebarContent = (
    <div className="space-y-6">
      {/* Target Size */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('split_size.size')}
        </label>
        <input
          type="number"
          min="0.1"
          max="1000"
          step="0.1"
          value={targetSizeMB}
          onChange={(e) => setTargetSizeMB(parseFloat(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
        />
        <p className="text-xs text-gray-500 mt-1">
          {t(
            'split_size.estimated',
            { count: isFinite(estimatedParts) ? estimatedParts : 0 }
          )}
        </p>
      </div>

      {/* Estimated Parts Display */}
      {files.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium mb-2">{t('split_size.preview')}</h4>
          <div className="text-sm space-y-1">
            <p>
              {t('split_size.original_size', {
                size: (totalFileSize / 1024 / 1024).toFixed(2),
              })}
            </p>
            <p>
              {t('split_size.target_size', { size: targetSizeMB })}
            </p>
            <p className="font-medium">
              {t('split_size.estimated_parts', {
                count: estimatedParts,
                size: targetSizeMB,
              })}
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-2">{t('split_size.how_to')}</h4>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>{t('split_size.step1')}</li>
          <li>{t('split_size.step2')}</li>
          <li>{t('split_size.step3')}</li>
        </ol>
        <p className="text-xs text-gray-500 mt-3">
          {t(
            'split_size.note'
          )}
        </p>
      </div>
    </div>
  );

  const combineUrlsAsZip = (urls: string[]) => {
    return urls[0]; // For now, return first URL. In real implementation, create ZIP
  };

  const successContent = resultUrls.length > 0 && (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-2">
        {t('split_size.success')}
      </h3>
      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap gap-2 justify-center">
          {resultUrls.map((url, index) => (
            <a
              key={url}
              href={url}
              download={`part_${index + 1}.pdf`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t('split_size.download_part', { n: index + 1 })}
            </a>
          ))}
        </div>
        <div className="mt-4">
          <a
            href={combineUrlsAsZip(resultUrls)}
            download={`${files[0]?.file.name.replace('.pdf', '')}_split.zip`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {t('split_size.download_zip')}
          </a>
        </div>
      </div>
    </div>
  );



  return (
    <ToolPageLayout
      title={t('tool.split_size.title')}
      description={t('tool.split_size.desc')}
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
