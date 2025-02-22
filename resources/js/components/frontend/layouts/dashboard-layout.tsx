// components/layouts/DashboardLayout.tsx
import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
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
                <div className="relative min-h-screen pt-20 lg:pt-24 bg-gray-50 dark:bg-gray-950">
                    <div className="flex">
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
                        {/* Contenu principal avec les styles communs */}
                        <div className={`flex-1 transition-all duration-300 min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-6rem)] `}>
                            <div className="p-4 lg:p-8">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </FrontLayout>
        </>
    );
};

export default DashboardLayout;