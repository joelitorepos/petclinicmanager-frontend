export interface Appointment {
  _id?: string;                    // usa string en vez de ObjectId
  workspaceId: string;
  patientId: string;
  ownerId: string;
  veterinarianId: string;
  startTime: Date | string;        // Date o string (ISO)
  endTime: Date | string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  type: 'consulta' | 'vacuna' | 'cirugia' | 'seguimiento' | string;
  notes?: string;
  reason?: string;
  createdBy: string;
  updatedBy: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deleted: boolean;
}