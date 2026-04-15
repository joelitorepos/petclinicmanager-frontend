// src/hooks/useLanguage.ts
import { useContext } from 'react';
import { LanguageContext } from '../contexts/Language';
import type { TOptions } from 'i18next';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de LanguageProvider');
  }

  // Solo exponemos datos y funciones, NO ejecutamos lógica aquí.
  return {
    ...context, // user, loading, currentLanguage, changeLanguage, t, etc.
    translate: (key: string, options?: TOptions) => context.t(key, options),
    translateNS: (ns: string, key: string, options?: TOptions) => 
      context.t(`${ns}:${key}`, options),
  };
};