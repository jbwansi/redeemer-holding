import React, { useRef, useState } from 'react';
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
    ArrowUpRight
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import FrontLayout from '@/components/frontend/layouts/front-layout';

const EventsPage = ({ events, categories, featuredEvent }: any) => {
    console.log(events);

    // États
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Références pour animations au scroll
    const containerRef = useRef(null);
    const heroRef = useRef(null);
    const featuredRef = useRef(null);
    const upcomingRef = useRef(null);

    // Détection de visibilité pour animations
    const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 });
    const isFeaturedInView = useInView(featuredRef, { once: false, amount: 0.3 });
    const isUpcomingInView = useInView(upcomingRef, { once: false, amount: 0.2 });

    // Animation parallax
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

    // Données d'exemple (à remplacer par les props)
    const allCategories = [
        { id: 1, name: 'Ateliers pratiques', count: 12, icon: '🛠️', color: 'from-red-500 to-orange-500' },
        { id: 2, name: 'Conférences', count: 8, icon: '🎤', color: 'from-purple-500 to-indigo-500' },
        { id: 3, name: 'Retraites', count: 5, icon: '🧘', color: 'from-emerald-500 to-teal-500' },
        { id: 4, name: 'Séminaires', count: 10, icon: '👥', color: 'from-amber-500 to-yellow-500' },
        { id: 5, name: 'Webinaires', count: 15, icon: '💻', color: 'from-blue-500 to-cyan-500' }
    ];

    const defaultFeaturedEvent = featuredEvent || {
        id: 1,
        title: "Masterclass : Développer son leadership authentique",
        description: "Une journée intensive pour découvrir et développer votre style de leadership unique, basée sur les dernières recherches en neurosciences et psychologie positive.",
        date: "2025-03-25T09:00:00.000Z",
        endDate: "2025-03-25T17:00:00.000Z",
        location: {
            name: "Hôtel Le Royal",
            address: "2 Place de la République, 75002 Paris",
            city: "Paris",
            coordinates: {
                lat: 48.8656,
                lng: 2.3520
            }
        },
        coverImage: "/assets/images/events/leadership-masterclass.jpg",
        featured_image: {
            original:  "/assets/images/coaching-session.jpg"
        },
        category: "Séminaires",
        isFeatured: true,
        isVirtual: false,
        price: 490,
        earlyBirdPrice: 390,
        earlyBirdDeadline: "2025-02-25T23:59:59.000Z",
        capacity: 50,
        availableSeats: 12,
        speakers: [
            {
                name: "Jean Bernard",
                title: "Coach exécutif & Fondateur",
                avatar: "/assets/images/avatar.jpg"
            },
            {
                name: "Dr. Sophie Moreau",
                title: "Neuroscientifique",
                avatar: "/assets/images/authors/sophie.jpg"
            }
        ],
        tags: ["Leadership", "Développement personnel", "Carrière"],
        highlights: [
            "Évaluation personnalisée de votre profil de leadership",
            "Techniques concrètes pour inspirer et motiver votre équipe",
            "Déjeuner networking avec les intervenants",
            "Certificat de participation"
        ]
    };


    // Dates des événements pour le calendrier
    const eventDates = events.data?.reduce((dates: any, event: any) => {
        const eventDate = new Date(event.date);
        const dateKey = `${eventDate.getFullYear()}-${eventDate.getMonth() + 1}-${eventDate.getDate()}`;

        if (!dates[dateKey]) {
            dates[dateKey] = [];
        }

        dates[dateKey].push(event);
        return dates;
    }, {});

    // Mois actuels et suivants pour le calendrier
    const currentDate = new Date();
    const months = [
        { month: currentDate.getMonth(), year: currentDate.getFullYear() },
        { month: (currentDate.getMonth() + 1) % 12, year: currentDate.getFullYear() + (currentDate.getMonth() === 11 ? 1 : 0) },
        { month: (currentDate.getMonth() + 2) % 12, year: currentDate.getFullYear() + (currentDate.getMonth() >= 10 ? 1 : 0) }
    ];

    // Noms des mois
    const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    // Filtrage des événements
    const filteredEvents = events?.data?.filter((event: any) => {
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

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
    };

    // Gestion des filtres
    const handleCategorySelect = (categoryName: any) => {
        setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
    };

    const handleDateSelect = (date: any) => {
        setSelectedDate(selectedDate === date ? null : date);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory(null);
        setSelectedDate(null);
    };

    // Formatage des dates
    const formatEventDate = (dateString: any, includeYear = true) => {
        const date = new Date(dateString);
        const options = {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: includeYear ? 'numeric' : undefined
        };
        return date.toLocaleDateString('fr-FR', options);
    };

    const formatEventTime = (dateString: any) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    // Génération du calendrier pour un mois donné
    const generateCalendar = (month: any, year: any) => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Ajustement pour commencer par lundi (0 = dimanche en JavaScript)
        const startingDay = firstDay === 0 ? 6 : firstDay - 1;

        const calendar = [];
        let day = 1;

        // Les jours de la semaine
        const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

        // Création des semaines
        for (let i = 0; i < 6; i++) {
            const week = [];

            // Création des jours dans la semaine
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < startingDay) {
                    // Jours vides avant le début du mois
                    week.push(null);
                } else if (day > daysInMonth) {
                    // Jours vides après la fin du mois
                    week.push(null);
                } else {
                    // Vérification si cette date a des événements
                    const dateKey = `${year}-${month + 1}-${day}`;
                    const hasEvents = !!eventDates[dateKey];

                    week.push({
                        day,
                        hasEvents,
                        events: eventDates[dateKey] || [],
                        date: new Date(year, month, day)
                    });
                    day++;
                }
            }

            if (week.some(day => day !== null)) {
                calendar.push(week);
            }
        }

        return { weekDays, calendar };
    };

    return (
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

                                {allCategories.map((category: any) => (
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
                                        {allCategories.map((category: any) => (
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

                {/* Featured Event Section */}
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
                                    src={defaultFeaturedEvent?.featured_image?.original}
                                    alt={defaultFeaturedEvent?.title}
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
                                        {defaultFeaturedEvent.title}
                                    </h2>

                                    <p className="text-lg text-white/90 mb-8">
                                        {defaultFeaturedEvent?.description}
                                    </p>

                                    <div className="flex flex-wrap gap-6 mb-8">
                                        <div className="flex items-center text-white/80">
                                            <Calendar className="w-5 h-5 mr-2" />
                                            <span>{formatEventDate(defaultFeaturedEvent?.start_date)} - {formatEventDate(defaultFeaturedEvent.end_date)}</span>
                                        </div>

                                        <div className="flex items-center text-white/80">
                                            <Clock className="w-5 h-5 mr-2" />
                                            <span>{formatEventTime(defaultFeaturedEvent?.start_date)} - {formatEventTime(defaultFeaturedEvent.end_date)}</span>
                                        </div>

                                        <div className="flex items-center text-white/80">
                                            <MapPin className="w-5 h-5 mr-2" />
                                            <span>{defaultFeaturedEvent.location.name}, {defaultFeaturedEvent.location.city}</span>
                                        </div>

                                        <div className="flex items-center text-white/80">
                                            <Users className="w-5 h-5 mr-2" />
                                            <span>Places : {defaultFeaturedEvent.availableSeats}/{defaultFeaturedEvent.capacity}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mb-10">
                                        {defaultFeaturedEvent.tags.map((tag: any) => (
                                            <span key={tag} className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="bg-black/30 p-3 rounded-lg">
                                            <div className="text-sm text-white/70 mb-1">Prix</div>
                                            <div className="text-2xl font-bold text-white">{defaultFeaturedEvent.price} CHF</div>
                                        </div>

                                        <Link
                                            href={`/evenements/${defaultFeaturedEvent.slug}`}
                                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-300 flex items-center"
                                        >
                                            <span>Réserver ma place</span>
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </Link>

                                    </div>
                                </div>

                                {/* <div className="absolute bottom-8 right-8 flex -space-x-3">
                                    {defaultFeaturedEvent.speakers.map((speaker: any, index: any) => (
                                        <div
                                            key={index}
                                            className="w-12 h-12 rounded-full border-2 border-white overflow-hidden"
                                            title={`${speaker.name}, ${speaker.title}`}
                                        >
                                            <img
                                                src={speaker.avatar}
                                                alt={speaker.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div> */}
                            </div>
                        </motion.div>
                    </div>
                </section>

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
                                    {filteredEvents.length === 0 ? (
                                        "Aucun événement ne correspond à votre recherche"
                                    ) : (
                                        `${filteredEvents.length} événement${filteredEvents.length > 1 ? 's' : ''} programmé${filteredEvents.length > 1 ? 's' : ''}`
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

                        {filteredEvents.length === 0 ? (
                            <motion.div
                                className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 text-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isUpcomingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun événement trouvé</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">Aucun événement ne correspond à vos critères de recherche.</p>
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300"
                                >
                                    <span>Réinitialiser la recherche</span>
                                </button>
                            </motion.div>
                        ) : (
                            <div className="space-y-8">
                                {filteredEvents.map((event: any, index: any) => (
                                    <motion.div
                                        key={event.id}
                                        className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700/30 hover:shadow-xl transition-shadow duration-300 max-h-80"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={isUpcomingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                        transition={{ duration: 0.7, delay: 0.1 + (index * 0.05) }}
                                    >
                                        <div className="flex flex-col md:flex-row h-full">
                                            {/* Image */}
                                            <div className="md:w-1/3 relative overflow-hidden h-48 md:h-auto">
                                                <img
                                                    src={event.featured_image.original}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>

                                                {/* Category badge */}
                                                <div className="absolute top-4 left-4">
                                                    <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 text-red-600 text-sm font-medium rounded-full">
                                                        {event.category.name}
                                                    </span>
                                                </div>

                                                {event.isVirtual && (
                                                    <div className="absolute top-4 right-4">
                                                        <span className="px-3 py-1 bg-blue-600/90 text-white text-sm font-medium rounded-full">
                                                            Événement en ligne
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
                                                            <span>{formatEventDate(event.start_date)} - {formatEventDate(event.end_date)} </span>
                                                        </div>

                                                        <div className="flex items-center">
                                                            <Clock className="w-4 h-4 mr-2" />
                                                            <span>{formatEventTime(event.start_date)} - {formatEventTime(event.end_date)}</span>
                                                        </div>
                                                    </div>

                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                                                        <Link href={`/evenements/${event.id}`}>
                                                            {event.title}
                                                        </Link>
                                                    </h3>

                                                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                                                        {event.description}
                                                    </p>

                                                    <div className="flex flex-wrap gap-4 mb-4">
                                                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                                                            <MapPin className="w-4 h-4 mr-2" />
                                                            <span>{event.isVirtual ? 'En ligne' : `${event.location}`}</span>
                                                        </div>

                                                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                                                            <Users className="w-4 h-4 mr-2" />
                                                            <span>
                                                                {event.max_participants <= 5 ? (
                                                                    <span className="text-red-600 dark:text-red-400 font-medium">
                                                                        Plus que {event.max_participants} place{event.max_participants > 1 ? 's' : ''}
                                                                    </span>
                                                                ) : (
                                                                    <span>{event.max_participants} places disponibles</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 mb-6">
                                                        {event.tags.slice(0, 3).map((tag: any) => (
                                                            <span
                                                                key={tag}
                                                                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                                                            >
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                                                    <div className="flex items-baseline">
                                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                            {event.price === 0 ? 'Gratuit' : `${event.price} CHF`}
                                                        </span>
                                                        {event.earlyBirdPrice && (
                                                            <span className="ml-2 text-sm text-green-600 dark:text-green-400">
                                                                Early bird: {event.earlyBirdPrice}€
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Link
                                                            href={`/evenements/${event.id}`}
                                                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors duration-200"
                                                        >
                                                            Détails
                                                        </Link>
                                                        <Link
                                                            href={`/evenements/${event.id}#registration`}
                                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center"
                                                        >
                                                            <span>Réserver</span>
                                                            <ArrowUpRight className="ml-1 w-4 h-4" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>


            </main>
        </FrontLayout>
    );
};

export default EventsPage;
