// src/components/workspace-setup/types.ts

export interface WorkspaceFormData {
  name: string;
  logo: File | string | null;
  phone: string | null;
  secondaryPhone: string | null;
  address: string | null;
  country: string | null;
  language: string | null;
  // plan se elimina porque siempre será 'free'
}

export interface Step1Data {
  name: string;            // Obligatorio, min 3 caracteres
  logo?: File | string;    // Opcional
}

export interface Step2Data {
  phone?: string;          // Opcional (con formato válido)
  secondaryPhone?: string; // Opcional (con formato válido)
  address?: string;        // Opcional (min 5 caracteres)
}

export interface Step3Data {
  country: string;         // OBLIGATORIO: 'GT', 'ES', 'US', 'MX', 'AR'
  language: string;        // OBLIGATORIO: 'en', 'es'
}