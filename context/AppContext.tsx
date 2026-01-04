
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, Channel, DirectMessage, ChannelMessage } from '../types';
import { MOCK_PROFESSOR, MOCK_STUDENT, MOCK_CHANNELS, MOCK_CHANNEL_MESSAGES, MOCK_DMS } from '../constants';

type Theme = 'light' | 'dark';
type Language = 'ar' | 'en' | 'fr';

interface AppContextType {
    user: User | null;
    theme: Theme;
    language: Language;
    channels: Channel[];
    channelMessages: ChannelMessage[];
    directMessages: DirectMessage[];
    login: (email: string, role: UserRole) => void;
    logout: () => void;
    toggleTheme: () => void;
    setLanguage: (lang: Language) => void;
    createChannel: (channel: Omit<Channel, 'id' | 'professorId' | 'subscribers' | 'posts'>) => void;
    subscribeToChannel: (channelId: string) => void;
    sendMessage: (channelId: string, text: string) => void;
    sendDirectMessage: (receiverId: string, text: string) => void;
    updateUser: (updatedUser: Partial<User>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [theme, setTheme] = useState<Theme>('light');
    const [language, setLanguage] = useState<Language>('en');
    const [channels, setChannels] = useState<Channel[]>(MOCK_CHANNELS);
    const [channelMessages, setChannelMessages] = useState<ChannelMessage[]>(MOCK_CHANNEL_MESSAGES);
    const [directMessages, setDirectMessages] = useState<DirectMessage[]>(MOCK_DMS);

    const login = (email: string, role: UserRole) => {
        // Mock login
        if (role === UserRole.Professor) {
            setUser(MOCK_PROFESSOR);
        } else {
            setUser(MOCK_STUDENT);
        }
    };

    const logout = () => {
        setUser(null);
    };

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const createChannel = (channelData: Omit<Channel, 'id' | 'professorId' | 'subscribers' | 'posts'>) => {
        if (user && user.role === UserRole.Professor) {
            const newChannel: Channel = {
                ...channelData,
                id: `ch-${Date.now()}`,
                professorId: user.id,
                subscribers: 0,
                posts: [],
            };
            setChannels(prev => [...prev, newChannel]);
        }
    };
    
    const subscribeToChannel = (channelId: string) => {
        if(user && user.role === UserRole.Student) {
            setUser(currentUser => {
                if (!currentUser) return null;
                return {
                    ...currentUser,
                    subscribedChannels: [...currentUser.subscribedChannels, channelId]
                }
            });
            setChannels(currentChannels => currentChannels.map(ch => 
                ch.id === channelId ? {...ch, subscribers: ch.subscribers + 1} : ch
            ));
        }
    }
    
    const sendMessage = (channelId: string, text: string) => {
        if (user) {
             const newMessage: ChannelMessage = {
                id: `msg-ch-${Date.now()}`,
                senderId: user.id,
                channelId: channelId,
                text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setChannelMessages(prev => [...prev, newMessage]);
        }
    }
    
     const sendDirectMessage = (receiverId: string, text: string) => {
        if (user) {
            const newMessage: DirectMessage = {
                id: `msg-dm-${Date.now()}`,
                senderId: user.id,
                receiverId,
                text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setDirectMessages(prev => [...prev, newMessage]);
        }
    };
    
    const updateUser = (updatedUser: Partial<User>) => {
        if (user) {
            setUser(prevUser => prevUser ? { ...prevUser, ...updatedUser } : null);
        }
    }

    return (
        <AppContext.Provider value={{ 
            user, 
            theme, 
            language, 
            channels,
            channelMessages,
            directMessages,
            login, 
            logout, 
            toggleTheme, 
            setLanguage, 
            createChannel,
            subscribeToChannel,
            sendMessage,
            sendDirectMessage,
            updateUser
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};