import React, { useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Calendar, ChevronLeft, Clock, MapPin, Users, ArrowRight, CheckCircle, Ticket } from 'lucide-react';
import { route } from 'ziggy-js';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import EventJoin from '@/components/frontend/events/event-join';
import DOMPurify from 'dompurify';

const resolveImage = (image: any): string => {
    if (!image) return '/assets/images/coaching-session.jpg';
    if (typeof image === 'string') return image;
    return image?.large || image?.medium || image?.original || image?.thumbnail || '/assets/images/coaching-session.jpg';
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

const EventDetailPage = ({ event }: any) => {
    const { auth } = usePage().props as any;
    const safeContent = useMemo(() => DOMPurify.sanitize(event?.content || ''), [event?.content]);

    const now = new Date();
    const endDate = event?.end_date ? new Date(event.end_date) : null;
    const isPast = endDate ? endDate < now : false;
    const canRegister = !isPast && !event?.is_full && (event?.available_seats ?? 0) > 0;

    return (
        <FrontLayout>
            <Head title={event?.title || 'Evenement'} />

            <main className="relative min-h-screen overflow-hidden bg-[#f7f6f2] pt-24 pb-20 dark:bg-slate-950">
                <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-[#da2e29]/15 blur-3xl" />

                <section className="mx-auto max-w-[1320px] px-6 md:px-8">
                    <Link href={route('evenements')} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#da2e29] dark:text-slate-300">
                        <ChevronLeft className="h-4 w-4" />
                        Retour aux evenements
                    </Link>

                    <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="relative">
                            <img src={resolveImage(event?.featured_image)} alt={event?.title} className="h-[380px] w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />

                            <div className="absolute bottom-0 left-0 z-10 w-full p-7 md:p-10">
                                <div className="flex flex-wrap gap-2">
                                    {event?.category?.name && <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">{event.category.name}</span>}
                                    {event?.is_featured && <span className="inline-flex rounded-full bg-[#da2e29] px-3 py-1 text-xs font-medium text-white">A la une</span>}
                                </div>
                                <h1 className="mt-4 max-w-3xl text-3xl font-semibold text-white md:text-5xl">{event?.title}</h1>
                                <p className="mt-3 max-w-2xl text-white/85 line-clamp-3">{event?.description}</p>
                            </div>
                        </div>

                        <div className="grid gap-8 p-7 md:grid-cols-3 md:p-10">
                            <div className="md:col-span-2">
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">A propos</h2>
                                <div className="prose mt-4 max-w-none text-slate-600 dark:prose-invert dark:text-slate-300" dangerouslySetInnerHTML={{ __html: safeContent }} />

                                {Array.isArray(event?.tags) && event.tags.length > 0 && (
                                    <div className="mt-6 flex flex-wrap gap-2">
                                        {event.tags.map((tag: string) => (
                                            <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">#{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <aside className="space-y-4">
                                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Date</p>
                                    <p className="mt-2 inline-flex items-center gap-2 text-sm"><Calendar className="h-4 w-4" />{formatDate(event?.start_date)} - {formatDate(event?.end_date)}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Horaire</p>
                                    <p className="mt-2 inline-flex items-center gap-2 text-sm"><Clock className="h-4 w-4" />{formatTime(event?.start_date)} - {formatTime(event?.end_date)}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Lieu</p>
                                    <p className="mt-2 inline-flex items-center gap-2 text-sm"><MapPin className="h-4 w-4" />{event?.location || '-'}</p>
                                </div>

                                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Places</p>
                                    <p className="mt-2 inline-flex items-center gap-2 text-sm">
                                        <Users className="h-4 w-4" />
                                        {event?.max_participants ? `${event?.available_seats} disponibles` : 'Illimitees'}
                                    </p>
                                    {event?.max_participants && (event?.available_seats ?? 0) <= 5 && (event?.available_seats ?? 0) > 0 && (
                                        <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                                            ⚡ Dernières places disponibles
                                        </p>
                                    )}
                                </div>

                                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Tarif</p>
                                    <p className="mt-2 text-xl font-semibold text-[#da2e29]">{event?.price > 0 ? `${event.price} CHF` : 'Gratuit'}</p>
                                </div>

                                {isPast && (
                                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                        <CheckCircle className="mr-2 inline h-4 w-4" />
                                        Cet evenement est termine.
                                    </div>
                                )}
                            </aside>
                        </div>
                    </div>
                </section>

                <section id="registration" className="mx-auto mt-12 max-w-[1320px] px-6 md:px-8">
                    {canRegister ? (
                        <EventJoin event={event} auth={auth} />
                    ) : (
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Reservation indisponible</h3>
                            <p className="mt-2 text-slate-600 dark:text-slate-300">
                                {isPast ? 'Les reservations sont fermees car l evenement est termine.' : 'Les places sont actuellement completes.'}
                            </p>
                            <Link href={route('contact')} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#da2e29] px-5 py-3 text-sm font-medium text-white">
                                <Ticket className="h-4 w-4" />
                                Etre informe du prochain evenement
                            </Link>
                        </div>
                    )}
                </section>

                <section className="mx-auto mt-12 max-w-[1320px] px-6 md:px-8">
                    <div className="rounded-3xl bg-gradient-to-r from-[#da2e29] to-[#c62823] p-10 text-white md:p-12">
                        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                            <div>
                                <p className="text-sm text-white/80">Vous organisez un projet ou une communaute ?</p>
                                <h3 className="mt-3 text-3xl font-semibold">Nous pouvons creer un evenement sur mesure</h3>
                            </div>
                            <Link href={route('contact')} className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-[#da2e29]">
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

export default EventDetailPage;
