// src/components/ui/FileInput.tsx
import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { Upload, X } from 'lucide-react';

type SingleFileInputProps = {
  value: File | null;
  onChange: (file: File | null) => void;
  multiple?: false;
};

type MultipleFileInputProps = {
  value: File[] | null;
  onChange: (files: File[] | null) => void;
  multiple: true;
};

type CommonFileInputProps = {
  accept?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  className?: string;
  label?: string;
};

type FileInputProps = CommonFileInputProps & (SingleFileInputProps | MultipleFileInputProps);

const FileInput = (props: FileInputProps) => {
  const {
    value,
    accept = '*',
    placeholder = 'Haz clic para subir archivo(s)',
    required = false,
    disabled = false,
    errorMessage = 'Archivo no válido',
    className = '',
    multiple = false,
    label,
  } = props;

  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filesArray = value 
    ? (Array.isArray(value) ? value : [value])
    : [];
  
  const hasFiles = filesArray.length > 0;
  const hasError = touched && required && !hasFiles;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) {
      props.onChange(null);
      return;
    }
    const files = Array.from(selectedFiles);
    if (props.multiple) {
      props.onChange(files);
    } else {
      props.onChange(files[0]);
    }
  };

  const removeFile = (index: number) => {
    if (props.multiple) {
      const currentFiles = props.value || [];
      const newFiles = currentFiles.filter((_, i) => i !== index);
      props.onChange(newFiles.length > 0 ? newFiles : null);
    } else {
      props.onChange(null);
    }
  };

  const removeAll = () => {
    props.onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {/* 1. Label separado del contenedor del input */}
      {label && (
        <label className="block text-[rgb(var(--text))] text-lg mb-1">
          {label}
        </label>
      )}

      {/* 2. El label contenedor ahora solo envuelve el área interactiva */}
      <label className={`block ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          disabled={disabled}
          className="hidden"
        />

        <div
          className={`
            flex flex-col gap-3 px-4 py-3 rounded-lg border-2 border-dashed
            bg-[rgb(var(--surface))] text-[rgb(var(--text-secondary))]
            transition-all duration-200 min-h-[64px]
            ${hasError ? 'border-[rgb(var(--danger))]' : 'border-[rgb(var(--border))]'}
            ${disabled ? 'opacity-60' : 'hover:border-[rgb(var(--primary))]'}
          `}
        >
          {!hasFiles && (
            <div className="flex items-center gap-3">
              <Upload size={20} />
              <span className="text-sm">
                {placeholder}
                {multiple && ' (puedes seleccionar varios)'}
              </span>
            </div>
          )}

          {hasFiles && (
            <div className="space-y-2">
              {filesArray.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-[rgb(var(--surface-hover))] px-3 py-2 rounded-md"
                >
                  <span className="text-sm truncate max-w-[300px]">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault(); // Evita que el label dispare el input de nuevo
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1 rounded hover:bg-[rgb(var(--border))] transition-colors"
                    disabled={disabled}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              {multiple && filesArray.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeAll();
                  }}
                  className="text-xs text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text))] underline"
                >
                  Quitar todos
                </button>
              )}
            </div>
          )}
        </div>
      </label>

      {hasError && (
        <div className="mt-1.5 text-sm text-[rgb(var(--danger))] animate-in fade-in slide-in-from-top-1 duration-200">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default FileInput;