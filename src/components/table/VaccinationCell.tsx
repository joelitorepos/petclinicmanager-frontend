// src/components/table/VaccinationsCell.tsx

import { useState, useEffect } from 'react';
import Modal from './ModalForCell';
import { useLanguage } from '../../hooks/useLanguage';
import { type Vaccination } from '../../interfaces/ClinicalRecord';

interface VaccinationsCellProps {
  id: string;
  value: string; // JSON stringificado de Vaccination[]
  fieldName: string;
  fieldNameTranslated: string;
  onDataChange: (id: string, fieldName: string, newValue: string) => void;
  className?: string;
  editable?: boolean;
}

const toDateString = (val: unknown): string => {
  if (!val) return '';
  try {
    return new Date(val as string).toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const parseVaccinations = (raw: string): Vaccination[] => {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const VaccinationCell = ({
  id,
  value,
  fieldName,
  fieldNameTranslated,
  onDataChange,
  className = '',
  editable = true,
}: VaccinationsCellProps) => {
  const { t } = useLanguage();

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editItems, setEditItems] = useState<Vaccination[]>([]);

  const items = parseVaccinations(value);

  useEffect(() => {
    setEditItems(parseVaccinations(value));
  }, [value]);

  const handleClick = () => {
    if (items.length > 0) setIsViewerOpen(true);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editable) return;
    setEditItems(parseVaccinations(value));
    setIsEditorOpen(true);
  };

  const addItem = () => {
    setEditItems([...editItems, { vaccine: '', date: new Date(), nextDue: undefined }]);
  };

  const removeItem = (idx: number) => {
    setEditItems(editItems.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof Vaccination, val: string | Date) => {
    const updated = [...editItems];
    updated[idx] = { ...updated[idx], [field]: val };
    setEditItems(updated);
  };

  const handleSave = () => {
    const filtered = editItems.filter(v => v.vaccine.trim() !== '');
    onDataChange(id, fieldName, JSON.stringify(filtered));
    setIsEditorOpen(false);
  };

  const handleCancel = () => {
    setEditItems(parseVaccinations(value));
    setIsEditorOpen(false);
  };

  const cellContent = items.length > 0
    ? `${items.length} ${t('clinicalRecords:labels.vaccinations')}`
    : null;

  return (
    <div
      className={`flex-1 min-w-0 p-3 border border-transparent transition-colors cursor-pointer
                 bg-[rgb(var(--surface))] overflow-hidden ${className}
                 ${editable
                   ? 'hover:border-[rgb(var(--text-secondary))]'
                   : 'hover:border-[rgb(var(--text))]'}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title="Click para ver · Doble click para editar"
    >
      {cellContent ? (
        <span className="text-[rgb(var(--text))] font-medium truncate">{cellContent}</span>
      ) : (
        <span className="text-[rgb(var(--text-secondary))] italic">
          {t('ui:placeholders.edit')} ({fieldNameTranslated})
        </span>
      )}

      {/* ── Modal de vista ───────────────────────────────────────────────── */}
      <Modal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        title={fieldNameTranslated}
      >
        <div className="p-6 max-w-2xl max-h-[80vh] overflow-auto space-y-3">
          {items.map((vac, idx) => (
            <div
              key={idx}
              className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg p-4 space-y-1"
            >
              <p className="font-semibold text-[rgb(var(--text))]">{vac.vaccine}</p>
              <p className="text-sm text-[rgb(var(--text-secondary))]">
                <span className="font-medium">{t('clinicalRecords:placeholders.vaccinations.dateApplied')}:</span>{' '}
                {toDateString(vac.date) || '—'}
              </p>
              {vac.nextDue && (
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  <span className="font-medium">{t('clinicalRecords:placeholders.vaccinations.nextDue')}:</span>{' '}
                  {toDateString(vac.nextDue)}
                </p>
              )}
            </div>
          ))}
        </div>
      </Modal>

      {/* ── Modal de edición ─────────────────────────────────────────────── */}
      <Modal
        isOpen={isEditorOpen}
        onClose={handleCancel}
        title={`${t('ui:modals.titleEdit')} ${fieldNameTranslated}`}
      >
        <div className="p-6 space-y-4 min-h-[400px] max-h-[80vh] overflow-auto">
          {editItems.map((vac, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row gap-2 items-start p-2 bg-[rgb(var(--background-secondary))] rounded"
            >
              {/* Vacuna */}
              <div className="w-full md:w-4/12">
                <input
                  value={vac.vaccine}
                  onChange={(e) => updateItem(idx, 'vaccine', e.target.value)}
                  placeholder={t('clinicalRecords:placeholders.vaccinations.vaccine')}
                  className="w-full px-3 py-2 rounded-lg border border-[rgb(var(--border))]
                             bg-[rgb(var(--surface))] text-[rgb(var(--text))]
                             focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]"
                />
              </div>
              {/* Fecha aplicación */}
              <div className="w-full md:w-3/12 flex flex-col gap-1">
                <label className="text-xs text-[rgb(var(--text-secondary))]">
                  {t('clinicalRecords:placeholders.vaccinations.dateApplied')}
                </label>
                <input
                  type="date"
                  value={toDateString(vac.date)}
                  onChange={(e) => updateItem(idx, 'date', e.target.value ? new Date(e.target.value) : new Date())}
                  className="w-full px-3 py-2 rounded-lg border border-[rgb(var(--border))]
                             bg-[rgb(var(--surface))] text-[rgb(var(--text))]
                             focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]"
                />
              </div>
              {/* Próxima dosis */}
              <div className="w-full md:w-4/12 flex flex-col gap-1">
                <label className="text-xs text-[rgb(var(--text-secondary))]">
                  {t('clinicalRecords:placeholders.vaccinations.nextDue')}
                </label>
                <input
                  type="date"
                  value={toDateString(vac.nextDue)}
                  onChange={(e) => updateItem(idx, 'nextDue', e.target.value ? new Date(e.target.value) : new Date())}
                  className="w-full px-3 py-2 rounded-lg border border-[rgb(var(--border))]
                             bg-[rgb(var(--surface))] text-[rgb(var(--text))]
                             focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]"
                />
              </div>
              <div className="w-full md:w-1/12 flex justify-end">
                <button
                  onClick={() => removeItem(idx)}
                  className="px-3 py-2 bg-[rgb(var(--danger))] text-white rounded-lg
                             hover:opacity-80 transition-colors text-sm font-medium"
                >
                  X
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addItem}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-[rgb(var(--border))]
                       text-[rgb(var(--text))] bg-[rgb(var(--surface-hover))] hover:opacity-80 transition-colors"
          >
            + {t('clinicalRecords:buttons.add')}
          </button>

          <div className="flex justify-end gap-3 pt-4 border-t border-[rgb(var(--border))]">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium rounded-lg
                         text-[rgb(var(--text))] bg-[rgb(var(--surface-hover))] hover:opacity-80 transition-colors"
            >
              {t('ui:buttons.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium rounded-lg shadow-md
                         bg-[rgb(var(--primary))] text-white hover:bg-[rgb(var(--primary-hover))] transition-colors"
            >
              {t('ui:buttons.save')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VaccinationCell;