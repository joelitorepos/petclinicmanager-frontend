// src/components/coomon/DiagnosticsSection.tsx

import Input from '../ui/Input';
import Button from '../ui/Button';
import { type Diagnostic } from '../../interfaces/ClinicalRecord';
import { useLanguage } from '../../hooks/useLanguage';

interface DiagnosticsSectionProps {
  diagnostics: Diagnostic[];
  onChange: (diagnostics: Diagnostic[]) => void;
}

const DiagnosticsSection = ({ diagnostics, onChange }: DiagnosticsSectionProps) => {
  const { t } = useLanguage();

  const add = () => {
    onChange([...diagnostics, { diagnosis: '', notes: '' }]);
  };

  const remove = (index: number) => {
    onChange(diagnostics.filter((_, i) => i !== index));
  };

  const update = (index: number, field: keyof Diagnostic, value: string) => {
    const updated = [...diagnostics];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="border border-[rgb(var(--border))] rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-[rgb(var(--text))]">
          {t('clinicalRecords:labels.diagnostics')}
        </h3>
        <Button onClick={add} variant="secondary" type="button" className="text-sm">
          {t('clinicalRecords:buttons.add')}
        </Button>
      </div>

      {diagnostics.map((diag, idx) => (
        <div
          key={idx}
          className="flex flex-col md:flex-row gap-2 items-start mb-3 p-2 bg-[rgb(var(--background-secondary))] rounded"
        >
          <div className="w-full md:w-5/12">
            <Input
              value={diag.diagnosis}
              onChange={(val) => update(idx, 'diagnosis', val)}
              placeholder={t('clinicalRecords:placeholders.diagnostics.diagnosis')}
              required={idx === 0}
            />
          </div>
          <div className="w-full md:w-6/12">
            <Input
              value={diag.notes || ''}
              onChange={(val) => update(idx, 'notes', val)}
              placeholder={t('clinicalRecords:placeholders.diagnostics.notes')}
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

export default DiagnosticsSection;