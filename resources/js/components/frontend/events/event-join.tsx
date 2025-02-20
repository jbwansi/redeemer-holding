import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { AlertCircle, Ticket, X, Check } from 'lucide-react';

const EventJoin = ({ event, auth }: any) => {
    const [ticketQuantity, setTicketQuantity] = useState(1);

    const MAX_TICKETS_PER_PERSON = 10; // Définir une limite par personne
    const maxQty = Math.min(event?.available_seats, MAX_TICKETS_PER_PERSON);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: auth?.user ? auth?.user?.name : '',
        email: auth?.user ? auth?.user?.email : '',
        phone: '',
        qty: ticketQuantity,
    });

    const incrementQuantity = () => {
        if (ticketQuantity < maxQty) {
            setTicketQuantity(ticketQuantity + 1);
            setData('qty', ticketQuantity + 1);
        }
    };

    const decrementQuantity = () => {
        if (ticketQuantity > 1) {
            setTicketQuantity(ticketQuantity - 1);
            setData('qty', ticketQuantity - 1);
        }
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        post(route('events.register', event.slug));
    };

    // Rendu en fonction de la disponibilité des places
    if (event.is_full) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 mb-6">
                <div className="flex items-start">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">
                            Événement complet
                        </h3>
                        <p className="text-red-700 dark:text-red-300">
                            Toutes les places pour cet événement ont été réservées. Vous pouvez vous inscrire sur la liste d'attente pour être averti en cas de désistement.
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
        <div id="registration" className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700/30 mb-6">
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Réserver votre place
                </h3>

                {event.available_seats <= 5 && (
                    <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" />
                            <p className="text-yellow-700 dark:text-yellow-300">
                                Plus que <strong>{event.available_seats}</strong> place{event.available_seats > 1 ? 's' : ''} disponible{event.available_seats > 1 ? 's' : ''}
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
                                            : 'border-gray-300 dark:border-gray-600 focus:ring-red-500'
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
                                            : 'border-gray-300 dark:border-gray-600 focus:ring-red-500'
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
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white dark:bg-gray-800 transition-colors duration-200"
                        />
                        {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Nombre de places
                        </label>

                        <div className="flex items-center">
                            <div className="flex items-center w-36 h-12 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                                <button
                                    type="button"
                                    onClick={decrementQuantity}
                                    disabled={ticketQuantity <= 1}
                                    className="w-12 h-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    <span className="text-xl">−</span>
                                </button>
                                <div className="flex-1 h-full flex items-center justify-center font-medium text-gray-900 dark:text-white border-x border-gray-300 dark:border-gray-600">
                                    {ticketQuantity}
                                </div>
                                <button
                                    type="button"
                                    onClick={incrementQuantity}
                                    disabled={ticketQuantity >= maxQty}
                                    className="w-12 h-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    <span className="text-xl">+</span>
                                </button>
                            </div>

                            <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                                {event.max_participants !== null ? (
                                    <>
                                        {event.available_seats === 1 ? (
                                            'Dernière place disponible'
                                        ) : (
                                            `${ticketQuantity} place${ticketQuantity > 1 ? 's' : ''} sur ${event.available_seats} disponible${event.available_seats > 1 ? 's' : ''}`
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
                                    {event.title} × {ticketQuantity}
                                </span>
                                <span className="font-medium">
                                    {event.price === 0 ? 'Gratuit' : `${(event.price * ticketQuantity).toFixed(2)} CHF`}
                                </span>
                            </div>

                            {event.price > 0 && (
                                <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                                    <span>Frais de service</span>
                                    <span>{(event.price * ticketQuantity * 0.05).toFixed(2)} CHF</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                                <span>Total</span>
                                <span>
                                    {event.price === 0
                                        ? 'Gratuit'
                                        : `${(event.price * ticketQuantity * 1.05).toFixed(2)} CHF`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Politique et bouton de soumission */}
                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-300 flex items-center justify-center"
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
                                    <Ticket className="mr-2 w-5 h-5" />
                                    {event.price > 0 ? 'Procéder au paiement' : 'Réserver gratuitement'}
                                </>
                            )}
                        </button>

                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                            En réservant, vous acceptez nos{' '}
                            <Link href={route('terms.show')} className="text-red-600 dark:text-red-400 hover:underline">
                                conditions générales
                            </Link>{' '}
                            et notre{' '}
                            <Link href={route('policy.show')} className="text-red-600 dark:text-red-400 hover:underline">
                                politique de confidentialité
                            </Link>.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventJoin;
