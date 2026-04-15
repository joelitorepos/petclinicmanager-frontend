// src/contexts/Language.tsx
import { createContext, useContext } from 'react';
import type { User } from '../interfaces/User';
import type { TFunction, i18n as i18nType } from 'i18next';

interface LanguageContextType {
  user: User | null;
  loading: boolean;
  currentLanguage: 'en' | 'es';
  changeLanguage: (lng: 'en' | 'es') => Promise<void>;
  t: TFunction;
  i18n: i18nType;
  ready: boolean;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguageContext must be used within LanguageProvider');
  return context;
};