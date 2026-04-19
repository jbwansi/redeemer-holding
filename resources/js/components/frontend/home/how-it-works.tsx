import React from 'react'
import * as LucideIcons from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import SectionHeader from '@/components/frontend/layouts/section-header'

type StepItem = {
    icon?: string
    title: string
    description: string
}

type HowItWorksProps = {
    title?: string
    subtitle?: string
    steps?: StepItem[]
}

const ICON_MAP: Record<string, LucideIcon> = {
    MessageCircle: LucideIcons.MessageCircle,
    Search: LucideIcons.Search,
    Clipboard: LucideIcons.Clipboard,
    Target: LucideIcons.Target,
    CheckCircle: LucideIcons.CheckCircle,
    Brain: LucideIcons.Brain,
    Zap: LucideIcons.Zap,
    Users: LucideIcons.Users,
    Lightbulb: LucideIcons.Lightbulb,
}

export default function HowItWorks({
    title = 'Mon approche',
    subtitle = '',
    steps = [],
}: HowItWorksProps) {
    if (!steps.length) return null

    return (
        <section className="py-20 md:py-24 bg-gray-50 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeader label="Méthode" title={title} subtitle={subtitle} />

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {steps.map((step, index) => {
                        const Icon =
                            ICON_MAP[step.icon || 'CheckCircle'] ??
                            LucideIcons.CheckCircle

                        return (
                            <div
                                key={index}
                                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#DA2E29] dark:bg-red-500/10">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-300 dark:text-gray-700">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                </div>

                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {step.title}
                                </h3>

                                <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
                                    {step.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}