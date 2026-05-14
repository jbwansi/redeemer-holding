import React, { Suspense, lazy } from 'react'
import Hero from '@/components/frontend/home/hero'
import ClarityActionBlock from '@/components/frontend/home/clarity-action-block'
import FrontLayout from '@/components/frontend/layouts/front-layout'
import { SectionSkeleton } from '@/components/ui/section-skeleton'
import { Head } from '@inertiajs/react'
import { route } from 'ziggy-js'

const Services = lazy(() => import('@/components/frontend/home/services'))
const StatsBand = lazy(() => import('@/components/frontend/home/stats-band'))
const HowItWorks = lazy(() => import('@/components/frontend/home/how-it-works'))
const ForWhom = lazy(() => import('@/components/frontend/home/for-whom'))
const FeaturedFormations = lazy(() => import('@/components/frontend/home/featured-formations'))
const WelcomeVideo = lazy(() => import('@/components/frontend/home/welcome-video'))
const TestimonialsSection = lazy(() => import('@/components/frontend/home/testimonials-section'))
const BlogPreview = lazy(() => import('@/components/frontend/home/blog-preview'))
const CalendlyCTA = lazy(() => import('@/components/frontend/layouts/calendly-cta'))

const defaultHomeMeta = {
    hero_badge: 'Coaching • Formation • Accompagnement',
    hero_title_line1: 'Structurez vos actions',
    hero_title_line2: 'et développez des résultats',
    hero_title_line3: 'durables',
    hero_subtitle:
        'J’accompagne les entrepreneurs, les leaders et les professionnels en évolution à clarifier leurs priorités, renforcer leur posture et avancer avec méthode.',

    hero_cta_text: 'Réserver un appel découverte',
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
    hero_social_proof_text: 'Des professionnels accompagnés avec méthode et bienveillance',
    hero_social_rating: 'Retours très positifs',
    hero_social_platform: 'Accompagnements appréciés',
    clarity_action_social_proof_text: 'Un accompagnement structuré et orienté résultats',
    clarity_action_urgency_text:
        'Je limite le nombre d’accompagnements chaque semaine pour garantir un suivi de qualité.',

    // ── CLARITY ACTION ───────────────────────────────────
    clarity_action_enabled: true,

    clarity_action_title:
        'Du flou à l’action : un cadre simple pour avancer',

    clarity_action_subtitle:
        'Quand tout semble prioritaire, il devient difficile d’avancer avec clarté. Cet échange vous aide à faire le tri, retrouver une direction nette et passer à l’action avec plus de sérénité.',

    clarity_action_left_title: 'Vous vous reconnaissez si :',
    clarity_action_left_items: [
        { text: 'Vous avez trop de priorités et pas assez de clarté' },
        { text: 'Vous avancez beaucoup, mais sans résultats suffisamment stables' },
        { text: 'Vous avez du mal à garder un cap dans la durée' },
        { text: 'Vous ressentez le besoin de structurer votre progression' },
    ],
    clarity_action_right_title: 'Vous repartez avec :',
    clarity_action_right_items: [
        { text: 'Des priorités claires et une direction plus nette' },
        { text: 'Une méthode simple, réaliste et applicable' },
        { text: 'Des habitudes plus solides et plus durables' },
        { text: 'Une progression visible, mesurable et cohérente' },
    ],
    clarity_action_final_cta_title: 'Réservez un échange pour clarifier vos prochaines étapes',
    clarity_action_final_cta_subtitle:
        'En 30 minutes, nous faisons le point sur votre situation, vos priorités et les actions les plus utiles pour avancer.',
    clarity_action_final_cta_button_text: 'Réserver mon appel découverte',
    process_title: 'Une méthode claire, humaine et orientée résultats',
    process_subtitle:
        'Chaque accompagnement s’appuie sur un cadre structuré pour transformer vos intentions en avancées concrètes.',

    process: [
        {
            icon: 'MessageCircle',
            title: 'Clarifier',
            description:
                'Nous faisons le point sur votre situation, vos enjeux et vos priorités réelles.',
        },
        {
            icon: 'Search',
            title: 'Identifier',
            description:
                'Nous repérons les leviers les plus utiles pour avancer avec plus d’impact.',
        },
        {
            icon: 'Clipboard',
            title: 'Structurer',
            description:
                'Nous construisons un plan d’action simple, cohérent et réaliste.',
        },
        {
            icon: 'Target',
            title: 'Consolider',
            description:
                'Nous ancrons des résultats durables dans votre fonctionnement quotidien.',
        },
    ],

    // ── POUR QUI ─────────────────────────────────────────
    for_whom_title:
        'Un accompagnement pensé pour celles et ceux qui veulent avancer avec plus de clarté et d’impact',

    for_whom_subtitle:
        'Entrepreneurs, managers, professionnels en transition ou porteurs de projet : chaque accompagnement s’adapte à votre réalité.',

    for_whom: [
        {
            icon: 'Briefcase',
            title: 'Entrepreneurs & indépendants',
            description:
                'Structurer votre vision, mieux prioriser et avancer avec davantage de cohérence.',
        },
        {
            icon: 'Users',
            title: 'Managers & leaders',
            description:
                'Renforcer votre posture, mieux décider et mieux fédérer autour de l’essentiel.',
        },
        {
            icon: 'Rocket',
            title: 'Transitions professionnelles',
            description:
                'Retrouver un cap clair, reprendre confiance et construire la suite avec méthode.',
        },
    ],
    stats: [
        { value: '150+', label: 'Personnes accompagnées' },
        { value: '10+', label: "Années d’expérience" },
        { value: '40+', label: 'Formations et ateliers' },
        { value: '97%', label: 'Taux de satisfaction' },
    ],
    testimonials_title: 'Ce que disent les personnes accompagnées',
    testimonials: [
        {
            content:
                'Un accompagnement exigeant, humain et immédiatement utile. J’ai gagné en clarté et en efficacité.',
            author: 'Aline K.',
            position: "Cheffe d'entreprise",
            image: '',
        },
        {
            content:
                'J’ai enfin pu remettre de l’ordre dans mes priorités et avancer avec plus de sérénité.',
            author: 'Samuel T.',
            position: 'Cadre dirigeant',
            image: '',
        },
    ],
    formations_title: 'Formations & ateliers à découvrir',
    blog_title: 'Articles & réflexions',
    video_enabled: false,
    video_url: '',
    video_title: 'Bienvenue',
    video_subtitle:
        'Une courte vidéo pour découvrir mon approche et ma manière d’accompagner.',

    // ── GALERIE ──────────────────────────────────────────
    events_gallery_enabled: true,
    events_gallery_title: 'En images',
    events_gallery_images: [] as string[],
    events_gallery_captions: [] as string[],
    cta_benefits: [
        { text: 'Clarifier votre situation actuelle et vos priorités' },
        { text: 'Identifier les leviers les plus utiles pour avancer' },
        { text: 'Repartir avec une direction concrète et applicable' },
    ],
}

function Home({ services, home, posts, formations, testimonials }: any) {
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

            {/* Above the fold — chargement immédiat */}
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
                finalCtaSocialProofText={meta.clarity_action_social_proof_text}
                finalCtaUrgencyText={meta.clarity_action_urgency_text}
                submitUrl={route('contact.store')}
            />

            {/* Below the fold — lazy loaded */}
            <Suspense fallback={<SectionSkeleton />}>
                <Services services={services} />
            </Suspense>

            <Suspense fallback={<SectionSkeleton />}>
                <HowItWorks
                    steps={meta.process ?? []}
                    title={meta.process_title}
                    subtitle={meta.process_subtitle}
                />
            </Suspense>

            <Suspense fallback={<SectionSkeleton />}>
                <ForWhom
                    cards={meta.for_whom ?? []}
                    title={meta.for_whom_title}
                    subtitle={meta.for_whom_subtitle}
                />
            </Suspense>

            <Suspense fallback={<SectionSkeleton />}>
                <StatsBand stats={meta.stats ?? []} />
            </Suspense>

            <Suspense fallback={<SectionSkeleton />}>
                <TestimonialsSection testimonials={testimonials} />
            </Suspense>

            <Suspense fallback={<SectionSkeleton />}>
                <FeaturedFormations
                    formations={formations ?? []}
                    title={meta.formations_title}
                />
            </Suspense>

            <Suspense fallback={<SectionSkeleton />}>
                <WelcomeVideo
                    enabled={meta.video_enabled !== false && !!meta.video_url}
                    videoUrl={meta.video_url}
                    title={meta.video_title}
                    subtitle={meta.video_subtitle}
                />
            </Suspense>

            <Suspense fallback={<SectionSkeleton />}>
                <BlogPreview
                    posts={posts ?? []}
                    title={meta.blog_title}
                />
            </Suspense>

            <Suspense fallback={<SectionSkeleton />}>
                <CalendlyCTA
                    benefits={meta.cta_benefits?.map((b: any) => b.text).filter(Boolean)}
                />
            </Suspense>
        </FrontLayout>
    )
}

export default Home