
import React from 'react';
import { useApp } from '../context/AppContext';
import { DownloadIcon, XIcon } from './icons/IconComponents';

interface InstallPWAModalProps {
    installPrompt: Event;
    onClose: () => void;
}

const InstallPWAModal: React.FC<InstallPWAModalProps> = ({ installPrompt, onClose }) => {
    const { s } = useApp();

    const handleInstallClick = async () => {
        if (!installPrompt) return;
        
        const promptEvent = installPrompt as any;
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-end sm:items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md animate-slide-up sm:animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{s.installApp}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label={s.close}>
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-300">{s.installAppDescription}</p>
                </div>
                 <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:text-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500"
                    >
                        {s.later}
                    </button>
                    <button
                        type="button"
                        onClick={handleInstallClick}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 flex items-center gap-2"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        {s.install}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPWAModal;