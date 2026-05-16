import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Search, Sparkles, ArrowRight, History, Filter } from 'lucide-react';
import { route } from 'ziggy-js';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import EventCard from '@/components/frontend/events/event-card';

const resolveImage = (image: any): string => {
  if (!image) return '/assets/images/coaching-session.jpg';
  if (typeof image === 'string') return image;
  return (
    image?.original ||
    image?.large ||
    image?.medium ||
    image?.thumbnail ||
    '/assets/images/coaching-session.jpg'
  );
};

const toDate = (value: any): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const EventsPage = ({ events, categories, featuredEvent, pageContent = {} }: any) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);

  const allEvents = events?.data ?? [];
  const currentPage = events?.meta?.current_page ?? 1;
  const lastPage = events?.meta?.last_page ?? 1;
  const allCategories = categories ?? [];
  const now = new Date();

  const [upcoming, past] = useMemo(() => {
    return allEvents.reduce(
      (acc: any[], item: any) => {
        const end = toDate(item?.end_date);
        if (!end || end >= now) acc[0].push(item);
        else acc[1].push(item);

        return acc;
      },
      [[], []]
    );
  }, [allEvents, now]);

  const applyFilters = (items: any[]) => {
    return items.filter((item: any) => {
      const term = search.toLowerCase();
      const title = item?.title?.toLowerCase?.() || '';
      const description = item?.description?.toLowerCase?.() || '';
      const tags = Array.isArray(item?.tags) ? item.tags.join(' ').toLowerCase() : '';

      const matchesSearch =
        !search.trim() || title.includes(term) || description.includes(term) || tags.includes(term);

      const matchesCategory = !selectedCategory || item?.category?.name === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  };

  const filteredUpcoming = useMemo(
    () => applyFilters(upcoming),
    [upcoming, search, selectedCategory]
  );
  const filteredPast = useMemo(() => applyFilters(past), [past, search, selectedCategory]);

  const activeFeatured = useMemo(() => {
    const candidate = featuredEvent || upcoming?.[0] || null;
    if (!candidate) return null;

    const end = toDate(candidate?.end_date);
    if (end && end < now) return null;

    return candidate;
  }, [featuredEvent, upcoming, now]);

  return (
    <FrontLayout>
      <Head title="Événements" />

      <main className="relative min-h-screen overflow-hidden bg-[#f7f6f2] pb-20 pt-36 dark:bg-slate-950">
        <div className="pointer-events-none absolute -left-16 -top-20 h-72 w-72 rounded-full bg-[#da2e29]/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#0f766e]/10 blur-3xl" />

        <section className="relative mx-auto max-w-[1320px] px-6 md:px-8">
          <div
            className={`grid gap-12 lg:items-center ${activeFeatured ? 'lg:grid-cols-[0.9fr_1.1fr]' : 'lg:grid-cols-1'}`}
          >
            <motion.div
              className="relative lg:-mt-8"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#da2e29]/30 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#da2e29] shadow-sm dark:bg-slate-900/70">
                <Sparkles className="h-3.5 w-3.5" />
                Événements & webinaires
              </span>

              <h1
                className={`${activeFeatured ? 'max-w-4xl' : 'max-w-5xl'} mt-6 text-4xl font-black leading-tight text-slate-900 md:text-6xl dark:text-white`}
              >
                {pageContent.hero_title ||
                  'Rencontrez, apprenez et avancez avec une communauté qui partage vos ambitions'}
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                {pageContent.hero_subtitle ||
                  'Des expériences en présentiel et en ligne pour accélérer votre progression personnelle et professionnelle.'}
              </p>

              {activeFeatured && (
                <div className="mt-8 rounded-2xl border border-slate-200 bg-white/70 p-5 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#da2e29]">
                    Prochain webinaire
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                    {activeFeatured.title}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                    {activeFeatured.description}
                  </p>
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#events"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#da2e29] px-7 py-4 font-bold text-white shadow-lg shadow-[#da2e29]/20 transition hover:-translate-y-0.5 hover:bg-[#c62823]"
                >
                  Découvrir les événements
                  <ArrowRight className="h-4 w-4" />
                </a>

                <Link
                  href={route('contact')}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white/80 px-7 py-4 font-bold text-slate-800 backdrop-blur transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
                >
                  Organiser un événement
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
                <div className="pointer-events-none absolute -inset-4 rounded-[3rem] bg-[#da2e29]/5 blur-2xl" />
                <span className="absolute left-6 top-0 z-20 inline-flex -translate-y-1/2 items-center gap-2 rounded-full bg-[#da2e29] px-3 py-1 text-xs font-bold text-white shadow-lg shadow-[#da2e29]/30">
                  ✨ À la une
                </span>

                <Link
                  href={route('evenements.details', activeFeatured?.slug)}
                  className="group relative block overflow-hidden rounded-[2.25rem] border border-slate-200/70 bg-white/80 p-3 shadow-2xl shadow-slate-900/10 backdrop-blur transition duration-300 hover:-translate-y-1 dark:border-slate-700/70 dark:bg-slate-900/70"
                >
                  <div className="w-full min-h-fit overflow-visible">
                    <img
                      src={resolveImage(activeFeatured?.featured_image)}
                      alt={activeFeatured?.title}
                      className="w-full h-auto object-contain transition duration-700"
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                  <div className="mt-3 flex flex-col gap-4 rounded-[1.5rem] border border-slate-200/70 bg-white/90 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/70 dark:bg-slate-950/95">
                    <span className="inline-flex w-fit items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black uppercase tracking-wide text-[#da2e29] dark:bg-slate-800">
                      {Number(activeFeatured?.price ?? 0) <= 0
                        ? '🎁 100% offert'
                        : `${activeFeatured.price} CHF`}
                    </span>

                    {/* <span className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#da2e29] px-6 py-4 font-black text-white shadow-lg shadow-[#da2e29]/25 transition group-hover:bg-[#c62823]"> */}
                    <span className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-[#da2e29] shadow transition group-hover:bg-slate-50 dark:bg-slate-900">
                      Voir l’événement
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
        </section>

        <section id="events" className="relative mx-auto mt-14 max-w-[1320px] px-6 md:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-xl shadow-slate-900/5 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full md:max-w-xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un événement"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-11 pr-4 text-sm outline-none transition focus:border-[#da2e29] dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowPast((prev) => !prev)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm font-bold transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-800"
              >
                <History className="h-4 w-4" />
                {showPast ? 'Masquer les passés' : 'Afficher les passés'}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                  selectedCategory === null
                    ? 'bg-[#da2e29] text-white shadow-lg shadow-[#da2e29]/20'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-950 dark:text-slate-300 dark:ring-slate-700'
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                Tous
              </button>

              {allCategories.map((category: any) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.name)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    selectedCategory === category.name
                      ? 'bg-[#da2e29] text-white shadow-lg shadow-[#da2e29]/20'
                      : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-950 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-[1320px] px-6 md:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#da2e29]">Agenda</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl dark:text-white">
                Événements à venir
              </h2>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {filteredUpcoming.length} résultat(s)
            </p>
          </div>

          {filteredUpcoming.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
              Aucun événement ne correspond à votre recherche.
            </div>
          ) : (
            <div className="space-y-6">
              {filteredUpcoming.map((event: any) => (
                <div
                  key={event.id}
                  className="rounded-[2rem] bg-white p-2 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-2xl dark:bg-slate-900 dark:ring-slate-700"
                >
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}

          {lastPage > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Link
                href={route('evenements', { page: currentPage - 1 })}
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
                href={route('evenements', { page: currentPage + 1 })}
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

        {showPast && (
          <section className="mx-auto mt-16 max-w-[1320px] px-6 md:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                Événements passés
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                {filteredPast.length} résultat(s)
              </p>
            </div>

            {filteredPast.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                Aucun événement passé ne correspond à votre recherche.
              </div>
            ) : (
              <div className="space-y-6 opacity-90">
                {filteredPast.map((event: any) => (
                  <div
                    key={event.id}
                    className="rounded-[2rem] bg-white p-2 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"
                  >
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="mx-auto mt-20 max-w-[1320px] px-6 md:px-8">
          <div className="rounded-[2rem] bg-gradient-to-r from-[#da2e29] to-[#c62823] p-10 text-white shadow-xl shadow-[#da2e29]/20 md:p-12">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-sm text-white/80">
                  Un besoin spécifique pour votre équipe ou votre communauté ?
                </p>

                <h3 className="mt-3 text-3xl font-black">
                  Nous pouvons organiser un événement sur mesure
                </h3>
              </div>

              <Link
                href={route('contact')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-[#da2e29]"
              >
                Nous contacter
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </FrontLayout>
  );
};

export default EventsPage;
