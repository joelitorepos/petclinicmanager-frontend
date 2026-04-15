// src/components/clinic/tools/Owner.tsx

import { useState, useMemo, useEffect } from 'react';
import BASEURL from '../../../hooks/BaseUrl';
import { z } from 'zod';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
// import MassiveImport from '../../ui/MassiveImport';
import ExampleCards from '../../ui/ExampleCards';
// import InfoNote from '../../ui/InfoNote';
import DataTableWithSearch from '../../common/DataTableWithSearch';
import { CreateConfirmationModal, UpdateConfirmationModal, DeleteConfirmationModal } from '../../modal/ConfirmationModals'
// import ExcelTable from '../../excelTable/ExcelTable';
// import { OWNER_EXAMPLE_DATA, OWNERS_HEADERS } from '../../excelTable/ownerExample';
import { useAuthAwareFetch } from '../../../hooks/useAuthAwareFetch';
import type { Workspace } from '../../../interfaces/Workspace';
import type { IOwner } from '../../../interfaces/Owner';
import type { IPhone } from '../../../interfaces/shared.types';
import PhoneInput from '../../ui/PhoneInput';
import usePost from '../../../hooks/usePost';
import useFetch from '../../../hooks/useFetch';
import useDelete from '../../../hooks/useDelete';
import { useEditableTable } from '../../../hooks/useEditableTable';
import { useLanguage } from '../../../hooks/useLanguage';
// import { useAuth } from '../../../hooks/useAuth';

const phoneSchema = z.object({
  country: z.enum(['GT', 'ES', 'US', 'MX', 'AR']),
  number: z.string().regex(/^\d{8,15}$/, 'El teléfono debe tener entre 8 y 15 dígitos'),
});

const OwnerSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  telefono: phoneSchema,
  telefono2: phoneSchema.optional(),
  email: z.string().email().optional().nullable(),
  direccion: z.string().optional(),
  nit: z.string().optional(),
});

type OwnerPayload = z.infer<typeof OwnerSchema>;

interface CurrentWorkspaceResponse { success: boolean; workspace: Workspace; }
interface OwnersListResponse { success: boolean; owners: IOwner[]; }

interface TableRow extends Record<string, unknown> {
  id: string;
  nombre: string;
  telefono: IPhone;
  telefono2?: IPhone;
  email?: string;
  direccion?: string;
  nit?: string;
}

const Owners = () => {
 // Form states
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState<IPhone | null>({ country: 'GT', number: '' });
  const [telefono2, setTelefono2] = useState<IPhone | null>(null);
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [nit, setNit] = useState('');
  // Estado para manejar errores de validación local o de carga de Workspace
  const [formError, setFormError] = useState<string | null>(null);
  // Modal state for create
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Modal state for update
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateOwnerId, setUpdateOwnerId] = useState<string | null>(null);
  const [changedFields, setChangedFields] = useState<Partial<OwnerPayload> | null>(null);
  // Modal state for delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteOwnerId, setDeleteOwnerId] = useState<string | null>(null);
  const [deleteOwnerName, setDeleteOwnerName] = useState<string | null>(null);

  const { t } = useLanguage();

  const ownersColumns = [
    { field: "nombre", header: t('owners:labels.name'), className: 'w-4/12' },
    { field: "telefono", header: t('owners:labels.telephone'), className: 'w-3/12', cellType: 'phone' as const, editable: true },
    { field: "telefono2", header: t('owners:labels.telephone2'), className: 'w-3/12', cellType: 'phone' as const, editable: true },
    { field: "email", header: t('owners:labels.email'), className: 'w-3/12' },
    { field: "direccion", header: t('owners:labels.address'), className: 'w-4/12', multiline: true },
    { field: "nit", header: t('owners:labels.nit'), className: 'w-2/12' },
  ];

  // Workspace
  const { data: currentWorkspaceData } = useFetch<CurrentWorkspaceResponse>(`${BASEURL}/api/workspaces/current`);
  const workspaceId = currentWorkspaceData?.workspace?._id;
  // user
  // const { user } = useAuth();

  // Cargar lista de dueños
  const { data: ownersResponse, loading: loadingOwners, error: errorOwners, refetch,
  } = useAuthAwareFetch<OwnersListResponse>(
    workspaceId ? `${BASEURL}/api/workspaces/${workspaceId}/owners` : '',
    [workspaceId],
    { skipInitialFetch: !workspaceId }
  );

  // Transformar datos del backend a formato para la tabla
  const tableDataFromBackend = useMemo(() => {
    if (!ownersResponse) return [];
    const rawOwnersList = Array.isArray(ownersResponse)
      ? ownersResponse
      : (ownersResponse).owners || [];

    return rawOwnersList.map((owner: IOwner): TableRow => ({
      id: owner._id,
      nombre: owner.nombre || '',
      telefono: owner.telefono,
      telefono2: owner.telefono2,
      email: owner.email || '',
      direccion: owner.direccion || '',
      nit: owner.nit || '',
    }));
  }, [ownersResponse]);

  // Hook para edición local
  const { data: tableData, handleCellChange, updateData } = useEditableTable<TableRow>(tableDataFromBackend);

  useEffect(() => {
    updateData(tableDataFromBackend);
  }, [tableDataFromBackend, updateData]);

  const { deleteData: deleteOwner } = useDelete<{ message: string }>(
    `${BASEURL}/api/workspaces/${workspaceId}/owners`
  );

  const arePhonesEqual = (p1?: IPhone, p2?: IPhone) => 
    p1?.number === p2?.number && p1?.country === p2?.country;
  const handleUpdate = (ownerId: string) => {
    const currentOwner = tableData.find(o => o.id === ownerId);
    if (!currentOwner) {
      setFormError(`${t('owners:messages.errorOwnerNotFound')}`);
      return;
    }

    // Encontrar el owner original desde ownersResponse
    const rawOwnersList = Array.isArray(ownersResponse)
      ? ownersResponse
      : (ownersResponse as OwnersListResponse)?.owners || [];
    const originalOwner = rawOwnersList.find(o => o._id === ownerId);

    if (!originalOwner) {
      setFormError(`${t('owners:messages.errorOriginalDataNotFound')}`);
      return;
    }

    const getNormalizedPhone = (
      phoneField: unknown,
      originalPhone?: IPhone
    ): IPhone | undefined => {
      if (!phoneField) {
        return undefined;
      }

      if (typeof phoneField === 'object' && phoneField !== null && 'number' in phoneField && 'country' in phoneField) {
        return phoneField as IPhone;
      }

      if (typeof phoneField === 'string') {
        try {
          const parsed = JSON.parse(phoneField);
          if (typeof parsed === 'object' && parsed !== null && 'number' in parsed && 'country' in parsed) {
            return parsed as IPhone;
          }
        } catch (e) {
          console.log(e)
        }
        
        return {
          country: originalPhone?.country || 'GT',
          number: phoneField,
        };
      }
      return undefined;
    };

    const telefono = getNormalizedPhone(currentOwner.telefono, originalOwner.telefono);

    if (!telefono) {
      setFormError(t('owners:messages.errorPhoneRequired'));
      return;
    }

    const telefono2 = getNormalizedPhone(currentOwner.telefono2, originalOwner.telefono2);
    const emailValue = (currentOwner.email ?? '').trim();

    // Preparar payload actual
    const currentPayload: OwnerPayload = {
      nombre: currentOwner.nombre.trim(),
      telefono: telefono,
      telefono2: telefono2,
      email: emailValue === '' ? null : emailValue,
      direccion: currentOwner.direccion || undefined,
      nit: currentOwner.nit || undefined,
    };

    // Validar con Zod
    const validationResult = OwnerSchema.safeParse(currentPayload);
    if (!validationResult.success) {
      const errors = validationResult.error.format();

      const errorMessages: string[] = [];
      (Object.keys(currentPayload) as (keyof OwnerPayload)[]).forEach(key => {
        const fieldError = errors[key];
        if (fieldError && '_errors' in fieldError && Array.isArray(fieldError._errors) && fieldError._errors.length > 0) {
          errorMessages.push(fieldError._errors[0]!);
        }
      });

      setFormError(`${t('owners:messages.errorValidationZod')} ${errorMessages.join(', ')}`);
      return;
    }

    // Comparar con original
    const originalPayload: OwnerPayload = {
      nombre: originalOwner.nombre?.trim() || '',
      telefono: originalOwner.telefono,
      telefono2: originalOwner.telefono2,
      email: originalOwner.email || undefined,
      direccion: originalOwner.direccion || undefined,
      nit: originalOwner.nit || undefined,
    };

    const changes: Partial<OwnerPayload> = {};
    let hasChanges = false;
    (Object.keys(currentPayload) as (keyof OwnerPayload)[]).forEach(key => {
      const currentValue = currentPayload[key];
      const originalValue = originalPayload[key];
    
      if (key === 'telefono' || key === 'telefono2') {
        if (!arePhonesEqual(currentValue as IPhone, originalValue as IPhone)) {
          (changes[key] as unknown) = currentValue === undefined ? null : currentValue;
          hasChanges = true;
        }
      } else {
        if (currentValue !== originalValue) {
          (changes[key] as unknown) = currentValue === undefined ? null : currentValue;;
          hasChanges = true;
        }
      }
    });

    if (!hasChanges) {
      setFormError(`${t('owners:messages.alertNoChanges')}`);
      return;
    }

    // Abrir modal de confirmación con cambios
    setChangedFields(changes);
    setUpdateOwnerId(ownerId);
    setIsUpdateModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    if (!updateOwnerId || !changedFields) return;

    const payloadForJSON = Object.fromEntries(
      Object.entries(changedFields).map(([key, value]) => [key, value === undefined ? null : value])
    );

    try {
      const response = await fetch(
        `${BASEURL}/api/workspaces/${workspaceId}/owners/${updateOwnerId}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadForJSON),
        }
      );

      if (!response.ok) {
        throw new Error(`${t('owners:messages.errorUpdateGeneral')}`);
      }

      const updatedOwner = await response.json();

      updateData(prev =>
        prev.map(row =>
          row.id === updateOwnerId
            ? {
                id: updatedOwner._id,
                nombre: updatedOwner.nombre || '',
                telefono: updatedOwner.telefono,
                telefono2: updatedOwner.telefono2,
                email: updatedOwner.email || '',
                direccion: updatedOwner.direccion || '',
                nit: updatedOwner.nit || '',
              }
            : row
        )
      );

      setIsUpdateModalOpen(false);
      setUpdateOwnerId(null);
      setChangedFields(null);
    } catch (error) {
      console.error('Error al actualizar:', error);
      setFormError(`${t('owners:messages.errorUpdateGeneral')}`);
    }
  };

  const handleDelete = (ownerId: string) => {
    const ownerToDelete = tableData.find(o => o.id === ownerId);
    if (!ownerToDelete) {
      setFormError(`${t('owners:messages.errorOwnerNotFound')}`);
      return;
    }

    setDeleteOwnerId(ownerId);
    setDeleteOwnerName(ownerToDelete.nombre);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteOwnerId) return;

    try {
      await deleteOwner(deleteOwnerId);
      updateData(prev => prev.filter(row => row.id !== deleteOwnerId));
      setIsDeleteModalOpen(false);
      setDeleteOwnerId(null);
      setDeleteOwnerName(null);
    } catch (error) {
      console.error('Error al eliminar:', error);
      setFormError(`${t('owners:messages.errorDeleteGeneral')}`);
    }
  };

  const { post, loading, data, error: postError } = usePost<IOwner, OwnerPayload>(`${BASEURL}/api/workspaces/${workspaceId}/owners`);

  const preparePayload = (): OwnerPayload | null => {
    if (!telefono || !telefono.number) {
      setFormError(t('owners:messages.errorPhoneRequired'));
      return null;
    }

    const payload: OwnerPayload = {
      nombre,
      telefono,
      telefono2: telefono2 || undefined,
      email: email.trim() === '' ? undefined : email.trim(),
      direccion: direccion || undefined,
      nit: nit || undefined,
    };

    const result = OwnerSchema.safeParse(payload);
    if (!result.success) {
      console.error('Error de validación:', result.error.format());
      return null;
    }
    return result.data;
  };

  const handleOpenModal = () => {
    setFormError(null);
    if (!workspaceId) {
      setFormError(`${t('owners:messages.errorWorkspaceLoad')}`);
      return;
    }

    // Validar el formulario
    const payload = preparePayload();
    if (!payload) {
      setFormError(`${t('owners:messages.errorValidationForm')}`);
      return;
    }

    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    const payload = preparePayload();
    if (!payload) return;

    await post(payload);
    setIsModalOpen(false);

    // limpiar formulario tras éxito
    if (!postError) {
      setNombre('');
      setTelefono({ country: 'GT', number: '' });
      setTelefono2(null);
      setEmail('');
      setDireccion('');
      setNit('');
    }
  };

  // Función para obtener el mensaje de error claro para el usuario
  const getErrorMessage = () => {
    if (formError) {
      return formError; // Error local (Workspace o validación Zod)
    }
    if (postError) {
      const message = postError.message;
      // Ejemplo de filtrado de errores comunes:
      if (message.includes(`${t('owners:messages.errorPostEmailFormat')}`)) {
        return `${t('owners:messages.errorPostEmailFormat')}`;
      }
      // Mensaje genérico para cualquier error del servidor
      return `${t('owners:messages.errorPostGeneral')}`;
    }
    return null;
  };

  const errorMessage = getErrorMessage();
  // Chequeos de carga y error
  if (!workspaceId) return <div>{t('owners:messages.loadingWorkspace')}</div>;
  if (errorOwners) return <div className="text-red-600">{t('owners:messages.errorGeneral')}</div>;
  if (loadingOwners || (!tableData.length && !errorOwners && !ownersResponse)) {
      return <div className="p-8 text-center text-gray-500">{t('owners:messages.loadingOwners')}</div>;
  }

  const phoneExamples = [
    { country: 'GT', examples: ['55123456', '22001234'] },
    { country: 'US', examples: ['5551234567', '8005551234'] }
  ];

  // const ownerInstructions = (
  //   <>
  //     <p className="font-semibold mb-2">{t('owners:export_explanation.title')}</p>
  //     <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
  //       <li>{t('owners:export_explanation.acepted_formats')}</li>
  //       <li>{t('owners:export_explanation.required_fields')}</li>
  //       <li>{t('owners:export_explanation.optional_fields')}</li>
  //       <li>{t('owners:export_explanation.validation_phone')}</li>
  //       <li>{t('owners:export_explanation.visual_example')}</li>
  //     </ul>
  //   </>
  // );

  return (
    <div className="mx-auto">
      {/* <InfoNote variant="primary">
        {ownerInstructions}
      </InfoNote>
      <ExcelTable
        headers={OWNERS_HEADERS}
        examples={OWNER_EXAMPLE_DATA}
        className="mb-8"
        headerDefaults={[0, 0, 0, 0, 0, 0]}
        dataDefaults={[
          [0, 0, 0, 0, 0, 0],
          [1, 1, -1, -1, -1, -1]
        ]}
      />
      <MassiveImport
        entity="Owner"
        workspaceId={workspaceId}
        userId={user?._id || ''}
        baseUrl={BASEURL}
        onImportSuccess={refetch}
      /> */}

      <h2 className="text-2xl font-bold mb-6 text-[rgb(var(--text))]">{t('owners:titles.form')}</h2>

      <div className="space-y-4">
        <Input
          type="text" value={nombre} onChange={setNombre} placeholder={t('owners:placeholders.form.name')} required={true} label={t('owners:labels.name')}
        />
        <PhoneInput
          value={telefono}
          onChange={setTelefono}
          label={t('owners:labels.telephone')}
          placeholder="Ej: 55123456"
          required={true}
        />
        <ExampleCards label={t('owners:labels.phoneExamplesLabel')} items={phoneExamples} />

        <PhoneInput
          value={telefono2}
          onChange={setTelefono2}
          label={t('owners:labels.telephone2')}
          placeholder="Ej: 22001234"
          required={false}
        />
        <Input
          type="email" value={email} onChange={setEmail} placeholder={t('owners:placeholders.form.email')} required={false} label={t('owners:labels.email')}
        />
        <Input
          type="text" value={direccion} onChange={setDireccion} placeholder={t('owners:placeholders.form.address')} required={false} label={t('owners:labels.address')}
        />
        <Input
          type="text" value={nit} onChange={setNit} placeholder={t('owners:placeholders.form.nit')} required={false} label={t('owners:labels.nit')}
        />

        <Button onClick={handleOpenModal} disabled={loading}>
          {loading ? `${t('owners:buttons.form.submitLoading')}` : `${t('owners:buttons.form.submit')}`}
        </Button>
      </div>

      {/* Feedback de la operación */}
      {loading && <p className="mt-4 text-blue-600">{`${t('owners:feedback.creatingOwner')}`}</p>}
      {/* Mensaje de error unificado y claro */}
      {errorMessage && <p className="mt-4 text-red-600">{t('owners:messages.errorGeneral') + errorMessage}</p>}
      {data && !loading && !errorMessage && (
        <p className="mt-4 text-green-600">{`${t('owners:messages.successPost')}`}</p>
      )}

      {/* Modal de confirmación para create */}
      <CreateConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        loading={loading}
        title={t('common:confirm_creation')}
        data={{ nombre, telefono, telefono2, email, direccion, nit }}
      />

      {/* Modal de confirmación para update */}
      <UpdateConfirmationModal 
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdateOwnerId(null);
          setChangedFields(null);
        }}
        onConfirm={handleConfirmUpdate}
        changedFields={changedFields}
      />

      {/* Modal de confirmación para delete */}
      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteOwnerId(null);
          setDeleteOwnerName(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={deleteOwnerName}
      />

      {/* tabla de datos */}
      <div className="pt-4 space-y-8">
        <div className="flex justify-between items-center">
          <Button
            onClick={() => refetch()}
            variant="primary"
          >
            {t('owners:buttons.table.refetch')}
          </Button>
        </div>

        <DataTableWithSearch
          title={t('owners:titles.table')}
          data={tableData}
          columns={ownersColumns}
          onCellChange={handleCellChange}
          onRowUpdate={handleUpdate}
          onRowDelete={handleDelete}
          searchPlaceholder={t('owners:placeholders.table.search')}
          emptyMessage={t('owners:messages.emptyTable')}
          height="70vh"
          cellConfigs={{
            telefono: { type: 'phone' },
            telefono2: { type: 'phone' },
          }}
        />
      </div>
    </div>
  );
};

export default Owners;