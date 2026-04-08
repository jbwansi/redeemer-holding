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
    hero_badge:       'Coaching de vie',
    hero_title_line1: 'La vie que vous méritez',
    hero_title_line2: 'à portée de main !',
    hero_subtitle:    "Bienvenue sur le chemin de la transformation par les valeurs. Je vous aide à découvrir votre véritable potentiel et à vivre une vie épanouie.",
    hero_cta_text:    'Découvrir mes formations',
    hero_cta_url:     '',
    hero_image:       '/assets/images/portrait.jpg',
    hero_steps: [
        { icon: 'Clock',  title: 'Révélez votre potentiel',      description: 'Découvrez vos forces cachées et définissez votre vision personnelle' },
        { icon: 'Brain',  title: 'Transformez vos habitudes',    description: 'Développez des routines quotidiennes soutenues par la science' },
        { icon: 'Zap',    title: 'Optimisez votre productivité', description: 'Atteignez vos objectifs avec mon système éprouvé' },
    ],
    hero_testimonial: {
        content:  "Cette méthode a complètement transformé ma productivité et ma vision de la vie.",
        author:   'Marie L.',
        position: 'Entrepreneure',
    },
    hero_stats: [
        { value: '97%', label: 'Satisfaction' },
        { value: '3k+', label: 'Vies transformées' },
    ],
    // ── Stats band ────────────────────────────────────────────────────────────
    stats: [
        { value: '150+', label: 'Clients accompagnés' },
        { value: '10+',  label: 'Années d\'expérience' },
        { value: '40+',  label: 'Formations & ateliers' },
        { value: '97%',  label: 'Taux de satisfaction' },
    ],
    // ── Process ───────────────────────────────────────────────────────────────
    process_title:    "Mon processus d'accompagnement",
    process_subtitle: 'Une méthode simple, humaine et orientée résultats.',
    process: [
        { icon: 'MessageCircle', title: 'Premier contact',          description: 'Nous clarifions vos objectifs, défis et attentes.' },
        { icon: 'Search',        title: 'Diagnostic personnalisé',  description: 'Nous identifions vos leviers de progression prioritaires.' },
        { icon: 'Clipboard',     title: "Plan d'action",            description: 'Vous repartez avec un plan concret et progressif.' },
        { icon: 'Target',        title: 'Transformation durable',   description: 'Nous ajustons ensemble pour ancrer des résultats durables.' },
    ],
    // ── For whom ──────────────────────────────────────────────────────────────
    for_whom_title:    'Ce coaching est fait pour vous si…',
    for_whom_subtitle: "Entrepreneurs, salariés, leaders et porteurs de projet en quête de clarté et d'impact.",
    for_whom: [
        { icon: 'Briefcase', title: 'Entrepreneur(e)s',           description: 'Vous voulez structurer votre vision et mieux prioriser vos actions.' },
        { icon: 'Users',     title: 'Managers & leaders',         description: 'Vous souhaitez mieux fédérer, décider et communiquer.' },
        { icon: 'Rocket',    title: 'Professionnels en transition', description: 'Vous cherchez un nouveau cap clair et réaliste.' },
    ],
    // ── Testimonials ──────────────────────────────────────────────────────────
    testimonials_title: 'Ce que disent mes clients',
    testimonials: [
        { content: 'Un accompagnement puissant, pragmatique et profondément humain.', author: 'Aline K.',   position: "Cheffe d'entreprise", image: '' },
        { content: "En quelques semaines, j'ai gagné en clarté, en discipline et en sérénité.",             author: 'Samuel T.', position: 'Cadre dirigeant',    image: '' },
    ],
    // ── Other sections ────────────────────────────────────────────────────────
    formations_title: 'Prochaines formations',
    // ── Welcome video ─────────────────────────────────────────────────────────
    video_enabled: false,
    video_url:     '',
    video_title:   'Bienvenue dans mon univers',
    video_subtitle: 'Une courte vidéo pour faire connaissance et vous présenter ma démarche.',
    // ── Gallery ───────────────────────────────────────────────────────────────
    events_gallery_enabled: true,
    events_gallery_title: 'Galerie photos',
    events_gallery_images: [] as string[],
    events_gallery_captions: [] as string[],
    blog_title:       'Derniers articles',
    cta_benefits: [
        { text: 'Identifiez vos blocages actuels et opportunités inexploitées' },
        { text: 'Découvrez les 3 étapes clés pour transformer votre productivité' },
        { text: "Repartez avec un plan d'action personnalisé et applicable immédiatement" },
    ],
}

function Home({ services, home, posts, formations }: any) {
    const meta = { ...defaultHomeMeta, ...(home?.meta ?? {}) }
    const pageTitle = meta.hero_title_line1 ?? 'La vie que vous méritez à portée de main'
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
            <WelcomeVideo
                enabled={meta.video_enabled !== false && !!meta.video_url}
                videoUrl={meta.video_url}
                title={meta.video_title}
                subtitle={meta.video_subtitle}
            />
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
            <CalendlyCTA benefits={meta.cta_benefits?.map((b: any) => b.text).filter(Boolean)} />
        </FrontLayout>
    )
}

export default Home
