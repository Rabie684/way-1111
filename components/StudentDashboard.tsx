


import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getLang, MOCK_ALL_USERS, UNIVERSITIES, COLLEGES } from '../constants';
import { Channel, User, UserRole } from '../types';
import ChannelView from './ChannelView';
import JarvisAI from './JarvisAI';
import ProfileSettingsModal from './ProfileSettingsModal';
import DirectMessagesView from './DirectMessagesView';
import QRCodeModal from './QRCodeModal';
import AutocompleteInput from './AutocompleteInput';
import { BookOpenIcon, UserIcon, CompassIcon, MenuIcon, XIcon, BotIcon, SunIcon, MoonIcon, BellIcon, LogOutIcon, MessageSquareIcon, ExternalLinkIcon, CogIcon, QrCodeIcon, ArrowLeftIcon } from './icons/IconComponents';

const StudentDashboard: React.FC = () => {
    const { user, channels, sections, language, s, logout, theme, toggleTheme, setLanguage, notifications, markNotificationsAsRead } = useApp();
    const [activeTab, setActiveTab] = useState<'my-channels' | 'explore' | 'ai' | 'direct-messages'>('explore');
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
    const [selectedProfessorId, setSelectedProfessorId] = useState<string | null>(null);

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const profileDropdownRef = useRef<HTMLDivElement>(null);
    const notifDropdownRef = useRef<HTMLDivElement>(null);
    const unreadCount = notifications.filter(n => !n.read).length;

    const [exploreUniversity, setExploreUniversity] = useState('');
    const [exploreCollege, setExploreCollege] = useState('');

    const professorMap = useMemo(() => new Map(MOCK_ALL_USERS.filter(u => u.role === UserRole.Professor).map(p => [p.id, p])), []);
    
    const selectedChannel = useMemo(() => {
        if (!selectedChannelId) return null;
        return channels.find(c => c.id === selectedChannelId) || null;
    }, [selectedChannelId, channels]);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash.startsWith('#/channel/')) {
                const channelId = hash.substring('#/channel/'.length);
                setActiveTab('my-channels');
                setSelectedChannelId(channelId);
            } else if (hash.startsWith('#/explore/')) {
                const profId = hash.substring('#/explore/'.length);
                setActiveTab('explore');
                setSelectedProfessorId(profId);
                setSelectedChannelId(null);
            } else if (hash === '#/explore') {
                setActiveTab('explore');
                setSelectedChannelId(null);
                setSelectedProfessorId(null);
            } else if (hash === '#/ai') {
                setActiveTab('ai');
                setSelectedChannelId(null);
            } else if (hash === '#/direct-messages') {
                setActiveTab('direct-messages');
                setSelectedChannelId(null);
            } else if (hash === '#/my-channels') {
                setActiveTab('my-channels');
                setSelectedChannelId(null);
            } else {
                setActiveTab('explore');
                setSelectedChannelId(null);
                setSelectedProfessorId(null);
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Initial load

        if (!window.location.hash) {
            window.location.hash = '#/explore';
        }

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);


    const filteredProfessors = useMemo(() => {
        if (!exploreUniversity || !exploreCollege) return [];
        const professorsWithChannels = new Set(channels.map(c => c.professorId));
        return MOCK_ALL_USERS.filter(u => 
            u.role === UserRole.Professor &&
            professorsWithChannels.has(u.id) &&
            u.university === exploreUniversity &&
            u.college === exploreCollege
        );
    }, [channels, exploreUniversity, exploreCollege]);

    const selectedProfessorChannels = useMemo(() => {
        if (!selectedProfessorId) return [];
        return channels.filter(channel => channel.professorId === selectedProfessorId);
    }, [channels, selectedProfessorId]);


    const subscribedChannelIds = useMemo(() => {
        if (!user) return new Set<string>();
        const userSections = new Set(user.subscribedSections);
        return new Set(sections.filter(s => userSections.has(s.id)).map(s => s.channelId));
    }, [user, sections]);

    const mySubscribedChannels = useMemo(() => {
        return channels.filter(c => subscribedChannelIds.has(c.id));
    }, [channels, subscribedChannelIds]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) setProfileDropdownOpen(false);
            if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) setNotifDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    useEffect(() => {
        setSelectedProfessorId(null);
    }, [exploreUniversity, exploreCollege]);


    const handleNotifClick = () => {
        setNotifDropdownOpen(!notifDropdownOpen);
        if (!notifDropdownOpen && unreadCount > 0) setTimeout(() => markNotificationsAsRead(), 1000);
    }

    const handleChannelClick = (channel: Channel) => {
        window.location.hash = `#/channel/${channel.id}`;
        setSidebarOpen(false);
    };
    
    const handleSelectTab = (tab: 'my-channels' | 'explore' | 'ai' | 'direct-messages') => {
        window.location.hash = `#/${tab}`;
        setSidebarOpen(false);
    }
    
    const handleBackFromChannel = () => {
        window.history.back();
    }

    if (!user) return null;

    const renderContent = () => {
        if (activeTab === 'ai') return <JarvisAI />;
        if (activeTab === 'direct-messages') return <DirectMessagesView />;
        if (activeTab === 'explore') return (
            <div className="p-4 sm:p-8 h-full flex flex-col overflow-y-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex-shrink-0">{s.explore}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow flex-shrink-0">
                    <div>
                        <label htmlFor="university-explore" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{s.university}</label>
                        <AutocompleteInput
                            id="university-explore"
                            options={UNIVERSITIES}
                            value={exploreUniversity}
                            onValueChange={setExploreUniversity}
                            placeholder={s.select}
                        />
                    </div>
                    <div>
                        <label htmlFor="college-explore" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{s.college}</label>
                        <AutocompleteInput
                            id="college-explore"
                            options={COLLEGES}
                            value={exploreCollege}
                            onValueChange={setExploreCollege}
                            placeholder={s.select}
                        />
                    </div>
                </div>
                <div className="flex-1">
                    {selectedProfessorId ? (
                        <div>
                            <button onClick={() => window.location.hash = '#/explore'} className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                                <ArrowLeftIcon className="w-4 h-4" />
                                {s.back}
                            </button>
                             <h2 className="text-xl font-bold mb-4">{s.channelsBy.replace('{profName}', professorMap.get(selectedProfessorId)?.name || '')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                               {selectedProfessorChannels.map(channel => {
                                    const professor = professorMap.get(channel.professorId);
                                    return(
                                        <div key={channel.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                                            <div className="p-6">
                                                <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-2">{channel.name}</h3>
                                                {professor && (<div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4"><img src={professor.avatar} alt={professor.name} className="w-6 h-6 rounded-full me-2"/><span>{professor.name}</span></div>)}
                                                <p className="text-sm text-gray-500 mb-4">{channel.specialization}</p>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500"><div className="flex items-center"><BookOpenIcon className="w-4 h-4 me-1"/> {channel.posts.length}</div></div>
                                                    <button onClick={() => handleChannelClick(channel)} className={`px-4 py-2 rounded-md text-sm font-semibold bg-primary-500 hover:bg-primary-600 text-white`}>{s.openChannel}</button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                             {selectedProfessorChannels.length === 0 && <p className="text-center text-gray-500 mt-8">This professor has no channels.</p>}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredProfessors.map(prof => {
                                const profChannelsCount = channels.filter(c => c.professorId === prof.id).length;
                                return (
                                    <div key={prof.id} onClick={() => window.location.hash = `#/explore/${prof.id}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center gap-4 cursor-pointer transition-all hover:shadow-lg hover:border-primary-500 border-2 border-transparent">
                                        <img src={prof.avatar} alt={prof.name} className="w-16 h-16 rounded-full object-cover" />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg">{prof.name}</h3>
                                            <p className="text-sm text-gray-500">{prof.college}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-2xl text-primary-600 dark:text-primary-400">{profChannelsCount}</p>
                                            <p className="text-xs text-gray-500">{s.channels}</p>
                                        </div>
                                    </div>
                                )
                            })}
                            {filteredProfessors.length === 0 && exploreUniversity && exploreCollege && (
                                <p className="text-center text-gray-500 mt-8">{s.noProfessorsFound}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
        if (activeTab === 'my-channels') {
            if (selectedChannel) return <ChannelView channel={selectedChannel} user={user} onBack={handleBackFromChannel} onStartDirectMessage={() => {}} />;
            return (
                 <div className="p-4 sm:p-8 h-full flex flex-col overflow-y-auto">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex-shrink-0">{s.myChannels}</h1>
                    <div className="flex-1">
                        {mySubscribedChannels.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {mySubscribedChannels.map(channel => {
                                    const professor = professorMap.get(channel.professorId);
                                    return(
                                        <div key={channel.id} onClick={() => handleChannelClick(channel)} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 cursor-pointer">
                                            <div className="p-6">
                                                <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-2">{channel.name}</h3>
                                                {professor && (<div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4"><img src={professor.avatar} alt={professor.name} className="w-6 h-6 rounded-full me-2"/><span>{professor.name}</span></div>)}
                                                <p className="text-sm text-gray-500 mb-4">{channel.specialization}</p>
                                                <div className="flex justify-between items-center text-sm text-gray-500">
                                                    <div className="flex items-center"><BookOpenIcon className="w-4 h-4 me-1"/> {channel.posts.length} {s.posts}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
                                <BookOpenIcon className="w-16 h-16 mb-4" />
                                <h2 className="text-xl font-semibold">{s.noSubscribedChannels}</h2>
                                <p>{s.noSubscribedChannelsHint}</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };
    
    const subscribedChannelsContent = (
        <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 overflow-y-auto p-2">
                {mySubscribedChannels.map(channel => (
                    <a key={channel.id} href={`#/channel/${channel.id}`} onClick={(e) => { e.preventDefault(); handleChannelClick(channel); }} className={`block px-4 py-2 md:py-3 my-1 rounded-md text-sm font-medium ${selectedChannel?.id === channel.id ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{channel.name}</a>
                ))}
                 {mySubscribedChannels.length === 0 && (
                    <p className="p-4 text-center text-gray-500 text-sm">You are not subscribed to any channels yet. Use the Explore tab to find and join channels.</p>
                )}
            </nav>
        </div>
    );

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
                    <p className="text-xs text-gray-500">{user.college}</p>
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
                        <button onClick={() => handleSelectTab('my-channels')} className={`w-full flex items-center p-2 rounded-md text-sm font-medium ${activeTab === 'my-channels' ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><BookOpenIcon className="w-5 h-5 me-3"/> <span>{s.myChannels}</span></button>
                        <button onClick={() => handleSelectTab('explore')} className={`w-full flex items-center p-2 rounded-md text-sm font-medium ${activeTab === 'explore' ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><CompassIcon className="w-5 h-5 me-3"/> <span>{s.explore}</span></button>
                        <button onClick={() => handleSelectTab('direct-messages')} className={`w-full flex items-center p-2 rounded-md text-sm font-medium ${activeTab === 'direct-messages' ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><MessageSquareIcon className="w-5 h-5 me-3" /><span>{s.directMessages}</span></button>
                        <button onClick={() => handleSelectTab('ai')} className={`w-full flex items-center p-2 rounded-md text-sm font-medium ${activeTab === 'ai' ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><BotIcon className="w-5 h-5 me-3"/> <span>{s.jarvisAi}</span></button>
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
                    {activeTab === 'my-channels' && subscribedChannelsContent}
                </div>
                {sidebarFooterControls}
            </aside>
            
            {/* Desktop Header */}
            <header className="hidden md:flex items-center justify-between px-6 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-8"><h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">{s.appName}</h1>
                    <nav className="flex items-center gap-2">
                        <button onClick={() => handleSelectTab('my-channels')} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'my-channels' ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{s.myChannels}</button>
                        <button onClick={() => handleSelectTab('explore')} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'explore' ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{s.explore}</button>
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
                {activeTab === 'my-channels' && (<aside className="hidden md:flex flex-col w-1/4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">{subscribedChannelsContent}</aside>)}
                <main className={`flex-1 bg-gray-100 dark:bg-gray-900 flex flex-col min-w-0 md:rounded-xl md:shadow-lg overflow-hidden ${activeTab !== 'my-channels' ? 'md:w-full' : ''}`}>{renderContent()}</main>
            </div>
            
            {settingsOpen && <ProfileSettingsModal onClose={() => setSettingsOpen(false)} />}
            {isQrModalOpen && <QRCodeModal onClose={() => setIsQrModalOpen(false)} />}
        </div>
    );
};

export default StudentDashboard;