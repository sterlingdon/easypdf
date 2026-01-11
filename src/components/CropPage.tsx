'use client';

import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ToolPageLayout } from './ToolPageLayout';
import { FileItem, ProcessingStatus } from '@/types';
import { PdfPageTransformer, CropMargins, PageSizeUnit } from '@/services/PdfPageTransformer';

export default function CropPage() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('IDLE');
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  // Crop settings
  const [usePercentage, setUsePercentage] = useState<boolean>(true);
  const [margins, setMargins] = useState({
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  });
  const [unit, setUnit] = useState<PageSizeUnit>('mm');

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

  const handleCrop = async () => {
    if (files.length === 0) return;

    setStatus('PROCESSING');
    setResultUrl(null);

    try {
      const file = files[0].file;
      let resultBlob: Blob;

      if (usePercentage) {
        // Crop by percentage
        resultBlob = await PdfPageTransformer.cropByPercentage(
          file,
          margins
        );
      } else {
        // Crop by absolute margins
        const cropMargins: CropMargins = {
          ...margins,
          unit,
        };
        resultBlob = await PdfPageTransformer.crop(file, cropMargins);
      }

      const url = URL.createObjectURL(resultBlob);
      setResultUrl(url);
      setStatus('COMPLETED');
    } catch (error) {
      console.error('Crop error:', error);
      setStatus('ERROR');
    }
  };

  const handleReset = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFiles([]);
    setStatus('IDLE');
    setResultUrl(null);
  };

  const handleMarginChange = (field: keyof typeof margins, value: string) => {
    setMargins((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const sidebarContent = (
    <div className="space-y-6">
      {/* Crop Mode */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('crop.mode', 'Crop Mode')}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={usePercentage}
            onChange={(e) => setUsePercentage(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          {t('crop.use_percentage', 'Use Percentage')}
        </label>
      </div>

      {/* Margins */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('crop.margins', 'Margins')}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs mb-1">{t('crop.top', 'Top')}</label>
            <input
              type="number"
              value={margins.top}
              onChange={(e) => handleMarginChange('top', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">{t('crop.right', 'Right')}</label>
            <input
              type="number"
              value={margins.right}
              onChange={(e) => handleMarginChange('right', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">{t('crop.bottom', 'Bottom')}</label>
            <input
              type="number"
              value={margins.bottom}
              onChange={(e) => handleMarginChange('bottom', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">{t('crop.left', 'Left')}</label>
            <input
              type="number"
              value={margins.left}
              onChange={(e) => handleMarginChange('left', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {usePercentage
            ? t('crop.percentage_hint', 'Values are in percent of page dimension')
            : t('crop.absolute_hint', 'Values are in selected unit')}
        </p>
      </div>

      {/* Unit (for absolute mode) */}
      {!usePercentage && (
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('crop.unit', 'Unit')}
          </label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as PageSizeUnit)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="mm">mm</option>
            <option value="inch">inch</option>
            <option value="pt">pt</option>
          </select>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-2">{t('crop.how_to', 'How to Use')}</h4>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>{t('crop.step1', 'Upload a PDF file')}</li>
          <li>{t('crop.step2', 'Set margin values')}</li>
          <li>{t('crop.step3', 'Choose percentage or absolute')}</li>
          <li>{t('crop.step4', 'Click Crop to process')}</li>
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
        {t('crop.success', 'PDF Cropped!')}
      </h3>
      <a
        href={resultUrl}
        download={`${files[0]?.file.name.replace('.pdf', '')}_cropped.pdf`}
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
        {t('crop.reset', 'Crop Another PDF')}
      </button>
    </div>
  );

  return (
    <ToolPageLayout
      title={t('tool.crop.title', 'Crop PDF')}
      description={t('tool.crop.desc', 'Remove margins from PDF pages')}
      files={files}
      status={status}
      onFilesSelected={handleFileSelect}
      onRemoveFile={handleRemoveFile}
      onStart={handleCrop}
      accept=".pdf"
      maxFiles={1}
      sidebarContent={sidebarContent}
      successContent={successContent}
      actionLabel={t('crop.action', 'Crop PDF')}
    />
  );
}
