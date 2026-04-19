import Hero from '@/components/frontend/home/hero'
import Services from '@/components/frontend/home/services'
import StatsBand from '@/components/frontend/home/stats-band'
import HowItWorks from '@/components/frontend/home/how-it-works'
import ForWhom from '@/components/frontend/home/for-whom'
import FeaturedFormations from '@/components/frontend/home/featured-formations'
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
    hero_badge: 'Coaching • Formation • Accompagnement',
    hero_title_line1: 'Structurez vos actions',
    hero_title_line2: 'et développez des résultats',
    hero_title_line3: 'durables',
    hero_subtitle:
        'J’accompagne les entrepreneurs, les leaders et les professionnels en évolution à clarifier leurs priorités, renforcer leur posture et avancer avec méthode.',
    hero_cta_text: 'Réserver une session découverte',
    hero_cta_url: '/contact',
    hero_secondary_cta_text: 'Découvrir les accompagnements',
    hero_secondary_cta_url: '/services',
    hero_image: '/assets/images/portrait.jpg',
    hero_images: [] as string[],
    hero_reassurance_items: [
        { text: 'Sans engagement' },
        { text: '30 minutes' },
        { text: 'En visio ou en présentiel' },
    ],
    hero_floating_stat_enabled: true,
    hero_floating_stat_value: '97%',
    hero_floating_stat_label: 'Satisfaction',

    // ── Clarity / Action block ────────────────────────────────────────────────
    // ── Clarity / Action block ────────────────────────────────────────────────
    clarity_action_enabled: true,
    clarity_action_badge: 'Transformation',
    clarity_action_title: 'Du flou à l’action : un cadre simple pour avancer',
    clarity_action_subtitle:
        'Identifiez ce qui freine votre progression et découvrez le cadre concret pour avancer avec plus de clarté, de constance et de résultats.',

    clarity_action_left_eyebrow: 'Situation actuelle',
    clarity_action_left_title: 'Vous vous reconnaissez si :',
    clarity_action_left_items: [
        { text: 'Vous avez trop de priorités et pas assez de clarté' },
        { text: 'Vous avancez beaucoup, mais sans résultats suffisamment stables' },
        { text: 'Vous avez du mal à garder un cap dans la durée' },
        { text: 'Vous ressentez le besoin de structurer votre progression' },
    ],

    clarity_action_right_eyebrow: 'Résultat attendu',
    clarity_action_right_title: 'Vous repartez avec :',
    clarity_action_right_items: [
        { text: 'Des priorités claires et une direction plus nette' },
        { text: 'Une méthode simple, réaliste et applicable' },
        { text: 'Des habitudes plus solides et plus durables' },
        { text: 'Une progression visible, mesurable et cohérente' },
    ],

    clarity_action_final_cta_title: 'Faisons le point sur votre situation',
    clarity_action_final_cta_subtitle:
        'Profitez d’un premier échange pour clarifier vos priorités, prendre du recul et identifier les prochaines étapes à mettre en place.',
    clarity_action_final_cta_button_text: 'Réserver mon appel découverte',
    clarity_action_final_cta_button_href: '/contact',
    clarity_action_final_cta_disclaimer: '30 minutes • Sans engagement',

    // ── Stats band ────────────────────────────────────────────────────────────
    stats: [
        { value: '150+', label: 'Personnes accompagnées' },
        { value: '10+', label: "Années d’expérience" },
        { value: '40+', label: 'Formations et ateliers' },
        { value: '97%', label: 'Taux de satisfaction' },
    ],

    // ── Process ───────────────────────────────────────────────────────────────
    process_title: 'Une méthode claire, humaine et orientée résultats',
    process_subtitle:
        'Chaque accompagnement s’appuie sur un cadre structuré pour transformer vos intentions en avancées concrètes.',
    process: [
        {
            icon: 'MessageCircle',
            title: 'Clarifier',
            description: 'Nous faisons le point sur votre situation, vos enjeux et vos priorités réelles.',
        },
        {
            icon: 'Search',
            title: 'Identifier',
            description: 'Nous repérons les leviers les plus utiles pour avancer avec plus d’impact.',
        },
        {
            icon: 'Clipboard',
            title: 'Structurer',
            description: 'Nous construisons un plan d’action simple, cohérent et réaliste.',
        },
        {
            icon: 'Target',
            title: 'Consolider',
            description: 'Nous ancrons des résultats durables dans votre fonctionnement quotidien.',
        },
    ],

    // ── For whom ──────────────────────────────────────────────────────────────
    for_whom_title: 'Un accompagnement pensé pour celles et ceux qui veulent avancer avec plus de clarté et d’impact',
    for_whom_subtitle:
        'Entrepreneurs, managers, professionnels en transition ou porteurs de projet : chaque accompagnement s’adapte à votre réalité.',
    for_whom: [
        {
            icon: 'Briefcase',
            title: 'Entrepreneurs & indépendants',
            description: 'Structurer votre vision, mieux prioriser et avancer avec davantage de cohérence.',
        },
        {
            icon: 'Users',
            title: 'Managers & leaders',
            description: 'Renforcer votre posture, mieux décider et mieux fédérer autour de l’essentiel.',
        },
        {
            icon: 'Rocket',
            title: 'Transitions professionnelles',
            description: 'Retrouver un cap clair, reprendre confiance et construire la suite avec méthode.',
        },
    ],

    // ── Testimonials ──────────────────────────────────────────────────────────
    testimonials_title: 'Ce que disent les personnes accompagnées',
    testimonials: [
        {
            content: 'Un accompagnement exigeant, humain et immédiatement utile. J’ai gagné en clarté et en efficacité.',
            author: 'Aline K.',
            position: "Cheffe d'entreprise",
            image: '',
        },
        {
            content: 'J’ai enfin pu remettre de l’ordre dans mes priorités et avancer avec plus de sérénité.',
            author: 'Samuel T.',
            position: 'Cadre dirigeant',
            image: '',
        },
    ],

    // ── Dynamic sections ──────────────────────────────────────────────────────
    formations_title: 'Formations & ateliers à découvrir',
    blog_title: 'Articles & réflexions',

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

    // ── CTA ───────────────────────────────────────────────────────────────────
    cta_benefits: [
        { text: 'Clarifier votre situation actuelle et vos priorités' },
        { text: 'Identifier les leviers les plus utiles pour avancer' },
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
                badge={meta.clarity_action_badge}
                title={meta.clarity_action_title}
                subtitle={meta.clarity_action_subtitle}
                leftEyebrow={meta.clarity_action_left_eyebrow}
                leftTitle={meta.clarity_action_left_title}
                leftItems={meta.clarity_action_left_items ?? []}
                rightEyebrow={meta.clarity_action_right_eyebrow}
                rightTitle={meta.clarity_action_right_title}
                rightItems={meta.clarity_action_right_items ?? []}
                finalCtaTitle={meta.clarity_action_final_cta_title}
                finalCtaSubtitle={meta.clarity_action_final_cta_subtitle}
                finalCtaButtonText={meta.clarity_action_final_cta_button_text}
                finalCtaDisclaimer={meta.clarity_action_final_cta_disclaimer}
                submitUrl={route('contact.store')}
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

            <StatsBand stats={meta.stats ?? []} />

            <TestimonialsSection
                testimonials={meta.testimonials ?? []}
                title={meta.testimonials_title}
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