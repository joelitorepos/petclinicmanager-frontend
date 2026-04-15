// src/pages/ClinicDashboard.tsx
import { useParams } from 'react-router-dom';
import ClinicLayout from '../components/clinic/layout/ClinicLayout';
// import DashboardHome from '../components/tools/DashboardHome';

const ClinicDashboard = () => {
  const { slug } = useParams<{ slug: string }>();

  // Puedes usar el slug para cargar datos de la clínica si quieres
  console.log("Clínica actual:", slug);

  return <ClinicLayout />;
};

export default ClinicDashboard;