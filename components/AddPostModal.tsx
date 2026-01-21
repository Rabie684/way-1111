import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface AddPostModalProps {
    channelId: string;
    onClose: () => void;
    largeFileInfo: { name: string; size: number };
}

const AddPostModal: React.FC<AddPostModalProps> = ({ channelId, onClose, largeFileInfo }) => {
    const { s, addPostFromLink } = useApp();
    const [title, setTitle] = useState(largeFileInfo.name);
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && url.trim()) {
            try {
                // Basic URL validation
                new URL(url);
                addPostFromLink(channelId, title, url);
                onClose();
            } catch (_) {
                alert('الرجاء إدخال رابط صحيح.');
            }
        }
    };

    const formattedSize = (largeFileInfo.size / 1024 / 1024).toFixed(1);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold">إضافة منشور كرابط</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 border-l-4 rtl:border-l-0 rtl:border-r-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 rounded-md">
                            <p className="font-bold">الملف كبير جدًا</p>
                            <p className="text-sm">"{largeFileInfo.name}" ({formattedSize} MB) يتجاوز حد 30 ميغابايت للرفع المباشر.</p>
                            <p className="text-sm mt-1">الرجاء رفع الملف إلى خدمة سحابية (مثل Google Drive) ولصق رابط المشاركة العام أدناه.</p>
                        </div>
                        <div>
                            <label htmlFor="postTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                عنوان المنشور
                            </label>
                            <input
                                id="postTitle"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="postUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                رابط الملف
                            </label>
                            <input
                                id="postUrl"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                                placeholder="https://..."
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 ltr:text-left"
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-2 rtl:space-x-reverse">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:text-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500"
                        >
                            {s.cancel}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                        >
                            {s.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPostModal;