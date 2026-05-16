import React from 'react';
import { Link } from '@inertiajs/react';
import { Calendar, Clock, MapPin, Users, CheckCircle } from 'lucide-react';

const EventCard = ({ event }: any) => {
  const isPast = new Date(event.end_date) < new Date();
  const isOngoing = event.is_ongoing;

  // Formatage des dates
  const formatEventDate = (dateString: any, includeYear = true) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: includeYear ? 'numeric' : undefined,
    };
    return date.toLocaleDateString('fr-FR', options as Intl.DateTimeFormatOptions);
  };

  const formatEventTime = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Statut des places
  const renderAvailabilityStatus = () => {
    if (isPast) return null;

    if (event.max_participants === null) {
      return (
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <Users className="w-4 h-4 mr-2" />
          <span>Places illimitées</span>
        </div>
      );
    }

    if (event.is_full) {
      return (
        <div className="flex items-center text-red-600 dark:text-red-400 font-medium">
          <Users className="w-4 h-4 mr-2" />
          <span>Complet</span>
        </div>
      );
    }

    if (event.available_seats <= 5) {
      return (
        <div className="flex items-center text-red-600 dark:text-red-400 font-medium">
          <Users className="w-4 h-4 mr-2" />
          <span>
            Plus que {event.available_seats} place{event.available_seats > 1 ? 's' : ''}
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700/30 hover:shadow-xl transition-shadow duration-300 max-h-80">
      <div className="flex flex-col md:flex-row h-full">
        {/* Image */}
        <div className="md:w-1/3 relative overflow-hidden h-48 md:h-auto">
          <img
            src={event.featured_image?.original}
            alt={event.title}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
              isPast ? 'filter grayscale' : ''
            }`}
            loading="lazy"
            decoding="async"
            sizes="(min-width: 768px) 33vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent md:from-black/20 md:via-black/5"></div>

          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 text-red-600 text-sm font-medium rounded-full">
              {event.category?.name}
            </span>
          </div>

          {isPast && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-gray-800/90 text-white text-sm font-medium rounded-full flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Terminé
              </span>
            </div>
          )}

          {isOngoing && !isPast && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-green-600/90 text-white text-sm font-medium rounded-full flex items-center">
                En cours
              </span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 md:hidden bg-gradient-to-t from-black/80 via-black/45 to-transparent py-4 px-4">
            <div className="flex items-center text-white">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{formatEventDate(event.start_date, false)}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="md:w-2/3 p-6 flex flex-col h-full">
          <div className="mb-auto">
            <div className="hidden md:flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  {formatEventDate(event.start_date)} - {formatEventDate(event.end_date)}{' '}
                </span>
              </div>

              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>
                  {formatEventTime(event.start_date)} - {formatEventTime(event.end_date)}
                </span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
              <Link href={route('evenements.details', event.slug)}>{event.title}</Link>
            </h3>

            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
              {event.description}
            </p>

            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{event.location}</span>
              </div>

              {renderAvailabilityStatus()}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {event.price == 0 ? 'GRATUIT' : `${event.price} CHF`}
              </span>
            </div>

            <div className="flex gap-2">
              <Link
                href={route('evenements.details', event.slug)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors duration-200"
              >
                Détails
              </Link>

              {!isPast && !event.is_full && (
                <Link
                  href={`${route('evenements.details', event.slug)}#registration`}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center"
                >
                  <span>Réserver</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
