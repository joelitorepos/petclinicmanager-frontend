// src/components/clinic/tools/Reports.tsx

import { useState } from 'react';
import { useLanguage } from '../../../hooks/useLanguage';
import BASEURL from '../../../hooks/BaseUrl';
import useFetch from '../../../hooks/useFetch';
import { useAuthAwareFetch } from '../../../hooks/useAuthAwareFetch';
import Button from '../../ui/Button';
import Select from '../../ui/Select';
import DateInput from '../../ui/DateInput';
import Input from '../../ui/Input';
import type { CurrentWorkspaceResponse } from '../../../interfaces/Workspace';

type ExportFormat = 'xlsx' | 'csv';

type ReportStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

interface ReportState {
  status: ReportStatus;
  message?: string;
}

interface OwnersResponse {
  owners: Array<{ _id: string; nombre: string }>;
}

interface PatientsResponse {
  patients: Array<{ _id: string; nombre: string }>;
}

const buildQueryString = (params: Record<string, string | undefined>): string => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val && val.trim() !== '') qs.set(key, val.trim());
  });
  return qs.toString();
};

const triggerDownload = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

const getContentDispositionFileName = (
  contentDisposition: string | null,
  fallback: string
): string => {
  if (!contentDisposition) return fallback;
  const match = contentDisposition.match(/filename="?([^"]+)"?/);
  return match?.[1] ?? fallback;
};

const StatusBadge = ({ status, message }: ReportState) => {
  if (status === 'idle') return null;

  const config: Record<Exclude<ReportStatus, 'idle'>, { classes: string; }> = {
    loading: { classes: 'text-blue-700 bg-blue-50 border-blue-200' },
    success: { classes: 'text-green-700 bg-green-50 border-green-200' },
    error:   { classes: 'text-red-700 bg-red-50 border-red-200' },
    empty:   { classes: 'text-gray-600 bg-gray-50 border-gray-200' },
  };

  const { classes } = config[status as Exclude<ReportStatus, 'idle'>];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded border font-medium ${classes}`}>
      {message}
    </span>
  );
};

interface ReportCardProps {
  t: ReturnType<typeof useLanguage>['t'];
  title: string;
  description: string;
  children: React.ReactNode;
  onExport: () => void;
  state: ReportState;
  format: ExportFormat;
  onFormatChange: (f: ExportFormat) => void;
}

const ReportCard = ({
  t,
  title,
  description,
  children,
  onExport,
  state,
  format,
  onFormatChange,
}: ReportCardProps) => (
  <div className="border border-[rgb(var(--border))] rounded-xl bg-[rgb(var(--surface))] overflow-hidden">
    {/* Cabecera */}
    <div className="flex items-start gap-4 p-5 border-b border-[rgb(var(--border))]">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-[rgb(var(--text))] text-base">{title}</h3>
        <p className="text-sm text-[rgb(var(--text-secondary))] mt-0.5">{description}</p>
      </div>
    </div>

    {/* Filtros */}
    <div className="p-5 space-y-4">
      {children}

      {/* Formato + botón de exportar */}
      <div className="flex items-end gap-3 pt-1">
        <div className="w-32">
          <Select
            label={t('reports:labels.format')}
            value={format}
            onChange={(v) => onFormatChange(v as ExportFormat)}
            options={[
              { value: 'xlsx', label: t('reports:labels.xsx') },
              { value: 'csv',  label: t('reports:labels.csv') },
            ]}
          />
        </div>
        <Button
          onClick={onExport}
          disabled={state.status === 'loading'}
          loading={state.status === 'loading'}
        >
          {t('reports:labels.export')}
        </Button>
        <StatusBadge {...state} />
      </div>
    </div>
  </div>
);

const Reports = () => {
  const { t } = useLanguage();

  const { data: currentWorkspaceData } = useFetch<CurrentWorkspaceResponse>(
    `${BASEURL}/api/workspaces/current`
  );
  const workspaceId = currentWorkspaceData?.workspace?._id ?? null;

  // --- Dueños ---
  const { data: ownersRaw } = useAuthAwareFetch<OwnersResponse>(
    workspaceId ? `${BASEURL}/api/workspaces/${workspaceId}/owners` : '',
    [workspaceId],
    { skipInitialFetch: !workspaceId }
  );

  const owners = ownersRaw?.owners ?? [];

  // --- Pacientes ---
  const { data: patientsRaw } = useAuthAwareFetch<PatientsResponse>(
    workspaceId ? `${BASEURL}/api/workspaces/${workspaceId}/patients` : '',
    [workspaceId],
    { skipInitialFetch: !workspaceId }
  );

  // Acceso seguro y tipado
  const patients = patientsRaw?.patients ?? [];

  // ── Estado de cada reporte ────────────────────────────────────────────────
  const [ownersState,    setOwnersState]    = useState<ReportState>({ status: 'idle' });
  const [patientsState,  setPatientsState]  = useState<ReportState>({ status: 'idle' });
  const [membersState,   setMembersState]   = useState<ReportState>({ status: 'idle' });
  const [appointsState,  setAppointsState]  = useState<ReportState>({ status: 'idle' });
  const [clinicalState,  setClinicalState]  = useState<ReportState>({ status: 'idle' });

  // Owners
  const [ownersFormat,  setOwnersFormat]  = useState<ExportFormat>('xlsx');
  const [ownersSearch,  setOwnersSearch]  = useState('');

  // Patients
  const [patientsFormat,  setPatientsFormat]  = useState<ExportFormat>('xlsx');
  const [patientsSearch,  setPatientsSearch]  = useState('');
  const [patientsOwnerId, setPatientsOwnerId] = useState('');

  // Members
  const [membersFormat, setMembersFormat] = useState<ExportFormat>('xlsx');
  const [membersRole,   setMembersRole]   = useState('');
  const [membersStatus, setMembersStatus] = useState('');

  // Appointments
  const [appointsFormat, setAppointsFormat] = useState<ExportFormat>('xlsx');
  const [appointsStart,  setAppointsStart]  = useState('');
  const [appointsEnd,    setAppointsEnd]    = useState('');
  const [appointsStatus, setAppointsStatus] = useState('');

  // Clinical Records
  const [clinicalFormat, setClinicalFormat] = useState<ExportFormat>('xlsx');
  const [clinicalStart,  setClinicalStart]  = useState('');
  const [clinicalEnd,    setClinicalEnd]    = useState('');
  const [clinicalPatient, setClinicalPatient] = useState('');

  const doExport = async (
    endpoint: string,
    params: Record<string, string | undefined>,
    format: ExportFormat,
    entityName: string,
    setState: (s: ReportState) => void
  ) => {
    if (!workspaceId) return;
    setState({ status: 'loading', message: t('reports:status.generating') });

    const qs = buildQueryString({ ...params, format });
    const url = `${BASEURL}/api/workspaces/${workspaceId}${endpoint}${qs ? `?${qs}` : ''}`;

    try {
      const res = await fetch(url, {
        credentials: 'include',
      });

      if (res.ok) {
        const contentType = res.headers.get('Content-Type') ?? '';
        // El backend devuelve JSON con { message } cuando no hay datos
        if (contentType.includes('application/json')) {
          const json = await res.json();
          setState({ status: 'empty', message: json.message ?? t('reports:status.empty') });
          return;
        }

        const blob = await res.blob();
        const disposition = res.headers.get('Content-Disposition');
        const ext = format === 'csv' ? 'csv' : 'xlsx';
        const fallback = `${entityName}_${new Date().toISOString().split('T')[0]}.${ext}`;
        triggerDownload(blob, getContentDispositionFileName(disposition, fallback));
        setState({ status: 'success', message: t('reports:status.downloaded') });
      } else {
        const json = await res.json().catch(() => ({}));
        setState({
          status: 'error',
          message: json.error ?? `Error ${res.status}`,
        });
      }
    } catch (err: unknown) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : t('reports:status.networkError'),
      });
    }
  };

  const handleExportOwners = () =>
    doExport('/reports/export/owners', { search: ownersSearch }, ownersFormat, 'owners', setOwnersState);

  const handleExportPatients = () =>
    doExport(
      '/reports/export/patients',
      { search: patientsSearch, ownerId: patientsOwnerId },
      patientsFormat, 'patients', setPatientsState
    );

  const handleExportMembers = () =>
    doExport(
      '/reports/export/workspace-members',
      { role: membersRole, status: membersStatus },
      membersFormat, 'workspace-members', setMembersState
    );

  const handleExportAppointments = () =>
    doExport(
      '/reports/export/appointments',
      { startDate: appointsStart, endDate: appointsEnd, status: appointsStatus },
      appointsFormat, 'appointments', setAppointsState
    );

  const handleExportClinical = () =>
    doExport(
      '/reports/export/clinical-records',
      { startDate: clinicalStart, endDate: clinicalEnd, patientId: clinicalPatient },
      clinicalFormat, 'clinical-records', setClinicalState
    );

return (
    <div className="space-y-6 p-6">

      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-[rgb(var(--text))]">{t('reports:title')}</h1>
        <p className="text-[rgb(var(--text-secondary))] mt-1 text-sm">
          {t('reports:subtitle')}
        </p>
      </div>

      {/* Grid de reportes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Dueños */}
        <ReportCard
          t={t}
          title={t('reports:cards.owners.title')}
          description={t('reports:cards.owners.description')}
          onExport={handleExportOwners}
          state={ownersState}
          format={ownersFormat}
          onFormatChange={setOwnersFormat}
        >
          <Input
            label={t('reports:cards.owners.searchLabel')}
            value={ownersSearch}
            onChange={setOwnersSearch}
            placeholder={t('reports:cards.owners.searchPlaceholder')}
          />
        </ReportCard>

        {/* Pacientes */}
        <ReportCard
          t={t}
          title={t('reports:cards.patients.title')}
          description={t('reports:cards.patients.description')}
          onExport={handleExportPatients}
          state={patientsState}
          format={patientsFormat}
          onFormatChange={setPatientsFormat}
        >
          <Input
            label={t('reports:cards.patients.searchLabel')}
            value={patientsSearch}
            onChange={setPatientsSearch}
            placeholder={t('reports:cards.patients.searchPlaceholder')}
          />
          <Select
            label={t('reports:cards.patients.filterOwnerLabel')}
            value={patientsOwnerId}
            onChange={setPatientsOwnerId}
            options={[
              { value: '', label: t('reports:cards.patients.allOwners') },
              ...owners.map(o => ({ value: o._id, label: o.nombre })),
            ]}
          />
        </ReportCard>

        {/* Miembros */}
        <ReportCard
          t={t}
          title={t('reports:cards.members.title')}
          description={t('reports:cards.members.description')}
          onExport={handleExportMembers}
          state={membersState}
          format={membersFormat}
          onFormatChange={setMembersFormat}
        >
          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('reports:cards.members.filterRoleLabel')}
              value={membersRole}
              onChange={setMembersRole}
              options={[
                { value: '', label: t('reports:cards.members.allRoles') },
                { value: 'admin', label: t('reports:cards.members.roles.admin') },
                { value: 'veterinario', label: t('reports:cards.members.roles.veterinario') },
                { value: 'auditor', label: t('reports:cards.members.roles.auditor') },
                { value: 'recepcion', label: t('reports:cards.members.roles.recepcion') },
              ]}
            />
            <Select
              label={t('reports:cards.members.filterStatusLabel')}
              value={membersStatus}
              onChange={setMembersStatus}
              options={[
                { value: '', label: t('reports:cards.members.allStatuses') },
                { value: 'active', label: t('reports:cards.members.statuses.active') },
                { value: 'inactive', label: t('reports:cards.members.statuses.inactive') },
                { value: 'pending', label: t('reports:cards.members.statuses.pending') },
              ]}
            />
          </div>
        </ReportCard>

        {/* Citas */}
        <ReportCard
          t={t}
          title={t('reports:cards.appointments.title')}
          description={t('reports:cards.appointments.description')}
          onExport={handleExportAppointments}
          state={appointsState}
          format={appointsFormat}
          onFormatChange={setAppointsFormat}
        >
          <div className="grid grid-cols-2 gap-4">
            <DateInput
              label={t('reports:cards.appointments.dateFrom')}
              value={appointsStart}
              onChange={setAppointsStart}
            />
            <DateInput
              label={t('reports:cards.appointments.dateTo')}
              value={appointsEnd}
              onChange={setAppointsEnd}
            />
          </div>
          <Select
            label={t('reports:cards.appointments.filterStatusLabel')}
            value={appointsStatus}
            onChange={setAppointsStatus}
            options={[
              { value: '', label: t('reports:cards.appointments.allStatuses') },
              { value: 'scheduled', label: t('reports:cards.appointments.statuses.scheduled') },
              { value: 'completed', label: t('reports:cards.appointments.statuses.completed') },
              { value: 'cancelled', label: t('reports:cards.appointments.statuses.cancelled') },
              { value: 'no_show', label: t('reports:cards.appointments.statuses.no_show') },
            ]}
          />
        </ReportCard>

        {/* Registros clínicos */}
        <ReportCard
          t={t}
          title={t('reports:cards.clinicalRecords.title')}
          description={t('reports:cards.clinicalRecords.description')}
          onExport={handleExportClinical}
          state={clinicalState}
          format={clinicalFormat}
          onFormatChange={setClinicalFormat}
        >
          <div className="grid grid-cols-2 gap-4">
            <DateInput
              label={t('reports:cards.clinicalRecords.dateFrom')}
              value={clinicalStart}
              onChange={setClinicalStart}
            />
            <DateInput
              label={t('reports:cards.clinicalRecords.dateTo')}
              value={clinicalEnd}
              onChange={setClinicalEnd}
            />
          </div>
          <Select
            label={t('reports:cards.clinicalRecords.filterPatientLabel')}
            value={clinicalPatient}
            onChange={setClinicalPatient}
            options={[
              { value: '', label: t('reports:cards.clinicalRecords.allPatients') },
              ...patients.map(p => ({ value: p._id, label: p.nombre })),
            ]}
          />
        </ReportCard>

      </div>
    </div>
  );
};

export default Reports;