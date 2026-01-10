
import React from 'react';
import { User, Channel, UserRole, PostType, ChannelMessage, Notification, DirectMessage, Section } from './types';

export const UNIVERSITIES = [
    "جامعة ابن خLDون تيارت",
    "جامعة ابن خلدون ملحقة قصر الشلالة",
];

export const COLLEGES = [
    "كلية العلوم الطبيعية و الحياة",
    "كلية العلوم الانسانية",
    "كلية الادب العربي",
    "كلية الحقوق",
    "كلية العلوم الاقتصادية",
];

export const MOCK_PROFESSOR: User = {
    id: 'prof-1',
    name: 'بن الطاهر بختة',
    email: 'bekhta@univ-ibnkhaldoun.dz',
    role: UserRole.Professor,
    university: 'جامعة ابن خلدون ملحقة قصر الشلالة',
    college: 'كلية العلوم الاقتصادية',
    avatar: 'https://picsum.photos/seed/prof2/200',
    subscribedSections: [],
};

export const MOCK_PROFESSOR_2: User = {
    id: 'prof-2',
    name: 'أستاذ تيارت',
    email: 'prof@univ-tiaret.dz',
    role: UserRole.Professor,
    university: 'جامعة ابن خلدون تيارت',
    college: 'كلية الحقوق',
    avatar: 'https://picsum.photos/seed/prof3/200',
    subscribedSections: [],
};

export const MOCK_PROFESSOR_3: User = {
    id: 'prof-3',
    name: 'أستاذ الجلفة',
    email: 'prof@univ-djelfa.dz',
    role: UserRole.Professor,
    university: 'جامعة زيان عاشور الجلفة',
    college: 'كلية العلوم الانسانية',
    avatar: 'https://picsum.photos/seed/prof4/200',
    subscribedSections: [],
};


export const MOCK_STUDENT: User = {
    id: 'student-1',
    name: 'حمر العين ربيع',
    email: 'rabie@student.dz',
    role: UserRole.Student,
    university: 'جامعة ابن خلدون ملحقة قصر الشلالة',
    college: 'كلية العلوم الاقتصادية',
    avatar: 'https://picsum.photos/seed/student2/200',
    subscribedSections: ['sec-1'],
};

export const MOCK_STUDENT_2: User = {
    id: 'student-2',
    name: 'علي أحمد',
    email: 'ali@student.dz',
    role: UserRole.Student,
    university: 'جامعة ابن خلدون تيارت',
    college: 'كلية الحقوق',
    avatar: 'https://picsum.photos/seed/student3/200',
    subscribedSections: ['sec-3'],
};

export const MOCK_ALL_USERS = [MOCK_PROFESSOR, MOCK_PROFESSOR_2, MOCK_PROFESSOR_3, MOCK_STUDENT, MOCK_STUDENT_2];

export const MOCK_CHANNELS: Channel[] = [
    {
        id: 'ch-1',
        name: 'الرياضيات المالية',
        specialization: 'مالية و بنوك',
        professorId: 'prof-1',
        meetLink: 'https://meet.google.com/new',
        posts: [
            { id: 'p-1', type: PostType.PDF, title: 'محاضرة 1 - مقدمة.pdf', url: '#', createdAt: '2024-05-20' },
            { id: 'p-2', type: PostType.Image, title: 'رسم بياني للفائدة المركبة.png', url: 'https://picsum.photos/seed/proc/800/400', createdAt: '2024-05-21' },
            { id: 'p-3', type: PostType.Video, title: 'فيديو: شرح الخصم', url: '#', createdAt: '2024-05-22' },
        ],
        subscribers: 23,
    },
    {
        id: 'ch-2',
        name: 'مبادئ الاقتصاد الجزئي',
        specialization: 'علوم اقتصادية',
        professorId: 'prof-1',
        meetLink: 'https://meet.google.com/new',
        posts: [
             { id: 'p-4', type: PostType.PDF, title: 'منهج المقرر.pdf', url: '#', createdAt: '2024-05-19' },
        ],
        subscribers: 15,
    }
];

export const MOCK_SECTIONS: Section[] = [
    { id: 'sec-1', name: 'الفصل الأول: الفائدة البسيطة والمركبة', channelId: 'ch-1', price: 100 },
    { id: 'sec-2', name: 'الفصل الثاني: الدفعات', channelId: 'ch-1', price: 100 },
    { id: 'sec-3', name: 'المدخل إلى علم الاقتصاد', channelId: 'ch-2', price: 100 },
];

export const MOCK_CHANNEL_MESSAGES: ChannelMessage[] = [
    { id: 'msg-ch-1', senderId: 'prof-1', channelId: 'ch-1', text: 'Welcome to the channel! Please review the syllabus.', timestamp: '10:00 AM' },
    { id: 'msg-ch-2', senderId: 'student-1', channelId: 'ch-1', text: 'Thank you, professor!', timestamp: '10:01 AM' },
    { id: 'msg-ch-3', senderId: 'student-2', channelId: 'ch-1', text: 'I have a question about the first assignment.', timestamp: '10:05 AM' },
];

export const MOCK_DIRECT_MESSAGES: DirectMessage[] = [
    { id: 'dm-1', senderId: 'student-1', receiverId: 'prof-1', text: 'السلام عليكم أستاذة، لدي سؤال بخصوص المحاضرة الأخيرة.', timestamp: '11:30 AM' },
    { id: 'dm-2', senderId: 'prof-1', receiverId: 'student-1', text: 'وعليكم السلام، تفضل بالطبع.', timestamp: '11:32 AM' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 'notif-1', text: 'تم إضافة منشور جديد في قناة "الرياضيات المالية".', timestamp: 'منذ 5 دقائق', read: false },
    { id: 'notif-2', text: 'سيبدأ اجتماع Google Meet لقناة "مبادئ الاقتصاد الجزئي" قريبًا.', timestamp: 'منذ ساعة', read: false },
    { id: 'notif-3', text: 'قام الطالب "حمر العين ربيع" بإرسال رسالة مباشرة.', timestamp: 'منذ 3 ساعات', read: true },
];


export const STRINGS = {
    ar: {
        appName: 'جامعتك الرقمية way',
        login: 'تسجيل الدخول',
        register: 'إنشاء حساب',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        fullName: 'الاسم الكامل',
        role: 'الدور',
        professor: 'أستاذ',
        student: 'طالب',
        university: 'الجامعة',
        college: 'الكلية',
        select: 'اختر...',
        submit: 'إرسال',
        myChannels: 'قنواتي',
        createChannel: 'إنشاء قناة',
        profileSettings: 'إعدادات الملف الشخصي',
        logout: 'تسجيل الخروج',
        darkMode: 'الوضع الليلي',
        lightMode: 'الوضع النهاري',
        language: 'اللغة',
        channelName: 'اسم القناة',
        specialization: 'التخصص',
        close: 'إغلاق',
        save: 'حفظ',
        subscribe: 'اشتراك',
        subscribed: 'مشترك',
        subscriptionTitle: 'تأكيد الاشتراك',
        subscriptionMessage: 'الاشتراك في هذه القناة سيكلف 100 دج لمدة 3 أشهر. يمكنك الانضمام مجاناً حتى يتم تفعيل الميزة.',
        sectionSubscriptionMessage: 'الاشتراك في هذا القسم سيكلف {price} دج لمدة 3 أشهر. يمكنك الانضمام مجاناً حتى يتم تفعيل الميزة.',
        subscriptionSuccessNotification: 'تم اشتراكك بنجاح في قسم "{sectionName}" في قناة "{channelName}".',
        confirm: 'تأكيد',
        cancel: 'إلغاء',
        posts: 'المنشورات',
        chat: 'دردشة',
        googleMeet: 'انضم إلى Google Meet',
        upload: 'رفع ملف',
        typeMessage: 'اكتب رسالتك...',
        demoStudent: 'طالب تجريبي',
        demoProfessor: 'أستاذ تجريبي',
        orTryDemo: 'أو جرب حسابًا تجريبيًا',
        back: 'العودة',
        explore: 'استكشاف',
        openChannel: 'عرض القناة',
        jarvisAi: 'جارفيس AI',
        jarvisDescription: 'أنا جارفيس، مساعدك الذكي. يمكنني الإجابة على أسئلتك بالاعتماد على المجلات العلمية الجزائرية أولاً، ثم المصادر العالمية.',
        askJarvis: 'اسأل جارفيس...',
        welcomeBack: 'مرحباً بعودتك،',
        notifications: 'الإشعارات',
        noNotifications: 'لا توجد إشعارات جديدة.',
        directMessages: 'الرسائل المباشرة',
        asjpPlatform: 'منصة ASJP',
    },
    en: {
        appName: 'Your Digital University Way',
        login: 'Login',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        fullName: 'Full Name',
        role: 'Role',
        professor: 'Professor',
        student: 'Student',
        university: 'University',
        college: 'College',
        select: 'Select...',
        submit: 'Submit',
        myChannels: 'My Channels',
        createChannel: 'Create Channel',
        profileSettings: 'Profile Settings',
        logout: 'Logout',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
        language: 'Language',
        channelName: 'Channel Name',
        specialization: 'Specialization',
        close: 'Close',
        save: 'Save',
        subscribe: 'Subscribe',
        subscribed: 'Subscribed',
        subscriptionTitle: 'Confirm Subscription',
        subscriptionMessage: 'Subscription for this channel will cost 100 DZD for 3 months. You can join for free until this feature is activated.',
        sectionSubscriptionMessage: 'Subscription for this section will cost {price} DZD for 3 months. You can join for free until this feature is activated.',
        subscriptionSuccessNotification: 'You have successfully subscribed to section "{sectionName}" in the channel "{channelName}".',
        confirm: 'Confirm',
        cancel: 'Cancel',
        posts: 'Posts',
        chat: 'Chat',
        googleMeet: 'Join Google Meet',
        upload: 'Upload File',
        typeMessage: 'Type your message...',
        demoStudent: 'Demo Student',
        demoProfessor: 'Demo Professor',
        orTryDemo: 'Or try a demo account',
        back: 'Back',
        explore: 'Explore',
        openChannel: 'Open Channel',
        jarvisAi: 'Jarvis AI',
        jarvisDescription: 'I am Jarvis, your smart assistant. I can answer your questions based on Algerian scientific journals first, then global sources.',
        askJarvis: 'Ask Jarvis...',
        welcomeBack: 'Welcome back,',
        notifications: 'Notifications',
        noNotifications: 'No new notifications.',
        directMessages: 'Direct Messages',
        asjpPlatform: 'ASJP Platform',
    },
    fr: {
        appName: 'Votre Université Numérique Way',
        login: 'Connexion',
        register: 'S\'inscrire',
        email: 'Email',
        password: 'Mot de passe',
        fullName: 'Nom et Prénom',
        role: 'Rôle',
        professor: 'Professeur',
        student: 'Étudiant',
        university: 'Université',
        college: 'Faculté',
        select: 'Sélectionner...',
        submit: 'Soumettre',
        myChannels: 'Mes Chaînes',
        createChannel: 'Créer une chaîne',
        profileSettings: 'Paramètres du profil',
        logout: 'Déconnexion',
        darkMode: 'Mode Sombre',
        lightMode: 'Mode Clair',
        language: 'Langue',
        channelName: 'Nom de la chaîne',
        specialization: 'Spécialisation',
        close: 'Fermer',
        save: 'Enregistrer',
        subscribe: 'S\'abonner',
        subscribed: 'Abonné',
        subscriptionTitle: 'Confirmer l\'abonnement',
        subscriptionMessage: 'L\'abonnement à cette chaîne coûtera 100 DZD pour 3 mois. Vous pouvez rejoindre gratuitement jusqu\'à ce que cette fonctionnalité soit activée.',
        sectionSubscriptionMessage: 'L\'abonnement à cette section coûtera {price} DZD pour 3 mois. Vous pouvez rejoindre gratuitement jusqu\'à ce que cette fonctionnalité soit activée.',
        subscriptionSuccessNotification: 'Vous vous êtes abonné avec succès à la section "{sectionName}" dans la chaîne "{channelName}".',
        confirm: 'Confirmer',
        cancel: 'Annuler',
        posts: 'Publications',
        chat: 'Chat',
        googleMeet: 'Rejoindre Google Meet',
        upload: 'Téléverser',
        typeMessage: 'Tapez votre message...',
        demoStudent: 'Étudiant de démo',
        demoProfessor: 'Professeur de démo',
        orTryDemo: 'Ou essayez un compte démo',
        back: 'Retour',
        explore: 'Explorer',
        openChannel: 'Ouvrir la chaîne',
        jarvisAi: 'Jarvis AI',
        jarvisDescription: 'Je suis Jarvis, votre assistant intelligent. Je peux répondre à vos questions en me basant d\'abord sur les revues scientifiques algériennes, puis sur les sources mondiales.',
        askJarvis: 'Demandez à Jarvis...',
        welcomeBack: 'Content de vous revoir,',
        notifications: 'Notifications',
        noNotifications: 'Aucune nouvelle notification.',
        directMessages: 'Messages Directs',
        asjpPlatform: 'Plateforme ASJP',
    }
};

export const getLang = (lang: 'ar' | 'en' | 'fr') => STRINGS[lang];