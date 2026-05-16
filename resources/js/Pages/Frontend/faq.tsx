import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ChevronRight, HelpCircle, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import { route } from 'ziggy-js';
import FaqAccordion from '@/components/frontend/faq/faq-accordion';

const defaultMeta = {
  faq_title: 'Questions fréquentes',
  faq_link_label: 'Nous contacter',
  faq_link_url: '/contact',
  faqs: [
    {
      question: 'Comment se déroule une séance de coaching ?',
      answer:
        "Les séances se déroulent en visioconférence ou en présentiel selon votre préférence. Nous définissons d'abord vos objectifs puis un plan d'action concret.",
    },
    {
      question: 'Combien de séances sont nécessaires ?',
      answer:
        'Le nombre de séances dépend de vos objectifs. En général, un accompagnement se construit sur plusieurs sessions adaptées à votre rythme.',
    },
    {
      question: 'Proposez-vous des tarifs dégressifs ?',
      answer:
        'Oui, des forfaits sont proposés selon les besoins. Contactez-nous pour obtenir une proposition personnalisée.',
    },
  ],
};

export default function FaqPage({ page, faqs = [] }: any) {
  const meta = { ...defaultMeta, ...(page?.meta ?? {}) };
  const faqsToShow =
    Array.isArray(faqs) && faqs.length > 0 ? faqs : Array.isArray(meta.faqs) ? meta.faqs : [];

  return (
    <FrontLayout>
      <Head title={meta.faq_title || 'FAQ'} />

      <main className="relative min-h-screen overflow-hidden bg-[#f7f6f2] pt-28 pb-20 dark:bg-slate-950">
        <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-[#da2e29]/15 blur-3xl" />

        {/* Header */}
        <section className="mx-auto max-w-[1100px] px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-10"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#da2e29]/30 bg-[#da2e29]/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#da2e29]">
              <HelpCircle className="h-3.5 w-3.5" />
              FAQ
            </span>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white md:text-5xl">
              {meta.faq_title}
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
              Retrouvez rapidement les réponses aux questions les plus fréquentes.
            </p>
          </motion.div>
        </section>

        {/* FAQ */}
        <section className="mx-auto mt-10 max-w-[1100px] px-6 md:px-8">
          {faqsToShow.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
              Aucune question fréquente n'est disponible pour le moment.
            </div>
          ) : (
            <FaqAccordion faqs={faqsToShow} defaultOpenIndex={0} />
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="mt-10 rounded-2xl bg-gradient-to-r from-[#da2e29] to-[#c62823] p-8 text-white"
          >
            <p className="inline-flex items-center gap-2 text-sm text-white/85">
              <MessageCircle className="h-4 w-4" />
              Une question supplémentaire ?
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Notre équipe vous répond rapidement</h3>
            <Link
              href={meta.faq_link_url || route('contact')}
              className="group mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-medium text-[#da2e29] transition hover:bg-slate-100"
            >
              {meta.faq_link_label || 'Nous contacter'}
              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </section>
      </main>
    </FrontLayout>
  );
}
