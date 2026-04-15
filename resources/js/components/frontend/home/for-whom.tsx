import React from 'react'
import * as LucideIcons from 'lucide-react'
import { LucideIcon, ArrowRight } from 'lucide-react'
import { Link } from '@inertiajs/react'

type CardItem = {
    icon?: string
    title: string
    description: string
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

export default function ForWhom({
    title = 'Pour qui ?',
    subtitle = '',
    cards = [],
}: ForWhomProps) {
    if (!cards.length) return null

    return (
        <section className="py-20 md:py-24 bg-white dark:bg-gray-950">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-12 max-w-3xl text-center">
                    <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-[#DA2E29] dark:bg-red-500/10">
                        Pour qui
                    </span>

                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
                        {title}
                    </h2>

                    {subtitle ? (
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                            {subtitle}
                        </p>
                    ) : null}
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {cards.map((card, index) => {
                        const Icon =
                            ICON_MAP[card.icon || 'CheckCircle'] ??
                            LucideIcons.CheckCircle

                        return (
                            <div
                                key={index}
                                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                            >
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#DA2E29] dark:bg-red-500/10">
                                    <Icon className="h-5 w-5" />
                                </div>

                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {card.title}
                                </h3>

                                <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
                                    {card.description}
                                </p>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-12 text-center">
                    <p className="mx-auto mb-6 max-w-2xl text-base text-gray-600 dark:text-gray-300">
                        Vous vous reconnaissez dans l’un de ces profils ? Découvrez l’accompagnement le plus adapté à votre situation.
                    </p>

                    <Link
                        href="/services"
                        className="inline-flex items-center rounded-xl bg-[#DA2E29] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#c02824]"
                    >
                        <span>Découvrir mes accompagnements</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}