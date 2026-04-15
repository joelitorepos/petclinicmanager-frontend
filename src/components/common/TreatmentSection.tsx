// src/components/coomon/TreatmentsSection.tsx

import Input from '../ui/Input';
import Button from '../ui/Button';
import { type Treatment } from '../../interfaces/ClinicalRecord';
import { useLanguage } from '../../hooks/useLanguage';

interface TreatmentsSectionProps {
  treatments: Treatment[];
  onChange: (treatments: Treatment[]) => void;
}

const TreatmentsSection = ({ treatments, onChange }: TreatmentsSectionProps) => {
  const { t } = useLanguage();

  const add = () => {
    onChange([...treatments, { name: '', dose: '', duration: '' }]);
  };

  const remove = (index: number) => {
    onChange(treatments.filter((_, i) => i !== index));
  };

  const update = (index: number, field: keyof Treatment, value: string) => {
    const updated = [...treatments];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="border border-[rgb(var(--border))] rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-[rgb(var(--text))]">
          {t('clinicalRecords:labels.treatments')}
        </h3>
        <Button onClick={add} variant="secondary" type="button" className="text-sm">
          {t('clinicalRecords:buttons.add')}
        </Button>
      </div>

      {treatments.map((item, idx) => (
        <div
          key={idx}
          className="flex flex-col md:flex-row gap-2 items-start mb-3 p-2 bg-[rgb(var(--background-secondary))] rounded"
        >
          <div className="w-full md:w-4/12">
            <Input
              value={item.name}
              onChange={(val) => update(idx, 'name', val)}
              placeholder={t('clinicalRecords:placeholders.treatments.name')}
            />
          </div>
          <div className="w-full md:w-3/12">
            <Input
              value={item.dose || ''}
              onChange={(val) => update(idx, 'dose', val)}
              placeholder={t('clinicalRecords:placeholders.treatments.dose')}
            />
          </div>
          <div className="w-full md:w-4/12">
            <Input
              value={item.duration || ''}
              onChange={(val) => update(idx, 'duration', val)}
              placeholder={t('clinicalRecords:placeholders.treatments.duration')}
            />
          </div>
          <div className="w-full md:w-1/12 flex justify-end">
            <Button onClick={() => remove(idx)} variant="danger" type="button">
              X
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TreatmentsSection;