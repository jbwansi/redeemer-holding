import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { UserRound, MessageCircle, UsersRound, ChevronRight } from 'lucide-react';
import IconComponent from '@/components/ui/icon';
import { Link } from '@inertiajs/react';
import { normalizeServiceIconName } from '@/lib/service-icon';

const Services = ({ services }: any) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: false, amount: 0.2 });
    const heroRef = useRef<HTMLDivElement>(null);
    const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 });

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.1
            }
        }
    };


    return (
        <section className="py-24 relative overflow-hidden">
            {/* Subtle background elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-950"></div>
            <div className="absolute top-20 left-20 w-96 h-96 bg-[#DA2E29]/3 dark:bg-[#DA2E29]/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-rose-500/3 dark:bg-rose-500/5 rounded-full blur-[120px]"></div>

            <div className="max-w-[1400px] mx-auto px-6 md:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center max-w-2xl mx-auto mb-20"
                >
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="block mb-3 text-sm font-medium tracking-widest text-[#DA2E29] uppercase"
                    >
                        Services
                    </motion.span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                        Accompagnement personnalisé
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                        Découvrez les différentes approches que je vous propose pour révéler votre potentiel
                        et atteindre vos objectifs avec confiance.
                    </p>
                </motion.div>

                <motion.div
                    ref={sectionRef}
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12"
                >
                    {services.map((service: any, index: any) => (
                        <motion.div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700/30 transition-all duration-300 hover:shadow-2xl group"
                            initial={{ opacity: 0, y: 30 }}
                            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 1, y: 30 }}
                            transition={{ duration: 0.7, delay: 0.2 + (index * 0.1) }}
                        >
                            {/* Top gradient accent */}
                            <div className={`h-1.5 bg-gradient-to-r ${service.color}`}></div>

                            <div className="p-6 md:p-8">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/80 flex items-center justify-center text-[#DA2E29] mb-6">
                                    <IconComponent name={normalizeServiceIconName(service.icon) || 'package'} color="red" />
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
                </motion.div>
            </div>
        </section>
    );
};

export default Services;
