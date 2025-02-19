import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { UserRound, MessageCircle, UsersRound } from 'lucide-react';

const Services = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: false, amount: 0.2 });

    // Services data with more premium naming
    const services = [
        {
            icon: <UserRound strokeWidth={1.5} />,
            title: "Coaching",
            description: "Le coaching individuel que je propose est conçu pour vous aider à atteindre vos objectifs personnels et professionnels de manière efficace et durable."
        },
        {
            icon: <MessageCircle strokeWidth={1.5} />,
            title: "Consultation",
            description: "Ma consultation vous offre une oreille attentive et des conseils personnalisés pour vous aider à atteindre vos objectifs avec confiance."
        },
        {
            icon: <UsersRound strokeWidth={1.5} />,
            title: "Formation",
            description: "Les sessions de coaching en groupe vous offrent un espace de partage et de soutien pour travailler ensemble vers vos objectifs."
        }
    ];

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

    const itemVariants = {
        hidden: {
            y: 20,
            opacity: 0
        },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.7,
                ease: [0.25, 0.1, 0.25, 1]
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
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="group relative"
                        >
                            {/* Service card with glass morphism effect */}
                            <div className="relative h-full bg-white/70 dark:bg-gray-800/40 backdrop-blur-md rounded-2xl p-8 overflow-hidden border border-gray-100 dark:border-gray-800/50 transition-all duration-500 hover:shadow-xl hover:shadow-gray-200/20 dark:hover:shadow-black/10">
                                {/* Subtle gradient accent */}
                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#DA2E29] to-rose-500 opacity-70"></div>

                                {/* Content container */}
                                <div className="relative z-10">
                                    {/* Icon with animated background */}
                                    <div className="relative mb-8 inline-block">
                                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700/30 flex items-center justify-center text-[#DA2E29]">
                                            {service.icon}
                                        </div>
                                        <motion.div
                                            className="absolute -inset-3 rounded-full bg-[#DA2E29]/5 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100"
                                            transition={{ duration: 0.4 }}
                                        />
                                    </div>

                                    {/* Title with animated underline */}
                                    <div className="mb-4 inline-block relative">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {service.title}
                                        </h3>
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#DA2E29]/80 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {service.description}
                                    </p>
                                </div>

                                {/* Decorative elements */}
                                <div className="absolute bottom-0 right-0 w-24 h-24 rounded-tl-3xl bg-gradient-to-tl from-[#DA2E29]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Services;
