
import React from 'react';
import { useApp } from '../context/AppContext';
import { getLang } from '../constants';
import { Channel } from '../types';

interface SubscriptionModalProps {
    channel: Channel;
    onClose: () => void;
    onConfirm: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ channel, onClose, onConfirm }) => {
    const { subscribeToChannel, language } = useApp();
    const s = getLang(language);

    const handleConfirm = () => {
        subscribeToChannel(channel.id);
        onConfirm();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="p-6 text-center">
                    <h2 className="text-xl font-bold mb-2">{s.subscriptionTitle}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-1">{`"${channel.name}"`}</p>
                    <p className="text-gray-600 dark:text-gray-300">{s.subscriptionMessage}</p>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-center space-x-4 rtl:space-x-reverse">
                    <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white dark:text-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500">
                        {s.cancel}
                    </button>
                    <button onClick={handleConfirm} className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700">
                        {s.confirm}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModal;
