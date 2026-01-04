
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getLang } from '../constants';
import { Channel } from '../types';
import ChannelView from './ChannelView';
import AiTranslator from './AiTranslator';
import CreateChannelModal from './CreateChannelModal';
import DirectMessagesView from './DirectMessagesView';
import { BookOpenIcon, MessageSquareIcon, BotIcon, PlusCircleIcon, StarIcon } from './icons/IconComponents';

const ProfessorDashboard: React.FC = () => {
    const { user, channels, language } = useApp();
    const s = getLang(language);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [activeTab, setActiveTab] = useState<'channel' | 'dm' | 'ai'>('channel');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const professorChannels = channels.filter(ch => ch.professorId === user?.id);
    const totalStars = professorChannels.reduce((acc, ch) => acc + ch.subscribers * 5, 0);

    const renderContent = () => {
        if (activeTab === 'ai') {
            return <AiTranslator />;
        }
        if (activeTab === 'dm') {
            return <DirectMessagesView />;
        }
        if (selectedChannel) {
            return <ChannelView channel={selectedChannel} user={user!} onBack={() => setSelectedChannel(null)} />;
        }
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <BookOpenIcon className="w-16 h-16 mb-4" />
                <h2 className="text-xl font-semibold">Select a channel to view its content</h2>
                <p>or create a new channel to get started.</p>
            </div>
        );
    };

    if (!user) return null;

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Sidebar */}
            <aside className="w-1/4 bg-white dark:bg-gray-800 border-e border-gray-200 dark:border-gray-700 flex flex-col">
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

                {/* Navigation Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                     <button onClick={() => { setActiveTab('channel'); setSelectedChannel(null); }} className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'channel' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>
                        <BookOpenIcon className="w-5 h-5"/> {s.myChannels}
                    </button>
                    <button onClick={() => { setActiveTab('dm'); setSelectedChannel(null); }} className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'dm' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>
                        <MessageSquareIcon className="w-5 h-5"/> {s.directMessages}
                    </button>
                    <button onClick={() => { setActiveTab('ai'); setSelectedChannel(null); }} className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>
                        <BotIcon className="w-5 h-5"/> {s.aiTranslator}
                    </button>
                </div>
                
                <nav className="flex-1 overflow-y-auto p-2">
                    {activeTab === 'channel' && professorChannels.map(channel => (
                        <a key={channel.id} href="#" onClick={(e) => { e.preventDefault(); setSelectedChannel(channel); }} className={`block px-4 py-2 my-1 rounded-md text-sm font-medium ${selectedChannel?.id === channel.id ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                            {channel.name}
                        </a>
                    ))}
                    {activeTab === 'channel' && professorChannels.length === 0 && (
                        <p className="p-4 text-center text-gray-500">You have not created any channels yet.</p>
                    )}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="w-3/4 bg-gray-100 dark:bg-gray-900 overflow-y-auto">
                {renderContent()}
            </main>

            {isModalOpen && <CreateChannelModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default ProfessorDashboard;