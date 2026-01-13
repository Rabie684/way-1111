import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole, Channel, ChannelMessage, Notification, JarvisMessage, DirectMessage, Post, PostType, Section } from '../types';
import { 
    getLang, 
    STRINGS, 
    MOCK_PROFESSOR, 
    MOCK_STUDENT,
    MOCK_CHANNELS,
    MOCK_SECTIONS,
    MOCK_CHANNEL_MESSAGES,
    MOCK_DIRECT_MESSAGES,
    MOCK_NOTIFICATIONS,
    MOCK_ALL_USERS
} from '../constants';
import { askJarvis } from '../services/geminiService';


type Theme = 'light' | 'dark';
type Language = 'ar' | 'en' | 'fr';

interface LoginDetails {
    email: string;
    password?: string;
    role?: UserRole;
    name?: string;
    university?: string;
    college?: string;
    isDemo?: boolean;
}

interface AppContextType {
    user: User | null;
    theme: Theme;
    language: Language;
    s: typeof STRINGS.en;
    channels: Channel[];
    sections: Section[];
    channelMessages: ChannelMessage[];
    directMessages: DirectMessage[];
    notifications: Notification[];
    jarvisHistory: JarvisMessage[];
    login: (details: LoginDetails) => Promise<void>;
    register: (details: LoginDetails) => Promise<void>;
    logout: () => Promise<void>;
    toggleTheme: () => void;
    setLanguage: (lang: Language) => void;
    createChannel: (channel: Omit<Channel, 'id' | 'professorId' | 'posts' | 'subscribers'>) => Promise<void>;
    subscribeToSection: (sectionId: string) => Promise<void>;
    sendMessage: (channelId: string, text: string) => Promise<void>;
    sendDirectMessage: (receiverId: string, text: string) => Promise<void>;
    addPostToChannel: (channelId: string, file: File) => Promise<void>;
    sendJarvisMessage: (text: string) => Promise<void>;
    updateUser: (updatedUser: Partial<User>) => Promise<void>;
    markNotificationsAsRead: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [theme, setTheme] = useState<Theme>('light');
    const [language, setLanguage] = useState<Language>('ar');
    const [channels, setChannels] = useState<Channel[]>(MOCK_CHANNELS);
    const [sections, setSections] = useState<Section[]>(MOCK_SECTIONS);
    const [channelMessages, setChannelMessages] = useState<ChannelMessage[]>(MOCK_CHANNEL_MESSAGES);
    const [directMessages, setDirectMessages] = useState<DirectMessage[]>(MOCK_DIRECT_MESSAGES);
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [jarvisHistory, setJarvisHistory] = useState<JarvisMessage[]>([]);
    
    const s = getLang(language);
    
    const login = async (details: LoginDetails) => {
        const { email, isDemo, role } = details;
        if (isDemo) {
            setUser(role === UserRole.Professor ? MOCK_PROFESSOR : MOCK_STUDENT);
            return;
        }

        // Mock login by finding user in our mock data
        const foundUser = MOCK_ALL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (foundUser) {
            setUser(foundUser);
        } else {
            console.error('Login failed: User not found');
            alert('Login failed: User not found. Please use a demo account or register.');
        }
    };
    
    const register = async (details: LoginDetails) => {
        const { email, name, role, university, college } = details;
        const newUser: User = {
            id: `user-${Date.now()}`,
            name: name!,
            email: email!,
            role: role!,
            university: university || '',
            college: college || '',
            avatar: `https://picsum.photos/seed/${Date.now()}/200`,
            subscribedSections: [],
        };
        // Add to our runtime mock data and log in
        MOCK_ALL_USERS.push(newUser);
        setUser(newUser);
    }

    const logout = async () => {
        setUser(null);
    };

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const createChannel = async (channelData: Omit<Channel, 'id' | 'professorId' | 'posts' | 'subscribers'>) => {
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
    
    const subscribeToSection = async (sectionId: string) => {
        if (user && user.role === UserRole.Student && !user.subscribedSections.includes(sectionId)) {
             setUser(prevUser => {
                if (!prevUser) return null;
                return {
                    ...prevUser,
                    subscribedSections: [...prevUser.subscribedSections, sectionId],
                };
            });

            const section = sections.find(s => s.id === sectionId);
            if (section) {
                const channel = channels.find(c => c.id === section.channelId);
                if (channel) {
                    const notifText = s.subscriptionSuccessNotification
                        .replace('{sectionName}', section.name)
                        .replace('{channelName}', channel.name);
                    
                    const newNotification: Notification = {
                        id: `notif-${Date.now()}`,
                        text: notifText,
                        timestamp: 'Just now',
                        read: false,
                    };
                    setNotifications(prev => [newNotification, ...prev]);
                }
            }
        }
    };
    
    const sendMessage = async (channelId: string, text: string) => {
        if (user) {
            const newMessage: ChannelMessage = {
                id: `msg-ch-${Date.now()}`,
                senderId: user.id,
                channelId: channelId,
                text: text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setChannelMessages(prev => [...prev, newMessage]);
        }
    }

    const sendDirectMessage = async (receiverId: string, text: string) => {
        if (user) {
            const newMessage: DirectMessage = {
                id: `dm-${Date.now()}`,
                senderId: user.id,
                receiverId: receiverId,
                text: text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setDirectMessages(prev => [...prev, newMessage]);
        }
    };

    const addPostToChannel = async (channelId: string, file: File) => {
       if (!user) return;
        
        const newPost: Post = {
            id: `post-${Date.now()}`,
            type: file.type.startsWith('image/') ? PostType.Image : (file.type.startsWith('video/') ? PostType.Video : PostType.PDF),
            title: file.name,
            url: URL.createObjectURL(file), // Use blob URL for local preview
            createdAt: new Date().toISOString().split('T')[0],
        };
        
        setChannels(prevChannels => prevChannels.map(channel => {
            if (channel.id === channelId) {
                return { ...channel, posts: [...channel.posts, newPost] };
            }
            return channel;
        }));
    };
    
    const sendJarvisMessage = async (text: string) => {
        const userMessage: JarvisMessage = { id: `jarvis-${Date.now()}`, sender: 'user', text };
        setJarvisHistory(prev => [...prev, userMessage]);

        const responseText = await askJarvis(text);

        // FIX: Corrected object literal syntax. Missing colon after 'id'.
        const jarvisMessage: JarvisMessage = { id: `jarvis-${Date.now() + 1}`, sender: 'jarvis', text: responseText };
        setJarvisHistory(prev => [...prev, jarvisMessage]);
    }
    
    const updateUser = async (updatedUser: Partial<User>) => {
        if (user) {
            const newUserData = { ...user, ...updatedUser };
            setUser(newUserData);
            const userIndex = MOCK_ALL_USERS.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                MOCK_ALL_USERS[userIndex] = newUserData;
            }
        }
    }

    const markNotificationsAsRead = async () => {
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
            register,
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