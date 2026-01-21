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

// Extend the window object with Google API types
declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

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

const OFFLINE_CACHE_NAME = 'offline-files-cache-v1';

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
    offlinePostIds: Set<string>;
    isGoogleDriveConnected: boolean;
    isUploadingPost: boolean;
    connectGoogleDrive: () => void;
    disconnectGoogleDrive: () => void;
    login: (details: LoginDetails) => Promise<void>;
    register: (details: LoginDetails) => Promise<void>;
    logout: () => Promise<void>;
    toggleTheme: () => void;
    setLanguage: (lang: Language) => void;
    createChannel: (channel: Omit<Channel, 'id' | 'professorId' | 'posts' | 'subscribers' | 'blockedUsers'>) => Promise<void>;
    subscribeToSection: (sectionId: string) => Promise<void>;
    sendMessage: (channelId: string, text: string) => Promise<void>;
    sendDirectMessage: (receiverId: string, text: string) => Promise<void>;
    addPostToChannel: (channelId: string, file: File) => Promise<void>;
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
    const [theme, setTheme] = useState<Theme>('light');
    const [language, setLanguage] = useState<Language>('ar');
    const [channels, setChannels] = useState<Channel[]>(MOCK_CHANNELS);
    const [sections, setSections] = useState<Section[]>(MOCK_SECTIONS);
    const [channelMessages, setChannelMessages] = useState<ChannelMessage[]>(MOCK_CHANNEL_MESSAGES);
    const [directMessages, setDirectMessages] = useState<DirectMessage[]>(MOCK_DIRECT_MESSAGES);
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [jarvisHistory, setJarvisHistory] = useState<JarvisMessage[]>([]);
    const [offlinePostIds, setOfflinePostIds] = useState<Set<string>>(new Set());
    
    const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(() => localStorage.getItem('google_access_token'));
    const [isGapiReady, setIsGapiReady] = useState(false);
    const [isUploadingPost, setIsUploadingPost] = useState(false);
    
    const isGoogleDriveConnected = !!googleAccessToken;
    const s = getLang(language);

    useEffect(() => {
        const initializeGapiClient = () => {
            if (window.gapi) {
                window.gapi.load('client', async () => {
                    await window.gapi.client.init({
                        apiKey: process.env.GOOGLE_API_KEY,
                        clientId: process.env.GOOGLE_CLIENT_ID,
                        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
                    });
                    setIsGapiReady(true);
                    if (googleAccessToken) {
                        window.gapi.client.setToken({ access_token: googleAccessToken });
                    }
                });
            } else {
                setTimeout(initializeGapiClient, 100);
            }
        };
        initializeGapiClient();
    }, [googleAccessToken]);

    const connectGoogleDrive = () => {
        if (!window.google || !process.env.GOOGLE_CLIENT_ID) {
            alert("Google API script not loaded yet. Please try again.");
            return;
        }

        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: process.env.GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.file',
            callback: (tokenResponse: any) => {
                if (tokenResponse.error) {
                    console.error('Google Auth Error:', tokenResponse.error);
                    alert('Failed to connect to Google Drive.');
                    return;
                }
                const token = tokenResponse.access_token;
                setGoogleAccessToken(token);
                localStorage.setItem('google_access_token', token);
                window.gapi.client.setToken({ access_token: token });
                alert("Successfully connected to Google Drive!");
            },
        });
        tokenClient.requestAccessToken();
    };

    const disconnectGoogleDrive = () => {
        if (googleAccessToken && window.google) {
            window.google.accounts.oauth2.revoke(googleAccessToken, () => {
                console.log('Token revoked.');
            });
        }
        setGoogleAccessToken(null);
        localStorage.removeItem('google_access_token');
        if (window.gapi && window.gapi.client) {
            window.gapi.client.setToken(null);
        }
    };
    
    const login = async (details: LoginDetails) => {
        const { email, isDemo, role } = details;
        if (isDemo) {
            setUser(role === UserRole.Professor ? MOCK_PROFESSOR : MOCK_STUDENT);
            return;
        }

        const foundUser = MOCK_ALL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
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
            university: details.university || '',
            college: details.college || '',
            avatar: 'https://picsum.photos/seed/newuser/200',
            subscribedSections: [],
        };
        setUser(newUser);
    };

    const logout = async () => {
        if(isGoogleDriveConnected) disconnectGoogleDrive();
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
    
    const addPostToChannel = async (channelId: string, file: File) => {
        if (!isGoogleDriveConnected || !isGapiReady) {
            alert("Please connect to Google Drive from your profile settings first.");
            return;
        }

        setIsUploadingPost(true);
        try {
            const metadata = { name: file.name, mimeType: file.type };
            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', file);

            const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: new Headers({ 'Authorization': `Bearer ${googleAccessToken}` }),
                body: form,
            });
            
            const uploadedFile = await uploadResponse.json();

            if (!uploadResponse.ok || uploadedFile.error) {
                 const error = uploadedFile.error || { message: `HTTP error! status: ${uploadResponse.status}` };
                if (error.code === 401) {
                    alert("Your Google connection has expired. Please disconnect and reconnect your account from the settings.");
                    disconnectGoogleDrive();
                }
                throw new Error(error.message);
            }

            const fileId = uploadedFile.id;

            await window.gapi.client.drive.permissions.create({
                fileId: fileId,
                resource: { role: 'reader', type: 'anyone' }
            });

            const fileInfoResponse = await window.gapi.client.drive.files.get({
                fileId: fileId,
                fields: 'webViewLink'
            });

            const webViewLink = fileInfoResponse.result.webViewLink;
            const fileType = file.type.split('/')[0];
            let type: PostType;
            if (fileType === 'image') type = PostType.Image;
            else if (fileType === 'video') type = PostType.Video;
            else type = PostType.PDF;

            const newPost: Post = {
                id: `post-${Date.now()}`,
                type,
                title: file.name,
                url: webViewLink,
                createdAt: new Date().toISOString().split('T')[0],
            };

            setChannels(prevChannels => prevChannels.map(ch => 
                ch.id === channelId ? { ...ch, posts: [newPost, ...ch.posts] } : ch
            ));
        } catch (error: any) {
            console.error("Error uploading to Google Drive:", error);
            alert(`Failed to upload file to Google Drive: ${error.message}`);
        } finally {
            setIsUploadingPost(false);
        }
    };

    const sendJarvisMessage = async (text: string) => {
        if(!user) return;
        const userMessage: JarvisMessage = { id: `jarvis-${Date.now()}`, sender: 'user', text };
        setJarvisHistory(prev => [...prev, userMessage]);
        
        const jarvisResponseText = await askJarvis(text);

        const jarvisMessage: JarvisMessage = { id: `jarvis-${Date.now()+1}`, sender: 'jarvis', text: jarvisResponseText };
        setJarvisHistory(prev => [...prev, jarvisMessage]);
    };
    
    const updateUser = async (updatedUser: Partial<User>) => {
        if (!user) return;
        setUser(prev => prev ? { ...prev, ...updatedUser } : null);
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
        isGoogleDriveConnected,
        isUploadingPost,
        connectGoogleDrive,
        disconnectGoogleDrive,
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