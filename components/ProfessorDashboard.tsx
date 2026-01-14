

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getLang } from '../constants';
import { Channel } from '../types';
import ChannelView from './ChannelView';
import JarvisAI from './JarvisAI';
import CreateChannelModal from './CreateChannelModal';
import ProfileSettingsModal from './ProfileSettingsModal';
import DirectMessagesView from './DirectMessagesView';
import QRCodeModal from './QRCodeModal';
import { BookOpenIcon, BotIcon, PlusCircleIcon, StarIcon, MenuIcon, XIcon, SunIcon, MoonIcon, UserIcon, LogOutIcon, BellIcon, MessageSquareIcon, ExternalLinkIcon, CogIcon, QrCodeIcon } from './icons/IconComponents';

const ProfessorDashboard: React.FC = () => {
    const { user, channels, language, s, logout, theme, toggleTheme, setLanguage, notifications, markNotificationsAsRead } = useApp();
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [activeTab, setActiveTab] = useState<'channel' | 'ai' | 'direct-messages'>('channel');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const profileDropdownRef = useRef<HTMLDivElement>(null);
    const notifDropdownRef = useRef<HTMLDivElement>(null);
    const unreadCount = notifications.filter(n => !n.read).length;

    const professorChannels = channels.filter(ch => ch.professorId === user?.id);
    const totalStars = professorChannels.reduce((acc, ch) => acc + ch.subscribers * 5, 0);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setProfileDropdownOpen(false);
            }
            if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
                setNotifDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotifClick = () => {
        setNotifDropdownOpen(!notifDropdownOpen);
        if(!notifDropdownOpen && unreadCount > 0) {
            setTimeout(() => markNotificationsAsRead(), 1000);
        }
    }

    const handleSelectChannel = (channel: Channel) => {
        setActiveTab('channel');
        setSelectedChannel(channel);
        setSidebarOpen(false);
    };

    const handleSelectTab = (tab: 'channel' | 'ai' | 'direct-messages') => {
        if (tab !== 'channel') {
            setSelectedChannel(null);
        }
        setActiveTab(tab);
        setSidebarOpen(false);
    }
    
    const handleBackFromChannel = () => {
        setSelectedChannel(null);
    }

    const renderContent = () => {
        if (activeTab === 'ai') return <JarvisAI />;
        if (activeTab === 'direct-messages') return <DirectMessagesView />;
        if (activeTab === 'channel') {
            if (selectedChannel) return <ChannelView channel={selectedChannel} user={user!} onBack={handleBackFromChannel} />;
            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
                    <BookOpenIcon className="w-16 h-16 mb-4" />
                    <h2 className="text-xl font-semibold">Select a channel to view its content</h2>
                    <p>or create a new channel to get started.</p>
                </div>
            );
        }
        return null;
    };
    
    const channelListContent = (
         <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="p-4">
                <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800">
                    <PlusCircleIcon className="w-5 h-5 me-2" />
                    {s.createChannel}
                </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-2">
                {professorChannels.map(channel => (
                    <a key={channel.id} href="#" onClick={(e) => { e.preventDefault(); handleSelectChannel(channel); }} className={`block px-4 py-2 md:py-3 my-1 rounded-md text-sm font-medium ${selectedChannel?.id === channel.id ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                        {channel.name}
                    </a>
                ))}
                {professorChannels.length === 0 && (<p className="p-4 text-center text-gray-500">You have not created any channels yet.</p>)}
            </nav>
        </div>
    );

    if (!user) return null;

    const sidebarFooterControls = (
        <div className="mt-auto p-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                     <select value={language} onChange={(e) => setLanguage(e.target.value as 'ar' | 'en' | 'fr')} className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500">
                        <option value="en">EN</option>
                        <option value="fr">FR</option>
                        <option value="ar">AR</option>
                    </select>
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Toggle theme">
                        {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                    </button>
                </div>
                <div className="relative" ref={notifDropdownRef}>
                    <button onClick={handleNotifClick} className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <BellIcon className="w-5 h-5"/>
                        {unreadCount > 0 && <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>}
                    </button>
                    {notifDropdownOpen && (
                         <div className="absolute bottom-full end-0 mb-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-40">
                            <div className="p-3 font-semibold border-b border-gray-200 dark:border-gray-700">{s.notifications}</div>
                            <div className="max-h-60 overflow-y-auto">
                                {notifications.length > 0 ? notifications.map(notif => (
                                    <div key={notif.id} className={`p-3 text-sm border-b border-gray-200 dark:border-gray-700/50 ${!notif.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                                        <p>{notif.text}</p>
                                        <p className="text-xs text-gray-500 mt-1">{notif.timestamp}</p>
                                    </div>
                                )) : <p className="p-4 text-center text-gray-500">{s.noNotifications}</p>}
                            </div>
                         </div>
                    )}
                </div>
            </div>
            <div className="flex items-center space-x-3 rtl:space-x-reverse p-2">
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover"/>
                <div className="flex-1 text-start">
                    <h3 className="font-bold text-sm">{user.name}</h3>
                    <div className="flex items-center text-xs text-yellow-500">
                        <StarIcon className="w-3 h-3 fill-current"/>
                        <span className="ms-1 font-semibold">{totalStars}</span>
                    </div>
                </div>
                <div className="relative" ref={profileDropdownRef}>
                     <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Settings">
                        <CogIcon className="w-5 h-5" />
                    </button>
                    {profileDropdownOpen && (
                        <div className="absolute bottom-full end-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                            <button onClick={() => { logout(); setSidebarOpen(false); }} className="w-full text-start flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <LogOutIcon className="w-4 h-4 me-3" /> {s.logout}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-gray-200 dark:bg-black">
            {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" aria-hidden="true"></div>}
            
            {/* Mobile Sidebar */}
            <aside className={`fixed top-0 ltr:left-0 rtl:right-0 h-full w-3/4 sm:w-1/2 bg-white dark:bg-gray-800 border-e dark:border-gray-700 flex flex-col transform transition-transform duration-300 ease-in-out z-30 md:hidden ${isSidebarOpen ? 'ltr:translate-x-0 rtl:-translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'}`}>
                <button onClick={() => setSidebarOpen(false)} className="absolute top-4 end-4 p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close sidebar"><XIcon className="w-6 h-6"/></button>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700"><h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">{s.appName}</h1></div>
                <div className="flex-1 flex flex-col overflow-y-hidden">
                    <nav className="p-4 space-y-1">
                        <button onClick={() => handleSelectTab('channel')} className={`w-full flex items-center p-2 rounded-md text-sm font-medium ${activeTab === 'channel' ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><BookOpenIcon className="w-5 h-5 me-3" /><span>{s.myChannels}</span></button>
                        <button onClick={() => handleSelectTab('direct-messages')} className={`w-full flex items-center p-2 rounded-md text-sm font-medium ${activeTab === 'direct-messages' ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><MessageSquareIcon className="w-5 h-5 me-3" /><span>{s.directMessages}</span></button>
                        <button onClick={() => handleSelectTab('ai')} className={`w-full flex items-center p-2 rounded-md text-sm font-medium ${activeTab === 'ai' ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><BotIcon className="w-5 h-5 me-3" /><span>{s.jarvisAi}</span></button>
                        <a href="https://www.asjp.cerist.dz/" target="_blank" rel="noopener noreferrer" className="w-full flex items-center p-2 rounded-md text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <ExternalLinkIcon className="w-5 h-5 me-3" /><span>{s.asjpPlatform}</span>
                        </a>
                         <button onClick={() => { setIsQrModalOpen(true); setSidebarOpen(false); }} className="w-full flex items-center p-2 rounded-md text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <QrCodeIcon className="w-5 h-5 me-3" /><span>{s.shareApp}</span>
                        </button>
                        <button onClick={() => { setSettingsOpen(true); setSidebarOpen(false); }} className="w-full flex items-center p-2 rounded-md text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <CogIcon className="w-5 h-5 me-3" /><span>{s.profileSettings}</span>
                        </button>
                    </nav>
                    {activeTab === 'channel' && channelListContent}
                </div>
                {sidebarFooterControls}
            </aside>

            {/* Desktop Header */}
            <header className="hidden md:flex items-center justify-between px-6 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-8"><h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">{s.appName}</h1>
                    <nav className="flex items-center gap-2">
                        <button onClick={() => handleSelectTab('channel')} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'channel' ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{s.myChannels}</button>
                        <button onClick={() => handleSelectTab('direct-messages')} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'direct-messages' ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{s.directMessages}</button>
                        <button onClick={() => handleSelectTab('ai')} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'ai' ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{s.jarvisAi}</button>
                        <a href="https://www.asjp.cerist.dz/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <ExternalLinkIcon className="w-4 h-4"/>
                            <span>{s.asjpPlatform}</span>
                        </a>
                    </nav>
                </div>
                <div className="flex items-center gap-2">
                    <select value={language} onChange={(e) => setLanguage(e.target.value as 'ar' | 'en' | 'fr')} className="bg-gray-100 dark:bg-gray-700 border-transparent rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"><option value="en">EN</option><option value="fr">FR</option><option value="ar">AR</option></select>
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Toggle theme">{theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}</button>
                    <button onClick={() => setIsQrModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label={s.shareApp}>
                        <QrCodeIcon className="w-5 h-5" />
                    </button>
                    <div className="relative" ref={notifDropdownRef}>
                        <button onClick={handleNotifClick} className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><BellIcon className="w-5 h-5"/>{unreadCount > 0 && <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>}</button>
                        {notifDropdownOpen && (<div className="absolute top-full end-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10"><div className="p-3 font-semibold border-b border-gray-200 dark:border-gray-700">{s.notifications}</div><div className="max-h-60 overflow-y-auto">{notifications.length > 0 ? notifications.map(notif => (<div key={notif.id} className={`p-3 text-sm border-b border-gray-200 dark:border-gray-700/50 ${!notif.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}><p>{notif.text}</p><p className="text-xs text-gray-500 mt-1">{notif.timestamp}</p></div>)) : <p className="p-4 text-center text-gray-500">{s.noNotifications}</p>}</div></div>)}
                    </div>
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover"/>
                     <div className="relative" ref={profileDropdownRef}>
                        <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Settings">
                           <CogIcon className="w-5 h-5"/>
                        </button>
                        {profileDropdownOpen && (<div className="absolute top-full end-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-10"><button onClick={() => { setSettingsOpen(true); setProfileDropdownOpen(false); }} className="w-full text-start flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"><UserIcon className="w-4 h-4 me-3" /> {s.profileSettings}</button><button onClick={logout} className="w-full text-start flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"><LogOutIcon className="w-4 h-4 me-3" /> {s.logout}</button></div>)}
                    </div>
                </div>
            </header>

            {/* Mobile Header */}
             <header className="md:hidden flex items-center justify-between p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Open sidebar"><MenuIcon className="w-6 h-6"/></button>
                <h1 className="text-lg font-bold text-primary-600 dark:text-primary-400">{s.appName}</h1>
                <div className="w-10"></div>
            </header>
            
            <div className="flex-1 flex overflow-hidden md:p-4 md:gap-4">
                {activeTab === 'channel' && (<aside className="hidden md:flex flex-col w-1/4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">{channelListContent}</aside>)}
                <main className="flex-1 bg-gray-100 dark:bg-gray-900 flex flex-col min-w-0 md:rounded-xl md:shadow-lg overflow-hidden">{renderContent()}</main>
            </div>
            
            {isModalOpen && <CreateChannelModal onClose={() => setIsModalOpen(false)} />}
            {settingsOpen && <ProfileSettingsModal onClose={() => setSettingsOpen(false)} />}
            {isQrModalOpen && <QRCodeModal onClose={() => setIsQrModalOpen(false)} />}
        </div>
    );
};

export default ProfessorDashboard;