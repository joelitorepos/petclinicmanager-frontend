// src/components/ui/Checkbox.tsx
import { Check } from 'lucide-react';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const Checkbox = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  id,
}: CheckboxProps) => {
  // Generamos un ID único si no se proporciona uno para el label
  const checkboxId = id || `checkbox-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`flex items-center gap-3 cursor-pointer group ${className}`}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="peer appearance-none w-6 h-6 border-2 rounded-md 
                     bg-[rgb(var(--surface))] border-[rgb(var(--border))]
                     checked:bg-[rgb(var(--primary))] checked:border-[rgb(var(--primary))]
                     focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] focus:ring-offset-2
                     focus:ring-offset-[rgb(var(--surface))]
                     transition-all duration-200 cursor-pointer
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {/* Icono de Check que aparece solo cuando el input está checked */}
        <Check
          size={18}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                     text-white opacity-0 peer-checked:opacity-100 
                     pointer-events-none transition-opacity duration-200"
        />
      </div>
      
      {label && (
        <label
          htmlFor={checkboxId}
          className={`text-lg select-none cursor-pointer text-[rgb(var(--text))]
                     ${disabled ? 'opacity-50 cursor-not-allowed' : 'group-hover:text-[rgb(var(--text-secondary))]'}
                     transition-colors`}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;