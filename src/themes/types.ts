// src/themes/types.ts
export type ThemeName =
  | 'emerald'
  | 'violet'
  | 'sunset'
  | 'ocean'
  | 'forest'
  | 'rose'
  | 'amber'
  | 'slate';

export interface Theme {
  name: ThemeName;
  displayName: string;
  primary: string;
  primaryHover: string;
  primaryActive: string;
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  success: string;
  warning: string;
  danger: string;
}