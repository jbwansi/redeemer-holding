import React, { useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
  Calendar,
  ChevronLeft,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  CheckCircle,
  Ticket,
} from 'lucide-react';
import { route } from 'ziggy-js';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import EventJoin from '@/components/frontend/events/event-join';
import DOMPurify from 'dompurify';

// const resolveImage = (image: any): string => {
//     if (!image) return '/assets/images/coaching-session.jpg';
//     if (typeof image === 'string') return image;
//     return image?.large || image?.medium || image?.original || image?.thumbnail || '/assets/images/coaching-session.jpg';
// };

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

const formatDate = (value: any) => {
  if (!value) return '-';

  const date = new Date(value);

  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatTime = (value: any) => {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const EventDetailPage = ({ event }: any) => {
  const { auth } = usePage().props as any;
  const safeContent = useMemo(() => DOMPurify.sanitize(event?.content || ''), [event?.content]);

  const now = new Date();
  const endDate = event?.end_date ? new Date(event.end_date) : null;
  const isPast = endDate ? endDate < now : false;
  const canRegister = !isPast && !event?.is_full && (event?.available_seats ?? 0) > 0;

  const formatEventDate = (start: any, end: any) => {
    if (!start) return '-';

    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;

    // même jour
    if (endDate && startDate.toDateString() === endDate.toDateString()) {
      return formatDate(startDate);
    }

    // plusieurs jours
    if (endDate) {
      return `${formatDate(startDate)} – ${formatDate(endDate)}`;
    }

    return formatDate(startDate);
  };

  return (
    <FrontLayout>
      <Head title={event?.title || 'Événement'} />

      <main className="relative min-h-screen overflow-hidden bg-[#f7f6f2] pb-20 pt-24 dark:bg-slate-950">
        <div className="pointer-events-none absolute -left-16 -top-20 h-72 w-72 rounded-full bg-[#da2e29]/15 blur-3xl" />

        <section className="mx-auto max-w-[1320px] px-6 md:px-8">
          <Link
            href={route('evenements')}
            className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm text-slate-600 transition hover:text-[#da2e29] dark:text-slate-300"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour aux événements
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2">
                {event?.category?.name && (
                  <span className="inline-flex rounded-full bg-white/20 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white ring-1 ring-white/10">
                    {event.category.name}
                  </span>
                )}

                {event?.is_featured && (
                  <span className="inline-flex rounded-full bg-[#da2e29] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                    À la une
                  </span>
                )}
              </div>

              <h1 className="mt-7 max-w-4xl text-4xl font-black leading-tight text-slate-900 md:text-6xl dark:text-white">
                {event?.title}
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                {event?.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {canRegister && (
                  <a
                    href="#registration"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#da2e29] px-7 py-4 font-bold text-white shadow-lg shadow-[#da2e29]/20 transition hover:-translate-y-0.5 hover:bg-[#c62823]"
                  >
                    Réserver ma place
                    <ArrowRight className="h-4 w-4" />
                  </a>
                )}

                <a
                  href="#details"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white/70 px-7 py-4 font-bold text-slate-800 backdrop-blur transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
                >
                  Voir le programme
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[3rem] bg-[#da2e29]/10 blur-3xl" />

              <div className="relative mx-auto w-full max-w-[520px] lg:max-w-[560px]">
                <div className="rounded-[2rem] bg-black p-2 shadow-2xl shadow-slate-900/20">
                  <img
                    src={resolveImage(event?.featured_image)}
                    alt={event?.title}
                    className="w-full h-auto object-contain transition duration-500 hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto mt-12 max-w-[1180px] px-6 md:px-8">
          <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5 md:grid-cols-4 dark:border-slate-700 dark:bg-slate-900">
            <Info
              icon={<Calendar />}
              label="Date"
              value={formatEventDate(event.start_date, event.end_date)}
            />
            <Info
              icon={<Clock />}
              label="Horaire"
              value={`${formatTime(event?.start_date)} - ${formatTime(event?.end_date)}`}
            />
            <Info icon={<MapPin />} label="Lieu" value={event?.location || '-'} />
            <Info
              icon={<Users />}
              label="Places"
              value={
                event?.max_participants ? `${event?.available_seats} disponibles` : 'Illimitées'
              }
            />
          </div>
        </section>

        <section
          id="details"
          className="mx-auto mt-12 grid max-w-[1320px] gap-8 px-6 md:px-8 lg:grid-cols-[1fr_380px]"
        >
          <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 md:p-10 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#da2e29]">À propos</p>

            <h2 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">
              Détails de l’événement
            </h2>

            <div
              className="prose mt-6 max-w-none text-slate-600 dark:prose-invert dark:text-slate-300"
              dangerouslySetInnerHTML={{ __html: safeContent }}
            />

            {Array.isArray(event?.tags) && event.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {event.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>

          <aside className="h-fit space-y-4 lg:sticky lg:top-28">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#da2e29]">
                Inscription
              </p>

              <h3 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
                Réservez votre place
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Les inscriptions sont ouvertes. Ne tardez pas, les places sont limitées.
              </p>

              <div className="mt-6 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Places restantes
                </p>

                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  {event?.max_participants ? event?.available_seats : 'Illimitées'}
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Tarif</p>

                <p className="mt-2 text-xl font-black text-[#da2e29]">
                  {event?.price > 0 ? `${event.price} CHF` : '🎁 100% offert'}
                </p>
              </div>

              {event?.max_participants &&
                (event?.available_seats ?? 0) <= 5 &&
                (event?.available_seats ?? 0) > 0 && (
                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    ⚡ Dernières places disponibles
                  </div>
                )}

              {canRegister ? (
                <a
                  href="#registration"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#da2e29] px-6 py-4 font-bold text-white transition hover:bg-[#c62823]"
                >
                  Réserver maintenant
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : (
                <Link
                  href={route('contact')}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#da2e29] px-6 py-4 font-bold text-white transition hover:bg-[#c62823]"
                >
                  Être informé
                  <Ticket className="h-4 w-4" />
                </Link>
              )}
            </div>{' '}
          </aside>
        </section>

        <section id="registration" className="mx-auto mt-12 max-w-[1320px] px-6 md:px-8">
          {canRegister ? (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900">
              <EventJoin event={event} auth={auth} />
            </div>
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Réservation indisponible
              </h3>

              <p className="mt-2 text-slate-600 dark:text-slate-300">
                {isPast
                  ? 'Les réservations sont fermées car l’événement est terminé.'
                  : 'Les places sont actuellement complètes.'}
              </p>

              <Link
                href={route('contact')}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#da2e29] px-6 py-4 font-bold text-white"
              >
                <Ticket className="h-4 w-4" />
                Être informé du prochain événement
              </Link>
            </div>
          )}
        </section>

        <section className="mx-auto mt-12 max-w-[1320px] px-6 md:px-8">
          <div className="rounded-[2rem] bg-gradient-to-r from-[#da2e29] to-[#c62823] p-10 text-white shadow-xl shadow-[#da2e29]/20 md:p-12">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-sm text-white/80">
                  Vous organisez un projet ou une communauté ?
                </p>
                <h3 className="mt-3 text-3xl font-black">
                  Nous pouvons créer un événement sur mesure
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

const Info = ({ icon, label, value }: any) => (
  <div className="border-b border-slate-200 p-6 text-center transition hover:bg-slate-50 md:border-b-0 md:border-r md:last:border-r-0 dark:border-slate-700 dark:hover:bg-slate-800/50">
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-[#da2e29] dark:bg-slate-800">
      {React.cloneElement(icon, { className: 'h-5 w-5' })}
    </div>
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
    <p className="mt-2 text-sm font-black text-slate-900 dark:text-white">{value}</p>
  </div>
);

export default EventDetailPage;
