// src/components/ui/Select.tsx
import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option<T = string | number> {
  value: T;
  label: string;
}

interface SelectProps<T = string | number> {
  value: T;
  onChange: (value: T) => void;
  options: readonly Option<T>[];
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  className?: string;
}

const Select = <T extends string | number = string | number>({
  value,
  onChange,
  options,
  label, // Descomentado
  placeholder = 'Selecciona una opción',
  required = false,
  disabled = false,
  errorMessage = 'Este campo es obligatorio',
  className = '',
}: SelectProps<T>) => {
  const [touched, setTouched] = useState(false);
  
  const hasError = touched && required && (value === '' || value === undefined);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = options.find(opt => String(opt.value) === e.target.value);
    if (selectedOption) {
      onChange(selectedOption.value);
    }
  };

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {/* Label fuera del contenedor relativo del icono */}
      {label && (
        <label className="block text-[rgb(var(--text))] text-lg mb-1">
          {label}
        </label>
      )}

      {/* Contenedor relativo solo para el select y el icono */}
      <div className="relative w-full">
        <select
          value={String(value)}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          disabled={disabled}
          className={`
            appearance-none w-full px-4 py-3 rounded-lg border
            bg-[rgb(var(--surface))] text-[rgb(var(--text))]
            focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent
            transition-all duration-200 pr-10
            ${hasError ? 'border-[rgb(var(--danger))]' : 'border-[rgb(var(--border))]'}
            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
            ${value === '' ? 'text-[rgb(var(--text-secondary))]' : 'text-[rgb(var(--text))]'}
          `}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          
          {options.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown 
            size={20} 
            className={`
              transition-colors duration-200
              ${disabled ? 'text-[rgb(var(--text-secondary))] opacity-60' : 'text-[rgb(var(--text-secondary))]'}
              ${hasError ? '!text-[rgb(var(--danger))]' : ''}
            `}
          />
        </div>
      </div>

      {hasError && (
        <div className="mt-1.5 text-sm text-[rgb(var(--danger))] animate-in fade-in slide-in-from-top-1 duration-200">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default Select;