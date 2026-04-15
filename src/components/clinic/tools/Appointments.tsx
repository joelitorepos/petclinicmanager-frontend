// src/components/clinic/tools/Appointments.tsx

import { useMemo, useState, useEffect } from "react";
import DataTableWithSearch, {
  type ColumnDef,
  type CellConfig,
} from "../../common/DataTableWithSearch";
import { useAuthAwareFetch } from "../../../hooks/useAuthAwareFetch";
import { useLanguage } from "../../../hooks/useLanguage";
import BASEURL from "../../../hooks/BaseUrl";
import useFetch from "../../../hooks/useFetch";
import { type Appointment } from "../../../interfaces/Appointment";
import { type Patient } from "../../../interfaces/Patient";
import { type Owner } from "../../../interfaces/Owner";
import { type WorkspaceMember } from "../../../interfaces/WorkspaceMember";
import { type Workspace } from "../../../interfaces/Workspace";
import Input from "../../ui/Input";
import Select from "../../ui/Select";
import DateInput from "../../ui/DateInput";
import SelectWithSearch from "../../ui/SelectWithSearch";
import MassiveImport from "../../ui/MassiveImport";
import { useAuth } from "../../../hooks/useAuth";
import useDelete from "../../../hooks/useDelete";
import { z } from "zod";
import Button from "../../ui/Button";
import {
  CreateConfirmationModal,
  DeleteConfirmationModal,
  UpdateConfirmationModal,
} from "../../modal/ConfirmationModals";
import findErichedData from "../../../utils/findEnrichedData";
import { useEditableTable } from "../../../hooks/useEditableTable";
import mongoose from "mongoose";
import ExcelTable from "../../excelTable/ExcelTable";
import {
  APPOINTMENT_EXAMPLE_DATA,
  APPOINTMENTS_HEADERS,
} from "../../excelTable/appointmentExample";
import InfoNote from "../../ui/InfoNote";

const AppointmentSchema = z
  .object({
    patientId: z.string().min(1, "Paciente es obligatorio"),
    ownerId: z.string().min(1, "Dueño es obligatorio"),
    veterinarianId: z.string().min(1, "Veterinario es obligatorio"),
    startTime: z
      .string()
      .min(1, "Fecha y hora de inicio es obligatoria")
      .refine(
        (val) => !isNaN(new Date(val).getTime()),
        "Fecha de inicio inválida",
      ),
    endTime: z
      .string()
      .min(1, "Fecha y hora de fin es obligatoria")
      .refine(
        (val) => !isNaN(new Date(val).getTime()),
        "Fecha de fin inválida",
      ),
    type: z.string().min(1, "Tipo de cita es obligatorio"),
    // 'completed' no está disponible: solo se llega a ese estado creando un registro clínico
    status: z
      .enum(["scheduled", "confirmed", "in_progress", "cancelled", "no_show"])
      .optional(),
    notes: z.string().optional().default(""),
    reason: z.string().optional().default(""),
  })
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      return end > start;
    },
    {
      message: "La fecha de fin debe ser posterior a la fecha de inicio",
      path: ["endTime"],
    },
  );

type AppointmentPayload = z.infer<typeof AppointmentSchema>;

interface CurrentWorkspaceResponse {
  success: boolean;
  workspace: Workspace;
}
interface PatientsListResponse {
  success: boolean;
  patients: Patient[];
}
interface OwnersListResponse {
  success: boolean;
  owners: Owner[];
}
interface VeterinariansListResponse {
  success: boolean;
  members: WorkspaceMember[];
}
interface AppointmentsListResponse {
  success: boolean;
  appointments: Appointment[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

// 'completed' excluido: no se puede asignar manualmente desde la vista
type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "cancelled"
  | "no_show";
type AppointmentType =
  | "consulta"
  | "vacuna"
  | "cirugia"
  | "seguimiento"
  | string;

interface PopulatedPatient {
  _id: string;
  nombre: string;
  codigo?: string;
}

interface PopulatedOwner {
  _id: string;
  nombre: string;
  telefono?: string;
}

interface PopulatedVeterinarian {
  _id: string;
  name?: string; // populate manual devuelve name directamente
  userId?: {
    name: string;
    email: string;
  };
}

interface PopulatedAppointment extends Omit<
  Appointment,
  "patientId" | "ownerId" | "veterinarianId"
> {
  patientId: PopulatedPatient | string | mongoose.Types.ObjectId;
  ownerId: PopulatedOwner | string | mongoose.Types.ObjectId;
  veterinarianId: PopulatedVeterinarian | string | mongoose.Types.ObjectId;
}

// algunos componentes requieren que se haga el extends Record<string, unknown> como SelectWhitSearch
interface IPatient extends Patient, Record<string, unknown> {}
interface IWorkspaceMember extends WorkspaceMember, Record<string, unknown> {}

const Appointments = () => {
  const { t } = useLanguage();
  // Form states
  const [patientId, setPatientId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [veterinarianId, setVeterinarianId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [type, setType] = useState<AppointmentType>("");
  const [status, setStatus] = useState<AppointmentStatus | "">("");
  const [notes, setNotas] = useState("");
  const [reason, setReason] = useState("");

  const opcionesEstado = useMemo<
    Array<{ value: AppointmentStatus; label: string }>
  >(
    () => [
      { value: "scheduled", label: t("appointments:options.status.scheduled") },
      { value: "confirmed", label: t("appointments:options.status.confirmed") },
      {
        value: "in_progress",
        label: t("appointments:options.status.in_progress"),
      },
      { value: "cancelled", label: t("appointments:options.status.cancelled") },
      { value: "no_show", label: t("appointments:options.status.no_show") },
    ],
    [t],
  );

  const opcionesParaTabla = useMemo<Array<{ value: string; label: string }>>(
    () => [
      ...opcionesEstado,
      { value: "completed", label: t("appointments:options.status.completed") },
    ],
    [opcionesEstado, t],
  );

  const opcionesTipo = useMemo<Array<{ value: string; label: string }>>(
    () => [
      { value: "consulta", label: t("appointments:options.type.consulta") },
      { value: "vacuna", label: t("appointments:options.type.vacuna") },
      { value: "cirugia", label: t("appointments:options.type.cirugia") },
      {
        value: "seguimiento",
        label: t("appointments:options.type.seguimiento"),
      },
    ],
    [t],
  );

  // Estado para manejar errores de validación local
  const [formError, setFormError] = useState<string | null>(null);
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteAppointmentId, setDeleteAppointmentId] = useState<string | null>(
    null,
  );
  const [deleteAppointmentInfo, setDeleteAppointmentInfo] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [postError, setPostError] = useState<Error | null>(null);
  const [tableFeedback, setTableFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateAppointmentId, setUpdateAppointmentId] = useState<string | null>(
    null,
  );
  const [changedFields, setChangedFields] = useState<Record<
    string,
    unknown
  > | null>(null);

  const { user } = useAuth();

  // Cargar Workspace
  const { data: currentWorkspaceData } = useFetch<CurrentWorkspaceResponse>(
    `${BASEURL}/api/workspaces/current`,
  );
  const workspaceId = currentWorkspaceData?.workspace?._id;

  // Cargar datos necesarios
  const { data: patientsResponse, loading: loadingPatients } =
    useAuthAwareFetch<PatientsListResponse>(
      workspaceId ? `${BASEURL}/api/workspaces/${workspaceId}/patients` : "",
      [workspaceId],
      { skipInitialFetch: !workspaceId },
    );

  const { data: ownersResponse, loading: loadingOwners } =
    useAuthAwareFetch<OwnersListResponse>(
      workspaceId ? `${BASEURL}/api/workspaces/${workspaceId}/owners` : "",
      [workspaceId],
      { skipInitialFetch: !workspaceId },
    );

  const { data: veterinariansResponse, loading: loadingVeterinarians } =
    useAuthAwareFetch<VeterinariansListResponse>(
      workspaceId ? `${BASEURL}/api/workspaces/${workspaceId}/members` : "",
      [workspaceId],
      { skipInitialFetch: !workspaceId },
    );

  const {
    data: appointmentsResponse,
    loading: loadingAppointments,
    error: errorAppointments,
    refetch: refetchAppointments,
  } = useAuthAwareFetch<AppointmentsListResponse>(
    workspaceId ? `${BASEURL}/api/workspaces/${workspaceId}/appointments` : "",
    [workspaceId],
    { skipInitialFetch: !workspaceId },
  );

  // DELETE hook
  const { deleteData: deleteAppointment } = useDelete<{ message: string }>(
    `${BASEURL}/api/workspaces/${workspaceId}/appointments`,
  );

  // Definir Columnas
  const columns: ColumnDef[] = [
    {
      field: "patientId",
      header: t("appointments:labels.patient"),
      className: "w-3/12",
    },
    {
      field: "ownerId",
      header: t("appointments:labels.owner"),
      className: "w-3/12",
    },
    {
      field: "veterinarianId",
      header: t("appointments:labels.veterinarian"),
      className: "w-3/12",
    },
    {
      field: "startTime",
      header: t("appointments:labels.startTime"),
      className: "w-3/12",
    },
    {
      field: "endTime",
      header: t("appointments:labels.endTime"),
      className: "w-3/12",
    },
    {
      field: "status",
      header: t("appointments:labels.status"),
      className: "w-2/12",
    },
    {
      field: "type",
      header: t("appointments:labels.type"),
      className: "w-2/12",
    },
    {
      field: "reason",
      header: t("appointments:labels.reason"),
      className: "w-4/12",
      multiline: true,
    },
    {
      field: "notes",
      header: t("appointments:labels.notes"),
      className: "w-4/12",
      multiline: true,
    },
  ];

  // FIX: Las tres listas de opciones incluyen registros soft-deleted que siguen
  // referenciados en citas existentes, para que SelectCell siempre encuentre la
  // opción y muestre el nombre real en lugar del estado "registro eliminado".

  const patientOptions = useMemo(() => {
    const rawPatients = Array.isArray(patientsResponse)
      ? patientsResponse
      : patientsResponse?.patients || [];

    // 1. Opciones activas
    const activeOptions = rawPatients.map((patient) => ({
      id: String(patient._id || ""),
      label: patient.nombre,
      subLabel: patient.codigo || "",
      data: patient as unknown as IPatient,
    }));

    // 2. Agregar pacientes soft-deleted referenciados en citas
    const activeIds = new Set(activeOptions.map((o) => o.id));
    const rawAppointments = appointmentsResponse?.appointments || [];

    rawAppointments.forEach((apt: PopulatedAppointment) => {
      if (apt.patientId && typeof apt.patientId === "object") {
        const p = apt.patientId as PopulatedPatient;
        const id = String(p._id || "");
        if (id && !activeIds.has(id)) {
          activeIds.add(id);
          activeOptions.push({
            id,
            label: p.nombre || t("appointments:default.noName"),
            subLabel: p.codigo || "",
            data: p as unknown as IPatient,
          });
        }
      }
    });

    return activeOptions;
  }, [patientsResponse, appointmentsResponse, t]);

  const ownerOptions = useMemo(() => {
    const rawOwners = Array.isArray(ownersResponse)
      ? ownersResponse
      : ownersResponse?.owners || [];

    // 1. Opciones activas
    const activeOptions = rawOwners.map((owner) => {
      let phoneDisplay = "";
      if (
        owner.telefono &&
        typeof owner.telefono === "object" &&
        "number" in owner.telefono
      ) {
        const { country, number } = owner.telefono as {
          country: string;
          number: string;
        };
        phoneDisplay = [t(`common:countries.${country}`), number]
          .filter(Boolean)
          .join(" ")
          .trim();
      }
      return {
        id: String(owner._id || ""),
        label: owner.nombre || t("appointments:default.noName"),
        subLabel: phoneDisplay || owner.email || undefined,
        metadata: [owner.email ? `Email: ${owner.email}` : ""].filter(Boolean),
        data: owner,
      };
    });

    // 2. Agregar dueños soft-deleted referenciados en citas
    const activeIds = new Set(activeOptions.map((o) => o.id));
    const rawAppointments = appointmentsResponse?.appointments || [];

    rawAppointments.forEach((apt: PopulatedAppointment) => {
      if (apt.ownerId && typeof apt.ownerId === "object") {
        const o = apt.ownerId as PopulatedOwner;
        const id = String(o._id || "");
        if (id && !activeIds.has(id)) {
          activeIds.add(id);
          activeOptions.push({
            id,
            label: o.nombre || t("appointments:default.noName"),
            subLabel: undefined,
            metadata: [],
            data: o as unknown as Owner,
          });
        }
      }
    });

    return activeOptions;
  }, [ownersResponse, appointmentsResponse, t]);

  const veterinarianOptions = useMemo(() => {
    const rawVets = Array.isArray(veterinariansResponse)
      ? veterinariansResponse
      : veterinariansResponse?.members || [];

    // 1. Crear un mapa de TODOS los miembros para búsqueda rápida por ID,
    // sin importar su rol o estado.
    const allMembersMap = new Map(rawVets.map((m) => [String(m._id), m]));

    // 2. Opciones ACTIVAS (Solo veterinarios actuales)
    const activeOptions = rawVets
      .filter(
        (member) =>
          member.role === "veterinario" &&
          !member.deleted &&
          member.status !== "removed",
      )
      .map((member) => {
        const userData =
          typeof member.userId === "object" ? member.userId : null;
        return {
          id: String(member._id),
          label:
            userData?.name || member.name || t("appointments:default.noName"),
          subLabel: userData?.email || "",
          data: member as unknown as IWorkspaceMember,
          inactive: false,
        };
      });

    const activeIds = new Set(activeOptions.map((o) => o.id));
    const rawAppointments = appointmentsResponse?.appointments || [];

    // 3. Recuperar de las citas
    rawAppointments.forEach((apt: PopulatedAppointment) => {
      if (apt.veterinarianId) {
        // Extraer ID ya sea objeto o string
        const vData = apt.veterinarianId as PopulatedVeterinarian;
        const id = String(typeof vData === "object" ? vData._id : vData);

        if (id && !activeIds.has(id)) {
          // Intentar obtener los datos del miembro desde la lista general (rawVets)
          // aunque ya no sea veterinario
          const memberFromList = allMembersMap.get(id);
          const userData =
            memberFromList && typeof memberFromList.userId === "object"
              ? memberFromList.userId
              : null;

          // Priorizar datos de la lista general, fallback a los datos del populate de la cita
          const name =
            userData?.name ||
            memberFromList?.name ||
            vData.name ||
            vData.userId?.name ||
            t("appointments:default.noName");
          const email = userData?.email || vData.userId?.email || "";

          activeIds.add(id);
          activeOptions.push({
            id,
            label: name,
            subLabel: email,
            data: (memberFromList || vData) as unknown as IWorkspaceMember,
            inactive: true, // Esto hará que SelectCell no lo muestre en el editor
          });
        }
      }
    });

    return activeOptions;
  }, [veterinariansResponse, appointmentsResponse, t]);

  // Transformar datos del backend
  const tableDataFromBackend = useMemo(() => {
    const rawList = appointmentsResponse?.appointments || [];
    return rawList.map((apt: PopulatedAppointment) => {
      const patientIdStr =
        typeof apt.patientId === "object" ? apt.patientId?._id : apt.patientId;
      const ownerIdStr =
        typeof apt.ownerId === "object" ? apt.ownerId?._id : apt.ownerId;
      const vetIdStr =
        typeof apt.veterinarianId === "object"
          ? apt.veterinarianId?._id
          : apt.veterinarianId;

      return {
        id: apt._id?.toString() || "",
        patientId: String(patientIdStr || ""),
        ownerId: String(ownerIdStr || ""),
        veterinarianId: String(vetIdStr || ""),
        startTime: apt.startTime,
        endTime: apt.endTime,
        status: apt.status,
        type: apt.type,
        notes: apt.notes || "",
        reason: apt.reason || "",
      };
    });
  }, [appointmentsResponse]);

  const originalData = useMemo(
    () => [...tableDataFromBackend],
    [tableDataFromBackend],
  );

  const {
    data: tableData,
    handleCellChange,
    updateData,
  } = useEditableTable(tableDataFromBackend);

  useEffect(() => {
    updateData(tableDataFromBackend);
  }, [tableDataFromBackend, updateData]);

  useEffect(() => {
    if (!tableFeedback) return;
    const timer = setTimeout(() => setTableFeedback(null), 3500);
    return () => clearTimeout(timer);
  }, [tableFeedback]);

  const enrichedPatient = useMemo(() => {
    return findErichedData(patientOptions, patientId || "");
  }, [patientOptions, patientId]);

  const enrichedOwner = useMemo(() => {
    return findErichedData(ownerOptions, ownerId || "");
  }, [ownerOptions, ownerId]);

  const enrichedVeterinarian = useMemo(() => {
    return findErichedData(veterinarianOptions, veterinarianId || "");
  }, [veterinarianOptions, veterinarianId]);

  const cellConfigs = useMemo(() => {
    const configs: Partial<
      Record<
        keyof (typeof tableDataFromBackend)[0],
        CellConfig<IPatient | Owner | IWorkspaceMember>
      >
    > = {
      patientId: {
        type: "select",
        namespace: "patients",
        options: patientOptions,
        displayKeys: ["codigo"],
      },
      ownerId: {
        type: "select",
        namespace: "owners",
        options: ownerOptions,
        displayKeys: ["telefono"],
      },
      veterinarianId: {
        type: "select",
        namespace: "veterinarians",
        options: veterinarianOptions,
        displayKeys: [],
      },
      // En la tabla solo se muestran los estados permitidos.
      // Las citas con status 'completed' se muestran en modo lectura (no editable desde aquí).
      status: {
        type: "select",
        namespace: "appointments",
        options: opcionesParaTabla.map((s) => ({
          id: s.value,
          label: s.label,
        })),
        displayKeys: [],
      },
      type: {
        type: "select",
        namespace: "appointments",
        options: opcionesTipo.map((t) => ({ id: t.value, label: t.label })),
        displayKeys: [],
      },
      startTime: {
        type: "datetime-local",
      },
      endTime: {
        type: "datetime-local",
      },
      notes: { type: "text", multiline: true, rows: 3 },
      reason: { type: "text", multiline: true, rows: 2 },
    };
    return configs;
  }, [
    patientOptions,
    ownerOptions,
    veterinarianOptions,
    opcionesParaTabla,
    opcionesTipo,
  ]);

  // Preparar payload con validaciones de negocio
  const preparePayload = (): AppointmentPayload | null => {
    setFormError(null);

    if (
      !patientId ||
      !ownerId ||
      !veterinarianId ||
      !startTime ||
      !endTime ||
      !type
    ) {
      setFormError(t("appointments:messages.errorRequiredFields"));
      return null;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isNaN(startDate.getTime())) {
      setFormError("Fecha de inicio inválida");
      return null;
    }

    if (isNaN(endDate.getTime())) {
      setFormError("Fecha de fin inválida");
      return null;
    }

    if (endDate <= startDate) {
      setFormError(t("appointments:messages.errorEndTimeBeforeStart"));
      return null;
    }

    const payload: AppointmentPayload = {
      patientId,
      ownerId,
      veterinarianId,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      type,
      status: status || undefined,
      notes: notes.trim(),
      reason: reason.trim(),
    };

    const result = AppointmentSchema.safeParse(payload);

    if (!result.success) {
      console.error("Errores de validación Zod:", result.error.format());
      setFormError("Error de validación en los datos. Revisa los campos.");
      return null;
    }

    return result.data;
  };

  const handleOpenModal = () => {
    setFormError(null);
    setPostError(null);

    if (!workspaceId) {
      setFormError(t("appointments:messages.errorWorkspaceLoad"));
      return;
    }

    const payload = preparePayload();
    if (!payload) {
      return;
    }

    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    const payload = preparePayload();
    if (!payload) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${BASEURL}/api/workspaces/${workspaceId}/appointments`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || t("appointments:messages.errorPostGeneral"),
        );
      }

      // Limpiar formulario
      setPatientId("");
      setOwnerId("");
      setVeterinarianId("");
      setStartTime("");
      setEndTime("");
      setType("");
      setStatus("");
      setNotas("");
      setReason("");

      await refetchAppointments();
      setTableFeedback({
        type: "success",
        message: t("appointments:messages.successPost"),
      });
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

  const handleDelete = (appointmentId: string) => {
    const appointment = tableDataFromBackend.find(
      (a) => a.id === appointmentId,
    );
    if (!appointment) return;

    const patient = patientOptions.find((p) => p.id === appointment.patientId);
    const patientName = patient?.label || t("appointments:default.appointment");

    setDeleteAppointmentId(appointmentId);
    setDeleteAppointmentInfo(patientName);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteAppointmentId) return;

    try {
      const result = await deleteAppointment(deleteAppointmentId);
      if (result) {
        await refetchAppointments();
        setTableFeedback({
          type: "success",
          message: t("appointments:messages.successDelete"),
        });
      }
    } catch (err) {
      console.error(err);
      setTableFeedback({
        type: "error",
        message: t("appointments:messages.errorDeleteGeneral"),
      });
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteAppointmentId(null);
      setDeleteAppointmentInfo(null);
    }
  };

  const handleUpdate = (id: string) => {
    const row = tableData.find((r) => r.id === id);
    const originalRow = originalData.find((r) => r.id === id);

    if (row && originalRow) {
      const changes: Record<string, unknown> = {};
      (Object.keys(row) as Array<keyof typeof row>).forEach((key) => {
        if (key !== "id" && row[key] !== originalRow[key]) {
          changes[key] = row[key];
        }
      });

      // Bloquear cambio de status a 'completed' desde la tabla
      if (changes.status === "completed") {
        setTableFeedback({
          type: "error",
          message: t("appointments:messages.errorCompletedViaTable"),
        });
        return;
      }

      // Validación rápida en tabla: si se ha tocado startTime o endTime,
      // comprobar que la combinación final siga siendo válida (end > start).
      if ("startTime" in changes || "endTime" in changes) {
        const startRaw =
          typeof row.startTime === "string"
            ? row.startTime
            : typeof originalRow.startTime === "string"
              ? originalRow.startTime
              : undefined;
        const endRaw =
          typeof row.endTime === "string"
            ? row.endTime
            : typeof originalRow.endTime === "string"
              ? originalRow.endTime
              : undefined;

        if (startRaw && endRaw) {
          const startDate = new Date(startRaw);
          const endDate = new Date(endRaw);
          if (
            !isNaN(startDate.getTime()) &&
            !isNaN(endDate.getTime()) &&
            endDate <= startDate
          ) {
            setTableFeedback({
              type: "error",
              message: t("appointments:messages.errorEndTimeBeforeStart"),
            });
            return;
          }
        }
      }

      if (Object.keys(changes).length > 0) {
        setChangedFields(changes);
        setUpdateAppointmentId(id);
        setIsUpdateModalOpen(true);
      }
    }
  };

  const handleConfirmUpdate = async () => {
    if (!updateAppointmentId || !changedFields || !workspaceId) return;

    // Doble verificación antes de enviar
    if (changedFields.status === "completed") {
      setTableFeedback({
        type: "error",
        message: t("appointments:messages.errorCompletedViaTable"),
      });
      setIsUpdateModalOpen(false);
      return;
    }

    setLoading(true);
    setPostError(null);

    try {
      const response = await fetch(
        `${BASEURL}/api/workspaces/${workspaceId}/appointments/${updateAppointmentId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changedFields),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || t("appointments:messages.errorUpdateGeneral"),
        );
      }

      await refetchAppointments();
      setIsUpdateModalOpen(false);
      setUpdateAppointmentId(null);
      setChangedFields(null);
      setTableFeedback({
        type: "success",
        message: t("appointments:messages.successUpdate"),
      });
    } catch (error) {
      console.error("Error en PATCH:", error);
      setPostError(error as Error);
      setTableFeedback({
        type: "error",
        message: t("appointments:messages.errorUpdateGeneral"),
      });
    } finally {
      setLoading(false);
    }
  };

  // Chequeos de carga y error
  if (!workspaceId)
    return <div>{t("appointments:messages.loadingWorkspace")}</div>;
  if (errorAppointments)
    return (
      <div className="text-red-600">
        {t("appointments:messages.errorGeneral")}
      </div>
    );
  if (
    loadingAppointments ||
    loadingPatients ||
    loadingOwners ||
    loadingVeterinarians ||
    (!tableDataFromBackend.length &&
      !errorAppointments &&
      !appointmentsResponse)
  ) {
    return (
      <div className="p-8 text-center text-gray-500">
        {t("appointments:messages.loadingAppointments")}
      </div>
    );
  }

  const appointmentInstructions = (
    <>
      <p className="font-semibold mb-2">
        {t("appointments:export_explanation.title")}
      </p>
      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
        <li>{t("appointments:export_explanation.acepted_formats")}</li>
        <li>{t("appointments:export_explanation.required_fields")}</li>
        <li>{t("appointments:export_explanation.optional_fields")}</li>
        <li>{t("appointments:export_explanation.validation_phone")}</li>
        <li>{t("appointments:export_explanation.visual_example")}</li>
      </ul>
    </>
  );

  return (
    <div className="space-y-6">
      {/* <InfoNote>{appointmentInstructions}</InfoNote>

      <ExcelTable
        headers={APPOINTMENTS_HEADERS}
        examples={APPOINTMENT_EXAMPLE_DATA}
        className="mb-8"
      />

      <MassiveImport
        entity="Appointment"
        workspaceId={workspaceId}
        userId={user?._id || ""}
        baseUrl={BASEURL}
        onImportSuccess={refetchAppointments}
      /> */}

      <h2 className="text-2xl font-bold mb-6 text-[rgb(var(--text))]">
        {t("appointments:titles.form")}
      </h2>

      <div className="space-y-4">
        <SelectWithSearch<IPatient>
          label={t("appointments:labels.patient")}
          value={patientId}
          onChange={setPatientId}
          options={patientOptions}
          placeholder={t("appointments:placeholders.selectPatient")}
          searchPlaceholder={t("appointments:placeholders.searchPatient")}
          showDetails={true}
          required
        />

        <SelectWithSearch<Owner>
          label={t("appointments:labels.owner")}
          value={ownerId}
          onChange={setOwnerId}
          options={ownerOptions}
          placeholder={t("appointments:placeholders.selectOwner")}
          searchPlaceholder={t("appointments:placeholders.searchOwner")}
          showDetails={true}
          required
        />

        <SelectWithSearch<IWorkspaceMember>
          label={t("appointments:labels.veterinarian")}
          value={veterinarianId}
          onChange={setVeterinarianId}
          options={veterinarianOptions}
          placeholder={t("appointments:placeholders.selectVeterinarian")}
          searchPlaceholder={t("appointments:placeholders.searchVeterinarian")}
          showDetails={true}
          required
        />

        <DateInput
          label={t("appointments:labels.startTime")}
          value={startTime}
          onChange={setStartTime}
          type="datetime-local"
          required={true}
        />

        <InfoNote>05/03/2026, 11:00 a.m.</InfoNote>

        <DateInput
          label={t("appointments:labels.endTime")}
          value={endTime}
          onChange={setEndTime}
          type="datetime-local"
          required={true}
        />

        <InfoNote>05/03/2026, 11:30 a.m.</InfoNote>

        <Select
          label={t("appointments:labels.type")}
          value={type}
          onChange={(val) => setType(val as AppointmentType)}
          options={opcionesTipo}
          placeholder={t("appointments:placeholders.type")}
          required={true}
        />

        <Select
          label={t("appointments:labels.status")}
          value={status}
          onChange={(val) => setStatus(val as AppointmentStatus)}
          options={opcionesEstado}
          placeholder={t("appointments:placeholders.status")}
          required={false}
        />

        <Input
          value={reason}
          onChange={setReason}
          placeholder={t("appointments:placeholders.reason")}
          required={false}
          label={t("appointments:labels.reason")}
        />

        <Input
          value={notes}
          onChange={setNotas}
          placeholder={t("appointments:placeholders.notes")}
          required={false}
          label={t("appointments:labels.notes")}
        />

        <Button onClick={handleOpenModal} disabled={loading}>
          {loading
            ? t("appointments:buttons.form.submitLoading")
            : t("appointments:buttons.form.submit")}
        </Button>
      </div>

      {loading && (
        <p className="mt-4 text-blue-600">
          {t("appointments:feedback.creatingAppointment")}
        </p>
      )}
      {errorMessage && <p className="mt-4 text-red-600">{errorMessage}</p>}
      {tableFeedback && (
        <p
          className={`mt-4 ${tableFeedback.type === "success" ? "text-green-600" : "text-red-600"}`}
        >
          {tableFeedback.message}
        </p>
      )}

      <CreateConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        loading={loading}
        title={t("appointments:modals.create.title")}
        data={{
          patientLabel: enrichedPatient?.label,
          patientSubLabel: enrichedPatient?.subLabel,
          ownerLabel: enrichedOwner?.label,
          ownerSubLabel: enrichedOwner?.subLabel,
          veterinarianLabel: enrichedVeterinarian?.label,
          veterinarianSubLabel: enrichedVeterinarian?.subLabel,
          startTime,
          endTime,
          type,
          status,
          reason,
          notes,
        }}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteAppointmentId(null);
          setDeleteAppointmentInfo(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={deleteAppointmentInfo}
      />

      <UpdateConfirmationModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdateAppointmentId(null);
          setChangedFields(null);
        }}
        onConfirm={handleConfirmUpdate}
        changedFields={changedFields}
      />

      <div className="pt-4 space-y-8">
        <div className="flex justify-between items-center">
          <Button onClick={() => refetchAppointments()} variant="primary">
            {t("appointments:buttons.table.refetch")}
          </Button>
        </div>

        <DataTableWithSearch
          title={t("appointments:titles.table")}
          data={tableData}
          columns={columns}
          cellConfigs={cellConfigs}
          onRowDelete={handleDelete}
          onRowUpdate={handleUpdate}
          onCellChange={handleCellChange}
          searchPlaceholder={t("appointments:placeholders.search")}
          emptyMessage={t("appointments:messages.emptyTable")}
          height="65vh"
        />
      </div>
    </div>
  );
};

export default Appointments;
