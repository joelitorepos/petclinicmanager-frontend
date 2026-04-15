export type CountryCode = 'GT' | 'ES' | 'US' | 'MX' | 'AR';
export type CurrencyCode = 'GTQ' | 'EUR' | 'USD';
export type LanguageCode = 'en' | 'es';
export type PlanType = 'free' | 'basic' | 'pro' | 'enterprise';
export type MemberRole = 'admin' | 'veterinario' | 'recepcion' | 'asistente' | 'contador' | 'auditor';
export type MemberStatus = 'active' | 'pending' | 'removed';

export interface IPhone {
  country: CountryCode;
  number: string;
}

// Interfaz base para campos de auditoría que comparten tus modelos
export interface IBaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}