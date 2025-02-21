

// export default FormationPage;
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
    History,
    CheckCircle,
    GraduationCap
} from 'lucide-react';
import { Head, Link } from '@inertiajs/react';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import { Badge } from '@/components/ui/badge';
import { route } from 'ziggy-js';
import FormationCard from '@/components/frontend/formations/formation-card';

const FormationsPage = ({ formations, featuredFormation }: any) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showPastFormations, setShowPastFormations] = useState(false);

    // Références pour animations au scroll
    const containerRef = useRef(null);
    const heroRef = useRef(null);
    const featuredRef = useRef(null);
    const upcomingRef = useRef(null);
    const pastFormationsRef = useRef(null);

    // Détection de visibilité pour animations
    const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 });
    const isFeaturedInView = useInView(featuredRef, { once: false, amount: 0.3 });
    const isUpcomingInView = useInView(upcomingRef, { once: false, amount: 0.2 });
    const isPastFormationsInView = useInView(pastFormationsRef, { once: false, amount: 0.2 });

    // Animation parallax
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

    // Date actuelle pour comparer
    const currentDate = new Date();

    // Vérifier si la formation en vedette est encore valide (pas passée)
    const validFeaturedFormation = featuredFormation && new Date(featuredFormation.end_date) >= currentDate ? featuredFormation : null;

    // Séparer les formations à venir des formations passées
    const [upcomingFormations, pastFormations] = formations?.data?.reduce(
        (result: any, formation: any) => {
            if (new Date(formation.end_date) >= currentDate) {
                result[0].push(formation);
            } else {
                result[1].push(formation);
            }
            return result;
        },
        [[], []]
    ) || [[], []];
    console.log("upcomingFormations", upcomingFormations);

    // Filtrage des formations
    const filterFormations = (formationsToFilter: any) => {
        return formationsToFilter.filter((formation: any) => {
            // Filtre par recherche
            const matchesSearch = searchTerm === '' ||
                formation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                formation.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                formation.tags.some((tag: any) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

            // Filtre par date
            const matchesDate = !selectedDate || new Date(formation.date).toDateString() === new Date(selectedDate).toDateString();

            return matchesSearch && matchesDate;
        });
    };

    const filteredUpcomingFormations = filterFormations(upcomingFormations);
    const filteredPastFormations = filterFormations(pastFormations);

    // Gestion des filtres
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedDate(null);
    };

    // Formatage des dates
    const formatFormationDate = (dateString: any, includeYear = true) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: includeYear ? 'numeric' : undefined
        };
        return date.toLocaleDateString('fr-FR', options as Intl.DateTimeFormatOptions);
    };

    const formatFormationTime = (dateString: any) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <Head title='Formations' />
            <FrontLayout>
                <main ref={containerRef} className="min-h-screen bg-white dark:bg-gray-950 pt-32 pb-20 overflow-hidden">
                    {/* Hero Section */}
                    <section ref={heroRef} className="relative pb-16">
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
                                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                                        Nos Formations
                                    </span>
                                </motion.div>

                                <motion.h1
                                    className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                >
                                    Développez vos <span className="text-primary">compétences</span> et <span className="text-primary">évoluez</span>
                                </motion.h1>

                                <motion.p
                                    className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                >
                                    Découvrez nos formations professionnelles et perfectionnez vos compétences avec des experts du domaine.
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
                                            placeholder="Rechercher une formation..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full px-5 py-3 pl-12 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                                </motion.div>
                            </div>

                            {/* Filters */}
                            <motion.div
                                className="flex justify-center gap-4 mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                <button
                                    onClick={() => setShowPastFormations(!showPastFormations)}
                                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${showPastFormations
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <History className="w-4 h-4 inline mr-2" />
                                    {showPastFormations ? 'Masquer les formations passées' : 'Voir les formations passées'}
                                </button>
                            </motion.div>
                        </div>
                    </section>

                    {/* Featured Formation */}
                    {validFeaturedFormation && (
                        <section ref={featuredRef} className="py-12">
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
                                            src={validFeaturedFormation?.featured_image?.original}
                                            alt={validFeaturedFormation?.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="relative z-20 py-16 px-6 md:py-24 md:px-12">
                                        <div className="max-w-3xl">
                                            <span className="inline-block px-3 py-1 bg-primary text-white text-sm font-medium rounded-full mb-6">
                                                Formation en vedette
                                            </span>

                                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                                {validFeaturedFormation.title}
                                            </h2>

                                            <p className="text-lg text-white/90 mb-8">
                                                {validFeaturedFormation.excerpt}
                                            </p>

                                            <div className="flex flex-wrap gap-6 mb-8">
                                                <div className="flex items-center text-white/80">
                                                    <Calendar className="w-5 h-5 mr-2" />
                                                    <span>Du {formatFormationDate(validFeaturedFormation.start_date)} au {formatFormationDate(validFeaturedFormation.end_date)}</span>
                                                </div>

                                                <div className="flex items-center text-white/80">
                                                    <MapPin className="w-5 h-5 mr-2" />
                                                    <span>{validFeaturedFormation.location}</span>
                                                </div>

                                                <div className="flex items-center text-white/80">
                                                    <Users className="w-5 h-5 mr-2" />
                                                    <span>{validFeaturedFormation.max_participants} participants max.</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="bg-black/30 p-3 rounded-lg">
                                                    <div className="text-sm text-white/70">Prix</div>
                                                    <div className="text-2xl font-bold text-white">{validFeaturedFormation.price} CHF</div>
                                                </div>

                                                <Link
                                                    href={route('formations.details', validFeaturedFormation.slug)}
                                                    className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors duration-300"
                                                >
                                                    En savoir plus
                                                    <ArrowRight className="ml-2 w-5 h-5" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </section>
                    )}

                    {/* Formations Grid */}
                    <section ref={upcomingRef} className="py-16">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="mb-12 flex justify-between items-end">

                                <motion.h2
                                    className="text-2xl font-bold mb-6"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isUpcomingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    Formations à venir
                                </motion.h2>
                                <motion.p
                                    className="text-gray-600 dark:text-gray-300"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isUpcomingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                >
                                    {filteredUpcomingFormations.length === 0 ? (
                                        "Aucune formation à venir ne correspond à votre recherche"
                                    ) : (
                                        `${filteredUpcomingFormations.length} formation${filteredUpcomingFormations.length > 1 ? 's' : ''} programmé${filteredUpcomingFormations.length > 1 ? 's' : ''}`
                                    )}
                                </motion.p>
                            </div>
                            {filteredUpcomingFormations.length === 0 ? (
                                <motion.div
                                    className="text-center py-12"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <p className="text-gray-500">Aucune formation à venir pour le moment</p>
                                </motion.div>
                            ) : (
                                <div className="space-y-8 ">
                                    {filteredUpcomingFormations.map((formation: any, index: number) => (
                                        <motion.div
                                            key={formation.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={isUpcomingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                        >
                                            <FormationCard formation={formation} />
                                        </motion.div>
                                    ))}
                                </div>
                            )}


                            {/* Past Formations */}
                            {showPastFormations && (
                                <div ref={pastFormationsRef}>
                                    <motion.h2
                                        className="text-2xl font-bold mb-6 flex items-center gap-2"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={isPastFormationsInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 20 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <History className="w-6 h-6" />
                                        Formations passées
                                    </motion.h2>

                                    {filteredPastFormations.length === 0 ? (
                                        <motion.div
                                            className="text-center py-12"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.6 }}
                                        >
                                            <p className="text-gray-500">Aucune formation passée ne correspond à vos critères</p>
                                        </motion.div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filteredPastFormations.map((formation: any, index: number) => (
                                                <motion.div
                                                    key={formation.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={isPastFormationsInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 20 }}
                                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                                >
                                                    <div className="relative">
                                                        <FormationCard formation={formation} />
                                                        <div className="absolute top-2 right-2">
                                                            <Badge
                                                                variant="secondary"
                                                                className="bg-gray-800/80 text-white"
                                                            >
                                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                                Terminée
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </FrontLayout>
        </>
    );
};

export default FormationsPage;
