// src/components/common/LanguageSwitcher.tsx
import { useLanguage } from '../../hooks/useLanguage';
import { Globe } from 'lucide-react';
import Select from '../ui/Select'; // Importamos tu componente UI

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'fixed' | 'dynamic';
}

const LanguageSwitcher = ({ className = '', variant = 'fixed' }: LanguageSwitcherProps) => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const options = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
  ] as const;

  // Render para la Landing Page (Colores fijos)
  if (variant === 'fixed') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Globe size={18} className="text-gray-500" />
        <select
          value={currentLanguage}
          onChange={(e) => changeLanguage(e.target.value as 'en' | 'es')}
          className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  }

  // Render para el Workspace (Usa el tema dinámico del usuario)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe size={18} className="text-[rgb(var(--text-secondary))]" />
      <div className="w-32"> {/* Contenedor para controlar el ancho del Select */}
        <Select
          value={currentLanguage}
          options={options}
          onChange={(val) => changeLanguage(val as 'en' | 'es')}
          className="!py-0" // Ajuste opcional para que sea más compacto
        />
      </div>
    </div>
  );
};

export default LanguageSwitcher;