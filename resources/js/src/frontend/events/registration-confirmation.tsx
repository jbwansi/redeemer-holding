import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, CalendarDays, CheckCircle, Clock, FileText, Mail, MapPin, Printer, Share2, Ticket, X } from 'lucide-react';

// Notification system (reuse from dashboard)
const Notification = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => (
    <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded shadow-lg text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
             role="alert">
        <div className="flex items-center justify-between gap-4">
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 text-white font-bold">×</button>
        </div>
    </div>
);
import { route } from 'ziggy-js';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';
import QRCode from 'react-qr-code';

const resolveImage = (image: any): string => {
    if (!image) return '/assets/images/event-placeholder.jpg';
    if (typeof image === 'string') return image;
    return image?.large || image?.medium || image?.original || image?.thumbnail || '/assets/images/event-placeholder.jpg';
};

const PaymentConfirmationPage = ({ event, registration }: any) => {
    const [notification, setNotification] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };
    const isEventFree = event?.price <= 0;

    const calendarUrl = (() => {
        const startIso = new Date(event.start_date).toISOString().replace(/-|:|\.\d+/g, '');
        const endIso = new Date(event.end_date).toISOString().replace(/-|:|\.\d+/g, '');
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startIso}/${endIso}&location=${encodeURIComponent(event.location)}`;
    })();

    const qrCodeValue = `${window.location.origin}/tickets/${registration.reference}`;

    return (
        <FrontLayout>
            <Head title={`Confirmation - ${event?.title || 'Evenement'}`} />

            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            <main className="relative min-h-screen overflow-hidden bg-[#f7f6f2] pt-24 pb-20 dark:bg-slate-950">
                <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-[#da2e29]/15 blur-3xl" />

                <section className="mx-auto max-w-[1200px] px-6 md:px-8">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <p className="inline-flex items-center gap-2 text-lg font-semibold"><CheckCircle className="h-5 w-5" />Reservation confirmee</p>
                        <p className="mt-1 text-sm">Un email de confirmation a ete envoye a {registration.email}.</p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link href={route('evenements.details', event.slug)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
                            <ArrowLeft className="h-4 w-4" />Retour evenement
                        </Link>
                        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"><Printer className="h-4 w-4" />Imprimer</button>
                        <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"><CalendarDays className="h-4 w-4" />Calendrier</a>
                        {!isEventFree && (
                            <button onClick={() => (window.location.href = route('evenements.facture.download', { slug: event.slug, reference: registration.reference }))} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"><FileText className="h-4 w-4" />Facture</button>
                        )}
                    </div>

                    <div className="mt-6 grid gap-6 lg:grid-cols-5">
                        <div className="lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex flex-col gap-5 md:flex-row">
                                <img src={resolveImage(event?.featured_image)} alt={event?.title} className="h-44 w-full rounded-xl object-cover md:w-56" />
                                <div>
                                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{event?.title}</h2>
                                    <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                        <p className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" />{formatDate(event?.start_date)} - {formatDate(event?.end_date)}</p>
                                        <p className="inline-flex items-center gap-2"><Clock className="h-4 w-4" />{formatTime(event?.start_date)} - {formatTime(event?.end_date)}</p>
                                        <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{event?.location}</p>
                                        <p className="inline-flex items-center gap-2"><Ticket className="h-4 w-4" />Reference: {registration?.reference}</p>
                                        <p className="inline-flex items-center gap-2"><Mail className="h-4 w-4" />{registration?.name} - {registration?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {!isEventFree && (
                                <div className="mt-6 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/50">
                                    <h3 className="text-sm font-medium uppercase tracking-wide text-slate-500">Paiement</h3>
                                    <div className="mt-3 space-y-2 text-sm">
                                        <div className="flex justify-between"><span>Sous-total</span><span>{formatCurrency(event.price * registration.qty)}</span></div>
                                        <div className="flex justify-between"><span>Frais</span><span>{formatCurrency(event.price * registration.qty * 0.05)}</span></div>
                                        <div className="mt-2 flex justify-between border-t border-slate-200 pt-3 font-semibold dark:border-slate-700"><span>Total</span><span>{formatCurrency(event.price * registration.qty * 1.05)}</span></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <p className="text-sm text-slate-500">Code de verification</p>
                            <div className="mx-auto mt-4 inline-block rounded-xl bg-white p-3">
                                <QRCode value={qrCodeValue} size={150} />
                            </div>
                            <p className="mt-3 font-mono text-sm text-slate-700 dark:text-slate-300">{registration.reference}</p>
                        </div>
                    </div>

                    {registration?.can_be_cancelled && (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                            <p className="text-sm">Vous pouvez annuler cette reservation jusqu a 24h avant le debut.</p>
                            <Link
                                href={route('events.registration.cancel', { slug: event.slug, participant_id: registration.id })}
                                method="delete"
                                as="button"
                                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
                                onSuccess={() => showNotification('Réservation annulée avec succès.', 'success')}
                                onError={() => showNotification('Erreur lors de l\'annulation de la réservation.', 'error')}
                            >
                                <X className="h-4 w-4" />
                                Annuler ma reservation
                            </Link>
                        </div>
                    )}
                </section>
            </main>
        </FrontLayout>
    );
};

export default PaymentConfirmationPage;
