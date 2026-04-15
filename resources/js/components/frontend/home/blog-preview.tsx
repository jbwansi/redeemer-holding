import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar } from 'lucide-react'
import { Link } from '@inertiajs/react'

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
            month: 'long',
            year: 'numeric',
        })
    } catch {
        return dateStr
    }
}

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
                <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl"
                    >
                        <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-[#DA2E29] dark:bg-red-500/10">
                            Blog
                        </span>

                        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
                            {title ?? 'Derniers articles'}
                        </h2>

                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                            Des articles et réflexions pour nourrir votre progression, clarifier vos enjeux et enrichir votre manière d’agir.
                        </p>
                    </motion.div>

                    <Link
                        href={route('blogs')}
                        className="inline-flex items-center text-sm font-medium text-[#DA2E29]"
                    >
                        <span>Voir tous les articles</span>
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 hover:translate-x-1" />
                    </Link>
                </div>

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
                                {imageSrc ? (
                                    <div className="relative h-52 overflow-hidden">
                                        <img
                                            src={imageSrc}
                                            alt={post.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                            decoding="async"
                                            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                                        />
                                    </div>
                                ) : null}

                                <div className="flex flex-1 flex-col p-6">
                                    {tags.length > 0 ? (
                                        <div className="mb-3 flex flex-wrap gap-2">
                                            {tags.slice(0, 2).map((tag, j) => (
                                                <span
                                                    key={j}
                                                    className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-[#DA2E29] dark:bg-red-500/10"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}

                                    <h3 className="text-xl font-semibold text-gray-900 transition-colors duration-200 group-hover:text-[#DA2E29] dark:text-white">
                                        {post.title}
                                    </h3>

                                    {post.excerpt ? (
                                        <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400 line-clamp-3">
                                            {post.excerpt}
                                        </p>
                                    ) : null}

                                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
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
                                            className="inline-flex items-center text-sm font-medium text-[#DA2E29]"
                                        >
                                            <span>Lire</span>
                                            <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
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