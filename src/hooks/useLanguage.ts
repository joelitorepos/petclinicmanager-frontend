// src/hooks/useLanguage.ts
import { useContext } from 'react';
import { LanguageContext } from '../contexts/Language';
import type { TOptions } from 'i18next';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de LanguageProvider');
  }

  return {
    ...context,
    // Definimos options como un registro de valores desconocidos
    translate: (key: string, options?: Record<string, unknown>) => 
      context.t(key, options as TOptions),
    
    translateNS: (ns: string, key: string, options?: Record<string, unknown>) => 
      context.t(`${ns}:${key}`, options as TOptions),
  };
};