import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Calendar, GraduationCap, Search, Sparkles, ArrowRight, History } from 'lucide-react';
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

const FormationsPage = ({ formations, featuredFormation }: any) => {
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
                if (!end || end >= now) {
                    acc[0].push(item);
                } else {
                    acc[1].push(item);
                }
                return acc;
            },
            [[], []]
        );
    }, [allFormations, now]);

    const filteredUpcoming = useMemo(() => {
        if (!search.trim()) return upcoming;
        const term = search.toLowerCase();

        return upcoming.filter((item: any) => {
            const title = item?.title?.toLowerCase?.() || '';
            const excerpt = item?.excerpt?.toLowerCase?.() || '';
            const tags = Array.isArray(item?.tags) ? item.tags.join(' ').toLowerCase() : '';
            return title.includes(term) || excerpt.includes(term) || tags.includes(term);
        });
    }, [upcoming, search]);

    const filteredPast = useMemo(() => {
        if (!search.trim()) return past;
        const term = search.toLowerCase();

        return past.filter((item: any) => {
            const title = item?.title?.toLowerCase?.() || '';
            const excerpt = item?.excerpt?.toLowerCase?.() || '';
            const tags = Array.isArray(item?.tags) ? item.tags.join(' ').toLowerCase() : '';
            return title.includes(term) || excerpt.includes(term) || tags.includes(term);
        });
    }, [past, search]);

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

            <main className="relative min-h-screen overflow-hidden bg-[#f7f6f2] pt-28 pb-20 dark:bg-slate-950">
                <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-[#0f766e]/15 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#da2e29]/10 blur-3xl" />

                <section className="mx-auto max-w-[1320px] px-6 md:px-8">
                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#0f766e]/30 bg-white/80 px-4 py-1 text-xs uppercase tracking-wide text-[#0f766e] dark:bg-slate-900/70">
                            <Sparkles className="h-3.5 w-3.5" />
                            Formations
                        </span>
                        <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-slate-900 md:text-6xl dark:text-white">
                            Passez au niveau superieur avec des formations concretes et actionnables
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
                            Une experience pratique, des experts reconnus et un cadre clair pour transformer vos competences en resultats mesurables.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.1 }}
                        className="mt-8 flex flex-col gap-3 md:flex-row md:items-center"
                    >
                        <div className="relative w-full md:max-w-xl">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher une formation"
                                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#0f766e] dark:border-slate-700 dark:bg-slate-900"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowPast((prev) => !prev)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                        >
                            <History className="h-4 w-4" />
                            {shouldShowPast ? 'Masquer les passees' : 'Afficher les passees'}
                        </button>
                    </motion.div>
                </section>

                {activeFeatured && (
                    <section className="mx-auto mt-14 max-w-[1320px] px-6 md:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.55 }}
                            className="relative overflow-hidden rounded-3xl"
                        >
                            <img src={resolveImage(activeFeatured?.featured_image)} alt={activeFeatured?.title} className="h-[420px] w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />

                            <div className="absolute inset-0 z-10 p-8 md:p-12">
                                <span className="inline-flex items-center rounded-full bg-[#0f766e] px-3 py-1 text-xs font-medium text-white">A la une</span>
                                <h2 className="mt-5 max-w-3xl text-3xl font-semibold text-white md:text-5xl">{activeFeatured?.title}</h2>
                                <p className="mt-4 max-w-2xl text-white/85">{activeFeatured?.excerpt}</p>

                                <div className="mt-7 flex flex-wrap items-center gap-4 text-sm text-white/90">
                                    <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" />
                                        {activeFeatured?.start_date ? new Date(activeFeatured.start_date).toLocaleDateString('fr-FR') : '-'}
                                    </span>
                                    <span className="rounded-full border border-white/30 px-3 py-1">{activeFeatured?.price === 0 ? 'Gratuit' : `${activeFeatured?.price} CHF`}</span>
                                </div>

                                <Link
                                    href={route('formations.details', activeFeatured?.slug)}
                                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-[#0f766e] hover:bg-slate-100"
                                >
                                    Voir la formation
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </motion.div>
                    </section>
                )}

                <section className="mx-auto mt-16 max-w-[1320px] px-6 md:px-8">
                    <div className="mb-8 flex items-end justify-between gap-4">
                        <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-white">Formations a venir</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{filteredUpcoming.length} resultat(s)</p>
                    </div>

                    {filteredUpcoming.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                            Aucune formation a venir ne correspond a votre recherche.
                            {filteredPast.length > 0 && (
                                <p className="mt-2 text-sm">Les formations passees sont affichees juste en dessous.</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {filteredUpcoming.map((formation: any) => (
                                <FormationCard key={formation.id} formation={formation} />
                            ))}
                        </div>
                    )}

                    {lastPage > 1 && (
                        <div className="mt-10 flex items-center justify-center gap-3">
                            <Link
                                href={route('formations', { page: currentPage - 1 })}
                                className={`rounded-lg px-4 py-2 text-sm font-medium ${currentPage <= 1 ? 'pointer-events-none bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700'}`}
                            >
                                Precedent
                            </Link>
                            <span className="text-sm text-slate-500 dark:text-slate-400">Page {currentPage} / {lastPage}</span>
                            <Link
                                href={route('formations', { page: currentPage + 1 })}
                                className={`rounded-lg px-4 py-2 text-sm font-medium ${currentPage >= lastPage ? 'pointer-events-none bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700'}`}
                            >
                                Suivant
                            </Link>
                        </div>
                    )}
                </section>

                {shouldShowPast && (
                    <section className="mx-auto mt-16 max-w-[1320px] px-6 md:px-8">
                        <div className="mb-8 flex items-end justify-between gap-4">
                            <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl dark:text-white">Formations passees</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{filteredPast.length} resultat(s)</p>
                        </div>

                        {filteredPast.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                                Aucune formation passee ne correspond a votre recherche.
                            </div>
                        ) : (
                            <div className="space-y-8 opacity-90">
                                {filteredPast.map((formation: any) => (
                                    <FormationCard key={formation.id} formation={formation} />
                                ))}
                            </div>
                        )}
                    </section>
                )}

                <section className="mx-auto mt-20 max-w-[1320px] px-6 md:px-8">
                    <div className="rounded-3xl bg-gradient-to-r from-[#0f766e] to-[#115e59] p-10 text-white md:p-12">
                        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                            <div>
                                <p className="inline-flex items-center gap-2 text-sm text-white/80"><GraduationCap className="h-4 w-4" />
                                    Besoin d'aide pour choisir ?
                                </p>
                                <h3 className="mt-3 text-3xl font-semibold">On vous recommande la meilleure formation selon votre objectif</h3>
                            </div>
                            <Link href={route('contact')} className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-[#0f766e]">
                                Parler a un conseiller
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
