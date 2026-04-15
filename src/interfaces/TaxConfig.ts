export type TaxAppliesTo = 'all' | 'service' | 'product';

export interface ITaxConfig {
  _id: string;
  workspaceId: string | null;
  country: string;
  region?: string;
  taxName: string;
  taxCode?: string;
  taxRate: number;
  appliesTo: TaxAppliesTo;
  isDefault: boolean;
  isActive: boolean;

  // Auditoría (vienen de los timestamps y refs)
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string | Date;           // Fechas como string ISO o Date
  updatedAt?: string | Date;

  // Vigencia
  effectiveFrom?: string | Date;
  effectiveTo?: string | Date;
}

/**
 * Útil para formularios de creación (omitimos campos autogenerados)
 */
export type CreateTaxConfigDto = Omit<ITaxConfig, '_id' | 'createdAt' | 'updatedAt'>;

/**
 * Útil para actualizaciones parciales
 */
export type UpdateTaxConfigDto = Partial<CreateTaxConfigDto>;