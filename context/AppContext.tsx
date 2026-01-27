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
import { askJarvis, JarvisFile } from '../services/geminiService';

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

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = (reader.result as string).split(',')[1];
            resolve(result);
        };
        reader.onerror = error => reject(error);
    });
};

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
    deleteDirectMessage: (messageId: string) => Promise<void>;
    addPostFromFile: (channelId: string, file: File) => Promise<void>;
    addPostFromLink: (channelId: string, title: string, url: string) => Promise<void>;
    sendJarvisMessage: (text: string, file?: File) => Promise<void>;
    updateUser: (updatedUser: Partial<User>) => Promise<void>;
    markNotificationsAsRead: () => Promise<void>;
    clearChannelChat: (channelId: string) => Promise<void>;
    deletePostFromChannel: (channelId: string, postId: string) => Promise<void>;
    downloadPostForOffline: (post: Post) => Promise<void>;
    removePostFromOffline: (post: Post) => Promise<void>;
    blockUserFromChannel: (userId: string, channelId: string) => Promise<void>;
    sharePostWithJarvis: (post: Post) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>(MOCK_ALL_USERS);
    const [theme, setTheme] = useState<Theme>('dark');
    const [language, setLanguage] = useState<Language>('ar');
    const [channels, setChannels] = useState<Channel[]>(MOCK_CHANNELS);
    const [sections, setSections] = useState<Section[]>(MOCK_SECTIONS);
    const [channelMessages, setChannelMessages] = useState<ChannelMessage[]>(MOCK_CHANNEL_MESSAGES);
    const [directMessages, setDirectMessages] = useState<DirectMessage[]>(MOCK_DIRECT_MESSAGES);
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [jarvisHistory, setJarvisHistory] = useState<JarvisMessage[]>([]);
    const [offlinePostIds, setOfflinePostIds] = useState<Set<string>>(new Set());
    const [isUploadingPost, setIsUploadingPost] = useState(false);
    const [jarvisContextPost, setJarvisContextPost] = useState<Post | null>(null);

    const s = getLang(language);
    
    useEffect(() => {
        const checkOfflinePosts = async () => {
            if ('caches' in window) {
                const cache = await caches.open(OFFLINE_CACHE_NAME);
                const requests = await cache.keys();
                const postIds = new Set<string>();
                requests.forEach(req => {
                    const url = new URL(req.url);
                    const postId = url.searchParams.get('postId');
                    if (postId) {
                        postIds.add(postId);
                    }
                });
                setOfflinePostIds(postIds);
            }
        };
        checkOfflinePosts();
    }, []);

    const login = async (details: LoginDetails) => {
        if (details.isDemo) {
            setUser(details.role === UserRole.Professor ? MOCK_PROFESSOR : MOCK_STUDENT);
        } else {
            console.log('Logging in user...');
            // In a real app, this would involve an API call
            const existingUser = allUsers.find(u => u.email === details.email);
            if (existingUser) setUser(existingUser);
            else alert('User not found!');
        }
    };

    const register = async (details: LoginDetails) => {
        console.log('Registering user...');
        const newUser: User = {
            id: 'user-' + Date.now(),
            name: details.name!,
            email: details.email!,
            role: details.role!,
            gender: details.gender!,
            university: details.university!,
            college: details.college!,
            avatar: `https://picsum.photos/seed/${Date.now()}/200`,
            subscribedSections: []
        };
        setAllUsers(prev => [...prev, newUser]);
        setUser(newUser);
    };

    const logout = async () => {
        setUser(null);
    };

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    const createChannel = async (channelData: Omit<Channel, 'id' | 'professorId' | 'posts' | 'subscribers' | 'blockedUsers'>) => {
        if (!user || user.role !== UserRole.Professor) return;
        const newChannel: Channel = {
            id: 'ch-' + Date.now(),
            professorId: user.id,
            posts: [],
            subscribers: 0,
            blockedUsers: [],
            ...channelData,
        };
        setChannels(prev => [...prev, newChannel]);
    };

    const subscribeToSection = async (sectionId: string) => {
        if (!user) return;
        setUser(prev => prev ? { ...prev, subscribedSections: [...prev.subscribedSections, sectionId] } : null);
        const section = sections.find(s => s.id === sectionId);
        const channel = channels.find(c => c.id === section?.channelId);
        if(section && channel) {
            const notifText = s.subscriptionSuccessNotification
                .replace('{sectionName}', section.name)
                .replace('{channelName}', channel.name);
            addNotification(notifText);
        }
    };
    
    const addNotification = (text: string) => {
        const newNotif: Notification = {
            id: 'notif-' + Date.now(),
            text,
            timestamp: 'الآن',
            read: false,
        };
        setNotifications(prev => [newNotif, ...prev]);
    }

    const sendMessage = async (channelId: string, text: string) => {
        if (!user) return;
        const newMessage: ChannelMessage = {
            id: 'msg-ch-' + Date.now(),
            senderId: user.id,
            channelId,
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChannelMessages(prev => [...prev, newMessage]);
    };

    const sendDirectMessage = async (receiverId: string, text: string) => {
        if (!user) return;
        const newMessage: DirectMessage = {
            id: 'dm-' + Date.now(),
            senderId: user.id,
            receiverId,
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setDirectMessages(prev => [...prev, newMessage]);
    };
    
    const deleteDirectMessage = async (messageId: string) => {
        setDirectMessages(prev => prev.filter(msg => msg.id !== messageId));
    };

    const addPostFromFile = async (channelId: string, file: File) => {
        setIsUploadingPost(true);
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        let type: PostType;
        if (file.type.startsWith('image/')) type = PostType.Image;
        else if (file.type.startsWith('video/')) type = PostType.Video;
        else if (file.type === 'application/pdf') type = PostType.PDF;
        else {
             alert('File type not supported');
             setIsUploadingPost(false);
             return;
        }

        const newPost: Post = {
            id: 'p-' + Date.now(),
            type,
            title: file.name,
            url: URL.createObjectURL(file), // Using blob URL for local preview
            createdAt: new Date().toISOString().split('T')[0]
        };

        setChannels(prev => prev.map(ch => ch.id === channelId ? { ...ch, posts: [newPost, ...ch.posts] } : ch));
        setIsUploadingPost(false);
    };

    const addPostFromLink = async (channelId: string, title: string, url: string) => {
        const newPost: Post = {
            id: 'p-' + Date.now(),
            type: PostType.Link,
            title,
            url,
            createdAt: new Date().toISOString().split('T')[0]
        };
        setChannels(prev => prev.map(ch => ch.id === channelId ? { ...ch, posts: [newPost, ...ch.posts] } : ch));
    };


    const sendJarvisMessage = async (text: string, file?: File) => {
        if (!user) return;
        
        const userMessage: JarvisMessage = { id: 'jarvis-' + Date.now(), sender: 'user', text };
        if (file) {
            userMessage.file = {
                name: file.name,
                type: file.type,
                url: URL.createObjectURL(file),
            };
        }
        setJarvisHistory(prev => [...prev, userMessage]);

        let fileToSend: JarvisFile | undefined;
        let finalPrompt = text;

        if (file) {
            const base64 = await fileToBase64(file);
            fileToSend = { base64, mimeType: file.type };
            if (jarvisContextPost) setJarvisContextPost(null);
        } else if (jarvisContextPost) {
            try {
                const response = await fetch(jarvisContextPost.url, { mode: 'cors' });
                if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
                const blob = await response.blob();
                const fetchedFile = new File([blob], jarvisContextPost.title, { type: blob.type });
                const base64 = await fileToBase64(fetchedFile);
                fileToSend = { base64, mimeType: fetchedFile.type };
            } catch (error) {
                console.error("Failed to fetch shared post content:", error);
                finalPrompt = `لم أتمكن من الوصول إلى الملف "${jarvisContextPost.title}" لتحليله. يرجى التأكد من أن الرابط متاح للعموم. سأحاول الإجابة على سؤالك بناءً على المعلومات المتاحة. ${text}`;
            } finally {
                setJarvisContextPost(null);
            }
        }
        
        const response = await askJarvis(finalPrompt, user.name, user.gender, user.role, fileToSend);
        
        const jarvisResponse: JarvisMessage = { id: 'jarvis-' + Date.now() + 1, sender: 'jarvis', text: response.text };
        setJarvisHistory(prev => [...prev, jarvisResponse]);
    };

    const updateUser = async (updatedUser: Partial<User>) => {
        if (!user) return;
        setUser(prev => prev ? { ...prev, ...updatedUser } : null);
        setAllUsers(prev => prev.map(u => u.id === user.id ? {...u, ...updatedUser} : u));
    };
    
    const markNotificationsAsRead = async () => {
        setNotifications(prev => prev.map(n => ({...n, read: true})));
    };
    
    const clearChannelChat = async (channelId: string) => {
        setChannelMessages(prev => prev.filter(m => m.channelId !== channelId));
    };

    const deletePostFromChannel = async (channelId: string, postId: string) => {
        setChannels(prev => prev.map(ch => {
            if (ch.id === channelId) {
                return {...ch, posts: ch.posts.filter(p => p.id !== postId)};
            }
            return ch;
        }));
    };
    
    const downloadPostForOffline = async (post: Post) => {
        if ('caches' in window) {
            try {
                const cache = await caches.open(OFFLINE_CACHE_NAME);
                const requestUrl = new URL(post.url);
                requestUrl.searchParams.set('postId', post.id);

                const response = await fetch(post.url, { mode: 'cors' });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                const cacheRequest = new Request(requestUrl.toString(), { mode: 'cors' });
                await cache.put(cacheRequest, response);

                setOfflinePostIds(prev => new Set(prev).add(post.id));
            } catch (error) {
                console.error('Failed to cache file:', error);
                alert('Failed to download for offline use.');
            }
        }
    };
    
    const removePostFromOffline = async (post: Post) => {
        if ('caches' in window) {
            const cache = await caches.open(OFFLINE_CACHE_NAME);
            const requests = await cache.keys();
            for (const req of requests) {
                const url = new URL(req.url);
                if (url.searchParams.get('postId') === post.id) {
                    await cache.delete(req);
                    break;
                }
            }
            setOfflinePostIds(prev => {
                const next = new Set(prev);
                next.delete(post.id);
                return next;
            });
        }
    };

    const blockUserFromChannel = async (userId: string, channelId: string) => {
        setChannels(prev => prev.map(ch => 
            ch.id === channelId ? { ...ch, blockedUsers: [...ch.blockedUsers, userId] } : ch
        ));
    };

    const sharePostWithJarvis = (post: Post) => {
        if (!user) return;
        setJarvisContextPost(post);

        const userMessage: JarvisMessage = {
            id: 'jarvis-' + Date.now(),
            sender: 'user',
            text: `مشاركة ملف لتحليله: "${post.title}"`,
        };
        const jarvisMessage: JarvisMessage = {
            id: 'jarvis-' + Date.now() + 1,
            sender: 'jarvis',
            text: s.jarvisFileReceived,
        };

        setJarvisHistory(prev => [...prev, userMessage, jarvisMessage]);
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
        deleteDirectMessage,
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
        sharePostWithJarvis
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
