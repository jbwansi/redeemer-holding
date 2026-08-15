import React, { useRef, useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { AlertCircle, Ticket } from 'lucide-react';

const EventJoin = ({ event, auth, onNotify }: any) => {
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const isSubmitting = useRef(false);

  const MAX_TICKETS_PER_PERSON = 10; // Définir une limite par personne
  const maxQty = Math.min(event?.available_seats, MAX_TICKETS_PER_PERSON);

  const authName = auth?.user?.name ?? '';
  const spaceIdx = authName.indexOf(' ');
  const { data, setData, post, processing, errors } = useForm({
    first_name: spaceIdx >= 0 ? authName.substring(0, spaceIdx) : authName,
    last_name: spaceIdx >= 0 ? authName.substring(spaceIdx + 1) : '',
    email: auth?.user?.email ?? '',
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
    if (isSubmitting.current || processing) return;

    isSubmitting.current = true;
    post(route('events.register', event.slug), {
      onSuccess: () => {
        onNotify?.("Inscription réussie à l'événement.", 'success');
      },
      onError: () => {
        onNotify?.("Erreur lors de l'inscription à l'événement.", 'error');
      },
      onFinish: () => {
        isSubmitting.current = false;
      },
    });
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
              Toutes les places pour cet événement ont été réservées. Vous pouvez vous inscrire sur
              la liste d'attente pour être averti en cas de désistement.
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
    <div
      id="registration"
      className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 mb-6"
    >
      <div className="p-6 md:p-7">
        <p className="text-xs uppercase tracking-wide text-[#da2e29] font-medium mb-2">
          Inscription
        </p>
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          Réserver votre place
        </h3>

        {event.available_seats <= 5 && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800/40">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2 flex-shrink-0" />
              <p className="text-amber-700 dark:text-amber-300">
                Plus que <strong>{event.available_seats}</strong> place
                {event.available_seats > 1 ? 's' : ''} disponible
                {event.available_seats > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Prénom + Nom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="event-first_name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Prénom
              </label>
              <input
                type="text"
                id="event-first_name"
                value={data.first_name}
                onChange={(e) => setData('first_name', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:outline-none transition-colors duration-200 ${errors.first_name ? 'border-red-500 focus:ring-red-300' : 'border-slate-300 dark:border-slate-600 focus:ring-[#da2e29]'} bg-white dark:bg-slate-900`}
                required
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.first_name}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="event-last_name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Nom
              </label>
              <input
                type="text"
                id="event-last_name"
                value={data.last_name}
                onChange={(e) => setData('last_name', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:outline-none transition-colors duration-200 ${errors.last_name ? 'border-red-500 focus:ring-red-300' : 'border-slate-300 dark:border-slate-600 focus:ring-[#da2e29]'} bg-white dark:bg-slate-900`}
                required
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.last_name}</p>
              )}
            </div>
          </div>

          {/* Adresse e-mail */}
          <div>
            <label
              htmlFor="event-email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Adresse e-mail
            </label>
            <input
              type="email"
              id="event-email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:outline-none transition-colors duration-200 ${errors.email ? 'border-red-500 focus:ring-red-300' : 'border-slate-300 dark:border-slate-600 focus:ring-[#da2e29]'} bg-white dark:bg-slate-900`}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Numéro de téléphone (facultatif)
            </label>
            <input
              type="tel"
              id="phone"
              value={data.phone}
              onChange={(e) => setData('phone', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#da2e29] focus:outline-none bg-white dark:bg-slate-900 transition-colors duration-200"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Nombre de places
            </label>

            <div className="flex items-center">
              <div className="flex items-center w-36 h-12 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={decrementQuantity}
                  disabled={ticketQuantity <= 1}
                  className="w-12 h-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <span className="text-xl">−</span>
                </button>
                <div className="flex-1 h-full flex items-center justify-center font-medium text-slate-900 dark:text-white border-x border-slate-300 dark:border-slate-600">
                  {ticketQuantity}
                </div>
                <button
                  type="button"
                  onClick={incrementQuantity}
                  disabled={ticketQuantity >= maxQty}
                  className="w-12 h-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <span className="text-xl">+</span>
                </button>
              </div>

              <span className="ml-4 text-sm text-slate-500 dark:text-slate-400">
                {event.max_participants !== null ? (
                  <>
                    {event.available_seats === 1
                      ? 'Dernière place disponible'
                      : `${ticketQuantity} place${ticketQuantity > 1 ? 's' : ''} sur ${event.available_seats} disponible${event.available_seats > 1 ? 's' : ''}`}
                  </>
                ) : (
                  'Nombre de places illimité'
                )}
              </span>
            </div>
            {errors.qty && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.qty}</p>
            )}
          </div>

          {/* Récapitulatif */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80">
            <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
              Récapitulatif
            </h4>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>
                  {event.title} × {ticketQuantity}
                </span>
                <span className="font-medium">
                  {event.price === 0
                    ? 'Gratuit'
                    : `${(event.price * ticketQuantity).toFixed(2)} CHF`}
                </span>
              </div>

              {event.price > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400 text-sm">
                  <span>Frais de service</span>
                  <span>{(event.price * ticketQuantity * 0.05).toFixed(2)} CHF</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between font-bold text-lg text-slate-900 dark:text-white">
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
              className="w-full py-4 bg-[#da2e29] hover:bg-[#c62823] text-white rounded-xl font-medium transition-colors duration-300 flex items-center justify-center"
            >
              {processing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
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

            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 text-center">
              En réservant, vous acceptez nos{' '}
              <Link
                href={route('terms.show')}
                className="text-red-600 dark:text-red-400 hover:underline"
              >
                conditions générales
              </Link>{' '}
              et notre{' '}
              <Link
                href={route('policy.show')}
                className="text-red-600 dark:text-red-400 hover:underline"
              >
                politique de confidentialité
              </Link>
              .
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventJoin;
