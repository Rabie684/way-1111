
import React from 'react';
import ChatWindow from './ChatWindow';
import { useApp } from '../context/AppContext';
import { MOCK_PROFESSOR, MOCK_STUDENT } from '../constants';
import { UserRole } from '../types';

const DirectMessagesView: React.FC = () => {
    const { user } = useApp();

    if (!user) return null;

    // For this mock, the other user is always the opposite role's mock user.
    const otherUser = user.role === UserRole.Professor ? MOCK_STUDENT : MOCK_PROFESSOR;

    return (
        <div className="flex flex-col md:flex-row h-full">
            <aside className="w-full md:w-1/3 bg-white dark:bg-gray-800 border-e-0 md:border-e border-b md:border-b-0 border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold">
                    Conversations
                </div>
                <nav className="p-2">
                    {/* In a real app, this would be a list of conversations */}
                    <a href="#" className="flex items-center gap-3 p-2 rounded-md bg-primary-100 dark:bg-primary-900/50">
                        <img src={otherUser.avatar} alt={otherUser.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                            <p className="font-semibold">{otherUser.name}</p>
                            <p className="text-xs text-gray-500">Online</p>
                        </div>
                    </a>
                </nav>
            </aside>
            <main className="w-full md:w-2/3 flex-1 md:flex-auto">
                <ChatWindow type="dm" conversationId={otherUser.id} />
            </main>
        </div>
    );
};

export default DirectMessagesView;