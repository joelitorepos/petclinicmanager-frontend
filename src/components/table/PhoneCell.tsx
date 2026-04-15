// src/components/table/PhoneCell.tsx
import { useState, useEffect, useMemo } from 'react';
import Modal from './ModalForCell';
import { useLanguage } from '../../hooks/useLanguage';
import PhoneInput, { type IPhone, type CountryCode } from '../ui/PhoneInput';

interface PhoneCellProps {
  id: string;
  value: string; // esperamos string JSON: {"country":"GT","number":"55123456"}
  fieldName: string;
  fieldNameTranslated: string;
  onDataChange: (id: string, fieldName: string, newValue: string) => void;
  className?: string;
  editable?: boolean;
}

const PhoneCell = ({
  id,
  value,
  fieldName,
  fieldNameTranslated,
  onDataChange,
  className = '',
  editable = true,
}: PhoneCellProps) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const { t } = useLanguage();

  const parsePhone = (val: string): IPhone | null => {
    if (!val) return null;
    try {
      return JSON.parse(val) as IPhone;
    } catch {
      return null;
    }
  };

  const currentPhone = useMemo(() => parsePhone(value), [value]);

  const [tempPhone, setTempPhone] = useState<IPhone | null>(currentPhone);

  useEffect(() => {
    setTempPhone(currentPhone);
  }, [currentPhone]);

  const handleSave = () => {
    if (tempPhone) {
      onDataChange(id, fieldName, JSON.stringify(tempPhone));
    } else {
      onDataChange(id, fieldName, '');
    }
    setIsEditorOpen(false);
  };

  const handleCancel = () => {
    // Volvemos al valor original parseado
    setTempPhone(parsePhone(value));
    setIsEditorOpen(false);
  };

  // Helper para mostrar bandera
  const getFlag = (code: CountryCode) => {
    const flags: Record<CountryCode, string> = {
      GT: '🇬🇹',
      ES: '🇪🇸',
      US: '🇺🇸',
      MX: '🇲🇽',
      AR: '🇦🇷',
    };
    return flags[code] || '';
  };

  // Para mostrar en la celda y en el visor usamos el valor parseado actual
  const displayedPhone = parsePhone(value);

  return (
    <div
      className={`
        flex-1 p-3 border border-transparent cursor-pointer
        bg-[rgb(var(--surface))] overflow-hidden flex items-center gap-2
        ${className}
        ${editable
          ? 'hover:border-[rgb(var(--text-secondary))]'
          : 'hover:border-[rgb(var(--text))]'}`}
      onClick={() => displayedPhone && setIsViewerOpen(true)}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!editable) return;
        setIsEditorOpen(true);
      }}
      title="Click para ver · Doble click para editar"
    >
      {displayedPhone ? (
        <>
          <span className="text-xl flex-shrink-0">{getFlag(displayedPhone.country)}</span>
          <span className="font-medium text-[rgb(var(--text))] truncate">
            {displayedPhone.number}
          </span>
        </>
      ) : (
        <span className="text-[rgb(var(--text-secondary))] italic">
          {t('ui:modals.titleEdit')}
        </span>
      )}

      {/* Modal de visualización (solo lectura) */}
      <Modal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        title={fieldNameTranslated}
      >
        <div className="p-8 flex flex-col items-center gap-6">
          {displayedPhone ? (
            <>
              <div className="text-6xl">{getFlag(displayedPhone.country)}</div>
              <div className="text-3xl font-bold tracking-wide">
                {displayedPhone.number}
              </div>
              <div className="text-lg text-[rgb(var(--text-secondary))]">
                {displayedPhone.country} • {getCountryName(displayedPhone.country)}
              </div>
            </>
          ) : (
            <p className="text-xl text-[rgb(var(--text-secondary))]">
              No hay número registrado
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
        <div className="p-6 space-y-6 min-w-[380px]">
          <PhoneInput
            value={tempPhone}
            onChange={setTempPhone}
            label={fieldNameTranslated}
            required={false}
            errorMessage={t('ui:errors.invalidPhone') || 'Número inválido (8–15 dígitos)'}
          />

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[rgb(var(--border))]">
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 bg-[rgb(var(--surface-hover))] text-[rgb(var(--text))] rounded-lg hover:opacity-90"
            >
              {t('ui:buttons.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] shadow-md"
            >
              {t('ui:buttons.save')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

function getCountryName(code: CountryCode): string {
  const names: Record<CountryCode, string> = {
    GT: 'Guatemala',
    ES: 'España',
    US: 'Estados Unidos',
    MX: 'México',
    AR: 'Argentina',
  };
  return names[code] || code;
}

export default PhoneCell;