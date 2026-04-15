import BASEURL from '../../hooks/BaseUrl';
import { useLanguage } from '../../hooks/useLanguage';

// src/components/login/GoogleLoginButton.tsx
const GoogleLoginButton = () => {
  const { t } = useLanguage();
  return (
    <a href={`${BASEURL}/api/users/auth/google`} >
      <button className="bg-white text-gray-700 px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition flex items-center gap-3 border border-gray-300 cursor-pointer">
        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
        {t('common:google_signin')}
      </button>
    </a>
  );
};

export default GoogleLoginButton;