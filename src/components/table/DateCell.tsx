// src/components/table/DateCell.tsx

import { useState, useEffect } from 'react';
import Modal from './ModalForCell';
import DateInput from '../ui/DateInput';
import { useLanguage } from '../../hooks/useLanguage';

interface DateCellProps {
  id: string;
  value: string; // Puede ser "YYYY-MM-DD", "YYYY-MM-DDTHH:mm" o ISO completo "2026-03-10T15:00:00.000Z"
  fieldName: string;
  fieldNameTranslated: string;
  onDataChange: (id: string, fieldName: string, newValue: string) => void;
  className?: string;
  max?: string;
  min?: string;
  inputType?: 'date' | 'datetime-local' | 'time';
  editable?: boolean;
}

/**
 * Convierte cualquier valor de fecha/hora a un string compatible con el input HTML:
 * - Para 'date':           "YYYY-MM-DD"
 * - Para 'datetime-local': "YYYY-MM-DDTHH:mm"
 * - Para 'time':           "HH:mm"
 *
 * Acepta ISO strings completos (ej: "2026-03-10T15:00:00.000Z"),
 * strings parciales ("YYYY-MM-DD" o "YYYY-MM-DDTHH:mm") y strings vacíos.
 */
const toInputValue = (raw: string, inputType: 'date' | 'datetime-local' | 'time'): string => {
  if (!raw) return '';

  // Si es un ISO completo con Z o timezone offset, parsearlo como fecha UTC
  const date = new Date(raw);
  if (isNaN(date.getTime())) return raw; // Si no parsea, devolver tal cual

  if (inputType === 'date') {
    // Usar valores UTC para evitar problemas de zona horaria
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  if (inputType === 'datetime-local') {
    // Convertir a hora local del cliente para que el input muestre la hora correcta
    const y = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${mo}-${d}T${h}:${min}`;
  }

  if (inputType === 'time') {
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${min}`;
  }

  return raw;
};

/**
 * Formatea el valor para mostrar en la celda y en el modal de vista.
 * - 'date':           "DD / MM / YYYY"
 * - 'datetime-local': "DD/MM/YYYY, hh:mm a.m./p.m."
 * - 'time':           "hh:mm a.m./p.m."
 */
const toDisplayValue = (raw: string, inputType: 'date' | 'datetime-local' | 'time'): string => {
  if (!raw) return '';

  const date = new Date(raw);
  if (isNaN(date.getTime())) return raw;

  if (inputType === 'date') {
    // Usar UTC para fechas puras (sin tiempo)
    const d = String(date.getUTCDate()).padStart(2, '0');
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const y = date.getUTCFullYear();
    return `${d} / ${m} / ${y}`;
  }

  if (inputType === 'datetime-local') {
    // Usar hora local del cliente
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    const hours24 = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours24 >= 12 ? 'p.m.' : 'a.m.';
    const hours12 = hours24 % 12 || 12;
    return `${d}/${m}/${y}, ${hours12}:${minutes} ${ampm}`;
  }

  if (inputType === 'time') {
    // Para valores tipo "HH:mm" el constructor de Date no sirve directo
    // Los parseamos manualmente
    const parts = raw.split(':');
    if (parts.length >= 2) {
      const hours24 = parseInt(parts[0], 10);
      const minutes = parts[1].padStart(2, '0');
      const ampm = hours24 >= 12 ? 'p.m.' : 'a.m.';
      const hours12 = hours24 % 12 || 12;
      return `${hours12}:${minutes} ${ampm}`;
    }
    return raw;
  }

  return raw;
};

const DateCell = ({
  id,
  value,
  fieldName,
  fieldNameTranslated,
  onDataChange,
  className = '',
  max,
  min,
  inputType = 'date',
  editable = true,
}: DateCellProps) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [tempValue, setTempValue] = useState('');

  const { t } = useLanguage();

  // tempValue siempre en formato compatible con el input HTML
  useEffect(() => {
    setTempValue(toInputValue(value, inputType));
  }, [value, inputType]);

  const hasValue = !!value;
  const formattedDisplay = toDisplayValue(value, inputType);

  const handleClick = () => {
    if (hasValue) setIsViewerOpen(true);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editable) return;
    setTempValue(toInputValue(value, inputType));
    setIsEditorOpen(true);
  };

  const handleSave = () => {
    // tempValue está en formato "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm"
    // Lo enviamos tal cual; el backend o la lógica superior puede convertirlo a ISO si lo necesita
    if (tempValue !== toInputValue(value, inputType)) {
      onDataChange(id, fieldName, tempValue);
    }
    setIsEditorOpen(false);
  };

  const handleCancel = () => {
    setTempValue(toInputValue(value, inputType));
    setIsEditorOpen(false);
  };

  return (
    <div
      className={`flex-1 min-w-0 p-3 border border-transparent cursor-pointer
                 overflow-hidden transition-colors bg-[rgb(var(--surface))] ${className} 
                 ${editable
                   ? 'hover:border-[rgb(var(--text-secondary))]'
                   : 'hover:border-[rgb(var(--text))]'}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title="Click para ver · Doble click para editar"
    >
      {hasValue ? (
        <span className="text-[rgb(var(--text))] font-medium">
          {formattedDisplay}
        </span>
      ) : (
        <span className="text-[rgb(var(--text-secondary))] italic">
          {t('ui:placeholders.noDate') || 'Sin fecha'}
        </span>
      )}

      {/* Modal de vista */}
      <Modal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        title={fieldNameTranslated}
      >
        <div className="p-8 text-center">
          <p className="text-4xl font-bold text-[rgb(var(--text))] mb-4">
            {formattedDisplay || t('ui:messages.noDateSet') || 'No se ha establecido fecha'}
          </p>
          {hasValue && (
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              ({value})
            </p>
          )}
        </div>
      </Modal>

      {/* Modal de edición */}
      <Modal
        isOpen={isEditorOpen}
        onClose={handleCancel}
        title={`${t('ui:modals.titleEdit') || 'Editar'} ${fieldNameTranslated}`}
      >
        <div className="p-6 min-w-[360px]">
          <DateInput
            label={fieldNameTranslated}
            value={tempValue}
            onChange={setTempValue}
            max={max || (inputType === 'date' ? new Date().toISOString().split('T')[0] : undefined)}
            min={min}
            type={inputType}
            className="mb-6"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[rgb(var(--border))]">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-[rgb(var(--text))] bg-[rgb(var(--surface-hover))] 
                         rounded-lg hover:opacity-80 transition-colors text-sm font-medium"
            >
              {t('ui:buttons.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-lg 
                         hover:bg-[rgb(var(--primary-hover))] transition-colors text-sm font-medium shadow-md"
            >
              {t('ui:buttons.save')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DateCell;