// components/layouts/DashboardLayout.tsx
import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Calendar,
    GraduationCap,
    User,
    Home
} from 'lucide-react';
import { Sidebar } from '@/components/frontend/layouts/sidebar';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import { route } from 'ziggy-js';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title: string;
    currentPage?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    title,
    currentPage = 'dashboard'
}) => {
    const { auth } = usePage().props as any;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activePage, setActivePage] = useState(currentPage);

    const sidebarItems = [
        {
            id: 'dashboard',
            icon: <Home className="w-5 h-5" />,
            text: 'Tableau de bord',
            href: route('dashboard.client.profile')
        },
        {
            id: 'formations',
            icon: <GraduationCap className="w-5 h-5" />,
            text: 'Formations',
            href: route('dashboard.client.formations')
        },
        {
            id: 'events',
            icon: <Calendar className="w-5 h-5" />,
            text: 'Événements',
            href: route('dashboard.client.events')
        },
        {
            id: 'profile',
            icon: <User className="w-5 h-5" />,
            text: 'Mon Compte',
            href: route('dashboard.client.account')
        },
    ];

    const handleLogout = () => {
        // Implémenter la logique de déconnexion
    };

    return (
        <>
            <Head title={title} />
            <FrontLayout>
                <div className="relative min-h-screen pt-20 lg:pt-24 bg-slate-50 dark:bg-slate-950 overflow-hidden">
                    <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-red-200/40 blur-3xl dark:bg-red-900/25" />
                    <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-orange-200/35 blur-3xl dark:bg-orange-900/20" />

                    <div className="relative flex max-w-[1700px] mx-auto">
                        <Sidebar
                            items={sidebarItems}
                            activePage={activePage}
                            isOpen={isSidebarOpen}
                            userName={auth.user.name}
                            userRole={auth.user.role}
                            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                            onPageChange={setActivePage}
                            onLogout={handleLogout}
                        />
                        <div className="flex-1 transition-all duration-300 min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-6rem)]">
                            <div className="p-3 sm:p-4 lg:p-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                                    className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.35, delay: 0.1 }}
                                        className="border-b border-slate-200/80 px-5 py-4 dark:border-slate-800"
                                    >
                                        <h1 className="text-lg md:text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                                            {title}
                                        </h1>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.35, delay: 0.15 }}
                                        className="p-4 lg:p-6 dashboard-content"
                                    >
                                        {children}
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </FrontLayout>
        </>
    );
};

export default DashboardLayout;