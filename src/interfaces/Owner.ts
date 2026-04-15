import type { IBaseEntity, IPhone } from './shared.types';

// modelo antiguo
export interface Owner extends Record<string, unknown> {
  _id: string;
  workspaceId: string;
  nombre: string;
  telefono: string;
  telefono2?: string;
  email?: string;
  direccion?: string;
  nit?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  __v?: number; 
}

// type CountryCode = 'GT' | 'ES' | 'US' | 'MX' | 'AR';

// interface IPhone {
//   country: CountryCode;
//   number: string;
// }

// interface IBaseEntity {
//   _id: string;
//   createdAt: string;
//   updatedAt: string;
//   deleted: boolean;
// }

export interface IOwner extends IBaseEntity {
  workspaceId: string;
  nombre: string;
  telefono: IPhone;
  telefono2?: IPhone;
  email?: string;
  direccion?: string;
  nit?: string;
  createdBy: string;
  updatedBy: string;
}