// src/components/clinic/tools/Settings.tsx
import { useState, useEffect } from 'react';
import { useLanguage } from '../../../hooks/useLanguage';
import { useAuthAwareFetch } from '../../../hooks/useAuthAwareFetch';
import BASEURL from '../../../hooks/BaseUrl';
import Input from '../../ui/Input';
import FileInput from '../../ui/FileInput';
import Button from '../../ui/Button';
import LanguageSwitcher from '../../common/LanguageSwitcher';
import ThemeSelector from '../layout/ThemeSelector';
import PhoneInput from '../../ui/PhoneInput';
import Select from '../../ui/Select';
import { UpdateConfirmationModal } from '../../modal/ConfirmationModals';

import type { IWorkspace } from '../../../interfaces/Workspace';
import type { IPhone } from '../../../interfaces/shared.types';

type EditableWorkspaceFields = Pick<IWorkspace, 
  'name' | 'phone' | 'secondaryPhone' | 'email' | 'address' | 'country' | 'language'
>;

const Settings = () => {
  const { t } = useLanguage();

  // Estado del workspace actual (datos originales del backend)
  const [workspace, setWorkspace] = useState<IWorkspace | null>(null);

  // Estados del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState<IPhone | null>(null);
  const [secondaryPhone, setSecondaryPhone] = useState<IPhone | null>(null);
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState<'GT' | 'ES' | 'US' | 'MX' | 'AR'>('GT');
  const [workspaceLanguage, setWorkspaceLanguage] = useState<'es' | 'en'>('es');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Estados UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal de confirmación
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [formDataToConfirm, setFormDataToConfirm] = useState<Partial<EditableWorkspaceFields> | null>(null);

  // === FETCH WORKSPACE ACTUAL ===
  const { data: response, loading: fetchLoading, refetch } = useAuthAwareFetch<{
    success: boolean;
    workspace: IWorkspace;
  }>(`${BASEURL}/api/workspaces/current`);

  useEffect(() => {
    if (response?.success && response.workspace) {
      const ws = response.workspace;
      setWorkspace(ws);

      setName(ws.name || '');
      setEmail(ws.email || '');
      setPhone(ws.phone || { country: 'GT', number: '' });
      setSecondaryPhone(ws.secondaryPhone || null);
      setAddress(ws.address || '');
      setCountry(ws.country || 'GT');
      setWorkspaceLanguage(ws.language || 'es');
    }
  }, [response]);

  // === MANEJAR SUBMIT ===
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;

    setError('');
    setSuccess('');

    const formData: Partial<EditableWorkspaceFields> = {
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone?.number ? phone : undefined,
      secondaryPhone: secondaryPhone?.number ? secondaryPhone : undefined,
      address: address.trim() || undefined,
      country,
      language: workspaceLanguage,
    };

    // Filtrar solo los campos que realmente tienen valor
    const dataWithInfo: Partial<EditableWorkspaceFields> = {};
    (Object.keys(formData) as Array<keyof EditableWorkspaceFields>).forEach((key) => {
      const value = formData[key];
      if (value !== undefined && value !== '' && value !== null) {
        (dataWithInfo[key] as any) = value;
      }
    });

    const hasChanges = Object.keys(dataWithInfo).length > 0 || !!logoFile;

    if (!hasChanges) {
      setSuccess(t('settings:messages.noChanges') || 'No hay cambios para guardar');
      return;
    }

    setFormDataToConfirm(dataWithInfo);
    setIsUpdateModalOpen(true);
  };

  // === EJECUTAR ACTUALIZACIÓN ===
  const handleConfirmUpdate = async () => {
    if (!workspace) return;

    setLoading(true);
    setError('');
    setSuccess('');

    const formDataToSend = new FormData();

    // Campos de texto
    if (formDataToConfirm?.name) formDataToSend.append('name', formDataToConfirm.name);
    if (formDataToConfirm?.email !== undefined) {
      formDataToSend.append('email', formDataToConfirm.email || '');
    }
    if (formDataToConfirm?.address) formDataToSend.append('address', formDataToConfirm.address);

    // Teléfonos como objetos JSON (nuevo formato)
    if (formDataToConfirm?.phone) {
      formDataToSend.append('phone', JSON.stringify(formDataToConfirm.phone));
    }
    if (formDataToConfirm?.secondaryPhone) {
      formDataToSend.append('secondaryPhone', JSON.stringify(formDataToConfirm.secondaryPhone));
    }

    // Selects
    if (formDataToConfirm?.country) formDataToSend.append('country', formDataToConfirm.country);
    if (formDataToConfirm?.language) formDataToSend.append('language', formDataToConfirm.language);

    // Logo
    if (logoFile) {
      formDataToSend.append('logo', logoFile);
    }

    try {
      const res = await fetch(`${BASEURL}/api/workspaces/${workspace._id}`, {
        method: 'PATCH',
        credentials: 'include',
        body: formDataToSend,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al guardar los cambios');
      }

      const updated = await res.json();
      setWorkspace(updated);
      setLogoFile(null);
      setFormDataToConfirm(null);
      setSuccess(t('settings:messages.success') || 'Cambios guardados correctamente');
      refetch();

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
      setIsUpdateModalOpen(false);
    }
  };

  if (fetchLoading) {
    return <div className="p-8 text-center text-[rgb(var(--text-secondary))]">{t('common:loading')}</div>;
  }

  const countryOptions = [
    { value: 'GT', label: t('common:countries.GT') },
    { value: 'ES', label: t('common:countries.ES') },
    { value: 'US', label: t('common:countries.US') },
    { value: 'MX', label: t('common:countries.MX') },
    { value: 'AR', label: t('common:countries.AR') },
  ] as const;

  const languageOptions = [
    { value: 'es', label: t('common:languages.es') },
    { value: 'en', label: t('common:languages.en') },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-[rgb(var(--text-title))] mb-8">
        {t('settings:titles.settings')}
      </h1>

      {/* Preferencias */}
      <div className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl p-8 mb-12">
        <h2 className="text-xl font-semibold text-[rgb(var(--text-title))] mb-6 flex items-center gap-2">
          {t('settings:sections.preferences')}
        </h2>

        <ThemeSelector />

        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium text-[rgb(var(--text))]">{t('settings:labels.lenguage')}</div>
              <div className="text-xs text-[rgb(var(--text-secondary))]">{t('settings:labels.changeLenguage')}</div>
            </div>
            <LanguageSwitcher className="scale-110" variant="dynamic" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-2xl p-8">
        <h2 className="text-xl font-semibold text-[rgb(var(--text-title))] mb-6">
          {t('settings:sections.workspaceInfo')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Input 
            label={t('settings:labels.name')} 
            value={name} 
            onChange={setName} 
            required 
          />

          {/* Nuevo campo: Email */}
          <Input 
            type="email"
            label={t('settings:labels.email') || 'Email'} 
            value={email} 
            onChange={setEmail} 
            placeholder="clinica@ejemplo.com"
          />

          <FileInput
            value={logoFile}
            onChange={setLogoFile}
            accept="image/png,image/jpeg,image/webp"
            label={t('settings:labels.logo')}
            placeholder={t('settings:labels.changeLogo')}
          />

          {/* Teléfonos con PhoneInput */}
          <PhoneInput
            value={phone}
            onChange={setPhone}
            label={t('settings:labels.phone')}
            placeholder="Ej: 55123456"
            required={false}
          />

          <PhoneInput
            value={secondaryPhone}
            onChange={setSecondaryPhone}
            label={t('settings:labels.secondaryPhone')}
            placeholder="Ej: 22001234"
            required={false}
          />

          <div className="md:col-span-2">
            <Input
              multiline
              rows={2}
              label={t('settings:labels.address')}
              value={address}
              onChange={setAddress}
            />
          </div>

          <Select
            label={t('settings:labels.country')}
            value={country}
            options={countryOptions}
            onChange={(val) => setCountry(val as IWorkspace['country'])}
          />

          <Select
            label={t('settings:labels.workspaceLanguage')}
            value={workspaceLanguage}
            options={languageOptions}
            onChange={(val) => setWorkspaceLanguage(val as 'es' | 'en')}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-2.5"
          >
            {loading ? t('common:saving') : t('settings:buttons.save')}
          </Button>

          {success && <p className="text-sm text-green-600 font-medium">{success}</p>}
          {error && <p className="text-sm text-[rgb(var(--danger))] font-medium">{error}</p>}
        </div>
      </form>

      {/* Modal de confirmación */}
      <UpdateConfirmationModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setFormDataToConfirm(null);
        }}
        onConfirm={handleConfirmUpdate}
        changedFields={formDataToConfirm}
      />
    </div>
  );
};

export default Settings;