// src/interfaces/Patient.ts

// IPhoto para mantener la consistencia con ILogo en Workspace
export interface IPhoto {
  url: string;
  key: string;
}

// IPatient basada en el modelo de Mongoose
export interface Patient {
  _id: string; // MongoDB ID
  workspaceId: string;
  codigo: string;
  nombre: string;
  especie: string;
  raza: string;
  sexo: 'macho' | 'hembra';
  fechaNacimiento?: string | Date; // Usamos string|Date para manejar la deserialización
  color?: string;
  foto?: IPhoto; 
  esterilizado?: boolean;
  pesoActual?: number;
  alergias?: string;
  notas?: string;
  ownerId: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  deleted: boolean;
}