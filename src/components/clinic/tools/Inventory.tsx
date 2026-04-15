import { useState, useMemo, useEffect } from 'react';
import { z } from 'zod';
import BASEURL from '../../../hooks/BaseUrl';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Button from '../../ui/Button';
// import InfoNote from '../../ui/InfoNote';
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
// import { useAuth } from '../../../hooks/useAuth';
import type { Workspace } from '../../../interfaces/Workspace';
// import MassiveImport from '../../ui/MassiveImport';
// import ExcelTable from '../../excelTable/ExcelTable';
// import { INVENTORY_EXAMPLE_DATA, INVENTORY_HEADERS } from '../../excelTable/inventoryExample';

const InventoryCreateSchema = z.object({
  name: z.string().min(1, 'El nombre del producto es obligatorio'),
  category: z
    .enum(['medicamento', 'alimento', 'accesorio', 'equipo', 'otro'])
    .default('otro'),
  description: z.string().optional(),
  unit: z
    .enum(['unidad', 'caja', 'kg', 'g', 'ml', 'litro', 'frasco', 'sobre', 'otro'])
    .default('unidad'),
  sellingPrice: z.coerce.number().min(0).optional(),
  lowStockThreshold: z.coerce.number().min(0).optional(),
});

const InventoryUpdateSchema = InventoryCreateSchema.partial();

type InventoryPayload = z.infer<typeof InventoryCreateSchema>;
type InventoryUpdatePayload = z.infer<typeof InventoryUpdateSchema>;

interface IInventoryItem {
  _id: string;
  name: string;
  category: string;
  description?: string;
  unit: string;
  sellingPrice?: number;
  lowStockThreshold?: number;
  currentStock?: number;
}

interface CurrentWorkspaceResponse {
  success: boolean;
  workspace: Workspace;
}

interface InventoryListResponse {
  items: IInventoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface TableRow extends Record<string, unknown> {
  id: string;
  name: string;
  category: string;
  description: string;
  unit: string;
  sellingPrice: number | string;
  lowStockThreshold: number | string;
  currentStock: number | string;
}

type CategoryType = z.infer<typeof InventoryCreateSchema>['category'];
type UnitType = z.infer<typeof InventoryCreateSchema>['unit'];

const Inventory = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('otro');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState<string>('unidad');
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [lowStockThreshold, setLowStockThreshold] = useState<string>('');

  const [formError, setFormError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateItemId, setUpdateItemId] = useState<string | null>(null);
  const [changedFields, setChangedFields] = useState<Partial<InventoryUpdatePayload> | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteItemName, setDeleteItemName] = useState<string | null>(null);

  const [tableFeedback, setTableFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const { t } = useLanguage();

  const categoryOptions = [
    { value: 'medicamento', label: t('inventory:categories.medicamento') },
    { value: 'alimento', label: t('inventory:categories.alimento') },
    { value: 'accesorio', label: t('inventory:categories.accesorio') },
    { value: 'equipo', label: t('inventory:categories.equipo') },
    { value: 'otro', label: t('inventory:categories.otro') },
  ];

  const unitOptions = [
    { value: 'unidad', label: t('inventory:units.unidad') },
    { value: 'caja', label: t('inventory:units.caja') },
    { value: 'kg', label: t('inventory:units.kg') },
    { value: 'g', label: t('inventory:units.g') },
    { value: 'ml', label: t('inventory:units.ml') },
    { value: 'litro', label: t('inventory:units.litro') },
    { value: 'frasco', label: t('inventory:units.frasco') },
    { value: 'sobre', label: t('inventory:units.sobre') },
    { value: 'otro', label: t('inventory:units.otro') },
  ];

  const { data: currentWorkspaceData } = useFetch<CurrentWorkspaceResponse>(
    `${BASEURL}/api/workspaces/current`
  );
  const workspaceId = currentWorkspaceData?.workspace?._id;
  // const { user } = useAuth();

  const {
    data: inventoryResponse,
    loading: loadingInventory,
    error: errorInventory,
    refetch,
  } = useAuthAwareFetch<InventoryListResponse>(
    workspaceId ? `${BASEURL}/api/workspaces/${workspaceId}/inventory` : '',
    [workspaceId],
    { skipInitialFetch: !workspaceId }
  );

  const tableDataFromBackend = useMemo<TableRow[]>(() => {
    const raw = inventoryResponse?.items ?? [];
    return raw.map((item: IInventoryItem): TableRow => ({
      id: item._id,
      name: item.name ?? '',
      category: item.category ?? '',
      description: item.description ?? '',
      unit: item.unit ?? '',
      sellingPrice: item.sellingPrice ?? '',
      lowStockThreshold: item.lowStockThreshold ?? '',
      currentStock: item.currentStock ?? 0,
    }));
  }, [inventoryResponse]);

  const { data: tableData, handleCellChange, updateData } = useEditableTable<TableRow>(
    tableDataFromBackend
  );

  useEffect(() => {
    updateData(tableDataFromBackend);
  }, [tableDataFromBackend, updateData]);

  const { post, loading, data: postData, error: postError } = usePost<
    IInventoryItem,
    InventoryPayload
  >(`${BASEURL}/api/workspaces/${workspaceId}/inventory`);

  const { deleteData: deleteItem } = useDelete<{ message: string }>(
    `${BASEURL}/api/workspaces/${workspaceId}/inventory`
  );

  const inventoryColumns = [
    { field: 'name', header: t('inventory:labels.name'), className: 'w-2/12' },
    { field: 'category', header: t('inventory:labels.category'), className: 'w-2/12' },
    { field: 'unit', header: t('inventory:labels.unit'), className: 'w-1/12' },
    { field: 'sellingPrice', header: t('inventory:labels.sellingPrice'), className: 'w-2/12' },
    { field: 'lowStockThreshold', header: t('inventory:labels.lowStockThreshold'), className: 'w-2/12' },
    { field: 'currentStock', header: t('inventory:labels.currentStock'), className: 'w-2/12' },
    { field: 'description', header: t('inventory:labels.description'), className: 'w-4/12', multiline: true },
  ];

  // @ts-expect-error: Error de tipado
  const cellConfigs = useMemo((): Partial<Record<keyof TableRow, CellConfig>> => ({
    category: {
      type: 'select',
      options: categoryOptions.map((opt) => ({
        id: opt.value,
        label: opt.label,
        subLabel: '',
        data: opt,
      })),
      displayKeys: [],
    },
    unit: {
      type: 'select',
      options: unitOptions.map((opt) => ({
        id: opt.value,
        label: opt.label,
        subLabel: '',
        data: opt,
      })),
      displayKeys: [],
    },
    sellingPrice: { type: 'text', inputType: 'number' },
    lowStockThreshold: { type: 'text', inputType: 'number' },
    description: { type: 'text', multiline: true, rows: 2 },
  }), [categoryOptions, unitOptions]);

  const preparePayload = (): InventoryPayload | null => {
    const raw = {
      name: name.trim(),
      category,
      description: description.trim() || undefined,
      unit,
      sellingPrice: sellingPrice !== '' ? Number(sellingPrice) : undefined,
      lowStockThreshold: lowStockThreshold !== '' ? Number(lowStockThreshold) : undefined,
    };

    const result = InventoryCreateSchema.safeParse(raw);
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
      setFormError(t('inventory:messages.errorWorkspaceLoad'));
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
      setName('');
      setCategory('otro');
      setDescription('');
      setUnit('unidad');
      setSellingPrice('');
      setLowStockThreshold('');
      refetch();
    }
  };

  const handleUpdate = (itemId: string) => {
    const currentItem = tableData.find((r) => r.id === itemId);
    if (!currentItem) {
      setFormError(t('inventory:messages.errorItemNotFound'));
      return;
    }

    const rawItems = inventoryResponse?.items ?? [];
    const originalItem = rawItems.find((i) => i._id === itemId);
    if (!originalItem) {
      setFormError(t('inventory:messages.errorOriginalDataNotFound'));
      return;
    }

    const currentPayload: InventoryUpdatePayload = {
      name: String(currentItem.name).trim(),
      category: String(currentItem.category) as CategoryType,
      description: String(currentItem.description).trim() || undefined,
      unit: String(currentItem.unit) as UnitType,
      sellingPrice:
        currentItem.sellingPrice !== '' ? Number(currentItem.sellingPrice) : undefined,
      lowStockThreshold:
        currentItem.lowStockThreshold !== ''
          ? Number(currentItem.lowStockThreshold)
          : undefined,
    };

    const validation = InventoryUpdateSchema.safeParse(currentPayload);
    if (!validation.success) {
      const errorMessages = validation.error.issues.map((issue) => issue.message).join(', ');
      setFormError(errorMessages);
    }

    const originalPayload: InventoryUpdatePayload = {
      name: originalItem.name,
      category: originalItem.category as CategoryType,
      description: originalItem.description,
      unit: originalItem.unit as UnitType,
      sellingPrice: originalItem.sellingPrice,
      lowStockThreshold: originalItem.lowStockThreshold,
    };

    const changes: Partial<InventoryUpdatePayload> = {};
    let hasChanges = false;

    (Object.keys(currentPayload) as (keyof InventoryUpdatePayload)[]).forEach((key) => {
      if (currentPayload[key] !== originalPayload[key]) {
        (changes as Record<string, unknown>)[key] = currentPayload[key];
        hasChanges = true;
      }
    });

    if (!hasChanges) {
      alert(t('inventory:messages.noChanges'));
      return;
    }

    setChangedFields(changes);
    setUpdateItemId(itemId);
    setIsUpdateModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    if (!updateItemId || !changedFields) return;

    try {
      const response = await fetch(
        `${BASEURL}/api/workspaces/${workspaceId}/inventory/${updateItemId}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changedFields),
        }
      );

      if (!response.ok) {
        throw new Error(t('inventory:messages.errorUpdate'));
      }

      const updated: IInventoryItem = await response.json();

      updateData((prev) =>
        prev.map((row) =>
          row.id === updateItemId
            ? {
                id: updated._id,
                name: updated.name ?? '',
                category: updated.category ?? '',
                description: updated.description ?? '',
                unit: updated.unit ?? '',
                sellingPrice: updated.sellingPrice ?? '',
                lowStockThreshold: updated.lowStockThreshold ?? '',
                currentStock: updated.currentStock ?? 0,
              }
            : row
        )
      );

      setIsUpdateModalOpen(false);
      setUpdateItemId(null);
      setChangedFields(null);
      setTableFeedback({ type: 'success', message: t('inventory:feedback.updateSuccess') });
    } catch (error) {
      console.error('Error al actualizar:', error);
      setTableFeedback({ type: 'error', message: t('inventory:messages.errorUpdate') });
    }
  };

  const handleDelete = (itemId: string) => {
    const item = tableData.find((r) => r.id === itemId);
    if (!item) {
      setFormError(t('inventory:messages.errorItemNotFound'));
      return;
    }
    setDeleteItemId(itemId);
    setDeleteItemName(String(item.name));
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      await deleteItem(deleteItemId);
      updateData((prev) => prev.filter((row) => row.id !== deleteItemId));
      setIsDeleteModalOpen(false);
      setDeleteItemId(null);
      setDeleteItemName(null);
      setTableFeedback({ type: 'success', message: t('inventory:feedback.deleteSuccess') });
    } catch (error) {
      console.error('Error al eliminar:', error);
      setTableFeedback({ type: 'error', message: t('inventory:messages.errorDelete') });
    }
  };

  const getErrorMessage = () => {
    if (formError) return formError;
    if (postError) return postError.message ?? t('inventory:messages.errorCreate');
    return null;
  };

  const errorMessage = getErrorMessage();

  if (!workspaceId) return <div>{t('inventory:messages.loadingWorkspace')}</div>;
  if (errorInventory) return <div className="text-red-600">{t('inventory:messages.errorLoad')}</div>;
  if (loadingInventory && !tableData.length) {
    return <div className="p-8 text-center text-gray-500">{t('inventory:messages.loadingInventory')}</div>;
  }

  return (
    <div className="mx-auto">
      {/* <InfoNote variant="primary">
        <p className="font-semibold mb-2">{t('inventory:import.title')}</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>{t('inventory:import.accepted_formats')}</li>
          <li>{t('inventory:import.required_fields')}</li>
          <li>{t('inventory:import.optional_fields')}</li>
          <li>{t('inventory:import.validation')}</li>
          <li>{t('inventory:import.units')}</li>
          <li>{t('inventory:import.example')}</li>
        </ul>
      </InfoNote>

      <ExcelTable
        headers={INVENTORY_HEADERS}
        examples={INVENTORY_EXAMPLE_DATA}
        className="mb-8"
      />

      <MassiveImport
        entity="Inventory"
        workspaceId={workspaceId}
        userId={user?._id || ''}
        baseUrl={BASEURL}
        onImportSuccess={refetch}
      /> */}

      <h2 className="text-2xl font-bold mb-6 text-[rgb(var(--text))]">{t('inventory:titles.form')}</h2>

      <div className="space-y-4">
        <Input
          type="text"
          value={name}
          onChange={setName}
          placeholder={t('inventory:placeholders.name')}
          required
          label={t('inventory:labels.name')}
        />

        <Select
          value={category}
          onChange={setCategory}
          label={t('inventory:labels.category')}
          options={categoryOptions}
        />

        <Input
          type="text"
          value={description}
          onChange={setDescription}
          placeholder={t('inventory:placeholders.description')}
          required={false}
          label={t('inventory:labels.description')}
          multiline
          rows={2}
        />

        <Select
          value={unit}
          onChange={setUnit}
          label={t('inventory:labels.unit')}
          options={unitOptions}
        />

        <Input
          type="number"
          value={sellingPrice}
          onChange={setSellingPrice}
          placeholder={t('inventory:placeholders.sellingPrice')}
          required={false}
          label={t('inventory:labels.sellingPrice')}
        />

        <Input
          type="number"
          value={lowStockThreshold}
          onChange={setLowStockThreshold}
          placeholder={t('inventory:placeholders.lowStockThreshold')}
          required={false}
          label={t('inventory:labels.lowStockThreshold')}
        />

        <Button onClick={handleOpenModal} disabled={loading}>
          {loading ? t('inventory:buttons.form.submitLoading') : t('inventory:buttons.form.submit')}
        </Button>
      </div>

      {loading && (
        <p className="mt-4 text-blue-600">{t('inventory:feedback.creating')}</p>
      )}
      {errorMessage && (
        <p className="mt-4 text-red-600">{errorMessage}</p>
      )}
      {postData && !loading && !errorMessage && (
        <p className="mt-4 text-green-600">{t('inventory:feedback.success')}</p>
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
        title={t('inventory:modals.create.title')}
        data={{ name, category, unit, sellingPrice, lowStockThreshold, description }}
      />

      <UpdateConfirmationModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdateItemId(null);
          setChangedFields(null);
        }}
        onConfirm={handleConfirmUpdate}
        changedFields={changedFields}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteItemId(null);
          setDeleteItemName(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={deleteItemName}
      />

      <div className="pt-4 space-y-8">
        <div className="flex justify-between items-center">
          <Button onClick={() => refetch()} variant="primary">
            {t('inventory:buttons.table.refetch')}
          </Button>
        </div>

        <DataTableWithSearch
          title={t('inventory:titles.table')}
          data={tableData}
          columns={inventoryColumns}
          cellConfigs={cellConfigs}
          onCellChange={handleCellChange}
          onRowUpdate={handleUpdate}
          onRowDelete={handleDelete}
          searchPlaceholder={t('inventory:placeholders.search')}
          emptyMessage={t('inventory:messages.emptyTable')}
          height="70vh"
        />
      </div>
    </div>
  );
};

export default Inventory;