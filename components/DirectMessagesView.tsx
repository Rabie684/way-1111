
import React from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_ALL_USERS } from '../constants';
import { UserIcon } from './icons/IconComponents';

const DirectMessagesView: React.FC = () => {
    const { s, user } = useApp();
    const [selectedUser, setSelectedUser] = React.useState<typeof MOCK_ALL_USERS[0] | null>(null);

    // Filter out the current user from the list
    const otherUsers = MOCK_ALL_USERS.filter(u => u.id !== user?.id);

    return (
        <div className="flex h-full bg-white dark:bg-gray-900">
            {/* User List Sidebar */}
            <div className="w-full md:w-1/3 border-e border-gray-200 dark:border-gray-700 h-full flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="font-bold text-lg">{s.directMessages}</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {otherUsers.map(u => (
                        <button 
                            key={u.id}
                            onClick={() => setSelectedUser(u)}
                            className={`w-full text-start flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedUser?.id === u.id ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}
                        >
                            <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <p className="font-semibold">{u.name}</p>
                                <p className="text-xs text-gray-500">{u.role}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 hidden md:flex items-center justify-center bg-gray-50 dark:bg-gray-800/50">
                {selectedUser ? (
                    <div className="text-center text-gray-500">
                        {/* Placeholder for actual chat window */}
                        <h3 className="text-xl font-semibold">Chat with {selectedUser.name}</h3>
                        <p>Messaging interface is under construction.</p>
                    </div>
                ) : (
                     <div className="text-center text-gray-500 p-8">
                        <UserIcon className="w-16 h-16 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold">Select a conversation</h3>
                        <p>Choose a person from the list to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DirectMessagesView;
