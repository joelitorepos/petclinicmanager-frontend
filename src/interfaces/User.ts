// src/interfaces/user.ts
export interface User {
  _id: string;
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  lastLogin?: string; // Date como string por JSON
  language?: 'es' | 'en';
}