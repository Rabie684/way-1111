
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, Gender } from '../types';
import { UNIVERSITIES, COLLEGES, getLang } from '../constants';
import TermsOfServiceModal from './TermsOfServiceModal';
import AutocompleteInput from './AutocompleteInput';

const Login: React.FC = () => {
    const { login, register, language } = useApp();
    const s = getLang(language);
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.Student);
    const [gender, setGender] = useState<Gender>(Gender.Male);
    const [university, setUniversity] = useState('');
    const [college, setCollege] = useState('');
    const [loading, setLoading] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isRegister) {
            setShowTermsModal(true);
        } else {
            setLoading(true);
            await login({ email, password });
            setLoading(false);
        }
    };

    const handleRegistration = async () => {
        setShowTermsModal(false);
        setLoading(true);
        await register({
            email,
            password,
            role,
            name,
            gender,
            university,
            college,
        });
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-primary-600 dark:text-primary-400">{s.appName}</h1>
                
                <div className="flex border-b border-gray-300 dark:border-gray-600">
                    <button 
                        onClick={() => setIsRegister(false)}
                        className={`w-1/2 py-2 font-medium transition-colors ${!isRegister ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        {s.login}
                    </button>
                    <button 
                        onClick={() => setIsRegister(true)}
                        className={`w-1/2 py-2 font-medium transition-colors ${isRegister ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        {s.register}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {isRegister && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{s.fullName}</label>
                            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{s.email}</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{s.password}</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>

                    {isRegister && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{s.role}</label>
                                    <select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                                        <option value={UserRole.Student}>{s.student}</option>
                                        <option value={UserRole.Professor}>{s.professor}</option>
                                    </select>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{s.gender}</label>
                                    <div className="mt-1 flex justify-around p-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                                        <label className={`cursor-pointer px-4 py-1 text-sm rounded-md transition-colors ${gender === Gender.Male ? 'bg-primary-500 text-white' : ''}`}>
                                            <input type="radio" name="gender" value={Gender.Male} checked={gender === Gender.Male} onChange={() => setGender(Gender.Male)} className="sr-only" />
                                            {s.male}
                                        </label>
                                        <label className={`cursor-pointer px-4 py-1 text-sm rounded-md transition-colors ${gender === Gender.Female ? 'bg-primary-500 text-white' : ''}`}>
                                            <input type="radio" name="gender" value={Gender.Female} checked={gender === Gender.Female} onChange={() => setGender(Gender.Female)} className="sr-only" />
                                            {s.female}
                                        </label>
                                    </div>
                                </div>
                            </div>
                           
                            <div>
                                <label htmlFor="university" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{s.university}</label>
                                <AutocompleteInput
                                    id="university"
                                    options={UNIVERSITIES}
                                    value={university}
                                    onValueChange={setUniversity}
                                    placeholder={s.select}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="college" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{s.college}</label>
                                <AutocompleteInput
                                    id="college"
                                    options={COLLEGES}
                                    value={college}
                                    onValueChange={setCollege}
                                    placeholder={s.select}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 disabled:opacity-50">
                        {loading ? '...' : (isRegister ? s.register : s.login)}
                    </button>
                </form>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">{s.orTryDemo}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <button 
                        type="button"
                        onClick={() => login({ email: '', role: UserRole.Student, isDemo: true })}
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                    >
                        {s.demoStudent}
                    </button>
                    <button 
                        type="button"
                        onClick={() => login({ email: '', role: UserRole.Professor, isDemo: true })}
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                    >
                        {s.demoProfessor}
                    </button>
                </div>
            </div>
            {showTermsModal && (
                <TermsOfServiceModal
                    role={role}
                    onClose={() => setShowTermsModal(false)}
                    onAgree={handleRegistration}
                />
            )}
        </div>
    );
};

export default Login;