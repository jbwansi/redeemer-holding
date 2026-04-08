import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

interface TestimonialItem { content: string; author: string; position: string; image?: string }

export default function TestimonialsSection({ testimonials, title }: {
    testimonials: TestimonialItem[];
    title?: string;
}) {
    if (!testimonials?.length) return null;

    return (
        <section className="py-20 bg-white dark:bg-gray-950">
            <div className="max-w-[1400px] mx-auto px-6 md:px-8">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="inline-block py-1 px-4 text-sm font-medium bg-[#DA2E29]/10 text-[#DA2E29] rounded-full mb-4">
                        Témoignages
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {title ?? 'Ce que disent mes clients'}
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.12, duration: 0.6 }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        >
                            <Quote className="w-8 h-8 text-[#DA2E29]/40 mb-4 flex-shrink-0" />
                            <p className="text-gray-700 dark:text-gray-300 italic text-sm leading-relaxed flex-grow mb-6">
                                "{t.content}"
                            </p>
                            <div className="flex items-center gap-3">
                                {t.image ? (
                                    <img
                                        src={t.image}
                                        alt={t.author}
                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-[#DA2E29]/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-[#DA2E29] font-semibold text-sm">
                                            {t.author.charAt(0)}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <div className="font-semibold text-sm text-gray-900 dark:text-white">{t.author}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{t.position}</div>
                                </div>
                                <div className="ml-auto flex">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
