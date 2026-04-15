import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
    ArrowRight,
    Calendar,
    CheckCircle,
    Clock,
    Video,
} from 'lucide-react'
import { useSettings } from '@/hooks/use-settings'

const CalendlyCTA = ({ benefits: benefitsProp }: { benefits?: string[] } = {}) => {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: false, amount: 0.2 })

    const { settings } = useSettings()
    const bookingHref = settings?.calendly_link || route('contact')

    const benefits = benefitsProp?.length
        ? benefitsProp
        : [
              'Clarifiez vos priorités et vos blocages',
              'Identifiez les leviers les plus utiles',
              'Repartez avec une direction concrète',
          ]

    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.08,
            },
        },
    }

    const item = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    }

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-20 dark:from-gray-900 dark:to-gray-950 md:py-24">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(218,46,41,0.12),transparent_30%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_25%)]" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    variants={container}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900"
                >
                    <div className="grid lg:grid-cols-12">
                        <div className="lg:col-span-7 p-8 md:p-12">
                            <motion.span
                                variants={item}
                                className="inline-flex items-center rounded-full border border-[#DA2E29]/15 bg-[#DA2E29]/10 px-4 py-2 text-sm font-medium text-[#DA2E29]"
                            >
                                <Clock className="mr-2 h-4 w-4" />
                                Session découverte gratuite (30 min)
                            </motion.span>

                            <motion.h2
                                variants={item}
                                className="mt-5 text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-4xl"
                            >
                                Faisons le point sur votre situation
                            </motion.h2>

                            <motion.p
                                variants={item}
                                className="mt-4 max-w-xl text-base text-gray-700 dark:text-gray-300 md:text-lg"
                            >
                                Un échange simple pour clarifier vos enjeux, identifier vos priorités
                                et voir comment avancer concrètement.
                            </motion.p>

                            <motion.div variants={container} className="mt-8 space-y-4">
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        variants={item}
                                        className="flex items-start gap-3"
                                    >
                                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#DA2E29]" />
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {benefit}
                                        </span>
                                    </motion.div>
                                ))}
                            </motion.div>

                            <motion.div variants={item} className="mt-8">
                                <a
                                    href={bookingHref}
                                    target={settings?.calendly_link ? '_blank' : undefined}
                                    rel={settings?.calendly_link ? 'noreferrer noopener' : undefined}
                                    className="inline-block"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="inline-flex min-w-[280px] items-center justify-center rounded-xl bg-[#DA2E29] px-7 py-4 text-base font-semibold text-white shadow-lg shadow-[#DA2E29]/20 transition-colors hover:bg-[#c02824]"
                                    >
                                        <Calendar className="mr-2 h-5 w-5" />
                                        <span>
                                            {settings?.calendly_link
                                                ? 'Réserver ma session'
                                                : 'Configurer mon rendez-vous'}
                                        </span>
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </motion.button>
                                </a>

                                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                    Sans engagement • Aucun paiement • En visio ou en présentiel
                                </p>
                            </motion.div>
                        </div>

                        <div className="flex items-center border-t border-gray-200 p-6 dark:border-white/10 md:p-8 lg:col-span-5 lg:border-t-0 lg:border-l">
                            <motion.div variants={item} className="w-full">
                                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#DA2E29]/10">
                                            <Calendar className="h-5 w-5 text-[#DA2E29]" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                Session stratégique
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Premier échange personnalisé
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-[#DA2E29]" />
                                            <span>30 minutes</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Video className="h-4 w-4 text-[#DA2E29]" />
                                            <span>En visioconférence</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-[#DA2E29]" />
                                            <span>Sans engagement</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-gray-900/80">
                                        <p className="text-sm italic text-gray-600 dark:text-gray-300">
                                            “Un échange simple, clair et très utile pour remettre de l’ordre
                                            dans mes priorités.”
                                        </p>
                                        <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                                            Marie L.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default CalendlyCTA