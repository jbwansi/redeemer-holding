import { ReactNode } from 'react';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Menu, LogOut, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

export interface SidebarItem {
    id: string;
    icon: ReactNode;
    text: string;
    href: string;
}

export interface SidebarProps {
    items: SidebarItem[];
    activePage: string;
    isOpen: boolean;
    userName: string;
    onToggle: () => void;
    onPageChange: (pageId: string) => void;
    onLogout: () => void;
}


interface SidebarItemProps {
    icon: React.ReactNode;
    text: string;
    href: string;
    isActive: boolean;
    onClick?: () => void;
    showText: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
    icon,
    text,
    href,
    isActive,
    onClick,
    showText
}) => (
    <Link
        href={href}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive
            ? 'bg-red-600 text-white'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
        onClick={onClick}
    >
        <span className="flex-shrink-0">{icon}</span>
        {showText && (
            <>
                <span className="font-medium">{text}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </>
        )}
    </Link>
);



export const Sidebar: React.FC<SidebarProps> = ({
    items,
    activePage,
    isOpen,
    userName,
    onToggle,
    onPageChange,
    onLogout
}) => {
    return (
        <>
            <motion.aside
                className={`fixed lg:sticky top-16 lg:top-24 left-0 h-[calc(100vh-4rem)] lg:h-[calc(100vh-6rem)] 
                bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
                transition-all duration-300 z-40 
                ${isOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}`}
                initial={false}
            >
                <div className="flex flex-col h-full">
                    {/* En-tête */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <div className="flex items-center space-x-3 overflow-hidden">
                            <span className="font-semibold text-gray-900 dark:text-white truncate">
                                {userName}
                            </span>
                        </div>
                        <button
                            onClick={onToggle}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            {isOpen ? (
                                <ChevronLeft className="w-5 h-5 text-gray-500" />
                            ) : (
                                <Menu className="w-5 h-5 text-gray-500" />
                            )}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                        {items.map((item) => (
                            <SidebarItem
                                key={item.id}
                                icon={item.icon}
                                text={item.text}
                                href={item.href}
                                isActive={activePage === item.id}
                                onClick={() => onPageChange(item.id)}
                                showText={isOpen}
                            />
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                        <Link
                            href={route('logout')}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 dark:text-red-400 
                            hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-300"
                        >
                            <LogOut className="w-5 h-5" />
                            {isOpen && <span className="font-medium">Déconnexion</span>}
                        </Link>
                    </div>
                </div>
            </motion.aside>

            {/* Overlay mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={onToggle}
                    />
                )}
            </AnimatePresence>

            {/* Bouton toggle mobile */}
            <button
                onClick={onToggle}
                className={`fixed bottom-4 right-4 z-40 lg:hidden bg-red-600 text-white p-3 rounded-full shadow-lg 
                ${isOpen ? 'hidden' : 'flex'}`}
            >
                <Menu className="w-6 h-6" />
            </button>
        </>
    );
};
