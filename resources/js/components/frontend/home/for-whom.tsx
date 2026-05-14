import React from 'react'
import * as LucideIcons from 'lucide-react'
import { LucideIcon, ArrowRight } from 'lucide-react'
import { Link } from '@inertiajs/react'
import { motion } from 'framer-motion'
import SectionHeader from '@/components/frontend/layouts/section-header'

type CardItem = {
    icon?: string
    title: string
    description: string
    cta_url?: string
}

type ForWhomProps = {
    title?: string
    subtitle?: string
    cards?: CardItem[]
}

const ICON_MAP: Record<string, LucideIcon> = {
    Briefcase: LucideIcons.Briefcase,
    Users: LucideIcons.Users,
    Rocket: LucideIcons.Rocket,
    Target: LucideIcons.Target,
    BookOpen: LucideIcons.BookOpen,
    Heart: LucideIcons.Heart,
    Award: LucideIcons.Award,
    Lightbulb: LucideIcons.Lightbulb,
    GraduationCap: LucideIcons.GraduationCap,
    UserCheck: LucideIcons.UserCheck,
    Zap: LucideIcons.Zap,
    Shield: LucideIcons.Shield,
    CheckCircle: LucideIcons.CheckCircle,
    TrendingUp: LucideIcons.TrendingUp,
    Star: LucideIcons.Star,
}

const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    }),
}

export default function ForWhom({
    title = 'Pour qui ?',
    subtitle = '',
    cards = [],
}: ForWhomProps) {
    if (!cards.length) return null

    return (
        <section className="py-20 md:py-24 bg-white dark:bg-gray-950">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeader label="Pour qui" title={title} subtitle={subtitle} />

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {cards.map((card, index) => {
                        const Icon =
                            ICON_MAP[card.icon || 'CheckCircle'] ??
                            LucideIcons.CheckCircle

                        const CardWrapper = card.cta_url ? Link : 'div'
                        const wrapperProps = card.cta_url
                            ? { href: card.cta_url }
                            : {}

                        return (
                            <motion.div
                                key={index}
                                custom={index}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                variants={cardVariants}
                            >
                                <CardWrapper
                                    {...(wrapperProps as any)}
                                    className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                                >
                                    {/* Icône avec hover coloré */}
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#DA2E29] transition-colors duration-300 group-hover:bg-[#DA2E29] group-hover:text-white dark:bg-red-500/10">
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {card.title}
                                    </h3>

                                    <p className="mt-3 flex-1 text-sm leading-7 text-gray-600 dark:text-gray-400">
                                        {card.description}
                                    </p>

                                    {/* Lien par card si cta_url fourni */}
                                    {card.cta_url && (
                                        <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#DA2E29]">
                                            <span>En savoir plus</span>
                                            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                                        </div>
                                    )}
                                </CardWrapper>
                            </motion.div>
                        )
                    })}
                </div>

                {/* CTA global */}
                <div className="mt-12 text-center">
                    <p className="mx-auto mb-6 max-w-2xl text-base text-gray-600 dark:text-gray-300">
                        Vous vous reconnaissez dans l'un de ces profils ? Découvrez l'accompagnement le plus adapté à votre situation.
                    </p>

                    <Link
                        href="/services"
                        className="group inline-flex items-center gap-2 rounded-xl bg-[#DA2E29] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#c02824]"
                    >
                        <span>Découvrir nos accompagnements</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </div>
        </section>
    )
}