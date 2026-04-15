import { useState, useMemo, useEffect } from 'react';
import { z } from 'zod';
import BASEURL from '../../../hooks/BaseUrl';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Button from '../../ui/Button';
import InfoNote from '../../ui/InfoNote';
import Checkbox from '../../ui/Checkbox';
import DataTableWithSearch from '../../common/DataTableWithSearch';
import {
  CreateConfirmationModal,
  UpdateConfirmationModal,
  DeleteConfirmationModal,
} from '../../modal/ConfirmationModals';
import MassiveImport from '../../ui/MassiveImport';
import ExcelTable from '../../excelTable/ExcelTable';
import { SERVICES_HEADERS, SERVICE_EXAMPLE_DATA } from '../../excelTable/serviceExample';
import { useAuthAwareFetch } from '../../../hooks/useAuthAwareFetch';
import useFetch from '../../../hooks/useFetch';
import usePost from '../../../hooks/usePost';
import useDelete from '../../../hooks/useDelete';
import { useEditableTable } from '../../../hooks/useEditableTable';
import { useLanguage } from '../../../hooks/useLanguage';
import type { Workspace } from '../../../interfaces/Workspace';
import type { IService, ServiceListResponse } from '../../../interfaces/Service';
import type { CellConfig } from '../../common/DataTableWithSearch';


const ServiceCreateSchema = z.object({
  code: z.string().min(1).max(20, 'El código debe tener máximo 20 caracteres'),
  name: z.string().min(2).max(100),
  description: z.string().max(500).nullable().optional(),
  category: z.enum(['consulta', 'vacuna', 'cirugia', 'laboratorio', 'estetica', 'hospitalizacion', 'otro']),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  cost: z.coerce.number().min(0).optional(),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  duration: z.coerce.number().int().min(1).optional(),
  isActive: z.boolean().optional().default(true),
});

const ServiceUpdateSchema = ServiceCreateSchema.partial();

type ServicePayload = z.infer<typeof ServiceCreateSchema>;
type ServiceUpdatePayload = z.infer<typeof ServiceUpdateSchema>;
interface ServiceChanges extends Partial<ServiceUpdatePayload>, Record<string, unknown> {}

interface TableRow extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  price: number | string;
  cost: number | string;
  taxRate: number | string;
  duration: number | string;
  isActive: boolean;
}

const Services = () => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('consulta');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [duration, setDuration] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [formError, setFormError] = useState<string | null>(null);
  const [tableFeedback, setTableFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateServiceId, setUpdateServiceId] = useState<string | null>(null);
  const [changedFields, setChangedFields] = useState<Partial<ServiceUpdatePayload> | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);
  const [deleteServiceName, setDeleteServiceName] = useState<string | null>(null);

  const { t } = useLanguage();

  const { data: currentWorkspaceData } = useFetch<{ success: boolean; workspace: Workspace }>(
    `${BASEURL}/api/workspaces/current`
  );
  const workspaceId = currentWorkspaceData?.workspace?._id;

  const {
    data: servicesResponse,
    // loading: loadingServices, 'loadingServices' is assigned a value but never used.
    error: errorServices,
    refetch,
  } = useAuthAwareFetch<ServiceListResponse>(
    workspaceId ? `${BASEURL}/api/workspaces/${workspaceId}/services` : '',
    [workspaceId],
    { skipInitialFetch: !workspaceId }
  );

  const tableDataFromBackend = useMemo<TableRow[]>(() => {
    const raw = servicesResponse?.items ?? [];
    return raw.map((service: IService): TableRow => ({
      id: service._id,
      code: service.code ?? '',
      name: service.name ?? '',
      description: service.description ?? '',
      category: service.category ?? '',
      price: service.price ?? 0,
      cost: service.cost ?? '',
      taxRate: service.taxRate ?? '',
      duration: service.duration ?? '',
      isActive: service.isActive ?? true,
    }));
  }, [servicesResponse]);

  const { data: tableData, handleCellChange, updateData } = useEditableTable<TableRow>(
    tableDataFromBackend
  );

  useEffect(() => {
    updateData(tableDataFromBackend);
  }, [tableDataFromBackend, updateData]);

  const { post, loading, data: postData, error: postError } = usePost<
    IService,
    ServicePayload
  >(`${BASEURL}/api/workspaces/${workspaceId}/services`);

  const { deleteData: deleteService } = useDelete<{ message: string }>(
    `${BASEURL}/api/workspaces/${workspaceId}/services`
  );

  const serviceColumns = [
    { field: 'code', header: t('services:labels.code'), className: 'w-2/12' },
    { field: 'name', header: t('services:labels.name'), className: 'w-3/12' },
    { field: 'category', header: t('services:labels.category'), className: 'w-2/12' },
    { field: 'price', header: t('services:labels.price'), className: 'w-2/12' },
    { field: 'cost', header: t('services:labels.cost'), className: 'w-2/12' },
    { field: 'taxRate', header: t('services:labels.taxRate'), className: 'w-1/12' },
    { field: 'duration', header: t('services:labels.duration'), className: 'w-1/12' },
    { field: 'description', header: t('services:labels.description'), className: 'w-4/12', multiline: true },
    { field: 'isActive', header: t('services:labels.active'), className: 'w-1/12' },
  ];

  const categoryOptions = [
    { value: 'consulta', label: t('services:categories.consulta') },
    { value: 'vacuna', label: t('services:categories.vacuna') },
    { value: 'cirugia', label: t('services:categories.cirugia') },
    { value: 'laboratorio', label: t('services:categories.laboratorio') },
    { value: 'estetica', label: t('services:categories.estetica') },
    { value: 'hospitalizacion', label: t('services:categories.hospitalizacion') },
    { value: 'otro', label: t('services:categories.otro') },
  ];

  const cellConfigs = useMemo(() => {
    const configs: Partial<Record<keyof TableRow, CellConfig<ServiceChanges>>> = {
      category: {
        type: 'select',
        namespace: 'services', // Asegúrate de tener las traducciones en este namespace
        options: categoryOptions.map(opt => ({ id: opt.value, label: opt.label })),
        displayKeys: []
      },
      isActive: { 
        type: 'checkbox', 
        namespace: 'services' 
      },
      description: { 
        type: 'text', 
        multiline: true, 
        rows: 2 
      },
      price: { type: 'text', inputType: 'number' },
      cost: { type: 'text', inputType: 'number' },
      taxRate: { type: 'text', inputType: 'number' },
      duration: { type: 'text', inputType: 'number' },
    };
    return configs;
  }, [categoryOptions]);

  const preparePayload = (): ServicePayload | null => {
    const raw = {
      code: code.trim(),
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      price: price !== '' ? Number(price) : undefined,
      cost: cost !== '' ? Number(cost) : undefined,
      taxRate: taxRate !== '' ? Number(taxRate) : undefined,
      duration: duration !== '' ? Number(duration) : undefined,
      isActive,                    // ← Agregado
    };

    const result = ServiceCreateSchema.safeParse(raw);
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
      setFormError(t('services:messages.errorWorkspaceLoad') || 'No se pudo cargar el workspace');
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
      setCode('');
      setName('');
      setDescription('');
      setCategory('consulta');
      setPrice('');
      setCost('');
      setTaxRate('');
      setDuration('');
      setIsActive(true);
      refetch();
    }
  };

  const handleUpdate = (serviceId: string) => {
    const current = tableData.find((r) => r.id === serviceId);
    if (!current) {
      setFormError(t('services:messages.errorServiceNotFound'));
      return;
    }

    const rawServices = servicesResponse?.items ?? [];
    const original = rawServices.find((s) => s._id === serviceId);
    if (!original) {
      setFormError(t('services:messages.errorOriginalDataNotFound'));
      return;
    }

    const descriptionCurrent = String(current.description ?? '').trim();

    // Convertir isActive a boolean seguro
    const currentIsActive = current.isActive === true || 
                           current.isActive === 'true' || 
                           current.isActive === 1;

    const currentPayload: ServiceUpdatePayload & { description?: string | null } = {
      code: String(current.code).trim(),
      name: String(current.name).trim(),
      description: descriptionCurrent === '' ? null : descriptionCurrent,
      category: current.category as ServicePayload['category'],
      price: current.price !== '' ? Number(current.price) : undefined,
      cost: current.cost !== '' ? Number(current.cost) : undefined,
      taxRate: current.taxRate !== '' ? Number(current.taxRate) : undefined,
      duration: current.duration !== '' ? Number(current.duration) : undefined,
      isActive: currentIsActive,                    // ← Ahora siempre es boolean
    };

    const validation = ServiceUpdateSchema.safeParse(currentPayload);
    if (!validation.success) {
      setFormError(validation.error.issues.map((i) => i.message).join(', '));
      return;
    }

    const descriptionOriginal =
      original.description == null || String(original.description).trim() === ''
        ? null
        : String(original.description).trim();

    const originalIsActive = original.isActive === true || 
                            original.isActive === 'true' || 
                            original.isActive === 1;

    const originalPayload: ServiceUpdatePayload & { description?: string | null } = {
      code: original.code,
      name: original.name,
      description: descriptionOriginal,
      category: original.category,
      price: Number(original.price),
      cost: original.cost ? Number(original.cost) : undefined,
      taxRate: original.taxRate,
      duration: original.duration,
      isActive: originalIsActive,
    };

    const changes: Record<string, unknown> = {};
    let hasChanges = false;

    (Object.keys(currentPayload) as (keyof ServiceUpdatePayload)[]).forEach((key) => {
      const currentVal = currentPayload[key];
      const originalVal = originalPayload[key];

      // Comparación segura especialmente para booleanos
      const areDifferent = key === 'isActive' 
        ? currentVal !== originalVal 
        : currentVal !== originalVal;

      if (areDifferent) {
        changes[key] = currentVal;
        hasChanges = true;
      }
    });

    if (!hasChanges) {
      setTableFeedback({ type: 'error', message: t('services:messages.noChanges') });
      return;
    }

    setChangedFields(changes);
    setUpdateServiceId(serviceId);
    setIsUpdateModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    if (!updateServiceId || !changedFields) return;

    try {
      const res = await fetch(
        `${BASEURL}/api/workspaces/${workspaceId}/services/${updateServiceId}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changedFields),
        }
      );

      if (!res.ok) throw new Error(t('services:messages.errorUpdate'));

      const updated = await res.json();

      updateData((prev) =>
        prev.map((row) =>
          row.id === updateServiceId
            ? {
                ...row,
                code: updated.code ?? row.code,
                name: updated.name ?? row.name,
                description: updated.description ?? row.description,
                category: updated.category ?? row.category,
                price: updated.price ?? row.price,
                cost: updated.cost ?? row.cost,
                taxRate: updated.taxRate ?? row.taxRate,
                duration: updated.duration ?? row.duration,
                isActive: updated.isActive ?? row.isActive,
              }
            : row
        )
      );

      setIsUpdateModalOpen(false);
      setUpdateServiceId(null);
      setChangedFields(null);
      setTableFeedback({ type: 'success', message: t('services:messages.successUpdate') });
    } catch (err) {
      console.error(err);
      setFormError(t('services:messages.errorUpdate'));
      setTableFeedback({ type: 'error', message: t('services:messages.errorUpdate') });
    }
  };

  const handleDelete = (serviceId: string) => {
    const svc = tableData.find((r) => r.id === serviceId);
    if (!svc) return;
    setDeleteServiceId(serviceId);
    setDeleteServiceName(String(svc.name) || svc.code);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteServiceId) return;
    try {
      await deleteService(deleteServiceId);
      updateData((prev) => prev.filter((r) => r.id !== deleteServiceId));
      setIsDeleteModalOpen(false);
      setDeleteServiceId(null);
      setDeleteServiceName(null);
      setTableFeedback({ type: 'success', message: t('services:messages.successDelete') });
    } catch (err: unknown) {
      console.log(err)
      setFormError(t('services:messages.errorDelete'));
      setTableFeedback({ type: 'error', message: t('services:messages.errorDelete') });
    }
  };

  const getErrorMessage = () => {
    if (formError) return formError;
    if (postError) return postError.message || t('services:messages.errorCreate');
    return null;
  };

  if (!workspaceId) return <div>{t('services:messages.loadingWorkspace')}</div>;
  if (errorServices) return <div className="text-red-600">{t('services:messages.errorLoad')}</div>;

  return (
    <div className="mx-auto">
      {/* <InfoNote variant="primary">
        <p className="font-semibold mb-2">{t('services:info.title')}</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>{t('services:info.tip_code')}</li>
          <li>{t('services:info.tip_price')}</li>
          <li>{t('services:info.tip_duration')}</li>
          <li>{t('services:info.tip_import')}</li>
        </ul>
      </InfoNote>

      <ExcelTable
        headers={SERVICES_HEADERS}
        examples={SERVICE_EXAMPLE_DATA}
        className="mb-6"
      />

      <MassiveImport
        entity="Service"
        workspaceId={workspaceId}
        userId="" // se obtiene del contexto/auth en el componente
        baseUrl={BASEURL}
        onImportSuccess={refetch}
      /> */}

      <h2 className="text-2xl font-bold mb-6 mt-8 text-[rgb(var(--text))]">
        {t('services:titles.form') || 'Nuevo Servicio'}
      </h2>

      <div className="space-y-4">
        <Input
          value={code}
          onChange={setCode}
          placeholder={t('services:placeholders.code')}
          label={t('services:labels.code')}
          required
        />

        <Input
          value={name}
          onChange={setName}
          placeholder={t('services:placeholders.name')}
          label={t('services:labels.name')}
          required
        />

        <Select
          value={category}
          onChange={setCategory}
          label={t('services:labels.category')}
          options={categoryOptions}
        />

        <Input
          type="number"
          value={price}
          onChange={setPrice}
          placeholder={t('services:placeholders.price')}
          label={t('services:labels.price')}
          required
        />

        <Input
          type="number"
          value={cost}
          onChange={setCost}
          placeholder={t('services:placeholders.cost')}
          label={t('services:labels.cost')}
        />

        <Input
          type="number"
          value={taxRate}
          onChange={setTaxRate}
          placeholder={t('services:placeholders.taxRate')}
          label={t('services:labels.taxRate')}
        />

        <Input
          type="number"
          value={duration}
          onChange={setDuration}
          placeholder={t('services:placeholders.duration')}
          label={t('services:labels.duration')}
        />

        <Input
          value={description}
          onChange={setDescription}
          placeholder={t('services:placeholders.description')}
          label={t('services:labels.description')}
          multiline
          rows={3}
        />

        <Checkbox 
          label={t('services:labels.active') || 'Servicio Activo'} 
          checked={isActive} 
          onChange={setIsActive} 
        />

        <Button onClick={handleOpenModal} disabled={loading}>
          {loading ? t('services:buttons.submitLoading') : t('services:buttons.submit')}
        </Button>
      </div>

      {loading && <p className="mt-4 text-blue-600">{t('services:feedback.creating')}</p>}
      {getErrorMessage() && <p className="mt-4 text-red-600">{getErrorMessage()}</p>}
      {postData && !loading && <p className="mt-4 text-green-600">{t('services:feedback.success')}</p>}
      {tableFeedback && (
        <p className={`mt-4 ${tableFeedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {tableFeedback.message}
        </p>
      )}

      {/* Modales */}
      <CreateConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCreate}
        loading={loading}
        title={t('services:modals.create.title')}
        data={{ code, name, category, price, cost, taxRate, duration, description, isActive }}
      />

      <UpdateConfirmationModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdateServiceId(null);
          setChangedFields(null);
        }}
        onConfirm={handleConfirmUpdate}
        changedFields={changedFields}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteServiceId(null);
          setDeleteServiceName(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={deleteServiceName}
      />

      {/* Tabla */}
      <div className="pt-10 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{t('services:titles.table') || 'Servicios Registrados'}</h2>
          <Button onClick={refetch} variant="primary">
            {t('services:buttons.refetch') || 'Actualizar lista'}
          </Button>
        </div>

        <DataTableWithSearch
          title={t('services:titles.table')}
          data={tableData}
          columns={serviceColumns}
          cellConfigs={cellConfigs}
          onCellChange={handleCellChange}
          onRowUpdate={handleUpdate}
          onRowDelete={handleDelete}
          searchPlaceholder={t('services:placeholders.search')}
          emptyMessage={t('services:messages.emptyTable')}
          height="65vh"
        />
      </div>
    </div>
  );
};

export default Services;