// src/components/table/SelectCell.tsx

import { useState, useEffect } from 'react';
import Modal from './ModalForCell';
import { useLanguage } from '../../hooks/useLanguage';
import SelectWithSearch from '../ui/SelectWithSearch';

interface SelectOption<T extends Record<string, unknown>> {
  id: string;
  label: string;
  subLabel?: string;
  data?: T;
  /**
   * Marca la opción como inactiva (registro soft-deleted o con rol cambiado).
   * La celda la muestra normalmente, pero NO aparece en el selector al editar.
   */
  inactive?: boolean;
}

interface SelectCellProps<T extends Record<string, unknown>> {
  id: string;
  value: string;
  fieldName: string;
  namespace: string;
  options: SelectOption<T>[];
  placeholder?: string;
  onDataChange: (id: string, fieldName: string, newValue: string) => void;
  className?: string;
  displayKeys?: (keyof T)[];
  editable?: boolean;
  deletedLabel?: string;
}

const SelectCell = <T extends Record<string, unknown>>({
  id,
  value,
  fieldName,
  namespace,
  options,
  placeholder,
  onDataChange,
  className = '',
  displayKeys,
  editable = true,
}: SelectCellProps<T>) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [tempSelectedId, setTempSelectedId] = useState(value);

  const { t } = useLanguage();

  useEffect(() => {
    setTempSelectedId(value);
  }, [value]);

  const currentOption = options.find(option => option.id === value);

  // Opción inactiva: existe en el array (tenemos el nombre) pero está marcada como inactive.
  // Se muestra normalmente en la celda pero no aparece en el selector al editar.
  const isInactive = currentOption?.inactive === true;

  // Opciones disponibles en el selector del editor: solo las activas.
  const editableOptions = options.filter(o => !o.inactive);

  const handleClick = () => {
    // Siempre permitimos ver los detalles si la opción existe, activa o inactiva
    if (currentOption) {
      setIsViewerOpen(true);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editable) return;
    setTempSelectedId(value);
    setIsEditorOpen(true);
  };

  const handleSave = () => {
    if (tempSelectedId !== value) {
      onDataChange(id, fieldName, tempSelectedId);
    }
    setIsEditorOpen(false);
  };

  const handleCancel = () => {
    setTempSelectedId(value);
    setIsEditorOpen(false);
  };

  const renderDataDetails = () => {
    if (!currentOption) {
      return <p>{t('ui:messages.noDataSelected') ?? 'No hay datos seleccionados'}</p>;
    }

    if (currentOption.data && displayKeys && displayKeys.length > 0) {
      return (
        <div className="space-y-2 text-[rgb(var(--text))] bg-[rgb(var(--surface))] p-4 rounded-lg">
          <h3 className="text-xl font-bold mb-4">{currentOption.label}</h3>
          {displayKeys.map((key) => {
            const val = currentOption.data![key];

            let displayValue: string;
            if (
              val !== null &&
              val !== undefined &&
              typeof val === 'object' &&
              'country' in (val as object) &&
              'number' in (val as object)
            ) {
              const phone = val as unknown as { country: string; number: string };
              displayValue = `${t(`common:countries.${phone.country}`) ?? phone.country} ${phone.number}`;
            } else {
              displayValue = String(val ?? '-');
            }

            return (
              <p
                key={String(key)}
                className="flex justify-between border-b border-[rgb(var(--border-light))] py-2"
              >
                <strong className="text-[rgb(var(--text-secondary))] capitalize">
                  {t(`${namespace}:labels.${String(key)}`) || String(key)}:
                </strong>
                <span>{displayValue}</span>
              </p>
            );
          })}
        </div>
      );
    }

    return (
      <div className="text-center py-8">
        <h3 className="text-3xl font-bold text-[rgb(var(--text))] mb-4">
          {currentOption.label}
        </h3>
        {currentOption.subLabel && (
          <p className="text-lg text-[rgb(var(--text-secondary))] mb-6">
            {currentOption.subLabel}
          </p>
        )}
        <p className="text-sm text-[rgb(var(--text-secondary))] italic">
          {t('ui:messages.noAdditionalData') ?? 'No hay información adicional disponible'}
        </p>
      </div>
    );
  };

  return (
    <div
      className={`flex-1 min-w-0 p-3 border border-transparent transition-colors cursor-pointer
                 bg-[rgb(var(--surface))] overflow-hidden ${className}
                 ${editable
                   ? 'hover:border-[rgb(var(--text-secondary))]'
                   : 'hover:border-[rgb(var(--text))]'}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title="Click to view details · Double-click to edit"
    >
      {/* Vista en la celda */}
      {currentOption ? (
        <div className="flex min-w-0 flex-col justify-center h-full">
          <span className="text-[rgb(var(--text))] font-medium truncate leading-tight">
            {currentOption.label}
          </span>
          {currentOption.subLabel && (
            <span className="text-xs text-[rgb(var(--text-secondary))] truncate">
              {currentOption.subLabel}
            </span>
          )}
        </div>
      ) : (
        <span className="text-[rgb(var(--text-secondary))] italic flex items-center h-full">
          {placeholder ?? t('ui:placeholders.selectOption')}
        </span>
      )}

      {/* Modal de vista (detalles) */}
      <Modal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        title={t(`${namespace}:labels.details`) ?? 'Detalles'}
      >
        <div className="p-6 max-w-2xl max-h-[80vh] overflow-auto">
          {renderDataDetails()}
        </div>
      </Modal>

      {/* Modal de edición — el selector solo muestra opciones activas */}
      <Modal
        isOpen={isEditorOpen}
        onClose={handleCancel}
        title={`${t('ui:modals.titleEdit') ?? 'Edit'} ${t(`${namespace}:labels.${fieldName}`) || fieldName}`}
      >
        <div className="p-6 space-y-6 min-h-[400px]">
          <p className="text-sm text-[rgb(var(--text-secondary))] mb-2">
            {t('ui:messages.searchAndSelect') ?? 'Search and select a new record:'}
          </p>

          <SelectWithSearch
            value={isInactive ? '' : tempSelectedId}
            onChange={setTempSelectedId}
            options={editableOptions}
            placeholder={placeholder ?? t('ui:placeholders.selectOption')}
            searchPlaceholder={t('ui:placeholders.search')}
            searchableFields={['label', 'subLabel', 'all']}
            showDetails={true}
          />

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-[rgb(var(--border))]">
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

export default SelectCell;