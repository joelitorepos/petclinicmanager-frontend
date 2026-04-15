// src/components/common/DataTableWithSearch.tsx

import { useState, useMemo } from 'react';
import Table from '../table/Table';
import { Search } from 'lucide-react';

export type CellType = 'text' | 'select' | 'checkbox' | 'date' | 'photo' | 'phone';

export interface ArrayCellConfig {
  type: 'diagnostics' | 'vaccinations' | 'treatments';
}

export interface PhotoArrayCellConfig {
  type: 'photoArray';
  maxFiles?: number;
  namespace?: string;
}

export interface DateCellConfig {
  type: 'date' | 'datetime-local' | 'time';
  max?: string;
  min?: string;
}

export interface SelectCellConfig<T extends Record<string, unknown>> {
  type: 'select';
  options: Array<{
    id: string;
    label: string;
    subLabel?: string;
    data?: T;
    /**
     * Marca la opción como inactiva (registro soft-deleted o con rol cambiado).
     * La celda la muestra con el nombre real, pero NO aparece en el selector al editar.
     */
    inactive?: boolean;
  }>;
  namespace: string;
  displayKeys?: (keyof T)[];
}

export interface TextCellConfig {
  type: 'text';
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  inputType?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

export interface PhoneCellConfig {
  type: 'phone';
}

export type CellConfig<T extends Record<string, unknown>> = 
  | SelectCellConfig<T>
  | TextCellConfig
  | DateCellConfig
  | { type: 'photo' }
  | { type: 'checkbox'; namespace: string }
  | PhotoArrayCellConfig
  | PhoneCellConfig
  | ArrayCellConfig;

export interface ColumnDef {
  field: string;
  header: string;
  multiline?: boolean;
  className?: string;
  cellType?: CellType;
  editable?: boolean;
}

interface DataTableWithSearchProps<
  T extends Record<string, unknown>,
  K extends keyof T & string = keyof T & string,
  OptionData extends Record<string, unknown> = Record<string, unknown>
> {
  data: T[];
  columns: ColumnDef[];
  onCellChange?: (id: string, fieldName: K, newValue: unknown) => void;
  onPhotoChange?: (id: string, fieldName: string, payload: unknown) => void;
  onRowUpdate?: (id: string) => void;
  onRowDelete?: (id: string) => void;
  height?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  title?: string;
  className?: string;
  cellConfigs?: Partial<Record<K, CellConfig<OptionData>>>;
}

const DataTableWithSearch = <
  T extends Record<string, unknown>,
  K extends keyof T & string = keyof T & string,
  OptionData extends Record<string, unknown> = Record<string, unknown>
>({
  data: originalData,
  columns,
  onCellChange,
  onPhotoChange,
  onRowUpdate,
  onRowDelete,
  height = '70vh',
  emptyMessage = 'No se encontraron registros.',
  searchPlaceholder = 'Buscar en todos los campos...',
  title,
  className = '',
  cellConfigs,
}: DataTableWithSearchProps<T, K, OptionData>) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return originalData;

    const query = searchQuery.toLowerCase();

    return originalData.filter((item) => {
      return columns.some((col) => {
        const value = item[col.field as keyof T];
        if (value === undefined || value === null) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [originalData, searchQuery, columns]);

  return (
    <div className={`space-y-6 w-full max-w-full min-w-0 ${className}`}>
      {title && (
        <h2 className="text-3xl font-bold text-[rgb(var(--text))]">{title}</h2>
      )}

      <div className="max-w-md">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-secondary))]" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-[rgb(var(--border))] rounded-lg 
                       bg-[rgb(var(--surface))] text-[rgb(var(--text))]
                       focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]
                       placeholder:text-[rgb(var(--text-secondary))]
                       transition-all"
          />
        </div>
      </div>

      <Table<T, K, OptionData>
        columns={columns}
        data={filteredData}
        onCellChange={onCellChange}
        onPhotoChange={onPhotoChange}
        onRowUpdate={onRowUpdate}
        onRowDelete={onRowDelete}
        cellConfigs={cellConfigs}
        height={height}
        emptyMessage={emptyMessage}
        className="shadow-xl"
      />
    </div>
  );
};

export default DataTableWithSearch;