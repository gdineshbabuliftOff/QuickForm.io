// components/modals/RedirectModal.tsx
import React, { FC } from 'react';

interface RedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
}

const RedirectModal: FC<RedirectModalProps> = ({ isOpen, onClose, title, message, buttonText, onButtonClick }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-white/10 text-center">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <p className="text-gray-400 mb-6">{message}</p>
        <button
          onClick={onButtonClick}
          className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-500 transition-colors duration-200"
        >
          {buttonText}
        </button>
        {/* Optionally add a close button if you want the user to be able to dismiss without action */}
        {/* <button onClick={onClose} className="mt-4 text-gray-400 hover:text-white">Close</button> */}
      </div>
    </div>
  );
};

export default RedirectModal;
