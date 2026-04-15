// src/components/clinic/tools/DragAndDropImport.tsx

import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X, FileWarning } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface DragAndDropImportProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

export const DragAndDropImport = ({
  onFileSelect,
  accept = ".csv, .xlsx, .xls, ods",
  maxSizeMB = 5,
  disabled = false,
}: DragAndDropImportProps) => {
  const { t } = useLanguage();

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const validateFile = (file: File) => {
    setError(null);
    const fileSizeMB = file.size / (1024 * 1024);
    
    if (fileSizeMB > maxSizeMB) {
      setError(
        `${t('ui:dragAndDrop.errorSizePrefix')} ${maxSizeMB}${t('ui:dragAndDrop.errorSizeSuffix')}`
      );
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`
          relative min-h-[200px] flex flex-col items-center justify-center p-8
          rounded-xl border-2 border-dashed transition-all duration-300
          ${isDragging 
            ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary)/0.1)] scale-[1.01]' 
            : 'border-[rgb(var(--border))] bg-[rgb(var(--surface))]'}
          ${!selectedFile && !disabled ? 'cursor-pointer hover:border-[rgb(var(--primary)/0.7)]' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

        {!selectedFile ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-[rgb(var(--bg))] rounded-full inline-block shadow-inner">
              <Upload className="text-[rgb(var(--primary))]" size={40} />
            </div>
            <div>
              <p className="text-lg font-medium text-[rgb(var(--text))]">
                {t('ui:dragAndDrop.title')}
              </p>
              <p className="text-sm text-[rgb(var(--text-secondary))]">
                {t('ui:dragAndDrop.subtitle')}
              </p>
            </div>
            <div className="text-xs text-[rgb(var(--text-secondary))] opacity-70">
              {t('ui:dragAndDrop.formats')}{maxSizeMB}{t('ui:dragAndDrop.formatsSuffix')}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 bg-[rgb(var(--bg))] p-4 rounded-lg border border-[rgb(var(--primary)/0.3)] w-full max-w-md">
            <FileSpreadsheet className="text-[rgb(var(--success))]" size={32} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[rgb(var(--text))] truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-[rgb(var(--text-secondary))]">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            {!disabled && (
              <button
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="p-2 hover:bg-[rgb(var(--danger)/0.1)] text-[rgb(var(--danger))] rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-[rgb(var(--danger))] text-sm">
          <FileWarning size={16} />
          {error}
        </div>
      )}
    </div>
  );
};