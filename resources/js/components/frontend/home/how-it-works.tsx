import React from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface ProcessStep { icon: string; title: string; description: string }

const ICON_MAP: Record<string, LucideIcon> = {
    MessageCircle: LucideIcons.MessageCircle,
    Search: LucideIcons.Search,
    Clipboard: LucideIcons.Clipboard,
    Target: LucideIcons.Target,
    TrendingUp: LucideIcons.TrendingUp,
    Rocket: LucideIcons.Rocket,
    CheckCircle: LucideIcons.CheckCircle,
    Award: LucideIcons.Award,
    Users: LucideIcons.Users,
    Lightbulb: LucideIcons.Lightbulb,
    BookOpen: LucideIcons.BookOpen,
    Star: LucideIcons.Star,
    Zap: LucideIcons.Zap,
    Heart: LucideIcons.Heart,
    Shield: LucideIcons.Shield,
    Brain: (LucideIcons as any).Brain ?? LucideIcons.Star,
    Calendar: LucideIcons.Calendar,
};

export default function HowItWorks({ steps, title, subtitle }: {
    steps: ProcessStep[];
    title?: string;
    subtitle?: string;
}) {
    if (!steps?.length) return null;

    const gridColsClass = {
        1: 'md:grid-cols-1',
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-4',
    }[Math.min(steps.length, 4)] ?? 'md:grid-cols-4';

    return (
        <section className="py-20 bg-white dark:bg-gray-950">
            <div className="max-w-[1400px] mx-auto px-6 md:px-8">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="inline-block py-1 px-4 text-sm font-medium bg-[#DA2E29]/10 text-[#DA2E29] rounded-full mb-4">
                        Comment ça marche
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {title ?? 'Mon processus d\'accompagnement'}
                    </h2>
                    {subtitle && (
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
                    )}
                </motion.div>

                <div className="relative">
                    {/* Connector line */}
                    <div className="hidden md:block absolute top-10 left-[calc(100%/6)] right-[calc(100%/6)] h-0.5 bg-gradient-to-r from-transparent via-[#DA2E29]/30 to-transparent" />

                    <div className={`grid grid-cols-1 ${gridColsClass} gap-8`}>
                        {steps.map((step, i) => {
                            const IconComponent = ICON_MAP[step.icon] ?? LucideIcons.CheckCircle;
                            return (
                                <motion.div
                                    key={i}
                                    className="relative text-center"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15, duration: 0.6 }}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="relative mb-6">
                                            <div className="w-20 h-20 rounded-full bg-[#DA2E29]/10 dark:bg-[#DA2E29]/20 flex items-center justify-center">
                                                <IconComponent className="w-8 h-8 text-[#DA2E29]" />
                                            </div>
                                            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#DA2E29] text-white text-xs font-bold flex items-center justify-center">
                                                {i + 1}
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{step.description}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
