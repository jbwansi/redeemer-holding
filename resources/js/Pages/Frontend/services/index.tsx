import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Calendar, Compass, Target, Users, Zap, Sparkles } from 'lucide-react';

import FrontLayout from '@/components/frontend/layouts/front-layout';
import ServiceCard from '@/components/frontend/services/service-card';
import FaqAccordion from '@/components/frontend/faq/faq-accordion';
import { serviceMatchesFocus, type ServiceFocus } from '@/lib/service-focus';

type Service = {
  id: number;
  name: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  icon?: string | null;
  views?: number;
  tagline?: string | null;
  featured_note?: string | null;
  cta_primary_label?: string | null;
  cta_primary_url?: string | null;
  cta_secondary_label?: string | null;
  cta_secondary_url?: string | null;
  hero_image?: string | null;
  image?: string | null;
  ideal_for?: string[] | null;
  is_for_individuals: boolean;
  is_for_organizations: boolean;
};

type FaqItem = {
  question: string;
  answer: string;
};

type PageContent = Record<string, string>;

type ServiceAudience = 'all' | 'individual' | 'organization';

const validFocuses: ServiceFocus[] = [
  'coaching',
  'consultation',
  'formation',
  'team_building',
  'webinaire',
  'ressources',
];

const parseFilters = (url: string): { audience: ServiceAudience; focus: ServiceFocus } => {
  const queryParams = new URLSearchParams(url.split('?')[1] || '');
  const queryAudience = queryParams.get('audience')?.toLowerCase();
  const queryFocus = queryParams.get('focus')?.toLowerCase();

  return {
    audience:
      queryAudience === 'individual' || queryAudience === 'organization' ? queryAudience : 'all',
    focus: validFocuses.includes(queryFocus as ServiceFocus) ? (queryFocus as ServiceFocus) : 'all',
  };
};

const processSteps = [
  {
    title: 'Diagnostic initial',
    description:
      'Nous clarifions votre situation actuelle, vos blocages et vos objectifs prioritaires.',
    icon: Compass,
  },
  {
    title: "Plan d'action",
    description:
      'Vous repartez avec une feuille de route concrète, réaliste et orientée résultats.',
    icon: Target,
  },
  {
    title: 'Accompagnement continu',
    description:
      'Nous ajustons ensemble vos actions pour sécuriser votre progression dans le temps.',
    icon: Zap,
  },
];

function ServicesPage({
  services,
  contactFaqs = [],
  pageContent = {},
}: {
  services: Service[];
  contactFaqs?: FaqItem[];
  pageContent?: PageContent;
}) {
  const page = usePage<{ url?: string }>();

  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const inHero = useInView(heroRef, { once: true, amount: 0.2 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const orbY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);

  const initialFilters = parseFilters(String(page?.url || ''));
  const [audience, setAudience] = useState<ServiceAudience>(initialFilters.audience);
  const [focus, setFocus] = useState<ServiceFocus>(initialFilters.focus);

  useEffect(() => {
    const filters = parseFilters(String(page?.url || ''));
    setAudience(filters.audience);
    setFocus(filters.focus);
  }, [page?.url]);

  const serviceCount = services?.length ?? 0;

  const keyFigures = useMemo(
    () => [
      { value: `${serviceCount}`, label: 'Services actifs' },
      { value: '100%', label: 'Approche personnalisée' },
      { value: '1:1', label: 'Accompagnement humain' },
    ],
    [serviceCount]
  );

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesAudience =
        audience === 'all' ||
        (audience === 'individual' && service.is_for_individuals === true) ||
        (audience === 'organization' && service.is_for_organizations === true);

      return matchesAudience && serviceMatchesFocus(service, focus);
    });
  }, [audience, focus, services]);

  const updateFilters = (nextAudience: ServiceAudience, nextFocus: ServiceFocus) => {
    setAudience(nextAudience);
    setFocus(nextFocus);

    router.get(
      route('services'),
      {
        ...(nextAudience !== 'all' ? { audience: nextAudience } : {}),
        ...(nextFocus !== 'all' ? { focus: nextFocus } : {}),
      },
      { preserveScroll: true, preserveState: true, replace: true }
    );
  };

  const resolvedHeroImage = useMemo(() => {
    const heroImage = String(pageContent?.hero_image || '').trim();

    if (!heroImage || heroImage.includes('coach-hero.jpg')) {
      return '/assets/images/services-bg.jpg';
    }

    return heroImage;
  }, [pageContent]);

  const mergedFaqs = useMemo(() => {
    const externalFaqs = Array.isArray(contactFaqs)
      ? contactFaqs
          .map((faq) => ({
            question: typeof faq?.question === 'string' ? faq.question.trim() : '',
            answer: typeof faq?.answer === 'string' ? faq.answer.trim() : '',
          }))
          .filter((faq) => faq.question !== '' && faq.answer !== '')
      : [];

    const dedup = new Map<string, FaqItem>();

    externalFaqs.forEach((faq) => {
      const key = faq.question.toLowerCase();
      if (!dedup.has(key)) dedup.set(key, faq);
    });

    return Array.from(dedup.values());
  }, [contactFaqs]);

  return (
    <FrontLayout>
      <Head title="Services" />

      <main
        ref={containerRef}
        className="relative min-h-screen overflow-hidden bg-[#f7f6f2] pb-20 pt-28 text-slate-900 dark:bg-[#020817] dark:text-white"
      >
        <motion.div
          className="pointer-events-none absolute -left-20 -top-24 h-80 w-80 rounded-full bg-[#da2e29]/20 blur-3xl dark:bg-[#da2e29]/25"
          style={{ y: orbY }}
        />

        <motion.div
          className="pointer-events-none absolute bottom-[-120px] right-[-40px] h-96 w-96 rounded-full bg-[#0f766e]/15 blur-3xl dark:bg-[#0f766e]/20"
          style={{ y: orbY }}
        />

        {/* HERO */}
        <section
          ref={heroRef}
          className="relative mx-auto max-w-[1320px] px-6 md:px-8"
          id="services-hero"
          data-progress-label="Intro"
        >
          <motion.div
            initial={false}
            animate={inHero ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative min-h-[500px] overflow-hidden rounded-[2.75rem] border border-slate-200/70 bg-white shadow-2xl shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900"
          >
            {/* FIX 1 : object-top pour ne pas couper le visage */}
            <img
              src={resolvedHeroImage}
              alt="Accompagnement coaching"
              loading="eager"
              decoding="async"
              onError={(event) => {
                const target = event.currentTarget;
                if (!target.src.includes('/assets/images/services-bg.jpg')) {
                  target.src = '/assets/images/services-bg.jpg';
                }
              }}
              width={1600}
              height={620}
              className="absolute inset-0 h-full w-full object-cover object-top"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/65 dark:from-[#020817]/80 dark:via-[#020817]/25 dark:to-transparent" />

            <div className="relative z-10 flex min-h-[460px] items-center px-8 py-14 md:min-h-[520px] md:px-12 lg:px-16">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border text-sm font-black uppercase tracking-[0.25em] text-[#da2e29]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {pageContent.hero_badge || 'Services'}
                </span>

                <h1 className="ux-page-title mt-6 max-w-[680px] md:text-6xl lg:text-5xl">
                  {pageContent.hero_title ||
                    'Des accompagnements pensés pour vous faire avancer concrètement.'}
                </h1>

                <p className="ux-page-subtitle max-w-xl">
                  {pageContent.hero_subtitle ||
                    "Des formats adaptés à votre situation, vos objectifs et votre manière d'apprendre."}
                </p>

                <div className="mt-14 flex flex-wrap items-center gap-6">
                  <Link
                    href={pageContent.hero_primary_cta_url || route('contact')}
                    className="ux-btn-primary"
                  >
                    <Calendar className="h-5 w-5" />
                    {pageContent.hero_primary_cta_label || 'Réserver un appel'}
                  </Link>

                  <a
                    href={pageContent.hero_secondary_cta_url || '#liste-services'}
                    className="ux-btn-secondary group"
                  >
                    {pageContent.hero_secondary_cta_label || 'Découvrir nos accompagnements'}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 right-10 hidden rounded-3xl border border-slate-200/80 bg-white/90 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-[#020817]/75 lg:block">
              <div className="flex items-center gap-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#da2e29] text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">150+</p>
                  <p className="max-w-[170px] text-sm leading-6 text-slate-600 dark:text-slate-300">
                    accompagnements réalisés
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── SERVICES ── */}
        <section
          id="liste-services"
          ref={cardsRef}
          data-progress-label="Services"
          className="relative mx-auto mt-12 max-w-[1820px] px-4 md:mt-16 md:px-6"
        >
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#da2e29]">
              Accompagnements
            </p>

            <h2 className="ux-section-title mt-3 md:text-5xl">
              {pageContent.section_title || 'Choisissez le format qui vous correspond'}
            </h2>

            <p className="ux-section-subtitle mt-4 max-w-2xl">
              {pageContent.section_subtitle ||
                'Chaque service est conçu pour vous faire avancer avec clarté, méthode et impact.'}
            </p>

            {/* FIX 2 : Filtres — meilleur contraste dark */}
            <div className="mt-7">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Public
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  { key: 'all', label: 'Tous' },
                  { key: 'individual', label: 'Pour les particuliers' },
                  { key: 'organization', label: 'Pour les entreprises' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={audience === item.key}
                    onClick={() => updateFilters(item.key as ServiceAudience, focus)}
                    className={`inline-flex min-h-11 items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#da2e29] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#020817] ${
                      audience === item.key
                        ? 'border-[#da2e29] bg-[#da2e29] text-white shadow-md shadow-[#da2e29]/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-[#da2e29]/50 hover:text-[#da2e29] dark:border-white/20 dark:bg-white/10 dark:text-slate-200 dark:hover:border-[#da2e29]/70 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Format
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2 md:flex-wrap">
                {[
                  { key: 'all', label: 'Tous' },
                  { key: 'coaching', label: 'Coaching' },
                  { key: 'consultation', label: 'Consultation' },
                  { key: 'formation', label: 'Formation en groupe' },
                  { key: 'team_building', label: 'Team Building' },
                  { key: 'webinaire', label: 'Webinaires' },
                  { key: 'ressources', label: 'Ressources' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={focus === item.key}
                    onClick={() => updateFilters(audience, item.key as ServiceFocus)}
                    className={`min-h-11 shrink-0 rounded-full border px-5 py-2.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#da2e29] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#020817] ${
                      focus === item.key
                        ? 'bg-[#da2e29] text-white shadow-lg shadow-[#da2e29]/25'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/20 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service, index) => (
              <ServiceCard key={service?.id ?? index} service={service} index={index} />
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center dark:border-white/15 dark:bg-white/[0.04]">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Aucun accompagnement ne correspond à ces critères
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-slate-500 dark:text-slate-400">
                Essayez un autre public ou un autre format pour découvrir nos accompagnements.
              </p>
              <button
                type="button"
                onClick={() => updateFilters('all', 'all')}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#da2e29] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#c62823] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#da2e29] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#020817]"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </section>

        {/* ── PROOF ── */}
        <section
          className="relative mx-auto mt-20 max-w-[1320px] px-6 md:px-8"
          id="services-proof"
          data-progress-label="Preuves"
        >
          <div className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-white/[0.04] md:grid-cols-4">
            {keyFigures.map((item) => (
              <div key={item.label}>
                <p className="text-4xl font-black text-slate-900 dark:text-white">{item.value}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
              </div>
            ))}

            <div className="border-t border-slate-100 pt-6 dark:border-white/10 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <p className="text-sm italic leading-7 text-slate-600 dark:text-slate-300">
                "Un accompagnement clair, humain et directement actionnable."
              </p>
              <p className="mt-4 font-bold text-slate-900 dark:text-white">Client accompagné</p>
            </div>
          </div>
        </section>

        {/* ── PROCESS ── */}
        <section
          ref={processRef}
          id="services-process"
          data-progress-label="Méthode"
          className="relative mx-auto mt-20 max-w-[1320px] px-6 md:mt-24 md:px-8"
        >
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-white/[0.04] md:p-10"
          >
            <h2 className="ux-section-title md:text-4xl">
              {pageContent.process_title || "Comment se passe l'accompagnement ?"}
            </h2>

            <p className="ux-section-subtitle mt-3 max-w-2xl">
              {pageContent.process_subtitle ||
                "Un processus simple en trois étapes pour garantir l'alignement et l'exécution."}
            </p>

            <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-3">
              {processSteps.map((step, idx) => {
                const Icon = step.icon;

                return (
                  <motion.div
                    key={step.title}
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: idx * 0.08 }}
                    className="rounded-3xl border border-slate-100 bg-slate-50 p-6 transition hover:border-[#da2e29]/40 dark:border-white/10 dark:bg-[#020817]/60"
                  >
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#da2e29] text-white">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-white">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {step.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* ── FAQ ── */}
        <section
          ref={faqRef}
          id="services-faq"
          data-progress-label="FAQ"
          className="relative mx-auto mt-20 max-w-[1320px] px-6 md:mt-24 md:px-8"
        >
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="ux-section-title md:text-4xl">
              {pageContent.faq_title || 'Questions fréquentes'}
            </h2>

            <p className="ux-section-subtitle mt-3 max-w-2xl">
              {pageContent.faq_subtitle ||
                'Les réponses rapides aux questions les plus posées avant de démarrer.'}
            </p>
          </motion.div>

          <div className="space-y-4">
            {mergedFaqs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-500 dark:border-white/15 dark:bg-white/[0.04] dark:text-slate-400">
                Aucune question fréquente n'est disponible pour le moment.
              </div>
            ) : (
              <FaqAccordion faqs={mergedFaqs} defaultOpenIndex={0} />
            )}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section
          className="relative mx-auto mt-20 max-w-[1320px] px-6 md:mt-24 md:px-8"
          id="services-cta"
          data-progress-label="Contact"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#da2e29] to-[#c62823] px-6 py-8 text-white shadow-2xl shadow-[#da2e29]/20 md:px-12 md:py-14"
          >
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

            <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-black leading-tight md:text-5xl">
                  {pageContent.final_cta_title || "Prêt à passer à l'étape suivante ?"}
                </h2>

                <p className="mt-4 text-base leading-8 text-white/90 md:text-lg">
                  {pageContent.final_cta_text ||
                    "Réservez un premier échange pour clarifier vos besoins et choisir le meilleur format d'accompagnement."}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={pageContent.final_cta_primary_url || route('contact')}
                  className="ux-btn-secondary group !bg-white !text-[#da2e29]"
                >
                  {pageContent.final_cta_primary_label || 'Prendre contact'}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>

                <a
                  href={pageContent.final_cta_secondary_url || '#liste-services'}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/60 px-7 py-4 font-bold text-white transition hover:bg-white/10"
                >
                  {pageContent.final_cta_secondary_label || 'Revoir les services'}
                </a>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </FrontLayout>
  );
}

export default ServicesPage;
