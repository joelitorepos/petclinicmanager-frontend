// src/components/ui/Textarea.tsx
import { useState } from 'react';
import type { ChangeEvent } from 'react';

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  validationRegex?: RegExp;
  errorMessage?: string;
  className?: string;
}

export const Textarea = ({
  value,
  onChange,
  placeholder = '',
  rows = 4,
  required = false,
  disabled = false,
  validationRegex,
  errorMessage = 'El texto no cumple con el formato esperado',
  className = '',
}: TextareaProps) => {
  const [touched, setTouched] = useState(false);
  const hasError = touched && required && !value.trim();
  const regexError = touched && validationRegex && value && !validationRegex.test(value);

  const showError = hasError || regexError;

  return (
    <div className={`w-full ${className}`}>
      <textarea
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-lg border resize-none
          bg-[rgb(var(--surface))] text-[rgb(var(--text))]
          placeholder:text-[rgb(var(--text-secondary))]
          focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent
          transition-all duration-200
          ${showError ? 'border-[rgb(var(--danger))]' : 'border-[rgb(var(--border))]'}
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      />

      {showError && (
        <div className="mt-1.5 text-sm text-[rgb(var(--danger))] animate-in fade-in slide-in-from-top-1 duration-200">
          {hasError ? 'Este campo es obligatorio' : errorMessage}
        </div>
      )}
    </div>
  );
};