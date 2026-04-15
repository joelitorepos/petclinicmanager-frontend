// src/pages/Contact.tsx
import PageWrapper from '../components/layout/PageWrapper';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { useLanguage } from '../hooks/useLanguage';
import { Mail, Phone, MessageSquare, Linkedin, Instagram, Globe } from 'lucide-react';

const Contact = () => {
  const { t } = useLanguage();

  return (
    <PageWrapper>
      <div className="absolute top-20 right-4">
        <LanguageSwitcher />
      </div>

      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-600 mb-4">
            {t('contact:hero_title')}
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            {t('contact:hero_subtitle')}
          </p>
        </div>

        {/* Opciones de contacto rápidas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="text-emerald-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-emerald-600 mb-3">
              {t('contact:whatsapp_title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('contact:whatsapp_desc')}
            </p>
            <a
              href="https://wa.me/50212345678?text=Hola%21%20Quiero%20saber%20más%20sobre%20Pet%20Clinic%20Manager"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-700 transition"
            >
              {t('contact:whatsapp_button')}
            </a>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5 text-center hover:shadow-xl transition">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="text-emerald-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-emerald-600 mb-3">
              {t('contact:email_title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('contact:email_desc')}
            </p>
            <a
              href="mailto:hola@petclinicmanager.com"
              className="text-emerald-600 font-semibold hover:underline text-lg"
            >
              hola@petclinicmanager.com
            </a>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition md:col-span-2 lg:col-span-1">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Phone className="text-emerald-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-emerald-600 mb-3">
              {t('contact:phone_title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('contact:phone_desc')}
            </p>
            <a
              href="tel:+50212345678"
              className="text-emerald-600 font-semibold hover:underline text-lg"
            >
              +502 1234 5678
            </a>
          </div>
        </div>

        {/* Redes sociales profesionales */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            {t('contact:social_title')}
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            {t('contact:social_desc')}
          </p>

          <div className="flex justify-center gap-8 flex-wrap">
            <a
              href="https://www.linkedin.com/in/victor-abdias-joel/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-800 transition"
              aria-label="LinkedIn"
            >
              <Linkedin size={40} />
            </a>
            <a
              href="https://instagram.com/petclinicmanager_gt"  // o tu cuenta real
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-800 transition"
              aria-label="Instagram"
            >
              <Instagram size={40} />
            </a>
            {/* Agrega más si tienes: Twitter/X, Facebook, TikTok, etc. */}
            <a
              href="https://petclinicmanager.com"  // o tu blog/portfolio
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-800 transition"
              aria-label="Sitio web"
            >
              <Globe size={40} />
            </a>
          </div>
        </div>

        {/* Mensaje final / FAQ rápida */}
        <div className="bg-emerald-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-emerald-700 mb-4">
            {t('contact:faq_title')}
          </h3>
          <p className="text-gray-700 max-w-3xl mx-auto">
            {t('contact:faq_desc')}
          </p>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Contact;