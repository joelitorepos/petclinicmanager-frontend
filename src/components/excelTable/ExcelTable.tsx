// ExcelTable.tsx
import React from 'react';
import ExcelCell from './ExcelCell';

interface ExcelTableProps {
  headers: string[][];
  examples: string[][];
  headerDefaults?: number[];
  dataDefaults?: number[][];
  numberOfRows?: number;
  className?: string;
}

const ExcelTable: React.FC<ExcelTableProps> = ({
  headers,
  examples,
  headerDefaults,
  dataDefaults,
  numberOfRows = 3,
  className = '',
}) => {
  if (headers.length === 0 || examples.length === 0 || headers.length !== examples.length) {
    return <div className="p-4 text-gray-500">No hay datos para mostrar</div>;
  }

  const getColumnLetter = (index: number): string => {
    let letter = '';
    let n = index;
    while (n >= 0) {
      letter = String.fromCharCode((n % 26) + 65) + letter;
      n = Math.floor(n / 26) - 1;
    }
    return letter;
  };

  const numCols = headers.length;
  const effectiveRows = dataDefaults?.length ?? numberOfRows;

  return (
    <div className={`overflow-x-auto border border-gray-300 rounded shadow-sm ${className}`}>
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full border-collapse bg-white text-sm">
          <thead>
            {/* Fila de letras A, B, C... */}
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-3 py-2 font-medium text-gray-600 w-12 text-center">
                {/* Esquina superior izquierda vacía */}
              </th>
              {Array.from({ length: numCols }).map((_, colIdx) => (
                <th
                  key={colIdx}
                  className="border border-gray-300 px-4 py-2 font-bold text-gray-700 text-center whitespace-nowrap"
                >
                  {getColumnLetter(colIdx)}
                </th>
              ))}
            </tr>

            {/* Fila 1: Headers editables */}
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 font-medium text-gray-600 w-12 text-center bg-gray-50">
                1
              </th>
              {headers.map((headerOptions, colIdx) => {
                const defaultIndex = headerDefaults?.[colIdx] ?? 0;
                return (
                  <th
                    key={colIdx}
                    className="border border-gray-300 p-0 min-w-[160px]"
                  >
                    <ExcelCell
                      options={headerOptions}
                      defaultIndex={defaultIndex}
                      className="h-full w-full font-normal"
                    />
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: effectiveRows }).map((_, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-gray-50/70 transition-colors"
              >
                {/* Números de fila a partir del 2 */}
                <td className="border border-gray-300 px-3 py-2 text-center text-gray-500 bg-gray-50 font-medium">
                  {rowIdx + 2}
                </td>

                {examples.map((colOptions, colIdx) => {
                  let defaultIndex: number;
                  if (dataDefaults?.[rowIdx]?.[colIdx] !== undefined) {
                    defaultIndex = dataDefaults[rowIdx][colIdx];
                  } else {
                    defaultIndex = rowIdx < colOptions.length ? rowIdx : -1;
                  }
                  return (
                    <td
                      key={colIdx}
                      className="border border-gray-300 p-0 min-w-[160px]"
                    >
                      <ExcelCell
                        options={colOptions}
                        defaultIndex={defaultIndex}
                        className="h-full w-full"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExcelTable;