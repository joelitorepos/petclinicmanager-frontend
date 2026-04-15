// src/interfaces/Invoice.ts
export type InvoiceStatus =
  | 'draft'
  | 'issued'
  | 'paid'
  | 'partial'
  | 'cancelled'
  | 'overdue';

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'transfer'
  | 'check'
  | 'credit'
  | 'multiple';

export type CurrencyCode = 'GTQ' | 'EUR' | 'USD';

export interface IInvoice {
  id: string; // En el frontend solemos mapear _id a id
  workspaceId: string;
  invoiceNumber: string;
  serialNumber?: string;

  issueDate: string | Date; // ISO String desde el backend
  dueDate?: string | Date;
  paidDate?: string | Date;

  ownerId: string;
  patientId?: string;
  appointmentId?: string;
  clinicalRecordId?: string;

  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;

  // En el frontend manejamos números para cálculos rápidos
  // o strings si vienen formateados del backend
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  balance: number;

  notes?: string;
  terms?: string;
  paymentReference?: string;

  currency: CurrencyCode;
  taxId?: string;

  createdBy: string;
  updatedBy: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  deleted: boolean;
}

// Útil para formularios de creación (omitimos campos automáticos)
export type CreateInvoiceDto = Omit<IInvoice, 'id' | 'createdAt' | 'updatedAt' | 'deleted'>;