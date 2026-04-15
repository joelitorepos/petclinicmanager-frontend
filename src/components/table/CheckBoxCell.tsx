// src/components/table/CheckboxCell.tsx

import { useState, useEffect } from 'react';
import Modal from './ModalForCell';
import Checkbox from '../ui/Checkbox';
import { useLanguage } from '../../hooks/useLanguage';

interface CheckboxCellProps {
  id: string;
  value: string; // Viene como string porque onDataChange espera string
  fieldName: string;
  namespace: string;
  onDataChange: (id: string, fieldName: string, newValue: string) => void;
  className?: string;
  editable?: boolean;
}

const CheckboxCell = ({
  id,
  value,
  fieldName,
  namespace,
  onDataChange,
  className = '',
  editable = true,
}: CheckboxCellProps) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value === 'true');

  const { t } = useLanguage();

  useEffect(() => {
    setTempValue(value === 'true');
  }, [value]);

  const currentBoolean = value === 'true';

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editable) return;
    setTempValue(currentBoolean);
    setIsEditorOpen(true);
  };

  const handleSave = () => {
    const newStringValue = tempValue.toString(); // "true" o "false"
    if (newStringValue !== value) {
      onDataChange(id, fieldName, newStringValue);
    }
    setIsEditorOpen(false);
  };

  const handleCancel = () => {
    setTempValue(currentBoolean);
    setIsEditorOpen(false);
  };

  return (
    <div
      className={`flex-1 p-3 flex items-center justify-center cursor-pointer 
                 border border-transparent transition-colors bg-[rgb(var(--surface))] ${className}
                 ${editable
                 ? 'hover:border-[rgb(var(--text-secondary))]'
                 : 'hover:border-[rgb(var(--text))]'}`}
      onDoubleClick={handleDoubleClick}
      title="Doble click para editar"
    >
      {/* Vista normal */}
      <span className={`text-2xl font-bold ${currentBoolean ? 'text-green-600' : 'text-red-600'}`}>
        {currentBoolean ? '✓' : '✗'}
      </span>

      {/* Modal de edición */}
      <Modal
        isOpen={isEditorOpen}
        onClose={handleCancel}
        title={`${t('ui:modals.titleEdit') || 'Editar'} ${t(`${namespace}:labels.${fieldName}`) || fieldName}`}
      >
        <div className="p-8 space-y-8 flex flex-col items-center">
          <Checkbox
            label={t(`${namespace}:labels.${fieldName}`) || fieldName}
            checked={tempValue}
            onChange={setTempValue}
          />

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handleCancel}
              className="px-6 py-2 text-[rgb(var(--text))] bg-[rgb(var(--surface-hover))] rounded-lg hover:opacity-80 transition-colors"
            >
              {t('ui:buttons.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] transition-colors shadow-md"
            >
              {t('ui:buttons.save')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CheckboxCell;