
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getLang, MOCK_ALL_USERS, UNIVERSITIES, COLLEGES } from '../constants';
import { Channel, UserRole } from '../types';
import ChannelView from './ChannelView';
import SubscriptionModal from './SubscriptionModal';
import DirectMessagesView from './DirectMessagesView';
import JarvisAI from './JarvisAI';
import { BookOpenIcon, MessageSquareIcon, UserIcon, CompassIcon, MenuIcon, XIcon, BotIcon } from './icons/IconComponents';

const StudentDashboard: React.FC = () => {
    const { user, channels, language } = useApp();
    const s = getLang(language);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState<Channel | null>(null);
    const [activeTab, setActiveTab] = useState<'my-channels' | 'explore' | 'dm' | 'ai'>('explore');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const [exploreUniversity, setExploreUniversity] = useState('');
    const [exploreCollege, setExploreCollege] = useState('');

    const professorMap = useMemo(() => 
        new Map(MOCK_ALL_USERS.filter(u => u.role === UserRole.Professor).map(p => [p.id, p])), 
    []);

    const filteredExploreChannels = useMemo(() => {
        if (!exploreUniversity || !exploreCollege) {
            return [];
        }
        return channels.filter(channel => {
            const professor = professorMap.get(channel.professorId);
            if (!professor) return false;
            return professor.university === exploreUniversity && professor.college === exploreCollege;
        });
    }, [channels, exploreUniversity, exploreCollege, professorMap]);

    const handleChannelClick = (channel: Channel) => {
        if (user?.subscribedChannels.includes(channel.id)) {
            setActiveTab('my-channels');
            setSelectedChannel(channel);
            setSidebarOpen(false);
        } else {
            setShowSubscriptionModal(channel);
        }
    };
    
    const handleSelectTab = (tab: 'my-channels' | 'explore' | 'dm' | 'ai') => {
        // Imperatively clear selected channel when switching to a non-channel-view tab.
        // This is more robust than a useEffect for this navigation logic.
        if (tab !== 'my-channels') {
            setSelectedChannel(null);
        }
        setActiveTab(tab);
        setSidebarOpen(false);
    }
    
    const handleBackFromChannel = () => {
        setSelectedChannel(null);
    }

    if (!user) return null;

    const renderContent = () => {
        if (activeTab === 'ai') {
            return <JarvisAI />;
        }
        
        if (activeTab === 'dm') {
            return <DirectMessagesView />;
        }
        
        if (activeTab === 'explore') {
             return (
                <div className="p-4 sm:p-8">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-6">{s.explore}</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                         <div>
                            <label htmlFor="university" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{s.university}</label>
                            <select id="university" value={exploreUniversity} onChange={(e) => setExploreUniversity(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                                <option value="">{s.select}</option>
                                {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="college" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{s.college}</label>
                            <select id="college" value={exploreCollege} onChange={(e) => setExploreCollege(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                                    <option value="">{s.select}</option>
                                {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredExploreChannels.map(channel => {
                             const professor = professorMap.get(channel.professorId);
                             return(
                                <div key={channel.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-2">{channel.name}</h3>
                                        {professor && (
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                <img src={professor.avatar} alt={professor.name} className="w-6 h-6 rounded-full me-2"/>
                                                <span>{professor.name}</span>
                                            </div>
                                        )}
                                        <p className="text-sm text-gray-500 mb-4">{channel.specialization}</p>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500">
                                                <div className="flex items-center"><UserIcon className="w-4 h-4 me-1"/> {channel.subscribers}</div>
                                                <div className="flex items-center"><BookOpenIcon className="w-4 h-4 me-1"/> {channel.posts.length}</div>
                                            </div>
                                            <button
                                                onClick={() => handleChannelClick(channel)}
                                                className={`px-4 py-2 rounded-md text-sm font-semibold ${user.subscribedChannels.includes(channel.id) ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-primary-500 hover:bg-primary-600 text-white'}`}
                                            >
                                                {user.subscribedChannels.includes(channel.id) ? s.subscribed : s.subscribe}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                     {filteredExploreChannels.length === 0 && exploreUniversity && exploreCollege && (
                        <p className="text-center text-gray-500 mt-8">No channels found for the selected university and college.</p>
                     )}
                </div>
            );
        }

        if (activeTab === 'my-channels') {
            if (selectedChannel) {
                return <ChannelView channel={selectedChannel} user={user} onBack={handleBackFromChannel} />;
            }
            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
                    <BookOpenIcon className="w-16 h-16 mb-4" />
                    <h2 className="text-xl font-semibold">Select one of your channels</h2>
                    <p>Or browse available channels to subscribe.</p>
                </div>
            );
        }

        return null;
    };

    return (
         <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Top Navigation for Desktop */}
            <nav className="hidden md:flex items-center justify-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <button onClick={() => handleSelectTab('my-channels')} className={`p-4 text-sm font-medium flex items-center gap-2 ${activeTab === 'my-channels' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                    <BookOpenIcon className="w-5 h-5"/> {s.myChannels}
                </button>
                <button onClick={() => handleSelectTab('explore')} className={`p-4 text-sm font-medium flex items-center gap-2 ${activeTab === 'explore' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                    <CompassIcon className="w-5 h-5"/> {s.explore}
                </button>
                <button onClick={() => handleSelectTab('dm')} className={`p-4 text-sm font-medium flex items-center gap-2 ${activeTab === 'dm' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                    <MessageSquareIcon className="w-5 h-5"/> {s.directMessages}
                </button>
                <button onClick={() => handleSelectTab('ai')} className={`p-4 text-sm font-medium flex items-center gap-2 ${activeTab === 'ai' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                    <BotIcon className="w-5 h-5"/> {s.jarvisAi}
                </button>
            </nav>

            <div className="relative flex flex-1 overflow-hidden">
                {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" aria-hidden="true"></div>}
                
                {/* Sidebar */}
                <aside className={`fixed top-16 ltr:left-0 rtl:right-0 h-[calc(100vh-4rem)] w-3/4 sm:w-1/2 md:w-1/4 bg-white dark:bg-gray-800 border-e dark:border-gray-700 flex flex-col transform transition-transform duration-300 ease-in-out z-30 md:relative md:top-0 md:h-full md:translate-x-0 ${isSidebarOpen ? 'ltr:translate-x-0 rtl:-translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'}`}>
                    <button onClick={() => setSidebarOpen(false)} className="absolute top-4 end-4 p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden" aria-label="Close sidebar">
                        <XIcon className="w-6 h-6"/>
                    </button>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover"/>
                            <div>
                                <h3 className="font-bold text-lg">{user.name}</h3>
                                <p className="text-sm text-gray-500">{user.college}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs for Mobile */}
                    <div className="flex flex-col sm:flex-row border-b border-gray-200 dark:border-gray-700 md:hidden">
                        <button onClick={() => handleSelectTab('my-channels')} className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'my-channels' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>
                            <BookOpenIcon className="w-5 h-5"/> {s.myChannels}
                        </button>
                        <button onClick={() => handleSelectTab('explore')} className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'explore' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>
                            <CompassIcon className="w-5 h-5"/> {s.explore}
                        </button>
                        <button onClick={() => handleSelectTab('dm')} className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'dm' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>
                            <MessageSquareIcon className="w-5 h-5"/> {s.directMessages}
                        </button>
                        <button onClick={() => handleSelectTab('ai')} className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>
                            <BotIcon className="w-5 h-5"/> {s.jarvisAi}
                        </button>
                    </div>
                    
                    <nav className="flex-1 overflow-y-auto p-2">
                        {activeTab === 'my-channels' && channels.filter(ch => user.subscribedChannels.includes(ch.id)).map(channel => (
                            <a key={channel.id} href="#" onClick={(e) => { e.preventDefault(); handleChannelClick(channel); }} className={`block px-4 py-2 md:py-3 my-1 rounded-md text-sm font-medium ${selectedChannel?.id === channel.id ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                {channel.name}
                            </a>
                        ))}
                        {activeTab === 'my-channels' && channels.filter(ch => user.subscribedChannels.includes(ch.id)).length === 0 && (
                            <p className="p-4 text-center text-gray-500">You are not subscribed to any channels yet.</p>
                        )}
                    </nav>
                </aside>

                <main className="w-full flex-1 bg-gray-100 dark:bg-gray-900 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-gray-100 dark:bg-gray-900 z-10 md:hidden">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Open sidebar">
                            <MenuIcon className="w-6 h-6"/>
                        </button>
                    </div>
                    {renderContent()}
                </main>
                
                {showSubscriptionModal && (
                    <SubscriptionModal 
                        channel={showSubscriptionModal} 
                        onClose={() => setShowSubscriptionModal(null)} 
                        onConfirm={() => {
                            setActiveTab('my-channels');
                            setSelectedChannel(showSubscriptionModal);
                            setShowSubscriptionModal(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
