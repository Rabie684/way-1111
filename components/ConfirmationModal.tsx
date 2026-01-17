import React from 'react';
import { useApp } from '../context/AppContext';

interface ConfirmationModalProps {
    title: string;
    message: string;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ title, message, onClose, onConfirm }) => {
    const { s } = useApp();
    
    // Invert button colors for destructive actions like blocking
    const confirmButtonClass = "px-6 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700";
    const cancelButtonClass = "px-6 py-2 text-sm font-medium text-gray-700 bg-white dark:text-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500";


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="p-6 text-center">
                    <h2 className="text-xl font-bold mb-2">{title}</h2>
                    <p className="text-gray-600 dark:text-gray-300">{message}</p>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-center space-x-4 rtl:space-x-reverse">
                    <button onClick={onClose} className={cancelButtonClass}>
                        {s.cancel}
                    </button>
                    <button onClick={onConfirm} className={confirmButtonClass}>
                        {s.confirm}
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ConfirmationModal;
