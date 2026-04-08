import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowRight, Euro } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Formation {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    start_date?: string;
    end_date?: string;
    location?: string;
    price?: number | string;
    max_participants?: number;
    featured_image?: string | Record<string, any>;
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
        return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

export default function FeaturedFormations({ formations, title }: {
    formations: Formation[];
    title?: string;
}) {
    if (!formations?.length) return null;

    return (
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-[1400px] mx-auto px-6 md:px-8">
                <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block py-1 px-4 text-sm font-medium bg-[#DA2E29]/10 text-[#DA2E29] rounded-full mb-4">
                            Formations
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            {title ?? 'Prochaines formations'}
                        </h2>
                    </motion.div>
                    <Link
                        href={route('formations')}
                        className="flex items-center gap-2 text-[#DA2E29] font-medium hover:gap-3 transition-all duration-200"
                    >
                        Voir toutes les formations <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {formations.map((f, i) => {
                        const imageSrc = resolveImageSrc(f.featured_image);

                        return (
                        <motion.div
                            key={f.id}
                            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col"
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
                                        alt={f.title}
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                        loading="lazy"
                                        decoding="async"
                                        sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                                    />
                                </div>
                            )}
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                                    {f.title}
                                </h3>
                                {f.excerpt && (
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                                        {f.excerpt}
                                    </p>
                                )}
                                <div className="space-y-2 mb-5">
                                    {f.start_date && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <Calendar className="w-4 h-4 text-[#DA2E29] flex-shrink-0" />
                                            {formatDate(f.start_date)}
                                            {f.end_date && ` → ${formatDate(f.end_date)}`}
                                        </div>
                                    )}
                                    {f.location && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <MapPin className="w-4 h-4 text-[#DA2E29] flex-shrink-0" />
                                            {f.location}
                                        </div>
                                    )}
                                    {f.max_participants && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <Users className="w-4 h-4 text-[#DA2E29] flex-shrink-0" />
                                            Max {f.max_participants} participants
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                    {f.price ? (
                                        <span className="flex items-center gap-1 text-lg font-bold text-[#DA2E29]">
                                            <Euro className="w-4 h-4" />{f.price}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-green-600 font-medium">Gratuit</span>
                                    )}
                                    <Link
                                        href={route('formations.details', { slug: f.slug })}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#DA2E29] hover:bg-[#c02824] text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                    >
                                        En savoir plus <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
