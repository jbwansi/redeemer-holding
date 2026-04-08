import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, CalendarDays, CheckCircle, Clock, FileText, GraduationCap, Mail, Monitor, Printer, Share2 } from 'lucide-react';
import { route } from 'ziggy-js';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import { formatCurrency, formatDate } from '@/lib/utils';
import QRCode from 'react-qr-code';

const resolveImage = (image: any): string => {
    if (!image) return '/assets/images/formation-placeholder.jpg';
    if (typeof image === 'string') return image;
    return image?.large || image?.medium || image?.original || image?.thumbnail || '/assets/images/formation-placeholder.jpg';
};

const FormationConfirmationPage = ({ formation, registration }: any) => {
    const isFormationFree = formation?.price <= 0;

    const calendarUrl = (() => {
        const startIso = new Date(formation.start_date).toISOString().replace(/-|:|\.\d+/g, '');
        const endIso = new Date(formation.end_date).toISOString().replace(/-|:|\.\d+/g, '');
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(formation.title)}&dates=${startIso}/${endIso}`;
    })();

    const qrCodeValue = `${window.location.origin}/formations/${registration.reference}`;

    return (
        <FrontLayout>
            <Head title={`Confirmation - ${formation?.title || 'Formation'}`} />

            <main className="relative min-h-screen overflow-hidden bg-[#f7f6f2] pt-24 pb-20 dark:bg-slate-950">
                <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-[#0f766e]/15 blur-3xl" />

                <section className="mx-auto max-w-[1200px] px-6 md:px-8">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <p className="inline-flex items-center gap-2 text-lg font-semibold"><CheckCircle className="h-5 w-5" />Inscription confirmee</p>
                        <p className="mt-1 text-sm">Un email de confirmation a ete envoye a {registration.email}.</p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link href={route('formations.details', formation.slug)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
                            <ArrowLeft className="h-4 w-4" />Retour formation
                        </Link>
                        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"><Printer className="h-4 w-4" />Imprimer</button>
                        <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"><CalendarDays className="h-4 w-4" />Calendrier</a>
                        {!isFormationFree && (
                            <button onClick={() => (window.location.href = route('formations.facture.download', { slug: formation.slug, reference: registration.reference }))} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"><FileText className="h-4 w-4" />Facture</button>
                        )}
                    </div>

                    <div className="mt-6 grid gap-6 lg:grid-cols-5">
                        <div className="lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex flex-col gap-5 md:flex-row">
                                <img src={resolveImage(formation?.featured_image)} alt={formation?.title} className="h-44 w-full rounded-xl object-cover md:w-56" />
                                <div>
                                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{formation?.title}</h2>
                                    <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                        <p className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" />Debut: {formatDate(formation?.start_date)}</p>
                                        <p className="inline-flex items-center gap-2"><Clock className="h-4 w-4" />Duree: {formation?.duration || '-'} heures</p>
                                        <p className="inline-flex items-center gap-2"><Monitor className="h-4 w-4" />{formation?.format || 'Format standard'}</p>
                                        <p className="inline-flex items-center gap-2"><GraduationCap className="h-4 w-4" />{formation?.level || 'Tous niveaux'}</p>
                                        <p className="inline-flex items-center gap-2"><Mail className="h-4 w-4" />{registration?.name} - {registration?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {!isFormationFree && (
                                <div className="mt-6 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/50">
                                    <h3 className="text-sm font-medium uppercase tracking-wide text-slate-500">Paiement</h3>
                                    <div className="mt-3 space-y-2 text-sm">
                                        <div className="flex justify-between"><span>Formation</span><span>{formatCurrency(formation.price)}</span></div>
                                        <div className="flex justify-between"><span>Frais</span><span>{formatCurrency(formation.price * 0.05)}</span></div>
                                        <div className="mt-2 flex justify-between border-t border-slate-200 pt-3 font-semibold dark:border-slate-700"><span>Total</span><span>{formatCurrency(formation.price * 1.05)}</span></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <p className="text-sm text-slate-500">Code d'inscription</p>
                            <div className="mx-auto mt-4 inline-block rounded-xl bg-white p-3">
                                <QRCode value={qrCodeValue} size={150} />
                            </div>
                            <p className="mt-3 font-mono text-sm text-slate-700 dark:text-slate-300">{registration.reference}</p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Actions rapides</h3>
                        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                            <button onClick={() => window.print()} className="rounded-lg bg-slate-100 px-4 py-2 text-sm dark:bg-slate-800">Imprimer</button>
                            <button
                                onClick={() => {
                                    const subject = `Confirmation - ${formation.title}`;
                                    const body = `Reference: ${registration.reference}\n${window.location.href}`;
                                    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                }}
                                className="rounded-lg bg-slate-100 px-4 py-2 text-sm dark:bg-slate-800"
                            >
                                Envoyer par email
                            </button>
                            <button
                                onClick={async () => {
                                    if (navigator.share) {
                                        await navigator.share({ title: `Inscription - ${formation.title}`, url: window.location.href });
                                        return;
                                    }
                                    await navigator.clipboard.writeText(window.location.href);
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm dark:bg-slate-800"
                            >
                                <Share2 className="h-4 w-4" />Partager
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </FrontLayout>
    );
};

export default FormationConfirmationPage;
