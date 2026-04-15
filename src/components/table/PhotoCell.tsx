// src/components/table/PhotoCell.tsx

import { useState, useMemo, useEffect } from 'react';
import Modal from './ModalForCell';
import FileInput from '../ui/FileInput';
import InfoNote from '../ui/InfoNote';
import { useLanguage } from '../../hooks/useLanguage';
import BASE_IMAGE_URL from '../../utils/URL';

interface PhotoCellProps {
  id: string;
  value: string | File | null; // JSON stringified { url: string, key: string } o string legacy
  fieldName: string;
  fieldNameTranslated: string;
  onDataChange: (id: string, fieldName: string, newValue: string | File | null) => void;
  className?: string;
  editable?: boolean;
}

const PhotoCell = ({
  id,
  value,
  fieldName,
  fieldNameTranslated,
  onDataChange,
  className = '',
  editable = true,
}: PhotoCellProps) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const { t } = useLanguage();

  // Parsear el valor para obtener currentPhoto con URL correcta
  const currentPhoto = useMemo(() => {
      // Si el valor ya es un File (porque lo acabamos de actualizar), no hay URL remota
      if (!value || value instanceof File) return null;

      // Tu lógica existente para strings/JSON
      try {
        if (typeof value === 'string') {
          const parsed = JSON.parse(value);
          if (typeof parsed === 'object' && parsed.key) {
            return { url: `${BASE_IMAGE_URL}/${parsed.key}`, key: parsed.key };
          } else if (parsed.url) {
            return { url: parsed.url, key: parsed.key };
          } else if (typeof parsed === 'string') { // Caso URL directa
             return { url: parsed };
          }
        }
      } catch {
         if (typeof value === 'string' && value.startsWith('http')) {
          return { url: value };
        }
      }
      return null;
    }, [value]);

  // URL temporal para preview de nuevo archivo
  const tempUrl = useMemo(() => {
    if (tempFile) return URL.createObjectURL(tempFile);
    if (value instanceof File) return URL.createObjectURL(value);
    return null;
  }, [tempFile, value]);

  // Limpieza de URL temporal
  useEffect(() => {
    return () => {
      if (tempUrl) URL.revokeObjectURL(tempUrl);
    };
  }, [tempUrl]);

  const hasPhoto = !!currentPhoto?.url;
  const hasTempFile = !!tempFile;

  const displayText = hasTempFile
    ? tempFile.name
    : hasPhoto
    ? t('patients:photo.hasPhoto')
    : t('ui:placeholders.noPhoto');

  // Manejadores
  const handleClick = () => {
    if (hasPhoto || hasTempFile) setIsViewerOpen(true);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editable) return;
    setIsEditorOpen(true);
  };

  const handleFileChange = (file: File | null) => {
    setTempFile(file);
  };

  const handleSave = () => {
    if (tempFile) {
      // YA NO hacemos JSON.stringify
      onDataChange(id, fieldName, tempFile); 
    } else if (!hasPhoto && !tempFile) {
       // Si quieres permitir borrar:
      onDataChange(id, fieldName, '');
    }
    setIsEditorOpen(false);
  };

  const handleCancel = () => {
    setTempFile(null);
    setIsEditorOpen(false);
  };

  const handleRemove = () => {
    if (window.confirm(t('patients:confirm.removePhoto') || '¿Estás seguro de eliminar esta foto? Esto consumirá una operación de imagen.')) {
      setTempFile(null);
      onDataChange(id, fieldName, '');
      setIsEditorOpen(false);
    }
  };

  return (
    <div
      className={`flex-1 p-3 border border-transparent cursor-pointer bg-[rgb(var(--surface))]
                 overflow-hidden flex items-center gap-3 transition-colors ${className}
                 ${editable
                 ? 'hover:border-[rgb(var(--text-secondary))]'
                 : 'hover:border-[rgb(var(--text))] '}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title="Click para ver · Doble click para editar foto"
    >
      {(hasPhoto || hasTempFile) && (
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-[rgb(var(--border))]">
          <img
            src={tempUrl || currentPhoto?.url}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <span
        className={`text-sm ${
          hasPhoto || hasTempFile
            ? 'text-[rgb(var(--text))] font-medium'
            : 'text-[rgb(var(--text-secondary))] italic'
        } truncate`}
      >
        {displayText}
      </span>

      {/* Modal de vista (solo ver) */}
      <Modal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        title={fieldNameTranslated}
      >
        <div className="p-6 flex flex-col items-center max-w-3xl">
          {(tempUrl || currentPhoto?.url) && (
            <>
              <img
                src={tempUrl || currentPhoto?.url}
                alt={displayText}
                className="max-w-full max-h-[70vh] rounded-lg shadow-2xl object-contain"
              />
              <p className="mt-6 text-lg font-medium text-[rgb(var(--text))]">
                {hasTempFile ? tempFile?.name : t('patients:photo.current')}
              </p>
            </>
          )}
        </div>
      </Modal>

      {/* Modal de edición (doble click) */}
      <Modal
        isOpen={isEditorOpen}
        onClose={handleCancel}
        title={`${t('ui:modals.titleEdit')} ${fieldNameTranslated}`}
      >
        <div className="p-6 space-y-6 min-w-[400px]">
          <InfoNote variant="warning">
            {t('patients:warnings.imageOperations') ||
              'Eliminar o modificar una imagen consumirá "imageOperationsPerMonth". Si llegas al límite, no podrás realizar operaciones como crear, eliminar o modificar imágenes.'}
          </InfoNote>

          {(hasPhoto || hasTempFile) && (
            <div className="flex items-center gap-4 mb-4">
              <img
                src={tempUrl || currentPhoto?.url}
                alt="Current Preview"
                className="w-24 h-24 rounded-lg object-cover border border-[rgb(var(--border))]"
              />
              <button
                onClick={handleRemove}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                {t('ui:buttons.removePhoto') || 'Eliminar foto'}
              </button>
            </div>
          )}

          <FileInput
            value={tempFile}
            onChange={handleFileChange}
            accept="image/*"
            placeholder={t('patients:placeholders.form.photo') || 'Subir nueva foto'}
          />

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[rgb(var(--border))]">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-[rgb(var(--text))] bg-[rgb(var(--surface-hover))] rounded-lg hover:opacity-80 transition-colors text-sm font-medium"
            >
              {t('ui:buttons.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] transition-colors text-sm font-medium shadow-md"
              disabled={!tempFile && hasPhoto} // Deshabilitar si no hay cambio
            >
              {t('ui:buttons.save')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PhotoCell;