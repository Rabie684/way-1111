
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getLang } from '../constants';
import { Channel } from '../types';
import ChannelView from './ChannelView';
import JarvisAI from './JarvisAI';
import CreateChannelModal from './CreateChannelModal';
import DirectMessagesView from './DirectMessagesView';
import { BookOpenIcon, MessageSquareIcon, BotIcon, PlusCircleIcon, StarIcon, MenuIcon, XIcon } from './icons/IconComponents';

const ProfessorDashboard: React.FC = () => {
    const { user, channels, language } = useApp();
    const s = getLang(language);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [activeTab, setActiveTab] = useState<'channel' | 'dm' | 'ai'>('channel');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const professorChannels = channels.filter(ch => ch.professorId === user?.id);
    const totalStars = professorChannels.reduce((acc, ch) => acc + ch.subscribers * 5, 0);

    const handleSelectChannel = (channel: Channel) => {
        setActiveTab('channel');
        setSelectedChannel(channel);
        setSidebarOpen(false);
    };

    const handleSelectTab = (tab: 'channel' | 'dm' | 'ai') => {
        // Imperatively clear selected channel when switching to a non-channel tab.
        // This is more robust than a useEffect for this navigation logic.
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
        if (activeTab === 'ai') {
            return <JarvisAI />;
        }
        if (activeTab === 'dm') {
            return <DirectMessagesView />;
        }
        if (activeTab === 'channel') {
            if (selectedChannel) {
                return <ChannelView channel={selectedChannel} user={user!} onBack={handleBackFromChannel} />;
            }
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

    if (!user) return null;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Top Navigation for Desktop */}
            <nav className="hidden md:flex items-center justify-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <button onClick={() => handleSelectTab('channel')} className={`p-4 text-sm font-medium flex items-center gap-2 ${activeTab === 'channel' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                    <BookOpenIcon className="w-5 h-5"/> {s.myChannels}
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
                                <div className="flex items-center text-yellow-500">
                                    <StarIcon className="w-4 h-4 fill-current"/>
                                    <span className="ms-1 font-semibold">{totalStars}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                        >
                            <PlusCircleIcon className="w-5 h-5 me-2" />
                            {s.createChannel}
                        </button>
                    </div>

                    {/* Navigation Tabs for Mobile */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 md:hidden">
                        <button onClick={() => handleSelectTab('channel')} className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'channel' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>
                            <BookOpenIcon className="w-5 h-5"/> {s.myChannels}
                        </button>
                        <button onClick={() => handleSelectTab('dm')} className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'dm' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>
                            <MessageSquareIcon className="w-5 h-5"/> {s.directMessages}
                        </button>
                        <button onClick={() => handleSelectTab('ai')} className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>
                            <BotIcon className="w-5 h-5"/> {s.jarvisAi}
                        </button>
                    </div>
                    
                    <nav className="flex-1 overflow-y-auto p-2">
                        {activeTab === 'channel' && professorChannels.map(channel => (
                            <a key={channel.id} href="#" onClick={(e) => { e.preventDefault(); handleSelectChannel(channel); }} className={`block px-4 py-2 md:py-3 my-1 rounded-md text-sm font-medium ${selectedChannel?.id === channel.id ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                {channel.name}
                            </a>
                        ))}
                        {activeTab === 'channel' && professorChannels.length === 0 && (
                            <p className="p-4 text-center text-gray-500">You have not created any channels yet.</p>
                        )}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="w-full flex-1 bg-gray-100 dark:bg-gray-900 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-gray-100 dark:bg-gray-900 z-10 md:hidden">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Open sidebar">
                            <MenuIcon className="w-6 h-6"/>
                        </button>
                    </div>
                    {renderContent()}
                </main>

                {isModalOpen && <CreateChannelModal onClose={() => setIsModalOpen(false)} />}
            </div>
        </div>
    );
};

export default ProfessorDashboard;
