

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import ProfessorDashboard from './components/ProfessorDashboard';
import StudentDashboard from './components/StudentDashboard';
import WelcomeToast from './components/WelcomeToast';
import InstallPWAModal from './components/InstallPWAModal';
import HalEye from './components/HalEye';
import { UserRole, Gender } from './types';
import { getLang } from './constants';

const AppContent: React.FC = () => {
    const { user, theme, language, s } = useApp();
    const [showWelcome, setShowWelcome] = useState(false);
    const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

    useEffect(() => {
        document.documentElement.className = theme;
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [theme, language]);

    useEffect(() => {
        if (user) {
            setShowWelcome(true);
            const timer = setTimeout(() => setShowWelcome(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    useEffect(() => {
        const handler = (e: Event) => {
          e.preventDefault();
          setInstallPrompt(e);
        };
    
        window.addEventListener('beforeinstallprompt', handler);
    
        // Also listen for the appinstalled event
        const appInstalledHandler = () => {
          setInstallPrompt(null);
          console.log('PWA was installed');
        };
    
        window.addEventListener('appinstalled', appInstalledHandler);
    
        return () => {
          window.removeEventListener('beforeinstallprompt', handler);
          window.removeEventListener('appinstalled', appInstalledHandler);
        };
      }, []);

    const getWelcomeMessage = (): string => {
        if (!user) return '';
        if (language !== 'ar') {
            return `${s.welcomeBack} ${user.name}!`;
        }
    
        const welcome = user.gender === Gender.Female ? s.welcomeGreetingFemale : s.welcomeGreetingMale;
        let title = '';
        if (user.role === UserRole.Professor) {
            title = user.gender === Gender.Female ? s.professorFemaleTitle : s.professorMaleTitle;
        } else {
            title = user.gender === Gender.Female ? s.studentFemaleTitle : s.studentMaleTitle;
        }
        return `${welcome} ${title} ${user.name}!`;
    };


    return (
        <div className="bg-gray-200 dark:bg-black text-gray-900 dark:text-gray-100 min-h-screen font-sans">
            <HalEye />
            {user && <WelcomeToast message={getWelcomeMessage()} show={showWelcome} />}
            {installPrompt && <InstallPWAModal installPrompt={installPrompt} onClose={() => setInstallPrompt(null)} />}
            {user ? (
                <main>
                    {user.role === UserRole.Professor && <ProfessorDashboard />}
                    {user.role === UserRole.Student && <StudentDashboard />}
                </main>
            ) : (
                <Login />
            )}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

export default App;