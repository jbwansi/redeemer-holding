import React, { useMemo, useRef } from 'react'
import { Head } from '@inertiajs/react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import DOMPurify from 'dompurify'
import {
    ArrowRight,
    Award,
    BookOpen,
    CheckCircle,
    Quote,
    Shield,
    Sparkles,
    Target,
    TrendingUp,
    Users,
    Zap,
    type LucideIcon,
} from 'lucide-react'
import FrontLayout from '@/components/frontend/layouts/front-layout'

type ValueItem = {
    icon: string
    title: string
    description: string
}

type StatItem = {
    value: string
    label: string
}

type JourneyItem = {
    year: string
    title: string
    description: string
}

type TestimonialItem = {
    content: string
    author: string
    position: string
    image?: string
}

type AboutMeta = {
    hero_badge?: string
    hero_subtitle?: string
    hero_primary_button_text?: string
    hero_primary_button_link?: string
    hero_secondary_button_text?: string
    hero_secondary_button_link?: string

    hero_title_before?: string
    hero_title_highlight?: string
    hero_title_after?: string

    story_author?: string
    story_role?: string
    story_years?: string

    values?: ValueItem[]
    stats?: StatItem[]
    journey?: JourneyItem[]
    testimonials?: TestimonialItem[]

    mission_label?: string
    mission_title?: string
    mission_subtitle?: string
    mission_text?: string
    mission_button_text?: string
    mission_button_link?: string

    certifications?: string[]
}

type AboutPageData = {
    title: string
    content: string
    status: boolean
    meta: AboutMeta | null
}

const ICONS: Record<string, LucideIcon> = {
    TrendingUp,
    Users,
    Award,
    CheckCircle,
    BookOpen,
    Shield,
    Target,
    Zap,
}

const sectionReveal = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

function iconFromName(name?: string): LucideIcon {
    if (!name) return Award
    return ICONS[name] ?? Award
}

function AboutPage({ page }: { page?: AboutPageData }) {
    const meta = page?.meta ?? {}

    const rootRef = useRef<HTMLDivElement>(null)
    const storyRef = useRef<HTMLDivElement>(null)
    const valuesRef = useRef<HTMLDivElement>(null)
    const timelineRef = useRef<HTMLDivElement>(null)
    const missionRef = useRef<HTMLDivElement>(null)
    const testimonialsRef = useRef<HTMLDivElement>(null)
    const certificationsRef = useRef<HTMLDivElement>(null)

    const inStory = useInView(storyRef, { once: false, amount: 0.2 })
    const inValues = useInView(valuesRef, { once: false, amount: 0.2 })
    const inTimeline = useInView(timelineRef, { once: false, amount: 0.2 })
    const inMission = useInView(missionRef, { once: false, amount: 0.2 })
    const inTestimonials = useInView(testimonialsRef, { once: false, amount: 0.2 })
    const inCertifications = useInView(certificationsRef, { once: false, amount: 0.2 })

    const { scrollYProgress } = useScroll({
        target: rootRef,
        offset: ['start start', 'end start'],
    })

    const orbY = useTransform(scrollYProgress, [0, 1], ['0%', '24%'])

    const values = meta.values ?? []
    const stats = meta.stats ?? []
    const journey = meta.journey ?? []
    const testimonials = meta.testimonials ?? []
    const certifications = meta.certifications ?? []

    const safeContent = useMemo(
        () => DOMPurify.sanitize(page?.content ?? ''),
        [page?.content]
    )

    const heroBadge = meta.hero_badge ?? 'À propos'
    const heroTitleBefore = meta.hero_title_before ?? 'Transformer des'
    const heroTitleHighlight = meta.hero_title_highlight ?? 'trajectoires'
    const heroTitleAfter = meta.hero_title_after ?? ' avec clarté, structure et impact'

    const signatureSubtitle =
        meta.hero_subtitle ??
        'J’accompagne les entrepreneurs, les leaders et les professionnels en évolution à clarifier leurs priorités, renforcer leur posture et avancer avec méthode.'

    const heroPrimaryButtonText =
        meta.hero_primary_button_text ?? 'Discutons de votre projet'
    const heroPrimaryButtonLink =
        meta.hero_primary_button_link ?? '/contact'
    const heroSecondaryButtonText =
        meta.hero_secondary_button_text ?? 'Voir mes services'
    const heroSecondaryButtonLink =
        meta.hero_secondary_button_link ?? '/services'

    const missionLabel = meta.mission_label ?? 'MA MISSION'
    const missionTitle =
        meta.mission_title ??
        'Vous aider à franchir un cap avec plus de clarté, de structure et de confiance'
    const missionSubtitle = meta.mission_subtitle ?? 'TRAVAILLONS ENSEMBLE'
    const missionText =
        meta.mission_text ??
        'Chaque accompagnement est pensé pour transformer vos intentions en avancées concrètes, durables et alignées avec votre réalité.'
    const missionButtonText = meta.mission_button_text ?? 'Parlons-en'
    const missionButtonLink = meta.mission_button_link ?? '/contact'

    const quickPoints = useMemo(
        () => [
            'Coaching humain et structuré',
            'Méthode claire et progressive',
            'Résultats concrets et durables',
        ],
        []
    )

    return (
        <FrontLayout>
            <Head title={page?.title ?? 'À propos'} />

            <main
                ref={rootRef}
                className="relative min-h-screen overflow-hidden bg-white pb-24 pt-28 text-slate-900 dark:bg-gray-950 dark:text-white"
            >
                <motion.div
                    className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#da2e29]/10 blur-3xl"
                    style={{ y: orbY }}
                />
                <motion.div
                    className="pointer-events-none absolute bottom-[-120px] right-[-60px] h-96 w-96 rounded-full bg-[#0f766e]/10 blur-3xl"
                    style={{ y: orbY }}
                />

                {/* HERO */}
                <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
                        <motion.div
                            className="lg:col-span-7"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-[#da2e29] dark:bg-red-500/10">
                                <Sparkles className="h-4 w-4" />
                                {heroBadge}
                            </span>

                            <h1 className="mt-6 text-4xl font-bold leading-[1.02] tracking-tight text-slate-900 dark:text-white md:text-5xl xl:text-6xl">
                                {heroTitleBefore}{' '}
                                <span className="text-[#da2e29]">{heroTitleHighlight}</span>
                                {heroTitleAfter}
                            </h1>

                            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300 md:text-xl">
                                {signatureSubtitle}
                            </p>

                            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                                {quickPoints.map(point => (
                                    <div
                                        key={point}
                                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                                    >
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-50 text-[#da2e29] dark:bg-red-500/10">
                                            <CheckCircle className="h-3.5 w-3.5" />
                                        </div>
                                        <span>{point}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <a
                                    href={heroPrimaryButtonLink}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#da2e29] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c62823]"
                                >
                                    {heroPrimaryButtonText}
                                    <ArrowRight className="h-4 w-4" />
                                </a>

                                <a
                                    href={heroSecondaryButtonLink}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                                >
                                    {heroSecondaryButtonText}
                                </a>
                            </div>
                        </motion.div>

                        <motion.div
                            className="lg:col-span-5"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                        >
                            <div className="relative overflow-hidden rounded-[28px] border border-gray-200 bg-white p-3 shadow-2xl dark:border-white/10 dark:bg-white/5">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#da2e29]/10 via-transparent to-[#0f766e]/10" />

                                <img
                                    src="/assets/images/portrait.jpg"
                                    alt="Portrait"
                                    className="relative z-10 h-full min-h-[460px] w-full rounded-[22px] object-cover"
                                />

                                {!!meta.story_years && (
                                    <div className="absolute bottom-5 left-5 z-20 rounded-2xl border border-white/10 bg-slate-950/75 px-5 py-4 shadow-xl backdrop-blur-md">
                                        <div className="text-3xl font-bold tracking-tight text-[#da2e29]">
                                            {meta.story_years}
                                        </div>
                                        <div className="text-sm font-medium text-slate-300">
                                            Années d’expérience
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* STORY + STATS */}
                <section
                    ref={storyRef}
                    className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8"
                >
                    <motion.div
                        variants={sectionReveal}
                        initial="hidden"
                        animate={inStory ? 'visible' : 'hidden'}
                        className="grid grid-cols-1 gap-6 lg:grid-cols-12"
                    >
                        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-10 lg:col-span-8">
                            <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-[#da2e29] dark:bg-red-500/10">
                                Parcours
                            </span>

                            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                                Mon histoire
                            </h2>

                            <div
                                className="prose prose-slate mt-6 max-w-none prose-p:text-[15px] prose-p:leading-7 prose-headings:tracking-tight dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: safeContent }}
                            />
                        </div>

                        <div className="space-y-6 lg:col-span-4">
                            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Fondateur
                                </div>
                                <div className="mt-2 text-xl font-semibold">
                                    {meta.story_author ?? 'Redeemer Holding'}
                                </div>
                                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    {meta.story_role ?? 'Coach & Mentor'}
                                </div>
                            </div>

                            {stats.map((stat, idx) => (
                                <div
                                    key={`${stat.label}-${idx}`}
                                    className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
                                >
                                    <div className="text-3xl font-bold tracking-tight text-[#da2e29]">
                                        {stat.value}
                                    </div>
                                    <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* VALUES */}
                {values.length > 0 && (
                    <section
                        ref={valuesRef}
                        className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8"
                    >
                        <motion.div
                            variants={sectionReveal}
                            initial="hidden"
                            animate={inValues ? 'visible' : 'hidden'}
                        >
                            <div className="mx-auto mb-12 max-w-3xl text-center">
                                <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-[#da2e29] dark:bg-red-500/10">
                                    Valeurs
                                </span>
                                <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                                    Ce qui guide ma manière d’accompagner
                                </h2>
                                <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                                    Une approche exigeante, humaine et orientée résultats.
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {values.map((value, idx) => {
                                    const Icon = iconFromName(value.icon)

                                    return (
                                        <motion.article
                                            key={`${value.title}-${idx}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={
                                                inValues
                                                    ? { opacity: 1, y: 0 }
                                                    : { opacity: 0, y: 20 }
                                            }
                                            transition={{ duration: 0.45, delay: idx * 0.08 }}
                                            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-white/5"
                                        >
                                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#da2e29] transition group-hover:bg-[#da2e29] group-hover:text-white dark:bg-red-500/10">
                                                <Icon className="h-5 w-5" />
                                            </div>

                                            <h3 className="text-xl font-semibold tracking-tight">
                                                {value.title}
                                            </h3>

                                            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                                                {value.description}
                                            </p>
                                        </motion.article>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </section>
                )}

                {/* TIMELINE */}
                {journey.length > 0 && (
                    <section
                        ref={timelineRef}
                        className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8"
                    >
                        <motion.div
                            variants={sectionReveal}
                            initial="hidden"
                            animate={inTimeline ? 'visible' : 'hidden'}
                        >
                            <div className="mx-auto mb-12 max-w-3xl text-center">
                                <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-[#0f766e] dark:bg-teal-500/10">
                                    Évolution
                                </span>
                                <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                                    Les étapes clés de mon parcours
                                </h2>
                            </div>

                            <div className="relative">
                                <div className="absolute bottom-2 left-3 top-2 w-px bg-slate-300/80 dark:bg-white/10" />

                                <div className="space-y-6">
                                    {journey.map((step, idx) => (
                                        <motion.div
                                            key={`${step.year}-${idx}`}
                                            initial={{ opacity: 0, x: 18 }}
                                            animate={
                                                inTimeline
                                                    ? { opacity: 1, x: 0 }
                                                    : { opacity: 0, x: 18 }
                                            }
                                            transition={{ duration: 0.45, delay: idx * 0.07 }}
                                            className="relative pl-10"
                                        >
                                            <div className="absolute left-0 top-2 h-6 w-6 rounded-full bg-[#da2e29] ring-4 ring-[#da2e29]/20" />

                                            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                                                <div className="text-sm font-semibold text-[#da2e29]">
                                                    {step.year}
                                                </div>
                                                <h3 className="mt-2 text-xl font-semibold tracking-tight">
                                                    {step.title}
                                                </h3>
                                                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </section>
                )}

                {/* MISSION */}
                <section
                    ref={missionRef}
                    className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8"
                >
                    <motion.div
                        variants={sectionReveal}
                        initial="hidden"
                        animate={inMission ? 'visible' : 'hidden'}
                        className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 px-8 py-10 shadow-sm dark:border-white/10 dark:bg-gray-900 md:px-12 md:py-12"
                    >
                        <div className="max-w-4xl">
                            <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-[#0f766e] dark:bg-teal-500/10">
                                {missionLabel}
                            </span>

                            <h2 className="mt-5 text-3xl font-bold leading-[1.08] tracking-tight md:text-4xl">
                                {missionTitle}
                            </h2>

                            <div className="mt-8 border-l border-slate-300/80 pl-5 dark:border-white/10">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                    {missionSubtitle}
                                </p>

                                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                                    {missionText}
                                </p>

                                {missionButtonText && missionButtonLink && (
                                    <a
                                        href={missionButtonLink}
                                        className="mt-7 inline-flex items-center justify-center rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                                    >
                                        {missionButtonText}
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* TESTIMONIALS */}
                {testimonials.length > 0 && (
                    <section
                        ref={testimonialsRef}
                        className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8"
                    >
                        <motion.div
                            variants={sectionReveal}
                            initial="hidden"
                            animate={inTestimonials ? 'visible' : 'hidden'}
                        >
                            <div className="mx-auto mb-12 max-w-3xl text-center">
                                <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-[#da2e29] dark:bg-red-500/10">
                                    Témoignages
                                </span>
                                <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                                    Ce que disent mes clients
                                </h2>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {testimonials.map((item, idx) => (
                                    <motion.article
                                        key={`${item.author}-${idx}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={
                                            inTestimonials
                                                ? { opacity: 1, y: 0 }
                                                : { opacity: 0, y: 20 }
                                        }
                                        transition={{ duration: 0.45, delay: idx * 0.08 }}
                                        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
                                    >
                                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-[#da2e29] dark:bg-red-500/10">
                                            <Quote className="h-5 w-5" />
                                        </div>

                                        <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
                                            “{item.content}”
                                        </p>

                                        <div className="mt-6 flex items-center gap-3">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.author}
                                                    className="h-11 w-11 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#da2e29]/15">
                                                    <span className="text-sm font-semibold text-[#da2e29]">
                                                        {item.author?.charAt(0)}
                                                    </span>
                                                </div>
                                            )}

                                            <div>
                                                <div className="text-sm font-semibold">
                                                    {item.author}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    {item.position}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.article>
                                ))}
                            </div>
                        </motion.div>
                    </section>
                )}

                {/* CERTIFICATIONS */}
                {certifications.length > 0 && (
                    <section
                        ref={certificationsRef}
                        className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8"
                    >
                        <motion.div
                            variants={sectionReveal}
                            initial="hidden"
                            animate={inCertifications ? 'visible' : 'hidden'}
                        >
                            <div className="mx-auto mb-12 max-w-3xl text-center">
                                <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-[#0f766e] dark:bg-teal-500/10">
                                    Certifications
                                </span>
                                <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                                    Références et reconnaissances
                                </h2>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {certifications.map((certification, idx) => (
                                    <div
                                        key={`${certification}-${idx}`}
                                        className="rounded-2xl border border-gray-200 bg-white p-6 text-sm leading-7 text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                                    >
                                        {certification}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </section>
                )}

                {/* FINAL CTA */}
                <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 22 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6 }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#da2e29] to-[#c62823] px-8 py-12 text-white md:px-12 md:py-14"
                    >
                        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

                        <div className="relative z-10 max-w-3xl">
                            <h2 className="text-3xl font-bold leading-[1.08] tracking-tight md:text-4xl">
                                Prêt à donner un nouveau cap à votre trajectoire ?
                            </h2>

                            <p className="mt-4 max-w-2xl text-base leading-7 text-white/90">
                                Planifions un premier échange pour clarifier vos priorités, faire le point sur votre situation et construire une progression réaliste.
                            </p>

                            <div className="mt-7 flex flex-wrap gap-3">
                                <a
                                    href="/contact"
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#da2e29] transition hover:bg-slate-100"
                                >
                                    Prendre contact
                                    <ArrowRight className="h-4 w-4" />
                                </a>

                                <a
                                    href="/services"
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                                >
                                    Explorer les services
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>
        </FrontLayout>
    )
}

export default AboutPage