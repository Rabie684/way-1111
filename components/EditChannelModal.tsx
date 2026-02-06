import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getLang } from '../constants';
import { Channel } from '../types';

interface EditChannelModalProps {
    onClose: () => void;
    channel: Channel;
}

const EditChannelModal: React.FC<EditChannelModalProps> = ({ onClose, channel }) => {
    const { updateChannel, s } = useApp();
    const [name, setName] = useState(channel.name);
    const [specialization, setSpecialization] = useState(channel.specialization);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(name && specialization) {
            updateChannel(channel.id, { name, specialization });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold">{s.editChannel}</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="channelName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{s.channelName}</label>
                            <input id="channelName" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div>
                            <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{s.specialization}</label>
                            <input id="specialization" type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-2 rtl:space-x-reverse">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:text-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500">
                            {s.cancel}
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700">
                            {s.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditChannelModal;
