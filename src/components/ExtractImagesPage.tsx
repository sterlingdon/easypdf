'use client';

import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ToolPageLayout } from './ToolPageLayout';
import { FileItem, ProcessingStatus } from '@/types';
import { PdfContentExtractor, ImageFormat } from '@/services/PdfContentExtractor';

export default function ExtractImagesPage() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [format, setFormat] = useState<ImageFormat>('png');
  const [pageRanges, setPageRanges] = useState<string>(''); // "1-3,5,7-9"
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0];

    const newFile: FileItem = {
      id: `${file.name}-${Date.now()}`,
      file,
      pages: 0,
      width: 0,
      height: 0,
    };

    setFiles([newFile]);
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

  const handleExtract = async () => {
    if (files.length === 0) return;

    setStatus('PROCESSING');
    setResultUrl(null);

    try {
      const file = files[0].file;
      const blob = await PdfContentExtractor.extractImages(
        file,
        format,
        (current, total) => {
          setProgress({ current, total });
        }
      );

      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setStatus('COMPLETED');
    } catch (error) {
      console.error('Extract images error:', error);
      setStatus('ERROR');
    }
  };

  const handleExtractFromPages = async () => {
    if (files.length === 0 || !pageRanges) return;

    setStatus('PROCESSING');
    setResultUrl(null);

    try {
      const file = files[0].file;
      const blob = await PdfContentExtractor.extractImagesFromPages(
        file,
        pageRanges,
        format,
        (current, total) => {
          setProgress({ current, total });
        }
      );

      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setStatus('COMPLETED');
    } catch (error) {
      console.error('Extract images error:', error);
      setStatus('ERROR');
    }
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFiles([]);
    setStatus('IDLE');
    setResultUrl(null);
    setPageRanges('');
  };

  const sidebarContent = (
    <div className="space-y-6">
      {/* Format Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('extract_images.format', 'Export Format')}
        </label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as ImageFormat)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
        </select>
      </div>

      {/* Page Ranges (Optional) */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('extract_images.pages', 'Page Ranges (Optional)')}
        </label>
        <input
          type="text"
          value={pageRanges}
          onChange={(e) => setPageRanges(e.target.value)}
          placeholder="1-3,5,7-9"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
        />
        <p className="text-xs text-gray-500 mt-1">
          {t('extract_images.pages_hint', 'Leave empty to extract all pages')}
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-2">{t('extract_images.how_to', 'How to Use')}</h4>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>{t('extract_images.step1', 'Upload a PDF file')}</li>
          <li>{t('extract_images.step2', 'Choose image format')}</li>
          <li>{t('extract_images.step3', 'Optionally specify page ranges')}</li>
          <li>{t('extract_images.step4', 'Click Extract to download ZIP')}</li>
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
      <h3 className="text-xl font-semibold mb-2">
        {t('extract_images.success', 'Images Extracted!')}
      </h3>
      <a
        href={resultUrl}
        download={`${files[0]?.file.name.replace('.pdf', '')}_images.zip`}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {t('common.download', 'Download ZIP')}
      </a>
      <button
        onClick={handleReset}
        className="block mt-4 text-sm text-blue-600 hover:underline mx-auto"
      >
        {t('extract_images.reset', 'Extract Another')}
      </button>
    </div>
  );

  return (
    <ToolPageLayout
      title={t('tool.extract_images.title', 'Extract Images from PDF')}
      description={t('tool.extract_images.desc', 'Extract all images from PDF to ZIP')}
      files={files}
      status={status}
      onFilesSelected={handleFileSelect}
      onRemoveFile={handleRemoveFile}
      onStart={pageRanges ? handleExtractFromPages : handleExtract}
      accept=".pdf"
      maxFiles={1}
      sidebarContent={sidebarContent}
      successContent={successContent}
      actionLabel={t('extract_images.action', 'Extract Images')}
      progress={progress.total > 0 ? (progress.current / progress.total) * 100 : 0}
    />
  );
}
