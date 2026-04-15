// src/components/clinic/tools/ClinicalRecords.tsx

import { useMemo, useState, useEffect, useRef } from "react";
import DataTableWithSearch, {
  type ColumnDef,
  type CellConfig,
} from "../../common/DataTableWithSearch";
import { useAuthAwareFetch } from "../../../hooks/useAuthAwareFetch";
import { useLanguage } from "../../../hooks/useLanguage";
import BASEURL from "../../../hooks/BaseUrl";
import useFetch from "../../../hooks/useFetch";
import {
  type ClinicalRecord,
  type Diagnostic,
  type Treatment,
  type Vaccination,
} from "../../../interfaces/ClinicalRecord";
import { type Patient } from "../../../interfaces/Patient";
import { type Appointment } from "../../../interfaces/Appointment";
import { type WorkspaceMember } from "../../../interfaces/WorkspaceMember";
import { type Workspace } from "../../../interfaces/Workspace";
import mongoose from "mongoose";
import Input from "../../ui/Input";
import DateInput from "../../ui/DateInput";
import SelectWithSearch from "../../ui/SelectWithSearch";
// import MassiveImport from "../../ui/MassiveImport";
// import { useAuth } from "../../../hooks/useAuth";
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
// import ExcelTable from "../../excelTable/ExcelTable";
// import {
//   CLINICAL_RECORD_EXAMPLE_DATA,
//   CLINICAL_RECORDS_HEADERS,
// } from "../../excelTable/clinicalRecordExample";
// import InfoNote from "../../ui/InfoNote";
import DiagnosticsSection from "../../common/DiagnosticSection";
import TreatmentsSection from "../../common/TreatmentSection";
import VaccinationsSection from "../../common/Vaccinationssection";
import { type PhotoChangePayload } from "../../table/PhotoArrayCell";

const DiagnosticSchema = z.object({
  diagnosis: z.string().min(1, "Diagnóstico obligatorio"),
  notes: z.string().optional(),
});

const TreatmentSchema = z.object({
  name: z.string().min(1, "Tratamiento obligatorio"),
  dose: z.string().optional(),
  duration: z.string().optional(),
});

const VaccinationSchema = z.object({
  vaccine: z.string().min(1, "Vacuna obligatoria"),
  date: z.coerce.date(),
  nextDue: z.coerce.date().optional(),
});

const ClinicalRecordSchema = z.object({
  patientId: z.string().min(1, "Paciente obligatorio"),
  appointmentId: z.string().optional().or(z.literal("")),
  date: z.coerce.date(),
  veterinarianId: z.string().min(1, "Veterinario obligatorio"),
  weight: z.coerce.number().positive().optional(),
  temperature: z.coerce.number().positive().optional(),
  diagnostics: z.array(DiagnosticSchema).optional(),
  treatments: z.array(TreatmentSchema).optional(),
  vaccinations: z.array(VaccinationSchema).optional(),
  notes: z.string().optional().or(z.literal("")),
});

type ClinicalRecordPayload = z.infer<typeof ClinicalRecordSchema>;

interface CurrentWorkspaceResponse {
  success: boolean;
  workspace: Workspace;
}
interface PatientsListResponse {
  success: boolean;
  patients: Patient[];
}
interface AppointmentsListResponse {
  success: boolean;
  appointments: Appointment[];
}
interface VeterinariansListResponse {
  success: boolean;
  members: WorkspaceMember[];
}
interface ClinicalRecordsListResponse {
  success: boolean;
  records: ClinicalRecord[];
  pagination?: { page: number; limit: number; total: number };
}

interface PopulatedPatient {
  _id: string;
  nombre: string;
  codigo?: string;
}
interface PopulatedAppointment {
  _id: string;
  startTime: Date | string;
  type: string;
}
interface PopulatedVeterinarian {
  _id: string;
  name?: string;
  userId?: { name: string; email: string };
}

interface PopulatedClinicalRecord
  extends Omit<
    ClinicalRecord,
    "patientId" | "appointmentId" | "veterinarianId"
  > {
  patientId: PopulatedPatient | string | mongoose.Types.ObjectId;
  appointmentId?: PopulatedAppointment | string | mongoose.Types.ObjectId;
  veterinarianId: PopulatedVeterinarian | string | mongoose.Types.ObjectId;
}

interface IPatient extends Patient, Record<string, unknown> {}
interface IWorkspaceMember extends WorkspaceMember, Record<string, unknown> {}
interface IAppointment extends Appointment, Record<string, unknown> {}

const ClinicalRecords = () => {
  // Form states
  const [patientId, setPatientId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [date, setDate] = useState("");
  const [veterinarianId, setVeterinarianId] = useState("");
  const [weight, setWeight] = useState("");
  const [temperature, setTemperature] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([
    { diagnosis: "", notes: "" },
  ]);
  const [treatments, setTreatments] = useState<Treatment[]>([
    { name: "", dose: "", duration: "" },
  ]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([
    { vaccine: "", date: new Date(), nextDue: undefined },
  ]);

  const [formError, setFormError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  const [deleteRecordInfo, setDeleteRecordInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [postError, setPostError] = useState<Error | null>(null);
  const [tableFeedback, setTableFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateRecordId, setUpdateRecordId] = useState<string | null>(null);
  const [changedFields, setChangedFields] = useState<Record<
    string,
    unknown
  > | null>(null);

  // ── Ref para payloads de fotos pendientes ────────────────────────────────
  // Guardamos el PhotoChangePayload por rowId FUERA del tableData para no
  // corromper el JSON string de fotos que PhotoArrayCell recibe como `value`.
  // tableData["files"] sigue siendo siempre el string JSON del backend.
  const photoPendingChanges = useRef<Map<string, PhotoChangePayload>>(
    new Map(),
  );

  const { t } = useLanguage();
  // const { user } = useAuth();

  const { data: currentWorkspaceData } = useFetch<CurrentWorkspaceResponse>(
    `${BASEURL}/api/workspaces/current`,
  );
  const workspaceId = currentWorkspaceData?.workspace?._id;

  const { data: patientsResponse, loading: loadingPatients } =
    useAuthAwareFetch<PatientsListResponse>(
      workspaceId ? `${BASEURL}/api/workspaces/${workspaceId}/patients` : "",
      [workspaceId],
      { skipInitialFetch: !workspaceId },
    );

  const { data: appointmentsResponse, loading: loadingAppointments } =
    useAuthAwareFetch<AppointmentsListResponse>(
      workspaceId
        ? `${BASEURL}/api/workspaces/${workspaceId}/appointments`
        : "",
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
    data: recordsResponse,
    loading: loadingRecords,
    error: errorRecords,
    refetch: refetchRecords,
  } = useAuthAwareFetch<ClinicalRecordsListResponse>(
    workspaceId
      ? `${BASEURL}/api/workspaces/${workspaceId}/clinical-records`
      : "",
    [workspaceId],
    { skipInitialFetch: !workspaceId },
  );

  const { deleteData: deleteRecord } = useDelete<{ message: string }>(
    `${BASEURL}/api/workspaces/${workspaceId}/clinical-records`,
  );

  const columns: ColumnDef[] = [
    {
      field: "patientId",
      header: t("clinicalRecords:labels.patient"),
      className: "w-[160px] shrink-0",
    },
    {
      field: "date",
      header: t("clinicalRecords:labels.date"),
      className: "w-[160px] shrink-0",
    },
    {
      field: "veterinarianId",
      header: t("clinicalRecords:labels.veterinarian"),
      className: "w-[160px] shrink-0",
    },
    {
      field: "appointmentId",
      header: t("clinicalRecords:labels.appointment"),
      className: "w-[180px] shrink-0",
      editable: false,
    },
    {
      field: "weight",
      header: t("clinicalRecords:labels.weight"),
      className: "w-[100px] shrink-0",
    },
    {
      field: "temperature",
      header: t("clinicalRecords:labels.temperature"),
      className: "w-[110px] shrink-0",
    },
    {
      field: "diagnostics",
      header: t("clinicalRecords:labels.diagnostics"),
      className: "w-[140px] shrink-0",
    },
    {
      field: "treatments",
      header: t("clinicalRecords:labels.treatments"),
      className: "w-[100px] shrink-0",
    },
    {
      field: "vaccinations",
      header: t("clinicalRecords:labels.vaccinations"),
      className: "w-[100px] shrink-0",
    },
    {
      field: "files",
      header: t("clinicalRecords:labels.photos"),
      className: "w-[100px] shrink-0",
    },
    {
      field: "notes",
      header: t("clinicalRecords:labels.notes"),
      className: "w-[100px] shrink-0",
      multiline: true,
    },
  ];

  const patientOptions = useMemo(() => {
    if (!patientsResponse) return [];
    const rawPatients = Array.isArray(patientsResponse)
      ? patientsResponse
      : patientsResponse.patients || [];
    return rawPatients.map((patient) => ({
      id: patient._id,
      label: patient.nombre,
      subLabel: patient.codigo || "",
      data: patient,
    }));
  }, [patientsResponse]);

  const appointmentOptions = useMemo(() => {
    if (!appointmentsResponse) return [];
    const rawAppointments = Array.isArray(appointmentsResponse)
      ? appointmentsResponse
      : appointmentsResponse.appointments || [];
  
    const now = new Date();
  
    // Mapa completo para lookup posterior
    const allAppointmentsMap = new Map(
      rawAppointments.map((apt) => [apt._id?.toString(), apt])
    );
  
    const makeLabel = (apt: Appointment) => {
      const startDate = new Date(apt.startTime);
      return `${apt.type} (${apt.status}) - ${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}`;
    };
  
    // Solo las activas (no completadas, no canceladas/no-show pasadas) van al selector
    const activeOptions = rawAppointments
      .filter((apt) => {
        const aptDate = new Date(apt.startTime);
        const isPast = aptDate < now;
        const isSpecialStatus = apt.status === "canceled" || apt.status === "no show";
        const isNotCompleted = apt.status !== "completed";
        return (isPast || isSpecialStatus) && isNotCompleted;
      })
      .map((apt) => ({
        id: apt._id?.toString() || "",
        label: makeLabel(apt),
        subLabel: "",
        data: apt as unknown as IAppointment,
        inactive: false,
      }));
    
    const activeIds = new Set(activeOptions.map((o) => o.id));
    
    // Agregar las citas ya referenciadas en registros existentes (ej: completed)
    const rawRecords = recordsResponse?.records || [];
    rawRecords.forEach((rec: PopulatedClinicalRecord) => {
      if (!rec.appointmentId) return;
      const aptData = rec.appointmentId as PopulatedAppointment;
      const id = String(typeof aptData === "object" ? aptData._id : aptData);
      if (!id || activeIds.has(id)) return;
    
      const aptFromList = allAppointmentsMap.get(id);
      const label = aptFromList
        ? makeLabel(aptFromList)
        : typeof aptData === "object"
          ? makeLabel(aptData as unknown as Appointment)
          : id;
    
      activeIds.add(id);
      activeOptions.push({
        id,
        label,
        subLabel: "",
        data: (aptFromList || aptData) as unknown as IAppointment,
        inactive: true, // visible en celda, oculta en el selector al editar
      });
    });
  
    return activeOptions;
  }, [appointmentsResponse, recordsResponse]);

  const veterinarianOptions = useMemo(() => {
    const rawVets = Array.isArray(veterinariansResponse)
      ? veterinariansResponse
      : veterinariansResponse?.members || [];

    const allMembersMap = new Map(rawVets.map((m) => [String(m._id), m]));

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
            userData?.name ||
            member.name ||
            t("clinicalRecords:default.noName"),
          subLabel: userData?.email || "",
          data: member as unknown as IWorkspaceMember,
          inactive: false,
        };
      });

    const activeIds = new Set(activeOptions.map((o) => o.id));
    const rawRecords = recordsResponse?.records || [];

    rawRecords.forEach((rec: PopulatedClinicalRecord) => {
      if (rec.veterinarianId) {
        const vData = rec.veterinarianId as PopulatedVeterinarian;
        const id = String(typeof vData === "object" ? vData._id : vData);

        if (id && !activeIds.has(id)) {
          const memberFromList = allMembersMap.get(id);
          const userData =
            memberFromList && typeof memberFromList.userId === "object"
              ? memberFromList.userId
              : null;

          const name =
            userData?.name ||
            memberFromList?.name ||
            vData.name ||
            vData.userId?.name ||
            t("clinicalRecords:default.noName");
          const email = userData?.email || vData.userId?.email || "";

          activeIds.add(id);
          activeOptions.push({
            id,
            label: name,
            subLabel: email,
            data: (memberFromList || vData) as unknown as IWorkspaceMember,
            inactive: true,
          });
        }
      }
    });

    return activeOptions;
  }, [veterinariansResponse, recordsResponse, t]);

  const tableDataFromBackend = useMemo(() => {
    const rawList = recordsResponse?.records || [];
    return rawList.map((rec: PopulatedClinicalRecord) => {
      const patientIdStr =
        typeof rec.patientId === "object"
          ? rec.patientId?._id
          : rec.patientId;
      const appointmentIdStr =
        rec.appointmentId && typeof rec.appointmentId === "object"
          ? rec.appointmentId?._id
          : rec.appointmentId;
      const vetIdStr =
        typeof rec.veterinarianId === "object"
          ? rec.veterinarianId?._id
          : rec.veterinarianId;

      return {
        id: rec._id?.toString() || "",
        patientId: patientIdStr?.toString() || "",
        appointmentId: appointmentIdStr?.toString() || "",
        veterinarianId: vetIdStr?.toString() || "",
        date: rec.date,
        weight: rec.weight,
        temperature: rec.temperature,
        diagnostics: rec.diagnostics ? JSON.stringify(rec.diagnostics) : "[]",
        treatments: rec.treatments ? JSON.stringify(rec.treatments) : "[]",
        vaccinations: rec.vaccinations
          ? JSON.stringify(rec.vaccinations)
          : "[]",
        // "files" siempre es el JSON string del backend.
        // Los cambios pendientes de fotos se almacenan en photoPendingChanges ref,
        // nunca en este campo, para no romper el value que recibe PhotoArrayCell.
        files: rec.files
          ? typeof rec.files === "string"
            ? rec.files
            : JSON.stringify(rec.files)
          : "[]",
        notes: rec.notes || "",
      };
    });
  }, [recordsResponse]);

  // Al llegar datos frescos del backend, limpiar todos los payloads pendientes.
  // PhotoArrayCell ya recibió el nuevo value y resetea su estado interno.
  useEffect(() => {
    photoPendingChanges.current.clear();
  }, [tableDataFromBackend]);

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

  const enrichedPatient = useMemo(
    () => findErichedData(patientOptions, patientId || ""),
    [patientOptions, patientId],
  );

  const enrichedVeterinarian = useMemo(
    () => findErichedData(veterinarianOptions, veterinarianId || ""),
    [veterinarianOptions, veterinarianId],
  );

  const enrichedAppointment = useMemo(
    () => findErichedData(appointmentOptions, appointmentId || ""),
    [appointmentOptions, appointmentId],
  );

  const cellConfigs = useMemo(() => {
    const configs: Partial<
      Record<
        keyof (typeof tableDataFromBackend)[0],
        CellConfig<IPatient | IWorkspaceMember | IAppointment>
      >
    > = {
      patientId: {
        type: "select",
        namespace: "patients",
        options: patientOptions,
        displayKeys: ["codigo"],
      },
      appointmentId: {
        type: "select",
        namespace: "appointments",
        options: appointmentOptions,
        displayKeys: [],
      },
      veterinarianId: {
        type: "select",
        namespace: "veterinarians",
        options: veterinarianOptions,
        displayKeys: [],
      },
      date: { type: "datetime-local" },
      weight: { type: "text", inputType: "number" },
      temperature: { type: "text", inputType: "number" },
      notes: { type: "text", multiline: true, rows: 3 },
      diagnostics: { type: "diagnostics" },
      treatments: { type: "treatments" },
      vaccinations: { type: "vaccinations" },
      files: { type: "photoArray", maxFiles: 10 },
    };
    return configs;
  }, [patientOptions, appointmentOptions, veterinarianOptions]);

  // ── Handler de cambios de fotos ──────────────────────────────────────────
  // PhotoArrayCell llama a este handler en lugar del handleCellChange genérico.
  // El payload se guarda en el ref, nunca toca tableData["files"].
  const handlePhotoChange = (
    rowId: string,
    _fieldName: string,
    payload: PhotoChangePayload | null,
  ) => {
    if (payload) {
      photoPendingChanges.current.set(rowId, payload);
    } else {
      photoPendingChanges.current.delete(rowId);
    }
  };

  // ── Payload del formulario de creación ───────────────────────────────────
  const preparePayload = (): ClinicalRecordPayload | null => {
    const payload = {
      patientId,
      appointmentId: appointmentId || undefined,
      date: date ? new Date(date) : undefined,
      veterinarianId,
      weight: weight ? parseFloat(weight) : undefined,
      temperature: temperature ? parseFloat(temperature) : undefined,
      diagnostics: diagnostics.filter((d) => d.diagnosis.trim() !== ""),
      treatments: treatments.filter((t) => t.name.trim() !== ""),
      vaccinations: vaccinations.filter((v) => v.vaccine.trim() !== ""),
      notes: notes.trim() || undefined,
    };

    const result = ClinicalRecordSchema.safeParse(payload);
    if (!result.success) {
      console.error("Error de validación:", result.error.format());
      return null;
    }
    return result.data;
  };

  const handleOpenModal = () => {
    setFormError(null);
    setPostError(null);
    if (!workspaceId) {
      setFormError(t("clinicalRecords:messages.errorWorkspaceLoad"));
      return;
    }
    const payload = preparePayload();
    if (!payload) {
      setFormError(t("clinicalRecords:messages.errorValidationForm"));
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    const payload = preparePayload();
    if (!payload) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("patientId", payload.patientId);
      if (payload.appointmentId)
        formData.append("appointmentId", payload.appointmentId);
      formData.append("date", payload.date.toISOString());
      formData.append("veterinarianId", payload.veterinarianId);
      if (payload.weight) formData.append("weight", payload.weight.toString());
      if (payload.temperature)
        formData.append("temperature", payload.temperature.toString());
      if (payload.notes) formData.append("notes", payload.notes);
      if (payload.diagnostics && payload.diagnostics.length > 0)
        formData.append("diagnostics", JSON.stringify(payload.diagnostics));
      if (payload.treatments && payload.treatments.length > 0)
        formData.append("treatments", JSON.stringify(payload.treatments));
      if (payload.vaccinations && payload.vaccinations.length > 0)
        formData.append("vaccinations", JSON.stringify(payload.vaccinations));
      files.forEach((file) => formData.append("files", file));

      const response = await fetch(
        `${BASEURL}/api/workspaces/${workspaceId}/clinical-records`,
        { method: "POST", credentials: "include", body: formData },
      );

      const responseData = await response.json();
      if (!response.ok)
        throw new Error(
          responseData.error ||
            t("clinicalRecords:messages.errorPostGeneral"),
        );

      setPatientId("");
      setAppointmentId("");
      setDate("");
      setVeterinarianId("");
      setWeight("");
      setTemperature("");
      setNotes("");
      setFiles([]);
      setDiagnostics([{ diagnosis: "", notes: "" }]);
      setTreatments([{ name: "", dose: "", duration: "" }]);
      setVaccinations([{ vaccine: "", date: new Date(), nextDue: undefined }]);

      await refetchRecords();

      setTableFeedback({
        type: "success",
        message: responseData._warning
          ? `${t("clinicalRecords:messages.successPost")} ${responseData._warning}`
          : t("clinicalRecords:messages.successPost"),
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

  const handleDelete = (recordId: string) => {
    const record = tableDataFromBackend.find((r) => r.id === recordId);
    if (!record) return;
    const patient = patientOptions.find((p) => p.id === record.patientId);
    setDeleteRecordId(recordId);
    setDeleteRecordInfo(
      patient?.label || t("clinicalRecords:default.record"),
    );
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteRecordId) return;
    try {
      const result = await deleteRecord(deleteRecordId);
      if (result) {
        await refetchRecords();
        setTableFeedback({
          type: "success",
          message: t("clinicalRecords:messages.successDelete"),
        });
      }
    } catch (err) {
      console.error(err);
      setTableFeedback({
        type: "error",
        message: t("clinicalRecords:messages.errorDeleteGeneral"),
      });
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteRecordId(null);
      setDeleteRecordInfo(null);
    }
  };

  const handleUpdate = (id: string) => {
    const row = tableData.find((r) => r.id === id);
    const originalRow = originalData.find((r) => r.id === id);
    if (!row || !originalRow) return;

    const changes: Record<string, unknown> = {};

    // Detectar cambios en campos normales (excluir "files" — se maneja aparte)
    (Object.keys(row) as Array<keyof typeof row>).forEach((key) => {
      if (key === "id" || key === "files") return;
      if (row[key] !== originalRow[key]) {
        changes[key] = row[key];
      }
    });

    // Agregar cambios de fotos pendientes desde el ref (si los hay)
    const photoPending = photoPendingChanges.current.get(id);
    if (photoPending) {
      changes["files"] = photoPending;
    }

    if (Object.keys(changes).length > 0) {
      setChangedFields(changes);
      setUpdateRecordId(id);
      setIsUpdateModalOpen(true);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!updateRecordId || !changedFields || !workspaceId) return;
    setLoading(true);
    setPostError(null);
    try {
      const formData = new FormData();

      Object.entries(changedFields).forEach(([key, value]) => {
        if (key === "files") {
          // El valor es siempre un PhotoChangePayload del ref, nunca un string JSON
          const photoPayload = value as PhotoChangePayload;

          if (photoPayload.removeAll) {
            // Señal para borrar todas las fotos existentes
            formData.append("removeFiles", "true");
          } else {
            // Borrar fotos individuales — el controller espera "deleteFileKeys"
            if (photoPayload.deleteKeys && photoPayload.deleteKeys.length > 0) {
              photoPayload.deleteKeys.forEach((key) =>
                formData.append("deleteFileKeys", key)
              );
            }
            // Subir fotos nuevas
            if (photoPayload.newFiles && photoPayload.newFiles.length > 0) {
              photoPayload.newFiles.forEach((file) =>
                formData.append("files", file),
              );
            }
          }
        } else if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (value instanceof Date) {
            formData.append(key, value.toISOString());
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await fetch(
        `${BASEURL}/api/workspaces/${workspaceId}/clinical-records/${updateRecordId}`,
        { method: "PATCH", credentials: "include", body: formData },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            t("clinicalRecords:messages.errorUpdateGeneral"),
        );
      }

      // Limpiar el payload de fotos de esta fila tras éxito
      photoPendingChanges.current.delete(updateRecordId);

      await refetchRecords();
      setIsUpdateModalOpen(false);
      setUpdateRecordId(null);
      setChangedFields(null);
      setTableFeedback({
        type: "success",
        message: t("clinicalRecords:messages.successUpdate"),
      });
    } catch (error) {
      console.error("Error en PATCH:", error);
      setPostError(error as Error);
      setTableFeedback({
        type: "error",
        message: t("clinicalRecords:messages.errorUpdateGeneral"),
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Guards de carga ──────────────────────────────────────────────────────
  if (!workspaceId)
    return <div>{t("clinicalRecords:messages.loadingWorkspace")}</div>;
  if (errorRecords)
    return (
      <div className="text-red-600">
        {t("clinicalRecords:messages.errorGeneral")}
      </div>
    );
  if (
    loadingRecords ||
    loadingPatients ||
    loadingAppointments ||
    loadingVeterinarians ||
    (!tableDataFromBackend.length && !errorRecords && !recordsResponse)
  ) {
    return (
      <div className="p-8 text-center text-gray-500">
        {t("clinicalRecords:messages.loadingRecords")}
      </div>
    );
  }

  // const clinicalRecordInstructions = (
  //   <>
  //     <p className="font-semibold mb-2">
  //       {t("clinicalRecords:export_explanation.title")}
  //     </p>
  //     <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
  //       <li>{t("clinicalRecords:export_explanation.acepted_formats")}</li>
  //       <li>{t("clinicalRecords:export_explanation.required_fields")}</li>
  //       <li>{t("clinicalRecords:export_explanation.optional_fields")}</li>
  //       <li>{t("clinicalRecords:export_explanation.validation_phone")}</li>
  //       <li>{t("clinicalRecords:export_explanation.visual_example")}</li>
  //     </ul>
  //   </>
  // );

  return (
    <div className="space-y-6">
      {/* <InfoNote>{clinicalRecordInstructions}</InfoNote>

      <ExcelTable
        headers={CLINICAL_RECORDS_HEADERS}
        examples={CLINICAL_RECORD_EXAMPLE_DATA}
        className="mb-8"
      />

      <MassiveImport
        entity="ClinicalRecord"
        workspaceId={workspaceId}
        userId={user?._id || ""}
        baseUrl={BASEURL}
        onImportSuccess={refetchRecords}
      /> */}

      <h2 className="text-2xl font-bold mb-6 text-[rgb(var(--text))]">
        {t("clinicalRecords:titles.form")}
      </h2>

      <div className="space-y-4">
        <SelectWithSearch<IPatient>
          label={t("clinicalRecords:labels.patient")}
          value={patientId}
          onChange={setPatientId}
          options={patientOptions}
          placeholder={t("clinicalRecords:placeholders.selectPatient")}
          searchPlaceholder={t("clinicalRecords:placeholders.searchPatient")}
          showDetails={true}
          required
        />

        <SelectWithSearch<IAppointment>
          label={t("clinicalRecords:labels.appointment")}
          value={appointmentId}
          onChange={setAppointmentId}
          options={appointmentOptions}
          placeholder={t("clinicalRecords:placeholders.selectAppointment")}
          searchPlaceholder={t(
            "clinicalRecords:placeholders.searchAppointment",
          )}
          showDetails={false}
          required={false}
        />

        <DateInput
          label={t("clinicalRecords:labels.date")}
          value={date}
          onChange={setDate}
          type="datetime-local"
          required={true}
        />

        <SelectWithSearch<IWorkspaceMember>
          label={t("clinicalRecords:labels.veterinarian")}
          value={veterinarianId}
          onChange={setVeterinarianId}
          options={veterinarianOptions}
          placeholder={t("clinicalRecords:placeholders.selectVeterinarian")}
          searchPlaceholder={t(
            "clinicalRecords:placeholders.searchVeterinarian",
          )}
          showDetails={true}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            value={weight}
            onChange={setWeight}
            type="number"
            placeholder={t("clinicalRecords:placeholders.weight")}
            required={false}
            label={t("clinicalRecords:labels.weight")}
          />
          <Input
            value={temperature}
            onChange={setTemperature}
            type="number"
            placeholder={t("clinicalRecords:placeholders.temperature")}
            required={false}
            label={t("clinicalRecords:labels.temperature")}
          />
        </div>

        <DiagnosticsSection
          diagnostics={diagnostics}
          onChange={setDiagnostics}
        />

        <TreatmentsSection treatments={treatments} onChange={setTreatments} />

        <VaccinationsSection
          vaccinations={vaccinations}
          onChange={setVaccinations}
        />

        {/* Fotos y Notas Generales */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[rgb(var(--text))]">
              {t("clinicalRecords:labels.photos")}
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => {
                if (e.target.files) setFiles(Array.from(e.target.files));
              }}
              className="w-full text-sm text-[rgb(var(--text-secondary))] border border-[rgb(var(--border))] rounded-lg cursor-pointer bg-[rgb(var(--input-bg))] focus:outline-none p-2"
            />
          </div>

          <Input
            value={notes}
            onChange={setNotes}
            placeholder={t("clinicalRecords:placeholders.notes")}
            required={false}
            label={t("clinicalRecords:labels.notes")}
            multiline
            rows={3}
          />
        </div>

        <Button onClick={handleOpenModal} disabled={loading}>
          {loading
            ? t("clinicalRecords:buttons.form.submitLoading")
            : t("clinicalRecords:buttons.form.submit")}
        </Button>
      </div>

      {loading && (
        <p className="mt-4 text-blue-600">
          {t("clinicalRecords:feedback.creatingRecord")}
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
        title={t("clinicalRecords:modals.create.title")}
        data={{
          patientLabel: enrichedPatient?.label,
          patientSubLabel: enrichedPatient?.subLabel,
          appointmentLabel: enrichedAppointment?.label,
          veterinarianLabel: enrichedVeterinarian?.label,
          date: date ? new Date(date).toLocaleString() : "",
          weight,
          temperature,
          diagnosticsCount: diagnostics.filter((d) => d.diagnosis).length,
          treatmentsCount: treatments.filter((t) => t.name).length,
          vaccinationsCount: vaccinations.filter((v) => v.vaccine).length,
          filesCount: files.length,
          notes,
        }}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteRecordId(null);
          setDeleteRecordInfo(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={deleteRecordInfo}
      />

      <UpdateConfirmationModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdateRecordId(null);
          setChangedFields(null);
        }}
        onConfirm={handleConfirmUpdate}
        changedFields={changedFields}
      />

      <div className="pt-4 space-y-8 overflow-hidden">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[rgb(var(--text))]">
            {t("clinicalRecords:titles.main")}
          </h1>
          <Button onClick={() => refetchRecords()} variant="primary">
            {t("clinicalRecords:buttons.table.refetch")}
          </Button>
        </div>

        <DataTableWithSearch
          title={t("clinicalRecords:titles.table")}
          data={tableData}
          columns={columns}
          cellConfigs={cellConfigs}
          onRowDelete={handleDelete}
          onRowUpdate={handleUpdate}
          onCellChange={handleCellChange}
          // @ts-expect-error: Error de tipado
          onPhotoChange={handlePhotoChange}
          searchPlaceholder={t("clinicalRecords:placeholders.search")}
          emptyMessage={t("clinicalRecords:messages.emptyTable")}
          height="65vh"
        />
      </div>
    </div>
  );
};

export default ClinicalRecords;