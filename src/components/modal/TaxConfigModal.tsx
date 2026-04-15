// src/components/clinic/common/TaxConfigModal.tsx

import { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import BASEURL from '../../hooks/BaseUrl';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import DateInput from '../ui/DateInput';
import type { ITaxConfig, TaxAppliesTo } from '../../interfaces/TaxConfig';
import useFetch from '../../hooks/useFetch';
import type { CurrentWorkspaceResponse } from '../../interfaces/Workspace';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingConfig: ITaxConfig | null;
  onSuccess: () => void;
}

const TaxConfigModal = ({ isOpen, onClose, editingConfig, onSuccess }: Props) => {
  const { t } = useLanguage();

  const [country, setCountry] = useState('GT');
  const [region, setRegion] = useState('');
  const [taxName, setTaxName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [taxRate, setTaxRate] = useState<number>(12);
  const [appliesTo, setAppliesTo] = useState<'all' | 'service' | 'product'>('all');
  const [isDefault, setIsDefault] = useState(false);
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingConfig) {
      setCountry(editingConfig.country);
      setRegion(editingConfig.region || '');
      setTaxName(editingConfig.taxName);
      setTaxCode(editingConfig.taxCode || '');
      setTaxRate(editingConfig.taxRate);
      setAppliesTo(editingConfig.appliesTo);
      setIsDefault(editingConfig.isDefault || false);
      setEffectiveFrom(editingConfig.effectiveFrom ? new Date(editingConfig.effectiveFrom).toISOString().split('T')[0] : '');
      setEffectiveTo(editingConfig.effectiveTo ? new Date(editingConfig.effectiveTo).toISOString().split('T')[0] : '');
    } else {
      // valores por defecto al crear
      setCountry('GT');
      setRegion('');
      setTaxName('');
      setTaxCode('');
      setTaxRate(12);
      setAppliesTo('all');
      setIsDefault(false);
      setEffectiveFrom('');
      setEffectiveTo('');
    }
    setError(null);
  }, [editingConfig]);

  const { data: currentWorkspaceData } = useFetch<CurrentWorkspaceResponse>(`${BASEURL}/api/workspaces/current`);
  const workspaceId = currentWorkspaceData?.workspace?._id;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const payload = {
      country,
      region: region.trim() || undefined,
      taxName: taxName.trim(),
      taxCode: taxCode.trim() || undefined,
      taxRate: Number(taxRate),
      appliesTo,
      isDefault,
      effectiveFrom: effectiveFrom || undefined,
      effectiveTo: effectiveTo || undefined,
    };

    try {
      const url = editingConfig
        ? `${BASEURL}/api/workspaces/${workspaceId}/tax-configs/${editingConfig._id}`
        : `${BASEURL}/api/workspaces/${workspaceId}/tax-configs`;

      const method = editingConfig ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t('billing:taxConfig.modal.errorSave'));
      }

      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('billing:taxConfig.modal.errorUnexpected'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[rgb(var(--surface))] rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">
          {editingConfig ? t('billing:taxConfig.modal.editTitle') : t('billing:taxConfig.modal.createTitle')}
        </h2>

        <div className="space-y-4">
          <Select
            label={t('billing:taxConfig.labels.country')}
            value={country}
            onChange={setCountry}
            options={[
              { value: 'GT', label: t('common:countries.GT') },
              { value: 'ES', label: t('common:countries.ES') },
              { value: 'US', label: t('common:countries.US') },
              { value: 'MX', label: t('common:countries.MX') },
              { value: 'AR', label: t('common:countries.AR') },
            ]}
            required
          />

          <Input
            label={t('billing:taxConfig.labels.region')}
            value={region}
            onChange={setRegion}
            placeholder={t('billing:taxConfig.labels.regionPlaceholder')}
          />

          <Input
            label={t('billing:taxConfig.labels.taxName')}
            value={taxName}
            onChange={setTaxName}
            required
          />

          <Input
            label={t('billing:taxConfig.labels.taxCode')}
            value={taxCode}
            onChange={setTaxCode}
          />

          <Input
            type="number"
            label={t('billing:taxConfig.labels.taxRate')}
            value={String(taxRate)}
            onChange={(v) => setTaxRate(v === '' ? 0 : Number(v))}
            validationRegex={/^100(\.0{1,2})?|[0-9]{1,2}(\.[0-9]{1,2})?$/}
            errorMessage={t('billing:taxConfig.labels.taxRateError')}
            required
          />

          <Select
            label={t('billing:taxConfig.labels.appliesTo')}
            value={appliesTo}
            onChange={(v) => setAppliesTo(v as TaxAppliesTo)}
            options={[
              { value: 'all', label: t('billing:taxConfig.labels.all') },
              { value: 'service', label: t('billing:taxConfig.labels.services') },
              { value: 'product', label: t('billing:taxConfig.labels.products') },
            ]}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <label htmlFor="isDefault" className="text-sm">
              {t('billing:taxConfig.labels.default')}
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DateInput
              label={t('billing:taxConfig.labels.from')}
              value={effectiveFrom}
              onChange={setEffectiveFrom}
            />
            <DateInput
              label={t('billing:taxConfig.labels.until')}
              value={effectiveTo}
              onChange={setEffectiveTo}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              {t('common:cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={loading} loading={loading}>
              {editingConfig ? t('common:save') : t('common:create')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxConfigModal;