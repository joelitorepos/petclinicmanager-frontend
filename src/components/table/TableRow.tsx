// src/components/table/TableRow.tsx

import { useState } from 'react';
import TextCell from './TextCell';
import SelectCell from './SelectCell';
import CheckboxCell from './CheckBoxCell';
import DateCell from './DateCell';
import PhotoCell from './PhotoCell';
import PhotoArrayCell from './PhotoArrayCell';
import PhoneCell from './PhoneCell';
import DiagnosticsCell from './DiagnosticCell';
import VaccinationsCell from './VaccinationCell';
import TreatmentsCell from './TreatmentCell';
import RowActionsMenu from './RowActionsMenu';
import { type CellConfig, type ColumnDef, type DateCellConfig } from '../common/DataTableWithSearch';

interface TableRowProps<
  T extends Record<string, unknown>,
  K extends keyof T & string,
  OptionData extends Record<string, unknown> = Record<string, unknown>
> {
  rowId: string;
  rowData: T;
  columns: ColumnDef[]; // Sin genérico
  cellConfigs?: Partial<Record<K, CellConfig<OptionData>>>;
  onDataChange: (id: string, fieldName: string, newValue: unknown) => void;
  onPhotoChange?: (id: string, fieldName: string, payload: unknown) => void;
  onUpdate?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

const TableRow = <
  T extends Record<string, unknown>,
  K extends keyof T & string,
  OptionData extends Record<string, unknown> = Record<string, unknown>
>({
  rowId,
  rowData,
  columns,
  cellConfigs,
  onDataChange,
  onPhotoChange,
  onUpdate = () => {},
  onDelete = () => {},
  className = '',
}: TableRowProps<T, K, OptionData>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`flex flex-col border-b border-[rgb(var(--border))] ${className}`}>
      {/* Fila de datos */}
      <div
        className="flex items-stretch min-h-12 min-w-0 bg-[rgb(var(--surface))] 
                   hover:bg-[rgb(var(--surface-hover))] transition-colors"
      >
        {columns.map((col) => {
          const fieldName = col.field;

          const rawValue = rowData[fieldName as keyof T];
          const value = (typeof rawValue === 'object' && rawValue !== null)
            ? JSON.stringify(rawValue)
            : String(rawValue ?? '');

          const cellConfig = cellConfigs?.[fieldName as K];
          const isEditable = col.editable !== false;
          
          if (cellConfig?.type === 'select') {
            return (
              <SelectCell<OptionData> 
                key={`${rowId}-${fieldName}`}
                id={rowId}
                value={value}
                fieldName={fieldName}
                namespace={cellConfig.namespace}
                options={cellConfig.options}
                displayKeys={cellConfig.displayKeys}
                onDataChange={onDataChange}
                className={`flex-1 min-w-0 ${col.className || ''}`}
                editable={isEditable}
              />
            );
          } else if (cellConfig?.type === 'checkbox') {
            return(
            <CheckboxCell
              key={`${rowId}-${fieldName}`}
              id={rowId}
              value={value}
              fieldName={fieldName}
              namespace={cellConfig.namespace}
              onDataChange={onDataChange}
              className={`flex-1 min-w-0 ${col.className || ''}`}
              editable={isEditable}
            />
            );
          } else if (cellConfig?.type === 'date' || cellConfig?.type === 'datetime-local' || cellConfig?.type === 'time') {
            const dateConfig = cellConfig as DateCellConfig;
            return (
              <DateCell
                key={`${rowId}-${fieldName}`}
                id={rowId}
                value={value}
                fieldName={fieldName}
                fieldNameTranslated={col.header}
                onDataChange={onDataChange}
                max={dateConfig.max}
                min={dateConfig.min}
                inputType={dateConfig.type}
                className={`flex-1 min-w-0 ${col.className || ''}`}
              />
            );
          } else if (cellConfig?.type === 'photo') {
            return (
              <PhotoCell
                key={`${rowId}-${fieldName}`}
                id={rowId}
                value={value}
                fieldName={fieldName}
                fieldNameTranslated={col.header}
                onDataChange={onDataChange}
                className={`flex-1 min-w-0 ${col.className || ''}`}
                editable={isEditable}
              />
            );
          } else if(cellConfig?.type === 'photoArray') {
            return (
              <PhotoArrayCell
                key={`${rowId}-${fieldName}`}
                id={rowId}
                value={value}
                fieldName={fieldName}
                fieldNameTranslated={col.header}
                onDataChange={onPhotoChange || onDataChange}
                className={`flex-1 min-w-0 ${col.className || ''}`}
                editable={col.editable ?? true}
                maxFiles={cellConfig.maxFiles}
              />
            );
          } else if (cellConfig?.type === 'phone') {
            return (
              <PhoneCell
                key={`${rowId}-${fieldName}`}
                id={rowId}
                value={value}
                fieldName={fieldName}
                fieldNameTranslated={col.header}
                onDataChange={onDataChange}
                className={`flex-1 min-w-0 ${col.className || ''}`}
                editable={isEditable}
              />
            );
          } else if (cellConfig?.type === 'diagnostics') {
            return (
              <DiagnosticsCell
                key={`${rowId}-${fieldName}`}
                id={rowId}
                value={value}
                fieldName={fieldName}
                fieldNameTranslated={col.header}
                onDataChange={onDataChange}
                className={`flex-1 min-w-0 ${col.className || ''}`}
                editable={isEditable}
              />
            );
          } else if (cellConfig?.type === 'vaccinations') {
            return (
              <VaccinationsCell
                key={`${rowId}-${fieldName}`}
                id={rowId}
                value={value}
                fieldName={fieldName}
                fieldNameTranslated={col.header}
                onDataChange={onDataChange}
                className={`flex-1 min-w-0 ${col.className || ''}`}
                editable={isEditable}
              />
            );
          } else if (cellConfig?.type === 'treatments') {
            return (
              <TreatmentsCell
                key={`${rowId}-${fieldName}`}
                id={rowId}
                value={value}
                fieldName={fieldName}
                fieldNameTranslated={col.header}
                onDataChange={onDataChange}
                className={`flex-1 min-w-0 ${col.className || ''}`}
                editable={isEditable}
              />
            );
          } else {
            return (
              <TextCell
                key={`${rowId}-${fieldName}`}
                id={rowId}
                value={value}
                fieldName={fieldName}
                fieldNameTranslated={col.header}
                multiline={col.multiline || (cellConfig?.type === 'text' && cellConfig.multiline)}
                rows={cellConfig?.type === 'text' ? cellConfig.rows : 3}
                maxLength={cellConfig?.type === 'text' ? cellConfig.maxLength : undefined}
                inputType={cellConfig?.type === 'text' ? cellConfig.inputType : 'text'}
                onDataChange={onDataChange}
                className={`flex-1 min-w-0 ${col.className || ''}`}
                editable={isEditable}
              />
            );
          }
        })}
      </div>

      <RowActionsMenu
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        onUpdate={onUpdate}
        onDelete={onDelete}
        rowId={rowId}
      />
    </div>
  );
};

export default TableRow;