import React from 'react'
import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'

interface TestimonialItem {
    content: string
    author: string
    position: string
    image?: string
}

export default function TestimonialsSection({
    testimonials,
    title,
}: {
    testimonials: TestimonialItem[]
    title?: string
}) {
    if (!testimonials?.length) return null

    return (
        <section className="py-20 md:py-24 bg-gray-50 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="mx-auto mb-12 max-w-3xl text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-[#DA2E29] dark:bg-red-500/10">
                        Témoignages
                    </span>

                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
                        {title ?? 'Ce que disent mes clients'}
                    </h2>

                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Des retours d’expérience concrets sur les transformations vécues et les résultats obtenus.
                    </p>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-950 flex flex-col"
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ delay: i * 0.12, duration: 0.6 }}
                        >
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#DA2E29] dark:bg-red-500/10">
                                <Quote className="h-5 w-5" />
                            </div>

                            <p className="flex-grow text-sm leading-7 text-gray-600 dark:text-gray-400 italic">
                                “{t.content}”
                            </p>

                            <div className="mt-6 flex items-center gap-3">
                                {t.image ? (
                                    <img
                                        src={t.image}
                                        alt={t.author}
                                        className="h-11 w-11 rounded-full object-cover flex-shrink-0"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                ) : (
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DA2E29]/15 flex-shrink-0">
                                        <span className="text-sm font-semibold text-[#DA2E29]">
                                            {t.author?.charAt(0)}
                                        </span>
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {t.author}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {t.position}
                                    </div>
                                </div>

                                <div className="ml-auto flex items-center gap-0.5">
                                    {[...Array(5)].map((_, j) => (
                                        <Star
                                            key={j}
                                            className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}