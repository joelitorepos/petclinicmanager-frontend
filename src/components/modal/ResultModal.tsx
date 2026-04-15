// src/components/modal/ResultModal.tsx
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { CheckCircle, XCircle } from 'lucide-react';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  isError: boolean;
}

const ResultModal = ({ isOpen, onClose, title, message, isError }: ResultModalProps) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        {isError ? (
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
        ) : (
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        )}
        <p className="mt-4 text-lg">{message}</p>
        <div className="mt-6">
          <Button onClick={onClose} variant={isError ? 'danger' : 'primary'}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ResultModal;
