// src/hooks/useTheme.ts
import { useEffect } from 'react';
import { getSavedTheme, applyTheme } from '../themes/themeManager';

export const useTheme = () => {
  useEffect(() => {
    const theme = getSavedTheme();
    if (theme !== 'system') {
      applyTheme(theme);
    }
  }, []);
};