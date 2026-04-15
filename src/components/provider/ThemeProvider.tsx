// src/components/provider/ThemeProvider.tsx - NUEVO ARCHIVO
import { useTheme } from '../../hooks/useTheme';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  useTheme(); // Aplica el tema global
  
  return <>{children}</>;
};