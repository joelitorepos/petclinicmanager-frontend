// src/components/table/TreatmentsCell.tsx

import { useState, useEffect } from 'react';
import Modal from './ModalForCell';
import { useLanguage } from '../../hooks/useLanguage';
import { type Treatment } from '../../interfaces/ClinicalRecord';

interface TreatmentsCellProps {
  id: string;
  value: string; // JSON stringificado de Treatment[]
  fieldName: string;
  fieldNameTranslated: string;
  onDataChange: (id: string, fieldName: string, newValue: string) => void;
  className?: string;
  editable?: boolean;
}

const parseTreatments = (raw: string): Treatment[] => {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const TreatmentsCell = ({
  id,
  value,
  fieldName,
  fieldNameTranslated,
  onDataChange,
  className = '',
  editable = true,
}: TreatmentsCellProps) => {
  const { t } = useLanguage();

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editItems, setEditItems] = useState<Treatment[]>([]);

  const items = parseTreatments(value);

  useEffect(() => {
    setEditItems(parseTreatments(value));
  }, [value]);

  const handleClick = () => {
    if (items.length > 0) setIsViewerOpen(true);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editable) return;
    setEditItems(parseTreatments(value));
    setIsEditorOpen(true);
  };

  const addItem = () => {
    setEditItems([...editItems, { name: '', dose: '', duration: '' }]);
  };

  const removeItem = (idx: number) => {
    setEditItems(editItems.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof Treatment, val: string) => {
    const updated = [...editItems];
    updated[idx] = { ...updated[idx], [field]: val };
    setEditItems(updated);
  };

  const handleSave = () => {
    const filtered = editItems.filter(t => t.name.trim() !== '');
    onDataChange(id, fieldName, JSON.stringify(filtered));
    setIsEditorOpen(false);
  };

  const handleCancel = () => {
    setEditItems(parseTreatments(value));
    setIsEditorOpen(false);
  };

  const cellContent = items.length > 0
    ? `${items.length} ${t('clinicalRecords:labels.treatments')}`
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
          {items.map((item, idx) => (
            <div
              key={idx}
              className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg p-4 space-y-1"
            >
              <p className="font-semibold text-[rgb(var(--text))]">{item.name}</p>
              {item.dose && (
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  <span className="font-medium">{t('clinicalRecords:placeholders.treatments.dose')}:</span> {item.dose}
                </p>
              )}
              {item.duration && (
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  <span className="font-medium">{t('clinicalRecords:placeholders.treatments.duration')}:</span> {item.duration}
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
          {editItems.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row gap-2 items-start p-2 bg-[rgb(var(--background-secondary))] rounded"
            >
              {/* Nombre */}
              <div className="w-full md:w-4/12">
                <input
                  value={item.name}
                  onChange={(e) => updateItem(idx, 'name', e.target.value)}
                  placeholder={t('clinicalRecords:placeholders.treatments.name')}
                  className="w-full px-3 py-2 rounded-lg border border-[rgb(var(--border))]
                             bg-[rgb(var(--surface))] text-[rgb(var(--text))]
                             focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]"
                />
              </div>
              {/* Dosis */}
              <div className="w-full md:w-3/12">
                <input
                  value={item.dose || ''}
                  onChange={(e) => updateItem(idx, 'dose', e.target.value)}
                  placeholder={t('clinicalRecords:placeholders.treatments.dose')}
                  className="w-full px-3 py-2 rounded-lg border border-[rgb(var(--border))]
                             bg-[rgb(var(--surface))] text-[rgb(var(--text))]
                             focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]"
                />
              </div>
              {/* Duración */}
              <div className="w-full md:w-4/12">
                <input
                  value={item.duration || ''}
                  onChange={(e) => updateItem(idx, 'duration', e.target.value)}
                  placeholder={t('clinicalRecords:placeholders.treatments.duration')}
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

export default TreatmentsCell;