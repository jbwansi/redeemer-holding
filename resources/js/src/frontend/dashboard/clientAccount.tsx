import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LockKeyhole, User, KeyRound, Eye, EyeOff, Home, GraduationCap, Calendar } from 'lucide-react';
import { route } from 'ziggy-js';

import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';

const AccountPage = () => {
    const { auth } = usePage().props as any;
    const [showPassword, setShowPassword] = React.useState(false);
    const [showNewPassword, setShowNewPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    // Formulaire profil
    const { data: profileData, setData: setProfileData, errors: profileErrors, post: postProfile, processing: profileProcessing } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        phone: auth.user.phone,
        bio: auth.user.bio,
    });

    // Formulaire mot de passe
    const { data: passwordData, setData: setPasswordData, errors: passwordErrors, post: postPassword, processing: passwordProcessing } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postProfile(route('profile.update'));
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postPassword(route('password.update'));
    };

    return (
        <DashboardLayout title="Tableau de bord" currentPage="profile">


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulaire du profil */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <User className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Informations personnelles
                        </h2>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div>
                            <label className="block mb-2 font-medium text-gray-900 dark:text-white">
                                Nom complet
                            </label>
                            <Input
                                type="text"
                                value={profileData.name}
                                onChange={e => setProfileData('name', e.target.value)}
                                className="h-12 px-4 rounded-xl w-full"
                                error={profileErrors.name}
                            />
                            {profileErrors.name && (
                                <p className="mt-1 text-sm text-red-600">{profileErrors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-900 dark:text-white">
                                Adresse e-mail
                            </label>
                            <Input
                                type="email"
                                value={profileData.email}
                                onChange={e => setProfileData('email', e.target.value)}
                                className="h-12 px-4 rounded-xl w-full"
                                error={profileErrors.email}
                            />
                            {profileErrors.email && (
                                <p className="mt-1 text-sm text-red-600">{profileErrors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-900 dark:text-white">
                                Numéro de téléphone
                            </label>
                            <Input
                                type="tel"
                                value={profileData.phone}
                                onChange={e => setProfileData('phone', e.target.value)}
                                className="h-12 px-4 rounded-xl w-full"
                                error={profileErrors.phone}
                            />
                            {profileErrors.phone && (
                                <p className="mt-1 text-sm text-red-600">{profileErrors.phone}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-900 dark:text-white">
                                Biographie
                            </label>
                            <textarea
                                value={profileData.bio}
                                onChange={e => setProfileData('bio', e.target.value)}
                                className="w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none h-32"
                                placeholder="Parlez-nous un peu de vous..."
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={profileProcessing}
                                className="w-full sm:w-auto h-12 px-6 rounded-xl text-base font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                                Enregistrer les modifications
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Formulaire du mot de passe */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <LockKeyhole className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Changer le mot de passe
                        </h2>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div>
                            <label className="block mb-2 font-medium text-gray-900 dark:text-white">
                                Mot de passe actuel
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={passwordData.current_password}
                                    onChange={e => setPasswordData('current_password', e.target.value)}
                                    className="h-12 px-4 rounded-xl w-full pr-12"
                                    error={passwordErrors.current_password}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {passwordErrors.current_password && (
                                <p className="mt-1 text-sm text-red-600">{passwordErrors.current_password}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-900 dark:text-white">
                                Nouveau mot de passe
                            </label>
                            <div className="relative">
                                <Input
                                    type={showNewPassword ? "text" : "password"}
                                    value={passwordData.password}
                                    onChange={e => setPasswordData('password', e.target.value)}
                                    className="h-12 px-4 rounded-xl w-full pr-12"
                                    error={passwordErrors.password}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {passwordErrors.password && (
                                <p className="mt-1 text-sm text-red-600">{passwordErrors.password}</p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 font-medium text-gray-900 dark:text-white">
                                Confirmer le nouveau mot de passe
                            </label>
                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={passwordData.password_confirmation}
                                    onChange={e => setPasswordData('password_confirmation', e.target.value)}
                                    className="h-12 px-4 rounded-xl w-full pr-12"
                                    error={passwordErrors.password_confirmation}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {passwordErrors.password_confirmation && (
                                <p className="mt-1 text-sm text-red-600">{passwordErrors.password_confirmation}</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={passwordProcessing}
                                className="w-full sm:w-auto h-12 px-6 rounded-xl text-base font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                            >
                                Mettre à jour le mot de passe
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

        </DashboardLayout>
    );
};

export default AccountPage;