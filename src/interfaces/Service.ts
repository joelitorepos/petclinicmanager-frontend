// src/interfaces/Service.ts
export interface IService {
  _id: string;
  workspaceId: string;
  code: string;
  name: string;
  description?: string;
  category: 'consulta' | 'vacuna' | 'cirugia' | 'laboratorio' | 'estetica' | 'hospitalizacion' | 'otro';
  price: number;           // se convierte de Decimal128 a number en frontend
  cost?: number;
  taxRate?: number;
  duration?: number;       // en minutos
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export interface ServiceListResponse {
  items: IService[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}