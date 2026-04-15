// src/components/clinic/tools/MassiveImport.tsx

import { useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useLanguage } from '../../hooks/useLanguage';
import InfoNote from './InfoNote';
import { DragAndDropImport } from './DragAndDropImport';
import ImportProgressPanel from './ImportProgressPanel';
import type { ImportStatus } from './ImportProgressPanel';
import Button from './Button';

interface MassiveImportProps {
  entity: 'Owner' | 'Patient' | 'WorkspaceMember' | 'Appointment' | 'ClinicalRecord' | 'Inventory' | 'InventoryBatch' | 'Service';
  workspaceId: string;
  userId: string;
  baseUrl: string;
  onImportSuccess: () => void;
}

const MassiveImport = ({ entity, workspaceId, userId, baseUrl, onImportSuccess }: MassiveImportProps) => {
  const { t } = useLanguage();

  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>({
    isVisible: false,
    total: 0,
    imported: 0,
    errors: [],
    message: '',
    isComplete: false,
    limitExceeded: false,
  });

  const [errorMessage, setErrorMessage] = useState<string>(''); // para errores generales

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleImport = async () => {
    if (!fileToUpload || !workspaceId || !userId) {
      setErrorMessage(t('common:massiveImport.errorMissingData'));
      return;
    }

    setErrorMessage('');
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);

    // Abrimos el panel de progreso
    setImportStatus(prev => ({
      ...prev,
      isVisible: true,
      message: t('common:massiveImport.progressMessage'),
      errors: []
    }));

    try {
      const importPath = entity.toLowerCase() + 's';
      const response = await fetch(`${baseUrl}/api/workspaces/${workspaceId}/import/${importPath}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) throw new Error(t('common:massiveImport.errorUpload'));

      socketRef.current = io(baseUrl, {
        withCredentials: true,
        transports: ['polling', 'websocket'],
        reconnectionAttempts: 3,
        timeout: 20000,
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        socket.emit('join-import-room', { workspaceId, userId, entity });
      });

      socket.on('import:progress', (data) => {
        setImportStatus(prev => ({
          ...prev,
          total: data.totalRows || prev.total,
          imported: data.imported || prev.imported,
          message: data.message,
          limitExceeded: data.type === 'limit_exceeded',
          isComplete: data.type === 'complete' || data.type === 'limit_exceeded',
          errors: data.errors && Array.isArray(data.errors)
            ? [...prev.errors, ...data.errors].filter(Boolean)
            : prev.errors
        }));

        if (data.type === 'complete' || data.type === 'limit_exceeded') {
          setTimeout(() => {
            socket.disconnect();
            socketRef.current = null;

            if (data.success) {
              onImportSuccess();
              setImportStatus(prev => ({
                ...prev,
                message: `${t('common:massiveImport.successMessage')} ${data.imported} ${t('common:massiveImport.successOf')} ${data.totalRows} ${t('common:massiveImport.successRecords')}`
              }));
            } else {
              setImportStatus(prev => ({
                ...prev,
                message: `${t('common:massiveImport.failMessage')} ${data.errors?.length || 0} ${t('common:massiveImport.failErrors')}`
              }));
            }
          }, 2000);
        }
      });

    } catch (error) {
      setImportStatus(prev => ({
        ...prev,
        message: `${t('common:massiveImport.errorUpload')}: ${(error as Error).message}`,
        isComplete: true,
        errors: [...prev.errors, (error as Error).message]
      }));
    }
  };

  const clearImportStatus = () => {
    setImportStatus({
      isVisible: false,
      total: 0,
      imported: 0,
      errors: [],
      message: '',
      isComplete: false,
      limitExceeded: false,
    });
    setErrorMessage('');
  };

  // Título dinámico según la entidad
  const getPanelTitle = () => {
    const key = `common:massiveImport.panelTitle${entity}`;
    return t(key as string) || t('common:massiveImport.panelTitleDefault');
  };

  return (
    <div className="space-y-6 p-6 bg-[rgb(var(--surface))] rounded-xl border border-[rgb(var(--border))]">

      <h3 className="text-xl font-bold text-[rgb(var(--text))]">
        {t('common:massiveImport.title')}
      </h3>

      <InfoNote variant="warning">
        <p className="text-sm">
          <strong>{t('common:massiveImport.planNoteLabel')}</strong>{' '}
          {t('common:massiveImport.planNote')}
        </p>
      </InfoNote>

      {errorMessage && (
        <InfoNote variant="warning">
          {errorMessage}
        </InfoNote>
      )}

      <DragAndDropImport
        onFileSelect={(file) => {
          setFileToUpload(file);
          if (importStatus.isVisible) {
            clearImportStatus();
          }
        }}
        maxSizeMB={2}
        disabled={importStatus.isVisible && !importStatus.isComplete}
      />

      <Button
        onClick={handleImport}
        disabled={!fileToUpload || (importStatus.isVisible && !importStatus.isComplete)}
        className="w-full"
      >
        {importStatus.isVisible && !importStatus.isComplete
          ? t('common:massiveImport.buttonImporting')
          : t('common:massiveImport.buttonProcess')}
      </Button>

      <ImportProgressPanel
        status={importStatus}
        onClose={clearImportStatus}
        title={getPanelTitle()}
      />
    </div>
  );
};

export default MassiveImport;