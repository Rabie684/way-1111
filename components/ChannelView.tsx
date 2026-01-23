import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Channel, User, UserRole, PostType, Section, Post } from '../types';
import ChatWindow from './ChatWindow';
import SubscriptionModal from './SubscriptionModal';
import { getLang } from '../constants';
import { useApp } from '../context/AppContext';
import { ArrowLeftIcon, FileTextIcon, ImageIcon, VideoIcon, UploadCloudIcon, TrashIcon, DownloadIcon, CheckCircleIcon, LoaderIcon, UsersIcon, MessageSquareIcon, SlashIcon, ChevronDownIcon, LinkIcon } from './icons/IconComponents';
import ConfirmationModal from './ConfirmationModal';
import AddPostModal from './AddPostModal';


interface ChannelViewProps {
    channel: Channel;
    user: User;
    onBack: () => void;
    onStartDirectMessage: (user: User) => void;
}

const PostIcon: React.FC<{ type: PostType }> = ({ type }) => {
    switch (type) {
        case PostType.PDF: return <FileTextIcon className="w-6 h-6 text-red-500" />;
        case PostType.Image: return <ImageIcon className="w-6 h-6 text-blue-500" />;
        case PostType.Video: return <VideoIcon className="w-6 h-6 text-green-500" />;
        case PostType.Link: return <LinkIcon className="w-6 h-6 text-purple-500" />;
        default: return null;
    }
};

const ChannelView: React.FC<ChannelViewProps> = ({ channel, user, onBack, onStartDirectMessage }) => {
    const { s, allUsers, sections, addPostFromFile, isUploadingPost, clearChannelChat, deletePostFromChannel, offlinePostIds, downloadPostForOffline, removePostFromOffline, blockUserFromChannel } = useApp();
    const [activeTab, setActiveTab] = useState<'posts' | 'chat'>('posts');
    const [showSubscriptionModal, setShowSubscriptionModal] = useState<Section | null>(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [postToDelete, setPostToDelete] = useState<Post | null>(null);
    const [downloadingPosts, setDownloadingPosts] = useState<Set<string>>(new Set());
    const [subscribersDropdownOpen, setSubscribersDropdownOpen] = useState(false);
    const [userToBlock, setUserToBlock] = useState<User | null>(null);
    const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
    const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);
    const [largeFileInfo, setLargeFileInfo] = useState<{name: string, size: number} | null>(null);

    const subscribersDropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (subscribersDropdownRef.current && !subscribersDropdownRef.current.contains(event.target as Node)) {
                setSubscribersDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const handleUploadClick = () => {
        if (isUploadingPost) return;
        fileInputRef.current?.click();
    };
    
    const handleOpenAddLinkModal = () => {
        setLargeFileInfo(null);
        setIsAddPostModalOpen(true);
    };
    
    const handleCloseAddPostModal = () => {
        setIsAddPostModalOpen(false);
        setLargeFileInfo(null);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const MAX_DIRECT_UPLOAD_MB = 30;
            if (file.size < MAX_DIRECT_UPLOAD_MB * 1024 * 1024) {
                await addPostFromFile(channel.id, file);
            } else {
                setLargeFileInfo({ name: file.name, size: file.size });
                setIsAddPostModalOpen(true);
            }
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleConfirmClearChat = () => {
        clearChannelChat(channel.id);
        setShowClearConfirm(false);
    };
    
    const handleConfirmDelete = () => {
        if (postToDelete) {
            deletePostFromChannel(channel.id, postToDelete.id);
            setPostToDelete(null);
        }
    };

    const handleDownload = async (post: Post) => {
        setDownloadingPosts(prev => new Set(prev).add(post.id));
        await downloadPostForOffline(post);
        setDownloadingPosts(prev => {
            const next = new Set(prev);
            next.delete(post.id);
            return next;
        });
    };
    
    const handleRemoveOffline = async (post: Post) => {
        await removePostFromOffline(post);
    };

    const handleConfirmBlock = () => {
        if(userToBlock) {
            blockUserFromChannel(userToBlock.id, channel.id);
            setUserToBlock(null);
        }
    }

    const channelSections = useMemo(() => sections.filter(sec => sec.channelId === channel.id), [sections, channel.id]);
    const channelSectionIds = useMemo(() => new Set(channelSections.map(s => s.id)), [channelSections]);

    const subscribedStudents = useMemo(() => 
        allUsers.filter(u => 
            u.role === UserRole.Student &&
            u.subscribedSections.some(secId => channelSectionIds.has(secId)) &&
            !channel.blockedUsers.includes(u.id)
        ), 
    [allUsers, channelSectionIds, channel.blockedUsers]);

    const isOwner = user.role === UserRole.Professor && user.id === channel.professorId;
    
    const isSubscribedToChannel = isOwner || 
        (channelSections.some(sec => user.subscribedSections.includes(sec.id)) && !channel.blockedUsers.includes(user.id));
    
    const professor = allUsers.find(u => u.id === channel.professorId);


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
                    {professor && <>
                        <img src={professor.avatar} alt={professor.name} className="w-6 h-6 rounded-full me-2"/>
                        <span>{professor.name}</span>
                    </>}
                     {isOwner && (
                        <div className="relative ms-4" ref={subscribersDropdownRef}>
                            <button onClick={() => setSubscribersDropdownOpen(!subscribersDropdownOpen)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                <UsersIcon className="w-4 h-4" />
                                <span>{subscribedStudents.length} {s.subscribers}</span>
                            </button>
                            {subscribersDropdownOpen && (
                                <div className="absolute top-full start-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                                    <div className="p-1 max-h-60 overflow-y-auto">
                                        {subscribedStudents.length > 0 ? subscribedStudents.map(student => (
                                             <div key={student.id} className="py-1">
                                                <div 
                                                    className="flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md"
                                                    onClick={() => {
                                                        setExpandedStudentId(prev => prev === student.id ? null : student.id);
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                                        <div className="overflow-hidden">
                                                            <p className="text-sm font-medium truncate">{student.name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{student.university}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${expandedStudentId === student.id ? 'rotate-180' : ''}`} />
                                                </div>
                                                {expandedStudentId === student.id && (
                                                    <div className="flex items-center justify-end pt-2 px-2 space-x-2 rtl:space-x-reverse">
                                                        <button 
                                                            onClick={() => onStartDirectMessage(student)} 
                                                            className="flex items-center gap-1.5 px-3 py-1 text-sm rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors" 
                                                            title={s.message}
                                                        >
                                                            <MessageSquareIcon className="w-4 h-4" />
                                                            <span>{s.message}</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => setUserToBlock(student)} 
                                                            className="flex items-center gap-1.5 px-3 py-1 text-sm rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors" 
                                                            title={s.block}
                                                        >
                                                            <SlashIcon className="w-4 h-4" />
                                                            <span>{s.block}</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )) : <p className="p-4 text-center text-gray-500 text-sm">No subscribers yet.</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
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
            
            {isAddPostModalOpen && (
                <AddPostModal
                    channelId={channel.id}
                    onClose={handleCloseAddPostModal}
                    largeFileInfo={largeFileInfo}
                />
            )}

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
                                {isOwner && (
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div 
                                            onClick={handleUploadClick} 
                                            className={`bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center transition flex flex-col justify-center items-center min-h-[160px] ${isUploadingPost ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-primary-500 dark:hover:border-primary-500'}`}
                                        >
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" disabled={isUploadingPost} accept="image/*,video/*,application/pdf" />
                                            {isUploadingPost ? (
                                                <>
                                                    <LoaderIcon className="w-12 h-12 mx-auto text-primary-500"/>
                                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">جاري الرفع...</p>
                                                </>
                                            ) : (
                                                <>
                                                    <UploadCloudIcon className="w-12 h-12 mx-auto text-gray-400"/>
                                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{s.addFileOr} <span className="font-medium text-primary-600 hover:text-primary-500">{s.upload}</span></p>
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">الرفع المباشر حتى 30 ميغابايت.</p>
                                                </>
                                            )}
                                        </div>
                                        <div 
                                            onClick={handleOpenAddLinkModal}
                                            className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center transition cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 flex flex-col justify-center items-center min-h-[160px]"
                                        >
                                            <LinkIcon className="w-12 h-12 mx-auto text-gray-400"/>
                                            <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">{s.addLinkPost}</p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{s.addLinkPostDescription}</p>
                                        </div>
                                    </div>
                                )}
                                {channel.posts.map(post => {
                                    const isOffline = offlinePostIds.has(post.id);
                                    const isDownloading = downloadingPosts.has(post.id);
                                    return (
                                        <div key={post.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center justify-between gap-4">
                                            <div className="flex items-center overflow-hidden flex-1">
                                                <PostIcon type={post.type} />
                                                <div className="ms-4 overflow-hidden">
                                                    <a href={post.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline truncate block">{post.title}</a>
                                                    <p className="text-xs text-gray-500">Posted on {post.createdAt}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center flex-shrink-0 gap-2">
                                                {post.type === PostType.Image && <img src={post.url} alt={post.title} className="w-24 h-12 object-cover rounded hidden sm:block"/>}
                                                
                                                {post.type === PostType.Link || post.url.includes('google.com') ? null : isDownloading ? (
                                                    <div className="p-2 text-gray-400" title="Downloading...">
                                                        <LoaderIcon className="w-5 h-5" />
                                                    </div>
                                                ) : isOffline ? (
                                                    <button
                                                        onClick={() => handleRemoveOffline(post)}
                                                        className="p-2 flex items-center gap-1 text-green-600 dark:text-green-400 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50"
                                                        title={s.removeFromOffline}
                                                    >
                                                        <CheckCircleIcon className="w-5 h-5" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDownload(post)}
                                                        className="p-2 text-gray-400 hover:text-primary-500 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/50"
                                                        title={s.downloadForOffline}
                                                    >
                                                        <DownloadIcon className="w-5 h-5" />
                                                    </button>
                                                )}

                                                {isOwner && (
                                                    <button
                                                        onClick={() => setPostToDelete(post)}
                                                        className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                                                        title={s.deletePost}
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
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
                <ConfirmationModal
                    title={s.clearChatConfirmTitle}
                    message={s.clearChatConfirmMessage}
                    onClose={() => setShowClearConfirm(false)}
                    onConfirm={handleConfirmClearChat}
                />
            )}
             {postToDelete && (
                 <ConfirmationModal
                    title={s.deletePostConfirmTitle}
                    message={s.deletePostConfirmMessage}
                    onClose={() => setPostToDelete(null)}
                    onConfirm={handleConfirmDelete}
                />
            )}
            {userToBlock && (
                <ConfirmationModal
                    title={s.blockUserConfirmTitle}
                    message={s.blockUserConfirmMessage.replace('{userName}', userToBlock.name)}
                    onClose={() => setUserToBlock(null)}
                    onConfirm={handleConfirmBlock}
                />
            )}
        </div>
    );
};

export default ChannelView;