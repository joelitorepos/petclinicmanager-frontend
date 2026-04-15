// src/components/ui/SelectWithSearch.tsx
import { useState, useMemo } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import Modal from './Modal';

// Tipos genéricos mejorados
interface Option<T = Record<string, unknown>> {
  id: string;
  label: string;
  data?: T;
  // Campos adicionales para mostrar en la lista
  subLabel?: string;
  metadata?: string[];
}

interface SelectWithSearchProps<T = Record<string, unknown>> {
  label?: string;
  value: string;
  onChange: (id: string) => void;
  options: Option<T>[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  required?: boolean;
  // Nueva prop para definir qué campos buscar además del label
  searchableFields?: (keyof Option<T> | 'all')[];
  // Prop para mostrar detalles adicionales en la lista
  showDetails?: boolean;
}

const SelectWithSearch = <T extends Record<string, unknown>>({
  label,
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  disabled = false,
  required = false,
  searchableFields = ['label', 'subLabel'],
  showDetails = false
}: SelectWithSearchProps<T>) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Encontrar la opción seleccionada
  const selectedOption = useMemo(() => 
    options.find(opt => opt.id === value), 
  [options, value]);

  // Filtrar opciones según múltiples campos
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    
    const query = searchQuery.toLowerCase();
    return options.filter(opt => {
      // Buscar en el label principal
      if (opt.label.toLowerCase().includes(query)) return true;
      
      // Buscar en el subLabel si existe
      if (opt.subLabel && opt.subLabel.toLowerCase().includes(query)) return true;
      
      // Buscar en metadata si existe
      if (opt.metadata && opt.metadata.some(item => 
        item.toLowerCase().includes(query)
      )) return true;
      
      // Buscar en data si searchableFields incluye 'all'
      if (searchableFields.includes('all') && opt.data) {
        return Object.values(opt.data).some(val => 
          String(val).toLowerCase().includes(query)
        );
      }
      
      return false;
    });
  }, [options, searchQuery, searchableFields]);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsModalOpen(false);
    setSearchQuery("");
  };

  // Función para formatear la opción con detalles
  const renderOption = (opt: Option<T>, isSelected: boolean) => (
    <div className="flex flex-col">
      <div className="font-medium">{opt.label}</div>
      {opt.subLabel && (
        <div className={`text-sm ${isSelected ? 'text-white/90' : 'text-[rgb(var(--text-secondary))]'}`}>
          {opt.subLabel}
        </div>
      )}
      {showDetails && opt.metadata && opt.metadata.length > 0 && (
        <div className={`text-xs mt-1 space-x-2 ${isSelected ? 'text-white/80' : 'text-[rgb(var(--text-tertiary))]'}`}>
          {opt.metadata.map((item, idx) => (
            <span key={idx} className="inline-block bg-[rgb(var(--surface-hover))] px-2 py-0.5 rounded">
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-[rgb(var(--text))] text-lg mb-1">
          {label}
        </label>
      )}

      {/* Trigger */}
      <div
        onClick={() => !disabled && setIsModalOpen(true)}
        className={`
          relative w-full px-4 py-3 rounded-lg border flex items-center justify-between
          bg-[rgb(var(--surface))] cursor-pointer transition-all duration-200
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-[rgb(var(--primary))]'}
          ${!value && required ? 'border-[rgb(var(--border))]' : 'border-[rgb(var(--border))]'}
        `}
      >
        <div className="flex-1">
          {selectedOption ? (
            <div className="flex flex-col">
              <span className="text-[rgb(var(--text))]">{selectedOption.label}</span>
              {selectedOption.subLabel && (
                <span className="text-sm text-[rgb(var(--text-secondary))]">
                  {selectedOption.subLabel}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[rgb(var(--text-secondary))]">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={20} className="text-[rgb(var(--text-secondary))]" />
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={placeholder}
      >
        <div className="space-y-4 pt-2">
          {/* Input de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-secondary))]" size={18} />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] 
                         rounded-lg text-[rgb(var(--text))] focus:ring-2 focus:ring-[rgb(var(--primary))] outline-none"
            />
          </div>

          {/* Lista de resultados */}
          <div className="max-h-[300px] overflow-y-auto rounded-md">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={`
                    px-4 py-3 cursor-pointer transition-colors border-b border-[rgb(var(--border-light))]
                    ${value === opt.id 
                      ? 'bg-[rgb(var(--primary))] text-white' 
                      : 'text-[rgb(var(--text))] hover:bg-[rgb(var(--surface-hover))]'
                    }
                  `}
                >
                  {renderOption(opt, value === opt.id)}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-[rgb(var(--text-secondary))]">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SelectWithSearch;