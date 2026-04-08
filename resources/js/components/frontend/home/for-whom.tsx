import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface AudienceCard { icon: string; title: string; description: string }

const ICON_MAP: Record<string, LucideIcon> = {
    Briefcase: LucideIcons.Briefcase,
    TrendingUp: LucideIcons.TrendingUp,
    Users: LucideIcons.Users,
    Target: LucideIcons.Target,
    BookOpen: LucideIcons.BookOpen,
    Heart: LucideIcons.Heart,
    Award: LucideIcons.Award,
    Rocket: LucideIcons.Rocket,
    Star: LucideIcons.Star,
    Lightbulb: LucideIcons.Lightbulb,
    GraduationCap: LucideIcons.GraduationCap,
    UserCheck: LucideIcons.UserCheck,
    Zap: LucideIcons.Zap,
    Shield: LucideIcons.Shield,
    CheckCircle: LucideIcons.CheckCircle,
};

export default function ForWhom({ cards, title, subtitle }: {
    cards: AudienceCard[];
    title?: string;
    subtitle?: string;
}) {
    if (!cards?.length) return null;

    return (
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-[1400px] mx-auto px-6 md:px-8">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="inline-block py-1 px-4 text-sm font-medium bg-[#DA2E29]/10 text-[#DA2E29] rounded-full mb-4">
                        Pour qui ?
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {title ?? 'Ce coaching est fait pour vous si…'}
                    </h2>
                    {subtitle && (
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
                    )}
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cards.map((card, i) => {
                        const IconComponent = ICON_MAP[card.icon] ?? LucideIcons.CheckCircle;
                        return (
                            <motion.div
                                key={i}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.6 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-[#DA2E29]/10 group-hover:bg-[#DA2E29]/20 flex items-center justify-center mb-4 transition-colors duration-300">
                                    <IconComponent className="w-6 h-6 text-[#DA2E29]" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{card.description}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
