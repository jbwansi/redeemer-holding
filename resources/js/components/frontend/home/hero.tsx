import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowRight, Clock, Brain, Zap, LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Link } from '@inertiajs/react';

const ICON_MAP: Record<string, LucideIcon> = {
    Clock: LucideIcons.Clock,
    Brain: LucideIcons.Brain,
    Zap: LucideIcons.Zap,
    Target: LucideIcons.Target,
    TrendingUp: LucideIcons.TrendingUp,
    Star: LucideIcons.Star,
    Heart: LucideIcons.Heart,
    Shield: LucideIcons.Shield,
    Award: LucideIcons.Award,
    CheckCircle: LucideIcons.CheckCircle,
    BookOpen: LucideIcons.BookOpen,
    Users: LucideIcons.Users,
    Lightbulb: LucideIcons.Lightbulb,
    Rocket: LucideIcons.Rocket,
};

interface HeroStep { icon: string; title: string; description: string }
interface HeroTestimonial { content: string; author: string; position: string }
interface HeroStat { value: string; label: string }

interface HeroMeta {
    hero_badge?: string
    hero_title_line1?: string
    hero_title_line2?: string
    hero_subtitle?: string
    hero_cta_text?: string
    hero_cta_url?: string
    hero_steps?: HeroStep[]
    hero_testimonial?: HeroTestimonial
    hero_stats?: HeroStat[]
    hero_image?: string
}

const defaultSteps: HeroStep[] = [
    { icon: 'Clock',  title: 'Révélez votre potentiel',     description: 'Découvrez vos forces cachées et définissez votre vision personnelle' },
    { icon: 'Brain',  title: 'Transformez vos habitudes',   description: 'Développez des routines quotidiennes soutenues par la science' },
    { icon: 'Zap',    title: 'Optimisez votre productivité', description: 'Atteignez vos objectifs avec mon système éprouvé' },
];
const defaultTestimonial: HeroTestimonial = {
    content:  "Cette méthode a complètement transformé ma productivité et ma vision de la vie.",
    author:   "Marie L.",
    position: "Entrepreneure",
};
const defaultStats: HeroStat[] = [
    { value: '97%', label: 'Satisfaction' },
    { value: '3k+', label: 'Vies transformées' },
];

const Hero = ({ meta }: { meta?: HeroMeta }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const isTextInView = useInView(textRef, { once: false, amount: 0.3 });
    const isImageInView = useInView(imageRef, { once: false, amount: 0.3 });

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    // Subtle parallax effect for components
    const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '5%']);
    const textY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);

    const steps       = meta?.hero_steps?.length     ? meta.hero_steps       : defaultSteps;
    const testimonial = meta?.hero_testimonial        ? meta.hero_testimonial : defaultTestimonial;
    const stats       = meta?.hero_stats?.length      ? meta.hero_stats       : defaultStats;
    const badge       = meta?.hero_badge              ?? 'Coaching de vie';
    const titleLine1  = meta?.hero_title_line1        ?? 'La vie que vous méritez';
    const titleLine2  = meta?.hero_title_line2        ?? 'à portée de main !';
    const subtitle    = meta?.hero_subtitle           ?? "Bienvenue sur le chemin de la transformation par les valeurs. Je vous aide à découvrir votre véritable potentiel et à vivre une vie épanouie.";
    const ctaText     = meta?.hero_cta_text           ?? 'Découvrir mes formations';
    const ctaUrl      = meta?.hero_cta_url            ?? route('formations');
    const heroImage   = meta?.hero_image              ?? '/assets/images/portrait.jpg';

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
    };

    const buttonVariants = {
        initial: { scale: 1 },
        hover: {
            scale: 1.05,
            boxShadow: '0 10px 25px -5px rgba(218, 46, 41, 0.3)',
            transition: { duration: 0.2, ease: 'easeOut' }
        },
        tap: { scale: 0.98 }
    };

    const stepVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.3 + (i * 0.15),
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };

    const imageVariants = {
        hidden: {
            opacity: 0,
            scale: 0.9,
        },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
            }
        }
    };

    return (
        <section
            ref={containerRef}
            className="relative w-full overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 pt-24 pb-16 md:pt-28 md:pb-20"
        >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#DA2E29] to-transparent opacity-40"></div>
            <div className="absolute top-20 left-10 w-64 h-64 bg-[#DA2E29]/5 dark:bg-[#DA2E29]/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px]"></div>

            <div className="max-w-[1400px] mx-auto px-6 md:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    {/* Text Content - 7 columns */}
                    <motion.div
                        ref={textRef}
                        className="order-2 lg:order-1 lg:col-span-7"
                        initial="hidden"
                        animate={isTextInView ? "visible" : "hidden"}
                        variants={containerVariants}
                        style={{ y: textY }}
                    >
                        <motion.div variants={itemVariants}>
                            <motion.span
                                className="inline-block py-1 px-4 text-sm font-medium bg-[#DA2E29]/10 dark:bg-[#DA2E29]/20 text-[#DA2E29] rounded-full mb-4"
                                whileHover={{ scale: 1.05 }}
                            >
                                {badge}
                            </motion.span>
                        </motion.div>

                        <motion.h1
                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-4"
                            variants={itemVariants}
                        >
                            <span className="block">{titleLine1}</span>
                            <span className="text-[#DA2E29]">{titleLine2}</span>
                        </motion.h1>

                        <motion.p
                            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8"
                            variants={itemVariants}
                        >
                            {subtitle}
                        </motion.p>

                        {/* Three steps */}
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
                            variants={containerVariants}
                        >
                            {steps.map((step, i) => (
                                <motion.div
                                    key={i}
                                    className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
                                    custom={i}
                                    variants={stepVariants}
                                    initial="hidden"
                                    animate={isTextInView ? "visible" : "hidden"}
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                >
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#DA2E29]/10 mb-4">
                                        {React.createElement(ICON_MAP[step.icon] ?? LucideIcons.CheckCircle, { className: "w-5 h-5 text-[#DA2E29]" })}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* CTA Button */}
                        <Link href={ctaUrl}>
                        <motion.div variants={itemVariants}>
                            <motion.button
                                className="px-8 py-4 bg-[#DA2E29] hover:bg-[#c02824] text-white rounded-lg font-medium text-lg flex items-center justify-center group shadow-lg shadow-[#DA2E29]/20"
                                variants={buttonVariants}
                                initial="initial"
                                whileHover="hover"
                                whileTap="tap"
                            >
                                    <span>{ctaText}</span>
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                            </motion.button>
                        </motion.div>
                        </Link>
                    </motion.div>

                    {/* Coach Image Container - 5 columns */}
                    <motion.div
                        ref={imageRef}
                        className="order-1 lg:order-2 lg:col-span-5 relative"
                        initial="hidden"
                        animate={isImageInView ? "visible" : "hidden"}
                        variants={imageVariants}
                        style={{ y: imageY }}
                    >
                        <div className="relative">
                            {/* Main coach image */}
                            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl shadow-gray-900/10 dark:shadow-black/20 border border-gray-100 dark:border-gray-800">
                                <img
                                    src={heroImage}
                                    alt="Coach de vie professionnel"
                                    className="w-full h-[700px] object-cover rounded-2xl"
                                    loading="eager"
                                    fetchPriority="high"
                                    decoding="async"
                                    sizes="(min-width: 1024px) 42vw, 100vw"
                                />

                                {/* Highlight effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-tr from-[#DA2E29]/30 to-transparent opacity-0"
                                    animate={{ opacity: [0, 0.2, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                                />
                            </div>

                            {/* Testimonial floating card */}
                            <motion.div
                                className="absolute -bottom-6 -left-6 sm:left-auto sm:-right-6 bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 max-w-xs border border-gray-100 dark:border-gray-700 z-20"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                                            "{testimonial.content}"
                                        </p>
                                        <p className="text-xs font-medium text-gray-900 dark:text-white mt-2">
                                            {testimonial.author} • {testimonial.position}
                                        </p>
                                        <div className="flex mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Stats floating badge */}
                            <motion.div
                                className="absolute top-4 -right-4 sm:-right-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg px-4 py-3 border border-gray-100 dark:border-gray-700 z-20"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                                whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }}
                            >
                                <div className="flex items-center space-x-2">
                                    {stats.map((s, i) => (
                                        <React.Fragment key={i}>
                                            {i > 0 && <div className="h-10 w-px bg-gray-200 dark:bg-gray-700"></div>}
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-[#DA2E29]">{s.value}</div>
                                                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{s.label}</div>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
