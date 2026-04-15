// src/components/table/ModalForCell
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  size = 'md' 
}: ModalProps) => {  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className={`bg-[rgb(var(--surface))] rounded-2xl shadow-2xl 
                     ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden
                     animate-in fade-in zoom-in duration-200`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(
            <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border))]">
              {title && (
                <h2 className="text-xl font-semibold text-[rgb(var(--text))]">
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[rgb(var(--border))] transition-colors"
                aria-label="Cerrar modal"
              >
                <X size={20} className="text-[rgb(var(--text))]" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="overflow-auto max-h-[calc(90vh-80px)]">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;