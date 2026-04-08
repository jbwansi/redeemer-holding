import { Link, usePage } from '@inertiajs/react';
import React from 'react'

function AccountWrapper({ children }: any) {

    // Récupérer l'URL active
    const { url } = usePage();

    const tabs = [
        {
            title: 'Détails de compte',
            href: 'profile.account',
        },
        {
            title: 'Mot de passe & Sécurité',
            href: 'profile.security',
        },
        {
            title: 'Activités de connexion',
            href: 'profile.activities',
        },
        {
            title: 'Notifications',
            href: 'profile.notifications',
        },
    ];

    return (
        <div className="w-full px-2 sm:px-4 dark:bg-gray-950">
            {/* Navigation des onglets */}
            <div className="flex flex-col sm:flex-row overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-gray-700">
                <div className="flex sm:flex-row whitespace-nowrap">
                    {tabs.map((tab, index) => (
                        <Link
                            key={index}
                            href={route(tab.href)}
                            className={`
                                flex-shrink-0
                                px-3 sm:px-4 py-2
                                text-sm sm:text-base font-medium
                                transition-colors duration-200
                                ${route().current() === tab.href
                                    ? 'border-b-2 border-orange-600 text-orange-600 dark:text-orange-500'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }
                            `}
                        >
                            {tab.title}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="mt-5">
                {children}
            </div>
        </div>
    )
}

export default AccountWrapper
