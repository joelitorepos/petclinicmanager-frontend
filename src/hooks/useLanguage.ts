// src/hooks/useLanguage.ts
import { useContext } from "react";
import { LanguageContext } from "../contexts/Language";
import type { TOptions } from "i18next";

/**
 * Wrapper seguro para la función t de i18next
 * Usamos 'as any' solo en la llamada interna (es el cast mínimo y más seguro)
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage debe usarse dentro de LanguageProvider");
  }

  return {
    ...context,
    translate: (key: string, options?: TOptions | string) =>
      context.t(key, options as any),
    translateNS: (ns: string, key: string, options?: TOptions | string) =>
      context.t(`${ns}:${key}`, options as any),
  };
};
