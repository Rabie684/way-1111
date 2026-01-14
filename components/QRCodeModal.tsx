import React from 'react';
import { useApp } from '../context/AppContext';
import { QR_CODE_DATA_URL, APP_URL } from '../constants';
import { XIcon } from './icons/IconComponents';

interface QRCodeModalProps {
    onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ onClose }) => {
    const { s } = useApp();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{s.shareApp}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label={s.close}>
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 text-center">
                    <img src={QR_CODE_DATA_URL} alt="QR Code" className="mx-auto rounded-md border dark:border-gray-600" />
                    <p className="mt-4 text-gray-600 dark:text-gray-300">{s.scanToOpen}</p>
                    <div className="mt-4">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{s.appUrl}</label>
                        <input
                            type="text"
                            readOnly
                            value={APP_URL}
                            className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-center text-sm"
                            onFocus={e => e.target.select()}
                        />
                    </div>
                </div>
                 <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:text-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500"
                    >
                        {s.close}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRCodeModal;