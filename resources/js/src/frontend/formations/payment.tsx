import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import { Calendar, Clock, MapPin, Users, CreditCard, Shield, AlertCircle, ArrowLeft, CheckCircle, ArrowRight, GraduationCap, Monitor } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import CountdownTimer from '@/components/frontend/CountdownTimer';
import { route } from 'ziggy-js';

const FormationPaymentPage = ({ formation, participant, subtotal, serviceFee, total, checkoutUrl }: any) => {
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [timeExpired, setTimeExpired] = useState(false);

    // Temps limite de 15 minutes pour finaliser l'inscription
    const expirationTime = new Date(participant.created_at);
    expirationTime.setMinutes(expirationTime.getMinutes() + 15);

    useEffect(() => {
        if (new Date() > expirationTime) {
            setTimeExpired(true);
            return;
        }

        const redirectTimer = setTimeout(() => {
            setIsRedirecting(true);
            window.location.href = checkoutUrl;
        }, 3000);

        return () => clearTimeout(redirectTimer);
    }, [checkoutUrl, expirationTime]);

    const handleManualRedirect = () => {
        setIsRedirecting(true);
        window.location.href = checkoutUrl;
    };

    const handleTimerExpired = () => {
        setTimeExpired(true);
    };

    return (
        <FrontLayout>
            <Head title={`Inscription - ${formation.title}`} />

            <main className="pt-24 pb-16 bg-gray-50 dark:bg-gray-950 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* En-tête */}
                    <div className="mb-8">
                        <Link
                            href={route('formations.details', formation.slug)}
                            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mb-4 transition-colors duration-200"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            <span>Retour à la formation</span>
                        </Link>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Finaliser votre inscription
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Complétez votre inscription pour accéder à la formation.
                        </p>
                    </div>

                    {/* Contenu principal */}
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Résumé de la formation */}
                        <div className="lg:w-7/12">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                        Résumé de votre formation
                                    </h2>

                                    {/* Informations de la formation */}
                                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                                        <div className="md:w-1/3 rounded-lg overflow-hidden">
                                            <img
                                                src={formation.featured_image?.original || '/assets/images/formation-placeholder.jpg'}
                                                alt={formation.title}
                                                className="w-full h-full object-cover aspect-video"
                                            />
                                        </div>

                                        <div className="md:w-2/3">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                                {formation.title}
                                            </h3>

                                            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span>Début: {formatDate(formation.start_date)}</span>
                                                </div>

                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span>Durée: {formation.duration} heures</span>
                                                </div>

                                                <div className="flex items-center">
                                                    <Monitor className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span>{formation.format}</span>
                                                </div>

                                                <div className="flex items-center">
                                                    <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span>Niveau: {formation.level}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Détail des prix */}
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                            Détails du paiement
                                        </h3>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                                <span>Formation {formation.title}</span>
                                                <span>{formatCurrency(subtotal)}</span>
                                            </div>

                                            <div className="flex justify-between text-gray-500 dark:text-gray-400 text-sm">
                                                <span>Frais de plateforme (5%)</span>
                                                <span>{formatCurrency(serviceFee)}</span>
                                            </div>

                                            <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <span>Total</span>
                                                <span>{formatCurrency(total)}</span>
                                            </div>
                                        </div>

                                        {/* Référence d'inscription */}
                                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-sm">
                                            <p className="flex justify-between text-gray-600 dark:text-gray-400">
                                                <span>Référence:</span>
                                                <span className="font-medium">{participant.reference}</span>
                                            </p>

                                            {participant.name && (
                                                <p className="flex justify-between text-gray-600 dark:text-gray-400 mt-1">
                                                    <span>Participant:</span>
                                                    <span>{participant.name}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bloc de paiement */}
                        <div className="lg:w-5/12">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 sticky top-24">
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        Procéder au paiement
                                    </h2>

                                    {/* Countdown timer */}
                                    <div className="mb-6">
                                        {timeExpired ? (
                                            <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 p-4 rounded-lg flex items-start">
                                                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-medium">Le temps imparti pour l'inscription a expiré</p>
                                                    <p className="mt-1 text-sm">Veuillez retourner à la page de la formation pour recommencer l'inscription.</p>
                                                    <Link
                                                        href={route('formations.details', formation.slug)}
                                                        className="mt-3 inline-flex items-center text-yellow-700 dark:text-yellow-300 font-medium hover:underline"
                                                    >
                                                        Retourner à la formation
                                                        <ArrowRight className="ml-1 w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                                                <p className="text-red-700 dark:text-red-300 text-sm mb-2">
                                                    Veuillez compléter votre inscription dans:
                                                </p>
                                                <CountdownTimer
                                                    expiryTimestamp={expirationTime}
                                                    onExpire={handleTimerExpired}
                                                    className="text-2xl font-mono font-bold text-red-800 dark:text-red-200"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {!timeExpired && (
                                        <>
                                            {/* Informations de paiement sécurisé */}
                                            <div className="mb-6">
                                                <div className="flex items-center mb-4">
                                                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        Paiement sécurisé par Stripe
                                                    </span>
                                                </div>

                                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <li className="flex items-start">
                                                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                                                        <span>Accès immédiat au contenu après paiement</span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                                                        <span>Certificat de réussite inclus</span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                                                        <span>Accès à vie au contenu de la formation</span>
                                                    </li>
                                                </ul>
                                            </div>

                                            {/* Bouton de paiement */}
                                            <button
                                                onClick={handleManualRedirect}
                                                disabled={isRedirecting}
                                                className={`w-full py-4 rounded-lg font-medium text-center transition-colors duration-300 flex items-center justify-center ${isRedirecting
                                                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                                    }`}
                                            >
                                                {isRedirecting ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Redirection en cours...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CreditCard className="mr-2 w-5 h-5" />
                                                        S'inscrire maintenant ({formatCurrency(total)})
                                                    </>
                                                )}
                                            </button>

                                            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                                                En procédant au paiement, vous acceptez nos{' '}
                                                <a href="#" className="text-red-600 dark:text-red-400 hover:underline">
                                                    conditions générales
                                                </a>{' '}
                                                et notre{' '}
                                                <a href="#" className="text-red-600 dark:text-red-400 hover:underline">
                                                    politique de confidentialité
                                                </a>.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </FrontLayout>
    );
};

export default FormationPaymentPage;
