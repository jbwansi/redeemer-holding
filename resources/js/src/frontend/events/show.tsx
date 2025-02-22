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
    Ticket,
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
import EventJoin from '@/components/frontend/events/event-join';
import { Button } from '@/components/ui/button';

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


// Page principale de détail d'événement
const EventDetailPage = ({ event, relatedEvents }: any) => {
    const [isLiked, setIsLiked] = useState(false);
    const [selectedTicketType, setSelectedTicketType] = useState(null);
    const [ticketQuantity, setTicketQuantity] = useState(1);
    const [openFaqIndex, setOpenFaqIndex] = useState(0);
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
    const formatEventDate = (dateString, includeYear = true) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const options = {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: includeYear ? 'numeric' : undefined
        };
        return date.toLocaleDateString('fr-FR', options);
    };

    const formatEventTime = (dateString) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    // Vérifier si l'événement est passé
    const currentDate = new Date();
    const isEventPassed = new Date(event.end_date) < currentDate;

    // Calcul du temps restant jusqu'à l'événement
    const calculateTimeRemaining = () => {
        const eventDate = new Date(event.start_date);
        const difference = eventDate.getTime() - currentDate.getTime();

        if (difference <= 0) return null;

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return { days, hours };
    };

    const timeRemaining = calculateTimeRemaining();

    // Partager l'événement
    const shareEvent = () => {
        if (navigator.share) {
            navigator.share({
                title: event.title,
                text: `Découvrez l'événement: ${event.title}`,
                url: window.location.href,
            });
        } else {
            // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
            navigator.clipboard.writeText(window.location.href);
            // Afficher une notification (non implémentée ici)
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
                                backgroundImage: `url('${event.featured_image?.original}')`,
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
                                            href="/evenements"
                                            className="inline-flex items-center text-white hover:text-red-300 transition-colors duration-200"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-1" />
                                            <span>Retour aux événements</span>
                                        </Link>
                                    </div>

                                    {isEventPassed && (
                                        <div className="mb-4">
                                            <span className="inline-block px-3 py-1 bg-gray-800/90 text-white text-sm font-medium rounded-full">
                                                <CheckCircle className="w-4 h-4 inline mr-1" />
                                                Événement terminé
                                            </span>
                                        </div>
                                    )}

                                    <motion.h1
                                        className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        {event.title}
                                    </motion.h1>

                                    <motion.div
                                        className="flex flex-wrap gap-6 mb-6"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ duration: 0.6, delay: 0.1 }}
                                    >
                                        <div className="flex items-center text-white/80">
                                            <Calendar className="w-5 h-5 mr-2" />
                                            <span>{formatEventDate(event.start_date)} {event.start_date !== event.end_date && ` - ${formatEventDate(event.end_date)}`}</span>
                                        </div>

                                        <div className="flex items-center text-white/80">
                                            <Clock className="w-5 h-5 mr-2" />
                                            {event.start_date === event.end_date ? (
                                                <span>{formatEventTime(event.start_date)}</span>
                                            ) : (
                                                <span>
                                                    {formatEventTime(event.start_date)}
                                                    {event.end_date && ` - ${formatEventTime(event.end_date)}`}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center text-white/80">
                                            <MapPin className="w-5 h-5 mr-2" />
                                            <span>{event.location}</span>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="flex gap-3"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ duration: 0.6, delay: 0.2 }}
                                    >
                                        {!isEventPassed && timeRemaining && (
                                            <div className="bg-black/30 px-4 py-3 rounded-lg">
                                                <div className="text-xs text-white/70 mb-1">Débute dans</div>
                                                <div className="text-xl font-bold text-white">{timeRemaining.days}j {timeRemaining.hours}h</div>
                                            </div>
                                        )}

                                        <div className="bg-black/30 px-4 py-3 rounded-lg">
                                            <div className="text-xs text-white/70 mb-1">Prix</div>
                                            <div className="text-xl font-bold text-white">
                                                {event.price == 0 ? 'GRATUIT' : `${event.price} CHF`}
                                            </div>
                                        </div>

                                        <div className="bg-black/30 px-4 py-3 rounded-lg">
                                            <div className="text-xs text-white/70 mb-1">Places disponibles</div>
                                            <div className="text-xl font-bold text-white">{event.available_seats}/{event.max_participants}</div>
                                        </div>

                                        <div className="flex space-x-2 self-end">
                                            <button
                                                onClick={() => setIsLiked(!isLiked)}
                                                className={`p-3 rounded-full ${isLiked ? 'bg-red-600 text-white' : 'bg-black/30 text-white hover:bg-black/50'} transition-colors duration-200`}
                                                aria-label="Aimer cet événement"
                                            >
                                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
                                            </button>

                                            <button
                                                onClick={shareEvent}
                                                className="p-3 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors duration-200"
                                                aria-label="Partager cet événement"
                                            >
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>

                                    {!isEventPassed && event.available_seats > 0 && (
                                        <motion.div
                                            className="mt-8"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                            transition={{ duration: 0.6, delay: 0.3 }}
                                        >
                                            <a
                                                href="#registration"
                                                onClick={() => setActiveTab('inscription')}
                                                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-300 inline-flex items-center"
                                            >
                                                <Ticket className="mr-2 w-5 h-5" />
                                                <span>Réserver ma place</span>
                                            </a>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tags Section sous le hero */}
                    <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
                                    {event?.category?.name}
                                </span>

                                {event.isVirtual && (
                                    <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                                        Événement en ligne
                                    </span>
                                )}

                                {event.isFeatured && !isEventPassed && (
                                    <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                                        Événement à la une
                                    </span>
                                )}

                                {event?.tags?.map(tag => (
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
                                    ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                Description
                            </button>

                            {!isEventPassed && (
                                <button
                                    onClick={() => setActiveTab('inscription')}
                                    className={`px-6 py-4 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${activeTab === 'inscription'
                                        ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    Inscription
                                </button>
                            )}

                            {isEventPassed && event.reviews && event.reviews.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('temoignages')}
                                    className={`px-6 py-4 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${activeTab === 'temoignages'
                                        ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
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
                                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">À propos de cet événement</h2>

                                        <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-300 mb-8">
                                            <p>{event.description}</p>
                                            <p>{event.long_description}</p>
                                        </div>

                                        {event.highlights && event.highlights.length > 0 && (
                                            <div className="mt-8">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Points forts</h3>
                                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {event.highlights.map((highlight, index) => (
                                                        <li key={index} className="flex items-start">
                                                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                                                            <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {event.target_audience && (
                                            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Public cible</h3>
                                                <p className="text-gray-700 dark:text-gray-300">{event.target_audience}</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Tab: Inscription (conditionnellement affiché) */}
                                {activeTab === 'inscription' && !isEventPassed && (
                                    <>
                                        {event.available_seats > 0 ? (
                                            <EventJoin event={event} auth={null} />
                                        ) : (
                                            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-8 text-center">
                                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Users className="w-8 h-8 text-red-600 dark:text-red-400" />
                                                </div>
                                                <h3 className="text-xl font-bold text-red-900 dark:text-red-300 mb-2">
                                                    Événement complet
                                                </h3>
                                                <p className="text-red-700 dark:text-red-400 mb-6">
                                                    Désolé, toutes les places pour cet événement ont été réservées.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Tab: Témoignages (conditionnellement affiché) */}
                                {activeTab === 'temoignages' && isEventPassed && event.reviews && (
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
                                                            className={`w-5 h-5 ${i < event.average_rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">{event.average_rating.toFixed(1)}</span>
                                                <span className="text-gray-500 dark:text-gray-400 ml-1">({event.reviews.length} avis)</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {event.reviews.map((review, index) => (
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
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Date</h4>
                                                        <p className="text-gray-600 dark:text-gray-300">
                                                            {formatEventDate(event.start_date)}
                                                            {event.start_date !== event.end_date && (
                                                                <>
                                                                    <br />
                                                                    <span className="text-gray-500 dark:text-gray-400">jusqu'au</span>
                                                                    <br />
                                                                    {formatEventDate(event.end_date)}
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex">
                                                    <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Horaires</h4>
                                                        <p className="text-gray-600 dark:text-gray-300">
                                                            {event.start_date === event.end_date ? (
                                                                <span>{formatEventTime(event.start_date)}</span>
                                                            ) : (
                                                                <span>
                                                                    {formatEventTime(event.start_date)} le {formatEventDate(event.start_date, false)}
                                                                    <br />
                                                                    <span className="text-gray-500 dark:text-gray-400">jusqu'à</span>
                                                                    <br />
                                                                    {formatEventTime(event.end_date)} le {formatEventDate(event.end_date, false)}
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex">
                                                    <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Lieu</h4>
                                                        <p className="text-gray-600 dark:text-gray-300">
                                                            {event.isVirtual ? (
                                                                'Événement en ligne'
                                                            ) : (
                                                                <>
                                                                    {event.location}
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex">
                                                    <Users className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Participants</h4>
                                                        <p className="text-gray-600 dark:text-gray-300">
                                                            {isEventPassed ? (
                                                                `${event.attendees_count} participant${event.attendees_count > 1 ? 's' : ''}`
                                                            ) : (
                                                                `${event.max_participants - event.available_seats}/${event.max_participants} places réservées`
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex">
                                                    <Ticket className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">Prix</h4>
                                                        <p className="text-gray-600 dark:text-gray-300">
                                                            {event.price == 0 ? (
                                                                'GRATUIT'
                                                            ) : (
                                                                `À partir de ${event.price} CHF`
                                                            )}
                                                            {event.earlyBirdPrice && !isEventPassed && (
                                                                <span className="ml-2 text-sm text-green-600 dark:text-green-400">
                                                                    (Early bird: {event.earlyBirdPrice} CHF)
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                {event.category && (
                                                    <div className="flex">
                                                        <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Catégorie</h4>
                                                            <p className="text-gray-600 dark:text-gray-300">{event.category.name}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {event.language && (
                                                    <div className="flex">
                                                        <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0" />
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">Langue</h4>
                                                            <p className="text-gray-600 dark:text-gray-300">{event.language}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {!isEventPassed && !event.registration_closed && event.available_seats > 0 && (
                                            <div className="px-6 pb-6">
                                                <a
                                                    href="#registration"
                                                    onClick={() => setActiveTab('inscription')}
                                                    className="block w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-center font-medium transition-colors duration-300"
                                                >
                                                    Réserver maintenant
                                                </a>
                                            </div>
                                        )}

                                        {!isEventPassed && (
                                            <div className="px-6 pb-6 flex justify-between">
                                                <button
                                                    onClick={shareEvent}
                                                    className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                                >
                                                    <Share2 className="w-4 h-4 mr-2" />
                                                    <span>Partager</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Organisateur */}
                                    {event.organizer && (
                                        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700/30 mb-6">
                                            <div className="p-6">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Organisateur</h3>

                                                <div className="flex items-start">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                                                        <img
                                                            src={event.organizer.logo || "/assets/images/organizer-placeholder.jpg"}
                                                            alt={event.organizer.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 dark:text-white">{event.organizer.name}</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{event.organizer.description}</p>
                                                        <a
                                                            href={`/organisateurs/${event.organizer.slug}`}
                                                            className="text-sm text-red-600 dark:text-red-400 hover:underline"
                                                        >
                                                            Voir le profil
                                                        </a>
                                                    </div>
                                                </div>

                                                {event.organizer.contact && (
                                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Contact</h4>

                                                        {event.organizer.contact.email && (
                                                            <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                                                                <Mail className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                                                                <a
                                                                    href={`mailto:${event.organizer.contact.email}`}
                                                                    className="hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                                                                >
                                                                    {event.organizer.contact.email}
                                                                </a>
                                                            </div>
                                                        )}

                                                        {event.organizer.contact.phone && (
                                                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                                                <Phone className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                                                                <a
                                                                    href={`tel:${event.organizer.contact.phone}`}
                                                                    className="hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                                                                >
                                                                    {event.organizer.contact.phone}
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}



                                    {/* Widget Partage */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700/30">
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Partager l'événement</h3>

                                            <div className="grid grid-cols-2 gap-3">
                                                <a
                                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                                                >
                                                    <span>Facebook</span>
                                                </a>

                                                <a
                                                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(event.title)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors duration-200"
                                                >
                                                    <span>Twitter</span>
                                                </a>

                                                <a
                                                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors duration-200"
                                                >
                                                    <span>LinkedIn</span>
                                                </a>

                                                <a
                                                    href={`mailto:?subject=${encodeURIComponent(`Découvrez: ${event.title}`)}&body=${encodeURIComponent(`Salut ! J'ai trouvé cet événement qui pourrait t'intéresser: ${event.title}. Plus d'informations ici: ${window.location.href}`)}`}
                                                    className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200"
                                                >
                                                    <span>Email</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Related Events Section */}
                {relatedEvents && relatedEvents.length > 0 && (
                    <section ref={relatedRef} className="py-16 bg-gray-50 dark:bg-gray-900/50">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isRelatedInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6 }}
                                className="mb-12"
                            >
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Événements similaires</h2>
                                <p className="text-gray-600 dark:text-gray-300">Découvrez d'autres événements qui pourraient vous intéresser</p>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {relatedEvents.map((relatedEvent, index) => (
                                    <motion.div
                                        key={relatedEvent.id}
                                        className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700/30 hover:shadow-xl transition-shadow duration-300"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={isRelatedInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                        transition={{ duration: 0.7, delay: 0.1 + (index * 0.05) }}
                                    >
                                        {/* Image */}
                                        <div className="relative aspect-video overflow-hidden">
                                            <img
                                                src={relatedEvent.featured_image.original}
                                                alt={relatedEvent.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                                            {/* Date badge */}
                                            <div className="absolute top-4 left-4">
                                                <div className="flex flex-col items-center justify-center w-16 h-16 bg-white dark:bg-gray-900 rounded-lg text-center shadow-md">
                                                    <span className="block text-lg font-bold text-gray-900 dark:text-white">
                                                        {new Date(relatedEvent.start_date).getDate()}
                                                    </span>
                                                    <span className="block text-sm text-gray-600 dark:text-gray-400">
                                                        {new Date(relatedEvent.start_date).toLocaleDateString('fr-FR', { month: 'short' })}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Category badge */}
                                            <div className="absolute top-4 right-4">
                                                <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 text-red-600 text-sm font-medium rounded-full">
                                                    {relatedEvent.category.name}
                                                </span>
                                            </div>

                                            {/* Event passed badge */}
                                            {new Date(relatedEvent.end_date) < currentDate && (
                                                <div className="absolute bottom-4 right-4">
                                                    <span className="px-3 py-1 bg-gray-800/90 text-white text-sm font-medium rounded-full flex items-center">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Terminé
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                                                <Link href={`/evenements/${relatedEvent.slug}`}>
                                                    {relatedEvent.title}
                                                </Link>
                                            </h3>

                                            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                                                {relatedEvent.description}
                                            </p>

                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    <span>{formatEventTime(relatedEvent.start_date)}</span>
                                                </div>

                                                <div className="flex items-center">
                                                    <MapPin className="w-4 h-4 mr-1" />
                                                    <span>{relatedEvent.isVirtual ? 'En ligne' : relatedEvent.location.city}</span>
                                                </div>

                                                {relatedEvent.available_seats <= 5 && relatedEvent.available_seats > 0 && new Date(relatedEvent.end_date) >= currentDate && (
                                                    <div className="flex items-center text-red-600 dark:text-red-400">
                                                        <AlertCircle className="w-4 h-4 mr-1" />
                                                        <span>
                                                            {relatedEvent.available_seats} place{relatedEvent.available_seats > 1 ? 's' : ''} restante{relatedEvent.available_seats > 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                                                <div className="font-bold text-lg text-gray-900 dark:text-white">
                                                    {relatedEvent.price === 0 ? 'GRATUIT' : `${relatedEvent.price} CHF`}
                                                </div>

                                                <Link
                                                    href={`/evenements/${relatedEvent.slug}`}
                                                    className="flex items-center text-red-600 dark:text-red-400 hover:underline"
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

export default EventDetailPage;
