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
import ClarityActionBlock from '@/components/frontend/home/clarity-action-block'
import CalendlyCTA from '@/components/frontend/layouts/calendly-cta'
import FrontLayout from '@/components/frontend/layouts/front-layout'
import { Head } from '@inertiajs/react'
import React from 'react'

const defaultHomeMeta = {
    // ── Hero ──────────────────────────────────────────────────────────────────
   hero_badge: 'Formation • Coaching • Conseil',
hero_title_line1: 'Structurez vos actions',
hero_title_line2: 'et atteignez vos objectifs',
hero_title_line3: 'durablement',
hero_subtitle:
    'Un accompagnement humain et structuré pour clarifier vos priorités, renforcer vos habitudes et avancer avec constance.',
hero_cta_text: 'Réserver une consultation gratuite',
hero_cta_url: '/contact',
hero_secondary_cta_text: 'Découvrir les formations',
hero_secondary_cta_url: '/formations',
hero_image: '/assets/images/portrait.jpg',
hero_images: [
    '/assets/images/portrait.jpg',
    '/assets/images/coaching-1.jpg',
    '/assets/images/formation-presentiel.jpg',
],
hero_reassurance_items: [
    { text: 'Sans engagement' },
    { text: 'Aucun paiement requis' },
    { text: '30 minutes' },
],
hero_floating_stat_enabled: true,
hero_floating_stat_value: '97%',
hero_floating_stat_label: 'Satisfaction',

    // ── Transformation block ─────────────────────────────────────────────────
    clarity_action_enabled: true,
    clarity_action_title: "Du flou à l’action : un cadre simple pour avancer",
    clarity_action_left_title: 'Vous vous reconnaissez si :',
    clarity_action_left_items: [
        { text: 'Trop de priorités et pas assez de clarté' },
        { text: 'Vous démarrez fort puis perdez le rythme' },
        { text: 'Vous êtes souvent dans l’urgence' },
        { text: 'Vous avancez sans résultats stables' },
    ],
    clarity_action_right_title: 'Vous repartez avec :',
    clarity_action_right_items: [
        { text: 'Des priorités nettes et une direction claire' },
        { text: 'Un plan d’action simple et réaliste' },
        { text: 'Des habitudes durables' },
        { text: 'Des résultats mesurables' },
    ],

    // ── Stats ────────────────────────────────────────────────────────────────
    stats: [
        { value: '150+', label: 'Clients accompagnés' },
        { value: '10+', label: "Années d’expérience" },
        { value: '40+', label: 'Formations & ateliers' },
        { value: '97%', label: 'Taux de satisfaction' },
    ],

    // ── Process ──────────────────────────────────────────────────────────────
    process_title: 'Mon approche',
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

    // ── For whom ─────────────────────────────────────────────────────────────
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

    // ── Testimonials ─────────────────────────────────────────────────────────
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

    // ── Dynamic sections ─────────────────────────────────────────────────────
    formations_title: 'Formations à découvrir',
    blog_title: 'Articles & réflexions',

    // ── Welcome video ────────────────────────────────────────────────────────
    video_enabled: false,
    video_url: '',
    video_title: 'Bienvenue',
    video_subtitle:
        'Une courte vidéo pour découvrir mon approche et ma manière d’accompagner.',

    // ── Gallery ──────────────────────────────────────────────────────────────
    events_gallery_enabled: true,
    events_gallery_title: 'En images',
    events_gallery_images: [] as string[],
    events_gallery_captions: [] as string[],

    // ── CTA ──────────────────────────────────────────────────────────────────
    cta_benefits: [
        { text: 'Clarifier vos enjeux prioritaires' },
        { text: 'Identifier vos leviers de progression' },
        { text: 'Repartir avec une direction concrète et applicable' },
    ],
}

function Home({ services, home, posts, formations }: any) {
    const meta = { ...defaultHomeMeta, ...(home?.meta ?? {}) }

    const pageTitle = [
        meta.hero_title_line1 ?? 'Avancer avec clarté',
        meta.hero_title_line2 ?? 'grandir avec justesse',
        meta.hero_title_line3 ?? '',
    ]
        .filter(Boolean)
        .join(' ')

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

            <ClarityActionBlock
                enabled={meta.clarity_action_enabled !== false}
                title={meta.clarity_action_title}
                leftTitle={meta.clarity_action_left_title}
                leftItems={meta.clarity_action_left_items ?? []}
                rightTitle={meta.clarity_action_right_title}
                rightItems={meta.clarity_action_right_items ?? []}
            />

            <ForWhom
                cards={meta.for_whom ?? []}
                title={meta.for_whom_title}
                subtitle={meta.for_whom_subtitle}
            />

            <HowItWorks
                steps={meta.process ?? []}
                title={meta.process_title}
                subtitle={meta.process_subtitle}
            />

            <StatsBand stats={meta.stats ?? []} />

            <Services services={services} />

            <FeaturedFormations
                formations={formations ?? []}
                title={meta.formations_title}
            />

            <TestimonialsSection
                testimonials={meta.testimonials ?? []}
                title={meta.testimonials_title}
            />

            <WelcomeVideo
                enabled={meta.video_enabled !== false && !!meta.video_url}
                videoUrl={meta.video_url}
                title={meta.video_title}
                subtitle={meta.video_subtitle}
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