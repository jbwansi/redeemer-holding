import React, { useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Calendar, ArrowRight, ChevronRight, CheckCircle, UserRound, MessageCircle, Users } from 'lucide-react';
import parse from 'html-react-parser'; // Pour analyser le contenu HTML
import FrontLayout from '@/components/frontend/layouts/front-layout';

// Interface pour le type de service
interface Service {
    id: number;
    name: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    icon: string | null;
    views: number;
    status: number;
    created_at: string | null;
    updated_at: string | null;
}

// Interface pour les props de la page
interface ServiceDetailProps {
    service: Service;
    relatedServices?: Service[];
}

const ServiceDetail = ({ service, relatedServices = [] }: ServiceDetailProps) => {
    // Refs pour les animations
    const containerRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    // Détection de visibilité pour les animations
    const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 });
    const isContentInView = useInView(contentRef, { once: false, amount: 0.3 });
    const isCtaInView = useInView(ctaRef, { once: false, amount: 0.3 });

    // Effet parallax pour le héro
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

    // Formatage de la date de mise à jour si disponible
    const formattedDate = service.updated_at
        ? new Date(service.updated_at).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : null;

    // Déterminer l'icône à afficher
    const getIconComponent = () => {
        // Si l'icône est stockée comme nom de classe, on peut la mapper vers un composant
        // Ici en exemple, mais vous pouvez adapter selon votre système d'icônes
        switch (service.icon) {
            case 'user':
                return <UserRound size={24} className="text-[#DA2E29]" />;
            case 'message':
                return <MessageCircle size={24} className="text-[#DA2E29]" />;
            case 'users':
                return <Users size={24} className="text-[#DA2E29]" />;
            default:
                // Icône par défaut ou rendu depuis une URL si l'icône est un chemin d'image
                return service.icon?.startsWith('http')
                    ? <img src={service.icon} alt="icon" className="w-6 h-6" />
                    : <CheckCircle size={24} className="text-[#DA2E29]" />;
        }
    };

    return (
        <FrontLayout>
            <main ref={containerRef} className="min-h-screen bg-white dark:bg-gray-950 pt-20 pb-16 overflow-hidden">
            <Head title={service.name} />

            {/* Hero Section */}
            <section ref={heroRef} className="relative h-[400px] md:h-[500px] overflow-hidden">
                {/* Background avec effet parallax */}
                <motion.div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('/assets/images/services-bg.jpg')`,
                        y: backgroundY,
                    }}
                >
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/70 to-gray-900/60 dark:from-gray-950/90 dark:via-gray-950/80 dark:to-gray-950/70"></div>
                </motion.div>

                <div className="relative z-10 h-full flex items-center">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8 w-full">
                        <motion.div
                            className="max-w-3xl"
                            initial={{ opacity: 0, y: 30 }}
                            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.7 }}
                        >
                            {/* Icône du service */}
                            <motion.div
                                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-6"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={isHeroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                {service.icon && getIconComponent()}
                            </motion.div>

                            <motion.h1
                                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                {service.name}
                            </motion.h1>

                            {service.excerpt && (
                                <motion.p
                                    className="text-xl text-gray-200 mb-8 max-w-2xl"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                >
                                    {service.excerpt}
                                </motion.p>
                            )}

                            <motion.div
                                className="flex flex-col sm:flex-row gap-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                <Link
                                    href={route('services.requests', service?.slug)}
                                    className="px-6 py-3 bg-[#DA2E29] hover:bg-[#c02824] text-white rounded-lg font-medium inline-flex items-center justify-center transition-colors duration-300 shadow-lg shadow-[#DA2E29]/20"
                                >
                                    <Calendar className="mr-2 w-5 h-5" />
                                    <span>Réserver maintenant</span>
                                </Link>

                                <a
                                    href="#details"
                                    className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-medium inline-flex items-center justify-center transition-colors duration-300"
                                >
                                    <span>En savoir plus</span>
                                    <ChevronRight className="ml-2 w-5 h-5" />
                                </a>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Contenu principal */}
            <section id="details" className="py-16">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Contenu du service */}
                        <div className="lg:col-span-8" ref={contentRef}>
                            <motion.div
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100 dark:border-gray-700/30"
                                initial={{ opacity: 0, y: 30 }}
                                animate={isContentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                transition={{ duration: 0.7 }}
                            >
                                {service.content ? (
                                    <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
                                        {parse(service.content)}
                                    </div>
                                ) : (
                                    <div className="text-center p-8">
                                        <p className="text-gray-500 dark:text-gray-400 italic">
                                            Description détaillée à venir prochainement...
                                        </p>
                                    </div>
                                )}

                                {formattedDate && (
                                    <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-700/30 text-sm text-gray-500 dark:text-gray-400">
                                        Dernière mise à jour: {formattedDate}
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24 space-y-8">
                                {/* Carte d'action */}
                                <motion.div
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700/30"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={isContentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                    transition={{ duration: 0.7, delay: 0.2 }}
                                >
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        Intéressé par ce service?
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                                        Contactez-nous dès maintenant pour en savoir plus ou réserver votre session.
                                    </p>
                                    <Link
                                        href={route('services.requests', service?.slug)}
                                        className="w-full flex justify-center items-center py-3 px-4 bg-[#DA2E29] hover:bg-[#c02824] text-white rounded-lg font-medium transition-colors duration-300"
                                    >
                                        Réserver dès maintenant
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </motion.div>

                                {/* Statistiques */}
                                {service.views > 0 && (
                                    <motion.div
                                        className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-100 dark:border-gray-700/30"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={isContentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                        transition={{ duration: 0.6, delay: 0.3 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Vues</span>
                                            <span className="text-gray-900 dark:text-white font-medium">{service.views}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services connexes */}
            {relatedServices.length > 0 && (
                <section className="py-16 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Autres services qui pourraient vous intéresser
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedServices.map((relatedService, index) => (
                                <motion.div
                                    key={relatedService.id}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700/30 transition-all duration-300 hover:shadow-xl"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                >
                                    <div className="p-6">
                                        {relatedService.icon && (
                                            <div className="w-12 h-12 rounded-full bg-[#DA2E29]/10 flex items-center justify-center mb-4">
                                                {/* Ici vous pouvez adapter pour afficher l'icône */}
                                                <CheckCircle className="w-6 h-6 text-[#DA2E29]" />
                                            </div>
                                        )}

                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            {relatedService.name}
                                        </h3>

                                        {relatedService.excerpt && (
                                            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                                                {relatedService.excerpt}
                                            </p>
                                        )}

                                        <Link
                                            href={route('services.show', relatedService.slug)}
                                            className="inline-flex items-center text-[#DA2E29] hover:text-[#c02824] font-medium transition-colors"
                                        >
                                            <span>Découvrir</span>
                                            <ChevronRight className="ml-1 w-5 h-5" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section ref={ctaRef} className="py-16">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                    <motion.div
                        className="bg-gradient-to-r from-[#DA2E29] to-rose-600 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden"
                        initial={{ opacity: 0, y: 30 }}
                        animate={isCtaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Decorative elements */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Prêt à franchir le pas?
                            </h2>
                            <p className="text-white/90 text-lg mb-8 md:mb-10">
                                Contactez-nous dès maintenant pour discuter de vos besoins et découvrir comment {service.name} peut vous aider à atteindre vos objectifs.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href={route('contact')}
                                    className="px-8 py-4 bg-white text-[#DA2E29] rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors duration-300 inline-flex items-center justify-center shadow-xl shadow-rose-600/20"
                                >
                                    <Calendar className="mr-2 w-5 h-5" />
                                    <span>Prendre rendez-vous</span>
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

export default ServiceDetail;
