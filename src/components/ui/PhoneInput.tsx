// src/components/ui/PhoneInput.tsx
import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { ChevronDown } from 'lucide-react';

export type CountryCode = 'GT' | 'ES' | 'US' | 'MX' | 'AR';

export interface IPhone {
  country: CountryCode;
  number: string;
}

interface PhoneInputProps {
  value: IPhone | null;
  onChange: (phone: IPhone | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  className?: string;
  simpleStyle?: boolean;
}

const PhoneInput = ({
  value,
  onChange,
  label = 'Teléfono',
  placeholder = 'Ej: 55123456',
  required = false,
  disabled = false,
  errorMessage = 'Número inválido (8–15 dígitos)',
  className = '',
  simpleStyle = false,
}: PhoneInputProps) => {
  const [touched, setTouched] = useState(false);

  const currentCountry = value?.country || 'GT';
  const currentNumber = value?.number || '';

  const phoneRegex = /^\d{8,15}$/;

  const handleCountryChange = (newCountry: CountryCode) => {
    onChange({ country: newCountry, number: currentNumber });
  };

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val === '') {
      onChange(null);
    } else {
      onChange({ country: currentCountry, number: val });
    }
  };

  const hasError = touched && required && (!value || !phoneRegex.test(currentNumber));

  const countryOptions: { value: CountryCode; label: string; flag: string }[] = [
    { value: 'GT', label: 'Guatemala', flag: '🇬🇹' },
    { value: 'ES', label: 'España',     flag: '🇪🇸' },
    { value: 'US', label: 'Estados Unidos', flag: '🇺🇸' },
    { value: 'MX', label: 'México',     flag: '🇲🇽' },
    { value: 'AR', label: 'Argentina',  flag: '🇦🇷' },
  ];

  // --- Estilos Condicionales ---
  const labelStyles = simpleStyle
    ? "block text-sm font-medium text-gray-600 mb-2"
    : "block text-[rgb(var(--text))] text-lg mb-1";

  const containerStyles = simpleStyle
    ? `flex rounded-lg border overflow-hidden bg-white transition focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 ${hasError ? 'border-red-500' : 'border-gray-300'}`
    : `flex rounded-lg border overflow-hidden bg-[rgb(var(--surface))] ${hasError ? 'border-[rgb(var(--danger))]' : 'border-[rgb(var(--border))]'}`;

  const selectWrapperStyles = simpleStyle
    ? "relative min-w-[110px] border-r border-gray-300 bg-white"
    : "relative min-w-[110px] border-r border-[rgb(var(--border))] bg-[rgb(var(--surface))]";

  const selectStyles = simpleStyle
    ? "appearance-none w-full h-full px-3 py-3 text-base bg-transparent text-gray-700 focus:outline-none cursor-pointer pr-8"
    : "appearance-none w-full h-full px-3 py-3 text-base bg-transparent text-[rgb(var(--text))] focus:outline-none cursor-pointer pr-8";

  const inputStyles = simpleStyle
    ? `flex-1 px-4 py-3 text-base bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 border-none ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`
    : `flex-1 px-4 py-3 text-base bg-[rgb(var(--surface))] text-[rgb(var(--text))] placeholder:text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] border-none ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`;

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && (
        <label className={labelStyles}>
          {label}
          {required && <span className={simpleStyle ? "text-red-500 ml-1" : "text-[rgb(var(--danger))] ml-1"}>*</span>}
        </label>
      )}

      <div className={containerStyles}>
        {/* Selector de país con bandera */}
        <div className={selectWrapperStyles}>
          <select
            value={currentCountry}
            onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
            onBlur={() => setTouched(true)}
            disabled={disabled}
            className={selectStyles}
          >
            {countryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.flag} {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <ChevronDown 
              size={18} 
              className={simpleStyle ? "text-gray-400" : `text-[rgb(var(--text-secondary))] ${disabled ? 'opacity-50' : ''}`}
            />
          </div>
        </div>

        {/* Input del número */}
        <input
          type="tel"
          inputMode="numeric"
          pattern="\d*"
          value={currentNumber}
          onChange={handleNumberChange}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={inputStyles}
        />
      </div>

      {hasError && (
        <div className={`mt-1.5 text-sm animate-in fade-in slide-in-from-top-1 duration-200 ${simpleStyle ? 'text-red-500' : 'text-[rgb(var(--danger))]'}`}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default PhoneInput;