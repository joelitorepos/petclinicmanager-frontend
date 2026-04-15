// src/components/ui/DateInput.tsx
import { useState } from 'react';
import type { ChangeEvent } from 'react';

interface DateInputProps {
  value: string; // Formato esperado: "YYYY-MM-DD"
  onChange: (value: string) => void;
  label?: string;
  type?: 'date' | 'datetime-local' | 'time';
  required?: boolean;
  disabled?: boolean;
  className?: string;
  errorMessage?: string;
  max?: string; // Para evitar fechas futuras, ej: new Date().toISOString().split('T')[0]
  min?: string;
}

const DateInput = ({
  value,
  onChange,
  label,
  type = 'date',
  required = false,
  disabled = false,
  className = '',
  errorMessage = 'La fecha es obligatoria',
  max,
  min,
}: DateInputProps) => {
  const [touched, setTouched] = useState(false);
  const hasError = touched && required && !value;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-[rgb(var(--text))] text-lg mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        max={max}
        min={min}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-lg border
          bg-[rgb(var(--surface))] text-[rgb(var(--text))] text-base
          focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent
          transition-all duration-200
          ${hasError ? 'border-[rgb(var(--danger))]' : 'border-[rgb(var(--border))]'}
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
          scheme-dark:color-white
        `} /* scheme-dark:color-white Asegura que el icono del calendario sea visible en temas oscuros */
      />

      {hasError && (
        <div className="mt-1.5 text-sm text-[rgb(var(--danger))] animate-in fade-in slide-in-from-top-1">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default DateInput;