// src/components/ui/ImportProgressPanel.tsx

import { useLanguage } from '../../hooks/useLanguage';
import InfoNote from './InfoNote';
import type { ReactNode } from 'react';

export interface ImportStatus {
  isVisible: boolean;
  total: number;
  imported: number;
  errors: string[];
  message: string;
  isComplete: boolean;
  limitExceeded: boolean;
}

interface ImportProgressPanelProps {
  status: ImportStatus;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
}

const ImportProgressPanel = ({ 
  status, 
  onClose, 
  title,
  children 
}: ImportProgressPanelProps) => {
  const { t } = useLanguage();

  // Si no está visible, no renderizar nada
  if (!status.isVisible) {
    return null;
  }

  // Determinar el variant basado en el estado
  const getVariant = () => {
    if (status.limitExceeded) return 'warning';
    if (status.isComplete) {
      return status.errors.length > 0 ? 'warning' : 'success';
    }
    return 'info';
  };

  const variant = getVariant();

  // Título por defecto si no se pasa ninguno
  const displayTitle = title || t('ui:importProgress.progressLabel');

  return (
    <div className="mb-6 transition-all duration-300 animate-fade-in">
      <InfoNote variant={variant} className="relative">
        <div className="space-y-4">
          {/* Cabecera con título y botón de cerrar */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-lg">{displayTitle}</h4>
              </div>
              <p className="text-sm opacity-90 mt-1">{status.message}</p>
            </div>
            
            {/* Botón para cerrar - solo muestra cuando está completa */}
            {status.isComplete && (
              <button
                type="button"
                onClick={onClose}
                className="ml-2 p-1 rounded-full hover:bg-[rgb(var(--border)/0.5)] transition-colors flex-shrink-0"
                aria-label={t('ui:buttons.cancel')}
                title={t('ui:buttons.cancel')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Contenido adicional pasado como children */}
          {children}

          {/* Barra de progreso */}
          {!status.isComplete && status.total > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {t('ui:importProgress.progressLabel')} {status.imported} {t('ui:importProgress.progressOf')} {status.total}
                </span>
                <span>{Math.round((status.imported / status.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="h-2.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(status.imported / status.total) * 100}%`,
                    backgroundColor: 'rgb(var(--primary))'
                  }}
                />
              </div>
            </div>
          )}

          {/* Estadísticas */}
          {(status.total > 0 || status.imported > 0) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-[rgb(var(--bg)/0.3)] p-3 rounded-lg">
                <div className="font-semibold text-[rgb(var(--text-secondary))]">{t('ui:importProgress.statsTotal')}</div>
                <div className="text-lg font-bold">{status.total}</div>
              </div>
              <div className="bg-[rgb(var(--bg)/0.3)] p-3 rounded-lg">
                <div className="font-semibold text-[rgb(var(--text-secondary))]">{t('ui:importProgress.statsImported')}</div>
                <div className="text-lg font-bold text-green-600">{status.imported}</div>
              </div>
              <div className="bg-[rgb(var(--bg)/0.3)] p-3 rounded-lg">
                <div className="font-semibold text-[rgb(var(--text-secondary))]">{t('ui:importProgress.statsErrors')}</div>
                <div className={`text-lg font-bold ${status.errors.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {status.errors.length}
                </div>
              </div>
              <div className="bg-[rgb(var(--bg)/0.3)] p-3 rounded-lg">
                <div className="font-semibold text-[rgb(var(--text-secondary))]">{t('ui:importProgress.statsStatus')}</div>
                <div className="text-lg font-bold">
                  {status.isComplete 
                    ? (status.errors.length > 0 
                        ? t('ui:importProgress.statusCompleteWithErrors') 
                        : t('ui:importProgress.statusComplete')) 
                    : t('ui:importProgress.statusInProgress')}
                </div>
              </div>
            </div>
          )}

          {/* Lista de errores detallados (colapsable) */}
          {status.errors.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer font-semibold text-sm hover:opacity-80 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {t('ui:importProgress.errorsTitle')} ({status.errors.length})
              </summary>
              <div className="mt-3 max-h-60 overflow-y-auto border border-[rgb(var(--border))] rounded-lg p-3 bg-[rgb(var(--surface))]">
                <ul className="space-y-2">
                  {status.errors.slice(0, 10).map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-600 flex-shrink-0 mt-0.5">•</span>
                      <span className="text-sm text-red-700">{error}</span>
                    </li>
                  ))}
                  {status.errors.length > 10 && (
                    <li className="text-gray-500 text-sm italic">
                      {t('ui:importProgress.errorsMore')} {status.errors.length - 10} {t('ui:importProgress.errorsMoreSuffix')}
                    </li>
                  )}
                </ul>
              </div>
            </details>
          )}

          {/* Mensaje de límite excedido */}
          {status.limitExceeded && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-red-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-red-800">{t('ui:importProgress.limitTitle')}</p>
                  <p className="text-sm text-red-700 mt-1">
                    {t('ui:importProgress.limitMessage')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Instrucciones cuando está en progreso */}
          {!status.isComplete && (
            <div className="text-xs text-[rgb(var(--text-secondary))] italic pt-2 border-t border-[rgb(var(--border)/0.3)]">
              {t('ui:importProgress.backgroundMessage')}
            </div>
          )}
        </div>
      </InfoNote>
    </div>
  );
};

// Añadir animación CSS si no existe
const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
`;
document.head.appendChild(style);

export default ImportProgressPanel;