import React, { useMemo, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import DOMPurify from 'dompurify';
import {
    ArrowRight,
    Award,
    BookOpen,
    CheckCircle,
    Heart,
    Quote,
    Shield,
    Sparkles,
    Target,
    TrendingUp,
    Users,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import FrontLayout from '@/components/frontend/layouts/front-layout';

type ValueItem = {
    icon: string;
    title: string;
    description: string;
};

type StatItem = {
    value: string;
    label: string;
};

type JourneyItem = {
    year: string;
    title: string;
    description: string;
};

type TestimonialItem = {
    content: string;
    author: string;
    position: string;
    image?: string;
};

type AboutMeta = {
    hero_subtitle?: string;
    story_author?: string;
    story_role?: string;
    story_years?: string;
    values?: ValueItem[];
    stats?: StatItem[];
    journey?: JourneyItem[];
    testimonials?: TestimonialItem[];
};

type AboutPageData = {
    title: string;
    content: string;
    status: boolean;
    meta: AboutMeta | null;
};

const ICONS: Record<string, LucideIcon> = {
    TrendingUp,
    Users,
    Award,
    CheckCircle,
    BookOpen,
    Heart,
    Zap,
    Shield,
    Target,
};

const sectionReveal = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function iconFromName(name?: string): LucideIcon {
    if (!name) return Award;
    return ICONS[name] ?? Award;
}

function AboutPage({ page }: { page?: AboutPageData }) {
    const meta = page?.meta ?? {};

    const rootRef = useRef<HTMLDivElement>(null);
    const storyRef = useRef<HTMLDivElement>(null);
    const valuesRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const testimonialsRef = useRef<HTMLDivElement>(null);

    const inStory = useInView(storyRef, { once: false, amount: 0.2 });
    const inValues = useInView(valuesRef, { once: false, amount: 0.2 });
    const inTimeline = useInView(timelineRef, { once: false, amount: 0.2 });
    const inTestimonials = useInView(testimonialsRef, { once: false, amount: 0.2 });

    const { scrollYProgress } = useScroll({ target: rootRef, offset: ['start start', 'end start'] });
    const orbY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);

    const values = meta.values ?? [];
    const stats = meta.stats ?? [];
    const journey = meta.journey ?? [];
    const testimonials = meta.testimonials ?? [];
    const safeContent = useMemo(() => DOMPurify.sanitize(page?.content ?? ''), [page?.content]);

    const signatureTitle = page?.title ?? 'Transformer des vies avec clarte et sens';
    const signatureSubtitle =
        meta.hero_subtitle ??
        "J'accompagne les leaders, entrepreneurs et professionnels a realigner leurs decisions avec leurs valeurs pour creer une croissance durable.";

    const quickPoints = useMemo(
        () => [
            'Coaching humain, pragmatique et orienté résultats',
            'Méthode structurée en étapes claires',
            'Accompagnement personnalisé selon votre rythme',
        ],
        []
    );

    return (
        <FrontLayout>
            <Head title={page?.title ?? 'A propos'} />

            <main ref={rootRef} className="relative min-h-screen overflow-hidden bg-[#f7f6f2] text-slate-900 dark:bg-slate-950 dark:text-white pt-28 pb-20">
                <motion.div
                    className="pointer-events-none absolute -top-24 -left-20 h-80 w-80 rounded-full bg-[#da2e29]/15 blur-3xl"
                    style={{ y: orbY }}
                />
                <motion.div
                    className="pointer-events-none absolute bottom-[-120px] right-[-40px] h-96 w-96 rounded-full bg-[#0f766e]/10 blur-3xl"
                    style={{ y: orbY }}
                />

                <section className="max-w-[1320px] mx-auto px-6 md:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                        <motion.div
                            className="lg:col-span-7"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#da2e29]/30 bg-white/70 px-4 py-1 text-xs tracking-wide uppercase text-[#da2e29] dark:bg-slate-900/60">
                                <Sparkles className="h-3.5 w-3.5" />
                                A propos
                            </span>

                            <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.08] tracking-tight text-slate-900 dark:text-white">
                                {signatureTitle}
                            </h1>

                            <p className="mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
                                {signatureSubtitle}
                            </p>

                            <div className="mt-8 grid sm:grid-cols-2 gap-3 max-w-2xl">
                                {quickPoints.map((point) => (
                                    <div
                                        key={point}
                                        className="rounded-xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
                                    >
                                        {point}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <a
                                    href="/contact"
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#da2e29] px-6 py-3 text-white font-medium hover:bg-[#c62823] transition-colors"
                                >
                                    Discutons de votre projet
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                                <a
                                    href="/services"
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-slate-800 font-medium hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    Voir mes services
                                </a>
                            </div>
                        </motion.div>

                        <motion.div
                            className="lg:col-span-5"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                        >
                            <div className="relative h-full rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#da2e29]/10 via-transparent to-[#0f766e]/10" />
                                <img
                                    src="/assets/images/portrait.jpg"
                                    alt="Portrait"
                                    className="relative z-10 h-full min-h-[460px] w-full rounded-2xl object-cover"
                                />

                                {!!meta.story_years && (
                                    <div className="absolute bottom-8 left-8 z-20 rounded-2xl bg-white/90 px-4 py-3 shadow-lg backdrop-blur dark:bg-slate-900/90">
                                        <div className="text-2xl font-bold text-[#da2e29]">{meta.story_years}</div>
                                        <div className="text-xs uppercase tracking-wide text-slate-500">Annees d'experience</div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section ref={storyRef} className="max-w-[1320px] mx-auto px-6 md:px-8 mt-20 md:mt-24">
                    <motion.div
                        variants={sectionReveal}
                        initial="hidden"
                        animate={inStory ? 'visible' : 'hidden'}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-10"
                    >
                        <div className="lg:col-span-8 rounded-3xl border border-slate-200/80 bg-white p-8 md:p-10 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <h2 className="text-2xl md:text-3xl font-semibold">Mon histoire</h2>
                            <div
                                className="mt-6 prose max-w-none prose-slate dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: safeContent }}
                            />
                        </div>

                        <div className="lg:col-span-4 space-y-4">
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                                <div className="text-xs uppercase tracking-wide text-slate-500">Fondateur</div>
                                <div className="mt-2 text-xl font-semibold">{meta.story_author ?? 'Redeemer Holding'}</div>
                                <div className="mt-1 text-sm text-slate-500">{meta.story_role ?? 'Coach & Mentor'}</div>
                            </div>

                            {stats.slice(0, 2).map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
                                >
                                    <div className="text-3xl font-bold text-[#da2e29]">{stat.value}</div>
                                    <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {values.length > 0 && (
                    <section ref={valuesRef} className="max-w-[1320px] mx-auto px-6 md:px-8 mt-20 md:mt-24">
                        <motion.div
                            variants={sectionReveal}
                            initial="hidden"
                            animate={inValues ? 'visible' : 'hidden'}
                        >
                            <div className="mb-8">
                                <span className="inline-flex rounded-full bg-[#da2e29]/10 px-3 py-1 text-xs uppercase tracking-wide text-[#da2e29]">
                                    Valeurs
                                </span>
                                <h2 className="mt-3 text-2xl md:text-3xl font-semibold">Ce que je defends au quotidien</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {values.map((value, idx) => {
                                    const Icon = iconFromName(value.icon);
                                    return (
                                        <motion.article
                                            key={`${value.title}-${idx}`}
                                            initial={{ opacity: 0, y: 24 }}
                                            animate={inValues ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                                            transition={{ duration: 0.45, delay: idx * 0.08 }}
                                            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-slate-700 dark:bg-slate-900"
                                        >
                                            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#da2e29]/10 text-[#da2e29]">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <h3 className="mt-4 text-lg font-semibold">{value.title}</h3>
                                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                {value.description}
                                            </p>
                                        </motion.article>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </section>
                )}

                {journey.length > 0 && (
                    <section ref={timelineRef} className="max-w-[1320px] mx-auto px-6 md:px-8 mt-20 md:mt-24">
                        <motion.div variants={sectionReveal} initial="hidden" animate={inTimeline ? 'visible' : 'hidden'}>
                            <div className="mb-8">
                                <span className="inline-flex rounded-full bg-[#0f766e]/10 px-3 py-1 text-xs uppercase tracking-wide text-[#0f766e]">
                                    Parcours
                                </span>
                                <h2 className="mt-3 text-2xl md:text-3xl font-semibold">Les etapes cle de mon evolution</h2>
                            </div>

                            <div className="relative">
                                <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-300 dark:bg-slate-700" />
                                <div className="space-y-6">
                                    {journey.map((step, idx) => (
                                        <motion.div
                                            key={`${step.year}-${idx}`}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={inTimeline ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                                            transition={{ duration: 0.45, delay: idx * 0.07 }}
                                            className="relative pl-10"
                                        >
                                            <div className="absolute left-0 top-2 h-6 w-6 rounded-full bg-[#da2e29] ring-4 ring-[#da2e29]/20" />
                                            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                                                <div className="text-xs uppercase tracking-wide text-[#da2e29] font-semibold">{step.year}</div>
                                                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{step.description}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </section>
                )}

                {testimonials.length > 0 && (
                    <section ref={testimonialsRef} className="max-w-[1320px] mx-auto px-6 md:px-8 mt-20 md:mt-24">
                        <motion.div variants={sectionReveal} initial="hidden" animate={inTestimonials ? 'visible' : 'hidden'}>
                            <div className="mb-8">
                                <span className="inline-flex rounded-full bg-[#da2e29]/10 px-3 py-1 text-xs uppercase tracking-wide text-[#da2e29]">
                                    Temoignages
                                </span>
                                <h2 className="mt-3 text-2xl md:text-3xl font-semibold">Ce que disent mes clients</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {testimonials.map((item, idx) => (
                                    <motion.article
                                        key={`${item.author}-${idx}`}
                                        initial={{ opacity: 0, y: 22 }}
                                        animate={inTestimonials ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
                                        transition={{ duration: 0.45, delay: idx * 0.08 }}
                                        className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                                    >
                                        <Quote className="h-8 w-8 text-[#da2e29]/40" />
                                        <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">"{item.content}"</p>
                                        <div className="mt-5 flex items-center gap-3">
                                            {item.image ? (
                                                <img src={item.image} alt={item.author} className="h-10 w-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                                            )}
                                            <div>
                                                <div className="text-sm font-semibold">{item.author}</div>
                                                <div className="text-xs text-slate-500">{item.position}</div>
                                            </div>
                                        </div>
                                    </motion.article>
                                ))}
                            </div>
                        </motion.div>
                    </section>
                )}

                <section className="max-w-[1320px] mx-auto px-6 md:px-8 mt-20 md:mt-24">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6 }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#da2e29] to-[#c62823] px-8 py-12 md:px-12 md:py-14 text-white"
                    >
                        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

                        <div className="relative z-10 max-w-3xl">
                            <h2 className="text-3xl md:text-4xl font-semibold leading-tight">Pret a donner un nouveau cap a votre trajectoire ?</h2>
                            <p className="mt-4 text-white/90 text-base md:text-lg">
                                Planifions un premier echange pour clarifier vos priorites et construire une feuille de route realiste, ambitieuse et durable.
                            </p>

                            <div className="mt-7 flex flex-wrap gap-3">
                                <a
                                    href="/contact"
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-[#da2e29] hover:bg-slate-100 transition-colors"
                                >
                                    Prendre contact
                                    <ArrowRight className="h-4 w-4" />
                                </a>
                                <a
                                    href="/services"
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/70 px-6 py-3 font-medium text-white hover:bg-white/10 transition-colors"
                                >
                                    Explorer les services
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>
        </FrontLayout>
    );
}

export default AboutPage;
