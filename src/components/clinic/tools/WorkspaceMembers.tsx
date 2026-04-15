// src/components/clinic/tools/WorkspaceMembers.tsx

import { useMemo, useState, useEffect } from 'react';
import DataTableWithSearch, { type ColumnDef, type CellConfig } from '../../common/DataTableWithSearch';
import { useAuthAwareFetch } from '../../../hooks/useAuthAwareFetch';
import { useLanguage } from '../../../hooks/useLanguage';
import BASEURL from '../../../hooks/BaseUrl';
import useFetch from '../../../hooks/useFetch';
import { type Workspace } from '../../../interfaces/Workspace';
import { type User } from '../../../interfaces/User';
import { type IWorkspaceMember } from '../../../interfaces/WorkspaceMember';
import type { IPhone } from '../../../interfaces/shared.types';
// import InfoNote from '../../ui/InfoNote';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Button from '../../ui/Button';
import PhoneInput from '../../ui/PhoneInput';
// import MassiveImport from '../../ui/MassiveImport';
// import { useAuth } from '../../../hooks/useAuth';
import useDelete from '../../../hooks/useDelete';
import { z } from 'zod';
import { CreateConfirmationModal, DeleteConfirmationModal, UpdateConfirmationModal } from '../../modal/ConfirmationModals';
import { useEditableTable } from '../../../hooks/useEditableTable';
// import ExcelTable from '../../excelTable/ExcelTable';
// import { MEMBER_EXAMPLE_DATA, MEMBERS_HEADERS } from '../../excelTable/memberExample';

const phoneSchema = z.object({
  country: z.enum(['GT', 'ES', 'US', 'MX', 'AR']),
  number: z.string().regex(/^\d{8,15}$/, 'El teléfono debe tener entre 8 y 15 dígitos'),
});

const InviteSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  role: z.enum(['admin', 'veterinario', 'recepcion', 'asistente', 'contador', 'auditor']),
  phone: phoneSchema.optional(),
});

const UpdateSchema = z.object({
  role: z.enum(['admin', 'veterinario', 'recepcion', 'asistente', 'contador', 'auditor']).optional(),
  phone: phoneSchema.nullable().optional(),
});

type InvitePayload = z.infer<typeof InviteSchema>;
type UpdatePayload = z.infer<typeof UpdateSchema>;

type Role = 'admin' | 'veterinario' | 'recepcion' | 'asistente' | 'contador' | 'auditor';

interface PopulatedWorkspaceMember extends Omit<IWorkspaceMember, 'userId'> {
  userId: User | null;
}

interface CurrentWorkspaceResponse { success: boolean; workspace: Workspace; }
interface MembersListResponse { success: boolean; members: PopulatedWorkspaceMember[]; }

type TableRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: IPhone;
  status: 'active' | 'pending' | 'removed';
};

type SimpleOptionData = Record<string, never>;

const WorkspaceMembers = () => {
  const { t } = useLanguage();
  // Form states for invite
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [phone, setPhone] = useState<IPhone | null>({ country: 'GT', number: '' });

  const opcionesRoles = [
    { value: 'admin', label: t('workspaceMembers:options.roles.admin') },
    { value: 'veterinario', label: t('workspaceMembers:options.roles.veterinario') },
    { value: 'recepcion', label: t('workspaceMembers:options.roles.recepcion') },
    { value: 'asistente', label: t('workspaceMembers:options.roles.asistente') },
    { value: 'contador', label: t('workspaceMembers:options.roles.contador') },
    { value: 'auditor', label: t('workspaceMembers:options.roles.auditor') },
  ] as const;

  // Estado para búsqueda de email (verificar si existe)
  const [searchEmail, setSearchEmail] = useState('');
  const [searchedUser, setSearchedUser] = useState<{ name?: string; phone?: string; exists: boolean } | null>(null);

  // Estados para modales y errores
  const [formError, setFormError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [deleteMemberName, setDeleteMemberName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [postError, setPostError] = useState<Error | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateMemberId, setUpdateMemberId] = useState<string | null>(null);
  const [changedFields, setChangedFields] = useState<Partial<UpdatePayload> | null>(null);

  // const { user } = useAuth();

  // Cargar Workspace
  const { data: currentWorkspaceData } = useFetch<CurrentWorkspaceResponse>(`${BASEURL}/api/workspaces/current`);
  const workspaceId = currentWorkspaceData?.workspace?._id;

  // Cargar lista de miembros
  const { data: membersResponse, loading: loadingMembers, error: errorMembers, refetch: refetchMembers } = useAuthAwareFetch<MembersListResponse>(
    workspaceId ? `${BASEURL}/api/workspaces/${workspaceId}/members` : '',
    [workspaceId],
    { skipInitialFetch: !workspaceId }
  );

  // DELETE hook
  const { deleteData: deleteMember } = useDelete<{ message: string }>(
    `${BASEURL}/api/workspaces/${workspaceId}/members`
  );

  // Definir Columnas
  const columns: ColumnDef[] = [
    { field: "name", header: t('workspaceMembers:labels.name'), className: 'w-3/12', editable: false },
    { field: "email", header: t('workspaceMembers:labels.email'), className: 'w-3/12', editable: false },
    { field: "role", header: t('workspaceMembers:labels.role'), className: 'w-2/12', editable: true },
    { field: "phone", header: t('workspaceMembers:labels.phone'), className: 'w-2/12', cellType: 'phone' as const, editable: true },
    { field: "status", header: t('workspaceMembers:labels.status'), className: 'w-2/12', editable: false },
  ];

  // Transformar datos para tabla (manejar pendientes)
  const tableDataFromBackend = useMemo(() => {
    const rawList = membersResponse?.members || [];
    return rawList.map((m: PopulatedWorkspaceMember): TableRow => ({
      id: m._id as string,
      name: m.userId?.name || (m.pendingEmail ? `Pendiente: ${m.pendingEmail}` : ''),
      email: m.userId?.email || m.pendingEmail || '',
      role: m.role,
      phone: m.phone ?? { country: 'GT', number: '' },
      status: m.status,
    }));
  }, [membersResponse]);

  const originalData = useMemo(() => [...tableDataFromBackend], [tableDataFromBackend]);

  const { data: tableData, handleCellChange, updateData } = useEditableTable<TableRow>(tableDataFromBackend);

  useEffect(() => {
    updateData(tableDataFromBackend);
  }, [tableDataFromBackend, updateData]);

  const cellConfigs = useMemo((): Partial<Record<keyof TableRow, CellConfig<SimpleOptionData>>> => ({
    role: {
      type: 'select',
      options: opcionesRoles.map(r => ({ id: r.value, label: r.label })),
      namespace: 'roles',
    },
    phone: { type: 'phone' },
  }), []);

  // Buscar usuario por email
  const handleSearchEmail = async () => {
    if (!searchEmail || !workspaceId) return;
    try {
      const response = await fetch(`${BASEURL}/api/users/${workspaceId}/by-email?email=${encodeURIComponent(searchEmail)}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSearchedUser({ name: data.name, phone: data.phone, exists: true });
        setEmail(searchEmail);
      } else {
        setSearchedUser({ exists: false });
        setEmail(searchEmail);
      }
    } catch (err) {
      console.error(err);
      setFormError(t('workspaceMembers:messages.errorSearchEmail'));
    }
  };

  // Preparar payload para invite
  const prepareInvitePayload = (): InvitePayload | null => {
    const hasPhone = phone && phone.number.trim() !== '';
    const payload = {
      email: email.trim().toLowerCase(),
      role: role || undefined,
      phone: hasPhone ? phone : undefined,
    };

    const result = InviteSchema.safeParse(payload);
    if (!result.success) {
      console.error('Error de validación:', result.error.format());
      return null;
    }
    return result.data;
  };

  const handleOpenModal = () => {
    setFormError(null);
    setPostError(null);
    setSuccessMessage(null);
    if (!workspaceId) {
      setFormError(t('workspaceMembers:messages.errorWorkspaceLoad'));
      return;
    }

    const payload = prepareInvitePayload();
    if (!payload) {
      setFormError(t('workspaceMembers:messages.errorValidationForm'));
      return;
    }

    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    const payload = prepareInvitePayload();
    if (!payload) return;

    setLoading(true);
    try {
      const response = await fetch(`${BASEURL}/api/workspaces/${workspaceId}/members/invite`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('workspaceMembers:messages.errorPostGeneral'));
      }

      // const data = await response.json();
      setEmail('');
      setRole('');
      setPhone({ country: 'GT', number: '' });
      setSearchEmail('');
      setSearchedUser(null);

      await refetchMembers();
      setSuccessMessage(t('workspaceMembers:messages.successPost'));
    } catch (err) {
      console.error(err);
      setPostError(err as Error);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  const getErrorMessage = () => {
    if (formError) return formError;
    if (postError) return postError.message;
    return null;
  };

  const errorMessage = getErrorMessage();

  const handleDelete = (memberId: string) => {
    const member = tableDataFromBackend.find(m => m.id === memberId);
    if (!member) return;

    setDeleteMemberId(memberId);
    setDeleteMemberName(member.name || t('workspaceMembers:default.member'));
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteMemberId) return;

    try {
      const result = await deleteMember(deleteMemberId);
      if (result) {
        await refetchMembers();
        setSuccessMessage(t('workspaceMembers:messages.successDelete'));
      }
    } catch (err) {
      console.error(err);
      setPostError(new Error(t('workspaceMembers:messages.errorDeleteGeneral')));
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteMemberId(null);
      setDeleteMemberName(null);
    }
  };

  const arePhonesEqual = (p1?: IPhone, p2?: IPhone) =>
    p1?.number === p2?.number && p1?.country === p2?.country;

  const getNormalizedPhone = (
    phoneField: unknown,
    originalPhone?: IPhone
  ): IPhone | null | undefined => {
    if (!phoneField) return undefined;

  if (typeof phoneField === 'object' && phoneField !== null && 'number' in phoneField && 'country' in phoneField) {
    const p = phoneField as IPhone;
    if (!p.number || p.number.trim() === '') return undefined;
    return p;
  }

    if (typeof phoneField === 'string') {
      try {
        const parsed = JSON.parse(phoneField);
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          'number' in parsed &&
          'country' in parsed
        ) {
          if (!parsed.number || parsed.number.trim() === '') return null;
          return parsed as IPhone;
        }
      } catch (e) {console.log(e)};

      if (phoneField.trim() === '') return null;
      return {
        country: originalPhone?.country || 'GT',
        number: phoneField,
      };
    }

    return null;
  };

  const handleUpdate = (id: string) => {
    const row = tableData.find(r => r.id === id);
    const originalRow = originalData.find(r => r.id === id);

    if (row && originalRow) {
      const changes: Partial<UpdatePayload> = {};

      if (row.role !== originalRow.role) changes.role = row.role;

      const hadPhone = !!originalRow.phone?.number;
      const normalizedPhone = getNormalizedPhone(row.phone, originalRow.phone);
      const phoneChanged = !normalizedPhone
        ? hadPhone
        : !arePhonesEqual(normalizedPhone, originalRow.phone);

      if (phoneChanged) {
        changes.phone = normalizedPhone ?? undefined;
      }

      if (Object.keys(changes).length > 0) {
        const result = UpdateSchema.safeParse(changes);
        if (!result.success) {
          console.error(result.error.format());
          return;
        }

        setChangedFields(result.data);
        setUpdateMemberId(id);
        setIsUpdateModalOpen(true);
      }
    }
  };

  const handleConfirmUpdate = async () => {
    if (!updateMemberId || !changedFields || !workspaceId) return;

    const payloadForJSON = Object.fromEntries(
      Object.entries(changedFields).map(([key, value]) => [
        key,
        value === undefined ? null : value,
      ])
    );

    console.log('[handleConfirmUpdate] Payload a enviar:', JSON.stringify(payloadForJSON)); // ← útil para debug

    setLoading(true);
    setPostError(null);

    try {
      const url = `${BASEURL}/api/workspaces/${workspaceId}/members/${updateMemberId}`;
      console.log('[handleConfirmUpdate] PATCH →', url);

      const response = await fetch(url, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadForJSON),   // ← aquí estaba el bug
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || t('workspaceMembers:messages.errorUpdateGeneral'));
      }

      await refetchMembers();
      setIsUpdateModalOpen(false);
      setUpdateMemberId(null);
      setChangedFields(null);
      setSuccessMessage(t('workspaceMembers:messages.successUpdate'));
    } catch (error) {
      console.error('[handleConfirmUpdate] Error:', error);
      setPostError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  if (!workspaceId) return <div>{t('workspaceMembers:messages.loadingWorkspace')}</div>;
  if (errorMembers) return <div className="text-red-600">{t('workspaceMembers:messages.errorGeneral')}</div>;
  if (loadingMembers || (!tableData.length && !errorMembers && !membersResponse)) {
    return <div className="p-8 text-center text-gray-500">{t('workspaceMembers:messages.loadingMembers')}</div>;
  }

  // const memberInstructions = (
  //   <>
  //     <p className="font-semibold mb-2">{t('workspaceMembers:export_explanation.title')}</p>
  //     <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
  //       <li>{t('workspaceMembers:export_explanation.acepted_formats')}</li>
  //       <li>{t('workspaceMembers:export_explanation.required_fields')}</li>
  //       <li>{t('workspaceMembers:export_explanation.optional_fields')}</li>
  //       <li>{t('workspaceMembers:export_explanation.validation_phone')}</li>
  //       <li>{t('workspaceMembers:export_explanation.visual_example')}</li>
  //     </ul>
  //   </>
  // );

  return (
    <div className="space-y-6">
      {/* <InfoNote>
        {memberInstructions}
      </InfoNote>

      <ExcelTable
        headers={MEMBERS_HEADERS}
        examples={MEMBER_EXAMPLE_DATA}
        className="mb-8"
      />

      <MassiveImport
        entity="WorkspaceMember"
        workspaceId={workspaceId}
        userId={user?._id || ''}
        baseUrl={BASEURL}
        onImportSuccess={refetchMembers}
      /> */}

      <h2 className="text-2xl font-bold mb-6 text-[rgb(var(--text))]">{t('workspaceMembers:titles.form')}</h2>

      <div className="space-y-4">
        <Input value={searchEmail} onChange={setSearchEmail} placeholder={t('workspaceMembers:placeholders.searchEmail')} label={t('workspaceMembers:labels.searchEmail')} />
        <Button onClick={handleSearchEmail}>{t('workspaceMembers:buttons.search')}</Button>
        {searchedUser && (
          <p>
            {searchedUser.exists
              ? `${t('workspaceMembers:messages.userFound')}: ${searchedUser.name || ''} (${searchedUser.phone || ''})`
              : t('workspaceMembers:messages.userNotFound')}
          </p>
        )}
        <Input value={email} onChange={setEmail} placeholder={t('workspaceMembers:placeholders.email')} required={true} label={t('workspaceMembers:labels.email')} />
        <Select value={role} onChange={(val) => setRole(val as Role)} options={opcionesRoles} placeholder={t('workspaceMembers:placeholders.role')} required={true} />
        <PhoneInput
          value={phone}
          onChange={setPhone}
          label={t('workspaceMembers:labels.phone')}
          placeholder="Ej: 55123456"
          required={false}
        />
        <Button onClick={handleOpenModal} disabled={loading}>
          {loading ? t('workspaceMembers:buttons.submitLoading') : t('workspaceMembers:buttons.submit')}
        </Button>
      </div>

      {loading && <p className="mt-4 text-blue-600">{t('workspaceMembers:feedback.inviting')}</p>}
      {errorMessage && <p className="mt-4 text-red-600">{errorMessage}</p>}
      {successMessage && <p className="mt-4 text-green-600">{successMessage}</p>}

      <CreateConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        loading={loading}
        title={t('workspaceMembers:modals.create.title')}
        data={{ email, role, ...(phone?.number.trim() ? { phone } : {}) }}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeleteMemberId(null); setDeleteMemberName(null); }}
        onConfirm={handleConfirmDelete}
        itemName={deleteMemberName}
      />

      <UpdateConfirmationModal
        isOpen={isUpdateModalOpen}
        onClose={() => { setIsUpdateModalOpen(false); setUpdateMemberId(null); setChangedFields(null); }}
        onConfirm={handleConfirmUpdate}
        changedFields={changedFields}
      />

      <div className="pt-4 space-y-8">
        <div className="flex justify-between items-center">
          <Button onClick={() => refetchMembers()} variant="primary">
            {t('workspaceMembers:buttons.refetch')}
          </Button>
        </div>

        <DataTableWithSearch<TableRow, keyof TableRow, SimpleOptionData>
          title={t('workspaceMembers:titles.table')}
          data={tableData}
          columns={columns}
          cellConfigs={cellConfigs}
          onRowDelete={handleDelete}
          onRowUpdate={handleUpdate}
          onCellChange={handleCellChange}
          searchPlaceholder={t('workspaceMembers:placeholders.search')}
          emptyMessage={t('workspaceMembers:messages.emptyTable')}
          height="65vh"
        />
      </div>
    </div>
  );
};

export default WorkspaceMembers;