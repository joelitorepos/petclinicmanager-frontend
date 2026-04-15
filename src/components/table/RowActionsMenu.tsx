// src/components/table/RowActionsMenu.tsx

import { Edit2, Trash2 } from 'lucide-react';

interface RowActionsMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onUpdate?: (id: string) => void;
  onDelete?: (id: string) => void;
  rowId: string;
}

const RowActionsMenu = ({ 
  isOpen, 
  onToggle, 
  onUpdate = () => {}, 
  onDelete = () => {}, 
  rowId 
}: RowActionsMenuProps) => {
  return (
    <div className="border-t border-[rgb(var(--border))] bg-[rgb(var(--surface))]">
      <div
        className="flex justify-center py-1 cursor-pointer hover:bg-[rgb(var(--surface-hover))] transition-colors"
        onClick={onToggle}
      >
        <div className="relative">
          <div className="w-24 h-1 bg-[rgb(var(--border))] rounded-full" /> 
          <span
            className={`absolute inset-0 flex items-center justify-center text-xs font-bold text-[rgb(var(--text-secondary))] transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          >
            {isOpen ? 'Hide' : 'Show'}
          </span>
        </div>
      </div>

      {/* Contenido del menú - animación suave y estable */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-h-32 opacity-100 py-3' : 'max-h-0 opacity-0 py-0'
        }`}
      >
        <div className="flex justify-center gap-4 px-6">
          <button
            onClick={() => onUpdate(rowId)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white 
                     bg-[rgb(var(--primary))] rounded-lg hover:bg-[rgb(var(--primary-hover))] 
                     transition-all shadow-md hover:shadow-lg"
          >
            <Edit2 size={16} />
            Actualizar
          </button>

          <button
            onClick={() => onDelete(rowId)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[rgb(var(--text))] 
                     bg-[rgb(var(--danger, #ef4444))] rounded-lg hover:opacity-90 
                     transition-all shadow-md hover:shadow-lg"
          >
            <Trash2 size={16} />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RowActionsMenu;