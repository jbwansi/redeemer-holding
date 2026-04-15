import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Calendar, CheckCircle, Clock, Video } from 'lucide-react'
import { useSettings } from '@/hooks/use-settings'

const CalendlyCTA = ({ benefits: benefitsProp }: { benefits?: string[] } = {}) => {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: false, amount: 0.2 })

    const { settings } = useSettings()
    const bookingHref = settings?.calendly_link || route('contact')

    const benefits = benefitsProp?.length
        ? benefitsProp
        : [
            "Clarifiez vos priorités et vos blocages",
            "Identifiez les leviers les plus utiles",
            "Repartez avec une direction concrète",
        ]

    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12 }
        }
    }

    const item = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
    }

    return (
        <section className="py-20 md:py-24 bg-gray-950">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    ref={ref}
                    variants={container}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black overflow-hidden"
                >
                    <div className="grid lg:grid-cols-12">

                        {/* LEFT */}
                        <div className="lg:col-span-7 p-8 md:p-12">
                            
                            <motion.span
                                variants={item}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-500/10 text-[#DA2E29] mb-4"
                            >
                                <Clock className="w-4 h-4 mr-2" />
                                Session découverte gratuite (30 min)
                            </motion.span>

                            <motion.h2
                                variants={item}
                                className="text-3xl md:text-4xl font-bold text-white leading-tight"
                            >
                                Faisons le point sur votre situation
                            </motion.h2>

                            <motion.p
                                variants={item}
                                className="mt-4 text-gray-300 max-w-xl"
                            >
                                Un échange simple pour clarifier vos enjeux, identifier vos priorités
                                et voir comment avancer concrètement.
                            </motion.p>

                            {/* BENEFITS */}
                            <motion.div variants={container} className="mt-8 space-y-4">
                                {benefits.map((b, i) => (
                                    <motion.div key={i} variants={item} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-[#DA2E29] mt-0.5" />
                                        <span className="text-gray-200">{b}</span>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* CTA */}
                            <motion.div variants={item} className="mt-8">
                                <a href={bookingHref} target="_blank">
                                    <button className="flex items-center gap-2 px-6 py-4 bg-[#DA2E29] hover:bg-[#c02824] text-white rounded-xl font-semibold transition">
                                        <Calendar className="w-5 h-5" />
                                        {settings?.calendly_link
                                            ? 'Réserver ma session'
                                            : 'Configurer mon rendez-vous'}
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </a>

                                <p className="text-sm text-gray-400 mt-3">
                                    Sans engagement • Aucun paiement • En visio
                                </p>
                            </motion.div>
                        </div>

                        {/* RIGHT */}
                        <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-gray-800 flex items-center p-6 md:p-8">

                            <motion.div variants={item} className="w-full">
                                <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6">

                                    {/* HEADER */}
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#DA2E29]/10">
                                            <Calendar className="w-5 h-5 text-[#DA2E29]" />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold">Session stratégique</p>
                                            <p className="text-sm text-gray-400">Premier échange personnalisé</p>
                                        </div>
                                    </div>

                                    {/* INFOS */}
                                    <div className="space-y-3 text-sm text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-[#DA2E29]" />
                                            30 minutes
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Video className="w-4 h-4 text-[#DA2E29]" />
                                            En visioconférence
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-[#DA2E29]" />
                                            Sans engagement
                                        </div>
                                    </div>

                                    {/* TESTIMONIAL */}
                                    <div className="mt-6 bg-gray-800 rounded-xl p-4">
                                        <p className="text-sm text-gray-300 italic">
                                            “Un échange simple, clair et très utile pour remettre de l’ordre dans mes priorités.”
                                        </p>
                                        <p className="mt-3 text-sm font-medium text-white">
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