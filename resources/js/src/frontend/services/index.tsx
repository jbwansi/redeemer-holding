import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
    ChevronRight,
    UserRound,
    MessageCircle,
    Users,
    BookOpen,
    Calendar,
    Zap,
    CheckCircle,
    ArrowRight,
    Clock
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import IconComponent from '@/components/ui/icon';

const ServicesPage = ({services}: any) => {
    // Références pour animations au scroll
    const containerRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const featuredRef = useRef<HTMLDivElement>(null);
    const offeringsRef = useRef<HTMLDivElement>(null);
    const processRef = useRef<HTMLDivElement>(null);
    const pricingRef = useRef<HTMLDivElement>(null);
    const faqRef = useRef<HTMLDivElement>(null);

    // Détection de visibilité pour animations
    const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 });
    const isFeaturedInView = useInView(featuredRef, { once: false, amount: 0.3 });
    const isOfferingsInView = useInView(offeringsRef, { once: false, amount: 0.3 });
    const isProcessInView = useInView(processRef, { once: false, amount: 0.3 });
    const isPricingInView = useInView(pricingRef, { once: false, amount: 0.3 });
    const isFaqInView = useInView(faqRef, { once: false, amount: 0.3 });

    // Animation parallax
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

    // Services principaux
    const coreServices = [
        {
            icon: <UserRound strokeWidth={1.5} />,
            title: "Coaching",
            description: "Le coaching  que je propose est conçu pour vous aider à atteindre vos objectifs personnels et professionnels de manière efficace et durable.",
            benefits: [
                "Plan d'action personnalisé",
                "Accompagnement régulier",
                "Techniques de productivité sur mesure",
                "Suivi des progrès"
            ],
            cta: "Découvrir le coaching",
            href: "/services/coaching-individuel",
            color: "from-[#DA2E29] to-rose-600"
        },
        {
            icon: <MessageCircle strokeWidth={1.5} />,
            title: "Consultation",
            description: "Ma consultation vous offre une oreille attentive et des conseils personnalisés pour vous aider à atteindre vos objectifs avec confiance.",
            benefits: [
                "Analyse de situation approfondie",
                "Identification des obstacles",
                "Conseils stratégiques ciblés",
                "Recommandations pratiques"
            ],
            cta: "En savoir plus sur les consultations",
            href: "/services/consultation",
            color: "from-amber-500 to-orange-600"
        },
        {
            icon: <Users strokeWidth={1.5} />,
            title: "Formation",
            description: "Les sessions de coaching en groupe vous offrent un espace de partage et de soutien pour travailler ensemble vers vos objectifs.",
            benefits: [
                "Dynamique de groupe motivante",
                "Partage d'expériences enrichissant",
                "Exercices collaboratifs",
                "Réseau de soutien"
            ],
            cta: "Explorer les formations en groupe",
            href: "/services/formation",
            color: "from-blue-500 to-indigo-600"
        }
    ];

    // Formats de coaching
    const coachingFormats = [
        {
            title: "Sessions individuelles",
            description: "Séances personnalisées de 60 minutes en présentiel ou en visioconférence.",
            icon: <UserRound size={22} />,
            accent: "#DA2E29"
        },
        {
            title: "Programmes intensifs",
            description: "Immersion complète sur 3 jours pour des résultats rapides et transformateurs.",
            icon: <Zap size={22} />,
            accent: "#9333EA"
        },
        {
            title: "Programmes avancés",
            description: "Accompagnement sur 3 mois avec suivi hebdomadaire et ressources exclusives.",
            icon: <BookOpen size={22} />,
            accent: "#2563EB"
        },
        {
            title: "Ateliers de groupe",
            description: "Sessions thématiques en petits groupes pour un apprentissage collaboratif.",
            icon: <Users size={22} />,
            accent: "#059669"
        }
    ];


    // FAQ
    const faqs = [
        {
            question: "Comment se déroulent les séances de coaching?",
            answer: "Les séances se déroulent en visioconférence ou en présentiel, selon votre préférence. Chaque session dure environ 60 minutes et commence par un point sur vos avancées, suivi d'exercices pratiques et se termine par la définition d'actions concrètes à mettre en place avant la prochaine session."
        },
        {
            question: "Combien de temps dure généralement un programme de coaching?",
            answer: "La durée varie selon vos objectifs et votre situation. En moyenne, un programme complet s'étend sur 3 à 6 mois avec des séances hebdomadaires ou bimensuelles. Certains clients choisissent de poursuivre avec un suivi mensuel après cette période initiale."
        },
        {
            question: "Est-ce que je peux annuler ou reporter une séance?",
            answer: "Oui, vous pouvez reporter une séance avec un préavis de 48 heures sans frais. Les annulations de dernière minute ou les absences sont généralement facturées, mais nous examinons chaque situation au cas par cas."
        },
        {
            question: "Comment mesure-t-on les progrès réalisés?",
            answer: "Nous définissons ensemble des indicateurs de réussite clairs dès le début du programme. À chaque séance, nous évaluons les progrès réalisés et ajustons si nécessaire. Des bilans réguliers permettent de mesurer l'évolution sur le long terme."
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
                                <span className="inline-block py-1 px-3 rounded-full bg-[#DA2E29]/10 text-[#DA2E29] text-sm font-medium mb-3">
                                    Nos Services
                                </span>
                            </motion.div>

                            <motion.h1
                                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                Révélez votre <span className="text-[#DA2E29]">potentiel</span> inexploité
                            </motion.h1>

                            <motion.p
                                className="text-lg md:text-xl text-gray-600 dark:text-gray-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                Découvrez mes services de coaching personnalisés, conçus pour vous aider à atteindre vos objectifs et à transformer votre vie durablement.
                            </motion.p>
                        </div>

                        {/* Featured service cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            {services.map((service: any, index: any) => (
                                <motion.div
                                    key={index}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700/30 transition-all duration-300 hover:shadow-2xl group"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                    transition={{ duration: 0.7, delay: 0.2 + (index * 0.1) }}
                                >
                                    {/* Top gradient accent */}
                                    <div className={`h-1.5 bg-gradient-to-r ${service.color}`}></div>

                                    <div className="p-6 md:p-8">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/80 flex items-center justify-center text-[#DA2E29] mb-6">
                                            <IconComponent name={service.icon} />
                                        </div>

                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                            {service.name}
                                        </h2>

                                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                                            {service.excerpt}
                                        </p>

                                        <Link
                                            href={route('services.details', service?.slug)}
                                            className="inline-flex items-center text-[#DA2E29] font-medium hover:underline group-hover:translate-x-1 transition-transform duration-300"
                                        >
                                            En savoir plus sur ce service
                                            <ChevronRight className="ml-1 w-4 h-4" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Service details section */}
                <section ref={featuredRef} className="py-20 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
                    {/* Décoration d'arrière-plan */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#DA2E29]/20 to-transparent"></div>
                    <div className="absolute top-40 -left-20 w-80 h-80 bg-[#DA2E29]/5 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-40 -right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]"></div>

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
                                        alt="Session de coaching professionnel"
                                        className="w-full h-auto object-cover"
                                    />
                                </div>

                                {/* Décoration */}
                                <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-[#DA2E29]/10 rounded-full blur-xl z-0"></div>
                                <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-500/10 rounded-full blur-lg z-0"></div>

                                {/* Testimonial badge */}
                                <motion.div
                                    className="absolute -bottom-8 left-8 right-8 lg:-right-8 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-4 z-20"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isFeaturedInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                >
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 mr-4">
                                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm italic">
                                                "Ce coaching a complètement transformé ma façon d'aborder mes objectifs. Je suis plus productif et épanoui que jamais."
                                            </p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">
                                                — Thomas D., Entrepreneur
                                            </p>
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
                                    <span className="text-[#DA2E29] font-medium mb-2 block">
                                        Service premium
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                        Coaching personnalisé
                                    </h2>
                                </motion.div>

                                <motion.p
                                    className="text-lg text-gray-600 dark:text-gray-300 mb-8"
                                    variants={itemVariants}
                                >
                                    Mon approche de coaching est entièrement personnalisée pour répondre à vos besoins spécifiques. Ensemble, nous identifierons vos objectifs, les obstacles qui vous freinent et développerons les stratégies pour les surmonter.
                                </motion.p>

                                <motion.div
                                    className="space-y-4 mb-8"
                                    variants={containerVariants}
                                >
                                    {coreServices[0].benefits.map((benefit, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex items-start"
                                            variants={itemVariants}
                                        >
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#DA2E29]/10 flex items-center justify-center text-[#DA2E29] mr-3 mt-0.5">
                                                <CheckCircle size={12} />
                                            </div>
                                            <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                                        </motion.div>
                                    ))}
                                </motion.div>

                                <motion.div
                                    className="flex flex-col sm:flex-row gap-4"
                                    variants={itemVariants}
                                >
                                    <Link
                                        href="/services/coaching-individuel"
                                        className="px-6 py-3 bg-[#DA2E29] hover:bg-[#c02824] text-white rounded-lg font-medium inline-flex items-center justify-center transition-colors duration-300"
                                    >
                                        <span>Découvrir en détail</span>
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Link>
                                    <Link
                                        href="/contact"
                                        className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium inline-flex items-center justify-center transition-colors duration-300"
                                    >
                                        <span>Prendre rendez-vous</span>
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* All offerings section */}
                <section ref={offeringsRef} className="py-20">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <motion.h2
                                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isOfferingsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6 }}
                            >
                                Formats de coaching adaptés à vos besoins
                            </motion.h2>
                            <motion.p
                                className="text-lg text-gray-600 dark:text-gray-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isOfferingsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                Différentes approches pour vous accompagner efficacement selon votre situation et vos objectifs
                            </motion.p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {coachingFormats.map((format, index) => (
                                <motion.div
                                    key={index}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700/30 relative group hover:shadow-xl transition-shadow duration-300"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={isOfferingsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <div className="mb-6 relative inline-block">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: `${format.accent}15` }}
                                        >
                                            <div className="text-[#DA2E29]" style={{ color: format.accent }}>
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

                        <motion.div
                            className="mt-12 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isOfferingsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        >
                            <Link
                                href="/contact"
                                className="inline-flex items-center text-[#DA2E29] hover:text-[#c02824] font-medium"
                            >
                                <span>Besoin d'une approche sur mesure? Contactez-moi</span>
                                <ChevronRight className="ml-1 w-4 h-4" />
                            </Link>
                        </motion.div>
                    </div>
                </section>


                {/* FAQ Section */}
                <section ref={faqRef} className="py-20 bg-gray-50 dark:bg-gray-900">
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
                                Tout ce que vous devez savoir sur mes services de coaching
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

                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 md:py-24">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                        <motion.div
                            className="bg-gradient-to-r from-[#DA2E29] to-rose-600 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden"
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
                                    Prêt à transformer votre vie?
                                </h2>
                                <p className="text-white/90 text-lg mb-8 md:mb-10">
                                    Réservez dès maintenant votre séance de découverte gratuite et commencez votre parcours vers une vie plus épanouie et productive.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        href="/contact"
                                        className="px-8 py-4 bg-white text-[#DA2E29] rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors duration-300 inline-flex items-center justify-center shadow-xl shadow-rose-600/20"
                                    >
                                        <Calendar className="mr-2 w-5 h-5" />
                                        <span>Réserver ma séance gratuite</span>
                                    </Link>
                                    <Link
                                        href="/about"
                                        className="px-8 py-4 bg-transparent border-2 border-white/80 text-white rounded-lg font-medium text-lg hover:bg-white/10 transition-colors duration-300 inline-flex items-center justify-center"
                                    >
                                        <span>En savoir plus sur moi</span>
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

export default ServicesPage;
