// src/components/ui/BackButton.tsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface BackButtonProps {
  /** Ruta específica a la que deseas volver. Si no se provee, regresará a la página anterior en el historial. */
  to?: string;
  className?: string;
}

const BackButton = ({ to, className = '' }: BackButtonProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1); // Navegación hacia atrás en el historial del navegador
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`bg-emerald-600 text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 cursor-pointer hover:bg-emerald-700 ${className}`}
    >
      <ArrowLeft size={24} />
      {t('common:back')}
    </button>
  );
};

export default BackButton;