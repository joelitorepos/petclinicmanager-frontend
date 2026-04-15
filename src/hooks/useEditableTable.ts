// src/hooks/useEditableTable.ts

import { useState, useCallback } from 'react';

export interface TableRow {
  id: string;
  [key: string]: unknown;
}

// Valor especial que indica que hay un File pendiente guardado en ref externo.
// Se usa como marcador en tableData para que handleUpdate detecte el cambio
// sin que el File pase por el estado de React.
export const PENDING_PHOTO_MARKER = '__pending_photo__' as const;
export type PendingPhotoMarker = typeof PENDING_PHOTO_MARKER;

export type CellValue = string | number | boolean | Date | File | null | undefined | PendingPhotoMarker | unknown;

export const useEditableTable = <T extends TableRow>(initialData: T[] = []) => {
  const [data, setData] = useState<T[]>(initialData);

  const handleCellChange = useCallback(
    (id: string, field: keyof T, newValue: CellValue) => {
      setData((prev: T[]) =>
        prev.map((row: T) =>
          row.id === id
            ? { ...row, [field]: newValue }
            : row
        )
      );
    },
    []
  );

  const updateData = useCallback(
    (newDataOrUpdater: T[] | ((prev: T[]) => T[])) => {
      setData(newDataOrUpdater);
    },
    []
  );

  const updateRow = useCallback((id: string, updates: Partial<T>) => {
    setData((prev: T[]) =>
      prev.map((row: T) =>
        row.id === id ? { ...row, ...updates } : row
      )
    );
  }, []);

  return {
    data,
    handleCellChange,
    updateData,
    updateRow,
  };
};