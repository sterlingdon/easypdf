import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  selectedFile?: File | null;
  onClear?: () => void;
  title?: string;
  subtitle?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileSelect, 
  accept = "image/*", 
  selectedFile, 
  onClear,
  title,
  subtitle
}) => {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (selectedFile) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="font-medium text-slate-900 truncate max-w-[200px] sm:max-w-md">
              {selectedFile.name}
            </p>
            <p className="text-xs text-slate-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        {onClear && (
          <button 
            onClick={onClear}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 py-16 px-6
        flex flex-col items-center justify-center text-center
        ${isDragging 
          ? 'border-brand-500 bg-brand-50 scale-[1.01]' 
          : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-brand-300 hover:shadow-lg'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleInputChange}
      />
      
      <div className={`
        w-16 h-16 mb-4 rounded-full flex items-center justify-center transition-colors duration-300
        ${isDragging ? 'bg-white text-brand-500' : 'bg-brand-500 text-white shadow-md'}
      `}>
        <UploadCloud size={32} />
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 mb-2">
        {title || t('chat.upload.title')}
      </h3>
      <p className="text-slate-500 text-sm">
        {subtitle || t('chat.upload.subtitle')}
      </p>
    </div>
  );
};