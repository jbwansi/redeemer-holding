import Hero from '@/components/frontend/home/hero'
import Services from '@/components/frontend/home/services'
import StatsBand from '@/components/frontend/home/stats-band'
import HowItWorks from '@/components/frontend/home/how-it-works'
import ForWhom from '@/components/frontend/home/for-whom'
import FeaturedFormations from '@/components/frontend/home/featured-formations'
import FrequentEventsGallery from '@/components/frontend/home/frequent-events-gallery'
import WelcomeVideo from '@/components/frontend/home/welcome-video'
import TestimonialsSection from '@/components/frontend/home/testimonials-section'
import BlogPreview from '@/components/frontend/home/blog-preview'
import CalendlyCTA from '@/components/frontend/layouts/calendly-cta'
import FrontLayout from '@/components/frontend/layouts/front-layout'
import { Head } from '@inertiajs/react'
import React from 'react'

const defaultHomeMeta = {
    // ── Hero ──────────────────────────────────────────────────────────────────
    hero_badge: 'Coaching, formation & conseil',
    hero_title_line1: 'Avancer avec clarté,',
    hero_title_line2: 'grandir avec justesse',
    hero_subtitle:
        "J’accompagne les personnes et les organisations à structurer leur évolution, renforcer leur posture et transformer leurs objectifs en résultats durables.",
    hero_cta_text: 'Découvrir mes accompagnements',
    hero_cta_url: '/services',
    hero_image: '/assets/images/portrait.jpg',
    hero_steps: [
        {
            icon: 'Clock',
            title: 'Clarifier votre cap',
            description: 'Faire émerger une direction claire, alignée et réaliste.',
        },
        {
            icon: 'Brain',
            title: 'Structurer votre progression',
            description: 'Mettre en place une méthode simple, concrète et durable.',
        },
        {
            icon: 'Zap',
            title: 'Passer à l’action',
            description: 'Transformer vos intentions en résultats visibles et mesurables.',
        },
    ],
    hero_testimonial: {
        content: 'Un accompagnement structuré, humain et profondément transformateur.',
        author: 'Marie L.',
        position: 'Entrepreneure',
    },
    hero_stats: [
        { value: '97%', label: 'Satisfaction' },
        { value: '150+', label: 'Personnes accompagnées' },
    ],

    // ── Stats band ────────────────────────────────────────────────────────────
    stats: [
        { value: '150+', label: 'Clients accompagnés' },
        { value: '10+', label: "Années d’expérience" },
        { value: '40+', label: 'Formations & ateliers' },
        { value: '97%', label: 'Taux de satisfaction' },
    ],

    // ── Process ───────────────────────────────────────────────────────────────
    process_title: "Mon approche",
    process_subtitle: 'Une méthode claire, humaine et orientée résultats.',
    process: [
        {
            icon: 'MessageCircle',
            title: 'Premier échange',
            description: 'Nous clarifions vos enjeux, vos objectifs et vos priorités.',
        },
        {
            icon: 'Search',
            title: 'Diagnostic ciblé',
            description: 'Nous identifions les leviers les plus utiles à votre évolution.',
        },
        {
            icon: 'Clipboard',
            title: "Plan d’action",
            description: 'Vous repartez avec une feuille de route concrète et progressive.',
        },
        {
            icon: 'Target',
            title: 'Résultats durables',
            description: 'Nous consolidons les avancées pour inscrire le changement dans le temps.',
        },
    ],

    // ── For whom ──────────────────────────────────────────────────────────────
    for_whom_title: 'Pour qui ?',
    for_whom_subtitle:
        'Entrepreneurs, leaders, professionnels en évolution et porteurs de projet.',
    for_whom: [
        {
            icon: 'Briefcase',
            title: 'Entrepreneur(e)s',
            description: 'Structurer une vision, poser des priorités et avancer avec cohérence.',
        },
        {
            icon: 'Users',
            title: 'Managers & leaders',
            description: 'Renforcer sa posture, mieux décider et mieux fédérer.',
        },
        {
            icon: 'Rocket',
            title: 'Transitions professionnelles',
            description: 'Retrouver un cap clair et construire la suite avec confiance.',
        },
    ],

    // ── Testimonials ──────────────────────────────────────────────────────────
    testimonials_title: 'Ce que disent mes clients',
    testimonials: [
        {
            content: 'Un accompagnement puissant, pragmatique et profondément humain.',
            author: 'Aline K.',
            position: "Cheffe d'entreprise",
            image: '',
        },
        {
            content: "J’ai gagné en clarté, en discipline et en sérénité.",
            author: 'Samuel T.',
            position: 'Cadre dirigeant',
            image: '',
        },
    ],

    // ── Other sections ────────────────────────────────────────────────────────
    formations_title: 'Formations à découvrir',

    // ── Welcome video ─────────────────────────────────────────────────────────
    video_enabled: false,
    video_url: '',
    video_title: 'Bienvenue',
    video_subtitle:
        'Une courte vidéo pour découvrir mon approche et ma manière d’accompagner.',

    // ── Gallery ───────────────────────────────────────────────────────────────
    events_gallery_enabled: true,
    events_gallery_title: 'En images',
    events_gallery_images: [] as string[],
    events_gallery_captions: [] as string[],

    // ── Blog ──────────────────────────────────────────────────────────────────
    blog_title: 'Articles & réflexions',

    // ── CTA ───────────────────────────────────────────────────────────────────
    cta_benefits: [
        { text: 'Clarifier vos enjeux prioritaires' },
        { text: 'Identifier vos leviers de progression' },
        { text: "Repartir avec une direction concrète et applicable" },
    ],
}

function Home({ services, home, posts, formations }: any) {
    const meta = { ...defaultHomeMeta, ...(home?.meta ?? {}) }

    const pageTitle =
        `${meta.hero_title_line1 ?? 'Avancer avec clarté'}, ${meta.hero_title_line2 ?? 'grandir avec justesse'}`
    const pageDescription = meta.hero_subtitle ?? defaultHomeMeta.hero_subtitle

    return (
        <FrontLayout>
            <Head title={pageTitle}>
                <meta name="description" content={pageDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="twitter:title" content={pageTitle} />
                <meta property="twitter:description" content={pageDescription} />
            </Head>

            <Hero meta={meta} />

            <StatsBand stats={meta.stats ?? []} />

            <Services services={services} />

            <HowItWorks
                steps={meta.process ?? []}
                title={meta.process_title}
                subtitle={meta.process_subtitle}
            />

            <ForWhom
                cards={meta.for_whom ?? []}
                title={meta.for_whom_title}
                subtitle={meta.for_whom_subtitle}
            />

            <FeaturedFormations
                formations={formations ?? []}
                title={meta.formations_title}
            />

            <WelcomeVideo
                enabled={meta.video_enabled !== false && !!meta.video_url}
                videoUrl={meta.video_url}
                title={meta.video_title}
                subtitle={meta.video_subtitle}
            />

            <TestimonialsSection
                testimonials={meta.testimonials ?? []}
                title={meta.testimonials_title}
            />

            {meta.events_gallery_enabled !== false && (
                <FrequentEventsGallery
                    images={meta.events_gallery_images ?? []}
                    captions={meta.events_gallery_captions ?? []}
                    title={meta.events_gallery_title}
                />
            )}

            <BlogPreview
                posts={posts ?? []}
                title={meta.blog_title}
            />

            <CalendlyCTA
                benefits={meta.cta_benefits?.map((b: any) => b.text).filter(Boolean)}
            />
        </FrontLayout>
    )
}

export default Home