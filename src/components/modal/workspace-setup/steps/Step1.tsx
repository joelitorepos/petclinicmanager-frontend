// src/components/workspace-setup/steps/Step1.tsx
import React from 'react';
import { useLanguage } from '../../../../hooks/useLanguage';

interface Step1Props {
  formData: { 
    name: string; 
    email: string;
    logo: File | null;
  };
  onChange: (field: 'name' | 'email', value: string) => void;
  onFileChange: (file: File | null) => void;
}

const Step1: React.FC<Step1Props> = ({ formData, onChange, onFileChange }) => {
  const { t } = useLanguage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileChange(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold mb-6 text-gray-800">
          {t('currentClinics:modal.step1.title')}
        </h3>
        
        <label className="block text-sm font-medium text-gray-600 mb-2">
          {t('currentClinics:modal.step1.name_label')} *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          placeholder={t('currentClinics:modal.step1.name_placeholder')}
          required
          autoFocus
        />
        {formData.name.length > 0 && formData.name.length < 3 && (
          <p className="mt-1 text-sm text-red-500">
            {t('currentClinics:modal.step1.name_error')}
          </p>
        )}
      </div>

      {/* NUEVO: Campo Email */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          {t('currentClinics:modal.step1.email_label') || 'Email de la clínica'}
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          placeholder={t('currentClinics:modal.step1.email_placeholder') || 'clinica@ejemplo.com'}
        />
        <p className="mt-1 text-xs text-gray-500">
          Opcional - Se usará para facturación y notificaciones
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          {t('currentClinics:modal.step1.logo_label')}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
        />
        <p className="mt-2 text-xs text-gray-500">
          {t('currentClinics:modal.step1.logo_description')}
        </p>

        {formData.logo && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Vista previa:</p>
            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
              <img
                src={URL.createObjectURL(formData.logo)}
                alt="Logo preview"
                className="w-full h-full object-contain bg-gray-50"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step1;