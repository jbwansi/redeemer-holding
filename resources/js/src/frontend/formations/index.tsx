import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
    ChevronRight,
    UserRound,
    CalendarCheck,
    Users,
    BookOpen,
    Calendar,
    Zap,
    CheckCircle,
    ArrowRight,
    Clock,
    Globe,
    BrainCircuit,
    Target,
    Star,
    Heart,
    ArrowUpRight,
    Medal
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import IconComponent from '@/components/ui/icon';

const FormationPage = ({ formations }: any) => {
    // Références pour animations au scroll
    const containerRef = useRef(null);
    const heroRef = useRef(null);
    const featuredRef = useRef(null);
    const programsRef = useRef(null);
    const benefitsRef = useRef(null);
    const testimonialsRef = useRef(null);
    const upcomingRef = useRef(null);
    const faqRef = useRef(null);

    // Détection de visibilité pour animations
    const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 });
    const isFeaturedInView = useInView(featuredRef, { once: false, amount: 0.3 });
    const isProgramsInView = useInView(programsRef, { once: false, amount: 0.3 });
    const isBenefitsInView = useInView(benefitsRef, { once: false, amount: 0.3 });
    const isTestimonialsInView = useInView(testimonialsRef, { once: false, amount: 0.3 });
    const isUpcomingInView = useInView(upcomingRef, { once: false, amount: 0.3 });
    const isFaqInView = useInView(faqRef, { once: false, amount: 0.3 });

    // Animation parallax
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

    // Programmes de formation
    const trainingPrograms = [
        {
            icon: <BrainCircuit strokeWidth={1.5} />,
            title: "Mindset de Réussite",
            duration: "8 semaines",
            format: "Hybride",
            coverImage: "/assets/images/formations/mindset-cover.jpg",
            description: "Développez un état d'esprit orienté vers la croissance et la réussite. Identifiez et transformez vos schémas de pensée limitants en catalyseurs de succès.",
            highlights: [
                "Identification des croyances limitantes",
                "Techniques de reprogrammation mentale",
                "Visualisation et affirmations positives",
                "Plan d'action personnalisé"
            ],
            color: "from-blue-500 to-indigo-600"
        },
        {
            icon: <Target strokeWidth={1.5} />,
            title: "Objectifs & Productivité",
            duration: "6 semaines",
            format: "Présentiel",
            coverImage: "/assets/images/formations/productivite-cover.jpg",
            description: "Apprenez à définir et atteindre vos objectifs avec méthode et constance. Maîtrisez les outils de productivité avancée pour optimiser votre temps.",
            highlights: [
                "Méthodologie SMART+ pour définir des objectifs",
                "Systèmes de suivi de progression",
                "Techniques de gestion du temps avancées",
                "Routines matinales et soirs productifs"
            ],
            color: "from-[#DA2E29] to-rose-600"
        },
        {
            icon: <Heart strokeWidth={1.5} />,
            title: "Équilibre & Bien-être",
            duration: "10 semaines",
            format: "En ligne",
            coverImage: "/assets/images/formations/equilibre-cover.jpg",
            description: "Retrouvez l'harmonie entre vie professionnelle, personnelle et santé. Développez des habitudes durables pour un bien-être global et une performance optimale.",
            highlights: [
                "Audit de vie et redéfinition des priorités",
                "Pratiques de pleine conscience",
                "Ritualisation des activités revitalisantes",
                "Gestion du stress et des émotions"
            ],
            color: "from-emerald-500 to-teal-600"
        }
    ];


    // Formats de formation
    const trainingFormats = [
        {
            title: "Formations intensives",
            description: "Sessions immersives de 2-3 jours pour une transformation rapide et profonde.",
            icon: <Zap size={22} />,
            accent: "#9333EA"
        },
        {
            title: "Programmes progressifs",
            description: "Parcours structurés sur 6-12 semaines avec pratique hebdomadaire encadrée.",
            icon: <Target size={22} />,
            accent: "#2563EB"
        },
        {
            title: "Ateliers thématiques",
            description: "Sessions de 3-4 heures focalisées sur une compétence ou problématique spécifique.",
            icon: <BookOpen size={22} />,
            accent: "#059669"
        },
        {
            title: "Formations d'équipe",
            description: "Programmes personnalisés pour entreprises, adaptés aux objectifs organisationnels.",
            icon: <Users size={22} />,
            accent: "#DA2E29"
        }
    ];

    // Bénéfices des formations
    const trainingBenefits = [
        {
            icon: <Medal />,
            title: "Méthodologie éprouvée",
            description: "Approche basée sur les dernières recherches en psychologie positive et neurosciences."
        },
        {
            icon: <UserRound />,
            title: "Accompagnement personnalisé",
            description: "Suivi individuel en complément des sessions collectives pour maximiser les résultats."
        },
        {
            icon: <Clock />,
            title: "Flexibilité adaptée",
            description: "Formats variés pour s'intégrer harmonieusement à votre emploi du temps chargé."
        },
        {
            icon: <Globe />,
            title: "Communauté de soutien",
            description: "Accès à un réseau de participants partageant les mêmes objectifs et valeurs."
        }
    ];

    // Témoignages
    const testimonials = [
        {
            quote: "Cette formation a été un véritable tournant dans ma carrière. J'ai acquis des outils concrets qui m'ont permis de doubler ma productivité tout en réduisant mon stress.",
            author: "Marie L.",
            position: "Directrice Marketing",
            image: "/assets/images/testimonial-1.jpg"
        },
        {
            quote: "Le programme 'Mindset de Réussite' m'a aidé à surmonter mes blocages et à oser entreprendre le projet que je reportais depuis des années.",
            author: "Thomas B.",
            position: "Entrepreneur",
            image: "/assets/images/testimonial-2.jpg"
        },
        {
            quote: "L'équilibre que j'ai retrouvé grâce à cette formation est inestimable. Je suis plus présent pour ma famille tout en étant plus performant au travail.",
            author: "Sophie M.",
            position: "Responsable RH",
            image: "/assets/images/testimonial-3.jpg"
        }
    ];



    // FAQ
    const faqs = [
        {
            question: "Comment se déroulent les formations en ligne?",
            answer: "Les formations en ligne se composent de sessions en direct via Zoom (1h30-2h) et de modules d'apprentissage asynchrones sur notre plateforme. Vous bénéficiez d'un accès à un groupe privé pour échanger avec les participants et le formateur entre les sessions, ainsi que de sessions de questions/réponses hebdomadaires."
        },
        {
            question: "Les formations sont-elles certifiantes?",
            answer: "Nos formations délivrent une attestation de suivi personnalisée détaillant les compétences acquises. Certains programmes spécifiques sont certifiants (Coaching Professionnel niveau 1 et 2). N'hésitez pas à nous contacter pour connaître les équivalences et reconnaissances selon votre secteur d'activité."
        },
        {
            question: "Puis-je obtenir un financement pour ces formations?",
            answer: "Oui, nos formations sont éligibles à plusieurs dispositifs de financement : CPF pour les formations certifiantes, OPCO, plan de développement des compétences, ou Pôle Emploi. Notre équipe administrative vous accompagne dans les démarches pour maximiser votre prise en charge."
        },
        {
            question: "Quelle est la taille des groupes?",
            answer: "Nous limitons volontairement les groupes à 12-15 participants maximum pour garantir une expérience d'apprentissage optimale, une attention personnalisée et des interactions de qualité. Certains programmes premium sont limités à 8 participants."
        }
    ];

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

    return (
        <FrontLayout>
            <main ref={containerRef} className="min-h-screen bg-white dark:bg-gray-950 pt-32 pb-20 overflow-hidden">
                {/* Hero Section */}
                <section ref={heroRef} className="relative pb-20">
                    {/* Background with parallax */}
                    <motion.div
                        className="absolute inset-0 bg-cover bg-center opacity-5 dark:opacity-10"
                        style={{
                            backgroundImage: "url('/assets/images/pattern-bg.jpg')",
                            y: backgroundY
                        }}
                    />

                    <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                                transition={{ duration: 0.5 }}
                            >
                                <span className="inline-block py-1 px-3 rounded-full bg-red-500/10 text-red-600 text-sm font-medium mb-3">
                                    Nos Formations
                                </span>
                            </motion.div>

                            <motion.h1
                                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                Développez vos <span className="text-red-600">compétences</span> et transformez votre vie
                            </motion.h1>

                            <motion.p
                                className="text-lg md:text-xl text-gray-600 dark:text-gray-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                Des formations structurées et immersives pour acquérir des compétences essentielles et opérer des changements durables dans votre vie personnelle et professionnelle.
                            </motion.p>
                        </div>

                        {/* Featured formation cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            {trainingPrograms.map((program, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700/30 transition-all duration-300 hover:shadow-2xl group"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                    transition={{ duration: 0.7, delay: 0.2 + (index * 0.1) }}
                                >
                                    {/* Top gradient accent */}
                                    <div className={`h-1.5 bg-gradient-to-r ${program.color}`}></div>

                                    {/* Image de couverture */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={program.coverImage}
                                            alt={`Formation ${program.title}`}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                                            <div>
                                                <span className="px-2 py-1 bg-white/90 dark:bg-gray-900/90 rounded text-xs font-medium text-red-600 mb-2 inline-block">
                                                    {program.duration}
                                                </span>
                                            </div>
                                            <div className="flex items-center bg-white/90 dark:bg-gray-900/90 rounded px-2 py-1">
                                                <Globe size={12} className="text-red-600 mr-1" />
                                                <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{program.format}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 md:p-8">
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/80 flex items-center justify-center text-red-600 flex-shrink-0">
                                                {program.icon}
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                                {program.title}
                                            </h2>
                                        </div>

                                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                                            {program.description}
                                        </p>
                                        <Link
                                            href={`/formations/${program.title.toLowerCase().replace(/\s+/g, '-')}`}
                                            className="inline-flex items-center text-red-600 font-medium hover:underline group-hover:translate-x-1 transition-transform duration-300"
                                        >
                                            Découvrir ce programme
                                            <ChevronRight className="ml-1 w-4 h-4" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured training section */}
                <section ref={featuredRef} className="py-20 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
                    {/* Décoration d'arrière-plan */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
                    <div className="absolute top-40 -left-20 w-80 h-80 bg-red-500/5 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-40 -right-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px]"></div>

                    <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                            {/* Image */}
                            <motion.div
                                className="lg:col-span-5 relative"
                                initial={{ opacity: 0, x: -30 }}
                                animate={isFeaturedInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                                transition={{ duration: 0.8 }}
                            >
                                <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                                    <img
                                        src="/assets/images/coaching-session.jpg"
                                        alt="Session de formation professionnelle"
                                        className="w-full h-auto object-cover"
                                    />
                                </div>

                                {/* Décoration */}
                                <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-red-500/10 rounded-full blur-xl z-0"></div>
                                <div className="absolute -top-6 -left-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-lg z-0"></div>

                                {/* Stats badge */}
                                <motion.div
                                    className="absolute -bottom-8 left-8 right-8 lg:-right-8 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-5 z-20"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isFeaturedInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                >
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-red-600 mb-1">98%</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-300">Satisfaction</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-red-600 mb-1">1200+</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-300">Participants</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-red-600 mb-1">12</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-300">Programmes</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Content */}
                            <motion.div
                                className="lg:col-span-7"
                                initial={{ opacity: 0, x: 30 }}
                                animate={isFeaturedInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                                transition={{ duration: 0.8 }}
                                variants={containerVariants}
                            >
                                <motion.div variants={itemVariants}>
                                    <span className="text-red-600 font-medium mb-2 block">
                                        Formation phare
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                        Mindset de Réussite
                                    </h2>
                                </motion.div>

                                <motion.p
                                    className="text-lg text-gray-600 dark:text-gray-300 mb-8"
                                    variants={itemVariants}
                                >
                                    Notre programme signature qui a transformé la vie de plus de 500 professionnels. Développez l'état d'esprit des grands leaders et entrepreneurs à travers une méthodologie structurée en 8 modules progressifs, combinant théorie scientifique et exercices pratiques.
                                </motion.p>

                                <motion.div
                                    className="space-y-5 mb-8"
                                    variants={containerVariants}
                                >
                                    <motion.div
                                        className="flex items-start"
                                        variants={itemVariants}
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-600 mr-4 mt-0.5">
                                            <CalendarCheck size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Structure optimisée</h3>
                                            <p className="text-gray-600 dark:text-gray-300">8 semaines, 1 session hebdomadaire de 2h, exercices quotidiens de 15-20 minutes</p>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="flex items-start"
                                        variants={itemVariants}
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-600 mr-4 mt-0.5">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Format hybride innovant</h3>
                                            <p className="text-gray-600 dark:text-gray-300">Sessions en présentiel ou en direct, modules e-learning, coaching individuel</p>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="flex items-start"
                                        variants={itemVariants}
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-600 mr-4 mt-0.5">
                                            <Star size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Résultats concrets</h3>
                                            <p className="text-gray-600 dark:text-gray-300">92% des participants rapportent des changements significatifs dans leur vie</p>
                                        </div>
                                    </motion.div>
                                </motion.div>

                                <motion.div
                                    className="flex flex-col sm:flex-row gap-4"
                                    variants={itemVariants}
                                >
                                    <Link
                                        href="/formations/mindset-de-reussite"
                                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium inline-flex items-center justify-center transition-colors duration-300"
                                    >
                                        <span>Programme détaillé</span>
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Link>
                                    <Link
                                        href="/contact?program=mindset"
                                        className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium inline-flex items-center justify-center transition-colors duration-300"
                                    >
                                        <span>Demander un entretien</span>
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Training formats section */}
                <section ref={programsRef} className="py-20">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <motion.h2
                                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isProgramsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6 }}
                            >
                                Formats adaptés à vos besoins
                            </motion.h2>
                            <motion.p
                                className="text-lg text-gray-600 dark:text-gray-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isProgramsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                Plusieurs approches pédagogiques pour s'adapter à votre emploi du temps et vos objectifs spécifiques
                            </motion.p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {trainingFormats.map((format, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700/30 relative group hover:shadow-xl transition-shadow duration-300"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={isProgramsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <div className="mb-6 relative inline-block">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: `${format.accent}15` }}
                                        >
                                            <div style={{ color: format.accent }}>
                                                {format.icon}
                                            </div>
                                        </div>
                                        <div
                                            className="absolute inset-0 rounded-full blur-md opacity-50"
                                            style={{ backgroundColor: `${format.accent}10` }}
                                        ></div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                        {format.title}
                                    </h3>

                                    <p className="text-gray-600 dark:text-gray-300">
                                        {format.description}
                                    </p>

                                    <div
                                        className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-300 ease-out rounded-b-xl"
                                        style={{ backgroundColor: format.accent }}
                                    ></div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits section */}
                <section ref={benefitsRef} className="py-20 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <motion.h2
                                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isBenefitsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6 }}
                            >
                                Pourquoi choisir nos formations?
                            </motion.h2>
                            <motion.p
                                className="text-lg text-gray-600 dark:text-gray-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isBenefitsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                Des formations conçues avec expertise pour garantir des résultats concrets et durables
                            </motion.p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                            {trainingBenefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    className="relative"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={isBenefitsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                    transition={{ duration: 0.6, delay: 0.1 + (index * 0.1) }}
                                >
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 relative z-10 h-full shadow-lg border border-gray-100 dark:border-gray-700/30">
                                        <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600 mb-6">
                                            {benefit.icon}
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                            {benefit.title}
                                        </h3>

                                        <p className="text-gray-600 dark:text-gray-300">
                                            {benefit.description}
                                        </p>
                                    </div>

                                    {/* Decorative elements */}
                                    <div className="absolute top-4 right-4 w-24 h-24 bg-red-500/5 rounded-full blur-xl -z-10"></div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials section */}
                <section ref={testimonialsRef} className="py-20">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <motion.h2
                                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isTestimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6 }}
                            >
                                Ce que disent nos participants
                            </motion.h2>
                            <motion.p
                                className="text-lg text-gray-600 dark:text-gray-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isTestimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                Découvrez les expériences transformationnelles vécues par nos participants
                            </motion.p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 shadow-lg border border-gray-100 dark:border-gray-700/30 relative"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={isTestimonialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                    transition={{ duration: 0.6, delay: 0.1 + (index * 0.1) }}
                                >
                                    <div className="absolute top-8 left-8 text-gray-300 dark:text-gray-700" aria-hidden="true">
                                        <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10.6667 13.3333C9.2 13.3333 8 14.5333 8 16C8 17.4667 9.2 18.6667 10.6667 18.6667C12.1333 18.6667 13.3333 17.4667 13.3333 16C13.3333 14.5333 12.1333 13.3333 10.6667 13.3333ZM21.3333 13.3333C19.8667 13.3333 18.6667 14.5333 18.6667 16C18.6667 17.4667 19.8667 18.6667 21.3333 18.6667C22.8 18.6667 24 17.4667 24 16C24 14.5333 22.8 13.3333 21.3333 13.3333ZM16 0C7.16 0 0 7.16 0 16C0 24.84 7.16 32 16 32C24.84 32 32 24.84 32 16C32 7.16 24.84 0 16 0ZM16 28.8C8.92 28.8 3.2 23.08 3.2 16C3.2 14.5467 3.45333 13.1467 3.90667 11.84C7.02667 8.61333 11.28 6.66667 16 6.66667C20.72 6.66667 24.9733 8.61333 28.0933 11.84C28.5467 13.1467 28.8 14.5467 28.8 16C28.8 23.08 23.08 28.8 16 28.8Z" fill="currentColor" />
                                        </svg>
                                    </div>

                                    <div className="relative z-10">
                                        <p className="text-gray-700 dark:text-gray-300 italic mb-8 pt-6">
                                            "{testimonial.quote}"
                                        </p>

                                        <div className="flex items-center">
                                            <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                                                <img
                                                    src={testimonial.image}
                                                    alt={testimonial.author}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white">
                                                    {testimonial.author}
                                                </h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {testimonial.position}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* FAQ Section */}
                <section ref={faqRef} className="py-20">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <motion.h2
                                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isFaqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6 }}
                            >
                                Questions fréquentes
                            </motion.h2>
                            <motion.p
                                className="text-lg text-gray-600 dark:text-gray-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isFaqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                Tout ce que vous devez savoir sur nos programmes de formation
                            </motion.p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            {faqs.map((faq, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700/30"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isFaqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.6, delay: 0.1 + (index * 0.1) }}
                                >
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                        {faq.question}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {faq.answer}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            className="mt-12 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isFaqInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        >
                            <Link
                                href="/faq"
                                className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
                            >
                                <span>Voir toutes les questions fréquentes</span>
                                <ChevronRight className="ml-1 w-4 h-4" />
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 md:py-24">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                        <motion.div
                            className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true, amount: 0.2 }}
                        >
                            {/* Decorative elements */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

                            <div className="relative z-10 max-w-3xl mx-auto">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                    Prêt à développer vos compétences?
                                </h2>
                                <p className="text-white/90 text-lg mb-8 md:mb-10">
                                    Réservez un appel de découverte gratuit pour discuter de vos besoins de formation personnels ou d'entreprise.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <a
                                        href="https://calendly.com/jbernard-wansi/consultation-formation?back=1&month=2025-02"
                                        target='_blank'
                                        className="px-8 py-4 bg-white text-red-600 rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors duration-300 inline-flex items-center justify-center shadow-xl shadow-blue-600/20"
                                    >
                                        <Calendar className="mr-2 w-5 h-5" />
                                        <span>Consultation gratuite</span>
                                    </a>
                                    <Link
                                        href="/formations/catalogue"
                                        className="px-8 py-4 bg-transparent border-2 border-white/80 text-white rounded-lg font-medium text-lg hover:bg-white/10 transition-colors duration-300 inline-flex items-center justify-center"
                                    >
                                        <span>Découvrir le catalogue</span>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>
        </FrontLayout>
    );
};

export default FormationPage;
