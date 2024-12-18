import React from 'react';
import Button from './customButton/Button';
import { authConstants } from "../constants/constantsAuth";
import { useLanguageContext } from '../context/languageContext';

interface ConfirmationModalProps {
  show: boolean;
  onConfirm: () => void;
  message: string;
}

const CookiesInfoModal: React.FC<ConfirmationModalProps> = ({ show,  onConfirm, message }) => {
  const { language} = useLanguageContext();
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white text-black p-6 rounded shadow-lg max-w-md mx-auto ">
        <h2 className="text-xl text-center mb-4">{message}</h2>
        <div className="flex justify-center space-x-4">

        <Button
          onClick={onConfirm}
          color="red" // Set the color to red
          className="px-2 py-2 w-28 text-white rounded hover:bg-red-700" // Add hover styles and text color in className
          type="button" // Use type="button" to avoid form submission
        >
                  {authConstants.confirm[language]}
        </Button>

        </div>
      </div>
    </div>
  );
};

export default CookiesInfoModal;
