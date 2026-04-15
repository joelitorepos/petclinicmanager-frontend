// src/components/clinic/layout/Sidebar.tsx
import NavButton from '../navigation/NavButton';
import { useLanguage } from '../../../hooks/useLanguage';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  /**
   * Home: lo primero que ve el usuario, sirve para ser informativo de como puede empezar a usar la aplicación, 
   * una especie de tutorial rapido para entender la estructura de la aplicación y como navegar por ella.
   * Plans: gestionar planes de suscripción, métodos de pago, etc.
   * CRUDS: Owners, Patients, WorkspaceMember, Appointments, Clinical Records, Inventory, InventoryBatch, Service
   * Facturación: gestionar facturas, pagos, etc.
   * Reportes: generar reportes de ventas, pacientes, citas, etc.
   * Auditoria: revisar logs de actividad, cambios en datos, etc.
   * Ajustes: configurar temas, idiomas e informacion sobre su area de trabajo(Workspace)
   * 
   * Jerarquia de documentos: Owners, Patients(Necesita Owner), WorkspaceMember,
   * Appointments(Necesita Owner, Patient y WorkspaceMember que tenga rol 'veterinario'),
   * ClinicalRecords(Necesita Patient, Appointment y WorkspaceMember con rol 'veterinario'), Inventory, InventoryBatc(Nececsita Inventory), 
   * Service.
   */
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* Desktop: Sidebar lateral izquierdo */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-[rgb(var(--surface))] border-r border-[rgb(var(--border))] p-6 space-y-2">
        <h1 className="text-2xl font-bold mb-8 text-[rgb(var(--text-title))]">{t('common:my_clinic')}</h1>
        <nav className="space-y-1 text-[rgb(var(--text))]">
          <NavButton to="" icon="home" label={t('common:tools.home')} />
          <NavButton to="pricing" icon="credit-card" label={t('common:tools.pricing')} />
          <NavButton to="owners" icon="user" label={t('common:tools.owners')} />
          <NavButton to="patients" icon="paw-print" label={t('common:tools.patients')} />
          <NavButton to="workspaceMembers" icon="users" label={t('common:tools.workspaceMembers')} />
          <NavButton to="appointments" icon="calendar" label={t('common:tools.appointments')} />
          <NavButton to="clinical-records" icon="file-text" label={t('common:tools.clinicalRecords')} />
          <NavButton to="inventory" icon="package" label={t('common:tools.inventory')} />
          <NavButton to="inventoryBatch" icon="layers" label={t('common:tools.inventoryBatch')} />
          <NavButton to="services" icon="activity" label={t('common:tools.services')} />
          {/* <NavButton to="billing" icon="dollar-sign" label={t('common:tools.billing')} /> */}
          <NavButton to="reports" icon="bar-chart-3" label={t('common:tools.reports')} />
          <NavButton to="audit" icon="shield-check" label={t('common:tools.audit')} />
          <NavButton to="settings" icon="settings" label={t('common:tools.settings')} />
        </nav>
      </aside>

      {/* Mobile: Top bar con botón de menú */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 bg-[rgb(var(--surface))] border-b border-[rgb(var(--border))] px-4 py-3 z-50 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[rgb(var(--text-title))]">{t('common:my_clinic')}</h1>
        <button 
          onClick={toggleMenu} 
          className="p-2 rounded-lg hover:bg-[rgba(var(--primary),0.08)] transition"
          aria-label="Abrir menú"
        >
          <Menu size={24} className="text-[rgb(var(--text-secondary))]" />
        </button>
      </nav>

      {/* Full-screen mobile menu overlay */}
      {isMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 flex flex-col animate-fade-in bg-[rgb(var(--surface))]"
        >
          {/* Header del menú */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[rgb(var(--border))]">
            <h2 className="text-xl font-semibold text-[rgb(var(--text-title))]">{t('common:menu')}</h2>
            <button 
              onClick={closeMenu}
              className="p-2 rounded-full hover:bg-[rgba(var(--primary),0.1)] transition"
              aria-label="Cerrar menú"
            >
              <X size={24} className="text-[rgb(var(--text-secondary))]" />
            </button>
          </div>

          {/* Contenido del menú (scrollable) */}
          <div className="flex-1 overflow-y-auto px-4 py-2 bg-[rgb(var(--surface))] text-[rgb(var(--text-secondary))]">
            <nav className="space-y-1">
              <NavButton to="" icon="home" label={t('common:tools.home')} mobileDropdown onClick={closeMenu} />
              <NavButton to="pricing" icon="credit-card" label={t('common:tools.pricing')} mobileDropdown onClick={closeMenu} />
              <NavButton to="owners" icon="user" label={t('common:tools.owners')} mobileDropdown onClick={closeMenu} />
              <NavButton to="patients" icon="paw-print" label={t('common:tools.patients')} mobileDropdown onClick={closeMenu} />
              <NavButton to="workspaceMembers" icon="users" label={t('common:tools.workspaceMembers')} mobileDropdown onClick={closeMenu} />
              <NavButton to="appointments" icon="calendar" label={t('common:tools.appointments')} mobileDropdown onClick={closeMenu} />
              <NavButton to="clinical-records" icon="file-text" label={t('common:tools.clinicalRecords')} mobileDropdown onClick={closeMenu} />
              <NavButton to="inventory" icon="package" label={t('common:tools.inventory')} mobileDropdown onClick={closeMenu} />
              <NavButton to="inventoryBatch" icon="layers" label={t('common:tools.inventoryBatch')} mobileDropdown onClick={closeMenu} />
              <NavButton to="services" icon="activity" label={t('common:tools.services')} mobileDropdown onClick={closeMenu} />
              {/* <NavButton to="billing" icon="dollar-sign" label={t('common:tools.billing')} mobileDropdown onClick={closeMenu} /> */}
              <NavButton to="reports" icon="bar-chart-3" label={t('common:tools.reports')} mobileDropdown onClick={closeMenu} />
              <NavButton to="audit" icon="shield-check" label={t('common:tools.audit')} mobileDropdown onClick={closeMenu} />
              <NavButton to="settings" icon="settings" label={t('common:tools.settings')} mobileDropdown onClick={closeMenu} />
            </nav>
          </div>
        </div>
      )}

      {/* Espaciado para mobile (debajo de la barra superior) */}
      <div className="h-16 lg:hidden" />
    </>
  );
};

export default Sidebar;