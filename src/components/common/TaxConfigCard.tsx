// src/components/clinic/tools/TaxConfigCard.tsx

import { useLanguage } from '../../hooks/useLanguage';
import Button from '../ui/Button';
import type { ITaxConfig } from '../../interfaces/TaxConfig';

interface Props {
  config: ITaxConfig;
  onEdit: () => void;
  onToggle: (makeActive: boolean) => void;
}

const TaxConfigCard = ({ config, onEdit, onToggle }: Props) => {
  const { t } = useLanguage();
  const isActive = config.isActive;

  const appliesToLabel =
    config.appliesTo === 'all'
      ? t('billing:taxConfig.labels.all')
      : config.appliesTo === 'service'
      ? t('billing:taxConfig.labels.services')
      : t('billing:taxConfig.labels.products');

  return (
    <div className="border border-[rgb(var(--border))] rounded-xl p-6 bg-[rgb(var(--surface))] shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">{config.taxName}</h3>
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            {config.country}
            {config.region ? ` - ${config.region}` : ''}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {isActive ? t('common:active') : t('common:inactive')}
        </span>
      </div>

      <div className="text-4xl font-bold text-[rgb(var(--primary))] mb-1">
        {config.taxRate}%
      </div>
      <div className="text-sm text-[rgb(var(--text-secondary))] mb-4">
        {t('billing:taxConfig.labels.rate')}
      </div>

      <div className="space-y-1 text-sm mb-6">
        <div>
          <span className="font-medium">{t('billing:taxConfig.labels.appliesTo')}:</span> {appliesToLabel}
        </div>
        {config.isDefault && (
          <div className="text-amber-600 font-medium">★ {t('billing:taxConfig.labels.default')}</div>
        )}
        {config.effectiveFrom && (
          <div>
            {t('billing:taxConfig.labels.from')}: {new Date(config.effectiveFrom).toLocaleDateString()}
          </div>
        )}
        {config.effectiveTo && (
          <div>
            {t('billing:taxConfig.labels.until')}: {new Date(config.effectiveTo).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" size="sm" onClick={onEdit} className="flex-1">
          {t('common:edit')}
        </Button>
        <Button
          variant={isActive ? 'danger' : 'primary'}
          size="sm"
          onClick={() => onToggle(!isActive)}
          className="flex-1"
        >
          {isActive ? t('common:deactivate') : t('common:activate')}
        </Button>
      </div>
    </div>
  );
};

export default TaxConfigCard;