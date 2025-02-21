import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Search,
    CheckCircle,
    History,
    X,
    ArrowRight,
    Home,
    GraduationCap,
    User
} from 'lucide-react';
import { Head, Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';

import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';

interface Event {
    id: number;
    slug: string;
    title: string;
    description: string;
    featured_image: {
        original: string;
    };
    category: {
        name: string;
    };
    start_date: string;
    end_date: string;
    location: string;
    price: number;
    max_participants: number | null;
    available_seats: number;
    is_full: boolean;
    is_ongoing: boolean;
}



// Composant de carte d'événement
const DashboardEventCard = ({ event }: { event: Event }) => {
    const isPast = new Date(event.end_date) < new Date();
    const isOngoing = event.is_ongoing;

    const formatEventDate = (dateString: string, includeYear = true) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: includeYear ? 'numeric' : undefined
        };
        return date.toLocaleDateString('fr-FR', options);
    };

    const formatEventTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

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
                    <span>Plus que {event.available_seats} place{event.available_seats > 1 ? 's' : ''}</span>
                </div>
            );
        }

        return (
            <div className="flex items-center text-gray-500 dark:text-gray-400">
                <Users className="w-4 h-4 mr-2" />
                <span>{event.available_seats} places disponibles</span>
            </div>
        );
    };

    return (
        <div className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700/30 hover:shadow-xl transition-shadow duration-300 max-h-80">
            <div className="flex flex-col md:flex-row h-full">
                {/* Image */}
                <div className="md:w-1/3 relative overflow-hidden h-48 md:h-auto">
                    <img
                        src={event.featured_image?.original}
                        alt={event.title}
                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isPast ? 'filter grayscale' : ''
                            }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>

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

                    <div className="absolute bottom-0 left-0 right-0 md:hidden bg-gradient-to-t from-black to-transparent py-4 px-4">
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
                                <span>{formatEventDate(event.start_date)} - {formatEventDate(event.end_date)}</span>
                            </div>

                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>{formatEventTime(event.start_date)} - {formatEventTime(event.end_date)}</span>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                            <Link href={route('evenements.details', event.slug)}>
                                {event.title}
                            </Link>
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
                                {event.price === 0 ? 'Gratuit' : `${event.price} CHF`}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <Link
                                href={route('evenements.details', event.slug)}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors duration-200"
                            >
                                Détails
                            </Link>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ClientEvents = ({ events }: any) => {



    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const containerRef = useRef(null);
    const headerRef = useRef(null);
    const isHeaderInView = useInView(headerRef, { once: false, amount: 0.3 });

    const filterEvents = () => {
        const currentDate = new Date();
        return events?.data.filter((event: Event) => {
            const startDate = new Date(event.start_date);
            const endDate = new Date(event.end_date);
            const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description.toLowerCase().includes(searchTerm.toLowerCase());

            switch (statusFilter) {
                case 'ongoing':
                    return currentDate >= startDate && currentDate <= endDate && matchesSearch;
                case 'upcoming':
                    return startDate > currentDate && matchesSearch;
                case 'past':
                    return endDate < currentDate && matchesSearch;
                default:
                    return matchesSearch;
            }
        });
    };

    const filteredEvents = filterEvents();

    return (
        <DashboardLayout title="Tableau de bord" currentPage="events">
            <>
                <motion.div
                    ref={headerRef}
                    initial={{ opacity: 0, y: -20 }}
                    animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <Calendar className="w-7 h-7 mr-3 text-red-600" />
                        Mes Événements
                    </h1>

                    {/* Barre de recherche et filtres */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-grow relative">
                            <input
                                type="text"
                                placeholder="Rechercher un événement..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 pl-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {['all', 'ongoing', 'upcoming', 'past'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${statusFilter === status
                                        ? 'bg-red-600 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {status === 'all' && 'Tous'}
                                    {status === 'ongoing' && 'En cours'}
                                    {status === 'upcoming' && 'À venir'}
                                    {status === 'past' && 'Passés'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Compteur de résultats */}
                    <div className="text-gray-600 dark:text-gray-400">
                        {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} trouvé{filteredEvents.length > 1 ? 's' : ''}
                    </div>
                </motion.div>

                {/* Liste des événements */}
                <div className="space-y-6">
                    {filteredEvents.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-center py-12"
                        >
                            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Aucun événement trouvé
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Aucun événement ne correspond à vos critères de recherche.
                            </p>
                        </motion.div>
                    ) : (
                        filteredEvents.map((event: Event) => (
                            <DashboardEventCard
                                key={event.id}
                                event={event}
                            />
                        ))
                    )}
                </div>
            </>
        </DashboardLayout>
    );
};

export default ClientEvents;