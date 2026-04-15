// src/components/modal/ShowLoginModal.tsx
import GoogleLoginButton from "../login/GoogleLoginButton"
import { X } from "lucide-react"
import { useLanguage } from "../../hooks/useLanguage";

interface ShowLoginModalProps {
  setShowLoginModal: (show: boolean) => void; // Tipo de la función setter
}

const ShowLoginModal = ({ setShowLoginModal }: ShowLoginModalProps) => {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowLoginModal(false)}>
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-emerald-600">{t('common:google_modal_title')}</h3>
          <button onClick={() => setShowLoginModal(false)} className="text-gray-500 hover:text-gray-700">
            <X size={28} />
          </button>
        </div>
        <p className="text-gray-600 mb-8">
          {t('common:google_modal_subtitle')}
        </p>
        <div className="flex justify-center">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  )
}

export default ShowLoginModal