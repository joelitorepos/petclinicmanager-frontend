// src/components/workspace-setup/steps/Step3.tsx
import React from 'react';
import { useLanguage } from '../../../../hooks/useLanguage';

// 1. Definimos los tipos aquí para usarlos en el casting
type CountryCode = 'GT' | 'ES' | 'US' | 'MX' | 'AR';
type LanguageCode = 'en' | 'es';

interface Step3Props {
  formData: {
    // 2. Actualizamos la interfaz para usar los tipos específicos
    country: CountryCode | null;
    language: LanguageCode | null;
  };
  // 3. La función onChange ahora espera los tipos correctos
  onChange: (field: 'country' | 'language', value: CountryCode | LanguageCode | null) => void;
}

const Step3: React.FC<Step3Props> = ({ formData, onChange }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold mb-6 text-gray-800">
        {t('currentClinics:modal.step3.title')}
      </h3>

      <p className="text-sm text-gray-500 mb-6">
        {t('currentClinics:modal.step3.description')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* País */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            {t('currentClinics:modal.step3.country_label')} *
          </label>
          <select
            value={formData.country || ''}
            // 4. SOLUCIÓN LÍNEA 37: Hacemos cast del valor a (CountryCode | null)
            onChange={(e) => onChange('country', (e.target.value || null) as CountryCode | null)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
            required
          >
            <option value="">{t('currentClinics:modal.step3.country_placeholder')}</option>
            <option value="GT">{t('common:countries.GT')}</option>
            <option value="ES">{t('common:countries.ES')}</option>
            <option value="US">{t('common:countries.US')}</option>
            <option value="MX">{t('common:countries.MX')}</option>
            <option value="AR">{t('common:countries.AR')}</option>
          </select>
          {!formData.country && (
            <p className="mt-1 text-sm text-red-500">
              {t('currentClinics:modal.step3.country_required')}
            </p>
          )}
        </div>

        {/* Idioma */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            {t('currentClinics:modal.step3.language_label')} *
          </label>
          <select
            value={formData.language || ''}
            onChange={(e) => onChange('language', (e.target.value || null) as LanguageCode | null)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white"
            required
          >
            <option value="">{t('currentClinics:modal.step3.language_placeholder')}</option>
            <option value="es">{t('currentClinics:modal.step3.language_spanish')}</option>
            <option value="en">{t('currentClinics:modal.step3.language_english')}</option>
          </select>
          {!formData.language && (
            <p className="mt-1 text-sm text-red-500">
              {t('currentClinics:modal.step3.language_required')}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-lg">
        <p className="font-semibold">{t('currentClinics:modal.step3.note_title')}</p>
        <p className="text-sm">{t('currentClinics:modal.step3.note_description')}</p>
      </div>
    </div>
  );
};

export default Step3;