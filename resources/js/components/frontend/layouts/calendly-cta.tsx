import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar, ArrowRight, CheckCircle, Clock, LucideIcon } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

const CalendlyCTA = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: false, amount: 0.2 });

    const { settings } = useSettings();

    // Benefits of the free session
    const benefits: { icon: LucideIcon; text: string }[] = [
        {
            icon: CheckCircle,
            text: "Identifiez vos blocages actuels et opportunités inexploitées"
        },
        {
            icon: CheckCircle,
            text: "Découvrez les 3 étapes clés pour transformer votre productivité"
        },
        {
            icon: CheckCircle,
            text: "Repartez avec un plan d'action personnalisé et applicable immédiatement"
        }
    ];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1]
            }
        }
    };

    const scaleVariants = {
        initial: { scale: 1 },
        hover: {
            scale: 1.03,
            boxShadow: '0 20px 40px rgba(218, 46, 41, 0.15)',
            transition: { duration: 0.3, ease: 'easeOut' }
        },
        tap: { scale: 0.98 }
    };

    return (
        <section className="relative py-20 md:py-24 overflow-hidden">
            {/* Background with subtle gradient and shapes */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950"></div>
            <div className="absolute top-20 left-0 w-96 h-96 bg-[#DA2E29]/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px]"></div>

            {/* Main content container */}
            <div className="max-w-[1400px] mx-auto px-6 md:px-8 relative">
                <motion.div
                    ref={sectionRef}
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden relative"
                >
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`
                        }}
                    ></div>

                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DA2E29] to-rose-600"></div>

                    <div className="md:grid md:grid-cols-12 items-center">
                        {/* Content column */}
                        <div className="md:col-span-8 p-8 md:p-12 lg:p-16 relative">
                            <motion.div variants={itemVariants}>
                                <div className="inline-flex items-center px-4 py-2 bg-[#DA2E29]/10 dark:bg-[#DA2E29]/20 text-[#DA2E29] rounded-full mb-6">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <span className="text-sm font-medium">Session découverte gratuite de 30 minutes</span>
                                </div>
                            </motion.div>

                            <motion.h2
                                variants={itemVariants}
                                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6"
                            >
                                Débloquez votre potentiel avec une consultation <span className="text-[#DA2E29]">gratuite</span>
                            </motion.h2>

                            <motion.p
                                variants={itemVariants}
                                className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl"
                            >
                                Vous êtes à un appel de transformer votre productivité et d'atteindre enfin vos objectifs.
                                Réservez maintenant votre session stratégique personnalisée et découvrez comment
                                ma méthode en 3 étapes peut vous aider à vivre la vie que vous méritez.
                            </motion.p>

                            {/* Benefits list */}
                            <motion.div
                                variants={containerVariants}
                                className="space-y-4 mb-8"
                            >
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        variants={itemVariants}
                                        className="flex items-start"
                                    >
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#DA2E29]/10 dark:bg-[#DA2E29]/20 flex items-center justify-center text-[#DA2E29] mr-3">
                                            <benefit.icon size={14} />
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-200">
                                            {benefit.text}
                                        </p>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Limited spots note */}
                            <motion.div
                                variants={itemVariants}
                                className="mb-8 inline-block py-2 px-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-lg"
                            >
                                <p className="text-amber-800 dark:text-amber-200 text-sm flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    Attention : Places limitées à 5 consultations gratuites par semaine
                                </p>
                            </motion.div>

                            {/* CTA Button */}
                            <motion.div variants={itemVariants}>
                                <a
                                    href={settings?.calendly_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <motion.button
                                        variants={scaleVariants}
                                        initial="initial"
                                        whileHover="hover"
                                        whileTap="tap"
                                        className="px-8 py-4 bg-[#DA2E29] text-white rounded-lg font-medium text-lg flex items-center justify-center group shadow-lg shadow-[#DA2E29]/20"
                                    >
                                        <Calendar className="w-5 h-5 mr-2" />
                                        <span>Réserver ma session gratuite</span>
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                    </motion.button>
                                </a>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                                    Aucune carte de crédit requise • Annulation facile • Sans obligation
                                </p>
                            </motion.div>
                        </div>

                        {/* Image/Illustration column */}
                        <div className="hidden md:block md:col-span-4 bg-gradient-to-br from-[#DA2E29]/5 to-rose-500/5 dark:from-[#DA2E29]/10 dark:to-rose-500/10 h-full relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 dark:opacity-20"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='%23da2e29' fill-opacity='0.2'%3E%3Cpath d='M20 0c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20zm0 37.5c-9.649 0-17.5-7.851-17.5-17.5s7.851-17.5 17.5-17.5 17.5 7.851 17.5 17.5-7.851 17.5-17.5 17.5zm0-33.046c-8.568 0-15.546 6.978-15.546 15.546s6.978 15.546 15.546 15.546 15.546-6.978 15.546-15.546-6.978-15.546-15.546-15.546zm0 28.59c-7.18 0-13.044-5.864-13.044-13.044s5.864-13.044 13.044-13.044 13.044 5.864 13.044 13.044-5.864 13.044-13.044 13.044z'/%3E%3C/g%3E%3C/svg%3E")`
                                }}
                            ></div>

                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full max-w-xs">
                                    <div className="relative">
                                        {/* Decorative elements */}
                                        <div className="absolute -top-4 -left-4 w-20 h-20 bg-[#DA2E29]/20 rounded-full blur-md"></div>
                                        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-rose-500/20 rounded-full blur-md"></div>

                                        {/* Calendar illustration */}
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 relative z-10">
                                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                                <div className="font-medium text-gray-900 dark:text-white">Avril 2025</div>
                                                <div className="flex space-x-2">
                                                    <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                        <ChevronLeft size={16} className="text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                    <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                        <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-7 gap-2 text-center text-xs">
                                                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                                                    <div key={i} className="text-gray-500 dark:text-gray-400 font-medium py-1">{day}</div>
                                                ))}
                                                {Array.from({ length: 30 }, (_, i) => (
                                                    <div key={i} className={`py-1 rounded-full ${i === 14 || i === 21 ? 'bg-[#DA2E29] text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                                        {i + 1}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 p-3 bg-[#DA2E29]/10 dark:bg-[#DA2E29]/20 rounded-lg text-sm text-[#DA2E29] font-medium text-center">
                                                Session stratégique (30 min)
                                            </div>
                                        </div>
                                    </div>

                                    {/* Social proof */}
                                    <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg relative">
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex text-amber-400 mb-1">
                                                    {Array(5).fill(null).map((_, i) => (
                                                        <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-200 italic">
                                                    "Une simple consultation de 30 min a complètement changé ma perspective. Je recommande à 100%!"
                                                </p>
                                                <p className="text-xs font-medium text-gray-900 dark:text-white mt-2">
                                                    Marie Dupont, Entrepreneure
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

// Import the ChevronLeft icon for the calendar illustration
const ChevronLeft = ({ size, className }: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m15 18-6-6 6-6" />
    </svg>
);

// Import the ChevronRight icon for the calendar illustration
const ChevronRight = ({ size, className }: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m9 18 6-6-6-6" />
    </svg>
);

export default CalendlyCTA;
