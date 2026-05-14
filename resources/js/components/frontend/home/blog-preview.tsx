import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, FileText } from 'lucide-react'
import { Link } from '@inertiajs/react'
import SectionHeader from '@/components/frontend/layouts/section-header'

interface Post {
    id: number
    title: string
    slug: string
    excerpt?: string
    featured_image?: string | Record<string, any>
    published_at?: string
    tags?: string | string[]
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
            month: 'long',
            year: 'numeric',
        })
    } catch {
        return dateStr
    }
}

// Couleurs cycliques pour les tags
const TAG_COLORS = [
    'bg-red-50 text-[#DA2E29] dark:bg-red-500/10 dark:text-red-400',
    'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
    'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
]

export default function BlogPreview({
    posts,
    title,
}: {
    posts: Post[]
    title?: string
}) {
    if (!posts?.length) return null

    return (
        <section className="py-20 md:py-24 bg-white dark:bg-gray-950">
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
                            label="Blog"
                            title={title ?? 'Derniers articles'}
                            subtitle="Des articles et réflexions pour nourrir votre progression, clarifier vos enjeux et enrichir votre manière d'agir."
                        />
                    </motion.div>

                    <Link
                        href={route('blogs')}
                        className="group inline-flex items-center gap-2 text-sm font-medium text-[#DA2E29] transition-opacity duration-200 hover:opacity-75 shrink-0"
                    >
                        <span>Voir tous les articles</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Grid */}
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {posts.map((post, i) => {
                        const tags = Array.isArray(post.tags)
                            ? post.tags
                            : typeof post.tags === 'string' && post.tags
                              ? post.tags.split(',').map((t) => t.trim())
                              : []

                        const imageSrc = resolveImageSrc(post.featured_image)

                        return (
                            <motion.article
                                key={post.id}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
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
                                            alt={post.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                            decoding="async"
                                            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <FileText className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col p-6">
                                    {/* Tags avec couleurs variées */}
                                    {tags.length > 0 && (
                                        <div className="mb-3 flex flex-wrap gap-2">
                                            {tags.slice(0, 2).map((tag, j) => (
                                                <span
                                                    key={j}
                                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${TAG_COLORS[j % TAG_COLORS.length]}`}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Titre limité à 2 lignes */}
                                    <h3 className="line-clamp-2 text-xl font-semibold text-gray-900 transition-colors duration-200 group-hover:text-[#DA2E29] dark:text-white">
                                        {post.title}
                                    </h3>

                                    {post.excerpt && (
                                        <p className="mt-3 line-clamp-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
                                            {post.excerpt}
                                        </p>
                                    )}

                                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                                        {post.published_at ? (
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>{formatDate(post.published_at)}</span>
                                            </div>
                                        ) : (
                                            <div />
                                        )}

                                        <Link
                                            href={route('blogs.details', { slug: post.slug })}
                                            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#DA2E29]"
                                        >
                                            <span>Lire</span>
                                            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.article>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}