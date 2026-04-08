import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Calendar, Clock, CreditCard, MapPin, Shield, Users } from 'lucide-react';
import { route } from 'ziggy-js';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import CountdownTimer from '@/components/frontend/CountdownTimer';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';

const resolveImage = (image: any): string => {
    if (!image) return '/assets/images/event-placeholder.jpg';
    if (typeof image === 'string') return image;
    return image?.large || image?.medium || image?.original || image?.thumbnail || '/assets/images/event-placeholder.jpg';
};

const PaymentPage = ({ event, participant, subtotal, serviceFee, total, checkoutUrl }: any) => {
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [timeExpired, setTimeExpired] = useState(false);

    const expirationTime = useMemo(() => {
        const d = new Date(participant.created_at);
        d.setMinutes(d.getMinutes() + 15);
        return d;
    }, [participant?.created_at]);

    useEffect(() => {
        if (new Date() > expirationTime) {
            setTimeExpired(true);
            return;
        }

        const timer = setTimeout(() => {
            setIsRedirecting(true);
            window.location.href = checkoutUrl;
        }, 2500);

        return () => clearTimeout(timer);
    }, [checkoutUrl, expirationTime]);

    return (
        <FrontLayout>
            <Head title={`Paiement - ${event?.title || 'Evenement'}`} />

            <main className="relative min-h-screen overflow-hidden bg-[#f7f6f2] pt-24 pb-20 dark:bg-slate-950">
                <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-[#da2e29]/15 blur-3xl" />

                <section className="mx-auto max-w-[1200px] px-6 md:px-8">
                    <Link href={route('evenements.details', event.slug)} className="inline-flex items-center text-sm text-slate-600 hover:text-[#da2e29] dark:text-slate-300">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour a l'evenement
                    </Link>

                    <h1 className="mt-5 text-3xl font-semibold text-slate-900 md:text-4xl dark:text-white">Finaliser votre reservation</h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">Votre place sera confirmee des que le paiement est valide.</p>

                    <div className="mt-8 grid gap-6 lg:grid-cols-5">
                        <div className="lg:col-span-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex flex-col gap-5 md:flex-row">
                                <img src={resolveImage(event?.featured_image)} alt={event?.title} className="h-44 w-full rounded-xl object-cover md:w-56" />
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{event?.title}</h2>
                                    <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                        <p className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" />{formatDate(event?.start_date)} - {formatDate(event?.end_date)}</p>
                                        <p className="inline-flex items-center gap-2"><Clock className="h-4 w-4" />{formatTime(event?.start_date)} - {formatTime(event?.end_date)}</p>
                                        <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{event?.location}</p>
                                        <p className="inline-flex items-center gap-2"><Users className="h-4 w-4" />{participant?.qty} place(s)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/50">
                                <h3 className="text-sm font-medium uppercase tracking-wide text-slate-500">Resume</h3>
                                <div className="mt-3 space-y-2 text-sm">
                                    <div className="flex justify-between"><span>Billets</span><span>{formatCurrency(subtotal)}</span></div>
                                    <div className="flex justify-between text-slate-500"><span>Frais de service (5%)</span><span>{formatCurrency(serviceFee)}</span></div>
                                    <div className="mt-2 flex justify-between border-t border-slate-200 pt-3 text-base font-semibold dark:border-slate-700"><span>Total</span><span>{formatCurrency(total)}</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Paiement securise</h3>

                            <div className="mt-4 rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
                                {timeExpired ? (
                                    <div className="text-sm text-red-700 dark:text-red-300">
                                        <p className="inline-flex items-center gap-2 font-medium"><AlertCircle className="h-4 w-4" />Session expiree</p>
                                        <p className="mt-2">Relancez l'inscription depuis la page evenement.</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm text-red-700 dark:text-red-300">Temps restant pour payer</p>
                                        <CountdownTimer expiryTimestamp={expirationTime} onExpire={() => setTimeExpired(true)} className="mt-2 text-2xl font-bold text-red-800 dark:text-red-200" />
                                    </>
                                )}
                            </div>

                            <ul className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                <li className="inline-flex items-center gap-2"><Shield className="h-4 w-4 text-green-600" />Paiement Stripe chiffre</li>
                                <li className="inline-flex items-center gap-2"><Shield className="h-4 w-4 text-green-600" />Aucune carte stockee sur notre plateforme</li>
                            </ul>

                            <button
                                onClick={() => {
                                    setIsRedirecting(true);
                                    window.location.href = checkoutUrl;
                                }}
                                disabled={timeExpired || isRedirecting}
                                className="mt-6 w-full rounded-xl bg-[#da2e29] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#c62823] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    {isRedirecting ? 'Redirection...' : `Payer ${formatCurrency(total)}`}
                                </span>
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </FrontLayout>
    );
};

export default PaymentPage;
