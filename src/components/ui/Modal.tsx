import React from 'react';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal : React.FC<ModalProps> = ({ isOpen, onClose, children }) =>  {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-md p-6 bg-white rounded-lg shadow-xl m-4">
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;