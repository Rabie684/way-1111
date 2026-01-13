
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getLang } from '../constants';
import { UserRole } from '../types';
import { LogOutIcon } from './icons/IconComponents';

interface ProfileSettingsModalProps {
    onClose: () => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ onClose }) => {
    const { user, updateUser, language, logout } = useApp();
    const s = getLang(language);

    const [name, setName] = useState(user?.name || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [preview, setPreview] = useState<string | null>(user?.avatar || null);
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
                // In a real app, you'd upload this file and get a URL
                // Here we just use the data URL for preview
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatePayload: { name: string, avatar: string, phoneNumber?: string } = {
            name,
            avatar: preview || avatar,
        };

        if (user?.role === UserRole.Student) {
            updatePayload.phoneNumber = phoneNumber;
        }
        
        updateUser(updatePayload);
        onClose();
    };

    const handleLogout = () => {
        logout();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold">{s.profileSettings}</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div className="flex flex-col items-center space-y-2">
                            <img src={preview || 'https://picsum.photos/200'} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover"/>
                            <input type="file" id="avatar-upload" className="hidden" onChange={handleFileChange} accept="image/*"/>
                            <label htmlFor="avatar-upload" className="cursor-pointer text-sm font-medium text-primary-600 hover:text-primary-500">
                                Change picture
                            </label>
                        </div>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{s.fullName}</label>
                            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        {user?.role === UserRole.Student && (
                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{s.phoneNumber}</label>
                                <input
                                    id="phoneNumber"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="+213..."
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{s.phoneNumberDescription}</p>
                            </div>
                        )}
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
                        <button type="button" onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-red-600 bg-transparent rounded-md hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50 flex items-center gap-2">
                            <LogOutIcon className="w-4 h-4" />
                            {s.logout}
                        </button>
                        <div className="flex space-x-2 rtl:space-x-reverse">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:text-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500">
                                {s.cancel}
                            </button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700">
                                {s.save}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettingsModal;