// src/components/layout/PrivateClinicLayout.tsx
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // o el hook/context que uses para autenticación

const PrivateClinicLayout = () => {
  const { user, loading } = useAuth(); // ajusta según tu sistema de auth
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-emerald-600">Cargando...</div>
      </div>
    );
  }

  // Si no está autenticado → redirige al login o a home
  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return (
    <>
      {/* Aquí puedes poner un Sidebar, Navbar interno de clínica, etc. */}
      <div className="min-h-screen bg-gray-50">
        <Outlet /> {/* CurrentClinics y ClinicDashboard */}
      </div>
    </>
  );
};

export default PrivateClinicLayout;