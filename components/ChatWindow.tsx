

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getLang, MOCK_ALL_USERS } from '../constants';
import { SendIcon } from './icons/IconComponents';
// FIX: Import Gender enum
import { UserRole, User, Gender } from '../types';

interface ChatWindowProps {
    channelId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ channelId }) => {
    const { user, channelMessages, sendMessage, language } = useApp();
    const s = getLang(language);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [channelMessages, channelId]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            sendMessage(channelId, newMessage.trim());
            setNewMessage('');
        }
    };
    
    if(!user) return null;

    const messages = channelMessages.filter(m => m.channelId === channelId);

    const getUserById = (id: string): User => {
        const foundUser = MOCK_ALL_USERS.find(u => u.id === id);
        if (foundUser) {
            return foundUser;
        }
        // This is a fallback, but with our updated constants, it shouldn't be hit for mock data.
        return { 
            id: id, 
            name: `Unknown User`, 
            avatar: `https://picsum.photos/seed/${id}/200`, 
            role: UserRole.Student,
            // FIX: Added missing gender property to satisfy the User type.
            gender: Gender.Male, 
            college: '', 
            university: '', 
            email: '', 
            subscribedSections: [] 
        };
    }

    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => {
                    const sender = getUserById(msg.senderId);
                    const isCurrentUser = msg.senderId === user.id;
                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            {!isCurrentUser && <img src={sender.avatar} alt={sender.name} className="w-8 h-8 rounded-full object-cover"/>}
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
        </div>
    );
};

export default ChatWindow;