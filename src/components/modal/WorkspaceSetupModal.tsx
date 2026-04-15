// src/components/workspace-setup/WorkspaceSetupModal.tsx
import React, { useState } from 'react';
import Step1 from './workspace-setup/steps/Step1';
import Step2 from './workspace-setup/steps/Step2';
import Step3 from './workspace-setup/steps/Step3';
import BASEURL from '../../hooks/BaseUrl';
import usePost from '../../hooks/usePost';
import { useLanguage } from '../../hooks/useLanguage';
import type { IPhone } from '../../interfaces/shared.types';

interface ILogo {
  url: string;
  key: string;
}

interface Workspace {
  _id: string;
  name: string;
  slug: string;
  logo?: ILogo;
  phone?: IPhone;
  secondaryPhone?: IPhone;
  email?: string;
  address?: string;
  country?: string;
  language?: string;
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  createdBy: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  deleted: boolean;
}

type CountryCode = 'GT' | 'ES' | 'US' | 'MX' | 'AR';
type LanguageCode = 'en' | 'es';

interface WorkspaceFormData {
  name: string;
  logo: File | null;
  email: string;
  phone: IPhone | null;
  secondaryPhone: IPhone | null;
  address: string | null;
  country: CountryCode | null;
  language: LanguageCode | null;
}

const API_URL = `${BASEURL}/api/workspaces/`;
const TOTAL_STEPS = 3;

const WorkspaceSetupModal: React.FC<{
  onClose: () => void;
  onSuccess?: (workspace: Workspace) => void;
}> = ({ onClose, onSuccess }) => {
  const { t } = useLanguage();
  const { post, loading, error } = usePost<Workspace, FormData>(API_URL);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WorkspaceFormData>({
    name: '',
    logo: null,
    email: '',
    phone: { country: 'GT', number: '' },
    secondaryPhone: null,
    address: null,
    country: null,
    language: null,
  });

  const updateField = <K extends keyof WorkspaceFormData>(
    field: K,
    value: WorkspaceFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validaciones por paso
  const isStep1Valid = formData.name.trim().length >= 3;
  const isStep2Valid = true; // Teléfonos y dirección son opcionales
  const isStep3Valid = Boolean(formData.country && formData.language);

  const handleNext = () => {
    if (currentStep === 1 && !isStep1Valid) return;
    if (currentStep === 2 && !isStep2Valid) return;
    if (currentStep === 3 && !isStep3Valid) return;

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    const payload = new FormData();
    
    payload.append('name', formData.name);
    payload.append('plan', 'free');

    // Email (nuevo)
    if (formData.email.trim()) {
      payload.append('email', formData.email.trim());
    }

    // Teléfonos como objetos (backend ahora los espera así)
    if (formData.phone?.number) {
      payload.append('phone', JSON.stringify(formData.phone));
    }
    if (formData.secondaryPhone?.number) {
      payload.append('secondaryPhone', JSON.stringify(formData.secondaryPhone));
    }

    if (formData.address) payload.append('address', formData.address);
    if (formData.country) payload.append('country', formData.country);
    if (formData.language) payload.append('language', formData.language);

    // Logo
    if (formData.logo instanceof File) {
      payload.append('logo', formData.logo);
    }

    const result = await post(payload);

    if (result) {
      onSuccess?.(result);
      onClose();
    }
  };

  const isCurrentStepValid = () => {
    if (currentStep === 1) return isStep1Valid;
    if (currentStep === 2) return isStep2Valid;
    if (currentStep === 3) return isStep3Valid;
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 text-2xl font-light"
          disabled={loading}
        >
          ×
        </button>

        <h2 className="text-3xl font-bold text-emerald-700 mb-2">
          {t('currentClinics:modal.title')}
        </h2>
        <p className="text-gray-600 mb-8">
          {t('currentClinics:modal.step_progress', { current: currentStep, total: TOTAL_STEPS })}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error.message || t('currentClinics:modal.error_general')}
          </div>
        )}

        {currentStep === 1 && (
          <Step1
            formData={{
              name: formData.name,
              email: formData.email,
              logo: formData.logo,
            }}
            onChange={(field, value) => updateField(field as 'name' | 'email', value)}
            onFileChange={(file) => updateField('logo', file)}
          />
        )}

        {currentStep === 2 && (
          <Step2
            formData={{
              phone: formData.phone,
              secondaryPhone: formData.secondaryPhone,
              address: formData.address,
            }}
            onChange={(field, value) => updateField(field, value)}
          />
        )}

        {currentStep === 3 && (
          <Step3
            formData={{
              country: formData.country,
              language: formData.language,
            }}
            onChange={(field, value) => updateField(field as 'country' | 'language', value)}
          />
        )}

        <div className="flex justify-between items-center mt-10 pt-6 border-t">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || loading}
            className="text-gray-600 hover:text-emerald-600 disabled:opacity-50 font-medium"
          >
            {t('currentClinics:modal.button_back')}
          </button>

          <button
            onClick={currentStep === TOTAL_STEPS ? handleSubmit : handleNext}
            disabled={(currentStep < TOTAL_STEPS && !isCurrentStepValid()) || loading}
            className={`px-8 py-3 rounded-xl font-semibold transition flex items-center gap-2 ${
              loading || (currentStep < TOTAL_STEPS && !isCurrentStepValid())
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                {t('currentClinics:modal.button_creating')}
              </>
            ) : currentStep === TOTAL_STEPS ? (
              t('currentClinics:modal.button_finish')
            ) : (
              t('currentClinics:modal.button_next')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSetupModal;