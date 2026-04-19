import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    motion,
    AnimatePresence,
    useInView,
    useScroll,
    useTransform,
} from 'framer-motion'
import { ArrowRight, Calendar, Check } from 'lucide-react'
import { Link } from '@inertiajs/react'

type ReassuranceItem = {
    text: string
}

interface HeroMeta {
    hero_badge?: string
    hero_title_line1?: string
    hero_title_line2?: string
    hero_title_line3?: string
    hero_subtitle?: string
    hero_cta_text?: string
    hero_cta_url?: string
    hero_secondary_cta_text?: string
    hero_secondary_cta_url?: string
    hero_image?: string
    hero_images?: string[]
    hero_reassurance_items?: ReassuranceItem[]
    hero_floating_stat_enabled?: boolean
    hero_floating_stat_value?: string
    hero_floating_stat_label?: string
}

const defaultImages = ['/assets/images/portrait.jpg']

const Hero = ({ meta }: { meta?: HeroMeta }) => {
    const containerRef = useRef<HTMLElement>(null)
    const textRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLDivElement>(null)

    const isTextInView = useInView(textRef, { once: false, amount: 0.25 })
    const isImageInView = useInView(imageRef, { once: false, amount: 0.25 })

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start'],
    })

    const textY = useTransform(scrollYProgress, [0, 1], ['0%', '8%'])
    const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '5%'])

    const [currentIndex, setCurrentIndex] = useState(0)
    const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})

    const handleImageError = (index: number) => {
        setImageErrors((prev) => ({ ...prev, [index]: true }))
    }


    const badge = meta?.hero_badge ?? 'Coaching • Conseil • Accompagnement'
    const titleLine1 = meta?.hero_title_line1 ?? 'Transformez votre potentiel'
    const titleLine2 = meta?.hero_title_line2 ?? 'en résultats'
    const titleLine3 = meta?.hero_title_line3 ?? 'durables et concrets'

    const subtitle =
        meta?.hero_subtitle ??
        "J’accompagne les entrepreneurs, les dirigeants et les professionnels en évolution à clarifier leurs priorités, structurer leurs actions et avancer avec plus d’impact."

    const ctaText = meta?.hero_cta_text ?? 'Réserver un appel découverte'
    const ctaUrl = meta?.hero_cta_url ?? route('contact')

    const secondaryCtaText =
        meta?.hero_secondary_cta_text ?? 'Découvrir les accompagnements'
    const secondaryCtaUrl =
        meta?.hero_secondary_cta_url ?? route('formations')

    const reassuranceItems =
        meta?.hero_reassurance_items?.length
            ? meta.hero_reassurance_items
            : [
                { text: 'Sans engagement' },
                { text: '30 minutes' },
                { text: 'En visio ou en présentiel' },
            ]

    const showFloatingStat = meta?.hero_floating_stat_enabled !== false
    const floatingStatValue = meta?.hero_floating_stat_value ?? '97%'
    const floatingStatLabel = meta?.hero_floating_stat_label ?? 'Satisfaction'

    const images = useMemo(() => {
        const fromMetaArray =
            meta?.hero_images?.filter(
                (img) => typeof img === 'string' && img.trim() !== ''
            ) ?? []

        if (fromMetaArray.length > 0) return fromMetaArray

        if (meta?.hero_image?.trim()) {
            return [meta.hero_image]
        }

        return defaultImages
    }, [meta?.hero_images, meta?.hero_image])

    useEffect(() => {
        if (images.length <= 1) return

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length)
        }, 4000)

        return () => clearInterval(interval)
    }, [images.length])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.08,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    }

    const imageVariants = {
        hidden: { opacity: 0, scale: 0.96 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    }

    return (
        <section
            ref={containerRef}
            className="relative w-full overflow-hidden bg-gradient-to-b from-gray-50 to-white pt-24 pb-16 dark:from-gray-900 dark:to-gray-950 md:pt-28 md:pb-20"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(218,46,41,0.16),transparent_30%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_25%)]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* HERO */}
                <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
                    <motion.div
                        ref={textRef}
                        className="order-2 lg:order-1 lg:col-span-6"
                        initial="hidden"
                        animate={isTextInView ? 'visible' : 'hidden'}
                        variants={containerVariants}
                        style={{ y: textY }}
                    >
                        <motion.div variants={itemVariants}>
                            <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:backdrop-blur">
                                {badge}
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="mb-4 text-4xl font-bold leading-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl"
                        >
                            <span className="block">{titleLine1}</span>
                            <span className="mt-1 block">{titleLine2}</span>
                            <span className="mt-1 block text-[#DA2E29]">
                                {titleLine3}
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="mb-8 text-lg text-gray-700 dark:text-gray-300 md:text-xl"
                        >
                            {subtitle}
                        </motion.p>

                        <motion.div
                            variants={itemVariants}
                            className="mt-8 flex flex-col gap-4 sm:flex-row"
                        >
                            <Link href={ctaUrl}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="inline-flex min-w-[250px] items-center justify-center rounded-2xl bg-[#EF3B36] px-7 py-4 text-base font-semibold text-white shadow-lg shadow-[#EF3B36]/25 transition-colors hover:bg-[#db312d]"
                                >
                                    <Calendar className="mr-2 h-5 w-5" />
                                    <span>{ctaText}</span>
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </motion.button>
                            </Link>

                            <Link href={secondaryCtaUrl}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="inline-flex min-w-[250px] items-center justify-center rounded-2xl border border-white/10 bg-[#09152d] px-6 py-4 font-medium text-white transition-colors hover:bg-[#0d1b38]"
                                >
                                    <span>{secondaryCtaText}</span>
                                </motion.button>
                            </Link>
                        </motion.div>

                        <motion.div
                            variants={containerVariants}
                            className="mt-6 flex flex-wrap gap-x-6 gap-y-3"
                        >
                            {reassuranceItems.map((item, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300"
                                >
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/8">
                                        <Check className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <span>{item.text}</span>
                                </motion.div>
                            ))}
                        </motion.div>


                        {/** TRUSTPILOT + NOTE  a  configurer au dashboard*/}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={isTextInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="mt-6 flex flex-col gap-2 text-sm text-slate-300"
                        >
                            <span className="text-slate-400">
                                Plus de 1000 professionnels accompagnés
                            </span>

                            <div className="flex items-center gap-3">
                                <div className="flex text-yellow-400">★★★★★</div>
                                <span className="font-semibold text-white">
                                    4,9/5
                                </span>
                                <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-slate-300">
                                    Trustpilot
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        ref={imageRef}
                        className="order-1 lg:order-2 lg:col-span-6"
                        initial="hidden"
                        animate={isImageInView ? 'visible' : 'hidden'}
                        variants={imageVariants}
                        style={{ y: imageY }}
                    >
                        <div className="relative mx-auto max-w-[600px]">
                            <div className="absolute -inset-5 rounded-[32px] bg-[#EF3B36]/10 blur-3xl" />

                            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-sm">
                                <div className="relative h-[400px] overflow-hidden rounded-[24px] md:h-[520px]">
                                    <AnimatePresence mode="wait">
                                        <motion.img
                                            key={images[currentIndex]}
                                            src={imageErrors[currentIndex] ? defaultImages[0] : images[currentIndex]}
                                            alt="Coaching et accompagnement"
                                            className="absolute inset-0 h-full w-full object-cover"
                                            onError={() => handleImageError(currentIndex)}
                                            initial={{ opacity: 0, scale: 1.03 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.01 }}
                                            transition={{
                                                duration: 0.9,
                                                ease: 'easeInOut',
                                            }}
                                            loading={
                                                currentIndex === 0
                                                    ? 'eager'
                                                    : 'lazy'
                                            }
                                            decoding="async"
                                        />
                                    </AnimatePresence>

                                    <div className="absolute inset-0 bg-slate-950/35" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/60 to-transparent" />
                                </div>
                            </div>

                            {showFloatingStat && (
                                <motion.div
                                    initial={{ opacity: 0, x: 18 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.45, duration: 0.5 }}
                                    className="absolute top-5 right-5 rounded-2xl border border-white/10 bg-slate-950/80 px-5 py-4 shadow-xl backdrop-blur-md"
                                >
                                    <div className="text-3xl font-bold tracking-tight text-[#DA2E29]">
                                        {floatingStatValue}
                                    </div>
                                    <div className="text-sm font-medium text-slate-300">
                                        {floatingStatLabel}
                                    </div>
                                </motion.div>
                            )}

                            {images.length > 1 && (
                                <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-3 py-2 backdrop-blur-md">
                                    {images.map((_, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => setCurrentIndex(index)}
                                            className={`h-2.5 rounded-full transition-all duration-300 ${index === currentIndex
                                                ? 'w-6 bg-white'
                                                : 'w-2.5 bg-white/35 hover:bg-white/60'
                                                }`}
                                            aria-label={`Afficher l’image ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default Hero