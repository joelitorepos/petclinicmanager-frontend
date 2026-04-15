// src/components/table/PhotoArrayCell.tsx

import { useState, useMemo, useEffect } from "react";
import Modal from "./ModalForCell";
import FileInput from "../ui/FileInput";
import InfoNote from "../ui/InfoNote";
import { useLanguage } from "../../hooks/useLanguage";
import BASE_IMAGE_URL from "../../utils/URL";

interface PhotoData {
  url: string;
  key: string;
}

export interface PhotoChangePayload {
  newFiles?: File[];
  deleteKeys?: string[];
  removeAll?: boolean;
}

interface PhotoArrayCellProps {
  id: string;
  value: string | File[] | null; // JSON stringified PhotoData[] — nunca se reemplaza con payload de control
  fieldName: string;
  fieldNameTranslated: string;
  onDataChange: (
    id: string,
    fieldName: string,
    payload: PhotoChangePayload | null,
  ) => void;
  className?: string;
  editable?: boolean;
  maxFiles?: number;
}

interface BackendPhotoItem {
  url?: string;
  key?: string;
}

const PhotoArrayCell = ({
  id,
  value,
  fieldName,
  fieldNameTranslated,
  onDataChange,
  className = "",
  editable = true,
  maxFiles = 10,
}: PhotoArrayCellProps) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);

  // Estado del modal de edición (se descarta al cancelar)
  const [tempFiles, setTempFiles] = useState<File[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

  // Borrados ya confirmados por el usuario (guardó el modal) pero aún no
  // enviados al backend. Nos permiten mostrar la celda correctamente sin
  // corromper el value prop que sigue siendo el JSON original del backend.
  const [committedDeleteKeys, setCommittedDeleteKeys] = useState<string[]>([]);
  // Fotos nuevas ya confirmadas por el usuario (pendientes de PATCH)
  const [committedNewFiles, setCommittedNewFiles] = useState<File[]>([]);

  const { t } = useLanguage();

  // Parsear las fotos que vienen del backend (value siempre es string JSON)
  const currentPhotos = useMemo((): PhotoData[] => {
    if (
      !value ||
      (Array.isArray(value) && (value.length === 0 || value[0] instanceof File))
    )
      return [];

    if (typeof value === "object" && !Array.isArray(value)) return [];

    try {
      if (typeof value === "string") {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          // --- SOLUCIÓN AL 'any' (Línea 79) ---
          return parsed
            .map((item: BackendPhotoItem | string): PhotoData | null => {
              if (typeof item === "object" && item !== null && "key" in item) {
                let finalUrl = item.url || "";
                if (
                  item.url?.includes("r2.cloudflarestorage.com") ||
                  !item.url?.startsWith("http")
                ) {
                  finalUrl = `${BASE_IMAGE_URL}/${item.key}`;
                }
                return { url: finalUrl, key: item.key || "" };
              } else if (typeof item === "string" && item.startsWith("http")) {
                return { url: item, key: "" };
              }
              return null;
            })
            .filter((item): item is PhotoData => item !== null);
        }
      }
    } catch (e) {
      console.warn("Error parsing photo array:", e);
    }
    return [];
  }, [value]);

  // Fotos visibles en la celda: las del backend menos las ya borradas (confirmadas)
  const cellVisiblePhotos = useMemo(
    () => currentPhotos.filter((p) => !committedDeleteKeys.includes(p.key)),
    [currentPhotos, committedDeleteKeys],
  );

  // Fotos visibles dentro del modal de edición (descuenta borrados temporales)
  const modalVisiblePhotos = useMemo(
    () => currentPhotos.filter((p) => !filesToRemove.includes(p.key)),
    [currentPhotos, filesToRemove],
  );

  // URLs temporales para preview dentro del modal
  const tempUrls = useMemo(
    () => tempFiles.map((file) => URL.createObjectURL(file)),
    [tempFiles],
  );

  // URLs de fotos nuevas ya confirmadas (para mostrar en la celda)
  const committedNewUrls = useMemo(
    () => committedNewFiles.map((f) => URL.createObjectURL(f)),
    [committedNewFiles],
  );

  useEffect(() => {
    return () => {
      tempUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [tempUrls]);

  useEffect(() => {
    return () => {
      committedNewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [committedNewUrls]);

  // Cuando llega un value nuevo del backend (tras refetch), limpiar estado pendiente
  const [prevValue, setPrevValue] = useState(value);

  // Si el value que viene por props es distinto al que teníamos guardado,
  // reseteamos los estados comprometidos directamente en la fase de renderizado.
  if (value !== prevValue) {
    setPrevValue(value);
    setCommittedDeleteKeys([]);
    setCommittedNewFiles([]);
  }

  const totalCellPhotos = cellVisiblePhotos.length + committedNewFiles.length;
  const hasPhotos = totalCellPhotos > 0;

  const displayText = hasPhotos
    ? `${totalCellPhotos} ${totalCellPhotos === 1 ? t("ui:photo.singular") || "foto" : t("ui:photo.plural") || "fotos"}`
    : t("ui:placeholders.noPhotos") || "Sin fotos";

  const totalModalPhotos = modalVisiblePhotos.length + tempFiles.length;

  // ── Handlers del modal ────────────────────────────────────────────────────

  const handleClick = () => {
    if (hasPhotos) {
      setCurrentViewIndex(0);
      setIsViewerOpen(true);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editable) return;
    // Al abrir el editor, iniciar los temporales desde el estado confirmado actual
    setFilesToRemove([...committedDeleteKeys]);
    setTempFiles([...committedNewFiles]);
    setIsEditorOpen(true);
  };

  const handleFilesChange = (files: File[]) => {
    const remainingSlots = maxFiles - modalVisiblePhotos.length;
    const filesToAdd = files.slice(0, remainingSlots);
    setTempFiles((prev) => [...prev, ...filesToAdd].slice(0, remainingSlots));
  };

  const handleRemoveTempFile = (index: number) => {
    setTempFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMarkForRemoval = (photoKey: string) => {
    setFilesToRemove((prev) =>
      prev.includes(photoKey)
        ? prev.filter((key) => key !== photoKey)
        : [...prev, photoKey],
    );
  };

  const handleSave = () => {
    const isRemoveAll =
      filesToRemove.length === currentPhotos.length && tempFiles.length === 0;

    const payload: PhotoChangePayload = {};

    if (isRemoveAll) {
      payload.removeAll = true;
    } else {
      if (filesToRemove.length > 0) payload.deleteKeys = [...filesToRemove];
    }

    if (tempFiles.length > 0) payload.newFiles = [...tempFiles];

    // Actualizar estado comprometido para que la celda refleje los cambios
    // sin esperar al refetch del backend
    if (isRemoveAll) {
      setCommittedDeleteKeys(currentPhotos.map((p) => p.key));
      setCommittedNewFiles(tempFiles.length > 0 ? [...tempFiles] : []);
    } else {
      setCommittedDeleteKeys([...filesToRemove]);
      setCommittedNewFiles([...tempFiles]);
    }

    // Solo notificar al padre si hay algo que cambiar
    if (Object.keys(payload).length > 0) {
      onDataChange(id, fieldName, payload);
    } else {
      onDataChange(id, fieldName, null);
    }

    setIsEditorOpen(false);
    setTempFiles([]);
    setFilesToRemove([]);
  };

  const handleCancel = () => {
    setTempFiles([]);
    setFilesToRemove([]);
    setIsEditorOpen(false);
  };

  const handleRemoveAll = () => {
    if (
      window.confirm(
        t("ui:confirm.removeAllPhotos") ||
          "¿Estás seguro de eliminar todas las fotos? Esto consumirá operaciones de imagen.",
      )
    ) {
      setTempFiles([]);
      setFilesToRemove(currentPhotos.map((p) => p.key));
    }
  };

  // ── Navegación visor ──────────────────────────────────────────────────────

  const handlePrevious = () => {
    setCurrentViewIndex((prev) => (prev > 0 ? prev - 1 : totalCellPhotos - 1));
  };

  const handleNext = () => {
    setCurrentViewIndex((prev) => (prev < totalCellPhotos - 1 ? prev + 1 : 0));
  };

  const getCurrentViewPhoto = () => {
    if (currentViewIndex < cellVisiblePhotos.length) {
      return {
        type: "existing" as const,
        data: cellVisiblePhotos[currentViewIndex],
      };
    }
    const tempIndex = currentViewIndex - cellVisiblePhotos.length;
    return {
      type: "temp" as const,
      data: committedNewUrls[tempIndex],
      file: committedNewFiles[tempIndex],
    };
  };

  const currentViewPhoto = getCurrentViewPhoto();

  return (
    <div
      className={`flex-1 min-w-0 p-3 border border-transparent cursor-pointer bg-[rgb(var(--surface))]
                 overflow-hidden flex items-center gap-3 transition-colors ${className}
                 ${
                   editable
                     ? "hover:border-[rgb(var(--text-secondary))]"
                     : "hover:border-[rgb(var(--text))]"
                 }`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      title="Click para ver · Doble click para editar fotos"
    >
      {hasPhotos && (
        <div className="flex gap-2 flex-shrink-0">
          {cellVisiblePhotos.slice(0, 3).map((photo, idx) => (
            <div
              key={photo.key || idx}
              className="w-12 h-12 rounded-lg overflow-hidden border border-[rgb(var(--border))]"
            >
              <img
                src={photo.url}
                alt={`Preview ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {committedNewFiles
            .slice(0, 3 - cellVisiblePhotos.length)
            .map((file, idx) => (
              <div
                key={`committed-${idx}`}
                className="w-12 h-12 rounded-lg overflow-hidden border border-green-500"
              >
                <img
                  src={committedNewUrls[idx]}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          {totalCellPhotos > 3 && (
            <div className="w-12 h-12 rounded-lg bg-[rgb(var(--surface-hover))] border border-[rgb(var(--border))] flex items-center justify-center">
              <span className="text-xs font-medium text-[rgb(var(--text-secondary))]">
                +{totalCellPhotos - 3}
              </span>
            </div>
          )}
        </div>
      )}

      <span
        className={`text-sm ${
          hasPhotos
            ? "text-[rgb(var(--text))] font-medium"
            : "text-[rgb(var(--text-secondary))] italic"
        } truncate`}
      >
        {displayText}
      </span>

      {/* Modal de vista */}
      <Modal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        title={`${fieldNameTranslated} (${currentViewIndex + 1}/${totalCellPhotos})`}
      >
        <div className="p-6 flex flex-col items-center max-w-4xl">
          {hasPhotos && (
            <>
              <div className="relative w-full">
                <img
                  src={
                    currentViewPhoto.type === "existing"
                      ? currentViewPhoto.data.url
                      : currentViewPhoto.data
                  }
                  alt={`Foto ${currentViewIndex + 1}`}
                  className="max-w-full max-h-[70vh] rounded-lg shadow-2xl object-contain mx-auto"
                />

                {totalCellPhotos > 1 && (
                  <>
                    <button
                      onClick={handlePrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                      aria-label="Anterior"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                      aria-label="Siguiente"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              <p className="mt-6 text-lg font-medium text-[rgb(var(--text))]">
                {currentViewPhoto.type === "temp"
                  ? currentViewPhoto.file?.name
                  : t("ui:photo.current") || "Foto actual"}
              </p>
            </>
          )}
        </div>
      </Modal>

      {/* Modal de edición */}
      <Modal
        isOpen={isEditorOpen}
        onClose={handleCancel}
        title={`${t("ui:modals.titleEdit")} ${fieldNameTranslated}`}
      >
        <div className="p-6 space-y-6 min-w-[500px] max-w-3xl">
          <InfoNote variant="warning">
            {t("ui:warnings.imageOperations") ||
              'Eliminar o modificar imágenes consumirá "imageOperationsPerMonth". Si llegas al límite, no podrás realizar operaciones como crear, eliminar o modificar imágenes.'}
          </InfoNote>

          {/* Fotos actuales */}
          {modalVisiblePhotos.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-[rgb(var(--text))]">
                  {t("ui:photo.current") || "Fotos actuales"} (
                  {modalVisiblePhotos.length})
                </h3>
                <button
                  onClick={handleRemoveAll}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  {t("ui:buttons.removeAll") || "Eliminar todas"}
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {currentPhotos.map((photo) => {
                  const isMarked = filesToRemove.includes(photo.key);
                  return (
                    <div
                      key={photo.key}
                      className={`relative group ${isMarked ? "opacity-50" : ""}`}
                    >
                      <img
                        src={photo.url}
                        alt="Current"
                        className="w-full h-24 rounded-lg object-cover border border-[rgb(var(--border))]"
                      />
                      <button
                        onClick={() => handleMarkForRemoval(photo.key)}
                        className={`absolute top-1 right-1 p-1 rounded-full transition-colors ${
                          isMarked
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700"
                        } text-white opacity-0 group-hover:opacity-100`}
                        title={isMarked ? "Restaurar" : "Marcar para eliminar"}
                      >
                        {isMarked ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fotos nuevas temporales */}
          {tempFiles.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-[rgb(var(--text))] mb-3">
                {t("ui:photo.new") || "Fotos nuevas"} ({tempFiles.length})
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {tempFiles.map((file, idx) => (
                  <div key={`temp-${idx}`} className="relative group">
                    <img
                      src={tempUrls[idx]}
                      alt={file.name}
                      className="w-full h-24 rounded-lg object-cover border-2 border-green-500"
                    />
                    <button
                      onClick={() => handleRemoveTempFile(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <p className="text-xs text-[rgb(var(--text-secondary))] mt-1 truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input para agregar más fotos */}
          {totalModalPhotos < maxFiles && (
            <div>
              <FileInput
                value={null}
                onChange={(files) => {
                  if (files) {
                    const fileArray = Array.isArray(files) ? files : [files];
                    handleFilesChange(fileArray);
                  }
                }}
                accept="image/*"
                multiple
                placeholder={
                  t("ui:placeholders.addPhotos") ||
                  `Agregar fotos (${totalModalPhotos}/${maxFiles})`
                }
              />
              <p className="text-xs text-[rgb(var(--text-secondary))] mt-2">
                {t("ui:photo.remainingSlots") ||
                  `Puedes agregar ${maxFiles - totalModalPhotos} fotos más`}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[rgb(var(--border))]">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-[rgb(var(--text))] bg-[rgb(var(--surface-hover))] rounded-lg hover:opacity-80 transition-colors text-sm font-medium"
            >
              {t("ui:buttons.cancel") || "Cancelar"}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] transition-colors text-sm font-medium shadow-md"
              disabled={tempFiles.length === 0 && filesToRemove.length === 0}
            >
              {t("ui:buttons.save") || "Guardar"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PhotoArrayCell;
