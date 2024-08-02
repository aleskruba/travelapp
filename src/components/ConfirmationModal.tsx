import React from 'react';

interface ConfirmationModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ show, onClose, onConfirm, message }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white text-black p-6 rounded shadow-lg max-w-md mx-auto ">
        <h2 className="text-xl mb-4">{message}</h2>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Zrušit
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Potvrďit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
