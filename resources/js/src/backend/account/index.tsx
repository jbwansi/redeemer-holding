import React from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import AccountWrapper from './AccountWrapper';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, Globe, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const TabSystem = () => {
    const { auth, sessions } = usePage().props as any;

    const { data, setData, errors, post, processing } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        phone: auth.user.phone,
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        post(route('profile.update'));
    };

    const terminateSession = (sessionId: any) => {
        post(route('profile.terminate-session', sessionId));
    };

    const terminateOtherSessions = () => {
        post(route('profile.terminate-other-sessions'));
    };

    return (
        <AccountWrapper>
            <div className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-28">
                <div className="mx-auto max-w-screen-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Section informations personnelles */}
                        <div className="border rounded-lg p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-sm">
                            <h2 className="text-lg sm:text-xl font-semibold">
                                Information personnelle
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                                <div>
                                    <label className="block mb-2 font-semibold">
                                        Nom complet
                                    </label>
                                    <Input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="h-12 px-4 rounded-xl w-full"
                                        error={errors.name}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold">
                                        Adresse e-mail
                                    </label>
                                    <Input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="h-12 px-4 rounded-xl w-full"
                                        error={errors.email}
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold">
                                        Numéro de téléphone
                                    </label>
                                    <Input
                                        type="text"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        className="h-12 px-4 rounded-xl w-full"
                                        error={errors.phone}
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full sm:w-40 h-12 rounded-xl text-base font-medium transition-transform hover:scale-105 dark:bg-primary dark:text-white"
                                    >
                                        Enregistrer
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Section sessions */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg sm:text-xl font-semibold">Sessions actives</h2>
                                    <Button
                                        onClick={terminateOtherSessions}
                                        variant="outline"
                                        className="text-sm"
                                    >
                                        Déconnecter autres appareils
                                    </Button>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    Voici la liste de vos appareils connectés. Vous pouvez révoquer l'accès aux sessions que vous ne reconnaissez pas.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 bg-primary/10 rounded-full">
                                                <Shield className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {session.user_agent.split(') ')[0].split(' (')[0]}
                                                    {session.is_current_device && (
                                                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                            Appareil actuel
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                                    <Globe className="w-4 h-4 mr-1" />
                                                    {session.location ? (
                                                        `${session.location.city}, ${session.location.country}`
                                                    ) : (
                                                        'Localisation inconnue'
                                                    )}
                                                    • {session.ip_address}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Dernière activité {session.last_activity}
                                                </div>
                                            </div>
                                        </div>

                                        {!session.is_current_device && (
                                            <Button
                                                onClick={() => terminateSession(session.id)}
                                                variant="ghost"
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AccountWrapper>
    );
};

export default TabSystem;
