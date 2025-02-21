import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { AlertCircle, GraduationCap, X, Check } from 'lucide-react';
import { route } from 'ziggy-js';

const FormationJoin = ({ formation, auth }: any) => {
    const [participantQuantity, setParticipantQuantity] = useState(1);

    const MAX_PARTICIPANTS_PER_REGISTRATION = 5; // Limite par inscription
    const maxQty = Math.min(formation?.available_seats, MAX_PARTICIPANTS_PER_REGISTRATION);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: auth?.user ? auth?.user?.name : '',
        email: auth?.user ? auth?.user?.email : '',
        phone: '',
        qty: participantQuantity,
    });

    const incrementQuantity = () => {
        if (participantQuantity < maxQty) {
            setParticipantQuantity(participantQuantity + 1);
            setData('qty', participantQuantity + 1);
        }
    };

    const decrementQuantity = () => {
        if (participantQuantity > 1) {
            setParticipantQuantity(participantQuantity - 1);
            setData('qty', participantQuantity - 1);
        }
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        post(route('formations.register', formation.slug));
    };

    // Rendu si la formation est complète
    if (formation.is_full) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 mb-6">
                <div className="flex items-start">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">
                            Formation complète
                        </h3>
                        <p className="text-red-700 dark:text-red-300">
                            Toutes les places pour cette formation ont été réservées. Vous pouvez vous inscrire sur la liste d'attente pour être averti en cas de désistement.
                        </p>
                        <button className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200">
                            Rejoindre la liste d'attente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div id="inscription" className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700/30 mb-6">
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    S'inscrire à la formation
                </h3>

                {formation.available_seats <= 5 && (
                    <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" />
                            <p className="text-yellow-700 dark:text-yellow-300">
                                Plus que <strong>{formation.available_seats}</strong> place{formation.available_seats > 1 ? 's' : ''} disponible{formation.available_seats > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Champs pour utilisateurs non connectés */}
                    {!auth?.user && (
                        <>
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nom et prénom
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors duration-200 ${errors.name
                                            ? 'border-red-500 dark:border-red-500 focus:ring-red-300'
                                            : 'border-gray-300 dark:border-gray-600 focus:ring-primary'
                                        } bg-white dark:bg-gray-800`}
                                    required
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Adresse e-mail
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors duration-200 ${errors.email
                                            ? 'border-red-500 dark:border-red-500 focus:ring-red-300'
                                            : 'border-gray-300 dark:border-gray-600 focus:ring-primary'
                                        } bg-white dark:bg-gray-800`}
                                    required
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                            </div>
                        </>
                    )}

                    <div className="mb-6">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Numéro de téléphone (facultatif)
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            value={data.phone}
                            onChange={e => setData('phone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-800 transition-colors duration-200"
                        />
                        {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Nombre de participants
                        </label>

                        <div className="flex items-center">
                            <div className="flex items-center w-36 h-12 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                                <button
                                    type="button"
                                    onClick={decrementQuantity}
                                    disabled={participantQuantity <= 1}
                                    className="w-12 h-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    <span className="text-xl">−</span>
                                </button>
                                <div className="flex-1 h-full flex items-center justify-center font-medium text-gray-900 dark:text-white border-x border-gray-300 dark:border-gray-600">
                                    {participantQuantity}
                                </div>
                                <button
                                    type="button"
                                    onClick={incrementQuantity}
                                    disabled={participantQuantity >= maxQty}
                                    className="w-12 h-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    <span className="text-xl">+</span>
                                </button>
                            </div>

                            <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                                {formation.max_participants !== null ? (
                                    <>
                                        {formation.available_seats === 1 ? (
                                            'Dernière place disponible'
                                        ) : (
                                            `${participantQuantity} participant${participantQuantity > 1 ? 's' : ''} sur ${formation.available_seats} disponible${formation.available_seats > 1 ? 's' : ''}`
                                        )}
                                    </>
                                ) : (
                                    'Nombre de places illimité'
                                )}
                            </span>
                        </div>
                        {errors.qty && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.qty}</p>}
                    </div>

                    {/* Récapitulatif */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-8">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Récapitulatif</h4>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                <span>
                                    {formation.title} × {participantQuantity}
                                </span>
                                <span className="font-medium">
                                    {formation.price === 0 ? 'Gratuit' : `${(formation.price * participantQuantity).toFixed(2)} CHF`}
                                </span>
                            </div>

                            {formation.price > 0 && (
                                <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                                    <span>Frais de service</span>
                                    <span>{(formation.price * participantQuantity * 0.05).toFixed(2)} CHF</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                                <span>Total</span>
                                <span>
                                    {formation.price === 0
                                        ? 'Gratuit'
                                        : `${(formation.price * participantQuantity * 1.05).toFixed(2)} CHF`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Politique et bouton de soumission */}
                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors duration-300 flex items-center justify-center"
                        >
                            {processing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Traitement en cours...
                                </>
                            ) : (
                                <>
                                    <GraduationCap className="mr-2 w-5 h-5" />
                                    {formation.price > 0 ? 'Procéder au paiement' : 'S\'inscrire gratuitement'}
                                </>
                            )}
                        </button>

                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                            En vous inscrivant, vous acceptez nos{' '}
                            <Link href={route('terms.show')} className="text-primary dark:text-primary hover:underline">
                                conditions générales
                            </Link>{' '}
                            et notre{' '}
                            <Link href={route('policy.show')} className="text-primary dark:text-primary hover:underline">
                                politique de confidentialité
                            </Link>.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormationJoin;