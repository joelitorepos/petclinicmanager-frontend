// src/components/modal/ConfirmationModals.tsx

import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useLanguage } from '../../hooks/useLanguage';

interface PhoneObject {
  country: string;
  number: string;
}

const isPhoneObject = (value: unknown): value is PhoneObject => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'country' in value &&
    'number' in value
  );
};

// Función auxiliar para renderizar los valores de forma inteligente
const renderValue = (key: string, value: unknown, allData: Record<string, unknown>, t: (key: string) => string) => {
if (!value || value === '') return null;
  // Ignorar IDs y SubLabels
  if (key.toLowerCase().endsWith('id')) return null;
  if (key.endsWith('SubLabel')) return null;

  // Formatear el label (ej: telefono -> Telefono)
  const label = key.charAt(0).toUpperCase() + key.slice(1);

  // Manejo de booleanos
  if (typeof value === 'boolean') {
    return (
      <p key={key}><strong>{label}:</strong> {value ? 'Sí' : 'No'}</p>
    );
  }

  // Manejo de Teléfonos (Objeto {country, number})
  if (isPhoneObject(value)) {
    if (!value.number || value.number.trim() === '') return null;
    const countryName = t(`common:countries.${value.country}`);
    return (
      <p key={key}>
        <strong>{label}:</strong> {countryName} {value.number}
      </p>
    );
  }

  // Manejo de Archivos
  if (value instanceof File) {
    return (
      <div key={key} className="flex items-center gap-2">
        <strong>{label}:</strong>
        <span className="text-xs bg-[rgb(var(--primary))] text-white px-2 py-0.5 rounded">
          Archivo: {value.name}
        </span>
      </div>
    );
  }

  // Manejo de Labels Enriquecidos
  if (key.endsWith('Label')) {
    const subLabelKey = key.replace('Label', 'SubLabel');
    const subLabelValue = allData[subLabelKey];
    
    const renderSubLabel = () => {
      if (subLabelValue == null) return null;
      try {
        return String(subLabelValue);
      } catch {
        return "[Valor no disponible]";
      }
    };

    const subLabelText = renderSubLabel();
    
    return (
      <div key={key} className="mt-2 pt-2 border-t border-[rgb(var(--border-light))]">
        <p><strong>{label.replace('Label', '')}:</strong> {String(value)}</p>
        {subLabelText && (
          <p className="text-sm text-[rgb(var(--text-secondary))]">{subLabelText}</p>
        )}
      </div>
    );
  }

  // Texto por defecto
  return (
    <p key={key}><strong>{label}:</strong> {String(value)}</p>
  );
};

// --- MODAL DE CREACIÓN ---
interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  title: string;
  data: Record<string, unknown>;
}

export const CreateConfirmationModal = ({ isOpen, onClose, onConfirm, title, data, loading }: CreateModalProps) => {
  const { t } = useLanguage();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p>{t('owners:messages.modalCreateConfirmation')}</p>
        <div className="bg-[rgb(var(--surface))] p-4 rounded text-[rgb(var(--text))] border border-[rgb(var(--border))]">
          {Object.entries(data).map(([key, value]) => renderValue(key, value, data, t))}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} disabled={loading}>{t('ui:buttons.cancel')}</Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? 'Procesando...' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// --- MODAL DE ACTUALIZACIÓN ---
interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  changedFields: Record<string, unknown> | null;
}

export const UpdateConfirmationModal = ({ isOpen, onClose, onConfirm, changedFields }: UpdateModalProps) => {
  const { t } = useLanguage();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('owners:titles.modalUpdate')}>
      <div className="space-y-4">
        <p className="font-medium text-[rgb(var(--text-secondary))]">
          {t('owners:messages.modalUpdateConfirmation')}
        </p>
        <div className="bg-[rgb(var(--surface))] p-4 rounded text-[rgb(var(--text))] border border-[rgb(var(--border))]">
          {changedFields && Object.entries(changedFields).map(([key, value]) => 
            renderValue(key, value, changedFields, t)
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose}>{t('owners:buttons.cancel')}</Button>
          <Button onClick={onConfirm}>{t('common:confirm_changes')}</Button>
        </div>
      </div>
    </Modal>
  );
};

// --- MODAL DE ELIMINACIÓN ---
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string | null;
}

export const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }: DeleteModalProps) => {
  const { t } = useLanguage();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={"Confirmar eliminación " + t('owners:titles.modalDelete')}>
      <div className="space-y-4 text-[rgb(var(--text))]">
        <p>
          {t('owners:messages.modalDeleteConfirmation')} 
          <span className="font-bold"> {itemName} </span> 
          {t('owners:messages.modalDeleteConfirmation2')}
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose}>{t('owners:buttons.cancel')}</Button>
          <Button onClick={onConfirm} variant="danger">{t('ui:buttons.delete')}</Button>
        </div>
      </div>
    </Modal>
  );
};