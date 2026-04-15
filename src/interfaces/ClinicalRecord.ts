import mongoose from 'mongoose';

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
  workspaceId: string | mongoose.Types.ObjectId;
  patientId: string | mongoose.Types.ObjectId;
  appointmentId?: string | mongoose.Types.ObjectId;
  date: Date | string;
  veterinarianId: string | mongoose.Types.ObjectId;
  weight?: number;
  temperature?: number;
  diagnostics?: Diagnostic[];
  treatments?: Treatment[];
  vaccinations?: Vaccination[];
  files?: ClinicalFile[];
  notes?: string;
  createdBy: string | mongoose.Types.ObjectId;
  updatedBy: string | mongoose.Types.ObjectId;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deleted: boolean;
}