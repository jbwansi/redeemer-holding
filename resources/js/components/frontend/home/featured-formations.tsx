import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, ArrowRight, Euro, BookOpen } from 'lucide-react'
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
    current_participants?: number
    featured_image?: string | Record<string, any>
}

function resolveImageSrc(image?: string | Record<string, any>): string {
    if (!image) return ''
    if (typeof image === 'string') return image
    const candidates = [image.medium, image.large, image.original, image.thumbnail]
    for (const value of candidates) {
        if (typeof value === 'string' && value.trim() !== '') return value
        if (Array.isArray(value)) {
            const first = value.find((e) => typeof e === 'string' && e.trim() !== '')
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

function isFull(f: Formation): boolean {
    if (!f.max_participants || !f.current_participants) return false
    return f.current_participants >= f.max_participants
}

function spotsLeft(f: Formation): number | null {
    if (!f.max_participants || f.current_participants === undefined) return null
    return Math.max(0, f.max_participants - f.current_participants)
}

// ── État vide ──────────────────────────────────────────────
function EmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 px-8 text-center dark:border-gray-800 dark:bg-gray-950"
        >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#DA2E29] dark:bg-red-500/10">
                <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Aucune formation programmée pour le moment
            </h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
                De nouvelles sessions sont régulièrement ajoutées. Revenez bientôt ou contactez-nous pour être informé en priorité.
            </p>
            <Link
                href={route('contact')}
                className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-[#DA2E29] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c02824]"
            >
                <span>Me tenir informé</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
        </motion.div>
    )
}

export default function FeaturedFormations({
    formations,
    title,
}: {
    formations: Formation[]
    title?: string
}) {
    return (
        <section className="py-20 md:py-24 bg-gray-50 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Header */}
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
                            subtitle="Des formations conçues pour renforcer vos compétences, structurer votre progression et passer à l'action avec méthode."
                        />
                    </motion.div>

                    <Link
                        href={route('formations')}
                        className="group inline-flex items-center gap-2 text-sm font-medium text-[#DA2E29] transition-opacity hover:opacity-75 shrink-0"
                    >
                        <span>Voir toutes les formations</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                </div>

                {/* Contenu */}
                {!formations?.length ? (
                    <EmptyState />
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {formations.map((f, i) => {
                            const imageSrc = resolveImageSrc(f.featured_image)
                            const full = isFull(f)
                            const remaining = spotsLeft(f)

                            return (
                                <motion.div
                                    key={f.id}
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ delay: i * 0.12, duration: 0.6 }}
                                >
                                    {/* Image ou fallback */}
                                    <div className="relative h-52 overflow-hidden bg-gray-100 dark:bg-gray-800">
                                        {imageSrc ? (
                                            <img
                                                src={imageSrc}
                                                alt={f.title}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                loading="lazy"
                                                decoding="async"
                                                sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <BookOpen className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                                            </div>
                                        )}

                                        {/* Badge disponibilité */}
                                        {full ? (
                                            <span className="absolute top-3 left-3 rounded-full bg-gray-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                                Complet
                                            </span>
                                        ) : remaining !== null && remaining <= 3 ? (
                                            <span className="absolute top-3 left-3 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                                {remaining} place{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''}
                                            </span>
                                        ) : null}
                                    </div>

                                    <div className="flex flex-1 flex-col p-6">
                                        <h3 className="line-clamp-2 text-xl font-semibold text-gray-900 transition-colors duration-200 group-hover:text-[#DA2E29] dark:text-white">
                                            {f.title}
                                        </h3>

                                        {f.excerpt && (
                                            <p className="mt-3 line-clamp-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
                                                {f.excerpt}
                                            </p>
                                        )}

                                        <div className="mt-5 space-y-2">
                                            {f.start_date && (
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Calendar className="h-4 w-4 shrink-0 text-[#DA2E29]" />
                                                    <span>
                                                        {formatDate(f.start_date)}
                                                        {f.end_date ? ` → ${formatDate(f.end_date)}` : ''}
                                                    </span>
                                                </div>
                                            )}
                                            {f.location && (
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <MapPin className="h-4 w-4 shrink-0 text-[#DA2E29]" />
                                                    <span>{f.location}</span>
                                                </div>
                                            )}
                                            {f.max_participants && (
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Users className="h-4 w-4 shrink-0 text-[#DA2E29]" />
                                                    <span>Max {f.max_participants} participants</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-auto border-t border-gray-100 pt-4 dark:border-gray-800 flex items-center justify-between">
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
                                                className={`group/btn inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors duration-200 ${full
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-[#DA2E29] hover:bg-[#c02824]'
                                                    }`}
                                                {...(full ? { onClick: (e) => e.preventDefault() } : {})}
                                            >
                                                <span>{full ? 'Complet' : 'En savoir plus'}</span>
                                                {!full && (
                                                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                                                )}
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
        </section>
    )
}