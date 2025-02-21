import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Calendar,
    GraduationCap,
    User,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Home,
    ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FrontLayout from '@/components/frontend/layouts/front-layout';

interface SidebarItemProps {
    icon: React.ReactNode;
    text: string;
    href: string;
    isActive: boolean;
    onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, text, href, isActive, onClick }) => (
    <Link
        href={href}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive
                ? 'bg-red-600 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
        onClick={onClick}
    >
        <span className="flex-shrink-0">{icon}</span>
        <span className="font-medium">{text}</span>
        {isActive && (
            <ChevronRight className="w-4 h-4 ml-auto" />
        )}
    </Link>
);

interface ClientDashboardProps {
    auth: {
        user: {
            name: string;
        };
    };
}

const ClientDashboard: React.FC<ClientDashboardProps> = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activePage, setActivePage] = useState('dashboard');
    const { auth } = usePage().props as any
    const sidebarItems = [
        { id: 'dashboard', icon: <Home className="w-5 h-5" />, text: 'Tableau de bord', href: '/dashboard' },
        { id: 'formations', icon: <GraduationCap className="w-5 h-5" />, text: 'Formations', href: '/formations' },
        { id: 'events', icon: <Calendar className="w-5 h-5" />, text: 'Événements', href: '/events' },
        { id: 'profile', icon: <User className="w-5 h-5" />, text: 'Profil', href: '/profile' },
    ];

    return (
        <>
            <Head title='Tableau de bord' />
            <FrontLayout>
                <div className="relative min-h-screen pt-20 lg:pt-24 bg-gray-50 dark:bg-gray-950">
                    {/* Container flex pour sidebar et contenu */}
                    <div className="flex">
                        {/* Sidebar */}
                        <motion.aside
                            className={`fixed lg:sticky top-16 lg:top-24 left-0 h-[calc(100vh-4rem)] lg:h-[calc(100vh-6rem)] 
                            bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
                            transition-all duration-300 z-40 
                            ${isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}`}
                            initial={false}
                        >
                            <div className="flex flex-col h-full">
                                {/* En-tête du sidebar avec nom et toggle */}
                                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                        <span className="font-semibold text-gray-900 dark:text-white truncate">
                                            {auth.user.name}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        {isSidebarOpen ? (
                                            <ChevronLeft className="w-5 h-5 text-gray-500" />
                                        ) : (
                                            <Menu className="w-5 h-5 text-gray-500" />
                                        )}
                                    </button>
                                </div>

                                {/* Navigation */}
                                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                                    {sidebarItems.map((item) => (
                                        <SidebarItem
                                            key={item.id}
                                            icon={item.icon}
                                            text={isSidebarOpen ? item.text : ''}
                                            href={item.href}
                                            isActive={activePage === item.id}
                                            onClick={() => setActivePage(item.id)}
                                        />
                                    ))}
                                </nav>

                                {/* Footer */}
                                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                                    <button
                                        onClick={() => {
                                            // Logique de déconnexion
                                        }}
                                        className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 dark:text-red-400 
                                        hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-300"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        {isSidebarOpen && <span className="font-medium">Déconnexion</span>}
                                    </button>
                                </div>
                            </div>
                        </motion.aside>

                        {/* Overlay pour mobile */}
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                                    onClick={() => setIsSidebarOpen(false)}
                                />
                            )}
                        </AnimatePresence>

                        {/* Bouton toggle pour mobile */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className={`fixed bottom-4 right-4 z-40 lg:hidden bg-red-600 text-white p-3 rounded-full shadow-lg 
                            ${isSidebarOpen ? 'hidden' : 'flex'}`}
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Contenu principal */}
                        <div className="flex-1 transition-all duration-300 min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-6rem)]">
                            <div className="p-4 lg:p-8">
                                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                        Bienvenue sur votre tableau de bord
                                    </h1>
                                    {/* Contenu spécifique de la page */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </FrontLayout>
        </>
    );
};

export default ClientDashboard;