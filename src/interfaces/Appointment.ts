import mongoose from 'mongoose';

export interface Appointment {
  _id?: string | mongoose.Types.ObjectId;
  workspaceId: string | mongoose.Types.ObjectId;
  patientId: string | mongoose.Types.ObjectId;
  ownerId: string | mongoose.Types.ObjectId;
  veterinarianId: string | mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  type: 'consulta' | 'vacuna' | 'cirugia' | 'seguimiento' | string;
  notes?: string;
  reason?: string;
  createdBy: string | mongoose.Types.ObjectId;
  updatedBy: string | mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  deleted: boolean;
}