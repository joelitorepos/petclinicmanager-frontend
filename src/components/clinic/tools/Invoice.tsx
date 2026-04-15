// // src/components/clinic/tools/ManualInvoice.tsx

// import { useState, useMemo, useEffect } from 'react';
// import { useLanguage } from '../../../hooks/useLanguage';
// import BASEURL from '../../../hooks/BaseUrl';
// import { useAuthAwareFetch } from '../../../hooks/useAuthAwareFetch';
// import useFetch from '../../../hooks/useFetch';
// // import usePost from '../../../hooks/usePost';
// import Button from '../../ui/Button';
// import Input from '../../ui/Input';
// import Select from '../../ui/Select';
// import DateInput from '../../ui/DateInput';
// import InfoNote from '../../ui/InfoNote';
// // import DataTableWithSearch from '../../common/DataTableWithSearch';
// import { CreateConfirmationModal } from '../../modal/ConfirmationModals';
// import { useEditableTable } from '../../../hooks/useEditableTable';
// import type { CurrentWorkspaceResponse } from '../../../interfaces/Workspace';
// import type { IInvoice, InvoiceStatus } from '../../../interfaces/Invoice';
// import type { ITaxConfig } from '../../../interfaces/TaxConfig';
// import { z } from 'zod';

// // ─── Tipos locales ─────────────────────────────────────────────────────────────

// type ItemType = 'service' | 'product' | 'manual';
// type PaymentType =
//   | 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer'
//   | 'check' | 'mobile_payment' | 'credit_note' | 'other';

// interface InvoiceItemForm {
//   itemType: ItemType;
//   description: string;
//   quantity: number;
//   unitPrice: number;
//   taxRate: number;
//   discountRate: number;
//   notes?: string;
// }

// interface TableRow extends Record<string, unknown> {
//   id: string;
//   invoiceNumber: string;
//   status: InvoiceStatus;
//   issueDate: string;
//   dueDate?: string;
//   ownerName?: string;
//   subtotal: number;
//   taxAmount: number;
//   total: number;
//   paidAmount: number;
//   balance: number;
//   currency: string;
//   notes?: string;
// }

// // ─── Helpers ───────────────────────────────────────────────────────────────────

// const toNum = (val: unknown): number => {
//   if (val === null || val === undefined) return 0;
//   if (typeof val === 'object' && '$numberDecimal' in (val as object)) {
//     return parseFloat((val as { $numberDecimal: string }).$numberDecimal);
//   }
//   return parseFloat(String(val)) || 0;
// };

// const fmt = (n: number, currency = 'GTQ') =>
//   new Intl.NumberFormat('es-GT', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n);

// const STATUS_BADGE: Record<InvoiceStatus, { label: string; classes: string }> = {
//   draft:     { label: 'Borrador',  classes: 'bg-gray-100 text-gray-700' },
//   issued:    { label: 'Emitida',   classes: 'bg-blue-100 text-blue-700' },
//   paid:      { label: 'Pagada',    classes: 'bg-green-100 text-green-700' },
//   partial:   { label: 'Parcial',   classes: 'bg-yellow-100 text-yellow-700' },
//   cancelled: { label: 'Anulada',   classes: 'bg-red-100 text-red-700' },
//   overdue:   { label: 'Vencida',   classes: 'bg-orange-100 text-orange-700' },
// };

// // ─── Schemas ───────────────────────────────────────────────────────────────────

// const InvoiceItemSchema = z.object({
//   itemType: z.enum(['service', 'product', 'manual']),
//   description: z.string().min(1, 'La descripción es requerida').max(500),
//   quantity: z.number().min(0.001, 'La cantidad debe ser mayor a 0'),
//   unitPrice: z.number().min(0, 'El precio no puede ser negativo'),
//   taxRate: z.number().min(0).max(100),
//   discountRate: z.number().min(0).max(100),
//   notes: z.string().max(500).optional(),
// });

// const InvoiceFormSchema = z.object({
//   ownerId: z.string().min(1, 'El dueño es requerido'),
//   items: z.array(InvoiceItemSchema).min(1, 'Debe incluir al menos un ítem'),
//   currency: z.enum(['GTQ', 'USD', 'EUR']),
//   dueDate: z.string().optional(),
//   notes: z.string().max(1000).optional(),
//   terms: z.string().max(2000).optional(),
// });

// // ─── Sub-componentes ───────────────────────────────────────────────────────────

// // Modal para registrar un pago
// interface PaymentModalProps {
//   isOpen: boolean;
//   invoice: TableRow | null;
//   onClose: () => void;
//   onConfirm: (data: PaymentFormData) => Promise<void>;
//   loading: boolean;
// }

// interface PaymentFormData {
//   amount: number;
//   paymentType: PaymentType;
//   reference?: string;
//   cardLastFour?: string;
//   bankName?: string;
//   checkNumber?: string;
// }

// const PaymentModal = ({ isOpen, invoice, onClose, onConfirm, loading }: PaymentModalProps) => {
//   const [amount, setAmount] = useState('');
//   const [paymentType, setPaymentType] = useState<PaymentType>('cash');
//   const [reference, setReference] = useState('');
//   const [cardLastFour, setCardLastFour] = useState('');
//   const [bankName, setBankName] = useState('');
//   const [checkNumber, setCheckNumber] = useState('');
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (isOpen && invoice) {
//       setAmount(String(invoice.balance.toFixed(2)));
//       setPaymentType('cash');
//       setReference('');
//       setCardLastFour('');
//       setBankName('');
//       setCheckNumber('');
//       setError(null);
//     }
//   }, [isOpen, invoice]);

//   const handleSubmit = async () => {
//     const numAmount = parseFloat(amount);
//     if (!numAmount || numAmount <= 0) {
//       setError('El monto debe ser mayor a 0');
//       return;
//     }
//     if (invoice && numAmount > invoice.balance) {
//       setError(`El monto no puede superar el balance pendiente (${fmt(invoice.balance, invoice.currency)})`);
//       return;
//     }
//     setError(null);
//     await onConfirm({ amount: numAmount, paymentType, reference, cardLastFour, bankName, checkNumber });
//   };

//   if (!isOpen || !invoice) return null;

//   const needsCard = paymentType === 'credit_card' || paymentType === 'debit_card';
//   const needsBank = paymentType === 'bank_transfer' || paymentType === 'check';

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-[rgb(var(--surface))] rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
//         <h2 className="text-xl font-bold mb-1">Registrar Pago</h2>
//         <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">
//           Factura <span className="font-mono font-semibold">{invoice.invoiceNumber}</span>
//           {' · '}Balance pendiente: <span className="font-semibold text-[rgb(var(--primary))]">
//             {fmt(invoice.balance, invoice.currency)}
//           </span>
//         </p>

//         <div className="space-y-4">
//           <Input
//             label="Monto a pagar"
//             type="number"
//             value={amount}
//             onChange={setAmount}
//             required
//           />

//           <Select
//             label="Método de pago"
//             value={paymentType}
//             onChange={(v) => setPaymentType(v as PaymentType)}
//             options={[
//               { value: 'cash',           label: 'Efectivo' },
//               { value: 'credit_card',    label: 'Tarjeta de crédito' },
//               { value: 'debit_card',     label: 'Tarjeta de débito' },
//               { value: 'bank_transfer',  label: 'Transferencia bancaria' },
//               { value: 'check',          label: 'Cheque' },
//               { value: 'mobile_payment', label: 'Pago móvil' },
//               { value: 'other',          label: 'Otro' },
//             ]}
//           />

//           {(needsCard || paymentType === 'bank_transfer' || paymentType === 'mobile_payment' || paymentType === 'other') && (
//             <Input
//               label="Referencia / No. de transacción"
//               value={reference}
//               onChange={setReference}
//             />
//           )}

//           {needsCard && (
//             <Input
//               label="Últimos 4 dígitos de la tarjeta"
//               value={cardLastFour}
//               onChange={setCardLastFour}
//               validationRegex={/^\d{0,4}$/}
//               errorMessage="Solo 4 dígitos"
//             />
//           )}

//           {needsBank && (
//             <Input
//               label="Nombre del banco"
//               value={bankName}
//               onChange={setBankName}
//             />
//           )}

//           {paymentType === 'check' && (
//             <Input
//               label="Número de cheque"
//               value={checkNumber}
//               onChange={setCheckNumber}
//             />
//           )}

//           {error && <p className="text-red-600 text-sm">{error}</p>}

//           <div className="flex justify-end gap-3 pt-2">
//             <Button variant="secondary" onClick={onClose} disabled={loading}>
//               Cancelar
//             </Button>
//             <Button onClick={handleSubmit} disabled={loading} loading={loading}>
//               Registrar pago
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Modal para añadir un ítem a una factura existente
// interface AddItemModalProps {
//   isOpen: boolean;
//   invoice: TableRow | null;
//   defaultTaxRate: number;
//   onClose: () => void;
//   onConfirm: (item: InvoiceItemForm) => Promise<void>;
//   loading: boolean;
// }

// const AddItemModal = ({ isOpen, invoice, defaultTaxRate, onClose, onConfirm, loading }: AddItemModalProps) => {
//   const [itemType, setItemType] = useState<ItemType>('manual');
//   const [description, setDescription] = useState('');
//   const [quantity, setQuantity] = useState('1');
//   const [unitPrice, setUnitPrice] = useState('');
//   const [taxRate, setTaxRate] = useState(String(defaultTaxRate));
//   const [discountRate, setDiscountRate] = useState('0');
//   const [notes, setNotes] = useState('');
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (isOpen) {
//       setItemType('manual');
//       setDescription('');
//       setQuantity('1');
//       setUnitPrice('');
//       setTaxRate(String(defaultTaxRate));
//       setDiscountRate('0');
//       setNotes('');
//       setError(null);
//     }
//   }, [isOpen, defaultTaxRate]);

//   const handleSubmit = async () => {
//     const result = InvoiceItemSchema.safeParse({
//       itemType,
//       description: description.trim(),
//       quantity: parseFloat(quantity),
//       unitPrice: parseFloat(unitPrice),
//       taxRate: parseFloat(taxRate),
//       discountRate: parseFloat(discountRate),
//       notes: notes.trim() || undefined,
//     });

//     if (!result.success) {
//       const msgs = result.error.errors.map(e => e.message);
//       setError(msgs[0] ?? 'Error de validación');
//       return;
//     }

//     setError(null);
//     await onConfirm(result.data);
//   };

//   // Preview de totales
//   const qty = parseFloat(quantity) || 0;
//   const price = parseFloat(unitPrice) || 0;
//   const tax = parseFloat(taxRate) || 0;
//   const disc = parseFloat(discountRate) || 0;
//   const subtotal = qty * price;
//   const discAmt = subtotal * (disc / 100);
//   const taxable = subtotal - discAmt;
//   const taxAmt = taxable * (tax / 100);
//   const total = taxable + taxAmt;

//   if (!isOpen || !invoice) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-[rgb(var(--surface))] rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
//         <h2 className="text-xl font-bold mb-1">Agregar ítem</h2>
//         <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">
//           Factura <span className="font-mono font-semibold">{invoice.invoiceNumber}</span>
//         </p>

//         <div className="space-y-4">
//           <Select
//             label="Tipo de ítem"
//             value={itemType}
//             onChange={(v) => setItemType(v as ItemType)}
//             options={[
//               { value: 'manual',  label: 'Manual' },
//               { value: 'service', label: 'Servicio' },
//               { value: 'product', label: 'Producto' },
//             ]}
//           />

//           <Input
//             label="Descripción"
//             value={description}
//             onChange={setDescription}
//             required
//           />

//           <div className="grid grid-cols-2 gap-4">
//             <Input
//               label="Cantidad"
//               type="number"
//               value={quantity}
//               onChange={setQuantity}
//               required
//             />
//             <Input
//               label="Precio unitario"
//               type="number"
//               value={unitPrice}
//               onChange={setUnitPrice}
//               required
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <Input
//               label="Impuesto (%)"
//               type="number"
//               value={taxRate}
//               onChange={setTaxRate}
//             />
//             <Input
//               label="Descuento (%)"
//               type="number"
//               value={discountRate}
//               onChange={setDiscountRate}
//             />
//           </div>

//           <Input
//             label="Notas (opcional)"
//             value={notes}
//             onChange={setNotes}
//             multiline
//             rows={2}
//           />

//           {/* Preview */}
//           {qty > 0 && price > 0 && (
//             <div className="bg-[rgb(var(--background-secondary))] rounded-lg p-3 text-sm space-y-1">
//               <div className="flex justify-between">
//                 <span className="text-[rgb(var(--text-secondary))]">Subtotal</span>
//                 <span>{fmt(subtotal, invoice.currency)}</span>
//               </div>
//               {discAmt > 0 && (
//                 <div className="flex justify-between text-red-600">
//                   <span>Descuento ({disc}%)</span>
//                   <span>-{fmt(discAmt, invoice.currency)}</span>
//                 </div>
//               )}
//               <div className="flex justify-between">
//                 <span className="text-[rgb(var(--text-secondary))]">Impuesto ({tax}%)</span>
//                 <span>{fmt(taxAmt, invoice.currency)}</span>
//               </div>
//               <div className="flex justify-between font-bold border-t border-[rgb(var(--border))] pt-1 mt-1">
//                 <span>Total ítem</span>
//                 <span>{fmt(total, invoice.currency)}</span>
//               </div>
//             </div>
//           )}

//           {error && <p className="text-red-600 text-sm">{error}</p>}

//           <div className="flex justify-end gap-3 pt-2">
//             <Button variant="secondary" onClick={onClose} disabled={loading}>
//               Cancelar
//             </Button>
//             <Button onClick={handleSubmit} disabled={loading} loading={loading}>
//               Agregar ítem
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Modal de cancelación con motivo
// interface CancelModalProps {
//   isOpen: boolean;
//   invoice: TableRow | null;
//   onClose: () => void;
//   onConfirm: (reason: string) => Promise<void>;
//   loading: boolean;
// }

// const CancelModal = ({ isOpen, invoice, onClose, onConfirm, loading }: CancelModalProps) => {
//   const [reason, setReason] = useState('');
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (isOpen) {
//       setReason('');
//       setError(null);
//     }
//   }, [isOpen]);

//   const handleConfirm = async () => {
//     if (!reason.trim()) {
//       setError('El motivo de anulación es requerido');
//       return;
//     }
//     setError(null);
//     await onConfirm(reason.trim());
//   };

//   if (!isOpen || !invoice) return null;

//   const isPaid = invoice.status === 'paid';

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-[rgb(var(--surface))] rounded-xl p-6 w-full max-w-md">
//         <h2 className="text-xl font-bold mb-1 text-red-600">Anular factura</h2>
//         <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">
//           Factura <span className="font-mono font-semibold">{invoice.invoiceNumber}</span>
//         </p>

//         {isPaid && (
//           <InfoNote variant="warning">
//             Esta factura ya fue pagada ({fmt(invoice.paidAmount, invoice.currency)}).
//             Al anularla se generará automáticamente una nota de crédito por ese monto.
//           </InfoNote>
//         )}

//         <div className="space-y-4 mt-4">
//           <Input
//             label="Motivo de anulación"
//             value={reason}
//             onChange={setReason}
//             required
//             multiline
//             rows={3}
//             placeholder="Describe el motivo por el que se anula esta factura..."
//           />

//           {error && <p className="text-red-600 text-sm">{error}</p>}

//           <div className="flex justify-end gap-3">
//             <Button variant="secondary" onClick={onClose} disabled={loading}>
//               Cancelar
//             </Button>
//             <Button variant="danger" onClick={handleConfirm} disabled={loading} loading={loading}>
//               Confirmar anulación
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Vista principal ───────────────────────────────────────────────────────────

// const ManualInvoice = () => {
//   const { t } = useLanguage();

//   // ── Workspace & datos de apoyo ──────────────────────────────────────────────
//   const { data: currentWorkspaceData } = useFetch<CurrentWorkspaceResponse>(
//     `${BASEURL}/api/workspaces/current`
//   );
//   const workspaceId = currentWorkspaceData?.workspace?._id || null;

//   const { data: ownersRaw } = useAuthAwareFetch<{ owners: Array<{ _id: string; nombre: string }> }>(
//     workspaceId ? `${BASEURL}/api/workspaces/${workspaceId}/owners` : '',
//     [workspaceId],
//     { skipInitialFetch: !workspaceId }
//   );

//   const { data: taxConfigsRaw } = useAuthAwareFetch<ITaxConfig[]>(
//     workspaceId ? `${BASEURL}/api/workspaces/${workspaceId}/tax-configs` : '',
//     [workspaceId],
//     { skipInitialFetch: !workspaceId }
//   );

//   const owners = useMemo(() => {
//     const list = Array.isArray(ownersRaw) ? ownersRaw : (ownersRaw as any)?.owners ?? [];
//     return list.map((o: { _id: string; nombre: string }) => ({ value: o._id, label: o.nombre }));
//   }, [ownersRaw]);

//   // Tasa de impuesto activa para precompletar los ítems
//   const defaultTaxRate = useMemo(() => {
//     if (!taxConfigsRaw) return 12;
//     const configs = Array.isArray(taxConfigsRaw) ? taxConfigsRaw : [];
//     const active = configs.find(c => c.isActive && c.isDefault)
//       ?? configs.find(c => c.isActive);
//     return active?.taxRate ?? 12;
//   }, [taxConfigsRaw]);

//   // ── Lista de facturas ────────────────────────────────────────────────────────
//   const {
//     data: invoicesRaw,
//     loading: loadingInvoices,
//     error: errorInvoices,
//     refetch: refetchInvoices,
//   } = useAuthAwareFetch<IInvoice[]>(
//     workspaceId ? `${BASEURL}/api/workspaces/${workspaceId}/invoices` : '',
//     [workspaceId],
//     { skipInitialFetch: !workspaceId }
//   );

//   const tableDataFromBackend = useMemo<TableRow[]>(() => {
//     const list: IInvoice[] = Array.isArray(invoicesRaw)
//       ? invoicesRaw
//       : (invoicesRaw as any)?.invoices ?? [];

//     return list.map((inv): TableRow => ({
//       id: inv.id ?? (inv as any)._id,
//       invoiceNumber: inv.invoiceNumber,
//       status: inv.status,
//       issueDate: inv.issueDate ? new Date(inv.issueDate).toLocaleDateString('es-GT') : '',
//       dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('es-GT') : undefined,
//       ownerName: (inv as any).ownerId?.nombre ?? '',
//       subtotal: toNum(inv.subtotal),
//       taxAmount: toNum(inv.taxAmount),
//       total: toNum(inv.total),
//       paidAmount: toNum(inv.paidAmount),
//       balance: toNum(inv.balance),
//       currency: inv.currency,
//       notes: inv.notes,
//     }));
//   }, [invoicesRaw]);

//   const { data: tableData, updateData } = useEditableTable<TableRow>(tableDataFromBackend);

//   useEffect(() => {
//     updateData(tableDataFromBackend);
//   }, [tableDataFromBackend, updateData]);

//   // ── Estado del formulario de creación ────────────────────────────────────────
//   const [ownerId, setOwnerId] = useState('');
//   const [currency, setCurrency] = useState<'GTQ' | 'USD' | 'EUR'>('GTQ');
//   const [dueDate, setDueDate] = useState('');
//   const [invoiceNotes, setInvoiceNotes] = useState('');
//   const [invoiceTerms, setInvoiceTerms] = useState('');
//   const [items, setItems] = useState<InvoiceItemForm[]>([
//     { itemType: 'manual', description: '', quantity: 1, unitPrice: 0, taxRate: defaultTaxRate, discountRate: 0 },
//   ]);
//   const [formError, setFormError] = useState<string | null>(null);

//   useEffect(() => {
//     setItems(prev =>
//       prev.map(item => ({ ...item, taxRate: defaultTaxRate }))
//     );
//   }, [defaultTaxRate]);

//   // Modal crear
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [createLoading, setCreateLoading] = useState(false);

//   // Modal cancelar
//   const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
//   const [cancelInvoice, setCancelInvoice] = useState<TableRow | null>(null);
//   const [cancelLoading, setCancelLoading] = useState(false);

//   // Modal pago
//   const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
//   const [paymentInvoice, setPaymentInvoice] = useState<TableRow | null>(null);
//   const [paymentLoading, setPaymentLoading] = useState(false);

//   // Modal añadir ítem
//   const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
//   const [addItemInvoice, setAddItemInvoice] = useState<TableRow | null>(null);
//   const [addItemLoading, setAddItemLoading] = useState(false);

//   // ── Manejo de ítems del formulario ───────────────────────────────────────────
//   const addItem = () => {
//     setItems(prev => [...prev, {
//       itemType: 'manual', description: '', quantity: 1,
//       unitPrice: 0, taxRate: defaultTaxRate, discountRate: 0,
//     }]);
//   };

//   const removeItem = (idx: number) => {
//     setItems(prev => prev.filter((_, i) => i !== idx));
//   };

//   const updateItem = (idx: number, field: keyof InvoiceItemForm, value: string | number) => {
//     setItems(prev => prev.map((item, i) =>
//       i === idx ? { ...item, [field]: value } : item
//     ));
//   };

//   // ── Totales en tiempo real ───────────────────────────────────────────────────
//   const invoiceTotals = useMemo(() => {
//     let subtotal = 0, taxAmount = 0, discountAmount = 0, total = 0;
//     items.forEach(item => {
//       const s = item.quantity * item.unitPrice;
//       const d = s * (item.discountRate / 100);
//       const taxable = s - d;
//       const tx = taxable * (item.taxRate / 100);
//       subtotal += s;
//       discountAmount += d;
//       taxAmount += tx;
//       total += taxable + tx;
//     });
//     return { subtotal, taxAmount, discountAmount, total };
//   }, [items]);

//   // ── Handlers ─────────────────────────────────────────────────────────────────
//   const handleOpenCreateModal = () => {
//     const result = InvoiceFormSchema.safeParse({
//       ownerId,
//       items: items.map(i => ({
//         ...i,
//         quantity: Number(i.quantity),
//         unitPrice: Number(i.unitPrice),
//         taxRate: Number(i.taxRate),
//         discountRate: Number(i.discountRate),
//       })),
//       currency,
//       dueDate: dueDate || undefined,
//       notes: invoiceNotes || undefined,
//       terms: invoiceTerms || undefined,
//     });

//     if (!result.success) {
//       const errors = result.error.errors;
//       setFormError(errors[0]?.message ?? 'Error de validación');
//       return;
//     }
//     setFormError(null);
//     setIsCreateModalOpen(true);
//   };

//   const handleConfirmCreate = async () => {
//     setCreateLoading(true);
//     try {
//       const res = await fetch(`${BASEURL}/api/workspaces/${workspaceId}/invoices`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ownerId,
//           currency,
//           dueDate: dueDate || undefined,
//           notes: invoiceNotes || undefined,
//           terms: invoiceTerms || undefined,
//           items: items.map(i => ({
//             itemType: i.itemType,
//             description: i.description,
//             quantity: Number(i.quantity),
//             unitPrice: Number(i.unitPrice),
//             taxRate: Number(i.taxRate),
//             discountRate: Number(i.discountRate),
//             notes: i.notes || undefined,
//           })),
//         }),
//       });

//       if (!res.ok) {
//         const data = await res.json();
//         throw new Error(data.error || 'Error al crear la factura');
//       }

//       // Reset form
//       setOwnerId('');
//       setDueDate('');
//       setInvoiceNotes('');
//       setInvoiceTerms('');
//       setItems([{ itemType: 'manual', description: '', quantity: 1, unitPrice: 0, taxRate: defaultTaxRate, discountRate: 0 }]);
//       setIsCreateModalOpen(false);
//       refetchInvoices();
//     } catch (err: unknown) {
//       setFormError(err instanceof Error ? err.message : 'Error inesperado');
//       setIsCreateModalOpen(false);
//     } finally {
//       setCreateLoading(false);
//     }
//   };

//   const handleCancelInvoice = (id: string) => {
//     const inv = tableData.find(r => r.id === id) ?? null;
//     setCancelInvoice(inv);
//     setIsCancelModalOpen(true);
//   };

//   const handleConfirmCancel = async (reason: string) => {
//     if (!cancelInvoice) return;
//     setCancelLoading(true);
//     try {
//       const res = await fetch(
//         `${BASEURL}/api/workspaces/${workspaceId}/invoices/${cancelInvoice.id}/cancel`,
//         {
//           method: 'PATCH',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ reason }),
//         }
//       );
//       if (!res.ok) {
//         const data = await res.json();
//         throw new Error(data.error || 'Error al anular la factura');
//       }
//       setIsCancelModalOpen(false);
//       setCancelInvoice(null);
//       refetchInvoices();
//     } catch (err: unknown) {
//       setFormError(err instanceof Error ? err.message : 'Error inesperado');
//     } finally {
//       setCancelLoading(false);
//     }
//   };

//   const handleOpenPayment = (id: string) => {
//     const inv = tableData.find(r => r.id === id) ?? null;
//     setPaymentInvoice(inv);
//     setIsPaymentModalOpen(true);
//   };

//   const handleConfirmPayment = async (data: PaymentFormData) => {
//     if (!paymentInvoice) return;
//     setPaymentLoading(true);
//     try {
//       const res = await fetch(
//         `${BASEURL}/api/workspaces/${workspaceId}/invoices/${paymentInvoice.id}/payments`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             amount: data.amount,
//             paymentType: data.paymentType,
//             reference: data.reference || undefined,
//             cardLastFour: data.cardLastFour || undefined,
//             bankName: data.bankName || undefined,
//             checkNumber: data.checkNumber || undefined,
//           }),
//         }
//       );
//       if (!res.ok) {
//         const json = await res.json();
//         throw new Error(json.error || 'Error al registrar el pago');
//       }
//       setIsPaymentModalOpen(false);
//       setPaymentInvoice(null);
//       refetchInvoices();
//     } catch (err: unknown) {
//       setFormError(err instanceof Error ? err.message : 'Error inesperado');
//     } finally {
//       setPaymentLoading(false);
//     }
//   };

//   const handleOpenAddItem = (id: string) => {
//     const inv = tableData.find(r => r.id === id) ?? null;
//     setAddItemInvoice(inv);
//     setIsAddItemModalOpen(true);
//   };

//   const handleConfirmAddItem = async (item: InvoiceItemForm) => {
//     if (!addItemInvoice) return;
//     setAddItemLoading(true);
//     try {
//       const res = await fetch(
//         `${BASEURL}/api/workspaces/${workspaceId}/invoices/${addItemInvoice.id}/items`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             itemType: item.itemType,
//             description: item.description,
//             quantity: item.quantity,
//             unitPrice: item.unitPrice,
//             taxRate: item.taxRate,
//             discountRate: item.discountRate,
//             notes: item.notes || undefined,
//           }),
//         }
//       );
//       if (!res.ok) {
//         const json = await res.json();
//         throw new Error(json.error || 'Error al agregar el ítem');
//       }
//       setIsAddItemModalOpen(false);
//       setAddItemInvoice(null);
//       refetchInvoices();
//     } catch (err: unknown) {
//       setFormError(err instanceof Error ? err.message : 'Error inesperado');
//     } finally {
//       setAddItemLoading(false);
//     }
//   };

//   // ── Columnas de la tabla ──────────────────────────────────────────────────────
//   const columns = [
//     { field: 'invoiceNumber', header: 'No. Factura',  className: 'w-2/12 font-mono text-sm' },
//     { field: 'status',        header: 'Estado',       className: 'w-1/12' },
//     { field: 'ownerName',     header: 'Dueño',        className: 'w-2/12' },
//     { field: 'issueDate',     header: 'Fecha',        className: 'w-1/12' },
//     { field: 'total',         header: 'Total',        className: 'w-1/12' },
//     { field: 'paidAmount',    header: 'Pagado',       className: 'w-1/12' },
//     { field: 'balance',       header: 'Balance',      className: 'w-1/12' },
//     { field: 'currency',      header: 'Moneda',       className: 'w-1/12' },
//   ];

//   // Acciones condicionales por fila
//   const renderRowActions = (row: TableRow) => {
//     const canPay = ['issued', 'partial', 'overdue'].includes(row.status);
//     const canAddItem = ['draft', 'issued'].includes(row.status);
//     const canCancel = ['draft', 'issued', 'partial', 'overdue', 'paid'].includes(row.status);
//     const { label, classes } = STATUS_BADGE[row.status] ?? { label: row.status, classes: 'bg-gray-100 text-gray-700' };

//     return (
//       <div className="flex items-center gap-2 flex-wrap">
//         <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${classes}`}>
//           {label}
//         </span>
//         {canPay && (
//           <Button
//             size="sm"
//             variant="primary"
//             onClick={() => handleOpenPayment(row.id)}
//           >
//             Pagar
//           </Button>
//         )}
//         {canAddItem && (
//           <Button
//             size="sm"
//             variant="secondary"
//             onClick={() => handleOpenAddItem(row.id)}
//           >
//             + Ítem
//           </Button>
//         )}
//         {canCancel && (
//           <Button
//             size="sm"
//             variant="danger"
//             onClick={() => handleCancelInvoice(row.id)}
//           >
//             Anular
//           </Button>
//         )}
//       </div>
//     );
//   };

//   // ── Render ────────────────────────────────────────────────────────────────────
//   return (
//     <div className="space-y-8 p-6">

//       {/* ── Encabezado ── */}
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold text-[rgb(var(--text))]">
//           Facturación Manual
//         </h1>
//       </div>

//       <InfoNote variant="info">
//         Crea facturas manuales para cobros que no están vinculados a una cita.
//         Los impuestos se precargan con tu configuración activa de TaxConfig.
//       </InfoNote>

//       {/* ── Formulario de creación ── */}
//       <div className="border border-[rgb(var(--border))] rounded-xl p-6 space-y-6 bg-[rgb(var(--surface))]">
//         <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Nueva factura</h2>

//         {/* Datos generales */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <Select
//             label="Dueño *"
//             value={ownerId}
//             onChange={setOwnerId}
//             options={[{ value: '', label: 'Seleccionar dueño...' }, ...owners]}
//             required
//           />
//           <Select
//             label="Moneda"
//             value={currency}
//             onChange={(v) => setCurrency(v as 'GTQ' | 'USD' | 'EUR')}
//             options={[
//               { value: 'GTQ', label: 'GTQ – Quetzal' },
//               { value: 'USD', label: 'USD – Dólar' },
//               { value: 'EUR', label: 'EUR – Euro' },
//             ]}
//           />
//           <DateInput
//             label="Fecha de vencimiento (opcional)"
//             value={dueDate}
//             onChange={setDueDate}
//           />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <Input
//             label="Notas"
//             value={invoiceNotes}
//             onChange={setInvoiceNotes}
//             multiline
//             rows={2}
//           />
//           <Input
//             label="Términos y condiciones"
//             value={invoiceTerms}
//             onChange={setInvoiceTerms}
//             multiline
//             rows={2}
//           />
//         </div>

//         {/* Ítems */}
//         <div className="border border-[rgb(var(--border))] rounded-lg p-4 space-y-3">
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-[rgb(var(--text))]">Ítems</h3>
//             <Button onClick={addItem} variant="secondary" type="button" className="text-sm">
//               + Agregar ítem
//             </Button>
//           </div>

//           {items.map((item, idx) => (
//             <div
//               key={idx}
//               className="flex flex-col md:flex-row gap-2 items-start p-3 bg-[rgb(var(--background-secondary))] rounded-lg"
//             >
//               {/* Tipo */}
//               <div className="w-full md:w-1/12">
//                 <Select
//                   label="Tipo"
//                   value={item.itemType}
//                   onChange={(v) => updateItem(idx, 'itemType', v)}
//                   options={[
//                     { value: 'manual',  label: 'Manual' },
//                     { value: 'service', label: 'Servicio' },
//                     { value: 'product', label: 'Producto' },
//                   ]}
//                 />
//               </div>
//               {/* Descripción */}
//               <div className="w-full md:w-3/12">
//                 <Input
//                   label="Descripción"
//                   value={item.description}
//                   onChange={(v) => updateItem(idx, 'description', v)}
//                   required
//                 />
//               </div>
//               {/* Cantidad */}
//               <div className="w-full md:w-1/12">
//                 <Input
//                   label="Cant."
//                   type="number"
//                   value={String(item.quantity)}
//                   onChange={(v) => updateItem(idx, 'quantity', parseFloat(v) || 0)}
//                 />
//               </div>
//               {/* Precio */}
//               <div className="w-full md:w-2/12">
//                 <Input
//                   label="Precio unit."
//                   type="number"
//                   value={String(item.unitPrice)}
//                   onChange={(v) => updateItem(idx, 'unitPrice', parseFloat(v) || 0)}
//                 />
//               </div>
//               {/* Impuesto */}
//               <div className="w-full md:w-1/12">
//                 <Input
//                   label="IVA %"
//                   type="number"
//                   value={String(item.taxRate)}
//                   onChange={(v) => updateItem(idx, 'taxRate', parseFloat(v) || 0)}
//                 />
//               </div>
//               {/* Descuento */}
//               <div className="w-full md:w-1/12">
//                 <Input
//                   label="Desc. %"
//                   type="number"
//                   value={String(item.discountRate)}
//                   onChange={(v) => updateItem(idx, 'discountRate', parseFloat(v) || 0)}
//                 />
//               </div>
//               {/* Total del ítem */}
//               <div className="w-full md:w-2/12 flex flex-col justify-end">
//                 <span className="text-xs text-[rgb(var(--text-secondary))] mb-1">Total</span>
//                 <span className="font-semibold text-sm">
//                   {(() => {
//                     const s = item.quantity * item.unitPrice;
//                     const d = s * (item.discountRate / 100);
//                     const taxable = s - d;
//                     const tx = taxable * (item.taxRate / 100);
//                     return fmt(taxable + tx, currency);
//                   })()}
//                 </span>
//               </div>
//               {/* Eliminar */}
//               <div className="w-full md:w-auto flex items-end justify-end">
//                 <Button
//                   onClick={() => removeItem(idx)}
//                   variant="danger"
//                   type="button"
//                   disabled={items.length === 1}
//                 >
//                   ×
//                 </Button>
//               </div>
//             </div>
//           ))}

//           {/* Resumen de totales */}
//           <div className="flex justify-end mt-2">
//             <div className="min-w-[220px] space-y-1 text-sm">
//               <div className="flex justify-between text-[rgb(var(--text-secondary))]">
//                 <span>Subtotal</span>
//                 <span>{fmt(invoiceTotals.subtotal, currency)}</span>
//               </div>
//               {invoiceTotals.discountAmount > 0 && (
//                 <div className="flex justify-between text-red-600">
//                   <span>Descuentos</span>
//                   <span>-{fmt(invoiceTotals.discountAmount, currency)}</span>
//                 </div>
//               )}
//               <div className="flex justify-between text-[rgb(var(--text-secondary))]">
//                 <span>Impuestos</span>
//                 <span>{fmt(invoiceTotals.taxAmount, currency)}</span>
//               </div>
//               <div className="flex justify-between font-bold text-base border-t border-[rgb(var(--border))] pt-1">
//                 <span>Total</span>
//                 <span>{fmt(invoiceTotals.total, currency)}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {formError && (
//           <p className="text-red-600 text-sm">{formError}</p>
//         )}

//         <div className="flex justify-end">
//           <Button onClick={handleOpenCreateModal} disabled={createLoading}>
//             Crear factura
//           </Button>
//         </div>
//       </div>

//       {/* ── Modales ── */}
//       <CreateConfirmationModal
//         isOpen={isCreateModalOpen}
//         onClose={() => setIsCreateModalOpen(false)}
//         onConfirm={handleConfirmCreate}
//         loading={createLoading}
//         title="Confirmar creación de factura"
//         data={{
//           ownerLabel: owners.find(o => o.value === ownerId)?.label,
//           itemsCount: items.length,
//           total: fmt(invoiceTotals.total, currency),
//           currency,
//           notes: invoiceNotes || undefined,
//         }}
//       />

//       <CancelModal
//         isOpen={isCancelModalOpen}
//         invoice={cancelInvoice}
//         onClose={() => { setIsCancelModalOpen(false); setCancelInvoice(null); }}
//         onConfirm={handleConfirmCancel}
//         loading={cancelLoading}
//       />

//       <PaymentModal
//         isOpen={isPaymentModalOpen}
//         invoice={paymentInvoice}
//         onClose={() => { setIsPaymentModalOpen(false); setPaymentInvoice(null); }}
//         onConfirm={handleConfirmPayment}
//         loading={paymentLoading}
//       />

//       <AddItemModal
//         isOpen={isAddItemModalOpen}
//         invoice={addItemInvoice}
//         defaultTaxRate={defaultTaxRate}
//         onClose={() => { setIsAddItemModalOpen(false); setAddItemInvoice(null); }}
//         onConfirm={handleConfirmAddItem}
//         loading={addItemLoading}
//       />

//       {/* ── Tabla de facturas ── */}
//       <div className="pt-2 space-y-4">
//         <div className="flex justify-between items-center">
//           <h2 className="text-2xl font-bold text-[rgb(var(--text))]">
//             Facturas emitidas
//           </h2>
//           <Button variant="primary" onClick={() => refetchInvoices()}>
//             Actualizar
//           </Button>
//         </div>

//         {loadingInvoices && (
//           <p className="text-[rgb(var(--text-secondary))]">Cargando facturas...</p>
//         )}
//         {errorInvoices && (
//           <p className="text-red-600">Error al cargar facturas: {errorInvoices.message}</p>
//         )}

//         {!loadingInvoices && (
//           <div className="space-y-3">
//             {tableData.map(row => (
//               <div
//                 key={row.id}
//                 className="border border-[rgb(var(--border))] rounded-lg p-4 bg-[rgb(var(--surface))] flex flex-col md:flex-row md:items-center gap-3 justify-between"
//               >
//                 {/* Info de la factura */}
//                 <div className="flex flex-col md:flex-row gap-4 flex-1 min-w-0">
//                   <div className="min-w-[140px]">
//                     <p className="text-xs text-[rgb(var(--text-secondary))]">No. Factura</p>
//                     <p className="font-mono font-semibold text-sm">{row.invoiceNumber}</p>
//                   </div>
//                   <div className="min-w-[120px]">
//                     <p className="text-xs text-[rgb(var(--text-secondary))]">Dueño</p>
//                     <p className="text-sm truncate">{row.ownerName || '—'}</p>
//                   </div>
//                   <div className="min-w-[90px]">
//                     <p className="text-xs text-[rgb(var(--text-secondary))]">Fecha</p>
//                     <p className="text-sm">{row.issueDate}</p>
//                   </div>
//                   <div className="min-w-[90px]">
//                     <p className="text-xs text-[rgb(var(--text-secondary))]">Total</p>
//                     <p className="text-sm font-medium">{fmt(row.total, row.currency)}</p>
//                   </div>
//                   <div className="min-w-[90px]">
//                     <p className="text-xs text-[rgb(var(--text-secondary))]">Pagado</p>
//                     <p className="text-sm text-green-600 font-medium">{fmt(row.paidAmount, row.currency)}</p>
//                   </div>
//                   <div className="min-w-[90px]">
//                     <p className="text-xs text-[rgb(var(--text-secondary))]">Balance</p>
//                     <p className={`text-sm font-semibold ${row.balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>a
//                       {fmt(row.balance, row.currency)}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Acciones */}
//                 <div className="flex-shrink-0">
//                   {renderRowActions(row)}
//                 </div>
//               </div>
//             ))}

//             {tableData.length === 0 && (
//               <p className="text-center py-12 text-[rgb(var(--text-secondary))]">
//                 No hay facturas manuales registradas.
//               </p>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ManualInvoice;