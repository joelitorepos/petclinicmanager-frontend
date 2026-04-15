// src/components/header/Header.tsx
import { useState } from 'react';
import HeaderLinker from './HeaderLinker';
import { Menu, X } from 'lucide-react'; // Instala: npm install lucide-react
import GoogleLoginButton from '../login/GoogleLoginButton';
import { useLanguage } from '../../hooks/useLanguage';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const { t } = useLanguage();

  return (
    <header className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Título */}
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
              Pet Clinic Manager
            </h1>
          </div>

          {/* Menú desktop */}
          <nav className="hidden md:flex items-center space-x-2">
            <ul className="flex space-x-2">
              <HeaderLinker nombre={t('common:views.home')} ruta="/" />
              <HeaderLinker nombre={t('common:views.about')} ruta="/about" />
              <HeaderLinker nombre={t('common:views.services')} ruta="/services" />
              <HeaderLinker nombre={t('common:views.contact')} ruta="/contact" />
            </ul>
            <GoogleLoginButton />
          </nav>

          {/* Botón menú móvil */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white hover:bg-emerald-600/50 p-2 rounded-lg transition"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isOpen && (
          <nav className="md:hidden pb-4">
            <ul className="space-y-2 mt-4 bg-emerald-600/90 backdrop-blur-sm rounded-xl p-4 shadow-2xl">
              <HeaderLinker nombre={t('common:views.home')} ruta="/" onClick={closeMenu} />
              <HeaderLinker nombre={t('common:views.about')} ruta="/about" onClick={closeMenu} />
              <HeaderLinker nombre={t('common:views.services')} ruta="/services" onClick={closeMenu} />
              <HeaderLinker nombre={t('common:views.contact')} ruta="/contact" onClick={closeMenu} />
              <li>
                <div onClick={closeMenu} className="pt-2 flex justify-center"> {/* Lo envuelvo en <li> para la estructura de la lista y lo centro */}
                  <GoogleLoginButton />
                </div>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;