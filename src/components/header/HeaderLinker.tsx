// src/components/header/HeaderLinker.tsx
import { Link } from 'react-router-dom'; // Asegúrate de usar react-router-dom si usas rutas SPA

interface HeaderLinkerProps {
  nombre: string;
  ruta: string;
  onClick?: () => void; // Para cerrar menú móvil
}

const HeaderLinker = ({ nombre, ruta, onClick }: HeaderLinkerProps) => {
  return (
    <li>
      <Link
        to={ruta}
        onClick={onClick}
        className="block px-4 py-3 text-lg font-medium text-emerald-50 hover:bg-emerald-500/30 hover:text-white rounded-lg transition-all duration-200 hover:scale-105 select-none"
      >
        {nombre}
      </Link>
    </li>
  );
};

export default HeaderLinker;