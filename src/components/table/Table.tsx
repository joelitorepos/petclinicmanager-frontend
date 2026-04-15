// src/components/table/Table.tsx

import TableRow from './TableRow';
// Importamos la definición sin genérico desde el padre para no duplicar código
import { type CellConfig, type ColumnDef } from '../common/DataTableWithSearch';

interface TableProps<
  T extends Record<string, unknown>, 
  K extends keyof T & string,
  OptionData extends Record<string, unknown> = Record<string, unknown>
> {
  columns: ColumnDef[];
  data: T[];
  onCellChange?: (id: string, fieldName: K, newValue: unknown) => void;
  onPhotoChange?: (id: string, fieldName: string, payload: unknown) => void;
  onRowUpdate?: (id: string) => void;
  onRowDelete?: (id: string) => void;
  height?: string;
  className?: string;
  emptyMessage?: string;
  cellConfigs?: Partial<Record<K, CellConfig<OptionData>>>;
}

const Table = <
  T extends Record<string, unknown>, 
  K extends keyof T & string = keyof T & string,
  OptionData extends Record<string, unknown> = Record<string, unknown>
>({
  columns,
  data,
  onCellChange,
  onPhotoChange,
  onRowUpdate = () => {},
  onRowDelete = () => {},
  height = '500px',
  className = '',
  emptyMessage = 'No hay datos disponibles',
  cellConfigs,
}: TableProps<T, K, OptionData>) => {
  
  const handleCellChangeForTableRow = (id: string, fieldName: string, newValue: unknown) => {
    if (onCellChange) {
      // Casteamos fieldName a K porque sabemos que viene de una columna válida
      onCellChange(id, fieldName as K, newValue);
    }
  };

  return (
    <div
      className={`overflow-x-auto overflow-y-auto border border-[rgb(var(--border))] rounded-lg 
                 bg-[rgb(var(--surface))] shadow-lg w-full max-w-full min-w-0 ${className}`}
      style={{ maxHeight: height }}
    >
      <div className="sticky top-0 z-10 bg-[rgb(var(--surface))] border-b border-[rgb(var(--border))]">
        <div className="flex min-w-0 items-stretch min-h-10 font-semibold text-[rgb(var(--text-secondary))]">
          {columns.map((col) => (
            <div 
              key={col.field}
              className={`flex-1 min-w-0 p-3 flex items-center overflow-hidden text-sm truncate ${col.className}`}
            >
              {col.header}
            </div>
          ))}
        </div>
      </div>

      <div>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[rgb(var(--text-secondary))]">
            {emptyMessage}
          </div>
        ) : (
          data.map((row) => {
            // Aseguramos que rowId sea string, manejando _id o id
            const rowId = String(row.id || row._id || '');
            
            return (
              // Pasamos los genéricos hacia abajo
              <TableRow<T, K, OptionData> 
                key={rowId}
                rowId={rowId}
                rowData={row}
                columns={columns}
                cellConfigs={cellConfigs}
                onDataChange={handleCellChangeForTableRow}
                onPhotoChange={onPhotoChange}
                onUpdate={onRowUpdate}
                onDelete={onRowDelete}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default Table;