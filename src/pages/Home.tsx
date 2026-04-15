// src/pages/Home.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import ShowLoginModal from '../components/modal/ShowLoginModal';
import { useAuth } from '../hooks/useAuth';
import { Stethoscope, Heart, Calendar, Database } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { t } = useLanguage();

  // Función para manejar el botón: chequea auth y actúa
  const handleGoToClinic = () => {
    if (user) {
      navigate('/clinics'); // Usuario logueado → va a clínicas
    } else {
      setShowLoginModal(true); // Usuario no logueado → muestra modal de login
    }
  };

  // Si está cargando → mostramos un loader
  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-screen">
          <div className="text-2xl text-emerald-600">
            {t('home:loading')}
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="pb-5 py-8">
      <div className="absolute top-20 right-4">
        <LanguageSwitcher />
      </div>
      {/* Hero Principal */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-emerald-600 mb-6 leading-tight">
          {t('home:title_part1')}<br />
          <span className="text-emerald-700">{t('home:title_part2')}</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto mb-10">
          {t('home:subtitle')}
        </p>

        {/* Botón Principal - El más importante */}
        <button
          onClick={handleGoToClinic}
          className="bg-white text-emerald-600 text-xl font-bold px-10 py-6 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center gap-4 mx-auto cursor-pointer"
        >
          <Stethoscope size={36} />
          {/* Texto condicional basado en autenticación */}
          {user ? t('home:main_button_logged_in') : t('home:main_button_logged_out')}
        </button>

        <p className="mt-6 text-gray-600">
          {user 
            ? `${t('home:welcome_logged_in_part1')}${user.name}${t('home:welcome_logged_in_part2')}` 
            : t('home:welcome_logged_out')
          }
        </p>
      </div>

      {/* Características rápidas */}
      <div className="grid md:grid-cols-3 gap-10">
        <div className="text-center">
          <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="text-emerald-600" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            {t('home:feature1_title')}
          </h3>
          <p className="text-gray-600 mt-2">
            {t('home:feature1_description')}
          </p>
        </div>

        <div className="text-center">
          <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-emerald-600" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            {t('home:feature2_title')}
          </h3>
          <p className="text-gray-600 mt-2">
            {t('home:feature2_description')}
          </p>
        </div>

        <div className="text-center">
          <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="text-emerald-600" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            {t('home:feature3_title')}
          </h3>
          <p className="text-gray-600 mt-2">
            {t('home:feature3_description')}
          </p>
        </div>
      </div>

      {/* Modal de login */}
      {showLoginModal && <ShowLoginModal setShowLoginModal={setShowLoginModal} />}
    </PageWrapper>
  );
};

export default Home;