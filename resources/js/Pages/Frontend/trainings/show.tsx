import React, { useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
  Calendar,
  ChevronLeft,
  Clock,
  GraduationCap,
  MapPin,
  Users,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { route } from 'ziggy-js';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import TrainingJoin from '@/components/frontend/trainings/training-join';
import DOMPurify from 'dompurify';

const resolveImage = (image: any): string => {
  if (!image) return '/assets/images/coaching-session.jpg';
  if (typeof image === 'string') return image;
  return (
    image?.large ||
    image?.medium ||
    image?.original ||
    image?.thumbnail ||
    '/assets/images/coaching-session.jpg'
  );
};

const formatDate = (value: any) => {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatTime = (value: any) => {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const TrainingDetailPage = ({ training }: any) => {
  const { auth } = usePage().props as any;
  const safeContent = useMemo(
    () => DOMPurify.sanitize(training?.content || ''),
    [training?.content]
  );

  const now = new Date();
  const endDate = training?.end_date ? new Date(training.end_date) : null;
  const isPast = endDate ? endDate < now : false;
  const canRegister = !isPast && !training?.is_full && (training?.available_seats ?? 0) > 0;

  return (
    <FrontLayout>
      <Head title={training?.title || 'Training'} />

      <main className="relative min-h-screen overflow-hidden bg-[#f7f6f2] pt-24 pb-20 dark:bg-slate-950">
        <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-[#0f766e]/15 blur-3xl" />

        <section className="mx-auto max-w-[1320px] px-6 md:px-8">
          <Link
            href={route('formations')}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#0f766e] dark:text-slate-300"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour aux trainings
          </Link>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="relative">
              <img
                src={resolveImage(training?.featured_image)}
                alt={training?.title}
                loading="eager"
                decoding="async"
                fetchpriority="high"
                className="h-[380px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent" />

              <div className="absolute bottom-0 left-0 z-10 w-full p-7 md:p-10">
                <span className="inline-flex rounded-full bg-[#0f766e] px-3 py-1 text-xs font-medium text-white">
                  Training
                </span>
                <h1 className="mt-4 max-w-3xl text-3xl font-semibold text-white md:text-5xl">
                  {training?.title}
                </h1>
                <p className="mt-3 max-w-2xl text-white/85">{training?.excerpt}</p>
              </div>
            </div>

            <div className="grid gap-8 p-7 md:grid-cols-3 md:p-10">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">A propos</h2>
                <div
                  className="prose mt-4 max-w-none text-slate-600 dark:prose-invert dark:text-slate-300"
                  dangerouslySetInnerHTML={{ __html: safeContent }}
                />
              </div>

              <aside className="space-y-4">
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Date</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    {formatDate(training?.start_date)} - {formatDate(training?.end_date)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Horaire</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    {formatTime(training?.start_date)} - {formatTime(training?.end_date)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Lieu</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    {training?.location || '-'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Places</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    {training?.max_participants
                      ? `${training?.available_seats} disponibles`
                      : 'Illimitees'}
                  </p>
                  {training?.max_participants &&
                    (training?.available_seats ?? 0) <= 5 &&
                    (training?.available_seats ?? 0) > 0 && (
                      <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                        ⚡ Dernières places disponibles
                      </p>
                    )}
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Tarif</p>
                  <p className="mt-2 text-xl font-semibold text-[#0f766e]">
                    {training?.price > 0 ? `${training.price} CHF` : 'Gratuit'}
                  </p>
                </div>

                {isPast && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    <CheckCircle className="mr-2 inline h-4 w-4" />
                    Cette formation est terminee.
                  </div>
                )}
              </aside>
            </div>
          </div>
        </section>

        <section id="inscription" className="mx-auto mt-12 max-w-[1320px] px-6 md:px-8">
          {canRegister ? (
            <TrainingJoin training={training} auth={auth} />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Inscription indisponible
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                {isPast
                  ? 'Les inscriptions sont fermees car la formation est terminee.'
                  : 'Les places sont actuellement completes.'}
              </p>
              <Link
                href={route('contact')}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0f766e] px-5 py-3 text-sm font-medium text-white"
              >
                Etre informe de la prochaine session
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>

        <section className="mx-auto mt-12 max-w-[1320px] px-6 md:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#0f766e] to-[#115e59] p-10 text-white md:p-12">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-sm text-white/80">Besoin d'un accompagnement sur mesure ?</p>
                <h3 className="mt-3 text-3xl font-semibold">
                  Parlons de votre parcours de progression
                </h3>
              </div>
              <Link
                href={route('contact')}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-[#0f766e]"
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

export default TrainingDetailPage;
