
import React, { useState } from 'react';
import { Channel, User, UserRole, PostType } from '../types';
import ChatWindow from './ChatWindow';
import { getLang, MOCK_PROFESSOR } from '../constants';
import { useApp } from '../context/AppContext';
import { ArrowLeftIcon, FileTextIcon, ImageIcon, VideoIcon, UploadCloudIcon } from './icons/IconComponents';

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
    const { language } = useApp();
    const s = getLang(language);
    const [activeTab, setActiveTab] = useState<'posts' | 'chat'>('posts');

    return (
        <div className="flex flex-col h-full">
            {/* Channel Header */}
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

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <button onClick={() => setActiveTab('posts')} className={`flex-1 p-3 font-medium text-sm ${activeTab === 'posts' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>{s.posts}</button>
                <button onClick={() => setActiveTab('chat')} className={`flex-1 p-3 font-medium text-sm ${activeTab === 'chat' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500'}`}>{s.chat}</button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'posts' && (
                    <div className="space-y-4">
                        {user.role === UserRole.Professor && (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-center">
                                 <UploadCloudIcon className="w-12 h-12 mx-auto text-gray-400"/>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Drag & drop files or</p>
                                <button className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-500">{s.upload}</button>
                            </div>
                        )}
                        {channel.posts.map(post => (
                            <div key={post.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center justify-between">
                                <div className="flex items-center">
                                    <PostIcon type={post.type} />
                                    <div className="ms-4">
                                        <a href={post.url} className="font-medium hover:underline">{post.title}</a>
                                        <p className="text-xs text-gray-500">Posted on {post.createdAt}</p>
                                    </div>
                                </div>
                                {post.type === PostType.Image && <img src={post.url} alt={post.title} className="w-32 h-16 object-cover rounded"/>}
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
        </div>
    );
};

export default ChannelView;