import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ChevronRight, HelpCircle, MessageCircle } from 'lucide-react';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import { route } from 'ziggy-js';

const defaultMeta = {
    faq_title: 'Questions frequentes',
    faq_link_label: 'Nous contacter',
    faq_link_url: '/contact',
    faqs: [
        {
            question: 'Comment se deroule une seance de coaching ?',
            answer: 'Les seances se deroulent en visioconference ou en presentiel selon votre preference. Nous definissons d abord vos objectifs puis un plan d action concret.',
        },
        {
            question: 'Combien de seances sont necessaires ?',
            answer: 'Le nombre de seances depend de vos objectifs. En general, un accompagnement se construit sur plusieurs sessions adaptees a votre rythme.',
        },
        {
            question: 'Proposez-vous des tarifs degressifs ?',
            answer: 'Oui, des forfaits sont proposes selon les besoins. Contactez-nous pour obtenir une proposition personnalisee.',
        },
    ],
};

export default function FaqPage({ page }: any) {
    const meta = { ...defaultMeta, ...(page?.meta ?? {}) };
    const faqs = Array.isArray(meta.faqs) ? meta.faqs : [];

    return (
        <FrontLayout>
            <Head title={meta.faq_title || 'FAQ'} />

            <main className="relative min-h-screen overflow-hidden bg-[#f7f6f2] pt-28 pb-20 dark:bg-slate-950">
                <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-[#da2e29]/15 blur-3xl" />

                <section className="mx-auto max-w-[1100px] px-6 md:px-8">
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-10">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#da2e29]/30 bg-[#da2e29]/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#da2e29]">
                            <HelpCircle className="h-3.5 w-3.5" />
                            FAQ
                        </span>

                        <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white md:text-5xl">
                            {meta.faq_title || 'Questions frequentes'}
                        </h1>
                        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
                            Retrouvez rapidement les reponses aux questions les plus frequentes.
                        </p>
                    </div>
                </section>

                <section className="mx-auto mt-10 max-w-[1100px] px-6 md:px-8">
                    <div className="space-y-4">
                        {faqs.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                                Aucune question frequente n est disponible pour le moment.
                            </div>
                        ) : (
                            faqs.map((faq: any, index: number) => (
                                <article key={`${faq?.question}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{faq?.question}</h2>
                                    <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">{faq?.answer}</p>
                                </article>
                            ))
                        )}
                    </div>

                    <div className="mt-10 rounded-2xl bg-gradient-to-r from-[#da2e29] to-[#c62823] p-8 text-white">
                        <p className="inline-flex items-center gap-2 text-sm text-white/85">
                            <MessageCircle className="h-4 w-4" />
                            Une question supplementaire ?
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold">Notre equipe vous repond rapidement</h3>
                        <Link
                            href={meta.faq_link_url || route('contact')}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-medium text-[#da2e29] hover:bg-slate-100"
                        >
                            {meta.faq_link_label || 'Nous contacter'}
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>
            </main>
        </FrontLayout>
    );
}
