
import React, { useState } from 'react';
import { translateSummary } from '../services/geminiService';
import { getLang } from '../constants';
import { useApp } from '../context/AppContext';

const AiTranslator: React.FC = () => {
    const { language } = useApp();
    const s = getLang(language);
    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleTranslate = async () => {
        if (!text.trim()) return;
        setIsLoading(true);
        setResult('');
        const translatedText = await translateSummary(text);
        setResult(translatedText);
        setIsLoading(false);
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4">{s.aiTranslator}</h2>
            <p className="text-sm text-gray-500 mb-4">{s.summaryFromAlgerianJournals}</p>
            <div className="flex-1 flex flex-col gap-4">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={s.enterTextToTranslate}
                    className="w-full flex-1 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                    onClick={handleTranslate}
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Translating...' : s.translate}
                </button>
                 <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-3 overflow-y-auto">
                    <h3 className="font-semibold mb-2">{s.translationResult}</h3>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                        </div>
                    ) : (
                        <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{result}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AiTranslator;
