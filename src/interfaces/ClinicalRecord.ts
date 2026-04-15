export interface Diagnostic {
  diagnosis: string;
  notes?: string;
}

export interface Treatment {
  name: string;
  dose?: string;
  duration?: string;
}

export interface Vaccination {
  vaccine: string;
  date: Date | string;
  nextDue?: Date | string;
}

export interface ClinicalFile {
  url: string;
  key: string;
}

export interface ClinicalRecord {
  _id: string;
  workspaceId: string;
  patientId: string;
  appointmentId?: string;
  date: Date | string;
  veterinarianId: string;
  weight?: number;
  temperature?: number;
  diagnostics?: Diagnostic[];
  treatments?: Treatment[];
  vaccinations?: Vaccination[];
  files?: ClinicalFile[];
  notes?: string;
  createdBy: string;
  updatedBy: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deleted: boolean;
}
