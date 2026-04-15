// src/pages/Services.tsx
import PageWrapper from '../components/layout/PageWrapper';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { useLanguage } from '../hooks/useLanguage';

const Services = () => {
  const { t } = useLanguage();

  const plans = [
    {
      name: 'Free',
      title: t('servicesLanding:plan_free_title'),
      description: t('servicesLanding:plan_free_description'),
      features: [
        t('servicesLanding:plan_free_feature1'),
        t('servicesLanding:plan_free_feature2'),
        t('servicesLanding:plan_free_feature3'),
        t('servicesLanding:plan_free_feature4'),
      ],
      badge: t('servicesLanding:plan_free_badge'),
    },
    {
      name: 'Basic',
      title: t('servicesLanding:plan_basic_title'),
      description: t('servicesLanding:plan_basic_description'),
      features: [
        t('servicesLanding:plan_basic_feature1'),
        t('servicesLanding:plan_basic_feature2'),
        t('servicesLanding:plan_basic_feature3'),
        t('servicesLanding:plan_basic_feature4'),
      ],
      badge: t('servicesLanding:plan_basic_badge'),
    },
    {
      name: 'Pro',
      title: t('servicesLanding:plan_pro_title'),
      description: t('servicesLanding:plan_pro_description'),
      features: [
        t('servicesLanding:plan_pro_feature1'),
        t('servicesLanding:plan_pro_feature2'),
        t('servicesLanding:plan_pro_feature3'),
        t('servicesLanding:plan_pro_feature4'),
      ],
      badge: t('servicesLanding:plan_pro_badge'),
    },
    {
      name: 'Enterprise',
      title: t('servicesLanding:plan_enterprise_title'),
      description: t('servicesLanding:plan_enterprise_description'),
      features: [
        t('servicesLanding:plan_enterprise_feature1'),
        t('servicesLanding:plan_enterprise_feature2'),
        t('servicesLanding:plan_enterprise_feature3'),
        t('servicesLanding:plan_enterprise_feature4'),
      ],
      badge: t('servicesLanding:plan_enterprise_badge'),
    },
  ];

  return (
    <PageWrapper className="pb-5 py-8">
      <div className="absolute top-20 right-4">
        <LanguageSwitcher />
      </div>

      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-emerald-600 mb-6">
          {t('servicesLanding:hero_title')}
        </h1>
        <p className="text-xl text-gray-700">
          {t('servicesLanding:hero_subtitle')}
        </p>
      </div>

      {/* Grid unificado con auto-fill */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-8 max-w-7xl mx-auto justify-center">
        {plans.map((plan, i) => (
          <div 
            key={i} 
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 p-8 border border-emerald-100 flex flex-col"
          >
            <h3 className="text-2xl font-bold text-emerald-600 mb-3">{plan.title}</h3>
            <p className="text-gray-600 mb-6">{plan.description}</p>
            <ul className="text-gray-600 mb-6 space-y-3 flex-grow">
              {plan.features.map((feature, j) => (
                <li key={j} className="flex items-start">
                  <span className="text-emerald-600 mr-2 mt-1">•</span>
                  {feature}
                </li>
              ))}
            </ul>
            <div>
              <span className="inline-block px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                {plan.badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-lg text-gray-700 max-w-4xl mx-auto">
          {t('servicesLanding:closing_message')}
        </p>
      </div>
    </PageWrapper>
  );
};

export default Services;