import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole, Channel, ChannelMessage, Notification, JarvisMessage, DirectMessage, Post, PostType, Section, Gender } from '../types';
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
    gender?: Gender;
    university?: string;
    college?: string;
    isDemo?: boolean;
}

const OFFLINE_CACHE_NAME = 'offline-files-cache-v1';

interface AppContextType {
    user: User | null;
    allUsers: User[];
    theme: Theme;
    language: Language;
    s: typeof STRINGS.en;
    channels: Channel[];
    sections: Section[];
    channelMessages: ChannelMessage[];
    directMessages: DirectMessage[];
    notifications: Notification[];
    jarvisHistory: JarvisMessage[];
    offlinePostIds: Set<string>;
    isUploadingPost: boolean;
    login: (details: LoginDetails) => Promise<void>;
    register: (details: LoginDetails) => Promise<void>;
    logout: () => Promise<void>;
    toggleTheme: () => void;
    setLanguage: (lang: Language) => void;
    createChannel: (channel: Omit<Channel, 'id' | 'professorId' | 'posts' | 'subscribers' | 'blockedUsers'>) => Promise<void>;
    subscribeToSection: (sectionId: string) => Promise<void>;
    sendMessage: (channelId: string, text: string) => Promise<void>;
    sendDirectMessage: (receiverId: string, text: string) => Promise<void>;
    addPostFromFile: (channelId: string, file: File) => Promise<void>;
    addPostFromLink: (channelId: string, title: string, url: string) => Promise<void>;
    sendJarvisMessage: (text: string) => Promise<void>;
    updateUser: (updatedUser: Partial<User>) => Promise<void>;
    markNotificationsAsRead: () => Promise<void>;
    clearChannelChat: (channelId: string) => Promise<void>;
    deletePostFromChannel: (channelId: string, postId: string) => Promise<void>;
    downloadPostForOffline: (post: Post) => Promise<void>;
    removePostFromOffline: (post: Post) => Promise<void>;
    blockUserFromChannel: (userId: string, channelId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>(MOCK_ALL_USERS);
    const [theme, setTheme] = useState<Theme>('light');
    const [language, setLanguage] = useState<Language>('ar');
    const [channels, setChannels] = useState<Channel[]>(MOCK_CHANNELS);
    const [sections, setSections] = useState<Section[]>(MOCK_SECTIONS);
    const [channelMessages, setChannelMessages] = useState<ChannelMessage[]>(MOCK_CHANNEL_MESSAGES);
    const [directMessages, setDirectMessages] = useState<DirectMessage[]>(MOCK_DIRECT_MESSAGES);
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [jarvisHistory, setJarvisHistory] = useState<JarvisMessage[]>([]);
    const [offlinePostIds, setOfflinePostIds] = useState<Set<string>>(new Set());
    const [isUploadingPost, setIsUploadingPost] = useState(false);
    
    const s = getLang(language);
    
    const login = async (details: LoginDetails) => {
        const { email, isDemo, role } = details;
        if (isDemo) {
            setUser(role === UserRole.Professor ? MOCK_PROFESSOR : MOCK_STUDENT);
            return;
        }

        const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (foundUser) {
            setUser(foundUser);
        } else {
            console.error('Login failed: User not found');
            alert('Login failed: User not found. Please use a demo account or register.');
        }
    };
    
    const register = async (details: LoginDetails) => {
        const newUser: User = {
            id: `user-${Date.now()}`,
            name: details.name!,
            email: details.email,
            role: details.role!,
            gender: details.gender!,
            university: details.university || '',
            college: details.college || '',
            avatar: 'https://picsum.photos/seed/newuser/200',
            subscribedSections: [],
        };
        setAllUsers(prev => [...prev, newUser]);
        setUser(newUser);
    };

    const logout = async () => {
        setUser(null);
    };

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    const createChannel = async (channelData: Omit<Channel, 'id' | 'professorId' | 'posts' | 'subscribers' | 'blockedUsers'>) => {
        if (!user || user.role !== UserRole.Professor) return;
        const newChannel: Channel = {
            ...channelData,
            id: `ch-${Date.now()}`,
            professorId: user.id,
            posts: [],
            subscribers: 0,
            blockedUsers: [],
        };
        setChannels(prev => [...prev, newChannel]);
    };

    const subscribeToSection = async (sectionId: string) => {
        if (!user) return;
        setUser(prevUser => {
            if (!prevUser) return null;
            const newSubscriptions = [...prevUser.subscribedSections, sectionId];
            return { ...prevUser, subscribedSections: newSubscriptions };
        });
        
        const section = sections.find(s => s.id === sectionId);
        const channel = channels.find(c => c.id === section?.channelId);
        if (section && channel) {
            const newNotification: Notification = {
                id: `notif-${Date.now()}`,
                text: s.subscriptionSuccessNotification
                    .replace('{sectionName}', section.name)
                    .replace('{channelName}', channel.name),
                timestamp: 'Just now',
                read: false,
            };
            setNotifications(prev => [newNotification, ...prev]);
        }
    };

    const sendMessage = async (channelId: string, text: string) => {
        if (!user) return;
        const newMessage: ChannelMessage = {
            id: `msg-${Date.now()}`,
            channelId,
            senderId: user.id,
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChannelMessages(prev => [...prev, newMessage]);
    };

    const sendDirectMessage = async (receiverId: string, text: string) => {
        if (!user) return;
         const newMessage: DirectMessage = {
            id: `dm-${Date.now()}`,
            senderId: user.id,
            receiverId,
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setDirectMessages(prev => [...prev, newMessage]);
    };
    
    const addPostFromFile = async (channelId: string, file: File) => {
        setIsUploadingPost(true);
        try {
            await new Promise<void>((resolve, reject) => {
                const fileReader = new FileReader();
                fileReader.readAsDataURL(file);

                fileReader.onload = () => {
                    const fileUrl = fileReader.result as string;
                    const mimeType = file.type;
                    let type: PostType;

                    if (mimeType.startsWith('image/')) {
                        type = PostType.Image;
                    } else if (mimeType.startsWith('video/')) {
                        type = PostType.Video;
                    } else if (mimeType === 'application/pdf') {
                        type = PostType.PDF;
                    } else {
                        // This check should ideally be done before calling the function
                        return reject(new Error('Unsupported file type'));
                    }

                    const newPost: Post = {
                        id: `post-${Date.now()}`,
                        type,
                        title: file.name,
                        url: fileUrl,
                        createdAt: new Date().toISOString().split('T')[0],
                    };

                    setChannels(prevChannels => prevChannels.map(ch => 
                        ch.id === channelId ? { ...ch, posts: [newPost, ...ch.posts] } : ch
                    ));
                    resolve();
                };

                fileReader.onerror = (error) => {
                    console.error("Error reading file:", error);
                    alert("فشل في قراءة الملف.");
                    reject(error);
                };
            });
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setIsUploadingPost(false);
        }
    };

    const addPostFromLink = async (channelId: string, title: string, url: string) => {
        const newPost: Post = {
            id: `post-${Date.now()}`,
            type: PostType.Link,
            title: title,
            url: url,
            createdAt: new Date().toISOString().split('T')[0],
        };
        setChannels(prev => prev.map(ch => 
            ch.id === channelId ? { ...ch, posts: [newPost, ...ch.posts] } : ch
        ));
    };

    const sendJarvisMessage = async (text: string) => {
        if(!user) return;
        const userMessage: JarvisMessage = { id: `jarvis-${Date.now()}`, sender: 'user', text };
        setJarvisHistory(prev => [...prev, userMessage]);
        
        const jarvisResponse = await askJarvis(text, user.name, user.gender, user.role);

        const jarvisMessage: JarvisMessage = { 
            id: `jarvis-${Date.now()+1}`, 
            sender: 'jarvis', 
            text: jarvisResponse.text, 
        };
        setJarvisHistory(prev => [...prev, jarvisMessage]);
    };
    
    const updateUser = async (updatedUser: Partial<User>) => {
        if (!user) return;
        const updatedUserObject = { ...user, ...updatedUser };
        setUser(updatedUserObject);
        setAllUsers(prevUsers => prevUsers.map(u => u.id === user.id ? updatedUserObject : u));
    };

    const markNotificationsAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearChannelChat = async (channelId: string) => {
        setChannelMessages(prev => prev.filter(msg => msg.channelId !== channelId));
    };

    const removePostFromOffline = async (post: Post) => {
        const cache = await caches.open(OFFLINE_CACHE_NAME);
        const deleted = await cache.delete(post.url);
        if (deleted) {
            setOfflinePostIds(prev => {
                const next = new Set(prev);
                next.delete(post.id);
                return next;
            });
        }
    };
    
    const deletePostFromChannel = async (channelId: string, postId: string) => {
        let postToRemove: Post | undefined;
        setChannels(prevChannels =>
            prevChannels.map(ch => {
                if (ch.id === channelId) {
                    postToRemove = ch.posts.find(p => p.id === postId);
                    return { ...ch, posts: ch.posts.filter(p => p.id !== postId) };
                }
                return ch;
            })
        );
        if (postToRemove) {
            await removePostFromOffline(postToRemove);
        }
    };

    const downloadPostForOffline = async (post: Post) => {
        try {
            const cache = await caches.open(OFFLINE_CACHE_NAME);
            // Fetch supports data URLs in modern browsers
            const response = await fetch(post.url);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`);
            }
            await cache.put(post.url, response);
            setOfflinePostIds(prev => new Set(prev).add(post.id));
        } catch (error) {
            console.error('Failed to download post for offline:', post.url, error);
            alert(`Failed to download file. It might be due to a network issue or cross-origin restrictions (CORS). Some resources like placeholder images from external sites cannot be cached for offline use.`);
        }
    };

    const blockUserFromChannel = async (userId: string, channelId: string) => {
        setChannels(prevChannels => prevChannels.map(ch => {
            if (ch.id === channelId && !ch.blockedUsers.includes(userId)) {
                return {
                    ...ch,
                    blockedUsers: [...ch.blockedUsers, userId]
                };
            }
            return ch;
        }));
    };


    const value = {
        user,
        allUsers,
        theme,
        language,
        s,
        channels,
        sections,
        channelMessages,
        directMessages,
        notifications,
        jarvisHistory,
        offlinePostIds,
        isUploadingPost,
        login,
        register,
        logout,
        toggleTheme,
        setLanguage,
        createChannel,
        subscribeToSection,
        sendMessage,
        sendDirectMessage,
        addPostFromFile,
        addPostFromLink,
        sendJarvisMessage,
        updateUser,
        markNotificationsAsRead,
        clearChannelChat,
        deletePostFromChannel,
        downloadPostForOffline,
        removePostFromOffline,
        blockUserFromChannel,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};