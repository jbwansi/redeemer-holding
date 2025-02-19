import React from 'react';
import { usePage } from '@inertiajs/react';
import AccountWrapper from './AccountWrapper';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, FileText, Settings, Mail, Lock, User, Monitor } from 'lucide-react';

interface Activity {
    id: number;
    event_type: string;
    resource_type: string | null;
    resource_id: string | null;
    old_values: any;
    new_values: any;
    ip_address: string;
    user_agent: string;
    created_at: string;
    date: string;
}

interface Props  {
    activities: {
        data: Activity[];
        links: any[];
        current_page: number;
        last_page: number;
    };
}

const getEventIcon = (eventType: string) => {
    switch (eventType.toLowerCase()) {
        case 'login':
            return <Monitor className="w-5 h-5" />;
        case 'profile_updated':
            return <User className="w-5 h-5" />;
        case 'password_changed':
            return <Lock className="w-5 h-5" />;
        case 'settings_updated':
            return <Settings className="w-5 h-5" />;
        case 'document_created':
        case 'document_updated':
            return <FileText className="w-5 h-5" />;
        case 'email_changed':
            return <Mail className="w-5 h-5" />;
        default:
            return <Shield className="w-5 h-5" />;
    }
};

const getEventDescription = (activity: Activity): string => {
    switch (activity.event_type.toLowerCase()) {
        case 'login':
            return `Connexion depuis ${activity.ip_address}`;
        case 'profile_updated':
            return 'Mise à jour du profil';
        case 'password_changed':
            return 'Changement du mot de passe';
        case 'settings_updated':
            return 'Mise à jour des paramètres';
        case 'email_changed':
            return `Email modifié : ${activity.old_values?.email} → ${activity.new_values?.email}`;
        default:
            return activity.event_type.replace('_', ' ');
    }
};

const getEventColor = (eventType: string): string => {
    switch (eventType.toLowerCase()) {
        case 'login':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
        case 'profile_updated':
            return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
        case 'password_changed':
            return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
        case 'settings_updated':
            return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
        case 'email_changed':
            return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300';
        default:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
};

function UserActivitiesSettings() {
    const { activities } = usePage<any>().props;

    return (
        <AccountWrapper>
            <div className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-28">
                <div className="mx-auto max-w-screen-2xl">
                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg sm:text-xl font-semibold">Historique d'activité</h2>
                        </div>

                        <ScrollArea className="h-[600px] rounded-md border p-4">
                            <div className="space-y-8">
                                {activities?.data?.map((activity: any, index:any) => (
                                    <div key={activity.id} className="relative pb-8">
                                        {index < activities.data.length - 1 && (
                                            <span
                                                className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                                                aria-hidden="true"
                                            />
                                        )}
                                        <div className="relative flex items-start space-x-3">
                                            <div className={`relative px-2 py-2 rounded-lg ${getEventColor(activity.event_type)}`}>
                                                {getEventIcon(activity.event_type)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {getEventDescription(activity)}
                                                </div>
                                                <div className="mt-1 text-sm text-gray-500 space-y-1">
                                                    <p>
                                                        {activity.user_agent.split(') ')[0].split(' (')[0]}
                                                    </p>
                                                    <p className="text-xs">
                                                        {activity.date} • {activity.created_at}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </AccountWrapper>
    );
}

export default UserActivitiesSettings;
