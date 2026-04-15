// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import ServicesLanding from '../pages/Services';
import Contact from '../pages/Contact';
import CurrentClinics from '../pages/CurrentClinics';
import ClinicDashboard from '../pages/ClinicDashboard';
import NotFound from '../pages/NotFound';

// rutas del dasboard
import HomePage from '../components/clinic/tools/Home'
import Pricing from '../components/clinic/tools/Pricing';
import Owners from '../components/clinic/tools/Owners';
import Patients from '../components/clinic/tools/Patients';
// import Pacientes from '../components/clinic/tools/Pacientes';
import WorkspaceMembers from '../components/clinic/tools/WorkspaceMembers'
import Appointments from '../components/clinic/tools/Appointments';
import ClinicalRecords from '../components/clinic/tools/ClinicalRecords';
import Inventory from '../components/clinic/tools/Inventory';
import InventoryBatch from '../components/clinic/tools/InventoryBatch';
import Services from '../components/clinic/tools/Services';
import Billing from '../components/clinic/tools/Billing';
import Reports from '../components/clinic/tools/Reports';
import Audit from '../components/clinic/tools/AuditLog';

import Settings from '../components/clinic/tools/Settings';

// Layouts
import PublicLayout from '../components/layout/PublicLayout';
import PrivateClinicLayout from '../components/layout/PrivateClinicLayout';

const AppRoutes = () => {
  return (
    <Routes>
      {/* === RUTAS PÚBLICAS (con Header y Footer de landing) === */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<ServicesLanding />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* === RUTAS PRIVADAS DE CLÍNICAS (sin Header público) === */}
      <Route element={<PrivateClinicLayout />}>
        <Route path="/clinics" element={<CurrentClinics />} />
        <Route path="/clinic/:slug" element={<ClinicDashboard />}>
          <Route index element={<HomePage />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="owners" element={<Owners />} />
          <Route path="patients" element={<Patients />} />
          <Route path="workspaceMembers" element={<WorkspaceMembers />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="clinical-records" element={<ClinicalRecords />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventoryBatch" element={<InventoryBatch />} />
          <Route path="services" element={<Services />} />
          <Route path="billing" element={<Billing />} />
          <Route path="reports" element={<Reports />} />
          <Route path="audit" element={<Audit />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Redirección por si alguien entra directamente a /clinic sin slug */}
      <Route path="/clinic" element={<Navigate to="/clinics" replace />} />

      {/* 404 global */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;