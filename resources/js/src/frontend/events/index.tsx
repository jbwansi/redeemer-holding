import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Search,
    Filter,
    X,
    ArrowRight,
    ArrowUpRight,
    History,
    CheckCircle
} from 'lucide-react';
import { Head, Link } from '@inertiajs/react';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import EventCard from '@/components/frontend/events/event-card';

const EventsPage = ({ events, categories, featuredEvent }: any) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showPastEvents, setShowPastEvents] = useState(false);

    // Références pour animations au scroll
    const containerRef = useRef(null);
    const heroRef = useRef(null);
    const featuredRef = useRef(null);
    const upcomingRef = useRef(null);
    const pastEventsRef = useRef(null);

    // Détection de visibilité pour animations
    const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 });
    const isFeaturedInView = useInView(featuredRef, { once: false, amount: 0.3 });
    const isUpcomingInView = useInView(upcomingRef, { once: false, amount: 0.2 });
    const isPastEventsInView = useInView(pastEventsRef, { once: false, amount: 0.2 });

    // Animation parallax
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

    // Date actuelle pour comparer
    const currentDate = new Date();

    // Vérifier si l'événement en vedette est encore valide (pas passé)
    const validFeaturedEvent = featuredEvent && new Date(featuredEvent.end_date) >= currentDate ? featuredEvent : null;

    // Séparer les événements à venir des événements passés
    const [upcomingEvents, pastEvents] = events?.data?.reduce(
        (result: any, event: any) => {
            if (new Date(event.end_date) >= currentDate) {
                result[0].push(event);
            } else {
                result[1].push(event);
            }
            return result;
        },
        [[], []]
    ) || [[], []];

    // Filtrage des événements
    const filterEvents = (eventsToFilter: any) => {
        return eventsToFilter.filter((event: any) => {
            // Filtre par recherche
            const matchesSearch = searchTerm === '' ||
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.tags.some((tag: any) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

            // Filtre par catégorie
            const matchesCategory = !selectedCategory || event.category.name === selectedCategory;

            // Filtre par date
            const matchesDate = !selectedDate || new Date(event.date).toDateString() === new Date(selectedDate).toDateString();

            return matchesSearch && matchesCategory && matchesDate;
        });
    };

    const filteredUpcomingEvents = filterEvents(upcomingEvents);
    const filteredPastEvents = filterEvents(pastEvents);

    // Gestion des filtres
    const handleCategorySelect = (categoryName: any) => {
        setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory(null);
        setSelectedDate(null);
    };

    // Formatage des dates
    const formatEventDate = (dateString: any, includeYear = true) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: includeYear ? 'numeric' : undefined
        };
        return date.toLocaleDateString('fr-FR', options as Intl.DateTimeFormatOptions);
    };

    const formatEventTime = (dateString: any) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <Head title='Evènements' />
            <FrontLayout>
                <main ref={containerRef} className="min-h-screen bg-white dark:bg-gray-950 pt-32 pb-20 overflow-hidden">
                    {/* Hero Section */}
                    <section ref={heroRef} className="relative pb-16">
                        {/* Background with parallax */}
                        <motion.div
                            className="absolute inset-0 bg-cover bg-center opacity-5 dark:opacity-10"
                            style={{
                                backgroundImage: "url('/assets/images/pattern-bg.jpg')",
                                y: backgroundY
                            }}
                        />

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                            <div className="text-center max-w-3xl mx-auto mb-10">
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <span className="inline-block py-1 px-3 rounded-full bg-red-500/10 text-red-600 text-sm font-medium mb-4">
                                        Nos Événements
                                    </span>
                                </motion.div>

                                <motion.h1
                                    className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                >
                                    Rencontrez, <span className="text-red-600">apprenez</span> et <span className="text-red-600">évoluez</span>
                                </motion.h1>

                                <motion.p
                                    className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                >
                                    Participez à nos événements transformateurs et connectez-vous avec une communauté partageant les mêmes valeurs.
                                </motion.p>

                                {/* Search bar */}
                                <motion.div
                                    className="max-w-xl mx-auto relative"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                >
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Rechercher un événement..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full px-5 py-3 pl-12 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="md:hidden mt-3">
                                        <button
                                            onClick={() => setShowFilters(!showFilters)}
                                            className="flex items-center justify-center w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                                        >
                                            <Filter className="w-4 h-4 mr-2" />
                                            <span>{showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}</span>
                                        </button>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Filters desktop */}
                            <motion.div
                                className="hidden md:block"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                <div className="flex flex-wrap justify-center gap-2 mb-4">
                                    {(selectedCategory || selectedDate) && (
                                        <button
                                            onClick={clearFilters}
                                            className="inline-flex items-center px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors duration-200"
                                        >
                                            <X className="w-3 h-3 mr-1" />
                                            Effacer les filtres
                                        </button>
                                    )}

                                    {categories?.map((category: any) => (
                                        <button
                                            key={category.id}
                                            onClick={() => handleCategorySelect(category.name)}
                                            className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${selectedCategory === category.name
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            {category.icon} {category.name}
                                        </button>
                                    ))}

                                    {/* Bouton pour afficher/masquer les événements passés */}
                                    <button
                                        onClick={() => setShowPastEvents(!showPastEvents)}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${showPastEvents
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <History className="w-3 h-3 inline mr-1" />
                                        {showPastEvents ? 'Masquer les événements passés' : 'Afficher les événements passés'}
                                    </button>
                                </div>
                            </motion.div>

                            {/* Filters mobile */}
                            {showFilters && (
                                <motion.div
                                    className="md:hidden mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="mb-4">
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Catégories</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {categories?.map((category: any) => (
                                                <button
                                                    key={category.id}
                                                    onClick={() => handleCategorySelect(category.name)}
                                                    className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${selectedCategory === category.name
                                                        ? 'bg-red-600 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                        }`}
                                                >
                                                    {category.icon} {category.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Option pour afficher les événements passés (mobile) */}
                                    <div className="mb-4">
                                        <button
                                            onClick={() => setShowPastEvents(!showPastEvents)}
                                            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 ${showPastEvents
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            <History className="w-4 h-4 mr-2" />
                                            {showPastEvents ? 'Masquer les événements passés' : 'Afficher les événements passés'}
                                        </button>
                                    </div>

                                    {(selectedCategory || selectedDate) && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                onClick={clearFilters}
                                                className="w-full flex items-center justify-center px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors duration-200"
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                Effacer tous les filtres
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </section>

                    {/* Featured Event Section - Visible seulement si événement valide */}
                    {validFeaturedEvent && (
                        <section ref={featuredRef} className="py-12 relative overflow-hidden">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <motion.div
                                    className="rounded-2xl overflow-hidden relative"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={isFeaturedInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                    transition={{ duration: 0.7 }}
                                >
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/30 z-10"></div>

                                    {/* Background image */}
                                    <div className="absolute inset-0">
                                        <img
                                            src={validFeaturedEvent?.featured_image?.original}
                                            alt={validFeaturedEvent?.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="relative z-20 py-16 px-6 md:py-24 md:px-12 lg:px-20 xl:px-24">
                                        <div className="max-w-3xl">
                                            <span className="inline-block px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full mb-6">
                                                Événement à la une
                                            </span>

                                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                                                {validFeaturedEvent.title}
                                            </h2>

                                            <p className="text-lg text-white/90 mb-8">
                                                {validFeaturedEvent?.description}
                                            </p>

                                            <div className="flex flex-wrap gap-6 mb-8">
                                                <div className="flex items-center text-white/80">
                                                    <Calendar className="w-5 h-5 mr-2" />
                                                    <span>{formatEventDate(validFeaturedEvent?.start_date)} - {formatEventDate(validFeaturedEvent.end_date)}</span>
                                                </div>

                                                <div className="flex items-center text-white/80">
                                                    <Clock className="w-5 h-5 mr-2" />
                                                    <span>{formatEventTime(validFeaturedEvent?.start_date)} - {formatEventTime(validFeaturedEvent.end_date)}</span>
                                                </div>

                                                <div className="flex items-center text-white/80">
                                                    <MapPin className="w-5 h-5 mr-2" />
                                                    <span>{validFeaturedEvent.location}</span>
                                                </div>

                                                <div className="flex items-center text-white/80">
                                                    <Users className="w-5 h-5 mr-2" />
                                                    <span>Places : {validFeaturedEvent.available_seats}/{validFeaturedEvent.max_participants}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 mb-10">
                                                {validFeaturedEvent.tags.map((tag: any) => (
                                                    <span key={tag} className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="bg-black/30 p-3 rounded-lg">
                                                    <div className="text-sm text-white/70 mb-1">Prix</div>
                                                    {
                                                        validFeaturedEvent.price == 0 ? <div className="text-2xl font-bold text-white">GRATUIT</div>
                                                            : <div className="text-2xl font-bold text-white">{validFeaturedEvent.price} CHF</div>
                                                    }

                                                </div>

                                                <Link
                                                    href={`/evenements/${validFeaturedEvent.slug}`}
                                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-300 flex items-center"
                                                >
                                                    <span>Réserver ma place</span>
                                                    <ArrowRight className="ml-2 w-5 h-5" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </section>
                    )}

                    {/* Upcoming Events Section */}
                    <section ref={upcomingRef} className="py-16">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="mb-12 flex justify-between items-end">
                                <div>
                                    <motion.h2
                                        className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={isUpcomingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        Événements à venir
                                    </motion.h2>

                                    <motion.p
                                        className="text-gray-600 dark:text-gray-300"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={isUpcomingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ duration: 0.6, delay: 0.1 }}
                                    >
                                        {filteredUpcomingEvents.length === 0 ? (
                                            "Aucun événement à venir ne correspond à votre recherche"
                                        ) : (
                                            `${filteredUpcomingEvents.length} événement${filteredUpcomingEvents.length > 1 ? 's' : ''} programmé${filteredUpcomingEvents.length > 1 ? 's' : ''}`
                                        )}
                                    </motion.p>
                                </div>

                                {/* Clear filters button (desktop) */}
                                {(selectedCategory || selectedDate) && (
                                    <motion.button
                                        onClick={clearFilters}
                                        className="hidden md:inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={isUpcomingInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Effacer les filtres
                                    </motion.button>
                                )}
                            </div>

                            {filteredUpcomingEvents.length === 0 ? (
                                <motion.div
                                    className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 text-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isUpcomingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun événement à venir</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">Aucun événement à venir ne correspond à vos critères de recherche.</p>
                                    <button
                                        onClick={clearFilters}
                                        className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300"
                                    >
                                        <span>Réinitialiser la recherche</span>
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="space-y-8">
                                    {filteredUpcomingEvents.map((event: any, index: any) => (
                                        <EventCard event={event} key={index} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Past Events Section - seulement visible si showPastEvents est true */}
                    {showPastEvents && pastEvents.length > 0 && (
                        <section ref={pastEventsRef} className="py-16 bg-gray-50 dark:bg-gray-900/50">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="mb-12">
                                    <motion.div
                                        className="flex items-center gap-2 mb-2"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={isPastEventsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <History className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                            Événements passés
                                        </h2>
                                    </motion.div>

                                    <motion.p
                                        className="text-gray-600 dark:text-gray-300"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={isPastEventsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ duration: 0.6, delay: 0.1 }}
                                    >
                                        {filteredPastEvents.length === 0 ? (
                                            "Aucun événement passé ne correspond à votre recherche"
                                        ) : (
                                            `${filteredPastEvents.length} événement${filteredPastEvents.length > 1 ? 's' : ''} passé${filteredPastEvents.length > 1 ? 's' : ''}`
                                        )}
                                    </motion.p>
                                </div>

                                {filteredPastEvents.length === 0 ? (
                                    <motion.div
                                        className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={isPastEventsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <History className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun événement passé</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">Aucun événement passé ne correspond à vos critères de recherche.</p>
                                        <button
                                            onClick={clearFilters}
                                            className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-300"
                                        >
                                            <span>Réinitialiser la recherche</span>
                                        </button>
                                    </motion.div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredPastEvents.map((event: any, index: any) => (
                                            <motion.div
                                                key={event.id}
                                                className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow border border-gray-100 dark:border-gray-700/30 hover:shadow-md transition-shadow duration-300"
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={isPastEventsInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 30 }}
                                                transition={{ duration: 0.7, delay: 0.1 + (index * 0.05) }}
                                            >
                                                {/* Image avec badge "Événement passé" */}
                                                <div className="relative aspect-video overflow-hidden">
                                                    <img
                                                        src={event.featured_image.original}
                                                        alt={event.title}
                                                        className="w-full h-full object-cover filter grayscale transition-all duration-500 group-hover:grayscale-0"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                                                    {/* Badge événement passé */}
                                                    <div className="absolute top-4 right-4">
                                                        <span className="px-3 py-1 bg-gray-800/90 text-white text-sm font-medium rounded-full flex items-center">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Terminé
                                                        </span>
                                                    </div>

                                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-full">
                                                                {event.category.name}
                                                            </span>
                                                            <div className="flex items-center text-white text-sm">
                                                                <Calendar className="w-3 h-3 mr-1" />
                                                                <span>{formatEventDate(event.start_date, false)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-5">
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                                                        <Link href={`/evenements/${event.id}`}>
                                                            {event.title}
                                                        </Link>
                                                    </h3>

                                                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-2">
                                                        {event.description}
                                                    </p>

                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {event.tags.slice(0, 2).map((tag: any) => (
                                                            <span
                                                                key={tag}
                                                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                                                            >
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                                            <MapPin className="w-3 h-3 mr-1" />
                                                            <span>{event.isVirtual ? 'En ligne' : `${event.location}`}</span>
                                                        </div>

                                                        <Link
                                                            href={`/evenements/${event.id}`}
                                                            className="text-red-600 dark:text-red-400 text-sm font-medium hover:underline flex items-center"
                                                        >
                                                            Voir le récap
                                                            <ArrowRight className="ml-1 w-3 h-3" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </main>
            </FrontLayout>
        </>
    );
};

export default EventsPage;
