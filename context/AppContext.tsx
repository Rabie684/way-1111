
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, Channel, ChannelMessage, Notification, JarvisMessage, DirectMessage, Post, PostType, Section } from '../types';
import { MOCK_PROFESSOR, MOCK_STUDENT, MOCK_CHANNELS, MOCK_CHANNEL_MESSAGES, MOCK_NOTIFICATIONS, getLang, STRINGS, MOCK_DIRECT_MESSAGES, MOCK_SECTIONS } from '../constants';
import { askJarvis } from '../services/geminiService';

type Theme = 'light' | 'dark';
type Language = 'ar' | 'en' | 'fr';

interface AppContextType {
    user: User | null;
    theme: Theme;
    language: Language;
    s: typeof STRINGS.en; // strings for the current language
    channels: Channel[];
    sections: Section[];
    channelMessages: ChannelMessage[];
    directMessages: DirectMessage[];
    notifications: Notification[];
    jarvisHistory: JarvisMessage[];
    login: (email: string, role: UserRole) => void;
    logout: () => void;
    toggleTheme: () => void;
    setLanguage: (lang: Language) => void;
    createChannel: (channel: Omit<Channel, 'id' | 'professorId' | 'posts' | 'subscribers'>) => void;
    subscribeToSection: (sectionId: string) => void;
    sendMessage: (channelId: string, text: string) => void;
    sendDirectMessage: (receiverId: string, text: string) => void;
    addPostToChannel: (channelId: string, file: File) => void;
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
    const [sections, setSections] = useState<Section[]>(MOCK_SECTIONS);
    const [channelMessages, setChannelMessages] = useState<ChannelMessage[]>(MOCK_CHANNEL_MESSAGES);
    const [directMessages, setDirectMessages] = useState<DirectMessage[]>(MOCK_DIRECT_MESSAGES);
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

    const createChannel = (channelData: Omit<Channel, 'id' | 'professorId' | 'posts' | 'subscribers'>) => {
        if (user && user.role === UserRole.Professor) {
            const newChannel: Channel = {
                ...channelData,
                id: `ch-${Date.now()}`,
                professorId: user.id,
                posts: [],
                subscribers: 0,
            };
            setChannels(prev => [...prev, newChannel]);
        }
    };
    
    const subscribeToSection = (sectionId: string) => {
        if(user && user.role === UserRole.Student) {
            setUser(currentUser => {
                if (!currentUser) return null;
                return {
                    ...currentUser,
                    subscribedSections: [...currentUser.subscribedSections, sectionId]
                }
            });
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
                id: `dm-${Date.now()}`,
                senderId: user.id,
                receiverId,
                text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setDirectMessages(prev => [...prev, newMessage]);
        }
    };

    const addPostToChannel = (channelId: string, file: File) => {
        setChannels(prevChannels => {
            return prevChannels.map(channel => {
                if (channel.id === channelId) {
                    const newPost: Post = {
                        id: `p-${Date.now()}`,
                        type: file.type.startsWith('image/') ? PostType.Image : (file.type.startsWith('video/') ? PostType.Video : PostType.PDF),
                        title: file.name,
                        url: URL.createObjectURL(file),
                        createdAt: new Date().toISOString().split('T')[0],
                    };
                    return {
                        ...channel,
                        posts: [newPost, ...channel.posts],
                    };
                }
                return channel;
            });
        });
    };
    
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
            sections,
            channelMessages,
            directMessages,
            notifications,
            jarvisHistory,
            login, 
            logout, 
            toggleTheme, 
            setLanguage, 
            createChannel,
            subscribeToSection,
            sendMessage,
            sendDirectMessage,
            addPostToChannel,
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