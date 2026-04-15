// src/pages/About.tsx
import PageWrapper from '../components/layout/PageWrapper';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import { useLanguage } from '../hooks/useLanguage';

const About = () => {
  const { t } = useLanguage();

  return (
    <PageWrapper className="pb-5 pt-8">
      <div className="absolute top-20 right-4">
        <LanguageSwitcher />
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-emerald-600 mb-6">
          {t('about:hero_title')}
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          {t('about:hero_subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-10 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-2xl font-bold text-emerald-600 mb-4">
            {t('about:problem_title')}
          </h3>
          <p className="text-gray-600">
            {t('about:problem_description')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
          <div className="text-6xl mb-4">💚</div>
          <h3 className="text-2xl font-bold text-emerald-600 mb-4">
            {t('about:mission_title')}
          </h3>
          <p className="text-gray-600">
            {t('about:mission_description')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
          <div className="text-6xl mb-4">💼</div>
          <h3 className="text-2xl font-bold text-emerald-600 mb-4">
            {t('about:offer_title')}
          </h3>
          <p className="text-gray-600">
            {t('about:offer_description')}
          </p>
        </div>
      </div>

      <div className="mt-16 text-center">
        <p className="text-lg text-gray-700 italic max-w-4xl mx-auto">
          {t('about:closing_message')}
        </p>
      </div>
    </PageWrapper>
  );
};

export default About;