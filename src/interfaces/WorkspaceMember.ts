import type {
  IBaseEntity,
  IPhone,
  MemberRole,
  MemberStatus,
} from "./shared.types";

export interface WorkspaceMember {
  _id?: string;
  workspaceId: string;
  userId: string | null;
  pendingEmail?: string;
  role:
    | "admin"
    | "veterinario"
    | "recepcion"
    | "asistente"
    | "contador"
    | "auditor";
  status: "active" | "pending" | "removed";
  invitedBy: string;
  updatedBy?: string;
  phone?: string;
  country?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deleted: boolean;
}

// export type MemberRole = 'admin' | 'veterinario' | 'recepcion' | 'asistente' | 'contador' | 'auditor';
// export type MemberStatus = 'active' | 'pending' | 'removed';
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

export interface IWorkspaceMember extends IBaseEntity {
  workspaceId: string;
  userId: string | null;
  pendingEmail?: string;
  phone?: IPhone;
  role: MemberRole;
  status: MemberStatus;
  invitedBy: string;
  updatedBy?: string;
}
