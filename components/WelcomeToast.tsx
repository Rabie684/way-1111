
import React from 'react';

interface WelcomeToastProps {
    message: string;
    show: boolean;
}

const WelcomeToast: React.FC<WelcomeToastProps> = ({ message, show }) => {
    return (
        <div 
            className={`fixed top-20 right-1/2 translate-x-1/2 p-4 rounded-md shadow-lg text-white bg-primary-500 transition-all duration-300 ease-in-out z-50 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
            style={{ transitionProperty: 'opacity, transform' }}
            aria-live="assertive"
        >
            {message}
        </div>
    );
};

export default WelcomeToast;
