
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getLang } from '../constants';
import { SunIcon, MoonIcon, UserIcon, LogOutIcon } from './icons/IconComponents';
import ProfileSettingsModal from './ProfileSettingsModal';

const Header: React.FC = () => {
    const { user, logout, theme, toggleTheme, language, setLanguage } = useApp();
    const s = getLang(language);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <>
            <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">{s.appName}</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Language Selector */}
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as 'ar' | 'en' | 'fr')}
                                className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="en">English</option>
                                <option value="fr">Français</option>
                                <option value="ar">العربية</option>
                            </select>

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                aria-label={theme === 'light' ? s.darkMode : s.lightMode}
                            >
                                {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                            </button>

                            {/* Profile Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2">
                                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-primary-500" />
                                    <span className="hidden sm:inline font-medium">{user.name}</span>
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute end-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                                        <button onClick={() => { setSettingsOpen(true); setDropdownOpen(false); }} className="w-full text-start flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <UserIcon className="w-4 h-4 me-3" />
                                            {s.profileSettings}
                                        </button>
                                        <button onClick={logout} className="w-full text-start flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <LogOutIcon className="w-4 h-4 me-3" />
                                            {s.logout}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            {settingsOpen && <ProfileSettingsModal onClose={() => setSettingsOpen(false)} />}
        </>
    );
};

export default Header;
