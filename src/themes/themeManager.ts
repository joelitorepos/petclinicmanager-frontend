// src/themes/themeManager.ts
import type { Theme, ThemeName } from './types';

const themes: Record<ThemeName, Theme> = {
  emerald: { name: 'emerald', displayName: 'Esmeralda', primary: '', primaryHover: '', primaryActive: '', background: '', surface: '', border: '', text: '', textSecondary: '', success: '', warning: '', danger: '' },
  violet: { name: 'violet', displayName: 'Violeta', primary: '', primaryHover: '', primaryActive: '', background: '', surface: '', border: '', text: '', textSecondary: '', success: '', warning: '', danger: '' },
  sunset: { name: 'sunset', displayName: 'Atardecer', primary: '', primaryHover: '', primaryActive: '', background: '', surface: '', border: '', text: '', textSecondary: '', success: '', warning: '', danger: '' },
  ocean: { name: 'ocean', displayName: 'Océano', primary: '', primaryHover: '', primaryActive: '', background: '', surface: '', border: '', text: '', textSecondary: '', success: '', warning: '', danger: '' },
  forest: { name: 'forest', displayName: 'Bosque', primary: '', primaryHover: '', primaryActive: '', background: '', surface: '', border: '', text: '', textSecondary: '', success: '', warning: '', danger: '' },
  rose: { name: 'rose', displayName: 'Rosa', primary: '', primaryHover: '', primaryActive: '', background: '', surface: '', border: '', text: '', textSecondary: '', success: '', warning: '', danger: '' },
  amber: { name: 'amber', displayName: 'Ámbar', primary: '', primaryHover: '', primaryActive: '', background: '', surface: '', border: '', text: '', textSecondary: '', success: '', warning: '', danger: '' },
  slate: { name: 'slate', displayName: 'Pizarra (oscuro)', primary: '', primaryHover: '', primaryActive: '', background: '', surface: '', border: '', text: '', textSecondary: '', success: '', warning: '', danger: '' },
};

export const applyTheme = (themeName: ThemeName | 'system') => {
  const html = document.documentElement;

  if (themeName === 'system') {
    html.removeAttribute('data-theme');
    localStorage.removeItem('theme');
  } else {
    html.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
  }
};

export const getSavedTheme = (): ThemeName | 'system' => {
  const saved = localStorage.getItem('theme') as ThemeName | null;
  
  // Si el usuario ya eligió un tema explícitamente, respetarlo.
  if (saved && saved in themes) return saved;

  // En lugar de detectar el modo oscuro del sistema y forzar 'slate',
  // devolvemos 'emerald' por defecto para mantener la consistencia con la Landing Page.
  // La consistencia de marca es prioritaria en la primera carga.
  
  return 'emerald';
};

export const themeList = Object.values(themes);