'use client';

import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ToolPageLayout } from './ToolPageLayout';
import { FileItem, ProcessingStatus } from '@/types';
import { PdfPageTransformer, PageSize, PaperSize, PageSizeUnit } from '@/services/PdfPageTransformer';

export default function AdjustSizePage() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // Settings
  const [presetSize, setPresetSize] = useState<PaperSize>('a4');
  const [customSize, setCustomSize] = useState<PageSize>({
    width: 210,
    height: 297,
    unit: 'mm',
  });
  const [useCustom, setUseCustom] = useState<boolean>(false);
  const [scaleContent, setScaleContent] = useState<boolean>(true);
  const [targetDPI, setTargetDPI] = useState<number>(72);
  const [adjustDPI, setAdjustDPI] = useState<boolean>(false);

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

  const handleAdjustSize = async () => {
    if (files.length === 0) return;

    setStatus('PROCESSING');
    setResultUrl(null);

    try {
      const file = files[0].file;

      let resultBlob: Blob;

      if (adjustDPI) {
        // Adjust DPI
        resultBlob = await PdfPageTransformer.adjustDPI(
          file,
          targetDPI,
          72
        );
      } else if (useCustom) {
        // Use custom size
        resultBlob = await PdfPageTransformer.adjustSize(
          file,
          customSize,
          scaleContent
        );
      } else {
        // Use preset size
        resultBlob = await PdfPageTransformer.adjustSize(
          file,
          presetSize,
          scaleContent
        );
      }

      const url = URL.createObjectURL(resultBlob);
      setResultUrl(url);
      setStatus('COMPLETED');
    } catch (error) {
      console.error('Adjust size error:', error);
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
      {/* Adjust Type */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('adjust_size.type', 'Adjust Type')}
        </label>
        <select
          value={adjustDPI ? 'dpi' : 'size'}
          onChange={(e) => setAdjustDPI(e.target.value === 'dpi')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="size">{t('adjust_size.page_size', 'Page Size')}</option>
          <option value="dpi">{t('adjust_size.dpi', 'DPI')}</option>
        </select>
      </div>

      {/* DPI Settings */}
      {adjustDPI && (
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('adjust_size.target_dpi', 'Target DPI')}
          </label>
          <select
            value={targetDPI}
            onChange={(e) => setTargetDPI(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="72">72 DPI (Screen)</option>
            <option value="150">150 DPI (Draft)</option>
            <option value="300">300 DPI (Print)</option>
            <option value="600">600 DPI (High Quality)</option>
          </select>
        </div>
      )}

      {/* Size Settings */}
      {!adjustDPI && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('adjust_size.preset', 'Preset Size')}
            </label>
            <div className="flex gap-2">
              <select
                value={presetSize}
                onChange={(e) => setPresetSize(e.target.value as PaperSize)}
                disabled={useCustom}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 disabled:opacity-50"
              >
                <option value="a4">A4 (210 × 297 mm)</option>
                <option value="a3">A3 (297 × 420 mm)</option>
                <option value="a5">A5 (148 × 210 mm)</option>
                <option value="letter">Letter (8.5 × 11 inch)</option>
                <option value="legal">Legal (8.5 × 14 inch)</option>
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useCustom}
                  onChange={(e) => setUseCustom(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                {t('adjust_size.custom', 'Custom')}
              </label>
            </div>
          </div>

          {useCustom && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('adjust_size.width', 'Width')}
                </label>
                <input
                  type="number"
                  value={customSize.width}
                  onChange={(e) => setCustomSize((prev) => ({ ...prev, width: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('adjust_size.height', 'Height')}
                </label>
                <input
                  type="number"
                  value={customSize.height}
                  onChange={(e) => setCustomSize((prev) => ({ ...prev, height: parseFloat(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('adjust_size.unit', 'Unit')}
                </label>
                <select
                  value={customSize.unit}
                  onChange={(e) => setCustomSize((prev) => ({ ...prev, unit: e.target.value as PageSizeUnit }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                >
                  <option value="mm">mm</option>
                  <option value="inch">inch</option>
                  <option value="pt">pt</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="scale"
              checked={scaleContent}
              onChange={(e) => setScaleContent(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="scale" className="text-sm">
              {t('adjust_size.scale_content', 'Scale content to fit')}
            </label>
          </div>
        </>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-2">{t('adjust_size.how_to', 'How to Use')}</h4>
        <div className="text-sm space-y-1">
          <p>{t('adjust_size.step1', 'Upload a PDF file')}</p>
          <p>{t('adjust_size.step2', 'Choose size or DPI adjustment')}</p>
          <p>{t('adjust_size.step3', 'Configure settings')}</p>
          <p>{t('adjust_size.step4', 'Click Resize to process')}</p>
        </div>
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
        {t('adjust_size.success', 'PDF Size Adjusted!')}
      </h3>
      <a
        href={resultUrl}
        download={`${files[0]?.file.name.replace('.pdf', '')}_resized.pdf`}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        {t('adjust_size.reset', 'Resize Another PDF')}
      </button>
    </div>
  );

  return (
    <ToolPageLayout
      title={t('tool.adjust_size.title', 'Adjust PDF Size and DPI')}
      description={t('tool.adjust_size.desc', 'Resize PDF to standard sizes or custom dimensions')}
      files={files}
      status={status}
      onFilesSelected={handleFileSelect}
      onRemoveFile={handleRemoveFile}
      onStart={handleAdjustSize}
      accept=".pdf"
      maxFiles={1}
      sidebarContent={sidebarContent}
      successContent={successContent}
      actionLabel={t('adjust_size.action', 'Resize PDF')}
    />
  );
}
