
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import ProfessorDashboard from './components/ProfessorDashboard';
import StudentDashboard from './components/StudentDashboard';
import Header from './components/Header';
import { UserRole } from './types';

const AppContent: React.FC = () => {
    const { user, theme, language } = useApp();

    React.useEffect(() => {
        document.documentElement.className = theme;
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [theme, language]);

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen font-sans">
            {user ? (
                <>
                    <Header />
                    <main>
                        {user.role === UserRole.Professor && <ProfessorDashboard />}
                        {user.role === UserRole.Student && <StudentDashboard />}
                    </main>
                </>
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
