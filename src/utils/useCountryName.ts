// src/utils/countryUtils.ts  (o donde prefieras)
import { useLanguage } from '../hooks/useLanguage'; // o tu hook de i18n

export const useCountryName = () => {
  const { t } = useLanguage();

  const getCountryName = (code: string): string => {
    return t(`common:countries.${code}`) || code;
  };

  return { getCountryName };
};