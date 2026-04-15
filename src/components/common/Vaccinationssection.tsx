// src/components/coomon/VaccinationsSection.tsx

import Input from '../ui/Input';
import DateInput from '../ui/DateInput';
import Button from '../ui/Button';
import { type Vaccination } from '../../interfaces/ClinicalRecord';
import { useLanguage } from '../../hooks/useLanguage';

interface VaccinationsSectionProps {
  vaccinations: Vaccination[];
  onChange: (vaccinations: Vaccination[]) => void;
}

const VaccinationsSection = ({ vaccinations, onChange }: VaccinationsSectionProps) => {
  const { t } = useLanguage();

  const add = () => {
    onChange([...vaccinations, { vaccine: '', date: new Date(), nextDue: undefined }]);
  };

  const remove = (index: number) => {
    onChange(vaccinations.filter((_, i) => i !== index));
  };

  const update = (index: number, field: keyof Vaccination, value: string | Date) => {
    const updated = [...vaccinations];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="border border-[rgb(var(--border))] rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-[rgb(var(--text))]">
          {t('clinicalRecords:labels.vaccinations')}
        </h3>
        <Button onClick={add} variant="secondary" type="button" className="text-sm">
          {t('clinicalRecords:buttons.add')}
        </Button>
      </div>

      {vaccinations.map((vac, idx) => (
        <div
          key={idx}
          className="flex flex-col md:flex-row gap-2 items-start mb-3 p-2 bg-[rgb(var(--background-secondary))] rounded"
        >
          <div className="w-full md:w-4/12">
            <Input
              value={vac.vaccine}
              onChange={(val) => update(idx, 'vaccine', val)}
              placeholder={t('clinicalRecords:placeholders.vaccinations.vaccine')}
            />
          </div>
          <div className="w-full md:w-3/12">
            <DateInput
              value={
                vac.date instanceof Date
                  ? vac.date.toISOString().split('T')[0]
                  : vac.date
              }
              onChange={(val) => update(idx, 'date', val ? new Date(val) : new Date())}
              label={t('clinicalRecords:placeholders.vaccinations.dateApplied')}
            />
          </div>
          <div className="w-full md:w-4/12">
            <DateInput
              value={
                vac.nextDue instanceof Date
                  ? vac.nextDue.toISOString().split('T')[0]
                  : (vac.nextDue || '')
              }
              onChange={(val) => update(idx, 'nextDue', val ? new Date(val) : new Date())}
              label={t('clinicalRecords:placeholders.vaccinations.nextDue')}
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

export default VaccinationsSection;