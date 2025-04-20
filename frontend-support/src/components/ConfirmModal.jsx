// src/components/ConfirmModal.js
import React from 'react';

const ConfirmModal = ({ show, onClose, onConfirm, title, message }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-700">{message}</p>
        </div>
        
        <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;