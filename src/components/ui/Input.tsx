// src/components/ui/Input.tsx
import { useState } from 'react';
import type { ChangeEvent } from 'react';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  validationRegex?: RegExp;
  errorMessage?: string;
  className?: string;
  label?: string;
  multiline?: boolean;
  rows?: number;
}

const Input = ({
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  validationRegex,
  errorMessage = 'El valor ingresado no es válido',
  className = '',
  label,
  multiline = false,
  rows = 3,
}: InputProps) => {
  const [touched, setTouched] = useState(false);
  const hasError = touched && required && !value;
  const regexError = touched && validationRegex && value && !validationRegex.test(value);

  const showError = hasError || regexError;

  // Estilos base compartidos
  const baseInputStyles = `
    w-full px-4 py-3 rounded-lg border
    bg-[rgb(var(--surface))] text-[rgb(var(--text))] text-base
    placeholder:text-[rgb(var(--text-secondary))]
    focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent
    transition-all duration-200
    ${showError ? 'border-[rgb(var(--danger))]' : 'border-[rgb(var(--border))]'}
    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
  `;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-[rgb(var(--text))] text-lg mb-1">
          {label}
        </label>
      )}
      
      {multiline ? (
        <textarea
          value={value}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`${baseInputStyles} resize-y min-h-[100px]`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={baseInputStyles}
        />
      )}

      {/* Mensaje de error */}
      {showError && (
        <div className="mt-1.5 text-sm text-[rgb(var(--danger))] animate-in fade-in slide-in-from-top-1">
          {hasError ? 'Este campo es requerido' : errorMessage}
        </div>
      )}
    </div>
  );
};

export default Input;