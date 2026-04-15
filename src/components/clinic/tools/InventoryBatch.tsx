import { useState, useMemo, useEffect } from 'react';
import { z } from 'zod';
import BASEURL from '../../../hooks/BaseUrl';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import DateInput from '../../ui/DateInput';
import InfoNote from '../../ui/InfoNote';
import SelectWithSearch from '../../ui/SelectWithSearch';
import DataTableWithSearch, { type CellConfig } from '../../common/DataTableWithSearch';
import {
  CreateConfirmationModal,
  UpdateConfirmationModal,
  DeleteConfirmationModal,
} from '../../modal/ConfirmationModals';
import { useAuthAwareFetch } from '../../../hooks/useAuthAwareFetch';
import useFetch from '../../../hooks/useFetch';
import usePost from '../../../hooks/usePost';
import useDelete from '../../../hooks/useDelete';
import { useEditableTable } from '../../../hooks/useEditableTable';
import { useLanguage } from '../../../hooks/useLanguage';
import type { Workspace } from '../../../interfaces/Workspace';
import MassiveImport from '../../ui/MassiveImport';
import ExcelTable from '../../excelTable/ExcelTable';
import { INVENTORY_BATCH_HEADERS, INVENTORY_BATCH_EXAMPLE_DATA } from '../../excelTable/inventoryBatchExample';
import { useAuth } from '../../../hooks/useAuth';

const BatchCreateSchema = z.object({
  quantity: z.coerce.number().min(0, 'La cantidad no puede ser negativa'),
  purchasePrice: z.coerce.number().min(0, 'El precio de compra debe ser positivo'),
  supplier: z.string().optional().nullable().transform(v => v ?? null),
  expirationDate: z.coerce.date().optional(),
  purchaseDate: z.coerce.date().optional(),
  batchNumber: z.string().optional().nullable().transform(v => v ?? null),
});

const BatchUpdateSchema = BatchCreateSchema.partial().extend({
  quantity: z.coerce.number().min(0).optional(),
});

type BatchPayload = z.infer<typeof BatchCreateSchema>;
type BatchUpdatePayload = z.infer<typeof BatchUpdateSchema>;

interface IInventoryItem {
  _id: string;
  name: string;
  unit: string;
}

interface IInventoryBatch {
  _id: string;
  inventoryId: string;
  quantity: number;
  purchasePrice: number;
  supplier?: string;
  expirationDate?: string;
  purchaseDate?: string;
  batchNumber?: string;
}

interface CurrentWorkspaceResponse {
  success: boolean;
  workspace: Workspace;
}

interface InventoryListResponse {
  items: IInventoryItem[];
  pagination: unknown;
}

interface BatchListResponse {
  items: IInventoryBatch[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface TableRow extends Record<string, unknown> {
  id: string;
  inventoryId: string;
  quantity: number | string;
  purchasePrice: number | string;
  supplier: string;
  expirationDate: string;
  purchaseDate: string;
  batchNumber: string;
}

interface InventoryOption extends Record<string, unknown> {
  id: string;
  value: string;
  label: string;
  subLabel: string;
}

const formatDateForInput = (dateStr?: string): string => {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
};

const InventoryBatch = () => {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateBatchId, setUpdateBatchId] = useState<string | null>(null);
  const [changedFields, setChangedFields] = useState<Partial<BatchUpdatePayload> | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteBatchId, setDeleteBatchId] = useState<string | null>(null);
  const [deleteBatchLabel, setDeleteBatchLabel] = useState<string | null>(null);

  const [tableFeedback, setTableFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const { t } = useLanguage();

  const { data: currentWorkspaceData } = useFetch<CurrentWorkspaceResponse>(
    `${BASEURL}/api/workspaces/current`
  );
  const workspaceId = currentWorkspaceData?.workspace?._id;
  const { user } = useAuth();

  const { data: inventoryResponse } = useAuthAwareFetch<InventoryListResponse>(
    workspaceId ? `${BASEURL}/api/workspaces/${workspaceId}/inventory` : '',
    [workspaceId],
    { skipInitialFetch: !workspaceId }
  );

  const inventoryOptions = useMemo<InventoryOption[]>(() => {
    return (inventoryResponse?.items ?? []).map((item) => ({
      id: item._id, // Agregamos la propiedad faltante
      value: item._id,
      label: item.name,
      subLabel: item.unit,
    }));
  }, [inventoryResponse]);

  const batchUrl = workspaceId
    ? selectedItemId
      ? `${BASEURL}/api/workspaces/${workspaceId}/inventory/${selectedItemId}/batches`
      : `${BASEURL}/api/workspaces/${workspaceId}/inventory/batches`
    : '';

  const {
    data: batchResponse,
    loading: loadingBatches,
    error: errorBatches,
    refetch,
  } = useAuthAwareFetch<BatchListResponse>(
    batchUrl,
    [workspaceId, selectedItemId],
    { skipInitialFetch: !workspaceId }
  );

  const tableDataFromBackend = useMemo<TableRow[]>(() => {
    const raw = batchResponse?.items ?? [];
    return raw.map((batch: IInventoryBatch): TableRow => ({
      id: batch._id,
      inventoryId: batch.inventoryId,
      quantity: batch.quantity ?? '',
      purchasePrice: batch.purchasePrice ?? '',
      supplier: batch.supplier ?? '',
      expirationDate: formatDateForInput(batch.expirationDate),
      purchaseDate: formatDateForInput(batch.purchaseDate),
      batchNumber: batch.batchNumber ?? '',
    }));
  }, [batchResponse]);

  const { data: tableData, handleCellChange, updateData } = useEditableTable<TableRow>(
    tableDataFromBackend
  );

  useEffect(() => {
    updateData(tableDataFromBackend);
  }, [tableDataFromBackend, updateData]);

  const { post, loading, data: postData, error: postError } = usePost<
    IInventoryBatch,
    BatchPayload
  >(
    workspaceId && selectedItemId
      ? `${BASEURL}/api/workspaces/${workspaceId}/inventory/${selectedItemId}/batches`
      : ''
  );

  const { deleteData: deleteBatch } = useDelete<{ message: string }>(
    workspaceId && selectedItemId
      ? `${BASEURL}/api/workspaces/${workspaceId}/inventory/${selectedItemId}/batches`
      : ''
  );

  const inventoryOptions_forTable = useMemo(() => {
    return (inventoryResponse?.items ?? []).map((item) => ({
      id: item._id,
      label: item.name,
      subLabel: item.unit,
      data: item,
    }));
  }, [inventoryResponse]);

  const cellConfigs = useMemo((): Partial<Record<keyof TableRow, CellConfig>> => ({
    inventoryId: {
      type: 'select',
      options: inventoryOptions_forTable,
      displayKeys: [],
    },
    quantity: { type: 'text', inputType: 'number' },
    purchasePrice: { type: 'text', inputType: 'number' },
    expirationDate: { type: 'date' },
    purchaseDate: { type: 'date' },
  }), [inventoryOptions_forTable]);

  const batchColumns = [
    { field: 'inventoryId', header: t('inventoryBatch:labels.product'), className: 'w-2/12' },
    { field: 'batchNumber', header: t('inventoryBatch:labels.batchNumber'), className: 'w-2/12' },
    { field: 'quantity', header: t('inventoryBatch:labels.quantity'), className: 'w-1/12' },
    { field: 'purchasePrice', header: t('inventoryBatch:labels.purchasePrice'), className: 'w-2/12' },
    { field: 'supplier', header: t('inventoryBatch:labels.supplier'), className: 'w-2/12' },
    { field: 'purchaseDate', header: t('inventoryBatch:labels.purchaseDate'), className: 'w-2/12' },
    { field: 'expirationDate', header: t('inventoryBatch:labels.expirationDate'), className: 'w-2/12' },
  ];

  const preparePayload = (): BatchPayload | null => {
    if (!selectedItemId) {
      setFormError(t('inventoryBatch:messages.errorNoItemSelected'));
      return null;
    }

    const raw = {
      quantity: quantity !== '' ? Number(quantity) : undefined,
      purchasePrice: purchasePrice !== '' ? Number(purchasePrice) : undefined,
      supplier: supplier.trim() || undefined,
      expirationDate: expirationDate || undefined,
      purchaseDate: purchaseDate || undefined,
      batchNumber: batchNumber.trim() || undefined,
    };

    const result = BatchCreateSchema.safeParse(raw);
    if (!result.success) {
      const msgs = result.error.issues.map((e) => e.message).join(', ');
      setFormError(msgs);
      return null;
    }
    return result.data;
  };

  const handleOpenModal = () => {
    setFormError(null);
    if (!workspaceId) {
      setFormError(t('inventoryBatch:messages.errorWorkspaceLoad'));
      return;
    }
    const payload = preparePayload();
    if (!payload) return;
    setIsModalOpen(true);
  };

  const handleConfirmCreate = async () => {
    const payload = preparePayload();
    if (!payload) return;

    await post(payload);
    setIsModalOpen(false);

    if (!postError) {
      setQuantity('');
      setPurchasePrice('');
      setSupplier('');
      setExpirationDate('');
      setPurchaseDate('');
      setBatchNumber('');
      refetch();
    }
  };

  const handleUpdate = (batchId: string) => {
    const currentBatch = tableData.find((r) => r.id === batchId);
    if (!currentBatch) {
      setFormError(t('inventoryBatch:messages.errorBatchNotFound'));
      return;
    }

    const rawBatches = batchResponse?.items ?? [];
    const originalBatch = rawBatches.find((b) => b._id === batchId);
    if (!originalBatch) {
      setFormError(t('inventoryBatch:messages.errorOriginalDataNotFound'));
      return;
    }

    const currentPayload: BatchUpdatePayload = {
      quantity: currentBatch.quantity !== '' ? Number(currentBatch.quantity) : undefined,
      purchasePrice: currentBatch.purchasePrice !== '' ? Number(currentBatch.purchasePrice) : undefined,
      supplier: String(currentBatch.supplier).trim() || null,
      expirationDate: currentBatch.expirationDate
        ? new Date(String(currentBatch.expirationDate))
        : undefined,
      purchaseDate: currentBatch.purchaseDate
        ? new Date(String(currentBatch.purchaseDate))
        : undefined,
      batchNumber: String(currentBatch.batchNumber).trim() || null,
    };

    const validation = BatchUpdateSchema.safeParse(currentPayload);
    if (!validation.success) {
      setFormError(validation.error.issues.map((e) => e.message).join(', '));
      return;
    }

    const originalPayload: BatchUpdatePayload = {
      quantity: originalBatch.quantity,
      purchasePrice: originalBatch.purchasePrice,
      supplier: originalBatch.supplier ?? null,
      expirationDate: originalBatch.expirationDate
        ? new Date(originalBatch.expirationDate)
        : undefined,
      purchaseDate: originalBatch.purchaseDate
        ? new Date(originalBatch.purchaseDate)
        : undefined,
      batchNumber: originalBatch.batchNumber ?? null,
    };

    const changes: Partial<BatchUpdatePayload> = {};
    let hasChanges = false;

    (Object.keys(currentPayload) as (keyof BatchUpdatePayload)[]).forEach((key) => {
      const curr = currentPayload[key];
      const orig = originalPayload[key];

      // Comparar fechas por valor string para evitar falsos positivos
      const currStr = curr instanceof Date ? curr.toISOString().split('T')[0] : curr;
      const origStr = orig instanceof Date ? orig.toISOString().split('T')[0] : orig;

      if (currStr !== origStr) {
        (changes as Record<string, unknown>)[key] = curr;
        hasChanges = true;
      }
    });

    if (!hasChanges) {
      alert(t('inventoryBatch:messages.noChanges'));
      return;
    }

    setChangedFields(changes);
    setUpdateBatchId(batchId);
    setIsUpdateModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    if (!updateBatchId || !changedFields) return;

    try {
      const response = await fetch(
        `${BASEURL}/api/workspaces/${workspaceId}/inventory/${selectedItemId}/batches/${updateBatchId}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changedFields),
        }
      );

      if (!response.ok) {
        throw new Error(t('inventoryBatch:messages.errorUpdate'));
      }

      const updated: IInventoryBatch = await response.json();

      updateData((prev) =>
        prev.map((row) =>
          row.id === updateBatchId
            ? {
                id: updated._id,
                inventoryId: updated.inventoryId,
                quantity: updated.quantity ?? '',
                purchasePrice: updated.purchasePrice ?? '',
                supplier: updated.supplier ?? '',
                expirationDate: formatDateForInput(updated.expirationDate),
                purchaseDate: formatDateForInput(updated.purchaseDate),
                batchNumber: updated.batchNumber ?? '',
              }
            : row
        )
      );

      setIsUpdateModalOpen(false);
      setUpdateBatchId(null);
      setChangedFields(null);
      setTableFeedback({ type: 'success', message: t('inventoryBatch:feedback.updateSuccess') });
    } catch (error) {
      console.error('Error al actualizar lote:', error);
      setTableFeedback({ type: 'error', message: t('inventoryBatch:messages.errorUpdate') });
    }
  };

  const handleDelete = (batchId: string) => {
    const batch = tableData.find((r) => r.id === batchId);
    if (!batch) {
      setFormError(t('inventoryBatch:messages.errorBatchNotFound'));
      return;
    }
    setDeleteBatchId(batchId);
    setDeleteBatchLabel(
      String(batch.batchNumber) || `Lote (cant: ${batch.quantity})`
    );
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteBatchId) return;

    try {
      await deleteBatch(deleteBatchId);
      updateData((prev) => prev.filter((row) => row.id !== deleteBatchId));
      setIsDeleteModalOpen(false);
      setDeleteBatchId(null);
      setDeleteBatchLabel(null);
      setTableFeedback({ type: 'success', message: t('inventoryBatch:feedback.deleteSuccess') });
    } catch (error) {
      console.error('Error al eliminar lote:', error);
      setTableFeedback({ type: 'error', message: t('inventoryBatch:messages.errorDelete') });
    }
  };

  const getErrorMessage = () => {
    if (formError) return formError;
    if (postError) return postError.message ?? t('inventoryBatch:messages.errorCreate');
    return null;
  };

  const errorMessage = getErrorMessage();

  if (!workspaceId) return <div>{t('inventoryBatch:messages.loadingWorkspace')}</div>;

  return (
    <div className="mx-auto">
      {/* <InfoNote variant="primary">
        <p className="font-semibold mb-2">{t('inventoryBatch:import.title') || 'Importación masiva de lotes'}</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>{t('inventoryBatch:import.accepted_formats')}</li>
          <li>{t('inventoryBatch:import.required_fields')}</li>
          <li>{t('inventoryBatch:import.optional_fields')}</li>
          <li>{t('inventoryBatch:import.date_format')}</li>
          <li>{t('inventoryBatch:import.validation')}</li>
        </ul>
      </InfoNote>

      <ExcelTable
        headers={INVENTORY_BATCH_HEADERS}
        examples={INVENTORY_BATCH_EXAMPLE_DATA}
        className="mb-8"
      />

      <MassiveImport
        entity="InventoryBatch"
        workspaceId={workspaceId}
        userId={user?._id || ''}
        baseUrl={BASEURL}
        onImportSuccess={refetch}
      /> */}

      <h2 className="text-2xl font-bold mb-6 text-[rgb(var(--text))]">
        {t('inventoryBatch:titles.form')}
      </h2>

      <div className="space-y-4">
        <SelectWithSearch
          value={selectedItemId}
          onChange={setSelectedItemId}
          label={t('inventoryBatch:labels.product')}
          options={inventoryOptions}
          placeholder={t('inventoryBatch:placeholders.product')}
          required
        />

        <Input
          type="number"
          value={quantity}
          onChange={setQuantity}
          placeholder={t('inventoryBatch:placeholders.quantity')}
          required
          label={t('inventoryBatch:labels.quantity')}
        />

        <Input
          type="number"
          value={purchasePrice}
          onChange={setPurchasePrice}
          placeholder={t('inventoryBatch:placeholders.purchasePrice')}
          required
          label={t('inventoryBatch:labels.purchasePrice')}
        />

        <Input
          type="text"
          value={supplier}
          onChange={setSupplier}
          placeholder={t('inventoryBatch:placeholders.supplier')}
          required={false}
          label={t('inventoryBatch:labels.supplier')}
        />

        <Input
          type="text"
          value={batchNumber}
          onChange={setBatchNumber}
          placeholder={t('inventoryBatch:placeholders.batchNumber')}
          required={false}
          label={t('inventoryBatch:labels.batchNumber')}
        />

        <DateInput
          value={purchaseDate}
          onChange={setPurchaseDate}
          label={t('inventoryBatch:labels.purchaseDate')}
        />

        <DateInput
          value={expirationDate}
          onChange={setExpirationDate}
          label={t('inventoryBatch:labels.expirationDate')}
        />

        <Button onClick={handleOpenModal} disabled={loading}>
          {loading
            ? t('inventoryBatch:buttons.form.submitLoading')
            : t('inventoryBatch:buttons.form.submit')}
        </Button>
      </div>

      {loading && (
        <p className="mt-4 text-blue-600">{t('inventoryBatch:feedback.creating')}</p>
      )}
      {errorMessage && (
        <p className="mt-4 text-red-600">{errorMessage}</p>
      )}
      {postData && !loading && !errorMessage && (
        <p className="mt-4 text-green-600">{t('inventoryBatch:feedback.success')}</p>
      )}
      {tableFeedback && (
        <p
          className={`mt-4 ${tableFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
        >
          {tableFeedback.message}
        </p>
      )}

      <CreateConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCreate}
        loading={loading}
        title={t('inventoryBatch:modals.create.title')}
        data={{
          product: inventoryOptions.find((o) => o.value === selectedItemId)?.label ?? selectedItemId,
          quantity,
          purchasePrice,
          supplier,
          batchNumber,
          purchaseDate,
          expirationDate,
        }}
      />

      <UpdateConfirmationModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdateBatchId(null);
          setChangedFields(null);
        }}
        onConfirm={handleConfirmUpdate}
        changedFields={changedFields}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteBatchId(null);
          setDeleteBatchLabel(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={deleteBatchLabel}
      />

      <div className="pt-4 space-y-8">
        <div className="flex justify-between items-center">
          <Button
            onClick={() => refetch()}
            variant="primary"
            >
            {t('inventoryBatch:buttons.table.refetch')}
          </Button>
        </div>

        {loadingBatches ? (
          <p className="p-8 text-center text-gray-500">
            {t('inventoryBatch:messages.loadingBatches')}
          </p>
        ) : errorBatches ? (
          <p className="text-red-600">{t('inventoryBatch:messages.errorLoad')}</p>
        ) : (
          <DataTableWithSearch
            title={t('inventoryBatch:titles.table')}
            data={tableData}
            columns={batchColumns}
            cellConfigs={cellConfigs}
            onCellChange={handleCellChange}
            onRowUpdate={handleUpdate}
            onRowDelete={handleDelete}
            searchPlaceholder={t('inventoryBatch:placeholders.search')}
            emptyMessage={t('inventoryBatch:messages.emptyTable')}
            height="70vh"
          />
        )}

      </div>
    </div>
  );
};

export default InventoryBatch;