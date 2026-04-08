import React, { useMemo, useRef, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
    ArrowRight,
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Compass,
    MessageCircle,
    Sparkles,
    Target,
    Users,
    Zap,
} from 'lucide-react';
import FrontLayout from '@/components/frontend/layouts/front-layout';
import IconComponent from '@/components/ui/icon';
import { normalizeServiceIconName } from '@/lib/service-icon';

type Service = {
    id: number;
    name: string;
    slug: string;
    excerpt?: string | null;
    content?: string | null;
    icon?: string | null;
    views?: number;
};

type FaqItem = {
    question: string;
    answer: string;
};

type ServiceFocus = 'all' | 'coaching' | 'consultation' | 'formation' | 'webinaire' | 'ressources';

const focusKeywords: Record<Exclude<ServiceFocus, 'all'>, string[]> = {
    coaching: ['coaching', 'coach'],
    consultation: ['consultation', 'conseil', 'advisory'],
    formation: ['formation', 'training', 'atelier'],
    webinaire: ['webinaire', 'webinar', 'masterclass'],
    ressources: ['ressource', 'guide', 'template', 'ebook', 'outil'],
};

const processSteps = [
    {
        title: 'Diagnostic initial',
        description: 'Nous clarifions votre situation actuelle, vos blocages et vos objectifs prioritaires.',
        icon: Compass,
    },
    {
        title: "Plan d'action", 
        description: 'Vous repartez avec une feuille de route concrète, réaliste et orientée résultats.',
        icon: Target,
    },
    {
        title: 'Accompagnement continu',
        description: 'Nous ajustons ensemble vos actions pour sécuriser votre progression dans le temps.',
        icon: Zap,
    },
];

function ServicesPage({ services, contactFaqs = [] }: { services: Service[]; contactFaqs?: FaqItem[] }) {
    const page = usePage() as any;
    const containerRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);
    const processRef = useRef<HTMLDivElement>(null);
    const faqRef = useRef<HTMLDivElement>(null);

    const inHero = useInView(heroRef, { once: false, amount: 0.2 });
    const inCards = useInView(cardsRef, { once: false, amount: 0.2 });
    const inProcess = useInView(processRef, { once: false, amount: 0.2 });
    const inFaq = useInView(faqRef, { once: false, amount: 0.2 });

    const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
    const orbY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);

    const queryString = String(page?.url || '').split('?')[1] || '';
    const queryParams = new URLSearchParams(queryString);
    const queryFocus = (queryParams.get('focus') || 'all').toLowerCase() as ServiceFocus;
    const initialFocus: ServiceFocus = ['coaching', 'consultation', 'formation', 'webinaire', 'ressources'].includes(queryFocus)
        ? queryFocus
        : 'all';

    const [openIndex, setOpenIndex] = useState<number>(0);
    const [focus, setFocus] = useState<ServiceFocus>(initialFocus);

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
        if (focus === 'all') return services;

        const keywords = focusKeywords[focus];
        return services.filter((service) => {
            const haystack = `${service.name || ''} ${service.excerpt || ''} ${service.slug || ''}`.toLowerCase();
            return keywords.some((keyword) => haystack.includes(keyword));
        });
    }, [focus, services]);

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
            if (!dedup.has(key)) {
                dedup.set(key, faq);
            }
        });

        return Array.from(dedup.values());
    }, [contactFaqs]);

    return (
        <FrontLayout>
            <Head title="Services" />

            <main ref={containerRef} className="relative min-h-screen overflow-hidden bg-[#f7f6f2] text-slate-900 dark:bg-slate-950 dark:text-white pt-28 pb-20">
                <motion.div
                    className="pointer-events-none absolute -top-24 -left-20 h-80 w-80 rounded-full bg-[#da2e29]/15 blur-3xl"
                    style={{ y: orbY }}
                />
                <motion.div
                    className="pointer-events-none absolute bottom-[-120px] right-[-40px] h-96 w-96 rounded-full bg-[#0f766e]/10 blur-3xl"
                    style={{ y: orbY }}
                />

                <section ref={heroRef} className="max-w-[1320px] mx-auto px-6 md:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        <motion.div
                            className="lg:col-span-7"
                            initial={{ opacity: 0, y: 20 }}
                            animate={inHero ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#da2e29]/30 bg-white/70 px-4 py-1 text-xs tracking-wide uppercase text-[#da2e29] dark:bg-slate-900/60">
                                <Sparkles className="h-3.5 w-3.5" />
                                Services
                            </span>

                            <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.08] tracking-tight text-slate-900 dark:text-white">
                                Des services modernes pour vos objectifs professionnels et personnels
                            </h1>

                            <p className="mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
                                Coaching, consultation et accompagnement stratégique: des formats concrets pour transformer vos priorités en résultats mesurables.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    href={route('contact')}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#da2e29] px-6 py-3 text-white font-medium hover:bg-[#c62823] transition-colors"
                                >
                                    Prendre rendez-vous
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <a
                                    href="#liste-services"
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-slate-800 font-medium hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    Voir les services
                                    <ChevronRight className="h-4 w-4" />
                                </a>
                            </div>
                        </motion.div>

                        <motion.div
                            className="lg:col-span-5"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={inHero ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                        >
                            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                                <div className="grid grid-cols-3 gap-4">
                                    {keyFigures.map((item) => (
                                        <div key={item.label} className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-4 text-center">
                                            <div className="text-2xl font-bold text-[#da2e29]">{item.value}</div>
                                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#da2e29]/10 text-[#da2e29]">
                                            <MessageCircle className="h-4 w-4" />
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">
                                            Commencez par un échange court pour choisir le format le plus adapté à votre situation.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section id="liste-services" ref={cardsRef} className="max-w-[1320px] mx-auto px-6 md:px-8 mt-20 md:mt-24">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={inCards ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8"
                    >
                        <h2 className="text-2xl md:text-3xl font-semibold">Nos accompagnements</h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">Chaque service est conçu pour vous faire avancer avec clarté, méthode et impact.</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {([
                                { key: 'all', label: 'Tous' },
                                { key: 'coaching', label: 'Coaching' },
                                { key: 'consultation', label: 'Consultation' },
                                { key: 'formation', label: 'Formation groupe' },
                                { key: 'webinaire', label: 'Webinaires' },
                                { key: 'ressources', label: 'Ressources' },
                            ] as Array<{ key: ServiceFocus; label: string }>).map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => setFocus(item.key)}
                                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                        focus === item.key
                                            ? 'bg-[#da2e29] text-white'
                                            : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredServices.map((service, idx) => (
                            <motion.article
                                key={service.id}
                                initial={{ opacity: 0, y: 24 }}
                                animate={inCards ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                                transition={{ duration: 0.45, delay: idx * 0.08 }}
                                className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-slate-700 dark:bg-slate-900"
                            >
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#da2e29]/10 text-[#da2e29]">
                                    {service.icon ? <IconComponent name={normalizeServiceIconName(service.icon) || 'users'} color="red" /> : <Users className="h-5 w-5" />}
                                </div>
                                <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">{service.name}</h3>
                                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-4">
                                    {service.excerpt || 'Accompagnement personnalisé et orienté résultats.'}
                                </p>

                                <div className="mt-6 flex flex-wrap gap-2">
                                    <Link
                                        href={route('services.details', service.slug)}
                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        En savoir plus
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href={service.slug ? `/services-requests/${encodeURIComponent(service.slug)}` : '#'}
                                        className="inline-flex items-center gap-2 rounded-lg bg-[#da2e29] px-4 py-2 text-sm font-medium text-white hover:bg-[#c62823] transition-colors"
                                    >
                                        Reserver
                                        <Calendar className="h-4 w-4" />
                                    </Link>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                    {filteredServices.length === 0 && (
                        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                            Aucun service ne correspond a ce filtre pour le moment.
                        </div>
                    )}
                </section>

                <section ref={processRef} className="max-w-[1320px] mx-auto px-6 md:px-8 mt-20 md:mt-24">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={inProcess ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                        transition={{ duration: 0.6 }}
                        className="rounded-3xl border border-slate-200/80 bg-white p-8 md:p-10 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                        <h2 className="text-2xl md:text-3xl font-semibold">Comment se passe l'accompagnement ?</h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">Un processus simple en trois étapes pour garantir l'alignement et l'exécution.</p>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {processSteps.map((step, idx) => {
                                const Icon = step.icon;
                                return (
                                    <motion.div
                                        key={step.title}
                                        initial={{ opacity: 0, y: 18 }}
                                        animate={inProcess ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                                        transition={{ duration: 0.45, delay: idx * 0.08 }}
                                        className="rounded-2xl border border-slate-200/80 bg-slate-50 dark:bg-slate-800/60 dark:border-slate-700 p-6"
                                    >
                                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#da2e29]/10 text-[#da2e29]">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{step.description}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </section>

                <section ref={faqRef} className="max-w-[1320px] mx-auto px-6 md:px-8 mt-20 md:mt-24">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={inFaq ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8"
                    >
                        <h2 className="text-2xl md:text-3xl font-semibold">Questions frequentes</h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">Les réponses rapides aux questions les plus posées avant de démarrer.</p>
                    </motion.div>

                                        <div className="space-y-4">
                                            {mergedFaqs.length === 0 ? (
                                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                                                    Aucune question frequente n est disponible pour le moment.
                                                </div>
                                            ) : (
                                                mergedFaqs.map((faq, idx) => {
                                                    const open = openIndex === idx;
                                                    return (
                                                        <motion.div
                                                            key={faq.question}
                                                            initial={{ opacity: 0, y: 18 }}
                                                            animate={inFaq ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                                                            transition={{ duration: 0.45, delay: idx * 0.06 }}
                                                            className={`rounded-2xl border transition-all ${
                                                                open
                                                                    ? 'bg-slate-50 border-slate-200/80 shadow-lg'
                                                                    : 'bg-white border-slate-200/80 hover:shadow-md'
                                                            } dark:border-slate-700 dark:bg-slate-900`}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() => setOpenIndex(open ? -1 : idx)}
                                                                className="w-full px-6 py-5 flex items-center justify-between text-left group focus:outline-none"
                                                            >
                                                                <span className="font-semibold text-base">{faq.question}</span>
                                                                <span
                                                                    className={`flex items-center justify-center rounded-full border-2 transition-all ${
                                                                        open
                                                                            ? 'bg-white border-slate-300 text-slate-700'
                                                                            : 'bg-white border-slate-300 text-slate-400 group-hover:bg-slate-100'
                                                                    } h-8 w-8 ml-4`}
                                                                >
                                                                    {open ? (
                                                                        <span className="text-2xl leading-none">–</span>
                                                                    ) : (
                                                                        <span className="text-2xl leading-none">+</span>
                                                                    )}
                                                                </span>
                                                            </button>
                                                            {open && (
                                                                <div className="px-6 pb-6 text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed animate-fade-in">
                                                                    {faq.answer}
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    );
                                                })
                                            )}
                                        </div>
                </section>

                <section className="max-w-[1320px] mx-auto px-6 md:px-8 mt-20 md:mt-24">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6 }}
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#da2e29] to-[#c62823] px-8 py-12 md:px-12 md:py-14 text-white"
                    >
                        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

                        <div className="relative z-10 max-w-3xl">
                            <h2 className="text-3xl md:text-4xl font-semibold leading-tight">Pret a passer a l'etape suivante ?</h2>
                            <p className="mt-4 text-white/90 text-base md:text-lg">
                                Reservez un premier echange pour clarifier vos besoins et choisir le meilleur format d'accompagnement.
                            </p>

                            <div className="mt-7 flex flex-wrap gap-3">
                                <Link
                                    href={route('contact')}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-[#da2e29] hover:bg-slate-100 transition-colors"
                                >
                                    Prendre contact
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <a
                                    href="#liste-services"
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/70 px-6 py-3 font-medium text-white hover:bg-white/10 transition-colors"
                                >
                                    Revoir les services
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
