
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getLang } from '../constants';
import { SunIcon, MoonIcon, UserIcon, LogOutIcon, BellIcon } from './icons/IconComponents';
import ProfileSettingsModal from './ProfileSettingsModal';

const Header: React.FC = () => {
    const { user, logout, theme, toggleTheme, language, setLanguage, notifications, markNotificationsAsRead } = useApp();
    const s = getLang(language);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    
    const profileDropdownRef = useRef<HTMLDivElement>(null);
    const notifDropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setProfileDropdownOpen(false);
            }
            if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
                setNotifDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const handleNotifClick = () => {
        setNotifDropdownOpen(!notifDropdownOpen);
        if(!notifDropdownOpen && unreadCount > 0) {
            // A small delay gives a better UX
            setTimeout(() => markNotificationsAsRead(), 1000);
        }
    }


    if (!user) return null;

    return (
        <>
            <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">{s.appName}</h1>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4">
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
                            
                            {/* Notifications Dropdown */}
                            <div className="relative" ref={notifDropdownRef}>
                                <button onClick={handleNotifClick} className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    <BellIcon className="w-5 h-5"/>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                    )}
                                </button>
                                {notifDropdownOpen && (
                                     <div className="absolute end-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                                        <div className="p-3 font-semibold border-b border-gray-200 dark:border-gray-700">{s.notifications}</div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length > 0 ? notifications.map(notif => (
                                                <div key={notif.id} className={`p-3 text-sm border-b border-gray-200 dark:border-gray-700/50 ${!notif.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                                                    <p>{notif.text}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{notif.timestamp}</p>
                                                </div>
                                            )) : (
                                                <p className="p-4 text-center text-gray-500">{s.noNotifications}</p>
                                            )}
                                        </div>
                                     </div>
                                )}
                            </div>


                            {/* Profile Dropdown */}
                            <div className="relative" ref={profileDropdownRef}>
                                <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="flex items-center space-x-2">
                                    <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-primary-500" />
                                    <span className="hidden sm:inline font-medium">{user.name}</span>
                                </button>
                                {profileDropdownOpen && (
                                    <div className="absolute end-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                                        <button onClick={() => { setSettingsOpen(true); setProfileDropdownOpen(false); }} className="w-full text-start flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
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