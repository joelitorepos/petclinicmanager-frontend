// src/pages/clinic/home/Home.tsx
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../hooks/useLanguage';

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-10">
      {/* Título principal con enlace a la misma página (Home) */}
      <div>
        <Link
          to=""
          className="text-3xl font-bold text-[rgb(var(--text-title))] hover:text-[rgb(var(--primary))] transition-colors"
        >
          {t('common:tools.home')}
        </Link>
        <p className="mt-2 text-lg text-[rgb(var(--text-secondary))]">
          {t('homePage:welcomeMessage')}
        </p>
      </div>

      <hr className="border-t border-[rgb(var(--border))]" />

      {/* Configuración inicial */}
      <div>
        <Link
          to="settings"
          className="text-2xl font-semibold text-[rgb(var(--text-title))] hover:text-[rgb(var(--primary))] transition-colors"
        >
          {t('common:tools.settings')}
        </Link>
        <p className="mt-3 text-[rgb(var(--text))] leading-relaxed">
          {t('homePage:settingsTip')}
        </p>
        <p className="mt-2 text-sm text-[rgb(var(--text-secondary))]">
          {t('homePage:settingsTipDetail')}
        </p>
      </div>

      <hr className="border-t border-[rgb(var(--border))]" />

      <div>
        <Link
          to="pricing"
          className="text-2xl font-semibold text-[rgb(var(--text-title))] hover:text-[rgb(var(--primary))] transition-colors"
        >
          {t('common:tools.pricing')}
        </Link>
        <p className="mt-3 text-[rgb(var(--text))] leading-relaxed">
          {t('homePage:pricingDescription')}
        </p>
      </div>

      <hr className="border-t border-[rgb(var(--border))]" />

      {/* Gestión de datos principales (CRUDs agrupados) */}
      <div>
        <h2 className="text-2xl font-semibold text-[rgb(var(--text-title))] mb-4">
          {t('homePage:dataManagement')}
        </h2>
        <p className="text-[rgb(var(--text))] leading-relaxed">
          {t('homePage:crudIntro')}
        </p>
        <ul className="mt-3 list-disc pl-6 space-y-1.5 text-[rgb(var(--text-secondary))]">
          <li>{t('common:tools.owners')}</li>
          <li>{t('common:tools.patients')}</li>
          <li>{t('common:tools.workspaceMembers')}</li>
          <li>{t('common:tools.appointments')}</li>
          <li>{t('common:tools.clinicalRecords')}</li>
          <li>{t('common:tools.inventory')}</li>
          <li>{t('common:tools.inventoryBatch')}</li>
          <li>{t('common:tools.services')}</li>
        </ul>
        <p className="mt-4 text-sm text-[rgb(var(--text-secondary))]">
          {t('homePage:crudNote')}
        </p>
      </div>

      <hr className="border-t border-[rgb(var(--border))]" />

      {/* Otras secciones importantes */}
      <div>
        <Link
          to="billing"
          className="text-2xl font-semibold text-[rgb(var(--text-title))] hover:text-[rgb(var(--primary))] transition-colors"
        >
          {t('common:tools.billing')}
        </Link>
        <p className="mt-3 text-[rgb(var(--text))] leading-relaxed">
          {t('homePage:billingDescription')}
        </p>
      </div>

      <hr className="border-t border-[rgb(var(--border))]" />

      <div>
        <Link
          to="reports"
          className="text-2xl font-semibold text-[rgb(var(--text-title))] hover:text-[rgb(var(--primary))] transition-colors"
        >
          {t('common:tools.reports')}
        </Link>
        <p className="mt-3 text-[rgb(var(--text))] leading-relaxed">
          {t('homePage:reportsDescription')}
        </p>
      </div>

      <hr className="border-t border-[rgb(var(--border))]" />

      <div>
        <Link
          to="audit"
          className="text-2xl font-semibold text-[rgb(var(--text-title))] hover:text-[rgb(var(--primary))] transition-colors"
        >
          {t('common:tools.audit')}
        </Link>
        <p className="mt-3 text-[rgb(var(--text))] leading-relaxed">
          {t('homePage:auditDescription')}
        </p>
      </div>

      <div className="pt-6">
        <p className="text-center text-sm text-[rgb(var(--text-secondary))]">
          {t('homePage:getStarted')}
        </p>
      </div>
    </div>
  );
};

export default Home;