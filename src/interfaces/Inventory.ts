export interface IInventory {
  workspaceId: string;
  name: string;
  category: 'medicamento' | 'alimento' | 'accesorio' | 'equipo' | 'otro';
  description?: string;
  unit: 'unidad' | 'caja' | 'kg' | 'g' | 'ml' | 'litro' | 'frasco' | 'sobre' | 'otro';
  sellingPrice?: number | null;
  lowStockThreshold: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
  currentStock?: number;
}