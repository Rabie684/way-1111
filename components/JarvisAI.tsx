

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getLang } from '../constants';
import { SendIcon, BotIcon } from './icons/IconComponents';

const JarvisAI: React.FC = () => {
    const { language, jarvisHistory, sendJarvisMessage } = useApp();
    const s = getLang(language);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [jarvisHistory]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        setIsLoading(true);
        await sendJarvisMessage(input.trim());
        setInput('');
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
                            <div className={`max-w-xl p-3 rounded-lg whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-primary-500 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 rounded-bl-none'}`}>
                                {msg.text}
                                {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                                        <h4 className="text-xs font-bold mb-2 text-gray-500 dark:text-gray-400">المصادر:</h4>
                                        <ol className="list-decimal list-inside space-y-1 text-sm">
                                            {msg.groundingChunks.map((chunk, index) => (
                                                chunk.web?.uri && (
                                                    <li key={index}>
                                                        <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline break-all">
                                                            {chunk.web.title || chunk.web.uri}
                                                        </a>
                                                    </li>
                                                )
                                            ))}
                                        </ol>
                                    </div>
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

            <form onSubmit={handleSend} className="flex items-center gap-3">
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
                    disabled={isLoading}
                    className="p-3 rounded-full bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900"
                >
                    <SendIcon className="w-5 h-5"/>
                </button>
            </form>
        </div>
    );
};

export default JarvisAI;