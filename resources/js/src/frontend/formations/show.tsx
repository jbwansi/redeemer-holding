import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Share2,
    Heart,
    CheckCircle,
    X,
    ArrowLeft,
    FileText,
    MessageCircle,
    GraduationCap,
    CalendarDays,
    CreditCard,
    AlertCircle,
    ChevronDown,
    Phone,
    Mail,
    Globe,
    Star,
    Info,
    UserCircle,
    ArrowRight
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import { Button } from '@/components/ui/button';
import { route } from 'ziggy-js';
import FormationJoin from '@/components/frontend/formations/formation-join';

// Composant pour les avis/témoignages
const ReviewCard = ({ review }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/30">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img
                        src={review.user.avatar}
                        alt={review.user.name}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{review.user.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{review.date}</p>
                </div>
            </div>
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                    />
                ))}
            </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm">{review.comment}</p>
    </div>
);

const FormationDetailPage = ({ formation, relatedFormations }: any) => {
    const [isLiked, setIsLiked] = useState(false);
    const [activeTab, setActiveTab] = useState('description');

    // Références pour animations au scroll
    const containerRef = useRef(null);
    const heroRef = useRef(null);
    const detailsRef = useRef(null);
    const registrationRef = useRef(null);
    const relatedRef = useRef(null);

    // Détection de visibilité pour animations
    const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 });
    const isDetailsInView = useInView(detailsRef, { once: false, amount: 0.3 });
    const isRegistrationInView = useInView(registrationRef, { once: false, amount: 0.3 });
    const isRelatedInView = useInView(relatedRef, { once: false, amount: 0.2 });

    // Animation parallax
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

    // Formatage des dates
    const formatFormationDate = (dateString: string, includeYear = true) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: includeYear ? 'numeric' : undefined
        };
        return date.toLocaleDateString('fr-FR', options);
    };

    const formatFormationTime = (dateString: string) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    // Vérifier si la formation est passée
    const currentDate = new Date();
    const isFormationPassed = new Date(formation.end_date) < currentDate;

    // Calcul du temps restant jusqu'à la formation
    const calculateTimeRemaining = () => {
        const formationDate = new Date(formation.start_date);
        const difference = formationDate.getTime() - currentDate.getTime();

        if (difference <= 0) return null;

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return { days, hours };
    };

    const timeRemaining = calculateTimeRemaining();

    // Partager la formation
    const shareFormation = () => {
        if (navigator.share) {
            navigator.share({
                title: formation.title,
                text: `Découvrez la formation: ${formation.title}`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            // Afficher une notification (à implémenter)
        }
    };

    return (
        <FrontLayout>
            <main ref={containerRef} className="min-h-screen bg-white dark:bg-gray-950 pt-20 pb-20 overflow-hidden">
                {/* Hero Section */}
                <section ref={heroRef} className="relative">
                    {/* Background avec parallax */}
                    <div className="h-[50vh] md:h-[60vh] relative overflow-hidden">
                        <motion.div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage: `url('${formation.featured_image?.original}')`,
                                y: backgroundY
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

                        {/* Contenu du hero */}
                        <div className="absolute inset-0 flex items-end">
                            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                                <div className="max-w-4xl">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <Link
                                            href="/formations"
                                            className="inline-flex items-center text-white hover:text-primary/90 transition-colors duration-200"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-1" />
                                            <span>Retour aux formations</span>
                                        </Link>
                                    </div>

                                    {isFormationPassed && (
                                        <div className="mb-4">
                                            <span className="inline-block px-3 py-1 bg-gray-800/90 text-white text-sm font-medium rounded-full">
                                                <CheckCircle className="w-4 h-4 inline mr-1" />
                                                Formation terminée
                                            </span>
                                        </div>
                                    )}

                                    <motion.h1
                                        className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        {formation.title}
                                    </motion.h1>

                                    <motion.div
                                        className="flex flex-wrap gap-6 mb-6"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ duration: 0.6, delay: 0.1 }}
                                    >
                                        <div className="flex items-center text-white/80">
                                            <Calendar className="w-5 h-5 mr-2" />
                                            <span>Du {formatFormationDate(formation.start_date)} au {formatFormationDate(formation.end_date)}</span>
                                        </div>

                                        <div className="flex items-center text-white/80">
                                            <MapPin className="w-5 h-5 mr-2" />
                                            <span>{formation.location}</span>
                                        </div>

                                        <div className="flex items-center text-white/80">
                                            <Users className="w-5 h-5 mr-2" />
                                            <span>{formation.max_participants} participants max.</span>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="flex gap-3"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                    >
                                        {!isFormationPassed && timeRemaining && (
                                            <div className="bg-black/30 px-4 py-3 rounded-lg">
                                                <div className="text-xs text-white/70 mb-1">Débute dans</div>
                                                <div className="text-xl font-bold text-white">{timeRemaining.days}j {timeRemaining.hours}h</div>
                                            </div>
                                        )}

                                        <div className="bg-black/30 px-4 py-3 rounded-lg">
                                            <div className="text-xs text-white/70 mb-1">Prix</div>
                                            <div className="text-xl font-bold text-white">
                                                {formation.price == 0 ? 'Gratuit' : `${formation.price} CHF`}
                                            </div>
                                        </div>



                                        <div className="flex space-x-2 self-end">
                                            <button
                                                onClick={() => setIsLiked(!isLiked)}
                                                className={`p-3 rounded-full ${isLiked ? 'bg-primary text-white' : 'bg-black/30 text-white hover:bg-black/50'} transition-colors duration-200`}
                                                aria-label="Ajouter aux favoris"
                                            >
                                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
                                            </button>

                                            <button
                                                onClick={shareFormation}
                                                className="p-3 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors duration-200"
                                                aria-label="Partager cette formation"
                                            >
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>

                                    {!isFormationPassed && formation.available_seats > 0 && (
                                        <motion.div
                                            className="mt-8"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                            transition={{ duration: 0.6, delay: 0.3 }}
                                        >
                                            <a
                                                href="#inscription"
                                                onClick={() => setActiveTab('inscription')}
                                                className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors duration-300 inline-flex items-center"
                                            >
                                                <GraduationCap className="mr-2 w-5 h-5" />
                                                <span>S'inscrire à la formation</span>
                                            </a>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tags Section */}
                    <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <div className="flex flex-wrap gap-3">
                                {formation?.tags?.map((tag: string) => (
                                    <span key={tag} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tabs Navigation */}
                <div className="sticky top-16 z-10 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex overflow-x-auto hide-scrollbar">
                            <button
                                onClick={() => setActiveTab('description')}
                                className={`px-6 py-4 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${activeTab === 'description'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                Description
                            </button>

                            {!isFormationPassed && (
                                <button
                                    onClick={() => setActiveTab('inscription')}
                                    className={`px-6 py-4 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${activeTab === 'inscription'
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    Inscription
                                </button>
                            )}

                            {isFormationPassed && formation.reviews && formation.reviews.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('temoignages')}
                                    className={`px-6 py-4 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${activeTab === 'temoignages'
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    Témoignages
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Section */}
                <section ref={detailsRef} className="py-12">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row gap-10">
                            {/* Contenu principal */}
                            <div className="lg:w-2/3">
                                {/* Tab: Description */}
                                {activeTab === 'description' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={isDetailsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">À propos de cette formation</h2>

                                        <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-300 mb-8">
                                            <p>{formation.excerpt}</p>
                                            <div dangerouslySetInnerHTML={{ __html: formation.content }} />
                                        </div>

                                        {formation.skills && formation.skills.length > 0 && (
                                            <div className="mt-8">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Compétences acquises</h3>
                                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {formation.skills.map((skill: string, index: number) => (
                                                        <li key={index} className="flex items-start">
                                                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                                                            <span className="text-gray-700 dark:text-gray-300">{skill}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {formation.prerequisites && (
                                            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Prérequis</h3>
                                                <p className="text-gray-700 dark:text-gray-300">{formation.prerequisites}</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Tab: Inscription */}
                                {activeTab === 'inscription' && !isFormationPassed && (
                                    <div id="inscription">
                                        {formation.available_seats > 0 ? (
                                            <FormationJoin formation={formation} />
                                        ) : (
                                            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-8 text-center">
                                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Users className="w-8 h-8 text-red-600 dark:text-red-400" />
                                                </div>
                                                <h3 className="text-xl font-bold text-red-900 dark:text-red-300 mb-2">
                                                    Formation complète
                                                </h3>
                                                <p className="text-red-700 dark:text-red-400 mb-6">
                                                    Désolé, toutes les places pour cette formation ont été réservées.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tab: Témoignages */}
                                {activeTab === 'temoignages' && isFormationPassed && formation.reviews && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={isDetailsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <div className="flex justify-between items-center mb-8">
                                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Témoignages des participants</h2>

                                            <div className="flex items-center">
                                                <div className="flex mr-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-5 h-5 ${i < formation.average_rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">{formation.average_rating.toFixed(1)}</span>
                                                <span className="text-gray-500 dark:text-gray-400 ml-1">({formation.reviews.length} avis)</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {formation.reviews.map((review: any, index: number) => (
                                                <ReviewCard key={index} review={review} />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Sidebar - Informations clés et actions */}
                            <div className="lg:w-1/3">
                                <div className="sticky top-28">
                                    {/* Carte d'information */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700/30 mb-6">
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Informations clés</h3>

                                            <div className="space-y-4">
                                                <div className="flex">
                                                    <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Dates</h4>
                                                        <p className="text-gray-600 dark:text-gray-300">
                                                            Du {formatFormationDate(formation.start_date)}
                                                            <br />
                                                            au {formatFormationDate(formation.end_date)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex">
                                                    <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Horaires</h4>
                                                        <p className="text-gray-600 dark:text-gray-300">
                                                            De {formatFormationTime(formation.start_date)} à {formatFormationTime(formation.end_date)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex">
                                                    <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Lieu</h4>
                                                        <p className="text-gray-600 dark:text-gray-300">{formation.location}</p>
                                                    </div>
                                                </div>

                                                <div className="flex">
                                                    <div>


                                                        {/* Avertissement pour moins de 5 places */}
                                                        {!isFormationPassed && formation.available_seats > 0 && formation.available_seats <= 5 && (
                                                            <p className="text-amber-600 dark:text-amber-400 text-sm font-medium mt-1">
                                                                Plus que {formation.available_seats} place{formation.available_seats > 1 ? 's' : ''} disponible{formation.available_seats > 1 ? 's' : ''} !
                                                            </p>
                                                        )}

                                                        {/* Avertissement pour plus de places disponibles */}
                                                        {!isFormationPassed && formation.available_seats === 0 && (
                                                            <p className="text-red-600 dark:text-red-400 text-sm font-medium mt-1">
                                                                Complet - Plus de places disponibles
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex">
                                                    <CreditCard className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Prix</h4>
                                                        <p className="text-gray-600 dark:text-gray-300">
                                                            {formation.price == 0 ? 'Gratuit' : `${formation.price} CHF`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {!isFormationPassed && !formation.registration_closed && formation.available_seats > 0 && (
                                            <div className="px-6 pb-6">
                                                <a
                                                    href="#inscription"
                                                    onClick={() => setActiveTab('inscription')}
                                                    className="block w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-lg text-center font-medium transition-colors duration-300"
                                                >
                                                    S'inscrire maintenant
                                                </a>
                                            </div>
                                        )}

                                        <div className="px-6 pb-6 flex justify-between">
                                            <button
                                                onClick={shareFormation}
                                                className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                            >
                                                <Share2 className="w-4 h-4 mr-2" />
                                                <span>Partager</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Formateur */}
                                    {formation.instructor && (
                                        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700/30 mb-6">
                                            <div className="p-6">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Formateur</h3>

                                                <div className="flex items-start">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                                                        <img
                                                            src={formation.instructor.avatar || "/placeholder-avatar.jpg"}
                                                            alt={formation.instructor.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white">{formation.instructor.name}</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{formation.instructor.title}</p>
                                                        <Link
                                                            href={route('instructors.show', formation.instructor.slug)}
                                                            className="text-sm text-primary hover:underline"
                                                        >
                                                            Voir le profil
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Related Formations Section */}
                {relatedFormations && relatedFormations.length > 0 && (
                    <section ref={relatedRef} className="py-16 bg-gray-50 dark:bg-gray-900/50">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isRelatedInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6 }}
                                className="mb-12"
                            >
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Formations similaires</h2>
                                <p className="text-gray-600 dark:text-gray-300">Découvrez d'autres formations qui pourraient vous intéresser</p>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {relatedFormations.map((relatedFormation: any, index: number) => (
                                    <motion.div
                                        key={relatedFormation.id}
                                        className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700/30 hover:shadow-xl transition-shadow duration-300"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={isRelatedInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                        transition={{ duration: 0.7, delay: 0.1 + (index * 0.05) }}
                                    >
                                        {/* Image */}
                                        <div className="relative aspect-video overflow-hidden">
                                            <img
                                                src={relatedFormation.featured_image.original}
                                                alt={relatedFormation.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                                            {/* Date badge */}
                                            <div className="absolute top-4 left-4">
                                                <div className="flex flex-col items-center justify-center w-16 h-16 bg-white dark:bg-gray-900 rounded-lg text-center shadow-md">
                                                    <span className="block text-lg font-bold text-gray-900 dark:text-white">
                                                        {new Date(relatedFormation.start_date).getDate()}
                                                    </span>
                                                    <span className="block text-sm text-gray-600 dark:text-gray-400">
                                                        {new Date(relatedFormation.start_date).toLocaleDateString('fr-FR', { month: 'short' })}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Status badge */}
                                            {new Date(relatedFormation.end_date) < currentDate && (
                                                <div className="absolute bottom-4 right-4">
                                                    <span className="px-3 py-1 bg-gray-800/90 text-white text-sm font-medium rounded-full flex items-center">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Terminée
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors duration-300">
                                                <Link href={route('formations.show', relatedFormation.slug)}>
                                                    {relatedFormation.title}
                                                </Link>
                                            </h3>

                                            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                                                {relatedFormation.excerpt}
                                            </p>

                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    <span>{formatFormationDate(relatedFormation.start_date, false)}</span>
                                                </div>

                                                <div className="flex items-center">
                                                    <MapPin className="w-4 h-4 mr-1" />
                                                    <span>{relatedFormation.location}</span>
                                                </div>

                                                {relatedFormation.available_seats <= 5 && relatedFormation.available_seats > 0 && new Date(relatedFormation.end_date) >= currentDate && (
                                                    <div className="flex items-center text-red-600 dark:text-red-400">
                                                        <AlertCircle className="w-4 h-4 mr-1" />
                                                        <span>
                                                            {relatedFormation.available_seats} place{relatedFormation.available_seats > 1 ? 's' : ''} restante{relatedFormation.available_seats > 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                                                <div className="font-bold text-lg text-gray-900 dark:text-white">
                                                    {relatedFormation.price == 0 ? 'Gratuit' : `${relatedFormation.price} CHF`}
                                                </div>

                                                <Link
                                                    href={route('formations.show', relatedFormation.slug)}
                                                    className="flex items-center text-primary hover:underline"
                                                >
                                                    <span>Voir les détails</span>
                                                    <ArrowRight className="ml-1 w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </FrontLayout>
    );
};

export default FormationDetailPage;