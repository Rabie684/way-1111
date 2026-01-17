
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_ALL_USERS } from '../constants';
import { UserIcon, SendIcon, ArrowLeftIcon } from './icons/IconComponents';
import { User } from '../types';

interface DirectMessagesViewProps {
    initialUser?: User | null;
    onViewLoad?: () => void;
}

const DirectMessagesView: React.FC<DirectMessagesViewProps> = ({ initialUser, onViewLoad }) => {
    const { s, user, directMessages, sendDirectMessage } = useApp();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (selectedUser) {
            scrollToBottom();
        }
    }, [directMessages, selectedUser]);
    
    useEffect(() => {
        if (initialUser && onViewLoad) {
            setSelectedUser(initialUser);
            onViewLoad();
        }
    }, [initialUser, onViewLoad]);
    
    if (!user) return null;

    const otherUsers = MOCK_ALL_USERS.filter(u => u.id !== user?.id);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && selectedUser) {
            sendDirectMessage(selectedUser.id, newMessage.trim());
            setNewMessage('');
        }
    };
    
    const conversationMessages = selectedUser ? directMessages.filter(
        msg => (msg.senderId === user.id && msg.receiverId === selectedUser.id) ||
               (msg.senderId === selectedUser.id && msg.receiverId === user.id)
    ) : [];

    return (
        <div className="flex h-full bg-white dark:bg-gray-900">
            {/* User List Sidebar */}
            <div className={`w-full md:w-1/3 border-e border-gray-200 dark:border-gray-700 h-full flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
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
            <div className={`flex-1 flex-col ${!selectedUser ? 'hidden' : 'flex'} md:flex`}>
                {selectedUser ? (
                    <>
                        <header className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <button className="md:hidden p-2 -ms-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setSelectedUser(null)}>
                                <ArrowLeftIcon className="w-5 h-5" />
                            </button>
                            <img src={selectedUser.avatar} alt={selectedUser.name} className="w-10 h-10 rounded-full object-cover"/>
                            <h3 className="font-semibold">{selectedUser.name}</h3>
                        </header>
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-900">
                            {conversationMessages.map((msg) => {
                                const isCurrentUser = msg.senderId === user.id;
                                return (
                                    <div key={msg.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                        {!isCurrentUser && <img src={selectedUser.avatar} alt={selectedUser.name} className="w-8 h-8 rounded-full object-cover"/>}
                                        <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${isCurrentUser ? 'bg-primary-500 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 rounded-bl-none'}`}>
                                            <p className="text-sm">{msg.text}</p>
                                            <p className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-200' : 'text-gray-400'}`}>{msg.timestamp}</p>
                                        </div>
                                        {isCurrentUser && <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover"/>}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            <form onSubmit={handleSendMessage} className="flex items-center">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={s.typeMessage}
                                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <button type="submit" className="ms-3 p-3 rounded-full bg-primary-500 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800">
                                    <SendIcon className="w-5 h-5"/>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                     <div className="hidden md:flex flex-col items-center justify-center h-full text-center text-gray-500 p-8 bg-gray-50 dark:bg-gray-800/50">
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