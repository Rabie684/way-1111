
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, Channel, ChannelMessage, Notification, JarvisMessage } from '../types';
import { MOCK_PROFESSOR, MOCK_STUDENT, MOCK_CHANNELS, MOCK_CHANNEL_MESSAGES, MOCK_NOTIFICATIONS, getLang, STRINGS } from '../constants';
import { askJarvis } from '../services/geminiService';

type Theme = 'light' | 'dark';
type Language = 'ar' | 'en' | 'fr';

interface AppContextType {
    user: User | null;
    theme: Theme;
    language: Language;
    s: typeof STRINGS.en; // strings for the current language
    channels: Channel[];
    channelMessages: ChannelMessage[];
    notifications: Notification[];
    jarvisHistory: JarvisMessage[];
    login: (email: string, role: UserRole) => void;
    logout: () => void;
    toggleTheme: () => void;
    setLanguage: (lang: Language) => void;
    createChannel: (channel: Omit<Channel, 'id' | 'professorId' | 'subscribers' | 'posts'>) => void;
    subscribeToChannel: (channelId: string) => void;
    sendMessage: (channelId: string, text: string) => void;
    sendJarvisMessage: (text: string) => Promise<void>;
    updateUser: (updatedUser: Partial<User>) => void;
    markNotificationsAsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [theme, setTheme] = useState<Theme>('light');
    const [language, setLanguage] = useState<Language>('en');
    const [channels, setChannels] = useState<Channel[]>(MOCK_CHANNELS);
    const [channelMessages, setChannelMessages] = useState<ChannelMessage[]>(MOCK_CHANNEL_MESSAGES);
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [jarvisHistory, setJarvisHistory] = useState<JarvisMessage[]>([]);
    
    const s = getLang(language);

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
    
    const sendJarvisMessage = async (text: string) => {
        const userMessage: JarvisMessage = { id: `jarvis-${Date.now()}`, sender: 'user', text };
        setJarvisHistory(prev => [...prev, userMessage]);

        const responseText = await askJarvis(text);

        const jarvisMessage: JarvisMessage = { id: `jarvis-${Date.now() + 1}`, sender: 'jarvis', text: responseText };
        setJarvisHistory(prev => [...prev, jarvisMessage]);
    }
    
    const updateUser = (updatedUser: Partial<User>) => {
        if (user) {
            setUser(prevUser => prevUser ? { ...prevUser, ...updatedUser } : null);
        }
    }

    const markNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }

    return (
        <AppContext.Provider value={{ 
            user, 
            theme, 
            language, 
            s,
            channels,
            channelMessages,
            notifications,
            jarvisHistory,
            login, 
            logout, 
            toggleTheme, 
            setLanguage, 
            createChannel,
            subscribeToChannel,
            sendMessage,
            sendJarvisMessage,
            updateUser,
            markNotificationsAsRead
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