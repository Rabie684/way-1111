
import React, { useState, useMemo, useRef, useEffect } from 'react';

interface AutocompleteInputProps {
    options: string[];
    value: string;
    onValueChange: (value: string) => void;
    id: string;
    placeholder?: string;
    required?: boolean;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ options, value, onValueChange, id, placeholder, required }) => {
    const [inputValue, setInputValue] = useState(value);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredSuggestions = useMemo(() => {
        if (!inputValue) {
            return [];
        }
        return options.filter(option =>
            option.toLowerCase().includes(inputValue.toLowerCase())
        );
    }, [inputValue, options]);
    
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (selectedValue: string) => {
        setInputValue(selectedValue);
        onValueChange(selectedValue);
        setShowSuggestions(false);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        onValueChange(e.target.value);
        setShowSuggestions(true);
    };

    return (
        <div ref={containerRef} className="relative">
            <input
                id={id}
                type="text"
                value={inputValue}
                onChange={handleChange}
                onFocus={() => setShowSuggestions(true)}
                placeholder={placeholder}
                required={required}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                autoComplete="off"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredSuggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(suggestion)}
                            className="cursor-pointer select-none relative py-2 px-4 text-gray-900 dark:text-gray-200 hover:bg-primary-100 dark:hover:bg-primary-900/50"
                        >
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: suggestion.replace(new RegExp(`(${inputValue})`, 'gi'), '<strong>$1</strong>')
                                }}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutocompleteInput;
