
import React, { useState, useRef } from 'react';
import { Channel, User, UserRole, PostType, Section } from '../types';
import ChatWindow from './ChatWindow';
import SubscriptionModal from './SubscriptionModal';
import { getLang, MOCK_PROFESSOR } from '../constants';
import { useApp } from '../context/AppContext';
import { ArrowLeftIcon, FileTextIcon, ImageIcon, VideoIcon, UploadCloudIcon, TrashIcon } from './icons/IconComponents';

interface ChannelViewProps {
    channel: Channel;
    user: User;
    onBack: () => void;
}

const PostIcon: React.FC<{ type: PostType }> = ({ type }) => {
    switch (type) {
        case PostType.PDF: return <FileTextIcon className="w-6 h-6 text-red-500" />;
        case PostType.Image: return <ImageIcon className="w-6 h-6 text-blue-500" />;
        case PostType.Video: return <VideoIcon className="w-6 h-6 text-green-500" />;
        default: return null;
    }
};

const ChannelView: React.FC<ChannelViewProps> = ({ channel, user, onBack }) => {
    const { language, addPostToChannel, sections, clearChannelChat } = useApp();
    const s = getLang(language);
    const [activeTab, setActiveTab] = useState<'posts' | 'chat'>('posts');
    const [showSubscriptionModal, setShowSubscriptionModal] = useState<Section | null>(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            addPostToChannel(channel.id, file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleConfirmClearChat = () => {
        clearChannelChat(channel.id);
        setShowClearConfirm(false);
    };

    const channelSections = sections.filter(sec => sec.channelId === channel.id);
    const isSubscribedToChannel = user.role === UserRole.Professor || channelSections.some(sec => user.subscribedSections.includes(sec.id));

    const isOwner = user.role === UserRole.Professor && user.id === channel.professorId;

    const header = (
        <header className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
             <div className="flex items-center gap-4 mb-2">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label={s.back}>
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold">{channel.name}</h2>
                    <p className="text-sm text-gray-500">{channel.specialization}</p>
                </div>
            </div>
            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center text-sm">
                    <img src={MOCK_PROFESSOR.avatar} alt={MOCK_PROFESSOR.name} className="w-6 h-6 rounded-full me-2"/>
                    <span>{MOCK_PROFESSOR.name}</span>
                </div>
                <a href={channel.meetLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                    <VideoIcon className="w-4 h-4 me-1.5"/>
                    {s.googleMeet}
                </a>
            </div>
        </header>
    );

    return (
        <div className="flex flex-col h-full">
            {header}

            {!isSubscribedToChannel && user.role === UserRole.Student ? (
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-center bg-gray-50 dark:bg-gray-900">
                    <h3 className="text-lg font-semibold mb-2">الانضمام إلى قسم</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">للوصول إلى محتوى هذه القناة والمشاركة في الدردشة، يجب عليك الاشتراك في أحد الأقسام التالية.</p>
                    <div className="max-w-md mx-auto space-y-3">
                        {channelSections.map(section => (
                            <div key={section.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                                <span className="font-medium">{section.name}</span>
                                <button onClick={() => setShowSubscriptionModal(section)} className="px-4 py-2 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-md">
                                    {s.subscribe} ({section.price} DZD)
                                </button>
                            </div>
                        ))}
                         {channelSections.length === 0 && <p className="text-gray-500">لا توجد أقسام متاحة في هذه القناة حاليًا.</p>}
                    </div>
                </div>
            ) : (
                <>
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <button onClick={() => setActiveTab('posts')} className={`flex-grow p-3 font-medium text-sm ${activeTab === 'posts' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>{s.posts}</button>
                        <button onClick={() => setActiveTab('chat')} className={`flex-grow p-3 font-medium text-sm ${activeTab === 'chat' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>{s.chat}</button>
                        {isOwner && activeTab === 'chat' && (
                            <div className="flex-shrink-0 flex items-center pe-4">
                                <button
                                    onClick={() => setShowClearConfirm(true)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/50"
                                    title={s.clearChat}
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 overflow-y-auto ${activeTab === 'chat' ? 'p-0' : 'p-4'}`}>
                        {activeTab === 'posts' && (
                            <div className="space-y-4">
                                {user.role === UserRole.Professor && (
                                    <div onClick={handleUploadClick} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition">
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                        <UploadCloudIcon className="w-12 h-12 mx-auto text-gray-400"/>
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Drag & drop files or <span className="font-medium text-primary-600 hover:text-primary-500">{s.upload}</span></p>
                                    </div>
                                )}
                                {channel.posts.map(post => (
                                    <div key={post.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center justify-between">
                                        <div className="flex items-center overflow-hidden">
                                            <PostIcon type={post.type} />
                                            <div className="ms-4 overflow-hidden">
                                                <a href={post.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline truncate block">{post.title}</a>
                                                <p className="text-xs text-gray-500">Posted on {post.createdAt}</p>
                                            </div>
                                        </div>
                                        {post.type === PostType.Image && <img src={post.url} alt={post.title} className="w-32 h-16 object-cover rounded flex-shrink-0"/>}
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === 'chat' && (
                            <div className="h-full">
                                <ChatWindow channelId={channel.id} />
                            </div>
                        )}
                    </div>
                </>
            )}

            {showSubscriptionModal && (
                <SubscriptionModal 
                    section={showSubscriptionModal} 
                    onClose={() => setShowSubscriptionModal(null)} 
                    onConfirm={() => {
                        setShowSubscriptionModal(null);
                    }}
                />
            )}
            {showClearConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4">
                        <div className="p-6 text-center">
                            <h2 className="text-xl font-bold mb-2">{s.clearChatConfirmTitle}</h2>
                            <p className="text-gray-600 dark:text-gray-300">{s.clearChatConfirmMessage}</p>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-center space-x-4 rtl:space-x-reverse">
                            <button onClick={() => setShowClearConfirm(false)} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white dark:text-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500">
                                {s.cancel}
                            </button>
                            <button onClick={handleConfirmClearChat} className="px-6 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700">
                                {s.confirm}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChannelView;