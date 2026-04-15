// src/components/clinic/layout/ThemeSelector.tsx
import { applyTheme } from '../../../themes/themeManager';
import { useLanguage } from '../../../hooks/useLanguage';
import { Palette } from 'lucide-react';

// Definir el tipo para los nombres de temas
export type ThemeName = 
  | 'emerald' 
  | 'violet' 
  | 'sunset' 
  | 'ocean' 
  | 'forest' 
  | 'rose' 
  | 'amber' 
  | 'slate';

const ThemeSelector = () => {

  const { t } = useLanguage();

  const themes: { 
  name: ThemeName; 
  label: string;
  color: string;
  icon: string;
}[] = [
  { name: 'emerald', label: t('themes:types.emerald'), color: '#10b981', icon: '🌿' },
  { name: 'violet', label: t('themes:types.violet'), color: '#8b5cf6', icon: '🌸' },
  { name: 'sunset', label: t('themes:types.sunset'), color: '#f97316', icon: '🌅' },
  { name: 'ocean', label: t('themes:types.ocean'), color: '#0ea5e9', icon: '🌊' },
  { name: 'forest', label: t('themes:types.forest'), color: '#22c55e', icon: '🌲' },
  { name: 'rose', label: t('themes:types.rose'), color: '#f43f5e', icon: '🌹' },
  { name: 'amber', label: t('themes:types.amber'), color: '#fb923c', icon: '🟠' },
  { name: 'slate', label: t('themes:types.slate'), color: '#64748b', icon: '🌙' },
];

const defaultLabel = t('themes:default');

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4 text-sm font-medium text-[rgb(var(--text))]">
        <Palette size={18} className="text-[rgb(var(--primary))]" />
        <span>{t('themes:labels.indication')}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {themes.map((t) => (
          <button
            key={t.name}
            onClick={() => applyTheme(t.name)}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] hover:shadow-md transition-all duration-200 group cursor-pointer"
            style={{ 
              backgroundColor: t.name === 'slate' 
                ? 'rgb(var(--surface))' 
                : 'rgb(var(--surface))'
            }}
            aria-label={`Cambiar a tema ${t.label}`}
            title={`Tema ${t.label}`}
          >
            <div 
              className="w-10 h-10 rounded-full mb-2 flex items-center justify-center text-white text-lg"
              style={{ backgroundColor: t.color }}
            >
              {t.icon}
            </div>
            <span className="text-xs font-medium text-[rgb(var(--text))] group-hover:text-[rgb(var(--primary))]">
              {t.label}
            </span>
            <span className="text-[10px] text-[rgb(var(--text-secondary))] mt-0.5">
              {t.name === 'emerald' ? defaultLabel : ''}
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs text-[rgb(var(--text-secondary))] mt-3 text-center">
        {t('themes:labels.aclaration')}
      </p>
    </div>
  );
};

export default ThemeSelector;