import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface TermsOfServiceModalProps {
    role: UserRole;
    onClose: () => void;
    onAgree: () => void;
}

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ role, onClose, onAgree }) => {
    const { s } = useApp();

    const isProfessor = role === UserRole.Professor;
    const title = isProfessor ? s.professorCharterTitle : s.studentCharterTitle;
    const rules = isProfessor ? s.professorCharterRules : s.studentCharterRules;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg m-4 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold">{s.termsAndConditions}</h2>
                </div>
                <div className="p-6 flex-1 overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4 text-primary-600 dark:text-primary-400">{title}</h3>
                    <ul className="space-y-3 list-disc list-inside text-gray-600 dark:text-gray-300">
                        {rules.map((rule, index) => (
                            <li key={index}>{rule}</li>
                        ))}
                    </ul>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-4 rtl:space-x-reverse">
                    <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white dark:text-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500">
                        {s.cancel}
                    </button>
                    <button onClick={onAgree} className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700">
                        {s.agree}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsOfServiceModal;
