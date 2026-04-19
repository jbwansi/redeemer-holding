import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, ArrowRight, Euro } from 'lucide-react'
import { Link } from '@inertiajs/react'
import SectionHeader from '@/components/frontend/layouts/section-header'

interface Formation {
    id: number
    title: string
    slug: string
    excerpt?: string
    start_date?: string
    end_date?: string
    location?: string
    price?: number | string
    max_participants?: number
    featured_image?: string | Record<string, any>
}

function resolveImageSrc(image?: string | Record<string, any>): string {
    if (!image) return ''
    if (typeof image === 'string') return image

    const candidates = [image.medium, image.large, image.original, image.thumbnail]
    for (const value of candidates) {
        if (typeof value === 'string' && value.trim() !== '') {
            return value
        }
        if (Array.isArray(value)) {
            const first = value.find((entry) => typeof entry === 'string' && entry.trim() !== '')
            if (first) return first
        }
    }

    return ''
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return ''
    try {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    } catch {
        return dateStr
    }
}

export default function FeaturedFormations({
    formations,
    title,
}: {
    formations: Formation[]
    title?: string
}) {
    if (!formations?.length) return null

    return (
        <section className="py-20 md:py-24 bg-gray-50 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl"
                    >
                        <SectionHeader
                            label="Formations"
                            title={title ?? 'Prochaines formations'}
                            subtitle="Des formations conçues pour renforcer vos compétences, structurer votre progression et passer à l’action avec méthode."
                        />
                    </motion.div>

                    <Link
                        href={route('formations')}
                        className="inline-flex items-center text-sm font-medium text-[#DA2E29]"
                    >
                        <span>Voir toutes les formations</span>
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 hover:translate-x-1" />
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {formations.map((f, i) => {
                        const imageSrc = resolveImageSrc(f.featured_image)

                        return (
                            <motion.div
                                key={f.id}
                                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-950 flex flex-col"
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ delay: i * 0.12, duration: 0.6 }}
                            >
                                {imageSrc ? (
                                    <div className="relative h-52 overflow-hidden">
                                        <img
                                            src={imageSrc}
                                            alt={f.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                            decoding="async"
                                            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                                        />
                                    </div>
                                ) : null}

                                <div className="flex flex-1 flex-col p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">
                                        {f.title}
                                    </h3>

                                    {f.excerpt ? (
                                        <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400 line-clamp-3">
                                            {f.excerpt}
                                        </p>
                                    ) : null}

                                    <div className="mt-5 space-y-2">
                                        {f.start_date ? (
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <Calendar className="h-4 w-4 flex-shrink-0 text-[#DA2E29]" />
                                                <span>
                                                    {formatDate(f.start_date)}
                                                    {f.end_date ? ` → ${formatDate(f.end_date)}` : ''}
                                                </span>
                                            </div>
                                        ) : null}

                                        {f.location ? (
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <MapPin className="h-4 w-4 flex-shrink-0 text-[#DA2E29]" />
                                                <span>{f.location}</span>
                                            </div>
                                        ) : null}

                                        {f.max_participants ? (
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <Users className="h-4 w-4 flex-shrink-0 text-[#DA2E29]" />
                                                <span>Max {f.max_participants} participants</span>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                                        {f.price ? (
                                            <span className="inline-flex items-center gap-1 text-lg font-bold text-[#DA2E29]">
                                                <Euro className="h-4 w-4" />
                                                {f.price}
                                            </span>
                                        ) : (
                                            <span className="text-sm font-medium text-green-600">
                                                Gratuit
                                            </span>
                                        )}

                                        <Link
                                            href={route('formations.details', { slug: f.slug })}
                                            className="inline-flex items-center rounded-lg bg-[#DA2E29] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#c02824]"
                                        >
                                            <span>En savoir plus</span>
                                            <ArrowRight className="ml-2 h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}