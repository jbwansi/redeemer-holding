import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Calendar, Check } from 'lucide-react';
import { Link } from '@inertiajs/react';
import heroImage from '../../../../images/portrait.jpg?w=600&format=webp&quality=80';

type ReassuranceItem = {
  text: string;
};

interface HeroMeta {
  hero_badge?: string;
  hero_title_line1?: string;
  hero_title_line2?: string;
  hero_title_line3?: string;
  hero_subtitle?: string;
  hero_cta_text?: string;
  hero_cta_url?: string;
  hero_secondary_cta_text?: string;
  hero_secondary_cta_url?: string;
  hero_image?: string;
  hero_images?: string[];
  hero_reassurance_items?: ReassuranceItem[];
  hero_floating_stat_enabled?: boolean;
  hero_floating_stat_value?: string;
  hero_floating_stat_label?: string;
  hero_social_proof_text?: string;
  hero_social_rating?: string;
  hero_social_platform?: string;
}

const defaultImages = [heroImage];

const Hero = ({ meta }: { meta?: HeroMeta }) => {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const isTextInView = true;
  const isImageInView = true;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '5%']);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  const badge = meta?.hero_badge ?? 'Transformer par les valeurs';
  const titleLine1 = meta?.hero_title_line1 ?? 'Vous avez l’impression de tourner en rond ?';
  const titleLine2 = meta?.hero_title_line2 ?? '';
  const titleLine3 = meta?.hero_title_line3 ?? '';
  const subtitle = meta?.hero_subtitle ?? 'Retrouvez une direction claire et passez à l’action.';

  const ctaText = meta?.hero_cta_text ?? 'Clarifier ma situation';
  const ctaUrl = meta?.hero_cta_url ?? route('contact');
  const secondaryCtaText = meta?.hero_secondary_cta_text ?? 'Découvrir les accompagnements';
  const secondaryCtaUrl = meta?.hero_secondary_cta_url ?? route('trainings');

  const reassuranceItems = meta?.hero_reassurance_items?.length
    ? meta.hero_reassurance_items
    : [{ text: 'Sans engagement' }, { text: '30 minutes' }, { text: 'En visio ou en présentiel' }];

  const showFloatingStat = meta?.hero_floating_stat_enabled !== false;
  const floatingStatValue = meta?.hero_floating_stat_value ?? '97%';
  const floatingStatLabel = meta?.hero_floating_stat_label ?? 'Satisfaction';

  const heroSocialProofText =
    meta?.hero_social_proof_text ?? 'Des professionnels accompagnés avec méthode et bienveillance';
  const heroSocialRating = meta?.hero_social_rating ?? 'Retours très positifs';
  const heroSocialPlatform = meta?.hero_social_platform ?? 'Accompagnements appréciés';

  const images = useMemo(() => {
    const fromMetaArray =
      meta?.hero_images?.filter((img) => typeof img === 'string' && img.trim() !== '') ?? [];
    if (fromMetaArray.length > 0) return fromMetaArray;
    if (meta?.hero_image?.trim()) return [meta.hero_image];
    return defaultImages;
  }, [meta?.hero_images, meta?.hero_image]);

  useEffect(() => {
    if (images.length <= 1) return;

    let interval: ReturnType<typeof setInterval> | null = null;

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 5000);
    }, 2500);

    return () => {
      clearTimeout(timeout);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [images.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-gradient-to-b from-gray-50 to-white pb-10 pt-28 text-gray-900 dark:from-[#020817] dark:to-[#020817] dark:text-white md:pb-12 md:pt-24 lg:pb-14 lg:pt-28"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(218,46,41,0.14),transparent_32%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(30,64,175,0.06),transparent_30%)] dark:bg-[radial-gradient(circle_at_bottom_right,rgba(30,64,175,0.14),transparent_30%)]" />
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-white/20" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <svg
          aria-hidden="true"
          viewBox="0 0 240 560"
          fill="none"
          className="pointer-events-none absolute left-[43%] top-1/2 hidden h-[88%] w-48 -translate-y-1/2 text-[#DA2E29] opacity-65 lg:block"
        >
          <path
            d="M218 8C92 88 24 216 20 356c-2 78 18 143 58 196"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M238 30C116 112 55 236 54 366c0 68 17 126 51 174"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.55"
          />
        </svg>

        <div className="grid items-center gap-8 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)] md:gap-8 lg:gap-10">
          {/* ── LEFT: Text ── */}
          <motion.div
            ref={textRef}
            className="order-1 min-w-0"
            initial="hidden"
            animate={isTextInView ? 'visible' : 'hidden'}
            variants={containerVariants}
            style={{ y: textY }}
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-3">
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-gray-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                {badge}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="mb-4 max-w-[11ch] text-4xl font-black leading-[1.08] tracking-tight text-gray-900 dark:text-white md:text-5xl lg:max-w-[12ch] lg:text-5xl xl:text-6xl"
            >
              <span className="block">{titleLine1}</span>
              <span className="mt-1 block">{titleLine2}</span>
              <span className="mt-1 block text-[#DA2E29]">{titleLine3}</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mb-5 max-w-md text-base leading-6 text-gray-600 dark:text-slate-300 md:text-lg md:leading-7"
            >
              {subtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
            >
              {/* Primary CTA */}
              <Link href={ctaUrl}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#DA2E29] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#DA2E29]/25 transition-colors hover:bg-[#c62823] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
                >
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>{ctaText}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                </motion.button>
              </Link>

              {/* Secondary CTA — texte seul, visuellement discret */}
              <Link
                href={secondaryCtaUrl}
                className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#DA2E29]/70 bg-white px-5 py-3 text-sm font-bold text-gray-900 transition-colors hover:bg-[#DA2E29]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA2E29] dark:bg-slate-950/45 dark:text-white sm:w-auto"
              >
                <span>{secondaryCtaText}</span>
                <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            {/* Reassurance */}
            <motion.div
              variants={containerVariants}
              className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5"
            >
              {reassuranceItems.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-400"
                >
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#DA2E29]/10">
                    <Check className="h-2.5 w-2.5 text-[#DA2E29]" />
                  </div>
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isTextInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-gray-200 pt-3 dark:border-white/10"
            >
              <div
                className="flex text-sm tracking-[0.08em] text-yellow-400"
                aria-label="5 étoiles"
              >
                ★★★★★
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {heroSocialRating}
              </span>
              <span className="text-xs text-gray-600 dark:text-slate-400">
                {heroSocialProofText}
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-500">
                · {heroSocialPlatform}
              </span>
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Image ── */}
          <motion.div
            ref={imageRef}
            className="order-2 min-w-0"
            initial="hidden"
            animate={isImageInView ? 'visible' : 'hidden'}
            variants={imageVariants}
            style={{ y: imageY }}
          >
            <div className="relative mx-auto max-w-[680px]">
              <div className="absolute -inset-4 rounded-[2rem] bg-[#DA2E29]/10 blur-3xl" />

              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950 shadow-2xl">
                <div className="relative h-[340px] overflow-hidden md:h-[420px] lg:h-[450px]">
                  <motion.img
                    src={imageErrors[currentIndex] ? defaultImages[0] : images[currentIndex]}
                    alt="Coaching et accompagnement"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    onError={() => handleImageError(currentIndex)}
                    initial={false}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    loading={currentIndex === 0 ? 'eager' : 'lazy'}
                    fetchpriority={currentIndex === 0 ? 'high' : 'auto'}
                    decoding="async"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    width={600}
                    height={520}
                  />

                  <div className="absolute inset-0 bg-slate-950/10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#020817]/80 via-[#020817]/15 to-transparent md:from-[#020817]/65" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/5" />
                </div>
              </div>

              {/* Floating stat */}
              {showFloatingStat && (
                <motion.div
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45, duration: 0.5 }}
                  className="absolute bottom-5 right-5 flex h-28 w-28 flex-col items-center justify-center rounded-full border-2 border-[#DA2E29]/80 bg-[#020817]/90 px-3 text-center shadow-2xl shadow-black/40 backdrop-blur-md md:bottom-6 md:right-6 md:h-32 md:w-32"
                >
                  <div className="text-3xl font-black tracking-tight text-white md:text-4xl">
                    {floatingStatValue}
                  </div>
                  <div className="mt-1 text-[11px] font-semibold leading-tight text-slate-200 md:text-xs">
                    {floatingStatLabel}
                  </div>
                </motion.div>
              )}

              {/* Image dots */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-slate-950/65 px-3 py-2 backdrop-blur-md">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? 'w-5 bg-white'
                          : 'w-2 bg-white/35 hover:bg-white/60'
                      }`}
                      aria-label={`Afficher l'image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
