// src/hooks/useLanguage.ts
import { useContext } from "react";
import { LanguageContext } from "../contexts/Language";
import type { TOptions } from "i18next";

/**
 * Usamos un tipo que herede de TOptions pero que asegure
 * compatibilidad con las firmas de i18next.
 */
type SafeTranslationOptions = TOptions & Record<string, unknown>;

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage debe usarse dentro de LanguageProvider");
  }

  return {
    ...context,

    // Al usar "as TOptions", le indicamos a TS que ignore las sobrecargas
    // de 'defaultValue' (que es un string) y use la de 'options'.
    translate: (key: string, options?: SafeTranslationOptions) =>
      context.t(key, options as TOptions),

    translateNS: (ns: string, key: string, options?: SafeTranslationOptions) =>
      context.t(`${ns}:${key}`, options as TOptions),
  };
};
