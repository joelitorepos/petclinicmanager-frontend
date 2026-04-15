// src/config/tables/owners.ts

export const ownersColumns = [
  { field: 'nombre', header: 'Nombre', className: 'w-4/12' },
  { field: 'telefono', header: 'Teléfono', className: 'w-3/12' },
  { field: 'telefono2', header: 'Teléfono 2', className: 'w-3/12' },
  { field: 'email', header: 'Email', className: 'w-3/12' },
  { field: 'direccion', header: 'Dirección', className: 'w-4/12', multiline: true },
  { field: 'nit', header: 'NIT', className: 'w-2/12' },
];