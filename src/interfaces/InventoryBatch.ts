export interface IInventoryBatch {
  inventoryId: string;
  workspaceId: string;
  supplier?: string;
  expirationDate?: Date;
  quantity: number;
  purchasePrice: number;
  purchaseDate?: Date;
  batchNumber?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
}