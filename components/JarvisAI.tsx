import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getLang } from '../constants';
import { SendIcon, BotIcon, ClipboardIcon, CheckIcon, PaperclipIcon, XIcon, FileTextIcon } from './icons/IconComponents';

const JarvisAI: React.FC = () => {
    const { language, jarvisHistory, sendJarvisMessage } = useApp();
    const s = getLang(language);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Cleanup blob URLs to prevent memory leaks
        return () => {
            if (filePreview) {
                URL.revokeObjectURL(filePreview);
            }
        };
    }, [filePreview]);

    useEffect(scrollToBottom, [jarvisHistory]);
    
    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedMessageId(id);
            setTimeout(() => setCopiedMessageId(null), 2000);
        });
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachedFile(file);
            if (file.type.startsWith('image/')) {
                const previewUrl = URL.createObjectURL(file);
                setFilePreview(previewUrl);
            } else {
                setFilePreview(null);
            }
        }
    };

    const handleRemoveFile = () => {
        setAttachedFile(null);
        if (filePreview) {
            URL.revokeObjectURL(filePreview);
            setFilePreview(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };


    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && !attachedFile) || isLoading) return;

        setIsLoading(true);
        await sendJarvisMessage(input.trim(), attachedFile || undefined);
        setInput('');
        handleRemoveFile();
        setIsLoading(false);
    };

    return (
        <div className="p-4 sm:p-6 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-full">
                    <BotIcon className="w-8 h-8 text-primary-600 dark:text-primary-300" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">{s.jarvisAi}</h2>
                    <p className="text-sm text-gray-500">{s.jarvisDescription}</p>
                </div>
            </div>
            
            <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-4 overflow-y-auto mb-4">
                <div className="space-y-4">
                    {jarvisHistory.map((msg) => (
                        <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'jarvis' && <BotIcon className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />}
                            <div className={`relative group max-w-xl p-3 rounded-lg whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-primary-500 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 rounded-bl-none'}`}>
                                {msg.file && (
                                    <div className="mb-2">
                                        {msg.file.type.startsWith('image/') ? (
                                            <img src={msg.file.url} alt={msg.file.name} className="max-w-xs max-h-48 rounded-md object-cover"/>
                                        ) : (
                                            <div className="flex items-center gap-2 p-2 bg-black/10 dark:bg-white/10 rounded-md">
                                                <FileTextIcon className="w-6 h-6 flex-shrink-0"/>
                                                <span className="text-sm font-medium truncate">{msg.file.name}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {msg.text}
                                {msg.sender === 'jarvis' && (
                                    <button
                                        onClick={() => handleCopy(msg.text, msg.id)}
                                        className="absolute top-2 end-2 p-1 rounded-md text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 hover:text-gray-800 dark:hover:text-gray-200"
                                        title={copiedMessageId === msg.id ? s.copied : s.copy}
                                    >
                                        {copiedMessageId === msg.id ? (
                                            <CheckIcon className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <ClipboardIcon className="w-4 h-4" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3">
                            <BotIcon className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
                            <div className="max-w-xl p-3 rounded-lg bg-gray-100 dark:bg-gray-700 rounded-bl-none">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            
            {attachedFile && (
                <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                         {filePreview ? (
                            <img src={filePreview} alt="preview" className="w-10 h-10 rounded object-cover flex-shrink-0"/>
                         ) : (
                            <FileTextIcon className="w-8 h-8 text-gray-500 flex-shrink-0"/>
                         )}
                        <span className="text-sm font-medium truncate">{attachedFile.name}</span>
                    </div>
                    <button onClick={handleRemoveFile} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <XIcon className="w-4 h-4"/>
                    </button>
                </div>
            )}

            <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,application/pdf"
                />
                 <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="p-3 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                    <PaperclipIcon className="w-5 h-5"/>
                </button>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={s.askJarvis}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button 
                    type="submit" 
                    disabled={isLoading || (!input.trim() && !attachedFile)}
                    className="p-3 rounded-full bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900"
                >
                    <SendIcon className="w-5 h-5"/>
                </button>
            </form>
        </div>
    );
};

export default JarvisAI;