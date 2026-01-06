import React from 'react';
import { MdClose } from 'react-icons/md';

const DeleteModal = ({ isOpen, onClose, onConfirm, title = "Confirm Deletion", message = "Are you sure you want to delete this row?" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm transform transition-all animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">
                        {title}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MdClose size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-600 text-sm">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors shadow-sm"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
