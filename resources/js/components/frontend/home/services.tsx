import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Link } from '@inertiajs/react'
import IconComponent from '@/components/ui/icon'
import { normalizeServiceIconName } from '@/lib/service-icon'

const Services = ({ services }: any) => {
    const sectionRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(sectionRef, { once: false, amount: 0.2 })

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.1,
            },
        },
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    }

    if (!services?.length) return null

    return (
        <section className="py-20 md:py-24 bg-white dark:bg-gray-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50/70 to-white dark:from-gray-900/40 dark:to-gray-950" />
            <div className="absolute top-20 left-20 h-80 w-80 rounded-full bg-[#DA2E29]/4 dark:bg-[#DA2E29]/6 blur-[120px]" />
            <div className="absolute bottom-20 right-20 h-80 w-80 rounded-full bg-rose-500/4 dark:bg-rose-500/6 blur-[120px]" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.7 }}
                    className="mx-auto mb-12 max-w-3xl text-center"
                >
                    <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-[#DA2E29] dark:bg-red-500/10">
                        Accompagnements
                    </span>

                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
                        Des accompagnements concrets pour avancer avec clarté
                    </h2>

                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Découvrez des accompagnements pensés pour structurer vos actions,
                        renforcer votre posture et obtenir des résultats durables.
                    </p>
                </motion.div>

                <motion.div
                    ref={sectionRef}
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
                >
                    {services.map((service: any, index: number) => (
                        <motion.div
                            key={service?.id ?? index}
                            variants={cardVariants}
                            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                        >
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#DA2E29] dark:bg-red-500/10">
                                <IconComponent
                                    name={normalizeServiceIconName(service.icon) || 'package'}
                                    color="red"
                                />
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {service.name}
                            </h3>

                            <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-400">
                                {service.excerpt}
                            </p>

                            <Link
                                href={route('services.details', service?.slug)}
                                className="mt-6 inline-flex items-center text-sm font-medium text-[#DA2E29]"
                            >
                                <span>En savoir plus</span>
                                <ChevronRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

export default Services