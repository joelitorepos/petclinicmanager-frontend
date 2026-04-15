// src/components/table/TextCell.tsx
import { useState, useRef, useEffect } from 'react';
import Modal from './ModalForCell';
import { useLanguage } from '../../hooks/useLanguage';

interface TextCellProps {
  id: string;
  value: string;
  fieldName: string;
  fieldNameTranslated: string;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
  inputType?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  onDataChange: (id: string, fieldName: string, newValue: string) => void;
  className?: string;
  editable?: boolean;
}

const TextCell = ({
  id,
  value,
  fieldName,
  fieldNameTranslated,
  placeholder = 'Haz doble click para editar',
  maxLength,
  multiline = false,
  rows = 3,
  inputType = 'text',
  editable = true,
  onDataChange,
  className = ''
}: TextCellProps) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const textRef = useRef<HTMLDivElement>(null);

  const { t } = useLanguage();

  placeholder = t('ui:placeholders.edit') + ` (${fieldNameTranslated})`;

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleClick = () => {
    if (value) {
      setIsViewerOpen(true);
    }
  };

  const handleDoubleClick = () => {
    if (!editable) return;
    setEditValue(value);
    setIsEditorOpen(true);
  };

  const handleTextSave = () => {
    if (editValue !== value) {
      onDataChange(id, fieldName, editValue);
    }
    setIsEditorOpen(false);
  };

  const handleTextCancel = () => {
    setEditValue(value);
    setIsEditorOpen(false);
  };

  return (
    <div
      className={`flex-1 min-w-0 p-3 border border-transparent 
                 transition-colors cursor-pointer bg-[rgb(var(--surface))]
                 overflow-hidden ${className}
                                  ${editable
                 ? 'hover:border-[rgb(var(--text-secondary))]'
                 : 'hover:border-[rgb(var(--text))] '}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      ref={textRef}
    >
      {value ? (
        <p className="min-w-0 text-ellipsis overflow-hidden whitespace-nowrap text-[rgb(var(--text))]">
          {value}
        </p>
      ) : (
        <p className="text-[rgb(var(--text))] italic">
          {placeholder}
        </p>
      )}

      {/* Modal de visualización */}
      <Modal isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} title={fieldNameTranslated}>
        <div className="p-6 max-w-2xl max-h-[80vh] overflow-auto">
          <div className="whitespace-pre-wrap text-[rgb(var(--text))] bg-[rgb(var(--surface))] p-4 rounded-lg">
            {value}
          </div>
        </div>
      </Modal>

      {/* Modal de edición */}
      <Modal isOpen={isEditorOpen} onClose={handleTextCancel} title={t('ui:modals.titleEdit') + ` ${fieldNameTranslated}`}>
        <div className="p-6">
          {multiline ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={placeholder}
              rows={rows}
              maxLength={maxLength}
              className="w-full p-3 border border-[rgb(var(--primary))] rounded-lg 
                       bg-[rgb(var(--surface))] text-[rgb(var(--text))]
                       focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] 
                       resize-none mb-4"
              autoFocus
            />
          ) : (
            <input
              type={inputType} // Usamos la nueva prop
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={placeholder}
              maxLength={maxLength}
              className="w-full p-3 border border-[rgb(var(--primary))] rounded-lg 
                       bg-[rgb(var(--surface))] text-[rgb(var(--text))]
                       focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] mb-4"
              autoFocus
            />
          )}
          {maxLength && (
            <div className="text-right mb-4">
              <span className="text-xs text-[rgb(var(--text-secondary))]">
                {editValue.length}/{maxLength} caracteres
              </span>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={handleTextSave}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 
                       transition-colors text-sm font-medium"
            >
              {t('ui:buttons.save')}
            </button>
            <button
              onClick={handleTextCancel}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                       transition-colors text-sm font-medium"
            >
              {t('ui:buttons.cancel')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TextCell;