import React from 'react'
import { Link, usePage } from '@inertiajs/react'
import AccountWrapper from './AccountWrapper'

function NotificationsUserSettings() {
    const { notifications } = usePage().props as any;
    const items = notifications?.items ?? [];
    const unreadCount = notifications?.unread_count ?? 0;

    return (
        <AccountWrapper>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Notifications non lues ({unreadCount})
                    </h2>
                    {unreadCount > 0 && (
                        <Link href={route('profile.notifications.read-all')} method="post" as="button" className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700">
                            Tout marquer comme lu
                        </Link>
                    )}
                </div>

                {items.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aucune notification non lue.</p>
                ) : (
                    <div className="space-y-3">
                        {items.map((item: any) => (
                            <div key={item.id} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{item.message}</p>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.created_at}</p>
                                    </div>
                                    <Link href={route('profile.notifications.read', item.id)} method="post" as="button" className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                                        Marquer lu
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AccountWrapper>
    )
}

export default NotificationsUserSettings
