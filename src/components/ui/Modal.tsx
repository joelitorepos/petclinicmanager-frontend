// src/components/ui/Modal.tsx

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}: ModalProps) => {
  // Cerrar con Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Evita scroll de fondo
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

      {/* Contenido del modal */}
      <div
        className={`
          relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg 
          bg-[rgb(var(--surface))] sm:rounded-xl shadow-2xl flex flex-col
          animate-in fade-in zoom-in-95 duration-200
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fijo arriba */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border))] sticky top-0 bg-[rgb(var(--surface))] z-10 sm:rounded-t-xl">
          <h2 className="text-xl font-semibold text-[rgb(var(--text))]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[rgb(var(--border)/0.5)] transition-colors text-[rgb(var(--text))] cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body - Con Scroll Independiente */}
        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;