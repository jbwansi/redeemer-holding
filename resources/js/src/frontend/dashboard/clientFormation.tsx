import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Search,
    GraduationCap,
    CheckCircle,
    History,
    X,
    ChevronRight,
    Home,
    User
} from 'lucide-react';
import { Head, Link, usePage } from '@inertiajs/react';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import { Sidebar } from '@/components/frontend/layouts/sidebar';
import { route } from 'ziggy-js';
import DashboardLayout from '@/components/frontend/layouts/dashboard-layout';


interface Formation {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    featured_image: {
        original: string;
    };
    start_date: string;
    end_date: string;
    location: string;
    price: number;
    max_participants: number;
    available_seats: number;
    is_full: boolean;
    is_ongoing: boolean;
}

interface ClientFormationsProps {

    data: Formation[];

}

const FormationStatus = {
    ALL: 'all',
    ONGOING: 'ongoing',
    UPCOMING: 'upcoming',
    PAST: 'past'
};

const DashboardFormationCard = ({ formation }: { formation: Formation }) => {
    const isPast = new Date(formation.end_date) < new Date();
    const isOngoing = formation.is_ongoing;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700/30 hover:shadow-xl transition-shadow duration-300"
        >
            <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-1/3 relative h-48 md:h-auto overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src={formation.featured_image.original}
                            alt={formation.title}
                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isPast ? 'filter grayscale' : ''
                                }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 text-red-600 text-sm font-medium rounded-full flex items-center">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            Formation
                        </span>
                    </div>

                    {isPast && (
                        <div className="absolute top-4 right-4 z-10">
                            <span className="px-3 py-1 bg-gray-800/90 text-white text-sm font-medium rounded-full flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Terminée
                            </span>
                        </div>
                    )}

                    {isOngoing && !isPast && (
                        <div className="absolute top-4 right-4 z-10">
                            <span className="px-3 py-1 bg-green-600/90 text-white text-sm font-medium rounded-full flex items-center">
                                En cours
                            </span>
                        </div>
                    )}
                </div>

                {/* Contenu */}
                <div className="md:w-2/3 p-6 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                            {formation.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                            {formation.excerpt}
                        </p>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="line-clamp-1">Du {formatDate(formation.start_date)}</span>
                        </div>
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>{formatTime(formation.start_date)} - {formatTime(formation.end_date)}</span>
                        </div>
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="line-clamp-1">{formation.location}</span>
                        </div>
                        {!isPast && (
                            <div className="flex items-center text-gray-500 dark:text-gray-400">
                                <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span>{formation.is_full ? 'Complet' : `${formation.available_seats} places disponibles`}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {formation.price === 0 ? 'Gratuit' : `${formation.price} CHF`}
                        </span>
                        <Link
                            href={`/formations/${formation.slug}`}
                            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                        >
                            <span>Voir les détails</span>
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const ClientFormations = ({ formations }: any) => {



    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(FormationStatus.ALL);
    const containerRef = useRef(null);
    const headerRef = useRef(null);
    const isHeaderInView = useInView(headerRef, { once: false, amount: 0.3 });

    const filterFormations = () => {
        const currentDate = new Date();
        return formations?.data?.filter((formation: Formation) => {
            const startDate = new Date(formation.start_date);
            const endDate = new Date(formation.end_date);
            const matchesSearch = formation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                formation.excerpt.toLowerCase().includes(searchTerm.toLowerCase());

            switch (statusFilter) {
                case FormationStatus.ONGOING:
                    return currentDate >= startDate && currentDate <= endDate && matchesSearch;
                case FormationStatus.UPCOMING:
                    return startDate > currentDate && matchesSearch;
                case FormationStatus.PAST:
                    return endDate < currentDate && matchesSearch;
                default:
                    return matchesSearch;
            }
        });
    };

    const filteredFormations = filterFormations();

    return (
        <DashboardLayout title="Tableau de bord" currentPage="formations">
            <>
                {/* En-tête */}
                <motion.div
                    ref={headerRef}
                    initial={{ opacity: 0, y: -20 }}
                    animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <GraduationCap className="w-7 h-7 mr-3 text-red-600" />
                        Mes Formations
                    </h1>

                    {/* Barre de recherche et filtres */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-grow relative">
                            <input
                                type="text"
                                placeholder="Rechercher une formation..."
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
                            {Object.values(FormationStatus).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${statusFilter === status
                                        ? 'bg-red-600 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {status === FormationStatus.ALL && 'Toutes'}
                                    {status === FormationStatus.ONGOING && 'En cours'}
                                    {status === FormationStatus.UPCOMING && 'À venir'}
                                    {status === FormationStatus.PAST && 'Passées'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Compteur de résultats */}
                    <div className="text-gray-600 dark:text-gray-400">
                        {filteredFormations.length} formation{filteredFormations.length > 1 ? 's' : ''} trouvée{filteredFormations.length > 1 ? 's' : ''}
                    </div>
                </motion.div>

                {/* Liste des formations */}
                <div className="space-y-6">
                    {filteredFormations.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-center py-12"
                        >
                            <GraduationCap className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Aucune formation trouvée
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Aucune formation ne correspond à vos critères de recherche.
                            </p>
                        </motion.div>
                    ) : (
                        filteredFormations.map((formation: Formation, index: number) => (
                            <DashboardFormationCard
                                key={formation.id}
                                formation={formation}
                            />
                        ))
                    )}
                </div>
            </>
        </DashboardLayout>


    );
};

export default ClientFormations;