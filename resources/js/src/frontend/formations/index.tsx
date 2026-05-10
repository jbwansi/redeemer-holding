import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Calendar,
    GraduationCap,
    Search,
    Sparkles,
    ArrowRight,
    History,
} from 'lucide-react';
import { route } from 'ziggy-js';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import FormationCard from '@/components/frontend/formations/formation-card';

const resolveImage = (image: any): string => {
    if (!image) return '/assets/images/coaching-session.jpg';
    if (typeof image === 'string') return image;
    return image?.large || image?.medium || image?.original || image?.thumbnail || '/assets/images/coaching-session.jpg';
};

const toDate = (value: any): Date | null => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const FormationsPage = ({ formations, featuredFormation, pageContent = {} }: any) => {
    const [search, setSearch] = useState('');
    const [showPast, setShowPast] = useState(false);

    const allFormations = formations?.data ?? [];
    const currentPage = formations?.meta?.current_page ?? 1;
    const lastPage = formations?.meta?.last_page ?? 1;
    const now = new Date();

    const [upcoming, past] = useMemo(() => {
        return allFormations.reduce(
            (acc: any[], item: any) => {
                const end = toDate(item?.end_date);
                if (!end || end >= now) acc[0].push(item);
                else acc[1].push(item);
                return acc;
            },
            [[], []]
        );
    }, [allFormations, now]);

    const filterItems = (items: any[]) => {
        if (!search.trim()) return items;

        const term = search.toLowerCase();

        return items.filter((item: any) => {
            const title = item?.title?.toLowerCase?.() || '';
            const excerpt = item?.excerpt?.toLowerCase?.() || '';
            const tags = Array.isArray(item?.tags) ? item.tags.join(' ').toLowerCase() : '';

            return title.includes(term) || excerpt.includes(term) || tags.includes(term);
        });
    };

    const filteredUpcoming = useMemo(() => filterItems(upcoming), [upcoming, search]);
    const filteredPast = useMemo(() => filterItems(past), [past, search]);

    const shouldShowPast = showPast || (filteredUpcoming.length === 0 && filteredPast.length > 0);

    const activeFeatured = useMemo(() => {
        const candidate = featuredFormation || upcoming?.[0] || null;
        if (!candidate) return null;

        const end = toDate(candidate?.end_date);
        if (end && end < now) return null;

        return candidate;
    }, [featuredFormation, upcoming, now]);

    return (
        <FrontLayout>
            <Head title="Formations" />

            <main className="relative min-h-screen overflow-hidden bg-[#f7f6f2] pb-20 pt-28 dark:bg-slate-950">
                <div className="pointer-events-none absolute -left-16 -top-20 h-72 w-72 rounded-full bg-[#0f766e]/15 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#da2e29]/10 blur-3xl" />

                <section className="relative mx-auto max-w-[1320px] px-6 md:px-8">
                    <div className={`grid gap-12 lg:items-center ${activeFeatured ? 'lg:grid-cols-[0.9fr_1.1fr]' : 'lg:grid-cols-1'}`}>
                        <motion.div
                            className="relative lg:-mt-8"
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#0f766e]/30 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#0f766e] shadow-sm dark:bg-slate-900/70">
                                <Sparkles className="h-3.5 w-3.5" />
                                {pageContent.hero_badge || 'Formations'}
                            </span>

                            <h1 className={`${activeFeatured ? 'max-w-4xl' : 'max-w-5xl'} mt-6 text-4xl font-black leading-tight text-slate-900 md:text-6xl dark:text-white`}>
                                {pageContent.hero_title || 'Passez au niveau supérieur avec des formations concrètes et actionnables'}
                            </h1>

                            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                                {pageContent.hero_subtitle || 'Une expérience pratique, des experts reconnus et un cadre clair pour transformer vos compétences en résultats mesurables.'}
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <a
                                    href="#formations"
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#0f766e]/40 bg-white/80 px-7 py-4 font-bold text-[#0f766e] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-[#0f766e] hover:text-white dark:bg-slate-900/70"
                                >
                                    Découvrir les formations
                                    <ArrowRight className="h-4 w-4" />
                                </a>

                                <Link
                                    href={route('contact')}
                                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white/80 px-7 py-4 font-bold text-slate-800 backdrop-blur transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
                                >
                                    Être conseillé
                                </Link>
                            </div>
                        </motion.div>

                        {activeFeatured && (
                            <motion.div
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.55 }}
                                className="relative lg:mt-10"
                            >
                                <div className="pointer-events-none absolute -inset-4 rounded-[3rem] bg-[#0f766e]/5 blur-2xl" />

                                <span className="absolute left-6 top-0 z-20 inline-flex -translate-y-1/2 items-center gap-2 rounded-full bg-[#0f766e] px-3 py-1 text-xs font-bold text-white shadow-lg shadow-[#0f766e]/30">
                                    ✨ À la une
                                </span>

                                <Link
                                    href={route('formations.details', activeFeatured?.slug)}
                                    className="group relative block overflow-hidden rounded-[2.25rem] border border-slate-200/70 bg-white/80 p-3 shadow-2xl shadow-slate-900/10 backdrop-blur transition duration-300 hover:-translate-y-1 dark:border-slate-700/70 dark:bg-slate-900/70"
                                >
                                    <div className="w-full overflow-hidden rounded-[1.75rem]">
                                        <img
                                            src={resolveImage(activeFeatured?.featured_image)}
                                            alt={activeFeatured?.title}
                                            className="h-[360px] w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                                            loading="eager"
                                            decoding="async"
                                        />
                                    </div>

                                    <div className="mt-3 flex flex-col gap-4 rounded-[1.5rem] border border-slate-200/70 bg-white/90 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/70 dark:bg-slate-950/95">
                                        <span className="inline-flex w-fit items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black uppercase tracking-wide text-[#0f766e] dark:bg-slate-800">
                                            {Number(activeFeatured?.price ?? 0) <= 0 ? '🎁 Gratuit' : `${activeFeatured.price} CHF`}
                                        </span>

                                        <span className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f766e] px-6 py-4 font-black text-white shadow-lg shadow-[#0f766e]/25 transition group-hover:bg-[#115e59]">
                                            Voir la formation
                                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        )}
                    </div>
                </section>

                <section id="formations" className="relative mx-auto mt-14 max-w-[1320px] px-6 md:px-8">
                    <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-xl shadow-slate-900/5 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            <div className="relative w-full md:max-w-xl">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Rechercher une formation"
                                    className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-11 pr-4 text-sm outline-none transition focus:border-[#0f766e] dark:border-slate-700 dark:bg-slate-950"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowPast((prev) => !prev)}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-bold transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-800"
                            >
                                <History className="h-4 w-4" />
                                {shouldShowPast ? 'Masquer les passées' : 'Afficher les passées'}
                            </button>
                        </div>
                    </div>
                </section>

                <section className="mx-auto mt-16 max-w-[1320px] px-6 md:px-8">
                    <div className="mb-8 flex items-end justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 md:text-4xl dark:text-white">
                                {pageContent.section_title || 'Formations à venir'}
                            </h2>

                            {pageContent.section_subtitle && (
                                <p className="mt-2 text-slate-600 dark:text-slate-300">
                                    {pageContent.section_subtitle}
                                </p>
                            )}
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {filteredUpcoming.length} résultat(s)
                        </p>
                    </div>

                    {filteredUpcoming.length === 0 ? (
                        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                            Aucune formation ne correspond à votre recherche.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredUpcoming.map((formation: any) => (
                                <div
                                    key={formation.id}
                                    className="rounded-[2rem] bg-white p-2 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-2xl dark:bg-slate-900 dark:ring-slate-700"
                                >
                                    <FormationCard formation={formation} />
                                </div>
                            ))}
                        </div>
                    )}

                    {lastPage > 1 && (
                        <div className="mt-10 flex items-center justify-center gap-3">
                            <Link
                                href={route('formations', { page: currentPage - 1 })}
                                className={`rounded-xl px-5 py-3 text-sm font-bold ${
                                    currentPage <= 1
                                        ? 'pointer-events-none bg-slate-200 text-slate-500 dark:bg-slate-800'
                                        : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700'
                                }`}
                            >
                                Précédent
                            </Link>

                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                Page {currentPage} / {lastPage}
                            </span>

                            <Link
                                href={route('formations', { page: currentPage + 1 })}
                                className={`rounded-xl px-5 py-3 text-sm font-bold ${
                                    currentPage >= lastPage
                                        ? 'pointer-events-none bg-slate-200 text-slate-500 dark:bg-slate-800'
                                        : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700'
                                }`}
                            >
                                Suivant
                            </Link>
                        </div>
                    )}
                </section>

                {shouldShowPast && (
                    <section className="mx-auto mt-16 max-w-[1320px] px-6 md:px-8">
                        <div className="mb-8 flex items-end justify-between gap-4">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                                Formations passées
                            </h2>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {filteredPast.length} résultat(s)
                            </p>
                        </div>

                        {filteredPast.length === 0 ? (
                            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                                Aucune formation passée ne correspond à votre recherche.
                            </div>
                        ) : (
                            <div className="space-y-6 opacity-90">
                                {filteredPast.map((formation: any) => (
                                    <div
                                        key={formation.id}
                                        className="rounded-[2rem] bg-white p-2 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"
                                    >
                                        <FormationCard formation={formation} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                <section className="mx-auto mt-20 max-w-[1320px] px-6 md:px-8">
                    <div className="rounded-[2rem] bg-gradient-to-r from-[#0f766e] to-[#115e59] p-10 text-white shadow-xl shadow-[#0f766e]/20 md:p-12">
                        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                            <div>
                                <p className="inline-flex items-center gap-2 text-sm text-white/80">
                                    <GraduationCap className="h-4 w-4" />
                                    {pageContent.final_cta_kicker || "Besoin d'aide pour choisir ?"}
                                </p>

                                <h3 className="mt-3 text-3xl font-black">
                                    {pageContent.final_cta_title || 'On vous recommande la meilleure formation selon votre objectif'}
                                </h3>

                                {pageContent.final_cta_text && (
                                    <p className="mt-3 max-w-2xl text-white/85">
                                        {pageContent.final_cta_text}
                                    </p>
                                )}
                            </div>

                            <Link
                                href={pageContent.final_cta_button_url || route('contact')}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-[#0f766e]"
                            >
                                {pageContent.final_cta_button_label || 'Parler à un conseiller'}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </FrontLayout>
    );
};

export default FormationsPage;