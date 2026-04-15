// src/components/clinic/tools/Patients.tsx

import { useMemo, useState, useEffect } from 'react';
import { z } from 'zod';
import BASEURL from '../../../hooks/BaseUrl';
import DataTableWithSearch, { type ColumnDef, type CellConfig } from '../../common/DataTableWithSearch';
import { type Patient } from '../../../interfaces/Patient';
import { type Owner } from '../../../interfaces/Owner';
import { type Workspace } from '../../../interfaces/Workspace';
import InfoNote from '../../ui/InfoNote';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import FileInput from '../../ui/FileInput';
import DateInput from '../../ui/DateInput';
import Checkbox from '../../ui/Checkbox';
import SelectWithSearch from '../../ui/SelectWithSearch';
import MassiveImport from '../../ui/MassiveImport';
import Button from '../../ui/Button';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthAwareFetch } from '../../../hooks/useAuthAwareFetch';
import { useLanguage } from '../../../hooks/useLanguage';
import useFetch from '../../../hooks/useFetch';
import useDelete from '../../../hooks/useDelete'
import { CreateConfirmationModal, DeleteConfirmationModal, UpdateConfirmationModal } from '../../modal/ConfirmationModals';
// import ResultModal from '../../modal/ResultModal';
import findErichedData from '../../../utils/findEnrichedData';
import { useEditableTable } from '../../../hooks/useEditableTable';
import ExcelTable from '../../excelTable/ExcelTable';
import { PATIENT_EXAMPLE_DATA, PATIENTS_HEADERS } from '../../excelTable/patientExample';

const PatientSchema = z.object({
  nombre: z.string().min(1),
  especie: z.string().min(1),
  raza: z.string().min(1),
  sexo: z.enum(['macho', 'hembra']),
  fechaNacimiento: z.coerce.date().optional(),
  color: z.string().optional(),
  foto: z.string().url().optional(),
  esterilizado: z.boolean().optional(),
  pesoActual: z.number().positive().optional(),
  alergias: z.string().optional(),
  notas: z.string().optional(),
  ownerId: z.string(),
});

type PatientPayload = z.infer<typeof PatientSchema>;

interface CurrentWorkspaceResponse { success: boolean; workspace: Workspace; }
interface OwnersListResponse { success: boolean; owners: Owner[]; }
interface PatientsListResponse { success: boolean; patients: Patient[]; }

const Patients = () => {
  const { t } = useLanguage();
  // Form states
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState('');
  const [raza, setRaza] = useState('');
  const [sexo, setSexo] = useState<'macho' | 'hembra' | ''>('');
  const opcionesSexo = [
    { value: 'macho', label: t('patients:options.sexo.macho') },
    { value: 'hembra', label: t('patients:options.sexo.hembra') }
  ];
  const [fechaNacimiento, setFechaNacimiento] = useState<string>("");
  const today = new Date().toISOString().split('T')[0];
  const [color, setColor] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [esterilizado, setEsterilizado] = useState(false);
  const [pesoActual, setPesoActual] = useState<string>('');
  const [alergias, setAlergias] = useState('');
  const [notas, setNotas] = useState('');
  const [ownerId, setOwnerId] = useState('');

  // Estado para manejar errores de validación local o de carga de Workspace
  const [formError, setFormError] = useState<string | null>(null);
  // Modal state for create
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Modal state for delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);
  const [deletePatientName, setDeletePatientName] = useState<string | null>(null);
  // Estado para loading de creación
  const [loading, setLoading] = useState(false);
  // Estado para error de post
  const [postError, setPostError] = useState<Error | null>(null);
  // Estado para mensaje de éxito
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Modal state for update
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updatePatientId, setUpdatePatientId] = useState<string | null>(null);
  const [changedFields, setChangedFields] = useState<Record<string, unknown> | null>(null);

  // Cargar Workspace y Datos
  const { data: currentWorkspaceData } = useFetch<CurrentWorkspaceResponse>(`${BASEURL}/api/workspaces/current`);
  const workspaceId = currentWorkspaceData?.workspace?._id;

  // user
  const { user } = useAuth();

  const { data: ownersResponse, loading: loadingOwners } = useAuthAwareFetch<OwnersListResponse>(
    workspaceId ? `${BASEURL}/api/workspaces/${workspaceId}/owners` : '',
    [workspaceId],
    { skipInitialFetch: !workspaceId }
  );

  const { data: patientsResponse, loading: loadingPatients, error: errorPatients, refetch: refetchPatients } = useAuthAwareFetch<PatientsListResponse>(
    workspaceId ? `${BASEURL}/api/workspaces/${workspaceId}/patients` : '',
    [workspaceId],
    { skipInitialFetch: !workspaceId }
  );

  // DELETE hook
  const { deleteData: deletePatient } = useDelete<{ message: string }>(
    `${BASEURL}/api/workspaces/${workspaceId}/patients`
  );

  // Definir Columnas
  const columns: ColumnDef[] = [
    { field: "codigo", header: t('patients:labels.code'), className: 'w-2/12 font-medium', editable: false },
    { field: "nombre", header: t('patients:labels.name'), className: 'w-2/12', editable: true },
    { field: "especie", header: t('patients:labels.species'), className: 'w-1/12', },
    { field: "raza", header: t('patients:labels.breed'), className: 'w-2/12', },
    { field: "sexo", header: t('patients:labels.sex'), className: 'w-2/12', },
    { field: "fechaNacimiento", header: t('patients:labels.birthDate'), className: 'w-3/12', },
    { field: "color", header: t('patients:labels.color'), className: 'w-4/12', },
    { field: "foto", header: t('patients:labels.photo'), className: 'w-3/12', },
    { field: "esterilizado", header: t('patients:labels.sterilized'), className: 'w-2/12', },
    { field: "pesoActual", header: t('patients:labels.currentWeight'), className: 'w-4/12', },
    { field: "alergias", header: t('patients:labels.allergies'), className: 'w-3/12', },
    { field: "notas", header: t('patients:labels.notes'), className: 'w-4/12', },
    { field: "ownerId", header: t('patients:labels.owner'), className: 'w-3/12', },
  ];

  // FIX: ownerOptions incluye tanto dueños activos como los soft-deleted que aún
  // están referenciados en algún paciente. Así SelectCell siempre encuentra la opción
  // y muestra el nombre en lugar del estado de "registro eliminado".
  const ownerOptions = useMemo(() => {
    const rawOwners = Array.isArray(ownersResponse)
      ? ownersResponse
      : ownersResponse?.owners || [];

    // 1. Construir opciones de dueños activos
    const activeOptions = rawOwners.map(owner => {
      let phoneDisplay = '';
      if (owner.telefono && typeof owner.telefono === 'object' && 'number' in owner.telefono) {
        const { country, number } = owner.telefono as { country: string; number: string };
        phoneDisplay = [t(`common:countries.${country}`), number].filter(Boolean).join(' ').trim();
      }

      return {
        id: String(owner._id || (owner as Owner).id || ''),
        label: owner.nombre || t('patients:default.noOwnerName'),
        subLabel: phoneDisplay || owner.email || undefined,
        metadata: [
          owner.email ? `Email: ${owner.email}` : '',
        ].filter(Boolean),
        data: owner,
      };
    });

    // 2. Buscar dueños soft-deleted referenciados en pacientes que no estén ya en la lista activa.
    //    El populate del backend devuelve el objeto completo del dueño aunque tenga deleted: true,
    //    así que lo aprovechamos para construir la opción "fantasma" con su nombre real.
    const activeIds = new Set(activeOptions.map(o => o.id));
    const rawPatients = patientsResponse?.patients || [];

    rawPatients.forEach(p => {
      if (p.ownerId && typeof p.ownerId === 'object') {
        const owner = p.ownerId as Owner;
        const id = String(owner._id || (owner as Owner).id || '');

        if (id && !activeIds.has(id)) {
          // Este dueño está soft-deleted pero sigue vinculado a un paciente.
          // Lo añadimos con una etiqueta visual que indica que está inactivo,
          // pero conservando su nombre real para que la información no se pierda.
          activeIds.add(id);

          let phoneDisplay = '';
          if (owner.telefono && typeof owner.telefono === 'object' && 'number' in owner.telefono) {
            const { country, number } = owner.telefono as { country: string; number: string };
            phoneDisplay = [t(`common:countries.${country}`), number].filter(Boolean).join(' ').trim();
          }

          activeOptions.push({
            id,
            label: owner.nombre || t('patients:default.noOwnerName'),
            subLabel: phoneDisplay || owner.email || undefined,
            metadata: [
              owner.email ? `Email: ${owner.email}` : '',
            ].filter(Boolean),
            data: owner,
          });
        }
      }
    });

    return activeOptions;
  }, [ownersResponse, patientsResponse]);

  const tableDataFromBackend = useMemo(() => {
    const rawList = patientsResponse?.patients || [];
    return rawList.map((p) => {
      
      // FIX PRINCIPAL: Extracción hiper-segura del ID. 
      // Garantiza que sea un string primitivo puro para que el === del SelectCell funcione.
      let safeOwnerId = '';
      if (p.ownerId) {
        if (typeof p.ownerId === 'string') {
          safeOwnerId = p.ownerId;
        } else if (typeof p.ownerId === 'object') {
          safeOwnerId = String((p.ownerId as Owner)._id || (p.ownerId as Owner).id || '');
        }
      }

      return {
        id: p._id,
        codigo: p.codigo || '',
        nombre: p.nombre || '',
        especie: p.especie || '',
        raza: p.raza || '',
        ownerId: safeOwnerId, // Usamos el string seguro
        notas: p.notas || '',
        foto: p.foto ? JSON.stringify(p.foto) : '',
        sexo: p.sexo,
        fechaNacimiento: p.fechaNacimiento,
        color: p.color,
        esterilizado: p.esterilizado,
        pesoActual: p.pesoActual,
        alergias: p.alergias || ''
      };
    });
  }, [patientsResponse]);


  const originalData = useMemo(() => [...tableDataFromBackend], [tableDataFromBackend]);

  // 3. NUEVO: Hook para edición local (Esto permite editar celdas sin que se borren)
  const { data: tableData, handleCellChange, updateData } = useEditableTable(tableDataFromBackend);

  // 4. Sincronizar backend -> frontend cuando cargan datos nuevos
  useEffect(() => {
    updateData(tableDataFromBackend);
  }, [tableDataFromBackend, updateData]);

  const enrichedOwner = useMemo(() => {
    return findErichedData(ownerOptions, ownerId || ''); // Usa el ID que estés manejando
  }, [ownerOptions, ownerId]);

  const cellConfigs = useMemo(() => {
    const configs: Partial<Record<keyof typeof tableDataFromBackend[0], CellConfig<Owner>>> = {
      ownerId: {
        type: 'select',
        namespace: 'owners',
        options: ownerOptions,
        displayKeys: ['telefono', 'email', 'direccion']
      },
        sexo: {
        type: 'select',
        namespace: 'patients',
        options: [
          { id: 'macho', label: t('patients:options.sexo.macho') },
          { id: 'hembra', label: t('patients:options.sexo.hembra') }
        ],
        displayKeys: []
      },
      notas: { type: 'text', multiline: true, rows: 3 },
      pesoActual: { type: 'text', inputType: 'number' },
      esterilizado: { type: 'checkbox', namespace: 'patients' },
      fechaNacimiento: {
        type: 'date',
        max: new Date().toISOString().split('T')[0] // No permitir fechas futuras
      },
      foto: {
        type: 'photo'
      },
    };
    return configs;
  }, [ownerOptions, tableDataFromBackend]);

  

  // Prepara los datos y valida
  const preparePayload = (): PatientPayload | null => {
    const payload = {
      nombre: nombre.trim(),
      especie: especie.trim(),
      raza: raza.trim(),
      sexo: sexo || undefined,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
      color: color.trim() || undefined,
      foto: undefined, // Manejado por separado en FormData
      esterilizado: esterilizado || undefined,
      pesoActual: pesoActual ? parseFloat(pesoActual) : undefined,
      alergias: alergias.trim() || undefined,
      notas: notas.trim() || undefined,
      ownerId,
    };

    const result = PatientSchema.safeParse(payload);
    if (!result.success) {
      console.error('Error de validación:', result.error.format());
      return null;
    }
    return result.data;
  };

  const handleOpenModal = () => {
    setFormError(null);
    setPostError(null);
    if (!workspaceId) {
      setFormError(`${t('patients:messages.errorWorkspaceLoad')}`);
      return;
    }

    // Validar el formulario
    const payload = preparePayload();
    if (!payload) {
      setFormError(`${t('patients:messages.errorValidationForm')}`);
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
      formData.append('nombre', payload.nombre);
      formData.append('especie', payload.especie);
      formData.append('raza', payload.raza);
      formData.append('sexo', payload.sexo);
      if (payload.fechaNacimiento) formData.append('fechaNacimiento', payload.fechaNacimiento.toISOString());
      if (payload.color) formData.append('color', payload.color);
      if (payload.esterilizado) formData.append('esterilizado', payload.esterilizado.toString());
      if (payload.pesoActual) formData.append('pesoActual', payload.pesoActual.toString());
      if (payload.alergias) formData.append('alergias', payload.alergias);
      if (payload.notas) formData.append('notas', payload.notas);
      formData.append('ownerId', payload.ownerId);
      if (foto) formData.append('foto', foto);

      const response = await fetch(
        `${BASEURL}/api/workspaces/${workspaceId}/patients`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`${t('patients:messages.errorPostGeneral')}`);
      }

      // Limpiar formulario tras éxito
      setNombre('');
      setEspecie('');
      setRaza('');
      setSexo('');
      setFechaNacimiento('');
      setColor('');
      setFoto(null);
      setEsterilizado(false);
      setPesoActual('');
      setAlergias('');
      setNotas('');
      setOwnerId('');

      await refetchPatients();
      setSuccessMessage(`${t('patients:messages.successPost')}`);
    } catch (err) {
      console.error(err);
      setPostError(err as Error);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  // Función para obtener el mensaje de error claro para el usuario
  const getErrorMessage = () => {
    if (formError) {
      return formError; // Error local (Workspace o validación Zod)
    }
    if (postError) {
      const message = postError.message;
      // Ejemplo de filtrado de errores comunes (ajustar según necesidades)
      if (message.includes('email')) {
        return `${t('patients:messages.errorPostEmailFormat')}`;
      }
      // Mensaje genérico para cualquier error del servidor
      return `${t('patients:messages.errorPostGeneral')}`;
    }
    return null;
  };

  const errorMessage = getErrorMessage();

  const handleDelete = (patientId: string) => {
    const patient = tableDataFromBackend.find(p => p.id === patientId);
    if (!patient) return;

    setDeletePatientId(patientId);
    setDeletePatientName(patient.nombre || `${t('patients:default.patient')}`);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletePatientId) return;

    try {
      const result = await deletePatient(deletePatientId);
      if (result) {
        await refetchPatients();
        setSuccessMessage(`${t('patients:messages.successDelete')}`);
      }
    } catch (err) {
      console.error(err);
      setFormError(`${t('patients:messages.errorDeleteGeneral')}`);
    } finally {
      setIsDeleteModalOpen(false);
      setDeletePatientId(null);
      setDeletePatientName(null);
    }
  };

  // Manejar actualización
  const handleUpdate = (id: string) => {
    const row = tableData.find(r => r.id === id);
    const originalRow = originalData.find(r => r.id === id);

    if (row && originalRow) {
      const changes: Record<string, unknown> = {};
      (Object.keys(row) as Array<keyof typeof row>).forEach(key => {
        if (key !== 'id' && row[key] !== originalRow[key]) {
          changes[key] = row[key];
        }
      });

      if (Object.keys(changes).length > 0) {
        setChangedFields(changes);
        setUpdatePatientId(id);
        setIsUpdateModalOpen(true);
      }
    }
  };

  const handleConfirmUpdate = async () => {
    if (!updatePatientId || !changedFields || !workspaceId) return;

    setLoading(true);
    setPostError(null);

    try {
      const formData = new FormData();
    
      Object.entries(changedFields).forEach(([key, value]) => {
        // Manejo específico para la foto
        if (key === 'foto') {
          if (value instanceof File) {
            // Caso A: El usuario seleccionó una nueva imagen
            formData.append('foto', value);
          } else if (value === '' || value === null) {
            // Caso B: El usuario hizo click en "Eliminar foto" en PhotoCell
            // Esto activa la lógica de borrado físico en el backend
            formData.append('removePhoto', 'true');
          }
        } 
        else if (key === 'pesoActual') {
            // Si el valor es vacío o null, enviamos una marca para que el backend sepa que debe limpiarlo
            // O simplemente no lo enviamos si el backend no soporta nulls directos aún
            if (value === '' || value === null || value === undefined) {
              // Dependiendo de tu API, podrías querer enviar un valor que el pre-procesador de Zod entienda
              formData.append(key, ""); 
            } else {
              formData.append(key, String(value));
            }
          }
          else if (value !== undefined && value !== null) {
            const finalValue = value instanceof Date ? value.toISOString() : String(value);
            formData.append(key, finalValue);
          }
        });

      const response = await fetch(`${BASEURL}/api/workspaces/${workspaceId}/patients/${updatePatientId}`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData, 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t('patients:messages.errorUpdateGeneral'));
      }
    
      // Refrescar y limpiar
      await refetchPatients();
      setIsUpdateModalOpen(false);
      setUpdatePatientId(null);
      setChangedFields(null);
      setSuccessMessage(`${t('patients:messages.successUpdate')}`);
    } catch (error) {
      console.error("Error en PATCH:", error);
      setPostError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  // Chequeos de carga y error
  if (!workspaceId) return <div>{t('patients:messages.loadingWorkspace')}</div>;
  if (errorPatients) return <div className="text-red-600">{t('patients:messages.errorGeneral')}</div>;
  if (loadingPatients || loadingOwners || (!tableDataFromBackend.length && !errorPatients && !patientsResponse)) {
    return <div className="p-8 text-center text-gray-500">{t('patients:messages.loadingPatients')}</div>;
  }

  const patientInstructions = (
    <>
      <p className="font-semibold mb-2">{t('patients:export_explanation.title')}</p>
      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
        <li>{t('patients:export_explanation.acepted_formats')}</li>
        <li>{t('patients:export_explanation.required_fields')}</li>
        <li>{t('patients:export_explanation.optional_fields')}</li>
        <li>{t('patients:export_explanation.validation_phone')}</li>
        <li>{t('patients:export_explanation.visual_example')}</li>
      </ul>
    </>
  );

  return (
    <div className="space-y-6">
      {/* <InfoNote>
        {patientInstructions}
      </InfoNote>

      <ExcelTable
        headers={PATIENTS_HEADERS}
        examples={PATIENT_EXAMPLE_DATA}
        className="mb-8"
      />

      <MassiveImport
        entity="Patient"
        workspaceId={workspaceId}
        userId={user?._id || ''}
        baseUrl={BASEURL}
        onImportSuccess={refetchPatients}
      /> */}

      <h2 className="text-2xl font-bold mb-6 text-[rgb(var(--text))]">{t('patients:titles.form')}</h2>

      <div className="space-y-4">
        <Input value={nombre} onChange={setNombre} placeholder={t('patients:placeholders.form.name')} required={true} label={t('patients:labels.name')} />
        <Input value={especie} onChange={setEspecie} placeholder={t('patients:placeholders.form.species')} required={true} label={t('patients:labels.species')} />
        <Input value={raza} onChange={setRaza} placeholder={t('patients:placeholders.form.breed')} required={true} label={t('patients:labels.breed')} />
        <Select value={sexo} onChange={(val) => setSexo(val as 'macho' | 'hembra')} options={opcionesSexo} placeholder={t('patients:placeholders.form.sex')} required={true} label={t('patients:labels.sex')} />
        <DateInput label={t('patients:labels.birthDate')} value={fechaNacimiento} onChange={setFechaNacimiento} max={today} required={false} />
        <Input value={color} onChange={setColor} placeholder={t('patients:placeholders.form.color')} required={false} label={t('patients:labels.color')} />
        <FileInput value={foto} onChange={setFoto} placeholder={t('patients:placeholders.form.photo')} accept="image/*" label={t('patients:labels.photo')} />
        <Checkbox label={t('patients:labels.sterilized')} checked={esterilizado} onChange={setEsterilizado} />
        <Input value={pesoActual} onChange={setPesoActual} type="number" placeholder={t('patients:placeholders.form.currentWeight')} required={false} label={t('patients:labels.currentWeight')} />
        <Input value={alergias} onChange={setAlergias} placeholder={t('patients:placeholders.form.allergies')} required={false} label={t('patients:labels.allergies')} />
        <Input value={notas} onChange={setNotas} placeholder={t('patients:placeholders.form.notes')} required={false} label={t('patients:labels.notes')} />
        <SelectWithSearch<Owner>
          label={t('patients:labels.owner')}
          value={ownerId}
          onChange={setOwnerId}
          options={ownerOptions}
          placeholder={t('patients:placeholders.selectOwner')}
          searchPlaceholder={t('owners:placeholders.table.search')}
          showDetails={true}
          required
        />

        <Button onClick={handleOpenModal} disabled={loading}>
          {loading ? `${t('patients:buttons.form.submitLoading')}` : `${t('patients:buttons.form.submit')}`}
        </Button>
      </div>

      {/* Feedback de la operación */}
      {loading && <p className="mt-4 text-blue-600">{`${t('patients:feedback.creatingPatient')}`}</p>}
      {/* Mensaje de error unificado y claro */}
      {errorMessage && <p className="mt-4 text-red-600">{errorMessage}</p>}
      {/* Mensaje de éxito */}
      {successMessage && !loading && !errorMessage && (
        <p className="mt-4 text-green-600">{successMessage}</p>
      )}

      {/* Modal de confirmación para create */}
      <CreateConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        loading={loading}
        title={t('common:confirm_creation')}
        data={{ nombre, especie, raza, sexo, fechaNacimiento, color, foto, esterilizado, pesoActual, alergias, notas,
            ownerLabel: enrichedOwner?.label, ownerSubLabel: enrichedOwner?.subLabel,
          }}
      />

      {/* Modal de confirmación para delete */}
      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletePatientId(null);
          setDeletePatientName(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={deletePatientName}
      />

      {/* Modal de confirmación para update */}
      <UpdateConfirmationModal 
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setUpdatePatientId(null);
          setChangedFields(null);
        }}
        onConfirm={handleConfirmUpdate}
        changedFields={changedFields}
      />

      <div className="pt-4 space-y-8">
        <div className="flex justify-between items-center">
          <Button 
            onClick={() => refetchPatients()}
            variant="primary"
          >
            {t('patients:buttons.table.refetch')}
          </Button>
        </div>

        <DataTableWithSearch
          title={t('patients:titles.table')}
          data={tableData}
          columns={columns}
          cellConfigs={cellConfigs}
          onRowDelete={handleDelete}
          onRowUpdate={handleUpdate}
          onCellChange={handleCellChange}
          searchPlaceholder={t('patients:placeholders.search')}
          emptyMessage={t('patients:messages.emptyTable')}
          height="65vh"
        />
      </div>

    </div>
  );
};

export default Patients;