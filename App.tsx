
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import ProfessorDashboard from './components/ProfessorDashboard';
import StudentDashboard from './components/StudentDashboard';
import WelcomeToast from './components/WelcomeToast';
import { UserRole } from './types';
import { getLang } from './constants';

const AppContent: React.FC = () => {
    const { user, theme, language } = useApp();
    const [showWelcome, setShowWelcome] = useState(false);

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

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans">
            {user && <WelcomeToast message={`${getLang(language).welcomeBack} ${user.name}!`} show={showWelcome} />}
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