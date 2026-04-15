import type { IBaseEntity, CountryCode, CurrencyCode, LanguageCode, PlanType } from './shared.types';

export interface ILogo {
  url: string;
  key: string;
}

// temporal, esquema antiguo
export interface Workspace {
  _id: string;                     // MongoDB ID convertido a string en el frontend
  name: string;
  slug: string;
  logo?: ILogo;                   // Opcional; URL del logo
  phone?: string;                 // Opcional; incluye código de país
  secondaryPhone?: string;        // Opcional
  address?: string;               // Opcional; para estadísticas internas
  country?: string;               // Opcional; código de país como 'GT' o 'US'
  plan: 'free' | 'pro' | 'enterprise';
  createdBy: string;              // ID del usuario como string
  createdAt: string | Date;       // Puede venir como string o Date
  updatedAt: string | Date;       // Puede venir como string o Date
  deleted: boolean;               // Para soft delete
}

// type CountryCode = 'GT' | 'ES' | 'US' | 'MX' | 'AR';
// type CurrencyCode = 'GTQ' | 'EUR' | 'USD';
// type LanguageCode = 'en' | 'es';
// type PlanType = 'free' | 'basic' | 'pro' | 'enterprise';

// interface IBaseEntity {
//   _id: string;
//   createdAt: string;
//   updatedAt: string;
//   deleted: boolean;
// }

export interface IWorkspace extends IBaseEntity {
  name: string;
  slug: string;
  logo?: ILogo;
  phone?: string;
  secondaryPhone?: string;
  address?: string;
  country: CountryCode;
  currency: CurrencyCode;
  language: LanguageCode;
  taxId?: string;
  plan: PlanType;
  createdBy: string;
  updatedBy?: string;
}

export interface CurrentWorkspaceResponse { success: boolean; workspace: IWorkspace; }