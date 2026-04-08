import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    featured_image?: string | Record<string, any>;
    published_at?: string;
    tags?: string | string[];
}

function resolveImageSrc(image?: string | Record<string, any>): string {
    if (!image) return '';
    if (typeof image === 'string') return image;

    const candidates = [image.medium, image.large, image.original, image.thumbnail];
    for (const value of candidates) {
        if (typeof value === 'string' && value.trim() !== '') {
            return value;
        }
        if (Array.isArray(value)) {
            const first = value.find((entry) => typeof entry === 'string' && entry.trim() !== '');
            if (first) return first;
        }
    }

    return '';
}

function formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

export default function BlogPreview({ posts, title }: {
    posts: Post[];
    title?: string;
}) {
    if (!posts?.length) return null;

    return (
        <section className="py-20 bg-white dark:bg-gray-950">
            <div className="max-w-[1400px] mx-auto px-6 md:px-8">
                <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block py-1 px-4 text-sm font-medium bg-[#DA2E29]/10 text-[#DA2E29] rounded-full mb-4">
                            Blog
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            {title ?? 'Derniers articles'}
                        </h2>
                    </motion.div>
                    <Link
                        href={route('blogs')}
                        className="flex items-center gap-2 text-[#DA2E29] font-medium hover:gap-3 transition-all duration-200"
                    >
                        Voir tous les articles <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.map((post, i) => {
                        const tags = Array.isArray(post.tags)
                            ? post.tags
                            : typeof post.tags === 'string' && post.tags
                                ? post.tags.split(',').map(t => t.trim())
                                : [];
                        const imageSrc = resolveImageSrc(post.featured_image);

                        return (
                            <motion.article
                                key={post.id}
                                className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col group"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12, duration: 0.6 }}
                                whileHover={{ y: -5 }}
                            >
                                {imageSrc && (
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={imageSrc}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                            decoding="async"
                                            sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                                        />
                                    </div>
                                )}
                                <div className="p-6 flex flex-col flex-grow">
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {tags.slice(0, 2).map((tag, j) => (
                                                <span
                                                    key={j}
                                                    className="px-2 py-0.5 text-xs font-medium bg-[#DA2E29]/10 text-[#DA2E29] rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-[#DA2E29] transition-colors duration-200">
                                        {post.title}
                                    </h3>
                                    {post.excerpt && (
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                                            {post.excerpt}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                                        {post.published_at && (
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(post.published_at)}
                                            </div>
                                        )}
                                        <Link
                                            href={route('blogs.details', { slug: post.slug })}
                                            className="flex items-center gap-1 text-[#DA2E29] text-sm font-medium hover:gap-2 transition-all duration-200 ml-auto"
                                        >
                                            Lire <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
