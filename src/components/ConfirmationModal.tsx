import React from 'react';
import Button from './customButton/Button';

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
        <Button
          onClick={onClose}
          color="gray" // Set the color to gray
          className="px-4 py-2 rounded hover:bg-gray-400" // Add hover styles in className
          type="button" // Use type="button" to avoid form submission
        >
          Zrušit
        </Button>

        <Button
          onClick={onConfirm}
          color="red" // Set the color to red
          className="px-4 py-2 text-white rounded hover:bg-red-700" // Add hover styles and text color in className
          type="button" // Use type="button" to avoid form submission
        >
          Potvrďit
        </Button>

        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
