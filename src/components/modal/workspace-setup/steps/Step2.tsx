// src/components/workspace-setup/steps/Step2.tsx
import React from 'react';
import PhoneInput from '../../../ui/PhoneInput';
import { useLanguage } from '../../../../hooks/useLanguage';
import type { IPhone } from '../../../../interfaces/shared.types';

interface Step2Props {
  formData: {
    phone: IPhone | null;
    secondaryPhone: IPhone | null;
    address: string | null;
  };
  onChange: (field: 'phone' | 'secondaryPhone' | 'address', value: IPhone | string | null) => void;
}

const Step2: React.FC<Step2Props> = ({ formData, onChange }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold mb-6 text-gray-800">
          {t('currentClinics:modal.step2.title')}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {t('currentClinics:modal.step2.description')}
        </p>
      </div>

      <div className="space-y-6">
        {/* Teléfono principal */}
        <PhoneInput
          value={formData.phone}
          onChange={(value) => onChange('phone', value)}
          label={t('currentClinics:modal.step2.phone_label') || 'Teléfono principal'}
          placeholder="Ej: 55123456"
          required={false}
          simpleStyle // <-- Se activa el estilo básico
        />

        {/* Teléfono secundario */}
        <PhoneInput
          value={formData.secondaryPhone}
          onChange={(value) => onChange('secondaryPhone', value)}
          label={t('currentClinics:modal.step2.secondaryPhone_label') || 'Teléfono secundario'}
          placeholder="Ej: 22001234"
          required={false}
          simpleStyle // <-- Se activa el estilo básico
        />

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            {t('currentClinics:modal.step2.address_label')}
          </label>
          <input
            type="text"
            value={formData.address || ''}
            onChange={(e) => onChange('address', e.target.value || null)}
            placeholder={t('currentClinics:modal.step2.address_placeholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          />
        </div>
      </div>
    </div>
  );
};

export default Step2;